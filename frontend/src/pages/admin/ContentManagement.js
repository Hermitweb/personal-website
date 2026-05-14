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
  FaHome,
  FaUpload,
  FaSpinner
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import AdminPagination from '../../components/AdminPagination';
import MarkdownEditor from '../../components/MarkdownEditor';

// ============ 样式组件 ============

// 旋转动画
const spinKeyframes = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

// 注入旋转动画样式
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = '.spin-icon { animation: spin 1s linear infinite; display: inline-block; }' + spinKeyframes;
  if (!document.querySelector('#spin-animation-style')) {
    styleEl.id = 'spin-animation-style';
    document.head.appendChild(styleEl);
  }
}

// 固定顶部容器 - 包含标题、按钮和搜索筛选
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

const EditHomeButton = (props) => (
  <motion.button
    onClick={props.onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      background: 'rgba(231, 76, 60, 0.2)',
      color: '#e74c3c',
      borderRadius: '12px',
      fontWeight: 600,
      border: '1px solid rgba(231, 76, 60, 0.4)',
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

// 操作列固定在右侧
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
      case 'hero': return 'rgba(231, 76, 60, 0.2)';
      case 'about': return 'rgba(155, 89, 182, 0.2)';
      case 'skill': return 'rgba(52, 152, 219, 0.2)';
      case 'project': return 'rgba(230, 126, 34, 0.2)';
      case 'contact': return 'rgba(26, 188, 156, 0.2)';
      case 'bookmark': return 'rgba(243, 156, 18, 0.2)';
      default: return 'rgba(0, 212, 255, 0.2)';
    }
  }};
  color: ${props => {
    switch(props.type) {
      case 'hero': return '#e74c3c';
      case 'about': return '#9b59b6';
      case 'skill': return '#3498db';
      case 'project': return '#e67e22';
      case 'contact': return '#1abc9c';
      case 'bookmark': return '#f39c12';
      default: return '#00d4ff';
    }
  }};
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

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
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

// 图片上传样式
const ImageUploadArea = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00d4ff;
  }
`;

const ImageUploadLabel = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 0.95rem;

  svg {
    font-size: 2rem;
    color: #00d4ff;
  }

  &:hover {
    color: rgba(255, 255, 255, 0.9);
  }
`;

const ImagePreviewWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const ImagePreview = styled.img`
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  object-fit: cover;
`;

const ImageRemoveButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e74c3c;
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;

  &:hover {
    background: #c0392b;
  }
`;

const HelpText = styled.p`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.5rem;
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

// 板块类型中文映射
const typeLabels = {
  hero: '🏠 首页',
  about: '👤 简介',
  skill: '⚡ 技能',
  project: '📦 项目',
  contact: '📞 联系',
  bookmark: '🔖 站点收藏',
  custom: '🔧 自定义'
};

// 获取类型显示名称（支持自定义板块）
const getTypeLabel = (type, sections) => {
  if (typeLabels[type]) return typeLabels[type];
  const section = sections.find(s => s.contentType === type);
  return section ? `🧩 ${section.name}` : type;
};

const PAGE_SIZE = 10;

// ============ ContentManagement 组件 ============

const ContentManagement = () => {
  const [contents, setContents] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    content: '',
    linkUrl: '',
    isVisible: true
  });
  
  // Hero 编辑表单数据
  const [heroFormData, setHeroFormData] = useState({
    siteTitle: 'MyPortfolio',
    siteLogo: '',
    avatar: '',
    title: '欢迎来到我的世界',
    subtitle: '全栈开发者 · 设计师 · 创造者',
    description: '热爱技术，追求创新，致力于创造优秀的数字体验。在这里，你可以了解我的技能、项目和联系方式。',
    tags: ['🎨 全栈开发', '🚀 性能优化', '✨ UI/UX设计', '💡 创新思维'],
    githubUrl: 'https://github.com',
    linkedinUrl: 'https://linkedin.com',
    email: 'mailto:email@example.com',
    primaryButtonText: '查看项目',
    primaryButtonLink: '#projects',
    secondaryButtonText: '联系我',
    secondaryButtonLink: '#contact',
    isVisible: true
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // 过滤后的内容（排除 Hero 配置）
  const filteredContents = contents.filter(item => {
    if (item.type === 'hero') return false;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // 分页
  const totalPages = Math.ceil(filteredContents.length / PAGE_SIZE);
  const paginatedContents = filteredContents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // 搜索或筛选变化时重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const [contentsRes, sectionsRes] = await Promise.all([
        axios.get('/api/contents/admin/all'),
        axios.get('/api/sections/admin/all').catch(() => ({ data: [] }))
      ]);
      setContents(contentsRes.data);
      setSections(sectionsRes.data);
    } catch (error) {
      toast.error('获取内容失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除此内容吗？')) return;
    try {
      await axios.delete(`/api/contents/${id}`);
      toast.success('删除成功');
      fetchContents();
    } catch (error) {
      toast.error('删除失败');
    }
  };

  // 切换显示/隐藏
  const handleToggleVisible = async (item) => {
    try {
      await axios.put(`/api/contents/${item.id}`, { isVisible: !item.isVisible });
      toast.success(item.isVisible ? '已隐藏' : '已显示');
      fetchContents();
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const openAddModal = () => {
    setEditingContent(null);
    setFormData({ title: '', type: '', content: '', linkUrl: '', imageUrl: '', isVisible: true });
    setModalOpen(true);
  };

  // 编辑首页 Hero
  const openEditHero = () => {
    const heroContent = contents.find(c => c.type === 'hero');
    if (heroContent) {
      try {
        const heroData = heroContent.content ? JSON.parse(heroContent.content) : {};
        setHeroFormData({
          siteTitle: heroData.siteTitle || 'MyPortfolio',
          siteLogo: heroData.siteLogo || '',
          avatar: heroData.avatar || '',
          title: heroData.title || '欢迎来到我的世界',
          subtitle: heroData.subtitle || '全栈开发者 · 设计师 · 创造者',
          description: heroData.description || '热爱技术，追求创新，致力于创造优秀的数字体验。',
          tags: heroData.tags || ['🎨 全栈开发', '🚀 性能优化', '✨ UI/UX设计', '💡 创新思维'],
          githubUrl: heroData.socialLinks?.github || 'https://github.com',
          linkedinUrl: heroData.socialLinks?.linkedin || 'https://linkedin.com',
          email: heroData.socialLinks?.email || 'mailto:email@example.com',
          primaryButtonText: heroData.buttons?.primary?.text || '查看项目',
          primaryButtonLink: heroData.buttons?.primary?.link || '#projects',
          secondaryButtonText: heroData.buttons?.secondary?.text || '联系我',
          secondaryButtonLink: heroData.buttons?.secondary?.link || '#contact',
          isVisible: heroContent.isVisible
        });
        setEditingContent(heroContent);
        setHeroModalOpen(true);
      } catch (e) {
        toast.error('解析首页数据失败');
      }
    } else {
      // 使用默认值创建新的 hero 内容
      setHeroFormData({
        siteTitle: 'MyPortfolio',
        siteLogo: '',
        avatar: '',
        title: '欢迎来到我的世界',
        subtitle: '全栈开发者 · 设计师 · 创造者',
        description: '热爱技术，追求创新，致力于创造优秀的数字体验。在这里，你可以了解我的技能、项目和联系方式。',
        tags: ['🎨 全栈开发', '🚀 性能优化', '✨ UI/UX设计', '💡 创新思维'],
        githubUrl: 'https://github.com',
        linkedinUrl: 'https://linkedin.com',
        email: 'mailto:email@example.com',
        primaryButtonText: '查看项目',
        primaryButtonLink: '#projects',
        secondaryButtonText: '联系我',
        secondaryButtonLink: '#contact',
        isVisible: true
      });
      setEditingContent(null);
      setHeroModalOpen(true);
    }
  };

  const openEditModal = (content) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      type: content.type,
      content: content.content || '',
      linkUrl: content.linkUrl || '',
      imageUrl: content.imageUrl || '',
      metadata: content.metadata || {},
      isVisible: content.isVisible
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

  const handleHeroFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHeroFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleHeroTagsChange = (index, value) => {
    setHeroFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  // 图片上传状态
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleImageUpload = async (file, fieldName) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    if (fieldName === 'siteLogo') setUploadingLogo(true);
    else setUploadingAvatar(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      const imageUrl = res.data.url; // /uploads/image-xxx.jpg
      setHeroFormData(prev => ({
        ...prev,
        [fieldName]: imageUrl
      }));
      toast.success('上传成功');
    } catch (error) {
      toast.error('上传失败: ' + (error.response?.data?.message || error.message));
    } finally {
      if (fieldName === 'siteLogo') setUploadingLogo(false);
      else setUploadingAvatar(false);
    }
  };

  // 内容图片上传
  const [uploadingContentImage, setUploadingContentImage] = useState(false);

  const handleContentImageUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploadingContentImage(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      const imageUrl = res.data.url;
      setFormData(prev => ({
        ...prev,
        imageUrl: imageUrl
      }));
      toast.success('图片上传成功');
    } catch (error) {
      toast.error('上传失败: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingContentImage(false);
    }
  };

  const handleSaveHero = async () => {
    if (!heroFormData.title.trim()) {
      toast.error('主标题不能为空');
      return;
    }
    setSaving(true);
    try {
      const heroData = {
        siteTitle: heroFormData.siteTitle,
        siteLogo: heroFormData.siteLogo,
        avatar: heroFormData.avatar,
        title: heroFormData.title,
        subtitle: heroFormData.subtitle,
        description: heroFormData.description,
        tags: heroFormData.tags,
        socialLinks: {
          github: heroFormData.githubUrl,
          linkedin: heroFormData.linkedinUrl,
          email: heroFormData.email
        },
        buttons: {
          primary: { text: heroFormData.primaryButtonText, link: heroFormData.primaryButtonLink },
          secondary: { text: heroFormData.secondaryButtonText, link: heroFormData.secondaryButtonLink }
        }
      };
      
      const payload = {
        title: '首页 Hero 配置',
        type: 'hero',
        content: JSON.stringify(heroData),
        isVisible: heroFormData.isVisible
      };
      
      if (editingContent) {
        await axios.put(`/api/contents/${editingContent.id}`, payload);
        toast.success('首页配置更新成功');
      } else {
        await axios.post('/api/contents', payload);
        toast.success('首页配置创建成功');
      }
      setHeroModalOpen(false);
      fetchContents();
    } catch (error) {
      const msg = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || '操作失败';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!editingContent && !formData.type) {
      toast.error('请选择内容类型');
      return;
    }
    const isCustomSection = formData.type?.startsWith('section_');
    if (isCustomSection) {
      // 自定义板块：标题、内容、封面图至少填一个
      if (!formData.title.trim() && !formData.content.trim() && !formData.imageUrl) {
        toast.error('标题、内容、封面图至少需要填写一个');
        return;
      }
    } else {
      // 非自定义板块：标题和内容必填
      if (!formData.title.trim()) {
        toast.error('标题不能为空');
        return;
      }
      if (!formData.content.trim()) {
        toast.error('内容不能为空');
        return;
      }
    }
    setSaving(true);
    try {
      if (editingContent) {
        await axios.put(`/api/contents/${editingContent.id}`, formData);
        toast.success('更新成功');
      } else {
        await axios.post('/api/contents', formData);
        toast.success('添加成功');
      }
      setModalOpen(false);
      fetchContents();
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
          <Title>内容管理</Title>
          <HeaderButtons>
            <EditHomeButton onClick={openEditHero}>
              <FaHome /> 编辑首页
            </EditHomeButton>
            <AddButton onClick={openAddModal}>
              <FaPlus /> 添加内容
            </AddButton>
          </HeaderButtons>
        </Header>
        <FilterBar>
          <SearchWrapper>
            <FaSearch />
            <SearchInput
              type="text"
              placeholder="搜索标题或内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchWrapper>
          <FilterSelect value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">全部类型</option>
            <option value="skill">技能</option>
            <option value="project">项目</option>
            <option value="bookmark">站点收藏</option>
            {sections.filter(s => s.sectionType === 'custom').map(s => (
              <option key={s.slug} value={s.contentType}>{s.name}</option>
            ))}
          </FilterSelect>
        </FilterBar>
      </StickyHeader>

      <Card>
        <ResultCount>共 {filteredContents.length} 条结果</ResultCount>

        {paginatedContents.length === 0 ? (
          <EmptyState>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>暂无内容</p>
            <p>点击「添加内容」按钮创建新内容</p>
          </EmptyState>
        ) : (
          <>
            <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>标题</Th>
                  <Th>类型</Th>
                  <Th>显示</Th>
                  <Th>创建时间</Th>
                  <Th>操作</Th>
                </tr>
              </thead>
              <tbody>
                {paginatedContents.map(item => (
                  <tr key={item.id}>
                    <Td>{item.title}</Td>
                    <Td><Badge type={item.type}>{getTypeLabel(item.type, sections)}</Badge></Td>
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
                    <Td>{new Date(item.createdAt).toLocaleDateString()}</Td>
                    <TdActions>
                      <ActionButton onClick={() => openEditModal(item)} title="编辑">
                        <FaEdit />
                      </ActionButton>
                      <ActionButton
                        danger
                        onClick={() => handleDelete(item.id)}
                        title="删除"
                      >
                        <FaTrash />
                      </ActionButton>
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

      {/* 添加/编辑内容弹窗 */}
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
              <ModalTitle>{editingContent ? '编辑内容' : '添加内容'}</ModalTitle>
              <CloseButton onClick={() => setModalOpen(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            {/* 新增时：顶部类型选择 */}
            {!editingContent && (
              <FormGroup>
                <Label>选择内容类型 *</Label>
                <Select name="type" value={formData.type} onChange={handleFormChange}>
                  <option value="">请选择要添加的内容类型</option>
                  <option value="skill">⚡ 技能展示</option>
                  <option value="project">📦 项目作品</option>
                  <option value="bookmark">🔖 站点收藏</option>
                  {sections.filter(s => s.sectionType === 'custom').map(s => (
                    <option key={s.slug} value={s.contentType}>🧩 {s.name}</option>
                  ))}
                </Select>
              </FormGroup>
            )}

            {/* 编辑时：类型只读 */}
            {editingContent && (
              <FormGroup>
                <Label>类型</Label>
                <Input
                  value={getTypeLabel(formData.type, sections)}
                  disabled
                />
              </FormGroup>
            )}

            <FormGroup>
              <Label>标题 *</Label>
              <Input name="title" value={formData.title} onChange={handleFormChange} placeholder="请输入标题" />
            </FormGroup>

            <FormGroup>
              <Label>内容</Label>
              {formData.type?.startsWith('section_') ? (
                <>
                  <MarkdownEditor
                    value={formData.content || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                    placeholder="在此输入富文本内容，支持 Markdown 格式..."
                    height={350}
                  />
                  <HelpText>支持 Markdown 格式，可插入图片、链接、表格等</HelpText>
                </>
              ) : (
                <TextArea
                  name="content"
                  value={formData.content}
                  onChange={handleFormChange}
                  placeholder={formData.type === 'bookmark' ? '请输入站点描述或备注' : '支持换行，每行一段'}
                  style={{ minHeight: '150px' }}
                />
              )}
            </FormGroup>

            {/* 站点收藏额外字段 */}
            {formData.type === 'bookmark' && (
              <FormGroup>
                <Label>站点链接 URL *</Label>
                <Input
                  name="linkUrl"
                  value={formData.linkUrl || ''}
                  onChange={handleFormChange}
                  placeholder="https://example.com"
                />
              </FormGroup>
            )}

            {/* 图片上传 - 技能、项目、自定义板块列表模式 */}
            {(formData.type === 'skill' || formData.type === 'project' || formData.type?.startsWith('section_')) && (
              <FormGroup>
                <Label>封面图片</Label>
                <ImageUploadArea>
                  {formData.imageUrl ? (
                    <ImagePreviewWrapper>
                      <ImagePreview src={formData.imageUrl} alt="预览" />
                      <ImageRemoveButton onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}>
                        <FaTimes />
                      </ImageRemoveButton>
                    </ImagePreviewWrapper>
                  ) : (
                    <ImageUploadLabel>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleContentImageUpload(e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                      <FaUpload />
                      <span>点击上传图片</span>
                    </ImageUploadLabel>
                  )}
                </ImageUploadArea>
                <HelpText>支持 JPG、PNG、GIF 格式，建议尺寸 800x600</HelpText>

                {/* 图片显示位置设置 */}
                {formData.imageUrl && (
                  <FormGroup style={{ marginTop: '1rem', marginBottom: 0 }}>
                    <Label>图片显示位置</Label>
                    <Select
                      value={formData.metadata?.imagePosition || 'center'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata, imagePosition: e.target.value, imagePositionCustom: '' }
                      }))}
                    >
                      <option value="top">顶部（显示上方）</option>
                      <option value="center">居中（显示中间）</option>
                      <option value="bottom">底部（显示下方）</option>
                      <option value="custom">自定义位置</option>
                    </Select>
                    {formData.metadata?.imagePosition === 'custom' && (
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={parseInt(formData.metadata?.imagePositionCustom) || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              metadata: { ...prev.metadata, imagePositionCustom: e.target.value }
                            }))}
                            placeholder="0"
                            style={{ textAlign: 'center' }}
                          />
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          % 从顶部偏移
                        </span>
                      </div>
                    )}
                    <HelpText>控制图片在区域内的显示位置（高度由系统根据内容自动计算）</HelpText>
                  </FormGroup>
                )}
              </FormGroup>
            )}

            {/* 项目类型额外字段 */}
            {formData.type === 'project' && (
              <>
                <FormGroup>
                  <Label>演示链接 URL</Label>
                  <Input
                    name="linkUrl"
                    value={formData.linkUrl || ''}
                    onChange={handleFormChange}
                    placeholder="https://demo.example.com"
                  />
                  <HelpText>项目演示页面的链接，前台会显示"演示"按钮</HelpText>
                </FormGroup>
                <FormGroup>
                  <Label>GitHub 源码链接</Label>
                  <Input
                    value={formData.metadata?.githubUrl || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata, githubUrl: e.target.value }
                    }))}
                    placeholder="https://github.com/username/repo"
                  />
                  <HelpText>项目源码仓库链接，前台会显示"源码"按钮</HelpText>
                </FormGroup>
              </>
            )}

            <FormGroup>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  name="isVisible"
                  checked={formData.isVisible}
                  onChange={handleFormChange}
                  style={{ width: '18px', height: '18px', accentColor: '#00d4ff' }}
                />
                显示此内容
              </label>
            </FormGroup>

            <ButtonGroup>
              <CancelButton onClick={() => setModalOpen(false)}>取消</CancelButton>
              <SaveButton onClick={handleSave} disabled={saving || (!editingContent && !formData.type)}>
                <FaSave /> {saving ? '保存中...' : '保存'}
              </SaveButton>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>,
        document.body
      )}

      {/* Hero 首页编辑弹窗 */}
      {heroModalOpen && ReactDOM.createPortal(
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setHeroModalOpen(false)}
        >
          <ModalContent
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '800px', maxHeight: '90vh' }}
          >
            <ModalHeader>
              <ModalTitle>编辑首页配置</ModalTitle>
              <CloseButton onClick={() => setHeroModalOpen(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* 网站标题 */}
              <FormGroup>
                <Label>导航栏网站标题</Label>
                <Input name="siteTitle" value={heroFormData.siteTitle} onChange={handleHeroFormChange} placeholder="MyPortfolio" />
              </FormGroup>

              {/* 网站 Logo */}
              <FormGroup>
                <Label>网站 Logo</Label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Input 
                    name="siteLogo" 
                    value={heroFormData.siteLogo} 
                    onChange={handleHeroFormChange} 
                    placeholder="图片链接地址或点击上传" 
                    style={{ flex: 1 }} 
                  />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="logo-upload-input"
                    onChange={(e) => {
                      if (e.target.files[0]) handleImageUpload(e.target.files[0], 'siteLogo');
                      e.target.value = '';
                    }}
                  />
                  <label
                    htmlFor="logo-upload-input"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '42px',
                      height: '42px',
                      background: uploadingLogo ? 'rgba(0,212,255,0.3)' : 'rgba(0,212,255,0.15)',
                      border: '1px solid rgba(0,212,255,0.4)',
                      borderRadius: '10px',
                      cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      color: '#00d4ff'
                    }}
                    title="上传图片"
                  >
                    {uploadingLogo ? <FaSpinner className="spin-icon" /> : <FaUpload />}
                  </label>
                </div>
                {heroFormData.siteLogo && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img 
                      src={heroFormData.siteLogo} 
                      alt="Logo 预览" 
                      style={{ maxWidth: '100px', maxHeight: '40px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </FormGroup>
            </div>

            {/* 头像 */}
            <FormGroup>
              <Label>头像</Label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Input 
                  name="avatar" 
                  value={heroFormData.avatar} 
                  onChange={handleHeroFormChange} 
                  placeholder="图片链接地址或点击上传" 
                  style={{ flex: 1 }} 
                />
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="avatar-upload-input"
                  onChange={(e) => {
                    if (e.target.files[0]) handleImageUpload(e.target.files[0], 'avatar');
                    e.target.value = '';
                  }}
                />
                <label
                  htmlFor="avatar-upload-input"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '42px',
                    height: '42px',
                    background: uploadingAvatar ? 'rgba(0,212,255,0.3)' : 'rgba(0,212,255,0.15)',
                    border: '1px solid rgba(0,212,255,0.4)',
                    borderRadius: '10px',
                    cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    color: '#00d4ff'
                  }}
                  title="上传图片"
                >
                  {uploadingAvatar ? <FaSpinner className="spin-icon" /> : <FaUpload />}
                </label>
              </div>
              {heroFormData.avatar && (
                <div style={{ marginTop: '0.5rem' }}>
                  <img 
                    src={heroFormData.avatar} 
                    alt="头像预览" 
                    style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid rgba(102,126,234,0.5)', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </FormGroup>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* 主标题 */}
              <FormGroup>
                <Label>主标题 *</Label>
                <Input name="title" value={heroFormData.title} onChange={handleHeroFormChange} placeholder="欢迎来到我的世界" />
              </FormGroup>

              {/* 副标题 */}
              <FormGroup>
                <Label>副标题</Label>
                <Input name="subtitle" value={heroFormData.subtitle} onChange={handleHeroFormChange} placeholder="全栈开发者 · 设计师 · 创造者" />
              </FormGroup>
            </div>

            {/* 描述 */}
            <FormGroup>
              <Label>描述</Label>
              <TextArea name="description" value={heroFormData.description} onChange={handleHeroFormChange} placeholder="个人简介描述" style={{ minHeight: '80px' }} />
            </FormGroup>

            {/* 标签 */}
            <FormGroup>
              <Label>标签（4个）</Label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {heroFormData.tags.map((tag, index) => (
                  <Input key={index} value={tag} onChange={(e) => handleHeroTagsChange(index, e.target.value)} placeholder={`标签 ${index + 1}`} />
                ))}
              </div>
            </FormGroup>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1rem 0', paddingTop: '1rem' }}>
              <Label style={{ marginBottom: '0.75rem', display: 'block' }}>社交链接</Label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <Input name="githubUrl" value={heroFormData.githubUrl} onChange={handleHeroFormChange} placeholder="GitHub URL" />
                <Input name="linkedinUrl" value={heroFormData.linkedinUrl} onChange={handleHeroFormChange} placeholder="LinkedIn URL" />
                <Input name="email" value={heroFormData.email} onChange={handleHeroFormChange} placeholder="邮箱链接" />
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1rem 0', paddingTop: '1rem' }}>
              <Label style={{ marginBottom: '0.75rem', display: 'block' }}>按钮配置</Label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <Label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>主按钮</Label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Input name="primaryButtonText" value={heroFormData.primaryButtonText} onChange={handleHeroFormChange} placeholder="按钮文字" style={{ flex: 1 }} />
                    <Input name="primaryButtonLink" value={heroFormData.primaryButtonLink} onChange={handleHeroFormChange} placeholder="链接" style={{ flex: 1 }} />
                  </div>
                </div>
                <div>
                  <Label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>次按钮</Label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Input name="secondaryButtonText" value={heroFormData.secondaryButtonText} onChange={handleHeroFormChange} placeholder="按钮文字" style={{ flex: 1 }} />
                    <Input name="secondaryButtonLink" value={heroFormData.secondaryButtonLink} onChange={handleHeroFormChange} placeholder="链接" style={{ flex: 1 }} />
                  </div>
                </div>
              </div>
            </div>

            <FormGroup>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  name="isVisible"
                  checked={heroFormData.isVisible}
                  onChange={handleHeroFormChange}
                  style={{ width: '18px', height: '18px', accentColor: '#00d4ff' }}
                />
                显示首页内容
              </label>
            </FormGroup>

            <ButtonGroup>
              <CancelButton onClick={() => setHeroModalOpen(false)}>取消</CancelButton>
              <SaveButton onClick={handleSaveHero} disabled={saving}>
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

export default ContentManagement;
