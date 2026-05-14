import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaChevronDown, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import SectionTitle from './SectionTitle';

const ContactSection = styled.section`
  padding: 6rem 2rem;
  position: relative;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const ContactCardStyled = styled.div`
  background: ${props => props.theme.cardBg};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.border};
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    border-color: rgba(102, 126, 234, 0.5);
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.2);
  }
`;

const ContactCard = (props) => (
  <motion.div
    initial={props.initial}
    whileInView={props.whileInView}
    viewport={props.viewport}
    transition={props.transition}
  >
    <ContactCardStyled>{props.children}</ContactCardStyled>
  </motion.div>
);

const ContactIcon = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  margin: 0 auto 1.5rem;
  animation: ${pulse} 3s ease-in-out infinite;
`;

const ContactTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: ${props => props.theme.textPrimary};
`;

const ContactText = styled.p`
  color: ${props => props.theme.textSecondary};
  line-height: 1.6;
`;

// 折叠表单样式
const FormToggleStyled = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 1.2rem 2rem;
  background: ${props => props.theme.cardBg};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.border};
  border-radius: 16px;
  color: ${props => props.theme.textPrimary};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    border-color: rgba(102, 126, 234, 0.4);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.15);
  }
`;

const FormToggle = (props) => (
  <motion.div
    onClick={props.onClick}
    whileHover={props.whileHover}
    whileTap={props.whileTap}
    style={{ width: '100%', maxWidth: '600px', margin: '0 auto', display: 'block' }}
  >
    <FormToggleStyled>{props.children}</FormToggleStyled>
  </motion.div>
);

const ChevronIconStyled = styled.span`
  display: inline-flex;
  transition: transform 0.3s ease;
`;

const ChevronIcon = (props) => (
  <motion.span
    animate={props.animate}
    transition={props.transition}
    style={{ display: 'inline-flex' }}
  >
    <ChevronIconStyled>{props.children}</ChevronIconStyled>
  </motion.span>
);

const ContactFormWrapperStyled = styled.div`
  max-width: 600px;
  margin: 1.5rem auto 0;
  overflow: hidden;
`;

const ContactFormWrapper = (props) => (
  <motion.div
    initial={props.initial}
    animate={props.animate}
    exit={props.exit}
    transition={props.transition}
    style={{ maxWidth: '600px', margin: '1.5rem auto 0', overflow: 'hidden' }}
  >
    <ContactFormWrapperStyled>{props.children}</ContactFormWrapperStyled>
  </motion.div>
);

const ContactForm = styled.form`
  background: ${props => props.theme.cardBg};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.border};
  border-radius: 20px;
  padding: 2.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${props => props.theme.textPrimary};
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  background: ${props => props.theme.inputBg};
  border: 1px solid ${props => props.theme.border};
  border-radius: 10px;
  color: ${props => props.theme.textPrimary};
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }

  &::placeholder {
    color: ${props => props.theme.textFaint};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem 1rem;
  background: ${props => props.theme.inputBg};
  border: 1px solid ${props => props.theme.border};
  border-radius: 10px;
  color: ${props => props.theme.textPrimary};
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  transition: all 0.3s ease;
  font-family: inherit;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }

  &::placeholder {
    color: ${props => props.theme.textFaint};
  }
`;

const SubmitButtonStyled = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
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
  <motion.div
    whileHover={props.whileHover}
    whileTap={props.whileTap}
    style={{ width: '100%' }}
  >
    <SubmitButtonStyled type={props.type} onClick={props.onClick} disabled={props.disabled}>{props.children}</SubmitButtonStyled>
  </motion.div>
);

const defaultContactInfo = [
  {
    icon: <FaEnvelope />,
    title: '邮箱',
    text: 'email@example.com'
  },
  {
    icon: <FaPhone />,
    title: '电话',
    text: '+86 123 4567 8901'
  },
  {
    icon: <FaMapMarkerAlt />,
    title: '地址',
    text: '北京市朝阳区某街道123号'
  },
  {
    icon: <FaClock />,
    title: '时间',
    text: '周一至周五 9:00-18:00'
  }
];

const Contact = ({ contactData }) => {
  const contactInfo = contactData || defaultContactInfo;
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 前端验证
    if (formData.name.length < 2) {
      toast.error('姓名至少2个字符');
      return;
    }
    if (formData.message.length < 10) {
      toast.error('留言内容至少10个字符');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/api/messages', formData);
      toast.success('留言提交成功！我们会尽快回复您。');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setFormOpen(false);
    } catch (error) {
      const errorMsg = error.response?.data?.errors?.[0]?.msg
        || error.response?.data?.message
        || '提交失败，请稍后重试';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ContactSection id="contact">
      <Container>
        <SectionTitle subtitle="Get In Touch">联系我</SectionTitle>

        <ContactGrid>
          {contactInfo.map((item, index) => (
            <ContactCard
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ContactIcon style={{ animationDelay: `${index * 0.5}s` }}>
                {item.icon}
              </ContactIcon>
              <ContactTitle>{item.title}</ContactTitle>
              <ContactText>{item.text}</ContactText>
            </ContactCard>
          ))}
        </ContactGrid>

        {/* 折叠/展开按钮 */}
        <FormToggle
          onClick={() => setFormOpen(!formOpen)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <FaPaperPlane />
          {formOpen ? '收起留言表单' : '给我留言'}
          <ChevronIcon
            animate={{ rotate: formOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <FaChevronDown />
          </ChevronIcon>
        </FormToggle>

        {/* 可折叠表单 */}
        <AnimatePresence>
          {formOpen && (
            <ContactFormWrapper
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <ContactForm onSubmit={handleSubmit}>
                <FormGroup>
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="请输入您的姓名"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="请输入您的邮箱"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="subject">主题</Label>
                  <Input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="请输入消息主题"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="message">留言</Label>
                  <TextArea
                    id="message"
                    name="message"
                    placeholder="请输入您的留言内容..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>

                <SubmitButton
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={submitting}
                >
                  <FaPaperPlane /> {submitting ? '提交中...' : '发送消息'}
                </SubmitButton>
              </ContactForm>
            </ContactFormWrapper>
          )}
        </AnimatePresence>
      </Container>
    </ContactSection>
  );
};

export default Contact;
