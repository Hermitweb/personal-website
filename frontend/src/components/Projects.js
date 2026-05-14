import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt, FaGithub, FaShoppingCart } from 'react-icons/fa';
import SectionTitle from './SectionTitle';
import HomePagination from './HomePagination';

const ProjectsSection = styled.section`
  padding: 6rem 2rem;
  position: relative;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const ProjectsGrid = styled.div`
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

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const ProjectCardStyled = styled.div`
  background: ${props => props.theme.cardBg || '#0a0a0f'};
  backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  min-height: 280px;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(102, 126, 234, 0.6);
    box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
  }
`;

const ProjectCard = (props) => (
  <motion.div
    initial={props.initial}
    whileInView={props.whileInView}
    viewport={props.viewport}
    transition={props.transition}
  >
    <ProjectCardStyled>{props.children}</ProjectCardStyled>
  </motion.div>
);

// 顶部区域：图标 + 项目名称
const ProjectHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
`;

const ProjectIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const ProjectName = styled.span`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// 内容区域
const ProjectContent = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ProjectTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #ffffff;
  line-height: 1.3;
`;

const ProjectDescription = styled.p`
  color: #888888;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

// 底部链接区域
const ProjectFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const ProjectLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #888888;
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.3s ease;
  cursor: pointer;

  &:hover {
    color: #ffffff;
  }
`;

const defaultProjects = [
  {
    title: '电商平台',
    description: '一个功能完善的在线购物平台，支持商品管理、购物车、订单系统等功能',
    tags: ['React', 'Node.js', 'MongoDB', 'Redis'],
    image: null,
    demoUrl: '#',
    githubUrl: '#'
  },
  {
    title: '任务管理系统',
    description: '团队协作任务管理工具，支持看板视图、甘特图、实时协作等功能',
    tags: ['Vue.js', 'Express', 'PostgreSQL', 'Socket.io'],
    image: null,
    demoUrl: '#',
    githubUrl: '#'
  },
  {
    title: '数据可视化平台',
    description: '企业级数据分析与可视化平台，支持多种图表类型和实时数据更新',
    tags: ['React', 'D3.js', 'Python', 'FastAPI'],
    image: null,
    demoUrl: '#',
    githubUrl: '#'
  }
];

const Projects = ({ projectsData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // 3列 × 3行

  const projects = (projectsData && projectsData.length > 0) ? projectsData.map(item => ({
    title: item.title || '',
    description: item.content || item.description || '',
    tags: item.tags || (item.metadata?.tags) || [],
    image: item.imageUrl || item.image || null,
    demoUrl: item.linkUrl || item.demoUrl || '#',
    githubUrl: item.metadata?.githubUrl || item.githubUrl || '#'
  })) : defaultProjects;

  const totalPages = Math.ceil(projects.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const pageProjects = projects.slice(startIdx, startIdx + pageSize);

  return (
    <ProjectsSection id="projects">
      <Container>
        <SectionTitle subtitle="My Work">项目作品</SectionTitle>

        <ProjectsGrid>
          {pageProjects.map((project, index) => (
            <ProjectCard
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* 顶部区域：图标 + 项目名称 */}
              <ProjectHeader>
                <ProjectIcon>
                  <FaShoppingCart style={{ color: '#fff', fontSize: '1rem' }} />
                </ProjectIcon>
                <ProjectName>{project.title || '未命名项目'}</ProjectName>
              </ProjectHeader>

              {/* 内容区域 */}
              <ProjectContent>
                <ProjectTitle>{project.title || '未命名项目'}</ProjectTitle>
                <ProjectDescription>
                  {project.description || '暂无项目描述'}
                </ProjectDescription>
              </ProjectContent>

              {/* 底部链接区域 */}
              <ProjectFooter>
                {project.demoUrl !== '#' ? (
                  <ProjectLink href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    <FaExternalLinkAlt style={{ fontSize: '0.8rem' }} />
                    <span>演示</span>
                  </ProjectLink>
                ) : (
                  <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.9rem' }}>无链接</span>
                )}
                {project.githubUrl !== '#' && (
                  <ProjectLink href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <FaGithub style={{ fontSize: '0.9rem' }} />
                    <span>源码</span>
                  </ProjectLink>
                )}
              </ProjectFooter>
            </ProjectCard>
          ))}
        </ProjectsGrid>

        <HomePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Container>
    </ProjectsSection>
  );
};

export default Projects;
