import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const glowPulse = keyframes`
  0%, 100% { text-shadow: 0 0 10px rgba(102, 126, 234, 0.3), 0 0 20px rgba(118, 75, 162, 0.1); }
  50% { text-shadow: 0 0 20px rgba(102, 126, 234, 0.6), 0 0 40px rgba(118, 75, 162, 0.3), 0 0 60px rgba(102, 126, 234, 0.1); }
`;

const lineExpand = keyframes`
  0% { width: 0; opacity: 0; }
  50% { width: 80px; opacity: 1; }
  100% { width: 0; opacity: 0; }
`;

const TitleWrapper = styled.div`
  text-align: center;
  margin-bottom: 3.5rem;
  position: relative;
`;

// 使用普通 styled-components，动画通过 CSS 实现
const SubLabel = styled.span`
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #667eea;
  margin-bottom: 0.75rem;
`;

const TitleText = styled.h2`
  font-size: 2.8rem;
  font-weight: 700;
  background: linear-gradient(
    90deg,
    #667eea 0%,
    #764ba2 25%,
    #667eea 50%,
    #764ba2 75%,
    #667eea 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 4s linear infinite, ${glowPulse} 3s ease-in-out infinite;
  display: inline-block;
  position: relative;
`;

const DecorativeLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const Line = styled.span`
  height: 2px;
  width: 60px;
  background: linear-gradient(90deg, transparent, #667eea, transparent);
  border-radius: 2px;
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: ${glowPulse} 2s ease-in-out infinite;
`;

const AnimatedLine = styled.span`
  height: 2px;
  width: 60px;
  background: linear-gradient(90deg, transparent, #764ba2, transparent);
  border-radius: 2px;
  animation: ${lineExpand} 3s ease-in-out infinite;
`;

// 创建自定义 motion 组件，过滤掉 theme prop
const MotionDiv = motion.div;

const SectionTitle = ({ subtitle, children }) => {
  return (
    <TitleWrapper>
      <MotionDiv
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <SubLabel>{subtitle}</SubLabel>
      </MotionDiv>
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <TitleText>{children}</TitleText>
      </MotionDiv>
      <MotionDiv
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <DecorativeLine>
          <Line />
          <Dot />
          <AnimatedLine />
          <Dot />
          <Line />
        </DecorativeLine>
      </MotionDiv>
    </TitleWrapper>
  );
};

export default SectionTitle;
