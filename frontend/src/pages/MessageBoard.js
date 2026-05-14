import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import SectionTitle from '../components/SectionTitle';
import Navbar from '../components/Navbar';

const Container = styled.div`
  min-height: 100vh;
  padding: 120px 5% 80px;
  background: ${props => props.theme.bgPrimary};
  transition: background 0.3s ease;
`;

const Content = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

// MessageForm - 包装组件模式
const MessageFormStyled = styled.form`
  background: ${props => props.theme.cardBg};
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 40px;
  border: 1px solid ${props => props.theme.borderLight};
`;

const MessageForm = (props) => (
  <motion.div
    initial={props.initial}
    animate={props.animate}
    transition={props.transition}
  >
    <MessageFormStyled theme={props.theme} onSubmit={props.onSubmit}>
      {props.children}
    </MessageFormStyled>
  </motion.div>
);

const FormTitle = styled.h3`
  color: ${props => props.theme.textPrimary};
  margin-bottom: 20px;
  font-size: 1.2rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 18px;
  border-radius: 10px;
  border: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.inputBg};
  color: ${props => props.theme.textPrimary};
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #00d4ff;
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme.textMuted};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 14px 18px;
  border-radius: 10px;
  border: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.inputBg};
  color: ${props => props.theme.textPrimary};
  font-size: 15px;
  outline: none;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;

  &:focus {
    border-color: #00d4ff;
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme.textMuted};
  }
`;

const SubmitButton = styled.button`
  padding: 14px 30px;
  background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
  color: #000;
  border: none;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

// MessageCard - 包装组件模式
const MessageCardStyled = styled.div`
  background: ${props => props.theme.cardBg};
  border-radius: 12px;
  padding: 25px;
  border: 1px solid ${props => props.theme.borderLight};
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(0, 212, 255, 0.3);
  }
`;

const MessageCard = (props) => (
  <motion.div
    initial={props.initial}
    animate={props.animate}
    transition={props.transition}
  >
    <MessageCardStyled theme={props.theme}>{props.children}</MessageCardStyled>
  </motion.div>
);

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-weight: 600;
  font-size: 18px;
`;

const AuthorName = styled.span`
  color: ${props => props.theme.textPrimary};
  font-weight: 600;
`;

const MessageTime = styled.span`
  color: ${props => props.theme.textMuted};
  font-size: 13px;
`;

const MessageContent = styled.p`
  color: ${props => props.theme.textSecondary};
  line-height: 1.7;
  margin: 0;
`;

const NoData = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${props => props.theme.textMuted};
`;

// SuccessMessage - 包装组件模式
const SuccessMessageStyled = styled.div`
  padding: 15px 20px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 10px;
  color: #10b981;
  margin-bottom: 20px;
  text-align: center;
`;

const SuccessMessage = (props) => (
  <motion.div
    initial={props.initial}
    animate={props.animate}
    transition={props.transition}
  >
    <SuccessMessageStyled>{props.children}</SuccessMessageStyled>
  </motion.div>
);

// ErrorMessage - 包装组件模式
const ErrorMessageStyled = styled.div`
  padding: 15px 20px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  color: #ef4444;
  margin-bottom: 20px;
  text-align: center;
`;

const ErrorMessage = (props) => (
  <motion.div
    initial={props.initial}
    animate={props.animate}
    transition={props.transition}
  >
    <ErrorMessageStyled>{props.children}</ErrorMessageStyled>
  </motion.div>
);

const MessageBoard = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    content: ''
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/api/messages?public=true');
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('获取留言失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.content) {
      setError('请填写姓名和留言内容');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await axios.post('/api/messages', {
        name: formData.name,
        email: formData.email,
        content: formData.content,
        isPublic: true
      });
      setSuccess(true);
      setFormData({ name: '', email: '', content: '' });
      fetchMessages();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('提交留言失败:', error);
      const errorMsg = error.response?.data?.errors?.join(', ')
        || error.response?.data?.message
        || '提交失败，请稍后重试';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <>
      <Navbar />
      <Container>
        <Content>
          <SectionTitle
            title={t('messages.title')}
            subtitle={t('messages.subtitle')}
          />

        <MessageForm
          theme={theme}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FormTitle>{t('messages.leaveMessage')}</FormTitle>

          {error && (
            <ErrorMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ✗ {error}
            </ErrorMessage>
          )}

          {success && (
            <SuccessMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ✓ {t('common.success')}
            </SuccessMessage>
          )}

          <FormRow>
            <Input
              type="text"
              placeholder={t('messages.name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              type="email"
              placeholder={t('home.contact.email')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </FormRow>

          <TextArea
            placeholder={t('messages.content')}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
          />

          <SubmitButton type="submit" disabled={submitting}>
            {submitting ? t('common.loading') : t('messages.submit')}
          </SubmitButton>
        </MessageForm>

        {loading ? (
          <NoData>{t('common.loading')}</NoData>
        ) : messages.length === 0 ? (
          <NoData>{t('messages.noMessages')}</NoData>
        ) : (
          <MessageList>
            {messages.map((msg, index) => (
              <MessageCard
                key={msg.id}
                theme={theme}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MessageHeader>
                  <AuthorInfo>
                    <Avatar>{getInitial(msg.name)}</Avatar>
                    <AuthorName>{msg.name}</AuthorName>
                  </AuthorInfo>
                  <MessageTime>{formatDate(msg.createdAt)}</MessageTime>
                </MessageHeader>
                <MessageContent>{msg.content}</MessageContent>
              </MessageCard>
            ))}
          </MessageList>
        )}
        </Content>
      </Container>
    </>
  );
};

export default MessageBoard;
