import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

const Container = styled.div`
  min-height: 100vh;
  padding-top: 80px;
  background: ${props => props.theme.bgPrimary};
  transition: background 0.3s ease;
`;

const Hero = styled.div`
  position: relative;
  height: 500px;
  background: ${props => props.coverImage ? `url(${props.coverImage}) center/cover` : 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)'};

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 0%, ${props => props.theme.bgPrimary} 100%);
  }
`;

const BackButton = styled(Link)`
  position: absolute;
  top: 100px;
  left: 5%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  z-index: 10;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 212, 255, 0.8);
    color: #000;
  }
`;

const Content = styled.article`
  max-width: 900px;
  margin: -150px auto 80px;
  padding: 0 20px;
  position: relative;
  z-index: 1;
`;

// ProjectCard - 包装组件模式
const ProjectCardStyled = styled.div`
  background: ${props => props.theme.cardBg};
  border-radius: 20px;
  padding: 50px;
  border: 1px solid ${props => props.theme.borderLight};
  box-shadow: 0 20px 60px ${props => props.theme.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'};
`;

const ProjectCard = (props) => (
  <motion.div
    initial={props.initial}
    animate={props.animate}
    transition={props.transition}
  >
    <ProjectCardStyled theme={props.theme}>{props.children}</ProjectCardStyled>
  </motion.div>
);

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${props => props.theme.textPrimary};
  line-height: 1.3;
  margin-bottom: 20px;
`;

const Description = styled.p`
  color: ${props => props.theme.textMuted};
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 30px;
`;

const Tags = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 30px;
`;

const Tag = styled.span`
  padding: 8px 16px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(0, 212, 255, 0.1)' : 'rgba(0, 102, 204, 0.1)'};
  color: ${props => props.theme.primary};
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
`;

const ActionButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;

  ${props => props.primary ? `
    background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
    color: #000;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
    }
  ` : `
    background: ${props.theme.cardBg};
    color: ${props.theme.textPrimary};
    border: 1px solid ${props.theme.border};

    &:hover {
      border-color: #00d4ff;
      background: rgba(0, 212, 255, 0.1);
    }
  `}
`;

const Section = styled.section`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  color: ${props => props.theme.textPrimary};
  font-size: 1.5rem;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid ${props => props.theme.border};
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 15px;
  color: ${props => props.theme.textSecondary};
  line-height: 1.6;

  &::before {
    content: '✓';
    color: #10b981;
    font-weight: bold;
    flex-shrink: 0;
  }
`;

const ProjectContent = styled.div`
  color: ${props => props.theme.textSecondary};
  font-size: 16px;
  line-height: 1.8;

  h1, h2, h3, h4, h5, h6 {
    color: ${props => props.theme.textPrimary};
    margin: 30px 0 15px;
  }

  p {
    margin-bottom: 20px;
  }

  img {
    max-width: 100%;
    border-radius: 10px;
    margin: 20px 0;
  }

  code {
    background: ${props => props.theme.border};
    padding: 2px 8px;
    border-radius: 4px;
    font-family: 'Fira Code', monospace;
  }
`;

const Gallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const GalleryImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 100px 20px;
  color: ${props => props.theme.textMuted};
`;

const ProjectDetail = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      // 从内容管理获取项目数据
      const response = await axios.get(`/api/contents/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('获取项目详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Loading>{t('common.loading')}</Loading>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container>
        <Loading>{t('common.error')}</Loading>
      </Container>
    );
  }

  const projectData = project.data || {};

  return (
    <Container>
      <Hero coverImage={projectData.coverImage}>
        <BackButton to="/#projects">← {t('projects.title')}</BackButton>
      </Hero>

      <Content>
        <ProjectCard
          theme={project.theme}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Title>{projectData.title || project.title}</Title>
          <Description>
            {projectData.description || project.content}
          </Description>

          {projectData.tags && projectData.tags.length > 0 && (
            <Tags>
              {projectData.tags.map((tag, i) => (
                <Tag key={i}>{tag}</Tag>
              ))}
            </Tags>
          )}

          <ActionButtons>
            {projectData.demoUrl && (
              <ActionButton primary href={projectData.demoUrl} target="_blank" rel="noopener noreferrer">
                🚀 {t('projects.viewDemo')}
              </ActionButton>
            )}
            {projectData.sourceUrl && (
              <ActionButton href={projectData.sourceUrl} target="_blank" rel="noopener noreferrer">
                💻 {t('projects.viewCode')}
              </ActionButton>
            )}
          </ActionButtons>

          {projectData.features && projectData.features.length > 0 && (
            <Section>
              <SectionTitle>功能特点</SectionTitle>
              <FeatureList>
                {projectData.features.map((feature, i) => (
                  <FeatureItem key={i}>{feature}</FeatureItem>
                ))}
              </FeatureList>
            </Section>
          )}

          {projectData.content && (
            <Section>
              <SectionTitle>项目详情</SectionTitle>
              <ProjectContent dangerouslySetInnerHTML={{ __html: projectData.content }} />
            </Section>
          )}

          {projectData.gallery && projectData.gallery.length > 0 && (
            <Section>
              <SectionTitle>项目截图</SectionTitle>
              <Gallery>
                {projectData.gallery.map((img, i) => (
                  <GalleryImage key={i} src={img} alt={`Screenshot ${i + 1}`} loading="lazy" />
                ))}
              </Gallery>
            </Section>
          )}
        </ProjectCard>
      </Content>
    </Container>
  );
};

export default ProjectDetail;
