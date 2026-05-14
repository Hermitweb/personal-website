import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import BackToTop from '../components/BackToTop';

const Container = styled.div`
  min-height: 100vh;
  padding-top: 80px;
  background: ${props => props.theme.bgPrimary};
  transition: background 0.3s ease;
`;

const Hero = styled.div`
  position: relative;
  height: 400px;
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
  max-width: 800px;
  margin: -100px auto 80px;
  padding: 0 20px;
  position: relative;
  z-index: 1;
`;

// ArticleCard - 包装组件模式
const ArticleCardStyled = styled.div`
  background: ${props => props.theme.cardBg};
  border-radius: 20px;
  padding: 50px;
  border: 1px solid ${props => props.theme.borderLight};
  box-shadow: 0 20px 60px ${props => props.theme.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'};
`;

const ArticleCard = (props) => (
  <motion.div
    initial={props.initial}
    animate={props.animate}
    transition={props.transition}
  >
    <ArticleCardStyled theme={props.theme}>{props.children}</ArticleCardStyled>
  </motion.div>
);

const CategoryBadge = styled.span`
  display: inline-block;
  padding: 6px 16px;
  background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
  color: #000;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${props => props.theme.textPrimary};
  line-height: 1.3;
  margin-bottom: 25px;
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid ${props => props.theme.border};
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.textMuted};
  font-size: 14px;
`;

const Tags = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 30px;
`;

const Tag = styled.span`
  padding: 6px 14px;
  background: ${props => props.theme.cardBg};
  color: ${props => props.theme.primary};
  border-radius: 15px;
  font-size: 13px;
`;

const ArticleContent = styled.div`
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

  code {
    background: ${props => props.theme.border};
    padding: 2px 8px;
    border-radius: 4px;
    font-family: 'Fira Code', monospace;
  }

  pre {
    background: ${props => props.theme.bgTertiary};
    padding: 20px;
    border-radius: 10px;
    overflow-x: auto;
    margin: 20px 0;
  }

  blockquote {
    border-left: 4px solid #00d4ff;
    padding-left: 20px;
    margin: 20px 0;
    color: ${props => props.theme.textMuted};
    font-style: italic;
  }

  img {
    max-width: 100%;
    border-radius: 10px;
    margin: 20px 0;
  }

  a {
    color: #00d4ff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  ul, ol {
    margin: 20px 0;
    padding-left: 30px;
  }

  li {
    margin-bottom: 10px;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid ${props => props.theme.border};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 25px;
  border: 1px solid ${props => props.theme.border};
  background: ${props => props.liked ? 'rgba(0, 212, 255, 0.2)' : props.theme.inputBg};
  color: ${props => props.liked ? '#00d4ff' : props.theme.textPrimary};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    border-color: #00d4ff;
    background: rgba(0, 212, 255, 0.1);
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 100px 20px;
  color: ${props => props.theme.textMuted};
`;

const BlogDetail = () => {
  const { slug } = useParams();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchBlog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/blogs/slug/${slug}`);
      setBlog(response.data);
    } catch (error) {
      console.error('获取文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (liked) return;
    try {
      await axios.post(`/api/blogs/${blog.id}/like`);
      setBlog(prev => ({ ...prev, likeCount: prev.likeCount + 1 }));
      setLiked(true);
      localStorage.setItem(`blog-liked-${blog.id}`, 'true');
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    if (blog) {
      setLiked(localStorage.getItem(`blog-liked-${blog.id}`) === 'true');
    }
  }, [blog]);

  if (loading) {
    return (
      <>
        <Navbar />
        <Container>
          <Loading>{t('common.loading')}</Loading>
        </Container>
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <Navbar />
        <Container>
          <Loading>{t('common.error')}</Loading>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container>
        <Hero coverImage={blog.coverImage}>
          <BackButton to="/blog">← {t('blog.all')}</BackButton>
        </Hero>

      <Content>
        <ArticleCard
          theme={theme}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {blog.category && <CategoryBadge>{blog.category}</CategoryBadge>}
          <Title>{blog.title}</Title>

          <Meta>
            <MetaItem>
              📅 {t('blog.publishTime')} {formatDate(blog.publishedAt || blog.createdAt)}
            </MetaItem>
            <MetaItem>
              ✍️ {blog.author || 'Admin'}
            </MetaItem>
            <MetaItem>
              👁 {blog.viewCount} {t('blog.views')}
            </MetaItem>
            <MetaItem>
              ❤️ {blog.likeCount} {t('blog.likes')}
            </MetaItem>
          </Meta>

          {(() => {
            // 处理 tags 可能是字符串或数组的情况
            let tags = blog.tags;
            if (typeof tags === 'string') {
              tags = tags.split(',').map(t => t.trim()).filter(Boolean);
            }
            if (Array.isArray(tags) && tags.length > 0) {
              return (
                <Tags>
                  {tags.map((tag, i) => (
                    <Tag key={i}>#{tag}</Tag>
                  ))}
                </Tags>
              );
            }
            return null;
          })()}

          <ArticleContent dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content, { 
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'pre', 'code', 'hr', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel']
          }) }} />

          <ActionBar>
            <ActionButton liked={liked} onClick={handleLike}>
              {liked ? '❤️' : '🤍'} {blog.likeCount} {t('blog.likes')}
            </ActionButton>
          </ActionBar>
        </ArticleCard>
      </Content>
      </Container>
      <BackToTop />
    </>
  );
};

export default BlogDetail;
