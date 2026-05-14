import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import AdminPagination from '../../components/AdminPagination';

// ============ 样式组件 ============

const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: #1a1a2e;
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #fff;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 1.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 1rem;
  color: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.5);
`;

const MessageContent = styled.div`
  max-width: 300px;
  word-break: break-word;
  white-space: pre-wrap;
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: #00d4ff;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
  margin-left: 8px;
  text-decoration: underline;

  &:hover {
    color: #667eea;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.danger ? '#e74c3c' : props.success ? '#2ecc71' : '#00d4ff'};
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-right: 0.25rem;

  &:hover {
    background: ${props => props.danger ? 'rgba(231, 76, 60, 0.1)' : props.success ? 'rgba(46, 204, 113, 0.1)' : 'rgba(0, 212, 255, 0.1)'};
  }
`;

// ============ 留言管理组件 ============

const MessageManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/api/messages');
      setMessages(response.data.messages || []);
    } catch (error) {
      toast.error('获取留言失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除此留言吗？')) return;
    try {
      await axios.delete(`/api/messages/${id}`);
      toast.success('删除成功');
      fetchMessages();
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const toggleExpand = (id) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const totalPages = Math.ceil(messages.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedMessages = messages.slice(startIndex, startIndex + pageSize);

  if (loading) return <div style={{ color: '#fff' }}>加载中...</div>;

  return (
    <>
      <StickyHeader>
        <Header>
          <Title>留言管理</Title>
        </Header>
      </StickyHeader>

      <Card>
        {messages.length === 0 ? (
          <EmptyState>暂无留言</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>姓名</Th>
                <Th>邮箱</Th>
                <Th>内容</Th>
                <Th>时间</Th>
                <Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {paginatedMessages.map(msg => {
                const isExpanded = expandedMessages.has(msg.id);
                const needsExpand = msg.content && msg.content.length > 50;
                return (
                  <tr key={msg.id}>
                    <Td>{msg.name}</Td>
                    <Td>{msg.email}</Td>
                    <Td>
                      <MessageContent>
                        {isExpanded ? msg.content : msg.content?.substring(0, 50)}
                        {needsExpand && !isExpanded && '...'}
                        {needsExpand && (
                          <ExpandButton onClick={() => toggleExpand(msg.id)}>
                            {isExpanded ? '收起' : '展开'}
                          </ExpandButton>
                        )}
                      </MessageContent>
                    </Td>
                    <Td>{new Date(msg.createdAt).toLocaleString()}</Td>
                    <Td>
                      <ActionButton danger onClick={() => handleDelete(msg.id)}>
                        <FaTrash />
                      </ActionButton>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
        <AdminPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Card>
    </>
  );
};

export default MessageManagement;
