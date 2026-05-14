import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaKey } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ParticleBackground from '../components/ParticleBackground';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
`;

// LoginCard - 包装组件模式
const LoginCardStyled = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
`;

const LoginCard = (props) => (
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

// SubmitButton - 包装组件模式
const SubmitButtonStyled = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 15px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

const RegisterLink = styled.div`
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

const ForgotPasswordLink = styled.div`
  text-align: center;
  margin-top: 1rem;

  button {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.9rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    transition: color 0.3s ease;

    &:hover {
      color: #667eea;
    }
  }
`;

const ForgotPasswordModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ForgotPasswordCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const BackButton = styled.button`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s ease;

  &:hover {
    color: #667eea;
  }
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 1rem;
  text-align: center;
  width: 100%;
  transition: color 0.3s ease;

  &:hover {
    color: #764ba2;
  }

  &:disabled {
    color: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;
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

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // 找回密码状态
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: 输入邮箱, 2: 输入验证码, 3: 输入新密码
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      toast.success('登录成功！');

      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  // 发送验证码
  const handleSendCode = async () => {
    if (!resetEmail) {
      toast.error('请输入邮箱地址');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      toast.error('请输入有效的邮箱地址');
      return;
    }

    setResetLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email: resetEmail });
      toast.success('验证码已发送到您的邮箱');
      setResetStep(2);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || '发送验证码失败');
    } finally {
      setResetLoading(false);
    }
  };

  // 验证验证码
  const handleVerifyCode = () => {
    if (!resetCode || resetCode.length !== 6) {
      toast.error('请输入6位验证码');
      return;
    }
    setResetStep(3);
  };

  // 重置密码
  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      toast.error('密码至少6位');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    setResetLoading(true);
    try {
      await axios.post('/api/auth/reset-password', {
        email: resetEmail,
        code: resetCode,
        newPassword
      });
      toast.success('密码重置成功，请使用新密码登录');
      setShowForgotPassword(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || '重置密码失败');
    } finally {
      setResetLoading(false);
    }
  };

  // 重置表单
  const resetForm = () => {
    setResetStep(1);
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setCountdown(0);
  };

  return (
    <LoginContainer>
      <ParticleBackground />
      <BackLink to="/">← 返回首页</BackLink>
      
      <LoginCard
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>欢迎回来</Title>
        <Subtitle>登录您的账户</Subtitle>
        
        <Form onSubmit={handleSubmit}>
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
          
          <InputGroup>
            <InputIcon><FaLock /></InputIcon>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="密码"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
          </InputGroup>
          
          <SubmitButton
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? '登录中...' : '登录'}
          </SubmitButton>
        </Form>
        
        <RegisterLink>
          还没有账户？ <Link to="/register">立即注册</Link>
        </RegisterLink>

        <ForgotPasswordLink>
          <button onClick={() => setShowForgotPassword(true)}>
            <FaKey /> 忘记密码？
          </button>
        </ForgotPasswordLink>
      </LoginCard>

      {/* 找回密码弹窗 */}
      {showForgotPassword && (
        <ForgotPasswordModal>
          <ForgotPasswordCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <BackButton onClick={() => { setShowForgotPassword(false); resetForm(); }}>
              <FaArrowLeft /> 返回登录
            </BackButton>

            <Title>找回密码</Title>
            <Subtitle>
              {resetStep === 1 && '输入您的注册邮箱，我们将发送验证码'}
              {resetStep === 2 && '输入邮箱收到的6位验证码'}
              {resetStep === 3 && '设置您的新密码'}
            </Subtitle>

            {resetStep === 1 && (
              <Form onSubmit={(e) => { e.preventDefault(); handleSendCode(); }}>
                <InputGroup>
                  <InputIcon><FaEnvelope /></InputIcon>
                  <Input
                    type="email"
                    placeholder="请输入注册邮箱"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </InputGroup>
                <SubmitButton type="submit" disabled={resetLoading}>
                  {resetLoading ? '发送中...' : '发送验证码'}
                </SubmitButton>
              </Form>
            )}

            {resetStep === 2 && (
              <Form onSubmit={(e) => { e.preventDefault(); handleVerifyCode(); }}>
                <InputGroup>
                  <InputIcon><FaKey /></InputIcon>
                  <Input
                    type="text"
                    placeholder="请输入6位验证码"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.2rem' }}
                  />
                </InputGroup>
                <ResendButton type="button" onClick={handleSendCode} disabled={countdown > 0 || resetLoading}>
                  {countdown > 0 ? `${countdown}秒后可重新发送` : '重新发送验证码'}
                </ResendButton>
                <SubmitButton type="submit">
                  下一步
                </SubmitButton>
              </Form>
            )}

            {resetStep === 3 && (
              <Form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}>
                <InputGroup>
                  <InputIcon><FaLock /></InputIcon>
                  <Input
                    type="password"
                    placeholder="请输入新密码（至少6位）"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </InputGroup>
                <InputGroup>
                  <InputIcon><FaLock /></InputIcon>
                  <Input
                    type="password"
                    placeholder="请再次输入新密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </InputGroup>
                <SubmitButton type="submit" disabled={resetLoading}>
                  {resetLoading ? '重置中...' : '重置密码'}
                </SubmitButton>
              </Form>
            )}
          </ForgotPasswordCard>
        </ForgotPasswordModal>
      )}
    </LoginContainer>
  );
};

export default Login;
