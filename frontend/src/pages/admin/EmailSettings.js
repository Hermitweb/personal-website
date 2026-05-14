import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSave, FaEnvelopeOpen } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

// ============ 样式组件 ============

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #fff;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  color: #fff;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.5rem;
  margin-bottom: 0;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
  color: #000;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0, 212, 255, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
  opacity: 0.6;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

// ============ 邮件配置组件 ============

const EmailSettings = () => {
  const [config, setConfig] = useState({
    enabled: false,
    host: '',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    from: '',
    adminEmail: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get('/api/email-config');
      setConfig(prev => ({ ...prev, ...response.data }));
      setHasPassword(response.data.hasPassword);
    } catch (error) {
      console.error('获取邮件配置失败:', error);
      toast.error('获取邮件配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/api/email-config', config);
      toast.success('邮件配置保存成功');
      setHasPassword(true);
      setConfig(prev => ({ ...prev, pass: '' }));
    } catch (error) {
      toast.error('保存失败: ' + (error.response?.data?.message || '未知错误'));
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail) {
      toast.error('请输入测试邮箱地址');
      return;
    }
    setTesting(true);
    try {
      const response = await axios.post('/api/email-config/test', { testEmail });
      toast.success(response.data.message);
    } catch (error) {
      toast.error('测试失败: ' + (error.response?.data?.message || '未知错误'));
    } finally {
      setTesting(false);
    }
  };

  const handleClearPassword = async () => {
    if (!window.confirm('确定要清除已保存的密码吗？')) return;
    try {
      await axios.delete('/api/email-config/password');
      setHasPassword(false);
      toast.success('密码已清除');
    } catch (error) {
      toast.error('清除失败');
    }
  };

  if (loading) return <div style={{ color: '#fff' }}>加载中...</div>;

  return (
    <>
      <Header>
        <Title>邮件配置</Title>
      </Header>

      <Card>
        <SectionTitle>SMTP 服务器设置</SectionTitle>
        <Description>配置邮件服务器以启用留言通知、密码重置等功能。</Description>

        <FormGroup>
          <Label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              name="enabled"
              checked={config.enabled}
              onChange={handleChange}
              style={{ width: 'auto' }}
            />
            启用邮件服务
          </Label>
          <Description>开启后，系统将自动发送邮件通知</Description>
        </FormGroup>

        <FormGroup>
          <Label>SMTP 服务器地址</Label>
          <Input
            name="host"
            value={config.host}
            onChange={handleChange}
            placeholder="例如：smtp.gmail.com 或 smtp.qq.com"
            disabled={!config.enabled}
          />
          <Description>您的邮件服务商提供的 SMTP 服务器地址</Description>
        </FormGroup>

        <FormGroup>
          <Label>端口</Label>
          <Input
            name="port"
            type="number"
            value={config.port}
            onChange={handleChange}
            placeholder="587"
            disabled={!config.enabled}
          />
          <Description>常用端口：25、465（SSL）、587（TLS）</Description>
        </FormGroup>

        <FormGroup>
          <Label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              name="secure"
              checked={config.secure}
              onChange={handleChange}
              disabled={!config.enabled}
              style={{ width: 'auto' }}
            />
            使用 SSL/TLS 加密
          </Label>
          <Description>465端口通常需要开启，587端口通常不需要</Description>
        </FormGroup>

        <FormGroup>
          <Label>发件人邮箱</Label>
          <Input
            name="user"
            type="email"
            value={config.user}
            onChange={handleChange}
            placeholder="your-email@gmail.com"
            disabled={!config.enabled}
          />
          <Description>用于发送邮件的邮箱账号</Description>
        </FormGroup>

        <FormGroup>
          <Label>邮箱密码 / 授权码</Label>
          <div style={{ position: 'relative' }}>
            <Input
              name="pass"
              type={showPassword ? 'text' : 'password'}
              value={config.pass}
              onChange={handleChange}
              placeholder={hasPassword ? '••••••••（已设置，留空则不修改）' : '请输入密码或授权码'}
              disabled={!config.enabled}
              style={{ paddingRight: '6rem' }}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ right: hasPassword ? '5rem' : '0.75rem' }}
            >
              {showPassword ? '🙈' : '👁'}
            </PasswordToggle>
            {hasPassword && (
              <button
                type="button"
                onClick={handleClearPassword}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(231, 76, 60, 0.2)',
                  border: '1px solid #e74c3c',
                  color: '#e74c3c',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                清除
              </button>
            )}
          </div>
          <Description>建议使用应用专用授权码而非邮箱密码</Description>
        </FormGroup>

        <FormGroup>
          <Label>显示名称（可选）</Label>
          <Input
            name="from"
            value={config.from}
            onChange={handleChange}
            placeholder="网站通知 <your-email@gmail.com>"
            disabled={!config.enabled}
          />
          <Description>收件人看到的发件人名称，默认使用邮箱地址</Description>
        </FormGroup>

        <FormGroup>
          <Label>管理员通知邮箱</Label>
          <Input
            name="adminEmail"
            type="email"
            value={config.adminEmail}
            onChange={handleChange}
            placeholder="admin@example.com"
            disabled={!config.enabled}
          />
          <Description>用于接收新留言通知的邮箱地址</Description>
        </FormGroup>

        <ButtonGroup>
          <SaveButton onClick={handleSave} disabled={saving || !config.enabled}>
            <FaSave /> {saving ? '保存中...' : '保存配置'}
          </SaveButton>
        </ButtonGroup>
      </Card>

      <Card style={{ marginTop: '1.5rem' }}>
        <SectionTitle>发送测试</SectionTitle>
        <Description>保存配置后，可以发送测试邮件验证配置是否正确。</Description>

        <FormGroup>
          <Label>测试邮箱地址</Label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="输入接收测试邮件的邮箱"
              disabled={!config.enabled}
              style={{ flex: 1 }}
            />
            <button
              onClick={handleTest}
              disabled={testing || !config.enabled || !testEmail}
              style={{
                padding: '0.75rem 1.5rem',
                background: config.enabled ? 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)' : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontWeight: 600,
                cursor: config.enabled ? 'pointer' : 'not-allowed',
                opacity: config.enabled ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FaEnvelopeOpen />
              {testing ? '发送中...' : '发送测试邮件'}
            </button>
          </div>
        </FormGroup>

        <div style={{
          background: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          borderRadius: '8px',
          padding: '1rem',
          marginTop: '1rem',
          color: '#ffc107',
          fontSize: '0.9rem'
        }}>
          <strong>💡 常见邮箱配置参考：</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
            <li><strong>Gmail：</strong>smtp.gmail.com:587（需开启两步验证并使用应用密码）</li>
            <li><strong>QQ邮箱：</strong>smtp.qq.com:587（需开启SMTP并使用授权码）</li>
            <li><strong>163邮箱：</strong>smtp.163.com:25 或 465</li>
            <li><strong>Outlook：</strong>smtp.office365.com:587</li>
          </ul>
        </div>
      </Card>
    </>
  );
};

export default EmailSettings;
