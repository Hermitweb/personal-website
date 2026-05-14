import React from 'react';
import styled from 'styled-components';
import { FaGithub, FaLinkedin, FaEnvelope, FaHeart } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

const FooterSection = styled.footer`
  background: ${props => props.theme.footerBg};
  padding: 3rem 2rem;
  border-top: 1px solid ${props => props.theme.border};
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const SocialLink = styled.a`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: ${props => props.theme.cardBg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.textPrimary};
  font-size: 1.1rem;
  border: 1px solid ${props => props.theme.borderStrong};
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: transparent;
    transform: translateY(-5px);
    color: #fff;
  }
`;

const Copyright = styled.p`
  color: ${props => props.theme.textSecondary};
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const MadeWith = styled.p`
  color: ${props => props.theme.textMuted};
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const HeartIcon = styled.span`
  color: #e74c3c;
  display: inline-flex;
`;

const Footer = () => {
  const { theme } = useTheme();

  return (
    <FooterSection>
      <Container>
        <SocialLinks>
          <SocialLink href="https://github.com" target="_blank">
            <FaGithub />
          </SocialLink>
          <SocialLink href="https://linkedin.com" target="_blank">
            <FaLinkedin />
          </SocialLink>
          <SocialLink href="mailto:email@example.com">
            <FaEnvelope />
          </SocialLink>
        </SocialLinks>

        <Copyright>
          © {new Date().getFullYear()} MyPortfolio. All rights reserved.
        </Copyright>

        <MadeWith>
          Made with <HeartIcon><FaHeart /></HeartIcon> using React
        </MadeWith>
      </Container>
    </FooterSection>
  );
};

export default Footer;
