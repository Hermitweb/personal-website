const nodemailer = require('nodemailer');

/**
 * 邮件服务配置
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    };
    this.from = process.env.SMTP_FROM || process.env.SMTP_USER || '';
    this.enabled = !!(this.config.auth.user && this.config.auth.pass);
    
    if (this.enabled) {
      this.initTransporter();
    }
  }

  initTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: this.config.auth
    });
  }

  /**
   * 检查邮件服务是否可用
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * 发送邮件
   * @param {Object} options - 邮件选项
   * @param {string} options.to - 收件人
   * @param {string} options.subject - 主题
   * @param {string} options.text - 纯文本内容
   * @param {string} options.html - HTML内容
   * @returns {Promise<Object>} - 发送结果
   */
  async send({ to, subject, text, html }) {
    if (!this.enabled) {
      console.warn('邮件服务未配置，跳过发送');
      return { success: false, message: '邮件服务未配置' };
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        text,
        html
      });

      console.log('邮件发送成功:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('邮件发送失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 发送留言通知邮件
   * @param {Object} message - 留言对象
   * @param {string} adminEmail - 管理员邮箱
   */
  async sendNewMessageNotification(message, adminEmail) {
    // 转义用户输入防止XSS
    const escapeHtml = (str) => {
      if (!str) return str || '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    };

    const subject = `新留言通知：${escapeHtml(message.subject || '来自 ' + message.name)}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
          📬 新留言通知
        </h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>姓名：</strong>${escapeHtml(message.name)}</p>
          <p><strong>邮箱：</strong>${escapeHtml(message.email)}</p>
          <p><strong>主题：</strong>${escapeHtml(message.subject) || '无'}</p>
          <p><strong>时间：</strong>${new Date(message.createdAt).toLocaleString('zh-CN')}</p>
        </div>
        <div style="background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h3 style="color: #333;">留言内容：</h3>
          <p style="white-space: pre-wrap; color: #666;">${escapeHtml(message.message || message.content)}</p>
        </div>
        <div style="margin-top: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>此邮件由系统自动发送，请勿直接回复</p>
        </div>
      </div>
    `;

    return await this.send({
      to: adminEmail,
      subject,
      html,
      text: `新留言来自 ${message.name}\n邮箱: ${message.email || '未提供'}\n内容: ${message.message || message.content}`
    });
  }

  /**
   * 发送留言回复通知
   * @param {Object} message - 留言对象
   */
  async sendReplyNotification(message) {
    if (!message.email) {
      return { success: false, message: '留言未提供邮箱地址' };
    }

    const subject = `回复您的留言：${message.subject || '感谢您的留言'}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">感谢您的留言</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333;">您的留言：</h3>
          <p style="color: #666; white-space: pre-wrap;">${message.message || message.content}</p>
        </div>
        <div style="background: #667eea; color: white; padding: 20px; border-radius: 8px;">
          <h3 style="margin-top: 0;">回复：</h3>
          <p style="white-space: pre-wrap;">${message.reply}</p>
        </div>
        <div style="margin-top: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>此邮件由系统自动发送</p>
        </div>
      </div>
    `;

    return await this.send({
      to: message.email,
      subject,
      html,
      text: `您的留言已收到回复：\n\n${message.reply}`
    });
  }

  /**
   * 发送密码重置邮件
   * @param {string} email - 用户邮箱
   * @param {string} resetLink - 重置链接
   */
  async sendPasswordResetEmail(email, resetLink) {
    const subject = '密码重置请求';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">密码重置</h2>
        <p>您收到了密码重置请求。请点击下方链接重置密码：</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetLink}" 
             style="background: #667eea; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            重置密码
          </a>
        </div>
        <p style="color: #999; font-size: 14px;">
          此链接将在 1 小时后失效。如果您没有请求重置密码，请忽略此邮件。
        </p>
      </div>
    `;

    return await this.send({
      to: email,
      subject,
      html,
      text: `请点击以下链接重置密码：${resetLink}\n此链接将在 1 小时后失效。`
    });
  }

  /**
   * 发送验证码邮件（用于找回密码）
   * @param {string} email - 用户邮箱
   * @param {string} code - 6位验证码
   * @param {number} expiresInMinutes - 验证码有效时长（分钟）
   */
  async sendVerificationCodeEmail(email, code, expiresInMinutes = 10) {
    const subject = '找回密码 - 验证码';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">🔐 找回密码</h1>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            您正在找回密码，请使用以下验证码完成验证：
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0; border: 2px dashed #667eea;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">
              ${code}
            </span>
          </div>
          <p style="color: #666; font-size: 14px;">
            验证码有效期为 <strong>${expiresInMinutes} 分钟</strong>，请尽快使用。
          </p>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 13px; margin: 0;">
              如果您没有进行此操作，请忽略此邮件，您的账户安全不会受到影响。
            </p>
          </div>
        </div>
        <div style="margin-top: 20px; text-align: center; color: #bbb; font-size: 12px;">
          <p>此邮件由系统自动发送，请勿直接回复</p>
        </div>
      </div>
    `;

    return await this.send({
      to: email,
      subject,
      html,
      text: `您的找回密码验证码是：${code}\n有效期 ${expiresInMinutes} 分钟，请尽快使用。\n如果您没有进行此操作，请忽略此邮件。`
    });
  }

  /**
   * 验证邮箱配置
   */
  async verifyConnection() {
    if (!this.enabled) {
      return { success: false, message: '邮件服务未配置' };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: '邮件服务连接正常' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// 导出单例
const emailService = new EmailService();

module.exports = emailService;
