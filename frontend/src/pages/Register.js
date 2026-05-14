import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaKey, FaSync } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import ParticleBackground from '../components/ParticleBackground';

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
`;

const RegisterCard = (props) => (
  <motion.div
    initial={props.initial}
    animate={props.animate}
    transition={props.transition}
    style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '30px',
      padding: '3rem',
      width: '100%',
      maxWidth: '450px',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
    }}
  >
    {props.children}
  </motion.div>
);

const Title = styled.h1`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-size: 1.1rem;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const CaptchaGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const CaptchaInput = styled(Input)`
  flex: 1;
  padding-left: 1rem;
`;

const CaptchaImage = styled.img`
  height: 46px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-size: 1.2rem;

  &:hover {
    color: #667eea;
  }
`;

const SubmitButton = (props) => (
  <motion.button
    type={props.type}
    disabled={props.disabled}
    onClick={props.onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    style={{
      width: '100%',
      padding: '1rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '15px',
      fontSize: '1.1rem',
      fontWeight: 600,
      cursor: props.disabled ? 'not-allowed' : 'pointer',
      opacity: props.disabled ? 0.6 : 1,
      transition: 'all 0.3s ease'
    }}
  >
    {props.children}
  </motion.button>
);

const PasswordHint = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.5rem;
  padding-left: 0.5rem;
`;

const PasswordRequirement = styled.span`
  color: ${props => props.met ? '#2ecc71' : '#e74c3c'};
  margin-right: 0.5rem;
  
  &::before {
    content: '${props => props.met ? '✓' : '✗'}';
    margin-right: 0.25rem;
  }
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: rgba(255, 255, 255, 0.6);

  a {
    color: #667eea;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const BackLink = styled(Link)`
  position: absolute;
  top: 2rem;
  left: 2rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: #667eea;
  }
`;

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    captchaId: '',
    captchaText: '',
    inviteCode: ''
  });
  const [captchaImage, setCaptchaImage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registerSettings, setRegisterSettings] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegisterSettings();
    fetchCaptcha();
  }, []);

  const fetchRegisterSettings = async () => {
    try {
      const response = await axios.get('/api/auth/register-settings');
      setRegisterSettings(response.data);
    } catch (error) {
      console.error('获取注册设置失败', error);
    }
  };

  const fetchCaptcha = async () => {
    try {
      const response = await axios.get('/api/auth/captcha');
      setCaptchaImage(response.data.captchaImage);
      setFormData(prev => ({ ...prev, captchaId: response.data.captchaId }));
    } catch (error) {
      console.error('获取验证码失败', error);
    }
  };

  const checkPasswordStrength = (password) => {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-={}[\]:;'"|\\,.<>/?]/.test(password);
    return { hasLower, hasUpper, hasNumber, hasSpecial };
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    // 基础验证
    if (formData.password.length < 8) {
      toast.error('密码长度至少为8位');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        captchaId: formData.captchaId,
        captchaText: formData.captchaText
      };

      // 如果需要邀请码
      if (registerSettings?.register_require_invite === 'true') {
        payload.inviteCode = formData.inviteCode;
      }

      await axios.post('/api/auth/register', payload);
      
      toast.success('注册成功！请登录');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || '注册失败';
      toast.error(message);
      
      // 如果是验证码错误，刷新验证码
      if (message.includes('验证码')) {
        fetchCaptcha();
        setFormData(prev => ({ ...prev, captchaText: '' }));
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = checkPasswordStrength(formData.password);
  const requireCaptcha = registerSettings?.register_require_captcha === 'true';
  const requireInvite = registerSettings?.register_require_invite === 'true';

  return (
    <RegisterContainer>
      <ParticleBackground />
      <BackLink to="/">← 返回首页</BackLink>
      
      <RegisterCard
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>创建账户</Title>
        <Subtitle>注册新账户</Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon><FaUser /></InputIcon>
            <Input
              type="text"
              name="username"
              placeholder="用户名（3-20位字母、数字、下划线、中文）"
              value={formData.username}
              onChange={handleChange}
              required
              maxLength={20}
            />
          </InputGroup>
          
          <InputGroup>
            <InputIcon><FaEnvelope /></InputIcon>
            <Input
              type="email"
              name="email"
              placeholder="邮箱地址"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </InputGroup>
          
          <div>
            <InputGroup>
              <InputIcon><FaLock /></InputIcon>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="密码（8-20位，含大小写字母、数字、特殊符号）"
                value={formData.password}
                onChange={handleChange}
                required
                maxLength={20}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggle>
            </InputGroup>
            {formData.password && (
              <PasswordHint>
                密码要求：
                <PasswordRequirement met={passwordStrength.hasLower}>小写字母</PasswordRequirement>
                <PasswordRequirement met={passwordStrength.hasUpper}>大写字母</PasswordRequirement>
                <PasswordRequirement met={passwordStrength.hasNumber}>数字</PasswordRequirement>
                <PasswordRequirement met={passwordStrength.hasSpecial}>特殊符号</PasswordRequirement>
              </PasswordHint>
            )}
          </div>
          
          <InputGroup>
            <InputIcon><FaLock /></InputIcon>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="确认密码"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
          </InputGroup>

          {requireInvite && (
            <InputGroup>
              <InputIcon><FaKey /></InputIcon>
              <Input
                type="text"
                name="inviteCode"
                placeholder="邀请码"
                value={formData.inviteCode}
                onChange={handleChange}
                required
              />
            </InputGroup>
          )}
          
          {requireCaptcha && (
            <CaptchaGroup>
              <CaptchaInput
                type="text"
                name="captchaText"
                placeholder="验证码"
                value={formData.captchaText}
                onChange={handleChange}
                required
                maxLength={6}
              />
              <CaptchaImage 
                src={captchaImage} 
                alt="验证码" 
                onClick={fetchCaptcha}
                title="点击刷新验证码"
              />
              <RefreshButton type="button" onClick={fetchCaptcha}>
                <FaSync />
              </RefreshButton>
            </CaptchaGroup>
          )}
          
          <SubmitButton
            type="submit"
            disabled={loading}
          >
            {loading ? '注册中...' : '注册'}
          </SubmitButton>
        </Form>
        
        <LoginLink>
          已有账户？ <Link to="/login">立即登录</Link>
        </LoginLink>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;
