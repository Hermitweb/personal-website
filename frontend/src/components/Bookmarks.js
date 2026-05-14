import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt } from 'react-icons/fa';
import SectionTitle from './SectionTitle';
import HomePagination from './HomePagination';

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const BookmarksSection = styled.section`
  padding: 6rem 2rem;
  position: relative;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const BookmarksGrid = styled.div`
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

const BookmarkCard = styled(motion.a)`
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.cardBg};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme.border};
  border-radius: 20px;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  height: 100%;
  min-height: 200px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
    background-size: 200% auto;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-10px);
    border-color: rgba(102, 126, 234, 0.5);
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.2);
  }

  &:hover::before {
    opacity: 1;
  }
`;

const BookmarkHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const BookmarkTitle = styled.h3`
  font-size: 1.2rem;
  color: ${props => props.theme.textPrimary};
  margin: 0;
  font-weight: 600;
`;

const BookmarkIcon = styled(FaExternalLinkAlt)`
  color: #667eea;
  font-size: 1rem;
`;

const BookmarkDesc = styled.p`
  font-size: 0.95rem;
  color: ${props => props.theme.textSecondary};
  line-height: 1.6;
  margin: 0;
  flex: 1;
`;

const Bookmarks = ({ bookmarksData = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // 3列 × 3行

  if (!bookmarksData || bookmarksData.length === 0) return null;

  // 只显示可见的内容
  const visibleBookmarks = bookmarksData.filter(item => item.isVisible);

  if (visibleBookmarks.length === 0) return null;

  const totalPages = Math.ceil(visibleBookmarks.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const pageBookmarks = visibleBookmarks.slice(startIdx, startIdx + pageSize);

  return (
    <BookmarksSection>
      <Container>
        <SectionTitle subtitle="Bookmarks">
          站点收藏
        </SectionTitle>
        <BookmarksGrid>
          {pageBookmarks.map((bookmark, index) => (
            <BookmarkCard
              key={bookmark.id}
              href={bookmark.linkUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <BookmarkHeader>
                <BookmarkTitle>{bookmark.title}</BookmarkTitle>
                <BookmarkIcon />
              </BookmarkHeader>
              {bookmark.content && (
                <BookmarkDesc>{bookmark.content}</BookmarkDesc>
              )}
            </BookmarkCard>
          ))}
        </BookmarksGrid>

        <HomePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Container>
    </BookmarksSection>
  );
};

export default Bookmarks;
