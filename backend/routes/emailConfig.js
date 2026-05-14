const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const SiteConfig = require('../models/SiteConfig');
const emailService = require('../utils/emailService');

const router = express.Router();

// 邮件配置键名前缀
const EMAIL_CONFIG_KEYS = {
  ENABLED: 'email_enabled',
  HOST: 'email_host',
  PORT: 'email_port',
  SECURE: 'email_secure',
  USER: 'email_user',
  PASS: 'email_pass',
  FROM: 'email_from',
  ADMIN_EMAIL: 'email_admin'
};

// 获取邮件配置
router.get('/', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const configs = await SiteConfig.findAll({
      where: {
        key: Object.values(EMAIL_CONFIG_KEYS)
      }
    });

    const configMap = {};
    configs.forEach(c => {
      configMap[c.key] = c.value;
    });

    res.json({
      enabled: configMap[EMAIL_CONFIG_KEYS.ENABLED] === 'true',
      host: configMap[EMAIL_CONFIG_KEYS.HOST] || '',
      port: parseInt(configMap[EMAIL_CONFIG_KEYS.PORT]) || 587,
      secure: configMap[EMAIL_CONFIG_KEYS.SECURE] === 'true',
      user: configMap[EMAIL_CONFIG_KEYS.USER] || '',
      // 密码不返回完整内容，只返回是否有设置
      hasPassword: !!configMap[EMAIL_CONFIG_KEYS.PASS],
      from: configMap[EMAIL_CONFIG_KEYS.FROM] || '',
      adminEmail: configMap[EMAIL_CONFIG_KEYS.ADMIN_EMAIL] || ''
    });
  } catch (error) {
    console.error('获取邮件配置失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新邮件配置
router.put('/', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { enabled, host, port, secure, user, pass, from, adminEmail } = req.body;

    const configs = [
      { key: EMAIL_CONFIG_KEYS.ENABLED, value: enabled ? 'true' : 'false' },
      { key: EMAIL_CONFIG_KEYS.HOST, value: host || '' },
      { key: EMAIL_CONFIG_KEYS.PORT, value: String(port || 587) },
      { key: EMAIL_CONFIG_KEYS.SECURE, value: secure ? 'true' : 'false' },
      { key: EMAIL_CONFIG_KEYS.USER, value: user || '' },
      { key: EMAIL_CONFIG_KEYS.FROM, value: from || '' },
      { key: EMAIL_CONFIG_KEYS.ADMIN_EMAIL, value: adminEmail || '' }
    ];

    // 只有提供了新密码才更新
    if (pass && pass.trim()) {
      configs.push({ key: EMAIL_CONFIG_KEYS.PASS, value: pass });
    }

    // 批量更新配置
    for (const config of configs) {
      await SiteConfig.upsert({
        key: config.key,
        value: config.value
      });
    }

    res.json({ message: '邮件配置保存成功' });
  } catch (error) {
    console.error('保存邮件配置失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 测试邮件发送
router.post('/test', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { testEmail } = req.body;
    
    if (!testEmail) {
      return res.status(400).json({ message: '请输入测试邮箱地址' });
    }

    // 重新初始化邮件服务以使用最新配置
    const configs = await SiteConfig.findAll({
      where: {
        key: Object.values(EMAIL_CONFIG_KEYS)
      }
    });

    const configMap = {};
    configs.forEach(c => {
      configMap[c.key] = c.value;
    });

    // 检查配置是否完整
    if (!configMap[EMAIL_CONFIG_KEYS.HOST] || !configMap[EMAIL_CONFIG_KEYS.USER]) {
      return res.status(400).json({ message: '邮件配置不完整，请先配置SMTP信息' });
    }

    // 创建临时邮件服务实例
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: configMap[EMAIL_CONFIG_KEYS.HOST],
      port: parseInt(configMap[EMAIL_CONFIG_KEYS.PORT]) || 587,
      secure: configMap[EMAIL_CONFIG_KEYS.SECURE] === 'true',
      auth: {
        user: configMap[EMAIL_CONFIG_KEYS.USER],
        pass: configMap[EMAIL_CONFIG_KEYS.PASS] || ''
      }
    });

    // 验证连接
    await transporter.verify();

    // 发送测试邮件
    const from = configMap[EMAIL_CONFIG_KEYS.FROM] || configMap[EMAIL_CONFIG_KEYS.USER];
    await transporter.sendMail({
      from,
      to: testEmail,
      subject: '邮件服务测试',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">✅ 邮件服务测试成功</h2>
          <p>这是一封测试邮件，用于验证您的邮件服务配置是否正确。</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>SMTP服务器：</strong>${configMap[EMAIL_CONFIG_KEYS.HOST]}</p>
            <p><strong>发件人：</strong>${from}</p>
            <p><strong>测试时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
          </div>
          <p style="color: #999; font-size: 14px;">如果您的网站收到新留言，将会通过此邮箱发送通知。</p>
        </div>
      `
    });

    res.json({ message: '测试邮件发送成功，请查收' });
  } catch (error) {
    console.error('测试邮件发送失败:', error);
    res.status(500).json({ 
      message: '测试邮件发送失败: ' + (error.message || '未知错误'),
      error: error.message 
    });
  }
});

// 清除邮件密码
router.delete('/password', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    await SiteConfig.destroy({
      where: { key: EMAIL_CONFIG_KEYS.PASS }
    });
    res.json({ message: '密码已清除' });
  } catch (error) {
    console.error('清除密码失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
