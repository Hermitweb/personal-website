import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaUpload,
  FaSearch,
  FaFilter
} from 'react-icons/fa';
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
  margin-bottom: 1.5rem;
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #fff;
`;

const AddButton = (props) => (
  <motion.button
    onClick={props.onClick}
    disabled={props.disabled}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
      color: '#000',
      borderRadius: '12px',
      fontWeight: 600,
      border: 'none',
      cursor: 'pointer'
    }}
  >
    {props.children}
  </motion.button>
);

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

const Badge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background: ${props => {
    switch(props.type) {
      case 'hero': return 'rgba(231, 76, 60, 0.2)';
      case 'admin': return 'rgba(0, 212, 255, 0.2)';
      case 'user': return 'rgba(46, 204, 113, 0.2)';
      case 'about': return 'rgba(155, 89, 182, 0.2)';
      case 'skill': return 'rgba(52, 152, 219, 0.2)';
      case 'project': return 'rgba(230, 126, 34, 0.2)';
      case 'contact': return 'rgba(26, 188, 156, 0.2)';
      case 'published': return 'rgba(46, 204, 113, 0.2)';
      case 'draft': return 'rgba(149, 165, 166, 0.2)';
      default: return 'rgba(149, 165, 166, 0.2)';
    }
  }};
  color: ${props => {
    switch(props.type) {
      case 'hero': return '#e74c3c';
      case 'admin': return '#00d4ff';
      case 'user': return '#2ecc71';
      case 'about': return '#9b59b6';
      case 'skill': return '#3498db';
      case 'project': return '#e67e22';
      case 'contact': return '#1abc9c';
      case 'published': return '#2ecc71';
      case 'draft': return '#95a5a6';
      default: return '#95a5a6';
    }
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.5);
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 0.75rem 1rem;
  padding-left: 2.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;

  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.4);
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  cursor: pointer;
  min-width: 140px;

  &:focus {
    outline: none;
    border-color: #00d4ff;
  }

  option {
    background: #1a1a2e;
    color: #fff;
  }
`;

const ResultCount = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  margin-bottom: 1rem;
`;

// Modal 组件
const ModalOverlay = (props) => (
  <motion.div
    initial={props.initial}
    animate={props.animate}
    exit={props.exit}
    onClick={props.onClick}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}
  >
    {props.children}
  </motion.div>
);

const ModalContent = (props) => (
  <motion.div
    initial={props.initial}
    animate={props.animate}
    exit={props.exit}
    onClick={props.onClick}
    style={{
      background: '#1a1a2e',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      padding: '2rem',
      width: '90%',
      maxWidth: '700px',
      maxHeight: '85vh',
      overflowY: 'auto'
    }}
  >
    {props.children}
  </motion.div>
);

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: #fff;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.3rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: all 0.3s ease;
  font-family: inherit;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 0.9rem;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #00d4ff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 10px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
  color: #000;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0, 212, 255, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// ============ BlogManagement 组件 ============

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const emptyForm = {
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    coverImage: '',
    isPublished: false,
    allowComment: true
  };

  const [formData, setFormData] = useState(emptyForm);

  // 过滤后的博客
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (blog.content && blog.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (blog.category && blog.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'published' && blog.isPublished) ||
      (statusFilter === 'draft' && !blog.isPublished);
    return matchesSearch && matchesStatus;
  });

  // 分页计算
  const totalPages = Math.ceil(filteredBlogs.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedBlogs = filteredBlogs.slice(startIndex, startIndex + pageSize);

  // 搜索/筛选变化时重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get('/api/blogs/admin/all');
      setBlogs(response.data.blogs);
    } catch (error) {
      toast.error('获取博客失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除此文章吗？')) return;
    try {
      await axios.delete(`/api/blogs/${id}`);
      toast.success('删除成功');
      fetchBlogs();
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const openAddModal = () => {
    setEditingBlog(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt || '',
      category: blog.category || '',
      tags: blog.tags ? blog.tags.join(', ') : '',
      coverImage: blog.coverImage || '',
      isPublished: blog.isPublished,
      allowComment: blog.allowComment
    });
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('标题和内容不能为空');
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      if (editingBlog) {
        await axios.put(`/api/blogs/${editingBlog.id}`, data);
        toast.success('更新成功');
      } else {
        await axios.post('/api/blogs', data);
        toast.success('添加成功');
      }
      setModalOpen(false);
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.message || '操作失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: '#fff' }}>加载中...</div>;

  return (
    <>
      <StickyHeader>
        <Header>
          <Title>博客管理</Title>
          <HeaderButtons>
            <AddButton whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAddModal}>
              <FaPlus /> 发布文章
            </AddButton>
          </HeaderButtons>
        </Header>
        <FilterBar>
          <SearchWrapper>
            <FaSearch />
            <SearchInput
              type="text"
              placeholder="搜索标题、内容或分类..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchWrapper>
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">全部状态</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
          </FilterSelect>
        </FilterBar>
      </StickyHeader>

      <Card>
        <ResultCount>共 {filteredBlogs.length} 篇文章{totalPages > 1 ? `，第 ${currentPage}/${totalPages} 页` : ''}</ResultCount>

        {filteredBlogs.length === 0 ? (
          <EmptyState>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>暂无文章</p>
            <p>点击「发布文章」按钮创建第一篇文章</p>
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>标题</Th>
                <Th>分类</Th>
                <Th>状态</Th>
                <Th>浏览</Th>
                <Th>点赞</Th>
                <Th>发布时间</Th>
                <Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {paginatedBlogs.map(blog => (
                <tr key={blog.id}>
                  <Td title={blog.title}>{blog.title}</Td>
                  <Td>{blog.category || '-'}</Td>
                  <Td>
                    <Badge type={blog.isPublished ? 'published' : 'draft'}>
                      {blog.isPublished ? '已发布' : '草稿'}
                    </Badge>
                  </Td>
                  <Td>{blog.viewCount}</Td>
                  <Td>{blog.likeCount}</Td>
                  <Td>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : '-'}</Td>
                  <Td>
                    <ActionButton onClick={() => openEditModal(blog)} title="编辑">
                      <FaEdit />
                    </ActionButton>
                    <ActionButton danger onClick={() => handleDelete(blog.id)} title="删除">
                      <FaTrash />
                    </ActionButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <AdminPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Card>

      {modalOpen && ReactDOM.createPortal(
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setModalOpen(false)}
        >
          <ModalContent
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>{editingBlog ? '编辑文章' : '发布文章'}</ModalTitle>
              <CloseButton onClick={() => setModalOpen(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <FormGroup>
              <Label>标题 *</Label>
              <Input name="title" value={formData.title} onChange={handleFormChange} placeholder="请输入标题" />
            </FormGroup>

            <FormGroup>
              <Label>内容 *</Label>
              <TextArea name="content" value={formData.content} onChange={handleFormChange} placeholder="支持 HTML 格式" style={{ minHeight: '200px' }} />
            </FormGroup>

            <FormGroup>
              <Label>摘要</Label>
              <TextArea name="excerpt" value={formData.excerpt} onChange={handleFormChange} placeholder="不填则自动截取内容前200字" />
            </FormGroup>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormGroup>
                <Label>分类</Label>
                <Input name="category" value={formData.category} onChange={handleFormChange} placeholder="如：技术、生活" />
              </FormGroup>

              <FormGroup>
                <Label>标签（逗号分隔）</Label>
                <Input name="tags" value={formData.tags} onChange={handleFormChange} placeholder="React, Node.js, MySQL" />
              </FormGroup>
            </div>

            <FormGroup>
              <Label>封面图片</Label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <Input name="coverImage" value={formData.coverImage} onChange={handleFormChange} placeholder="图片URL或上传图片" style={{ flex: 1 }} />
                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(0, 212, 255, 0.1)',
                  color: '#00d4ff',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s ease'
                }}>
                  <FaUpload /> 上传图片
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error('图片大小不能超过5MB');
                        return;
                      }
                      const uploadData = new FormData();
                      uploadData.append('image', file);
                      try {
                        toast.info('正在上传...');
                        const res = await axios.post('/api/upload', uploadData, {
                          headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        const url = res.data.url || res.data.imageUrl || res.data.path;
                        setFormData(prev => ({ ...prev, coverImage: url }));
                        toast.success('上传成功');
                      } catch (err) {
                        toast.error('上传失败');
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              {formData.coverImage && (
                <div style={{ marginTop: '10px' }}>
                  <img
                    src={formData.coverImage}
                    alt="封面预览"
                    style={{
                      width: '100%',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </FormGroup>

            <div style={{ display: 'flex', gap: '2rem' }}>
              <FormGroup>
                <CheckboxLabel>
                  <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleFormChange} />
                  立即发布
                </CheckboxLabel>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <input type="checkbox" name="allowComment" checked={formData.allowComment} onChange={handleFormChange} />
                  允许评论
                </CheckboxLabel>
              </FormGroup>
            </div>

            <ButtonGroup>
              <CancelButton onClick={() => setModalOpen(false)}>取消</CancelButton>
              <SaveButton onClick={handleSave} disabled={saving}>
                <FaSave /> {saving ? '保存中...' : '保存'}
              </SaveButton>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>,
        document.body
      )}
    </>
  );
};

export default BlogManagement;
