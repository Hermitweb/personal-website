import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-top: 2rem;
`;

const PageBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid ${props => props.disabled ? 'rgba(255,255,255,0.05)' : 'rgba(102, 126, 234, 0.3)'};
  background: ${props => props.disabled ? 'rgba(255,255,255,0.03)' : 'rgba(102, 126, 234, 0.1)'};
  color: ${props => props.disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.8)'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  font-size: 1rem;

  &:hover:not(:disabled) {
    background: rgba(102, 126, 234, 0.25);
    border-color: rgba(102, 126, 234, 0.6);
    color: #fff;
    transform: scale(1.05);
  }
`;

const PageDot = styled.button`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$active ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.15)'};
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;

  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.3)'};
    transform: scale(1.3);
  }
`;

const PageInfo = styled.span`
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.85rem;
  min-width: 60px;
  text-align: center;
`;

const HomePagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <Wrapper>
      <PageBtn disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        <FaChevronLeft />
      </PageBtn>

      {Array.from({ length: totalPages }, (_, i) => (
        <PageDot
          key={i}
          $active={i + 1 === currentPage}
          onClick={() => onPageChange(i + 1)}
        />
      ))}

      <PageInfo>{currentPage} / {totalPages}</PageInfo>

      <PageBtn disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
        <FaChevronRight />
      </PageBtn>
    </Wrapper>
  );
};

export default HomePagination;
