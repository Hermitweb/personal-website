import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaSearch,
  FaEye,
  FaEyeSlash,
  FaLayerGroup,
  FaCode,
  FaProjectDiagram,
  FaBookmark,
  FaGripVertical,
  FaList,
  FaFileAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import AdminPagination from '../../components/AdminPagination';

// ============ 样式组件 ============

// 固定顶部容器
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
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  color: #fff;
  margin: 0;
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 1rem;
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
      cursor: props.disabled ? 'not-allowed' : 'pointer',
      opacity: props.disabled ? 0.6 : 1
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
  overflow-x: auto;
`;

const TableWrapper = styled.div`
  min-height: 550px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
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

const TdActions = styled.td`
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: sticky;
  right: 0;
  white-space: nowrap;
  min-width: 80px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.danger ? '#e74c3c' : props.success ? '#2ecc71' : props.warning ? '#f39c12' : '#00d4ff'};
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-right: 0.25rem;

  &:hover {
    background: ${props => props.danger ? 'rgba(231, 76, 60, 0.1)' : props.success ? 'rgba(46, 204, 113, 0.1)' : props.warning ? 'rgba(243, 156, 18, 0.1)' : 'rgba(0, 212, 255, 0.1)'};
  }
`;

const Badge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background: ${props => {
    switch(props.type) {
      case 'builtin': return 'rgba(46, 204, 113, 0.2)';
      case 'custom': return 'rgba(155, 89, 182, 0.2)';
      default: return 'rgba(149, 165, 166, 0.2)';
    }
  }};
  color: ${props => {
    switch(props.type) {
      case 'builtin': return '#2ecc71';
      case 'custom': return '#9b59b6';
      default: return '#95a5a6';
    }
  }};
`;

const DisplayModeBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background: ${props => props.mode === 'list' ? 'rgba(52, 152, 219, 0.2)' : 'rgba(230, 126, 34, 0.2)'};
  color: ${props => props.mode === 'list' ? '#3498db' : '#e67e22'};
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 24px;
    transition: all 0.3s ease;

    &:before {
      content: '';
      position: absolute;
      width: 18px;
      height: 18px;
      left: 3px;
      bottom: 3px;
      background: #fff;
      border-radius: 50%;
      transition: all 0.3s ease;
    }
  }

  input:checked + span {
    background: #2ecc71;
  }

  input:checked + span:before {
    transform: translateX(20px);
  }
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

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.5);
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
      top: 0, left: 0, right: 0, bottom: 0,
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
  min-height: 100px;
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

const Select = styled.select`
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
  }

  option {
    background: #1a1a2e;
    color: #fff;
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

const HelpText = styled.p`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.5rem;
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const IconOption = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background: ${props => props.selected ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.selected ? '#00d4ff' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: ${props => props.selected ? '#00d4ff' : 'rgba(255, 255, 255, 0.7)'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;

  &:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: #00d4ff;
  }
`;

const ConfigGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const PAGE_SIZE = 10;

// 可用图标列表
const AVAILABLE_ICONS = [
  { name: 'FaLayerGroup', component: <FaLayerGroup /> },
  { name: 'FaCode', component: <FaCode /> },
  { name: 'FaProjectDiagram', component: <FaProjectDiagram /> },
  { name: 'FaBookmark', component: <FaBookmark /> },
  { name: 'FaList', component: <FaList /> },
  { name: 'FaFileAlt', component: <FaFileAlt /> }
];

// ============ SectionManagement 组件 ============

const SectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sectionType: 'custom',
    contentType: '',
    displayMode: 'list',
    description: '',
    icon: 'FaLayerGroup',
    isVisible: true,
    requireLogin: false,
    config: {
      columns: 3,
      rows: 3,
      showTitle: true,
      showDescription: false
    }
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // 过滤后的内容
  const filteredSections = sections.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || item.sectionType === typeFilter;
    return matchesSearch && matchesType;
  });

  // 分页
  const totalPages = Math.ceil(filteredSections.length / PAGE_SIZE);
  const paginatedSections = filteredSections.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // 搜索或筛选变化时重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await axios.get('/api/sections/admin/all');
      setSections(response.data);
    } catch (error) {
      toast.error('获取板块列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除此板块吗？')) return;
    try {
      await axios.delete(`/api/sections/${id}`);
      toast.success('删除成功');
      fetchSections();
    } catch (error) {
      toast.error(error.response?.data?.message || '删除失败');
    }
  };

  // 拖拽排序状态
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  // 拖拽开始
  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 拖拽进入
  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (draggedId !== id) {
      setDragOverId(id);
    }
  };

  // 拖拽离开
  const handleDragLeave = () => {
    setDragOverId(null);
  };

  // 拖拽结束
  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // 拖拽放置，重新排序
  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      handleDragEnd();
      return;
    }

    // 重新排序
    const newSections = [...sections];
    const draggedIndex = newSections.findIndex(s => s.id === draggedId);
    const targetIndex = newSections.findIndex(s => s.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedItem] = newSections.splice(draggedIndex, 1);
      newSections.splice(targetIndex, 0, draggedItem);

      // 更新排序号
      const updatedSections = newSections.map((s, index) => ({
        ...s,
        orderNum: index
      }));

      setSections(updatedSections);

      // 保存到后端
      saveSectionOrder(updatedSections);
    }

    handleDragEnd();
  };

  // 保存排序到后端
  const saveSectionOrder = async (orderedSections) => {
    try {
      const orders = orderedSections.map((s, index) => ({
        id: s.id,
        orderNum: index
      }));
      await axios.post('/api/sections/reorder', { orders });
      toast.success('排序已保存');
    } catch (error) {
      toast.error('保存排序失败');
      fetchSections();
    }
  };

  // 切换显示/隐藏
  const handleToggleVisible = async (item) => {
    try {
      await axios.put(`/api/sections/${item.id}`, { isVisible: !item.isVisible });
      toast.success(item.isVisible ? '已隐藏' : '已显示');
      fetchSections();
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const openAddModal = () => {
    setEditingSection(null);
    setFormData({
      name: '',
      slug: '',
      sectionType: 'custom',
      contentType: '',
      displayMode: 'list',
      description: '',
      icon: 'FaLayerGroup',
      isVisible: true,
      requireLogin: false,
      config: {
        columns: 3,
        rows: 3,
        showTitle: true,
        showDescription: false
      }
    });
    setModalOpen(true);
  };

  const openEditModal = (section) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      slug: section.slug,
      sectionType: section.sectionType,
      contentType: section.contentType,
      displayMode: section.displayMode,
      description: section.description || '',
      icon: section.icon || 'FaLayerGroup',
      isVisible: section.isVisible,
      requireLogin: section.requireLogin,
      config: section.config || {
        columns: 3,
        rows: 3,
        showTitle: true,
        showDescription: false
      }
    });
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('config.')) {
      const configKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        config: {
          ...prev.config,
          [configKey]: type === 'checkbox' ? checked : parseInt(value) || value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // 自动生成 slug
  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '');
    
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || slug
    }));
  };

  const handleIconSelect = (iconName) => {
    setFormData(prev => ({ ...prev, icon: iconName }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('板块名称不能为空');
      return;
    }
    if (!formData.slug.trim()) {
      toast.error('板块标识不能为空');
      return;
    }
    if (!editingSection && !formData.contentType) {
      // 新增自定义板块时自动设置 contentType
      setFormData(prev => ({ ...prev, contentType: 'custom' }));
    }
    
    setSaving(true);
    try {
      if (editingSection) {
        await axios.put(`/api/sections/${editingSection.id}`, formData);
        toast.success('更新成功');
      } else {
        await axios.post('/api/sections', formData);
        toast.success('添加成功');
      }
      setModalOpen(false);
      fetchSections();
    } catch (error) {
      const msg = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || '操作失败';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: '#fff' }}>加载中...</div>;

  return (
    <>
      {/* 固定顶部区域 */}
      <StickyHeader>
        <Header>
          <Title>板块管理</Title>
          <HeaderButtons>
            <AddButton onClick={openAddModal}>
              <FaPlus /> 添加板块
            </AddButton>
          </HeaderButtons>
        </Header>
        <FilterBar>
          <SearchWrapper>
            <FaSearch />
            <SearchInput
              type="text"
              placeholder="搜索板块名称或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchWrapper>
          <FilterSelect value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">全部类型</option>
            <option value="builtin">内置板块</option>
            <option value="custom">自定义板块</option>
          </FilterSelect>
        </FilterBar>
      </StickyHeader>

      <Card>
        <ResultCount>共 {filteredSections.length} 条结果</ResultCount>

        {paginatedSections.length === 0 ? (
          <EmptyState>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>暂无板块</p>
            <p>点击「添加板块」按钮创建新板块</p>
          </EmptyState>
        ) : (
          <>
            <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>排序</Th>
                  <Th>板块名称</Th>
                  <Th>标识</Th>
                  <Th>类型</Th>
                  <Th>展示模式</Th>
                  <Th>显示</Th>
                  <Th>操作</Th>
                </tr>
              </thead>
              <tbody>
                {paginatedSections.map(item => (
                  <tr
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragOver={(e) => handleDragOver(e, item.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, item.id)}
                    onDragEnd={handleDragEnd}
                    style={{
                      background: dragOverId === item.id ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                      borderTop: dragOverId === item.id ? '2px solid #00d4ff' : 'none',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <Td>
                      <span style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                        <FaGripVertical style={{ color: 'rgba(255,255,255,0.3)', marginRight: '0.5rem' }} />
                      </span>
                    </Td>
                    <Td>{item.name}</Td>
                    <Td style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{item.slug}</Td>
                    <Td><Badge type={item.sectionType}>{item.sectionType === 'builtin' ? '内置' : '自定义'}</Badge></Td>
                    <Td><DisplayModeBadge mode={item.displayMode}>{item.displayMode === 'list' ? '列表模式' : '单一内容'}</DisplayModeBadge></Td>
                    <Td>
                      <ToggleSwitch>
                        <input
                          type="checkbox"
                          checked={item.isVisible}
                          onChange={() => handleToggleVisible(item)}
                        />
                        <span />
                      </ToggleSwitch>
                    </Td>
                    <TdActions>
                      <ActionButton onClick={() => openEditModal(item)} title="编辑">
                        <FaEdit />
                      </ActionButton>
                      {item.sectionType === 'custom' && (
                        item.contentCount > 0 ? (
                          <ActionButton
                            title={`该板块下有 ${item.contentCount} 条内容，无法删除`}
                            style={{ opacity: 0.3, cursor: 'not-allowed' }}
                          >
                            <FaTrash />
                          </ActionButton>
                        ) : (
                          <ActionButton
                            danger
                            onClick={() => handleDelete(item.id)}
                            title="删除"
                          >
                            <FaTrash />
                          </ActionButton>
                        )
                      )}
                    </TdActions>
                  </tr>
                ))}
              </tbody>
            </Table>
            </TableWrapper>
            <AdminPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </Card>

      {/* 添加/编辑板块弹窗 */}
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
              <ModalTitle>{editingSection ? '编辑板块' : '添加板块'}</ModalTitle>
              <CloseButton onClick={() => setModalOpen(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <FormGroup>
              <Label>板块名称 *</Label>
              <Input 
                name="name" 
                value={formData.name} 
                onChange={handleNameChange} 
                placeholder="例如：我的作品集" 
              />
            </FormGroup>

            <FormGroup>
              <Label>板块标识 *</Label>
              <Input 
                name="slug" 
                value={formData.slug} 
                onChange={handleFormChange} 
                placeholder="例如：my-portfolio（用于URL和引用）" 
                disabled={editingSection?.sectionType === 'builtin'}
              />
              <HelpText>只能包含字母、数字、中文和连字符</HelpText>
            </FormGroup>

            {/* 新增时：内容类型由后端自动分配，无需手动选择 */}
            {!editingSection && (
              <FormGroup>
                <Label>内容类型</Label>
                <Input value="自动分配（独立内容空间）" disabled />
                <HelpText>每个自定义板块拥有独立的内容空间，互不干扰</HelpText>
              </FormGroup>
            )}

            {/* 编辑时显示内容类型（只读） */}
            {editingSection && (
              <FormGroup>
                <Label>内容类型</Label>
                <Input value={formData.contentType} disabled />
              </FormGroup>
            )}

            <FormGroup>
              <Label>展示模式 *</Label>
              <Select name="displayMode" value={formData.displayMode} onChange={handleFormChange}>
                <option value="list">列表模式 - 以卡片网格形式展示多项内容</option>
                <option value="single">单一内容模式 - 以详情页样式展示单个内容</option>
              </Select>
              <HelpText>
                {formData.displayMode === 'list' 
                  ? '列表模式：内容以卡片形式排列，支持分页' 
                  : '单一内容模式：类似博客详情页样式，适合展示长文本内容'}
              </HelpText>
            </FormGroup>

            <FormGroup>
              <Label>板块描述</Label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="板块的简要描述..."
              />
            </FormGroup>

            <FormGroup>
              <Label>板块图标</Label>
              <IconGrid>
                {AVAILABLE_ICONS.map(icon => (
                  <IconOption
                    key={icon.name}
                    selected={formData.icon === icon.name}
                    onClick={() => handleIconSelect(icon.name)}
                    title={icon.name}
                  >
                    {icon.component}
                  </IconOption>
                ))}
              </IconGrid>
            </FormGroup>

            {/* 列表模式配置 */}
            {formData.displayMode === 'list' && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1rem 0', paddingTop: '1rem' }}>
                <Label style={{ marginBottom: '0.75rem', display: 'block' }}>列表布局配置</Label>
                <ConfigGrid>
                  <FormGroup>
                    <Label>列数</Label>
                    <Select name="config.columns" value={formData.config.columns} onChange={handleFormChange}>
                      <option value={2}>2 列</option>
                      <option value={3}>3 列</option>
                      <option value={4}>4 列</option>
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label>每页行数</Label>
                    <Select name="config.rows" value={formData.config.rows} onChange={handleFormChange}>
                      <option value={2}>2 行</option>
                      <option value={3}>3 行</option>
                      <option value={4}>4 行</option>
                      <option value={5}>5 行</option>
                    </Select>
                  </FormGroup>
                </ConfigGrid>
              </div>
            )}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1rem 0', paddingTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                <input
                  type="checkbox"
                  name="isVisible"
                  checked={formData.isVisible}
                  onChange={handleFormChange}
                  style={{ width: '18px', height: '18px', accentColor: '#00d4ff' }}
                />
                显示此板块
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  name="requireLogin"
                  checked={formData.requireLogin}
                  onChange={handleFormChange}
                  style={{ width: '18px', height: '18px', accentColor: '#00d4ff' }}
                />
                需要登录才能查看
              </label>
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

export default SectionManagement;
