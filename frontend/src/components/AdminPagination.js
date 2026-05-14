import React from 'react';
import styled from 'styled-components';

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const PageButton = styled.button`
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  background: ${props => props.$active ? 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.$active ? '#000' : 'rgba(255, 255, 255, 0.7)'};
  border: 1px solid ${props => props.$active ? 'transparent' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.4 : 1};
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: ${props => props.$active ? 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)' : 'rgba(0, 212, 255, 0.15)'};
    border-color: ${props => props.$active ? 'transparent' : 'rgba(0, 212, 255, 0.3)'};
  }
`;

const PageInfo = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  padding: 0 0.5rem;
  white-space: nowrap;
`;

const PageJumpSelect = styled.select`
  padding: 0.4rem 0.4rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
  min-width: 52px;
  height: 36px;
  text-align: center;
  text-align-last: center;

  &:focus {
    outline: none;
    border-color: #00d4ff;
  }

  option {
    background: #1a1a2e;
    color: #fff;
    text-align: center;
  }
`;

const AdminPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  const pageOptions = [];
  for (let i = 1; i <= totalPages; i++) {
    pageOptions.push(i);
  }

  return (
    <Pagination>
      <PageButton disabled={currentPage === 1} onClick={() => onPageChange(1)}>««</PageButton>
      <PageButton disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>«</PageButton>
      {pages.map(page => (
        <PageButton key={page} $active={page === currentPage} onClick={() => onPageChange(page)}>
          {page}
        </PageButton>
      ))}
      <PageButton disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>»</PageButton>
      <PageButton disabled={currentPage === totalPages} onClick={() => onPageChange(totalPages)}>»»</PageButton>
      <PageInfo>
        第
        <PageJumpSelect value={currentPage} onChange={e => onPageChange(Number(e.target.value))}>
          {pageOptions.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </PageJumpSelect>
        / {totalPages} 页
      </PageInfo>
    </Pagination>
  );
};

export default AdminPagination;
