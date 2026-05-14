import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { FaCode, FaProjectDiagram, FaBookmark, FaLayerGroup, FaList, FaFileAlt, FaExternalLinkAlt, FaGithub } from 'react-icons/fa';
import SectionTitle from './SectionTitle';
import HomePagination from './HomePagination';
import { useTheme } from '../contexts/ThemeContext';
import DOMPurify from 'dompurify';

// ============ 共享样式 ============

const SectionWrapper = styled.section`
  padding: 6rem 2rem;
  position: relative;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

// ============ 列表模式样式 ============

const ListGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.$columns || 3}, 1fr);
  gap: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ListCardStyled = styled.div`
  background: ${props => props.theme.cardBg};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.border};
  border-radius: 20px;
  padding: ${props => props.$imageOnly ? '0' : '1.5rem'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  height: 100%;
  min-height: ${props => props.$imageOnly ? '200px' : '280px'};
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

const ListCard = (props) => (
  <motion.div
    initial={props.initial}
    whileInView={props.whileInView}
    viewport={props.viewport}
    transition={props.transition}
    onClick={props.onClick}
  >
    <ListCardStyled theme={props.theme} $clickable={props.$clickable}>{props.children}</ListCardStyled>
  </motion.div>
);

const CardIcon = styled.div`
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

const CardImage = styled.img`
  width: 100%;
  height: ${props => {
    if (props.$imageOnly) return '100%';
    if (props.$hasTitle && props.$hasContent) return '50%';
    if (props.$hasTitle) return '75%';
    return '180px';
  }};
  min-height: ${props => {
    if (props.$imageOnly) return '280px';
    if (props.$hasTitle && props.$hasContent) return '140px';
    if (props.$hasTitle) return '210px';
    return '180px';
  }};
  max-height: ${props => {
    if (props.$imageOnly) return '100%';
    if (props.$hasTitle && props.$hasContent) return '140px';
    if (props.$hasTitle) return '210px';
    return '180px';
  }};
  object-fit: ${props => props.$imageOnly ? 'contain' : 'cover'};
  object-position: ${props => {
    if (props.$imageOnly) return 'center';
    if (props.$customPosition === 'custom' && props.$customPositionValue) {
      // 转换为 CSS object-position 格式: center [value]%
      const value = props.$customPositionValue;
      const numValue = typeof value === 'string' ? parseInt(value) : value;
      if (!isNaN(numValue)) {
        return `center ${numValue}%`;
      }
    }
    switch (props.$customPosition) {
      case 'top': return 'center top';
      case 'bottom': return 'center bottom';
      default: return 'center center';
    }
  }};
  border-radius: ${props => props.$imageOnly ? '20px' : '12px'};
  margin-bottom: ${props => props.$imageOnly ? '0' : '1rem'};
  background: ${props => props.theme.border};
  flex: ${props => props.$imageOnly ? '1' : '0 0 auto'};
`;

const CardTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: ${props => props.theme.textPrimary};
`;

const CardDescription = styled.p`
  color: ${props => props.theme.textSecondary};
  line-height: 1.6;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
`;

const CardTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const CardTag = styled.span`
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

const CardLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const CardLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.primary};
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    color: #00d4ff;
  }
`;

// ============ 单一内容模式样式 ============

const SingleContentWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const SingleContentCard = styled(motion.div)`
  background: ${props => props.theme.cardBg};
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 60px ${props => props.theme.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'};
`;

const SingleTitle = styled.h1`
  font-size: 2.2rem;
  color: ${props => props.theme.textPrimary};
  line-height: 1.3;
  margin-bottom: 1.5rem;
`;

const SingleMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.border};
`;

const SingleMetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.textMuted};
  font-size: 0.9rem;
`;

const SingleBody = styled.div`
  color: ${props => props.theme.textSecondary};
  font-size: 1rem;
  line-height: 1.8;

  h1, h2, h3, h4, h5, h6 {
    color: ${props => props.theme.textPrimary};
    margin: 1.5rem 0 1rem;
  }

  p {
    margin-bottom: 1rem;
  }

  code {
    background: ${props => props.theme.border};
    padding: 2px 8px;
    border-radius: 4px;
    font-family: 'Fira Code', monospace;
  }

  pre {
    background: ${props => props.theme.bgTertiary};
    padding: 1.5rem;
    border-radius: 10px;
    overflow-x: auto;
    margin: 1rem 0;
  }

  blockquote {
    border-left: 4px solid #00d4ff;
    padding-left: 1.5rem;
    margin: 1rem 0;
    color: ${props => props.theme.textMuted};
    font-style: italic;
  }

  img {
    max-width: 100%;
    border-radius: 10px;
    margin: 1rem 0;
  }

  a {
    color: #00d4ff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  ul, ol {
    margin: 1rem 0;
    padding-left: 2rem;
  }

  li {
    margin-bottom: 0.5rem;
  }
`;

const SingleImage = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 2rem;
`;

const EmptyHint = styled.p`
  text-align: center;
  color: ${props => props.theme.textMuted};
  padding: 3rem 1rem;
  font-size: 1rem;
`;

// ============ 图标映射 ============

const iconMap = {
  FaCode: <FaCode />,
  FaProjectDiagram: <FaProjectDiagram />,
  FaBookmark: <FaBookmark />,
  FaLayerGroup: <FaLayerGroup />,
  FaList: <FaList />,
  FaFileAlt: <FaFileAlt />
};

const getIcon = (iconName) => iconMap[iconName] || <FaLayerGroup />;

// ============ SectionRenderer 组件 ============

const SectionRenderer = ({ section }) => {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);

  if (!section) {
    return null;
  }

  const { name, slug, displayMode, icon, config, contents = [] } = section;
  const columns = config?.columns || 3;
  const rows = config?.rows || 3;
  const pageSize = columns * rows;

  // 列表模式渲染
  if (displayMode === 'list') {
    const totalPages = Math.ceil(contents.length / pageSize);
    const startIdx = (currentPage - 1) * pageSize;
    const pageContents = contents.slice(startIdx, startIdx + pageSize);

    return (
      <SectionWrapper id={slug}>
        <Container>
          <SectionTitle subtitle={section.description || ''}>{name}</SectionTitle>

          {contents.length === 0 ? (
            <EmptyHint theme={theme}>暂无内容，请在后台添加</EmptyHint>
          ) : (
            <ListGrid $columns={columns} $rows={rows}>
              {pageContents.map((item, index) => {
                const isBookmark = item.type === 'bookmark';
                const isProject = item.type === 'project';
                // 判断是否只有图片（无标题和描述）
                const hasImageOnly = item.imageUrl && !item.title && !item.content;
                const hasTitle = !!item.title;
                const hasContent = !!item.content;
                // 获取自定义图片显示位置
                const customImagePosition = item.metadata?.imagePosition;
                const customImagePositionValue = item.metadata?.imagePositionCustom;
                // 判断是否显示图标
                const showIcon = !item.imageUrl && !isProject;

                return (
                  <ListCard
                    key={item.id || index}
                    theme={theme}
                    $clickable={isBookmark}
                    $imageOnly={hasImageOnly}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    onClick={() => {
                      if (isBookmark && item.linkUrl) {
                        window.open(item.linkUrl, '_blank');
                      }
                    }}
                  >
                    {/* 图片 */}
                    {item.imageUrl && (
                      <CardImage
                        src={item.imageUrl}
                        alt={item.title || '图片'}
                        theme={theme}
                        $imageOnly={hasImageOnly}
                        $hasTitle={hasTitle}
                        $hasContent={hasContent}
                        $customPosition={customImagePosition}
                        $customPositionValue={customImagePositionValue}
                      />
                    )}

                    {/* 图标（非项目且有图标时显示） */}
                    {showIcon && (
                      <CardIcon style={{ animationDelay: `${index * 0.5}s` }}>
                        {getIcon(icon)}
                      </CardIcon>
                    )}

                    {/* 标题（非纯图片模式时显示） */}
                    {!hasImageOnly && item.title && (
                      <CardTitle theme={theme}>{item.title}</CardTitle>
                    )}

                    {/* 描述（非纯图片模式时显示） */}
                    {!hasImageOnly && item.content && (
                      <CardDescription theme={theme}>
                        {item.content}
                      </CardDescription>
                    )}

                    {/* 标签（非纯图片模式时显示） */}
                    {!hasImageOnly && item.metadata?.tags && Array.isArray(item.metadata.tags) && item.metadata.tags.length > 0 && (
                      <CardTags>
                        {item.metadata.tags.slice(0, 5).map((tag, tagIndex) => (
                          <CardTag key={tagIndex}>{tag}</CardTag>
                        ))}
                      </CardTags>
                    )}

                    {/* 项目链接 */}
                    {!hasImageOnly && isProject && (
                      <CardLinks>
                        {item.linkUrl && (
                          <CardLink href={item.linkUrl} target="_blank" rel="noopener noreferrer" theme={theme}>
                            <FaExternalLinkAlt /> 演示
                          </CardLink>
                        )}
                        {item.metadata?.githubUrl && (
                          <CardLink href={item.metadata.githubUrl} target="_blank" rel="noopener noreferrer" theme={theme}>
                            <FaGithub /> 源码
                          </CardLink>
                        )}
                      </CardLinks>
                    )}
                  </ListCard>
                );
              })}
            </ListGrid>
          )}

          {totalPages > 1 && (
            <HomePagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          )}
        </Container>
      </SectionWrapper>
    );
  }

  // 单一内容模式渲染
  if (displayMode === 'single') {
    if (contents.length === 0) {
      return (
        <SectionWrapper id={slug}>
          <Container>
            <SectionTitle subtitle={section.description || ''}>{name}</SectionTitle>
            <EmptyHint theme={theme}>暂无内容，请在后台添加</EmptyHint>
          </Container>
        </SectionWrapper>
      );
    }

    const mainContent = contents[0];

    return (
      <SectionWrapper id={slug}>
        <Container>
          <SectionTitle subtitle={section.description || ''}>{name}</SectionTitle>
          <SingleContentWrapper>
            <SingleContentCard
              theme={theme}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* 封面图 */}
              {mainContent.imageUrl && (
                <SingleImage src={mainContent.imageUrl} alt={mainContent.title} />
              )}

              <SingleTitle theme={theme}>{mainContent.title}</SingleTitle>

              {/* 元信息 */}
              <SingleMeta theme={theme}>
                {mainContent.metadata?.author && (
                  <SingleMetaItem theme={theme}>
                    ✍️ {mainContent.metadata.author}
                  </SingleMetaItem>
                )}
                {mainContent.metadata?.date && (
                  <SingleMetaItem theme={theme}>
                    📅 {new Date(mainContent.metadata.date).toLocaleDateString('zh-CN')}
                  </SingleMetaItem>
                )}
                {mainContent.metadata?.category && (
                  <SingleMetaItem theme={theme}>
                    📁 {mainContent.metadata.category}
                  </SingleMetaItem>
                )}
              </SingleMeta>

              {/* 内容正文 */}
              <SingleBody 
                theme={theme}
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(mainContent.content || '', {
                    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'pre', 'code', 'hr', 'div', 'span'],
                    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel']
                  })
                }}
              />
            </SingleContentCard>
          </SingleContentWrapper>
        </Container>
      </SectionWrapper>
    );
  }

  return null;
};

export default SectionRenderer;
