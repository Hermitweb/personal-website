import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope, FaChevronDown, FaCode } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

// ============ 动画定义 ============
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
`;

const floatReverse = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(20px) rotate(-2deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.3); opacity: 1; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

// ============ 样式组件 ============
const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem;
  padding-top: 8rem;
  padding-bottom: 5rem;
`;

const DecorativeCircle = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$')
})`
  position: absolute;
  border-radius: 50%;
  background: ${props => props.$color || 'linear-gradient(135deg, #667eea15, #764ba215)'};
  filter: blur(80px);
  width: ${props => props.$size || '400px'};
  height: ${props => props.$size || '400px'};
  top: ${props => props.$top || 'auto'};
  bottom: ${props => props.$bottom || 'auto'};
  left: ${props => props.$left || 'auto'};
  right: ${props => props.$right || 'auto'};
  animation: ${props => props.$reverse ? floatReverse : float} ${props => props.$duration || '8s'} ease-in-out infinite;
  animation-delay: ${props => props.$delay || '0s'};
  z-index: 0;
`;

const DecorativeRing = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$')
})`
  position: absolute;
  width: ${props => props.$size || '300px'};
  height: ${props => props.$size || '300px'};
  border: 1px solid rgba(102, 126, 234, 0.08);
  border-radius: 50%;
  top: ${props => props.$top || '50%'};
  left: ${props => props.$left || '50%'};
  transform: translate(-50%, -50%);
  animation: ${rotate} ${props => props.$duration || '30s'} linear infinite;
  z-index: 0;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    inset: 15px;
    border: 1px solid rgba(118, 75, 162, 0.1);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 30px;
    border: 1px dashed rgba(102, 126, 234, 0.08);
    border-radius: 50%;
  }
`;

const FloatingParticle = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$')
})`
  position: absolute;
  width: ${props => props.$size || '4px'};
  height: ${props => props.$size || '4px'};
  background: ${props => props.$color || '#667eea'};
  border-radius: 50%;
  box-shadow: 0 0 10px ${props => props.$color || '#667eea'};
  animation: ${pulse} ${props => props.$duration || '4s'} ease-in-out infinite;
  animation-delay: ${props => props.$delay || '0s'};
  opacity: 0.6;
  z-index: 1;
`;

const HeroContent = styled.div`
  text-align: center;
  max-width: 900px;
  z-index: 10;
  position: relative;
`;

// AvatarContainer - 包装组件模式
const AvatarContainerStyled = styled.div`
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto 1rem;
`;

const AvatarContainer = (props) => (
  <motion.div
    initial={props.initial}
    animate={props.animate}
    transition={props.transition}
    style={props.style}
  >
    <AvatarContainerStyled>{props.children}</AvatarContainerStyled>
  </motion.div>
);

const AvatarGlow = styled.div`
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  background-size: 200% 200%;
  animation: ${gradientShift} 3s ease infinite;
  filter: blur(25px);
  opacity: 0.5;
`;

const AvatarBorder = styled.div`
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  animation: ${rotate} 8s linear infinite;
`;

const Avatar = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.bgTertiary}, ${props => props.theme.bgSecondary});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  position: relative;
  overflow: hidden;
  border: 4px solid ${props => props.theme.bgPrimary};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent 30%, rgba(102, 126, 234, 0.2) 50%, transparent 70%);
    animation: ${shimmer} 4s infinite;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// TagContainer - 包装组件模式
const TagContainerStyled = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
`;

const TagContainer = (props) => (
  <motion.div
    initial={props.initial}
    animate={props.animate}
    transition={props.transition}
  >
    <TagContainerStyled>{props.children}</TagContainerStyled>
  </motion.div>
);

const Tag = styled.span`
  padding: 0.4rem 1rem;
  background: rgba(102, 126, 234, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 20px;
  color: #667eea;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
  }
`;

// Title - 包装组件模式
const TitleStyled = styled.h1`
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 4s linear infinite;
  letter-spacing: -0.02em;
`;

const Title = (props) => (
  <motion.div
    initial={props.initial}
    animate={props.animate}
    transition={props.transition}
  >
    <TitleStyled>{props.children}</TitleStyled>
  </motion.div>
);

// Subtitle - 包装组件模式
const SubtitleStyled = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.4rem);
  color: ${props => props.theme.textPrimary};
  margin-bottom: 0.75rem;
  font-weight: 300;
`;

const Subtitle = (props) => (
  <motion.div
    initial={props.initial}
    animate={props.animate}
    transition={props.transition}
  >
    <SubtitleStyled>{props.children}</SubtitleStyled>
  </motion.div>
);

// Description - 包装组件模式
const DescriptionStyled = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.textMuted};
  max-width: 600px;
  margin: 0 auto 1.25rem;
  line-height: 1.6;
`;

const Description = (props) => (
  <motion.div
    initial={props.initial}
    animate={props.animate}
    transition={props.transition}
  >
    <DescriptionStyled>{props.children}</DescriptionStyled>
  </motion.div>
);

// SocialLinks - 包装组件模式
const SocialLinksStyled = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const SocialLinks = (props) => (
  <motion.div
    initial={props.initial}
    animate={props.animate}
    transition={props.transition}
  >
    <SocialLinksStyled>{props.children}</SocialLinksStyled>
  </motion.div>
);

const SocialLink = styled.a`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.theme.cardBg};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.borderLight};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.textSecondary};
  font-size: 1.2rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-color: transparent;
    color: white;
    transform: translateY(-8px) scale(1.1);
    box-shadow: 0 15px 30px rgba(102, 126, 234, 0.3);
  }
`;

// CTAContainer - 包装组件模式
const CTAContainerStyled = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
`;

const CTAContainer = (props) => (
  <motion.div
    initial={props.initial}
    animate={props.animate}
    transition={props.transition}
  >
    <CTAContainerStyled>{props.children}</CTAContainerStyled>
  </motion.div>
);

const PrimaryButton = styled.a`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: ${props => props.theme.textPrimary};
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  }
`;

const SecondaryButton = styled.a`
  padding: 1rem 2rem;
  background: transparent;
  color: ${props => props.theme.textPrimary};
  border: 1px solid ${props => props.theme.borderStrong};
  border-radius: 50px;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.cardBgHover};
    border-color: rgba(102, 126, 234, 0.5);
    transform: translateY(-3px);
  }
`;

// ScrollIndicator - 包装组件模式
const ScrollIndicatorStyled = styled.div`
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.textFaint};
  cursor: pointer;
  transition: color 0.3s ease;
  z-index: 20;

  &:hover {
    color: #667eea;
  }
`;

const ScrollIndicator = (props) => (
  <motion.div
    initial={props.initial}
    animate={props.animate}
    transition={props.transition}
    onClick={props.onClick}
  >
    <ScrollIndicatorStyled>{props.children}</ScrollIndicatorStyled>
  </motion.div>
);

const ScrollText = styled.span`
  font-size: 0.75rem;
  letter-spacing: 2px;
  text-transform: uppercase;
`;

// 默认数据
const defaultHeroData = {
  title: '欢迎来到我的世界',
  subtitle: '全栈开发者 · 设计师 · 创造者',
  description: '热爱技术，追求创新，致力于创造优秀的数字体验。\n在这里，你可以了解我的技能、项目和联系方式。',
  tags: ['🎨 全栈开发', '🚀 性能优化', '✨ UI/UX设计', '💡 创新思维'],
  avatar: null,
  socialLinks: {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    email: 'mailto:email@example.com'
  },
  buttons: {
    primary: { text: '查看项目', link: '#projects' },
    secondary: { text: '联系我', link: '#contact' }
  }
};

const Hero = ({ heroData }) => {
  const { theme } = useTheme();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 解析后台数据或使用默认数据
  let parsedData = defaultHeroData;
  if (heroData) {
    try {
      // 如果 content 是 JSON 字符串，解析它
      if (heroData.content && typeof heroData.content === 'string') {
        const contentData = JSON.parse(heroData.content);
        parsedData = {
          ...defaultHeroData,
          title: contentData.title || defaultHeroData.title,
          subtitle: contentData.subtitle || defaultHeroData.subtitle,
          description: contentData.description || defaultHeroData.description,
          tags: contentData.tags || defaultHeroData.tags,
          avatar: contentData.avatar || defaultHeroData.avatar,
          socialLinks: contentData.socialLinks || defaultHeroData.socialLinks,
          buttons: contentData.buttons || defaultHeroData.buttons
        };
      } else {
        // 兼容旧数据格式
        parsedData = {
          ...defaultHeroData,
          title: heroData.title || defaultHeroData.title,
          subtitle: heroData.content?.split('\n')[0] || defaultHeroData.subtitle,
          description: heroData.content?.split('\n').slice(1).join('\n') || defaultHeroData.description,
          avatar: heroData.imageUrl,
          ...heroData.metadata
        };
      }
    } catch (e) {
      console.error('解析 Hero 数据失败:', e);
      parsedData = defaultHeroData;
    }
  }
  
  const data = parsedData;

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleScrollClick = () => {
    document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <HeroSection id="home">
      {/* 装饰元素 */}
      <DecorativeCircle $size="500px" $color="linear-gradient(135deg, #667eea10, #764ba210)" $top="10%" $left="-15%" $duration="10s" />
      <DecorativeCircle $size="400px" $color="linear-gradient(135deg, #764ba210, #667eea10)" $bottom="15%" $right="-15%" $duration="12s" $delay="2s" $reverse />
      <DecorativeCircle $size="300px" $color="linear-gradient(135deg, #9b59b610, #8e44ad10)" $top="60%" $left="-10%" $duration="14s" $delay="1s" />

      <DecorativeRing $size="700px" $duration="40s" $top="45%" />
      <DecorativeRing $size="550px" $duration="30s" $top="45%" style={{ animationDirection: 'reverse' }} />

      {/* 漂浮粒子 */}
      <FloatingParticle $size="3px" $color="#667eea" $top="20%" $left="15%" $duration="3s" $delay="0s" />
      <FloatingParticle $size="4px" $color="#764ba2" $top="30%" $right="20%" $duration="4s" $delay="1s" />
      <FloatingParticle $size="3px" $color="#667eea" $bottom="30%" $left="25%" $duration="3.5s" $delay="0.5s" />
      <FloatingParticle $size="5px" $color="#764ba2" $bottom="40%" $right="15%" $duration="4.5s" $delay="1.5s" />
      <FloatingParticle $size="3px" $color="#667eea" $top="70%" $left="10%" $duration="3s" $delay="2s" />
      <FloatingParticle $size="4px" $color="#764ba2" $top="15%" $right="25%" $duration="4s" $delay="0.8s" />
      <FloatingParticle $size="3px" $color="#667eea" $bottom="20%" $right="30%" $duration="3.5s" $delay="1.2s" />
      <FloatingParticle $size="4px" $color="#764ba2" $top="50%" $left="5%" $duration="4s" $delay="0.3s" />

      <HeroContent>
        {/* 头像 */}
        <AvatarContainer
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            transform: `translate(${mousePos.x * 0.01}px, ${mousePos.y * 0.01}px)`
          }}
        >
          <AvatarGlow />
          <AvatarBorder />
          <Avatar>
            {data.avatar ? (
              <img src={data.avatar} alt="avatar" loading="lazy" />
            ) : (
              <FaCode style={{ color: '#667eea' }} />
            )}
          </Avatar>
        </AvatarContainer>

        {/* 标签 */}
        <TagContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {data.tags?.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </TagContainer>

        {/* 标题 */}
        <Title
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {data.title}
        </Title>

        {/* 副标题 */}
        <Subtitle
          theme={theme}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {data.subtitle}
        </Subtitle>

        {/* 描述 */}
        <Description
          theme={theme}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {data.description}
        </Description>

        {/* 社交链接 */}
        <SocialLinks
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <SocialLink href={data.socialLinks?.github} target="_blank" title="GitHub">
            <FaGithub />
          </SocialLink>
          <SocialLink href={data.socialLinks?.linkedin} target="_blank" title="LinkedIn">
            <FaLinkedin />
          </SocialLink>
          <SocialLink href={data.socialLinks?.email} title="Email">
            <FaEnvelope />
          </SocialLink>
        </SocialLinks>

        {/* CTA按钮 */}
        <CTAContainer
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <PrimaryButton href={data.buttons?.primary?.link}>
            {data.buttons?.primary?.text}
          </PrimaryButton>
          <SecondaryButton href={data.buttons?.secondary?.link}>
            {data.buttons?.secondary?.text}
          </SecondaryButton>
        </CTAContainer>
      </HeroContent>

      {/* 滚动指示器 */}
      <ScrollIndicator
        theme={theme}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={handleScrollClick}
      >
        <ScrollText>滚动探索</ScrollText>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <FaChevronDown size={20} />
        </motion.div>
      </ScrollIndicator>
    </HeroSection>
  );
};

export default Hero;
