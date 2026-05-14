const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User, SiteConfig } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const emailService = require('../utils/emailService');
const verificationCodeStore = require('../utils/verificationCodeStore');

const router = express.Router();

// 敏感词列表
const SENSITIVE_WORDS = [
  'admin', 'administrator', 'root', 'system', 'test', 'guest',
  'super', 'superuser', 'moderator', 'webmaster', 'master',
  'owner', 'support', 'help', 'service', 'info', 'information',
  'null', 'undefined', 'none', 'default', 'backup'
];

// 弱密码列表
const WEAK_PASSWORDS = [
  '123456', 'password', '12345678', 'qwerty', 'abc123', 'monkey',
  '1234567', 'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou',
  'master', 'sunshine', 'ashley', 'bailey', 'passw0rd', 'shadow',
  '123123', '654321', 'qwertyuiop', '1234567890', '123456789',
  'password1', 'password123', 'welcome', 'welcome1', 'admin123',
  '111111', '000000', '1234', 'abcd', 'aaaaaa', 'qqqqqq'
];

// 密码复杂度验证
const validatePasswordComplexity = (password) => {
  const errors = [];
  
  if (!/[a-z]/.test(password)) {
    errors.push('密码必须包含小写字母');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('密码必须包含大写字母');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('密码必须包含数字');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('密码必须包含特殊符号');
  }
  
  return errors;
};

// IP 注册频率记录（内存存储，生产环境建议使用 Redis）
const ipRegistrationRecords = new Map();

// 定期清理过期数据（每10分钟清理一次）
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of ipRegistrationRecords.entries()) {
    if (value.expires && value.expires < now) {
      ipRegistrationRecords.delete(key);
    }
  }
  for (const [key, value] of captchaStore.entries()) {
    if (value.expires && value.expires < now) {
      captchaStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

// 获取注册设置
router.get('/register-settings', async (req, res) => {
  try {
    const settings = await SiteConfig.findAll({
      where: {
        key: [
          'register_enabled',
          'register_require_email',
          'register_default_group_id',
          'register_require_invite',
          'register_min_username_length',
          'register_min_password_length',
          'register_require_captcha',
          'register_ip_limit_count',
          'register_ip_limit_minutes'
        ]
      }
    });
    
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    
    res.json(settingsObj);
  } catch (error) {
    console.error('获取注册设置失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取验证码
router.get('/captcha', async (req, res) => {
  try {
    // 生成随机验证码
    const captchaText = Math.random().toString(36).substring(2, 8).toUpperCase();
    const captchaId = Math.random().toString(36).substring(2, 15);
    
    // 存储验证码（5分钟有效期）
    captchaStore.set(captchaId, {
      text: captchaText,
      expires: Date.now() + 5 * 60 * 1000
    });
    
    // 生成 SVG 验证码图片
    const svgCaptcha = generateCaptchaSVG(captchaText);
    
    res.json({
      captchaId,
      captchaImage: `data:image/svg+xml;base64,${Buffer.from(svgCaptcha).toString('base64')}`
    });
  } catch (error) {
    console.error('生成验证码失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 验证码存储（内存）
const captchaStore = new Map();

// 生成简单 SVG 验证码
const generateCaptchaSVG = (text) => {
  const width = 120;
  const height = 40;
  const chars = text.split('');
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;
  
  // 背景
  svg += `<rect fill="#f5f5f5" width="${width}" height="${height}"/>`;
  
  // 干扰线
  for (let i = 0; i < 3; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ddd" stroke-width="1"/>`;
  }
  
  // 文字
  chars.forEach((char, i) => {
    const x = 20 + i * 18;
    const y = 25 + Math.random() * 10;
    const rotate = (Math.random() - 0.5) * 30;
    const fontSize = 24 + Math.random() * 6;
    svg += `<text x="${x}" y="${y}" font-size="${fontSize}" fill="#333" transform="rotate(${rotate} ${x} ${y})">${char}</text>`;
  });
  
  // 噪点
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    svg += `<circle cx="${x}" cy="${y}" r="1" fill="#aaa"/>`;
  }
  
  svg += '</svg>';
  return svg;
};

// 注册
router.post('/register', [
  body('username').trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度为3-20个字符'),
  body('email').isEmail().withMessage('请输入有效的邮箱'),
  body('password')
    .isLength({ min: 8, max: 20 })
    .withMessage('密码长度为8-20个字符')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, inviteCode, captchaId, captchaText } = req.body;
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

  try {
    // 获取注册设置
    const registerEnabled = await SiteConfig.findOne({ where: { key: 'register_enabled' } });
    if (registerEnabled && registerEnabled.value === 'false') {
      return res.status(403).json({ message: '注册已关闭' });
    }

    // 检查IP频率限制
    const ipLimitCount = await SiteConfig.findOne({ where: { key: 'register_ip_limit_count' } });
    const ipLimitMinutes = await SiteConfig.findOne({ where: { key: 'register_ip_limit_minutes' } });
    const limitCount = parseInt(ipLimitCount?.value || '5');
    const limitMinutes = parseInt(ipLimitMinutes?.value || '60');
    
    const ipRecord = ipRegistrationRecords.get(clientIp);
    const now = Date.now();
    if (ipRecord) {
      // 清理过期记录
      const recentRegistrations = ipRecord.filter(time => now - time < limitMinutes * 60 * 1000);
      if (recentRegistrations.length >= limitCount) {
        return res.status(429).json({ 
          message: `注册过于频繁，请${limitMinutes}分钟后再试`,
          retryAfter: limitMinutes * 60
        });
      }
      ipRegistrationRecords.set(clientIp, [...recentRegistrations, now]);
    } else {
      ipRegistrationRecords.set(clientIp, [now]);
    }

    // 检查验证码
    const requireCaptcha = await SiteConfig.findOne({ where: { key: 'register_require_captcha' } });
    if (requireCaptcha && requireCaptcha.value === 'true') {
      if (!captchaId || !captchaText) {
        return res.status(400).json({ message: '请完成验证码' });
      }
      const storedCaptcha = captchaStore.get(captchaId);
      if (!storedCaptcha) {
        return res.status(400).json({ message: '验证码已过期，请刷新' });
      }
      if (Date.now() > storedCaptcha.expires) {
        captchaStore.delete(captchaId);
        return res.status(400).json({ message: '验证码已过期，请刷新' });
      }
      if (storedCaptcha.text.toLowerCase() !== captchaText.toLowerCase()) {
        captchaStore.delete(captchaId);
        return res.status(400).json({ message: '验证码错误' });
      }
      captchaStore.delete(captchaId);
    }

    // 检查邀请码
    const requireInvite = await SiteConfig.findOne({ where: { key: 'register_require_invite' } });
    if (requireInvite && requireInvite.value === 'true') {
      if (!inviteCode) {
        return res.status(400).json({ message: '需要邀请码才能注册' });
      }
      const validInvite = await SiteConfig.findOne({ where: { key: 'invite_code_' + inviteCode } });
      if (!validInvite) {
        return res.status(400).json({ message: '无效的邀请码' });
      }
      // 标记邀请码已使用
      const usedCount = parseInt(validInvite.description || '0') + 1;
      await validInvite.update({ description: usedCount.toString() });
    }

    // 验证用户名格式（只允许字母、数字、下划线、中文）
    const usernameRegex = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ message: '用户名只能包含字母、数字、下划线和中文' });
    }

    // 检查敏感词
    const lowerUsername = username.toLowerCase();
    for (const word of SENSITIVE_WORDS) {
      if (lowerUsername.includes(word)) {
        return res.status(400).json({ message: '该用户名不可用，请换一个' });
      }
    }

    // 检查弱密码
    const lowerPassword = password.toLowerCase();
    for (const weakPwd of WEAK_PASSWORDS) {
      if (lowerPassword === weakPwd || lowerPassword.includes(weakPwd.substring(0, 4))) {
        return res.status(400).json({ message: '密码过于简单，请使用更复杂的密码' });
      }
    }

    // 检查密码复杂度
    const complexityErrors = validatePasswordComplexity(password);
    if (complexityErrors.length > 0) {
      return res.status(400).json({ message: complexityErrors[0] });
    }

    // 检查密码是否与用户名相同
    if (lowerPassword === lowerUsername || password.includes(username)) {
      return res.status(400).json({ message: '密码不能与用户名相同' });
    }

    // 检查邮箱唯一性
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: '邮箱已被注册' });
    }

    // 检查用户名唯一性
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ message: '用户名已被使用' });
    }

    // 获取默认用户组
    const defaultGroupConfig = await SiteConfig.findOne({ where: { key: 'register_default_group_id' } });
    const groupId = defaultGroupConfig && defaultGroupConfig.value ? parseInt(defaultGroupConfig.value) : null;

    // 创建用户
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      groupId
    });

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        groupId: user.groupId
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 登录
router.post('/login', [
  body('email').isEmail().withMessage('请输入有效的邮箱'),
  body('password').exists().withMessage('请输入密码')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: '账户已被禁用' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取当前用户信息
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'username', 'email', 'role', 'createdAt']
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 验证码存储服务（Redis 优先，内存回退）
// const resetCodes = new Map(); // 已替换为 verificationCodeStore

// 发送找回密码验证码
router.post('/forgot-password', [
  body('email').isEmail().withMessage('请输入有效的邮箱地址')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: '该邮箱未注册' });
    }

    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // 存储验证码（10分钟有效，Redis 自动过期）
    await verificationCodeStore.set(email, {
      code,
      expires: expiresAt,
      attempts: 0
    }, 600);

    // 发送验证码邮件
    if (emailService.isEnabled()) {
      const result = await emailService.sendVerificationCodeEmail(email, code, 10);
      if (!result.success) {
        console.error('验证码邮件发送失败:', result.error || result.message);
        // 邮件发送失败时回退到控制台输出
        console.log(`[找回密码-回退] 邮箱: ${email}, 验证码: ${code}`);
      }
    } else {
      // 邮件服务未配置，输出到控制台
      console.log(`[找回密码] 邮箱: ${email}, 验证码: ${code}`);
      console.log(`[提示] 请在 .env 中配置 SMTP 邮件服务以启用邮件发送`);
      console.log(`[提示] 当前验证码存储: ${verificationCodeStore.getStorageType()}`);
    }

    res.json({ message: '验证码已发送', email: email.replace(/(.{2}).*(@.*)/, '$1***$2') });
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 重置密码
router.post('/reset-password', [
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('验证码必须为6位数字'),
  body('newPassword').isLength({ min: 6 }).withMessage('新密码至少6个字符')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, code, newPassword } = req.body;

    // 验证验证码
    const resetData = await verificationCodeStore.get(email);
    if (!resetData) {
      return res.status(400).json({ message: '验证码已过期，请重新获取' });
    }

    if (new Date(resetData.expires).getTime() < Date.now()) {
      await verificationCodeStore.delete(email);
      return res.status(400).json({ message: '验证码已过期，请重新获取' });
    }

    if (resetData.code !== code) {
      // 更新尝试次数
      const newAttempts = (resetData.attempts || 0) + 1;
      if (newAttempts >= 5) {
        await verificationCodeStore.delete(email);
        return res.status(400).json({ message: '验证失败次数过多，请重新获取验证码' });
      }
      await verificationCodeStore.update(email, { attempts: newAttempts });
      return res.status(400).json({ message: '验证码错误' });
    }

    // 查找用户
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 更新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    // 清除验证码
    await verificationCodeStore.delete(email);

    res.json({ message: '密码重置成功' });
  } catch (error) {
    console.error('重置密码失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
