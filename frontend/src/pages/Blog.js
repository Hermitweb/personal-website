import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import SectionTitle from '../components/SectionTitle';
import Navbar from '../components/Navbar';
import BackToTop from '../components/BackToTop';

const Container = styled.div`
  min-height: 100vh;
  padding: 120px 5% 80px;
  background: ${props => props.theme.bgPrimary};
  transition: background 0.3s ease;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 12px 20px;
  border-radius: 25px;
  border: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.inputBg};
  color: ${props => props.theme.textPrimary};
  font-size: 14px;
  width: 250px;
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

const SearchButton = styled.button`
  padding: 12px 24px;
  border-radius: 25px;
  border: none;
  background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0, 212, 255, 0.4);
  }
`;

const CategoryFilter = styled.select`
  padding: 12px 40px 12px 20px;
  border-radius: 25px;
  border: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.inputBg};
  color: ${props => props.theme.textPrimary};
  font-size: 14px;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  text-align-last: center;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2300d4ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;

  &:focus {
    border-color: #00d4ff;
  }
`;

// 下拉选项样式 - 使用全局样式确保深色主题下显示正确
const CategoryOption = styled.option`
  background: #1a1a2e;
  color: #fff;
`;

const BlogGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
`;

// BlogCard - 包装组件模式
const BlogCardStyled = styled.article`
  background: ${props => props.theme.cardBg};
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${props => props.theme.borderLight};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px ${props => props.theme.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'};
    border-color: rgba(0, 212, 255, 0.3);
  }
`;

const BlogCard = (props) => (
  <motion.div
    initial={props.initial}
    animate={props.animate}
    transition={props.transition}
    style={{ display: 'contents' }}
  >
    <BlogCardStyled theme={props.theme}>{props.children}</BlogCardStyled>
  </motion.div>
);

const CoverImage = styled.div`
  width: 100%;
  height: 200px;
  background: ${props => props.src ? `url(${props.src}) center/cover` : 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)'};
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5));
  }
`;

const CategoryBadge = styled.span`
  position: absolute;
  top: 15px;
  left: 15px;
  padding: 6px 12px;
  background: rgba(0, 212, 255, 0.9);
  color: #000;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  z-index: 1;
`;

const CardContent = styled.div`
  padding: 25px;
`;

const BlogTitle = styled.h3`
  font-size: 1.25rem;
  color: ${props => props.theme.textPrimary};
  margin-bottom: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Excerpt = styled.p`
  color: ${props => props.theme.textMuted};
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid ${props => props.theme.borderLight};
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${props => props.theme.textMuted};
  font-size: 13px;
`;

const Tags = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 15px;
`;

const Tag = styled.span`
  padding: 4px 10px;
  background: ${props => props.theme.cardBg};
  color: ${props => props.theme.textMuted};
  border-radius: 12px;
  font-size: 12px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 50px;
`;

const PageButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.border};
  background: ${props => props.active ? '#00d4ff' : props.theme.inputBg};
  color: ${props => props.active ? '#000' : props.theme.textPrimary};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: ${props => props.active ? '600' : '400'};

  &:hover:not(:disabled) {
    border-color: #00d4ff;
    background: ${props => props.active ? '#00d4ff' : 'rgba(0, 212, 255, 0.1)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NoData = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: ${props => props.theme.textMuted};
`;

const Blog = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedCategory]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 9 });
      if (selectedCategory) params.append('category', selectedCategory);
      if (search) params.append('search', search);

      const response = await axios.get(`/api/blogs?${params}`);
      setBlogs(response.data.blogs);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('获取博客失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/blogs/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBlogs();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Navbar />
      <Container>
        <SectionTitle
          title={t('blog.title')}
          subtitle={t('blog.subtitle')}
        />

      <FilterBar>
        <SearchForm onSubmit={handleSearch}>
          <SearchInput
            type="text"
            placeholder={t('blog.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <SearchButton type="submit">搜索</SearchButton>
        </SearchForm>
        <CategoryFilter
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
        >
          <CategoryOption value="">{t('blog.all')}</CategoryOption>
          {categories.map(cat => (
            <CategoryOption key={cat} value={cat}>{cat}</CategoryOption>
          ))}
        </CategoryFilter>
      </FilterBar>

      {loading ? (
        <NoData>{t('common.loading')}</NoData>
      ) : blogs.length === 0 ? (
        <NoData>{t('blog.noArticles')}</NoData>
      ) : (
        <>
          <BlogGrid>
            {blogs.map((blog, index) => (
              <Link key={blog.id} to={`/blog/${blog.slug}`} style={{ textDecoration: 'none' }}>
                <BlogCard
                  theme={theme}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CoverImage src={blog.coverImage}>
                    {blog.category && <CategoryBadge>{blog.category}</CategoryBadge>}
                    <img src={blog.coverImage} alt={blog.title} loading="lazy" />
                  </CoverImage>
                  <CardContent>
                    <BlogTitle>{blog.title}</BlogTitle>
                    {(() => {
                      // 处理 tags 可能是字符串或数组的情况
                      let tags = blog.tags;
                      if (typeof tags === 'string') {
                        tags = tags.split(',').map(t => t.trim()).filter(Boolean);
                      }
                      if (Array.isArray(tags) && tags.length > 0) {
                        return (
                          <Tags>
                            {tags.slice(0, 3).map((tag, i) => (
                              <Tag key={i}>{tag}</Tag>
                            ))}
                          </Tags>
                        );
                      }
                      return null;
                    })()}
                    <Excerpt>{blog.excerpt}</Excerpt>
                    <Meta>
                      <MetaItem>
                        📅 {formatDate(blog.publishedAt || blog.createdAt)}
                      </MetaItem>
                      <MetaItem>
                        👁 {blog.viewCount} {t('blog.views')}
                      </MetaItem>
                    </Meta>
                  </CardContent>
                </BlogCard>
              </Link>
            ))}
          </BlogGrid>

          {totalPages > 1 && (
            <Pagination>
              <PageButton
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                ←
              </PageButton>
              {[...Array(totalPages)].map((_, i) => (
                <PageButton
                  key={i}
                  active={page === i + 1}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </PageButton>
              ))}
              <PageButton
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                →
              </PageButton>
            </Pagination>
          )}
        </>
      )}
      </Container>
      <BackToTop />
    </>
  );
};

export default Blog;
