import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { FaCode, FaPalette, FaServer, FaMobile } from 'react-icons/fa';
import SectionTitle from './SectionTitle';
import HomePagination from './HomePagination';

const SkillsSection = styled.section`
  padding: 6rem 2rem;
  position: relative;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const SkillCardStyled = styled.div`
  background: ${props => props.theme.cardBg};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.border};
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  height: 100%;
  min-height: 280px;
  display: flex;
  flex-direction: column;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
    background-size: 200% auto;
    animation: ${float} 3s ease-in-out infinite;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-10px);
    border-color: rgba(102, 126, 234, 0.5);
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.2);

    &::before {
      opacity: 1;
    }
  }
`;

const SkillCard = (props) => (
  <motion.div
    initial={props.initial}
    whileInView={props.whileInView}
    viewport={props.viewport}
    transition={props.transition}
  >
    <SkillCardStyled>{props.children}</SkillCardStyled>
  </motion.div>
);

const SkillIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  margin-bottom: 1.5rem;
  animation: ${float} 4s ease-in-out infinite;
`;

const SkillTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: ${props => props.theme.textPrimary};
`;

const SkillDescription = styled.p`
  color: ${props => props.theme.textSecondary};
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex: 1;
`;

const SkillTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SkillTag = styled.span`
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.3);
    transform: translateY(-2px);
  }
`;

const defaultSkills = [
  {
    icon: <FaCode />,
    title: '前端开发',
    description: '构建现代化、响应式的用户界面，注重用户体验和交互设计',
    tags: ['React', 'Vue', 'TypeScript', 'Tailwind CSS']
  },
  {
    icon: <FaServer />,
    title: '后端开发',
    description: '设计和实现高性能的服务端应用，确保系统稳定性和可扩展性',
    tags: ['Node.js', 'Python', 'MySQL', 'MongoDB']
  },
  {
    icon: <FaPalette />,
    title: 'UI/UX设计',
    description: '创造美观且易用的界面设计，提升产品的视觉体验',
    tags: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator']
  },
  {
    icon: <FaMobile />,
    title: '移动开发',
    description: '开发跨平台移动应用，覆盖iOS和Android用户群体',
    tags: ['React Native', 'Flutter', 'iOS', 'Android']
  }
];

const Skills = ({ skillsData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // 3列 × 3行

  const skills = (skillsData && skillsData.length > 0) ? skillsData.map(item => ({
    icon: item.icon || <FaCode />,
    title: item.title || '',
    description: item.content || item.description || '',
    tags: item.tags || (item.metadata?.tags) || []
  })) : defaultSkills;

  const totalPages = Math.ceil(skills.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const pageSkills = skills.slice(startIdx, startIdx + pageSize);

  return (
    <SkillsSection id="skills">
      <Container>
        <SectionTitle subtitle="What I Do">技能专长</SectionTitle>

        <SkillsGrid>
          {pageSkills.map((skill, index) => (
            <SkillCard
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <SkillIcon style={{ animationDelay: `${index * 0.5}s` }}>
                {skill.icon}
              </SkillIcon>
              <SkillTitle>{skill.title}</SkillTitle>
              <SkillDescription>{skill.description}</SkillDescription>
              <SkillTags>
                {skill.tags.map((tag, tagIndex) => (
                  <SkillTag key={tagIndex}>{tag}</SkillTag>
                ))}
              </SkillTags>
            </SkillCard>
          ))}
        </SkillsGrid>

        <HomePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Container>
    </SkillsSection>
  );
};

export default Skills;
