import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { compressImage, validateImage } from '../utils/imageCompression';
import {
  FaHome,
  FaUsers,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaEnvelope,
  FaBlog,
  FaChartLine,
  FaToggleOn,
  FaDatabase,
  FaUpload,
  FaUser,
  FaLock,
  FaEnvelopeOpen
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// ============ 通用样式组件 ============

const AdminContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #0a0a0a;
`;

const Sidebar = styled.aside`
  width: 260px;
  background: rgba(255, 255, 255, 0.03);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem 0;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
`;

const Logo = styled.div`
  padding: 0 1.5rem 2rem;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1.5rem;
`;

const Nav = styled.nav`
  padding: 0 1rem;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  color: ${props => props.active ? '#00d4ff' : 'rgba(255, 255, 255, 0.7)'};
  background: ${props => props.active ? 'rgba(0, 212, 255, 0.1)' : 'transparent'};
  border-radius: 12px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    background: rgba(0, 212, 255, 0.1);
    color: #00d4ff;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  color: rgba(255, 255, 255, 0.7);
  background: transparent;
  border-radius: 12px;
  margin: 1rem;
  transition: all 0.3s ease;
  font-weight: 500;
  width: calc(100% - 2rem);

  &:hover {
    background: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 260px;
  padding: 2rem;
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

// AddButton - 包装组件模式
const AddButtonStyled = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
  color: #000;
  border-radius: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 212, 255, 0.4);
  }
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

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background: ${props => props.active ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)'};
  color: ${props => props.active ? '#2ecc71' : '#e74c3c'};
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

// ============ 弹窗样式 ============

// ModalOverlay - 包装组件模式
const ModalOverlayStyled = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

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

// ModalContent - 包装组件模式
const ModalContentStyled = styled.div`
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  overflow-y: auto;
`;

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

const Form = styled.form`
  padding: 1rem 0;
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

const ToggleSwitch = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const ToggleButton = styled.button`
  width: 50px;
  height: 28px;
  border-radius: 14px;
  background: ${props => props.enabled ? 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)' : 'rgba(255, 255, 255, 0.1)'};
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    top: 3px;
    left: ${props => props.enabled ? '25px' : '3px'};
    transition: all 0.3s ease;
  }
`;

const ToggleInfo = styled.div`
  flex: 1;
`;

const ToggleTitle = styled.div`
  color: #fff;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const ToggleDesc = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    border-color: ${props => props.borderColor || 'rgba(0, 212, 255, 0.3)'};
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.gradient || 'linear-gradient(90deg, #00d4ff, #7c3aed)'};
  }
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.bgColor || 'rgba(0, 212, 255, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.color || '#00d4ff'};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
`;

const StatTrend = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
`;

const ChartRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled(Card)`
  min-height: 300px;
`;

const ChartTitle = styled.h3`
  color: #fff;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PieChartContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
`;

const PieChart = styled.div`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: conic-gradient(
    #00d4ff 0% ${props => props.percents?.[0] || 0}%,
    #7c3aed ${props => props.percents?.[0] || 0}% ${props => (props.percents?.[0] || 0) + (props.percents?.[1] || 0)}%,
    #10b981 ${props => (props.percents?.[0] || 0) + (props.percents?.[1] || 0)}% ${props => (props.percents?.[0] || 0) + (props.percents?.[1] || 0) + (props.percents?.[2] || 0)}%,
    #f59e0b ${props => (props.percents?.[0] || 0) + (props.percents?.[1] || 0) + (props.percents?.[2] || 0)}% ${props => (props.percents?.[0] || 0) + (props.percents?.[1] || 0) + (props.percents?.[2] || 0) + (props.percents?.[3] || 0)}%,
    #e74c3c ${props => (props.percents?.[0] || 0) + (props.percents?.[1] || 0) + (props.percents?.[2] || 0) + (props.percents?.[3] || 0)}% 100%
  );
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    background: #1a1a2e;
    border-radius: 50%;
  }
`;

const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: ${props => props.color};
`;

const LegendValue = styled.span`
  margin-left: auto;
  font-weight: 600;
  color: #fff;
`;

const BarChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BarItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BarLabel = styled.div`
  width: 80px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
`;

const BarTrack = styled.div`
  flex: 1;
  height: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
`;

// BarFill - 包装组件模式
const BarFillStyled = styled.div`
  height: 100%;
  background: ${props => props.gradient || 'linear-gradient(90deg, #00d4ff, #7c3aed)'};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  color: #000;
  font-weight: 600;
  font-size: 0.8rem;
`;

const BarFill = (props) => (
  <motion.div
    initial={props.initial}
    animate={props.animate}
    transition={props.transition}
    style={{
      height: '100%',
      background: props.gradient || 'linear-gradient(90deg, #00d4ff, #7c3aed)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: '10px',
      color: '#000',
      fontWeight: 600,
      fontSize: '0.8rem'
    }}
  >
    {props.children}
  </motion.div>
);

const ActivityTimeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  border-left: 3px solid ${props => props.color || '#00d4ff'};
`;

const ActivityIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${props => props.bgColor || 'rgba(0, 212, 255, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color || '#00d4ff'};
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  color: #fff;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
`;

const ActivityTime = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 1rem;

  &:hover {
    background: rgba(0, 212, 255, 0.2);
    border-color: rgba(0, 212, 255, 0.5);
  }
`;

const ChartContainer = styled.div`
  height: 200px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 1rem 0;
`;

const ChartBar = styled.div`
  flex: 1;
  background: linear-gradient(to top, #00d4ff, #7c3aed);
  border-radius: 4px 4px 0 0;
  height: ${props => props.height}%;
  min-height: 10px;
  transition: height 0.3s ease;
`;

// 板块类型中文映射
const typeLabels = {
  hero: '🏠 首页',
  about: '👤 简介',
  skill: '⚡ 技能',
  project: '📦 项目',
  contact: '📞 联系',
  custom: '🔧 自定义',
  admin: '👑 管理员',
  user: '👤 用户'
};

// ============ 博客管理组件 ============

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [saving, setSaving] = useState(false);

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
      <Header>
        <Title>博客管理</Title>
        <AddButton whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAddModal}>
          <FaPlus /> 发布文章
        </AddButton>
      </Header>

      <Card>
        {blogs.length === 0 ? (
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
              {blogs.map(blog => (
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
      </Card>

      <AnimatePresence>
        {modalOpen && (
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
          </ModalOverlay>
        )}
      </AnimatePresence>
    </>
  );
};

// ============ 功能开关组件 ============

const FeatureManagement = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const response = await axios.get('/api/features');
      setFeatures(response.data);
    } catch (error) {
      toast.error('获取功能配置失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = async (featureName, currentStatus) => {
    try {
      await axios.put(`/api/features/${featureName}`, {
        enabled: !currentStatus
      });
      toast.success('状态更新成功');
      fetchFeatures();
    } catch (error) {
      toast.error('更新失败');
    }
  };

  const featureLabels = {
    blog: { title: '博客系统', desc: '启用后显示博客文章列表和详情页' },
    messageBoard: { title: '留言板', desc: '启用后访客可以公开发布留言' },
    visitorStats: { title: '访客统计', desc: '启用后记录访客信息和访问数据' },
    search: { title: '全站搜索', desc: '启用后可以搜索文章和内容' },
    multiLanguage: { title: '多语言支持', desc: '启用后支持中英文切换' },
    pwa: { title: 'PWA 支持', desc: '启用后支持离线访问和安装到桌面' },
    themeToggle: { title: '主题切换', desc: '启用后支持暗色/亮色主题切换' },
    projectDetail: { title: '项目详情页', desc: '启用后项目卡片可点击查看详情' }
  };

  if (loading) return <div style={{ color: '#fff' }}>加载中...</div>;

  return (
    <>
      <Header>
        <Title>功能开关</Title>
      </Header>

      <Card>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
          在这里可以开启或关闭网站的各项功能，关闭后前台将不显示相关入口。
        </p>

        {features.map(feature => {
          const info = featureLabels[feature.feature] || { title: feature.feature, desc: '' };
          return (
            <ToggleSwitch key={feature.id}>
              <ToggleButton
                enabled={feature.enabled}
                onClick={() => toggleFeature(feature.feature, feature.enabled)}
              />
              <ToggleInfo>
                <ToggleTitle>{info.title}</ToggleTitle>
                <ToggleDesc>{info.desc}</ToggleDesc>
              </ToggleInfo>
              <StatusBadge active={feature.enabled}>
                {feature.enabled ? '已启用' : '已禁用'}
              </StatusBadge>
            </ToggleSwitch>
          );
        })}
      </Card>
    </>
  );
};

// ============ 访客统计组件 ============

const VisitorStats = () => {
  const [stats, setStats] = useState({
    totalVisits: 0,
    uniqueVisitors: 0,
    todayVisits: 0,
    pageViews: [],
    dailyStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/visitors/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ color: '#fff' }}>加载中...</div>;

  const maxDaily = Math.max(...(stats.dailyStats?.map(d => d.count) || [1]), 1);

  return (
    <>
      <Header>
        <Title>访客统计</Title>
      </Header>

      <StatGrid>
        <StatCard>
          <StatValue color="#00d4ff">{stats.totalVisits}</StatValue>
          <StatLabel>总访问量</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue color="#7c3aed">{stats.uniqueVisitors}</StatValue>
          <StatLabel>独立访客</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue color="#10b981">{stats.todayVisits}</StatValue>
          <StatLabel>今日访问</StatLabel>
        </StatCard>
      </StatGrid>

      <Card>
        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>近7天访问趋势</h3>
        <ChartContainer>
          {(stats.dailyStats || []).map((day, index) => (
            <ChartBar key={index} height={(day.count / maxDaily) * 100} title={`${day.date}: ${day.count}次`} />
          ))}
        </ChartContainer>
        <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
          {(stats.dailyStats || []).map((day, index) => (
            <div key={index} style={{ flex: 1, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
              {day.date?.substring(5)}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>热门页面</h3>
        <Table>
          <thead>
            <tr>
              <Th>页面路径</Th>
              <Th>访问次数</Th>
            </tr>
          </thead>
          <tbody>
            {(stats.pageViews || []).map((page, index) => (
              <tr key={index}>
                <Td>{page.path}</Td>
                <Td>{page.count}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
};

// ============ 数据导出组件 ============

const DataExport = () => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExport = async (type) => {
    setExporting(true);
    try {
      let url = '/api/export/all';
      if (type === 'blogs') url = '/api/export/blogs';
      else if (type === 'contents') url = '/api/export/contents';
      else if (type === 'messages') url = '/api/export/messages';

      const response = await axios.get(url);
      const data = JSON.stringify(response.data, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `backup-${type}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      toast.success('导出成功');
    } catch (error) {
      toast.error('导出失败');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      await axios.post('/api/export/import', { data, overwrite: false });
      toast.success('导入成功');
    } catch (error) {
      toast.error(error.response?.data?.message || '导入失败');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <>
      <Header>
        <Title>数据备份</Title>
      </Header>

      <Card>
        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>导出数据</h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
          将网站数据导出为 JSON 文件，可用于备份或迁移。
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <ExportButton onClick={() => handleExport('all')} disabled={exporting}>
            <FaDatabase /> 导出全部数据
          </ExportButton>
          <ExportButton onClick={() => handleExport('blogs')} disabled={exporting}>
            <FaBlog /> 导出博客
          </ExportButton>
          <ExportButton onClick={() => handleExport('contents')} disabled={exporting}>
            <FaFileAlt /> 导出内容
          </ExportButton>
          <ExportButton onClick={() => handleExport('messages')} disabled={exporting}>
            <FaEnvelope /> 导出留言
          </ExportButton>
        </div>
      </Card>

      <Card>
        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>导入数据</h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
          从备份文件恢复数据，已存在的数据不会被覆盖。
        </p>
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          disabled={importing}
          style={{ color: '#fff' }}
        />
      </Card>
    </>
  );
};

// ============ 概览组件 ============

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalContents: 0,
    totalBlogs: 0,
    totalMessages: 0,
    todayVisits: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // 获取用户数据
      let totalUsers = 0;
      try {
        const usersRes = await axios.get('/api/users');
        totalUsers = Array.isArray(usersRes.data) ? usersRes.data.length : 0;
      } catch (e) { console.log('用户API错误:', e.message); }

      // 获取内容数据
      let totalContents = 0;
      try {
        const contentsRes = await axios.get('/api/contents/admin/all');
        totalContents = Array.isArray(contentsRes.data) ? contentsRes.data.length : 0;
      } catch (e) { console.log('内容API错误:', e.message); }

      // 获取博客数据
      let totalBlogs = 0;
      try {
        const blogsRes = await axios.get('/api/blogs/admin/all');
        totalBlogs = blogsRes.data?.blogs?.length || 0;
      } catch (e) { console.log('博客API错误:', e.message); }

      // 获取留言数据
      let totalMessages = 0;
      try {
        const messagesRes = await axios.get('/api/messages');
        totalMessages = messagesRes.data?.messages?.length || 0;
      } catch (e) { console.log('留言API错误:', e.message); }

      // 获取访客数据
      let todayVisits = 0;
      try {
        const visitorsRes = await axios.get('/api/visitors/stats');
        todayVisits = visitorsRes.data?.todayVisits || 0;
      } catch (e) { console.log('访客API错误:', e.message); }

      setStats({
        totalUsers,
        totalContents,
        totalBlogs,
        totalMessages,
        todayVisits
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 辅助函数：计算饼图百分比
  const calculatePercents = () => {
    const total = stats.totalUsers + stats.totalContents + stats.totalBlogs + stats.totalMessages + stats.todayVisits;
    if (total === 0) return [20, 20, 20, 20, 20];
    
    return [
      (stats.totalUsers / total) * 100,
      (stats.totalContents / total) * 100,
      (stats.totalBlogs / total) * 100,
      (stats.totalMessages / total) * 100,
      (stats.todayVisits / total) * 100
    ];
  };

  // 辅助函数：计算条形图宽度
  const calculateBarWidth = (value) => {
    const max = Math.max(stats.totalUsers, stats.totalContents, stats.totalBlogs, stats.totalMessages, stats.todayVisits, 1);
    return (value / max) * 100;
  };

  return (
    <>
      <Header>
        <Title>概览</Title>
      </Header>

      {loading ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.6)' }}>
            加载中...
          </div>
        </Card>
      ) : (
        <>
          <StatGrid>
            <StatCard gradient="linear-gradient(90deg, #00d4ff, #00b8e6)" borderColor="rgba(0, 212, 255, 0.3)">
              <StatIcon bgColor="rgba(0, 212, 255, 0.1)">👥</StatIcon>
              <StatValue color="#00d4ff">{stats.totalUsers}</StatValue>
              <StatLabel>用户数</StatLabel>
              <StatTrend positive={stats.totalUsers > 0}>
                {stats.totalUsers > 0 ? '↑ 活跃' : '- 暂无'}
              </StatTrend>
            </StatCard>
            <StatCard gradient="linear-gradient(90deg, #7c3aed, #6d28d9)" borderColor="rgba(124, 58, 237, 0.3)">
              <StatIcon bgColor="rgba(124, 58, 237, 0.1)">📄</StatIcon>
              <StatValue color="#7c3aed">{stats.totalContents}</StatValue>
              <StatLabel>内容数</StatLabel>
              <StatTrend positive={stats.totalContents > 0}>
                {stats.totalContents > 0 ? '↑ 已发布' : '- 暂无'}
              </StatTrend>
            </StatCard>
            <StatCard gradient="linear-gradient(90deg, #10b981, #059669)" borderColor="rgba(16, 185, 129, 0.3)">
              <StatIcon bgColor="rgba(16, 185, 129, 0.1)">📝</StatIcon>
              <StatValue color="#10b981">{stats.totalBlogs}</StatValue>
              <StatLabel>文章数</StatLabel>
              <StatTrend positive={stats.totalBlogs > 0}>
                {stats.totalBlogs > 0 ? '↑ 更新中' : '- 暂无'}
              </StatTrend>
            </StatCard>
            <StatCard gradient="linear-gradient(90deg, #f59e0b, #d97706)" borderColor="rgba(245, 158, 11, 0.3)">
              <StatIcon bgColor="rgba(245, 158, 11, 0.1)">💬</StatIcon>
              <StatValue color="#f59e0b">{stats.totalMessages}</StatValue>
              <StatLabel>留言数</StatLabel>
              <StatTrend positive={stats.totalMessages > 0}>
                {stats.totalMessages > 0 ? '↑ 有互动' : '- 暂无'}
              </StatTrend>
            </StatCard>
            <StatCard gradient="linear-gradient(90deg, #e74c3c, #dc2626)" borderColor="rgba(231, 76, 60, 0.3)">
              <StatIcon bgColor="rgba(231, 76, 60, 0.1)">👁️</StatIcon>
              <StatValue color="#e74c3c">{stats.todayVisits}</StatValue>
              <StatLabel>今日访问</StatLabel>
              <StatTrend positive={stats.todayVisits > 0}>
                {stats.todayVisits > 0 ? '↑ 有流量' : '- 暂无'}
              </StatTrend>
            </StatCard>
          </StatGrid>

          <ChartRow>
            <ChartCard>
              <ChartTitle>📊 数据分布</ChartTitle>
              <PieChartContainer>
                <PieChart percents={calculatePercents()} />
                <LegendContainer>
                  <LegendItem>
                    <LegendColor color="#00d4ff" />
                    <span>用户</span>
                    <LegendValue>{stats.totalUsers}</LegendValue>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor color="#7c3aed" />
                    <span>内容</span>
                    <LegendValue>{stats.totalContents}</LegendValue>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor color="#10b981" />
                    <span>文章</span>
                    <LegendValue>{stats.totalBlogs}</LegendValue>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor color="#f59e0b" />
                    <span>留言</span>
                    <LegendValue>{stats.totalMessages}</LegendValue>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor color="#e74c3c" />
                    <span>今日访问</span>
                    <LegendValue>{stats.todayVisits}</LegendValue>
                  </LegendItem>
                </LegendContainer>
              </PieChartContainer>
            </ChartCard>

            <ChartCard>
              <ChartTitle>📈 数据对比</ChartTitle>
              <BarChartContainer>
                <BarItem>
                  <BarLabel>用户数</BarLabel>
                  <BarTrack>
                    <BarFill
                      gradient="linear-gradient(90deg, #00d4ff, #00b8e6)"
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateBarWidth(stats.totalUsers)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                      {stats.totalUsers}
                    </BarFill>
                  </BarTrack>
                </BarItem>
                <BarItem>
                  <BarLabel>内容数</BarLabel>
                  <BarTrack>
                    <BarFill
                      gradient="linear-gradient(90deg, #7c3aed, #6d28d9)"
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateBarWidth(stats.totalContents)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                    >
                      {stats.totalContents}
                    </BarFill>
                  </BarTrack>
                </BarItem>
                <BarItem>
                  <BarLabel>文章数</BarLabel>
                  <BarTrack>
                    <BarFill
                      gradient="linear-gradient(90deg, #10b981, #059669)"
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateBarWidth(stats.totalBlogs)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    >
                      {stats.totalBlogs}
                    </BarFill>
                  </BarTrack>
                </BarItem>
                <BarItem>
                  <BarLabel>留言数</BarLabel>
                  <BarTrack>
                    <BarFill
                      gradient="linear-gradient(90deg, #f59e0b, #d97706)"
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateBarWidth(stats.totalMessages)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    >
                      {stats.totalMessages}
                    </BarFill>
                  </BarTrack>
                </BarItem>
                <BarItem>
                  <BarLabel>今日访问</BarLabel>
                  <BarTrack>
                    <BarFill
                      gradient="linear-gradient(90deg, #e74c3c, #dc2626)"
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateBarWidth(stats.todayVisits)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                    >
                      {stats.todayVisits}
                    </BarFill>
                  </BarTrack>
                </BarItem>
              </BarChartContainer>
            </ChartCard>
          </ChartRow>

          <Card>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>🚀 快速操作</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <AddButton as={Link} to="/admin/contents">
                <FaFileAlt /> 内容管理
              </AddButton>
              <AddButton as={Link} to="/admin/blogs">
                <FaBlog /> 博客管理
              </AddButton>
              <AddButton as={Link} to="/admin/users">
                <FaUsers /> 用户管理
              </AddButton>
              <AddButton as={Link} to="/admin/features">
                <FaCog /> 功能开关
              </AddButton>
            </div>
          </Card>
        </>
      )}
    </>
  );
};

// ============ 简化版内容管理组件 ============

const ContentManagement = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'custom',
    content: '',
    isVisible: true
  });

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const response = await axios.get('/api/contents/admin/all');
      setContents(response.data);
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

  const openAddModal = () => {
    setEditingContent(null);
    setFormData({ title: '', type: 'custom', content: '', isVisible: true });
    setModalOpen(true);
  };

  const openEditModal = (content) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      type: content.type,
      content: content.content || '',
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

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('标题不能为空');
      return;
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
      toast.error(error.response?.data?.message || '操作失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: '#fff' }}>加载中...</div>;

  return (
    <>
      <Header>
        <Title>内容管理</Title>
        <AddButton onClick={openAddModal}>
          <FaPlus /> 添加内容
        </AddButton>
      </Header>

      <Card>
        {contents.length === 0 ? (
          <EmptyState>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>暂无内容</p>
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>标题</Th>
                <Th>类型</Th>
                <Th>状态</Th>
                <Th>创建时间</Th>
                <Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {contents.map(item => (
                <tr key={item.id}>
                  <Td>{item.title}</Td>
                  <Td><Badge type={item.type}>{typeLabels[item.type] || item.type}</Badge></Td>
                  <Td><StatusBadge active={item.isVisible}>{item.isVisible ? '显示' : '隐藏'}</StatusBadge></Td>
                  <Td>{new Date(item.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <ActionButton onClick={() => openEditModal(item)} title="编辑">
                      <FaEdit />
                    </ActionButton>
                    <ActionButton danger onClick={() => handleDelete(item.id)} title="删除">
                      <FaTrash />
                    </ActionButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <AnimatePresence>
        {modalOpen && (
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

              <FormGroup>
                <Label>标题 *</Label>
                <Input name="title" value={formData.title} onChange={handleFormChange} placeholder="请输入标题" />
              </FormGroup>

              <FormGroup>
                <Label>类型</Label>
                <Select name="type" value={formData.type} onChange={handleFormChange}>
                  <option value="hero">🏠 首页</option>
                  <option value="about">👤 简介</option>
                  <option value="skill">⚡ 技能</option>
                  <option value="project">📦 项目</option>
                  <option value="contact">📞 联系</option>
                  <option value="custom">🔧 自定义</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>内容</Label>
                <TextArea name="content" value={formData.content} onChange={handleFormChange} placeholder="支持换行，每行一段" style={{ minHeight: '150px' }} />
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <input type="checkbox" name="isVisible" checked={formData.isVisible} onChange={handleFormChange} />
                  显示此内容
                </CheckboxLabel>
              </FormGroup>

              <ButtonGroup>
                <CancelButton onClick={() => setModalOpen(false)}>取消</CancelButton>
                <SaveButton onClick={handleSave} disabled={saving}>
                  <FaSave /> {saving ? '保存中...' : '保存'}
                </SaveButton>
              </ButtonGroup>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </>
  );
};

// ============ 组管理组件 ============

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/groups');
      setGroups(response.data);
    } catch (error) {
      toast.error('获取组列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await axios.put(`/api/groups/${editingGroup.id}`, formData);
        toast.success('更新成功');
      } else {
        await axios.post('/api/groups', formData);
        toast.success('创建成功');
      }
      setShowModal(false);
      setEditingGroup(null);
      setFormData({ name: '', description: '' });
      fetchGroups();
    } catch (error) {
      toast.error(error.response?.data?.message || '操作失败');
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({ name: group.name, description: group.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除此组吗？组内用户将被移出该组。')) return;
    try {
      await axios.delete(`/api/groups/${id}`);
      toast.success('删除成功');
      fetchGroups();
    } catch (error) {
      toast.error('删除失败');
    }
  };

  if (loading) return <div style={{ color: '#fff' }}>加载中...</div>;

  return (
    <>
      <Header>
        <Title>用户组管理</Title>
        <AddButton onClick={() => { setEditingGroup(null); setFormData({ name: '', description: '' }); setShowModal(true); }}>
          <FaPlus /> 新建组
        </AddButton>
      </Header>

      <Card>
        {groups.length === 0 ? (
          <EmptyState>暂无组，点击上方按钮创建</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>组名</Th>
                <Th>描述</Th>
                <Th>成员数</Th>
                <Th>创建时间</Th>
                <Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {groups.map(group => (
                <tr key={group.id}>
                  <Td>{group.name}</Td>
                  <Td>{group.description || '-'}</Td>
                  <Td>{group.users?.length || 0}</Td>
                  <Td>{new Date(group.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <ActionButton onClick={() => handleEdit(group)}>
                      <FaEdit />
                    </ActionButton>
                    <ActionButton danger onClick={() => handleDelete(group.id)}>
                      <FaTrash />
                    </ActionButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h3>{editingGroup ? '编辑组' : '新建组'}</h3>
              <CloseButton onClick={() => setShowModal(false)}><FaTimes /></CloseButton>
            </ModalHeader>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>组名</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入组名"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>描述</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请输入描述（可选）"
                  rows={3}
                />
              </FormGroup>
              <ButtonGroup>
                <CancelButton type="button" onClick={() => setShowModal(false)}>取消</CancelButton>
                <SaveButton type="submit">{editingGroup ? '更新' : '创建'}</SaveButton>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

// ============ 注册设置组件 ============

const RegisterSettings = () => {
  const [settings, setSettings] = useState({
    register_enabled: 'true',
    register_require_email: 'true',
    register_default_group_id: '',
    register_require_invite: 'false',
    register_require_captcha: 'true',
    register_ip_limit_count: '5',
    register_ip_limit_minutes: '60',
    register_min_username_length: '3',
    register_min_password_length: '8'
  });
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchGroups();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/auth/register-settings');
      setSettings(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      toast.error('获取注册设置失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('获取组列表失败', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value.toString()
      }));
      
      for (const setting of settingsArray) {
        await axios.post('/api/config', setting);
      }
      
      toast.success('设置保存成功');
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div style={{ color: '#fff' }}>加载中...</div>;

  return (
    <>
      <Header>
        <Title>注册设置</Title>
        <SaveButton onClick={handleSave} disabled={saving}>
          <FaSave /> {saving ? '保存中...' : '保存设置'}
        </SaveButton>
      </Header>

      <Card>
        <FormGroup>
          <Label>允许注册</Label>
          <Select 
            value={settings.register_enabled} 
            onChange={(e) => handleChange('register_enabled', e.target.value)}
          >
            <option value="true">开启</option>
            <option value="false">关闭</option>
          </Select>
          <Description>控制是否允许新用户注册</Description>
        </FormGroup>

        <FormGroup>
          <Label>默认用户组</Label>
          <Select 
            value={settings.register_default_group_id} 
            onChange={(e) => handleChange('register_default_group_id', e.target.value)}
          >
            <option value="">无</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </Select>
          <Description>新注册用户自动归属的用户组</Description>
        </FormGroup>

        <FormGroup>
          <Label>需要验证码</Label>
          <Select 
            value={settings.register_require_captcha} 
            onChange={(e) => handleChange('register_require_captcha', e.target.value)}
          >
            <option value="true">是</option>
            <option value="false">否</option>
          </Select>
          <Description>注册时是否需要填写图形验证码，防止机器人自动注册</Description>
        </FormGroup>

        <FormGroup>
          <Label>需要邀请码</Label>
          <Select 
            value={settings.register_require_invite} 
            onChange={(e) => handleChange('register_require_invite', e.target.value)}
          >
            <option value="true">是</option>
            <option value="false">否</option>
          </Select>
          <Description>注册时是否需要输入邀请码</Description>
        </FormGroup>

        <FormGroup>
          <Label>IP注册次数限制</Label>
          <Input 
            type="number" 
            value={settings.register_ip_limit_count} 
            onChange={(e) => handleChange('register_ip_limit_count', e.target.value)}
            min="1"
            max="100"
          />
          <Description>同一IP在限制时间内允许注册的最大数量</Description>
        </FormGroup>

        <FormGroup>
          <Label>IP限制时间窗口（分钟）</Label>
          <Input 
            type="number" 
            value={settings.register_ip_limit_minutes} 
            onChange={(e) => handleChange('register_ip_limit_minutes', e.target.value)}
            min="1"
            max="1440"
          />
          <Description>IP注册次数限制的时间窗口（分钟）</Description>
        </FormGroup>

        <FormGroup>
          <Label>用户名最小长度</Label>
          <Input 
            type="number" 
            value={settings.register_min_username_length} 
            onChange={(e) => handleChange('register_min_username_length', e.target.value)}
            min="1"
            max="20"
          />
          <Description>注册时用户名的最小字符数</Description>
        </FormGroup>

        <FormGroup>
          <Label>密码最小长度</Label>
          <Input 
            type="number" 
            value={settings.register_min_password_length} 
            onChange={(e) => handleChange('register_min_password_length', e.target.value)}
            min="8"
            max="32"
          />
          <Description>注册时密码的最小字符数（建议8位以上）</Description>
        </FormGroup>
      </Card>
    </>
  );
};

const Description = styled.p`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.5rem;
  margin-bottom: 0;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  color: #fff;
  margin-bottom: 0.5rem;
`;

const SslStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  margin-top: 1rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const StatusDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.active ? '#2ecc71' : '#e74c3c'};
  box-shadow: 0 0 8px ${props => props.active ? 'rgba(46, 204, 113, 0.5)' : 'rgba(231, 76, 60, 0.5)'};
`;

const FileUploadArea = styled.div`
  position: relative;
`;

const HiddenFileInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  cursor: pointer;
  z-index: 1;
`;

const FileUploadLabel = styled.div`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed ${props => props.hasFile ? '#2ecc71' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 15px;
  text-align: center;
  color: ${props => props.hasFile ? '#2ecc71' : 'rgba(255, 255, 255, 0.6)'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;

  &:hover {
    border-color: #667eea;
    color: #667eea;
  }
`;

const SslDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const RestartNote = styled.div`
  padding: 0.75rem 1rem;
  background: rgba(241, 196, 15, 0.1);
  border: 1px solid rgba(241, 196, 15, 0.3);
  border-radius: 10px;
  color: #f1c40f;
  font-size: 0.85rem;
  margin-bottom: 1rem;
`;

const FaviconPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FaviconPlaceholder = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.7rem;
`;

const FaviconUploadButton = styled.label`
  padding: 0.5rem 1rem;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid #667eea;
  border-radius: 10px;
  color: #667eea;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.3);
  }
`;

const AvatarPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(102, 126, 234, 0.3);
  }
`;

const AvatarPlaceholder = styled.div`
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.5);
`;

const AvatarUploadButton = styled.label`
  padding: 0.5rem 1rem;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid #667eea;
  border-radius: 10px;
  color: #667eea;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.3);
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
  opacity: 0.6;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

const PasswordStrengthBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-top: 0.5rem;
  overflow: hidden;
`;

const PasswordStrengthFill = styled.div`
  height: 100%;
  width: ${props => (props.strength / 4) * 100}%;
  border-radius: 2px;
  background: ${props => {
    switch(props.strength) {
      case 1: return '#e74c3c';
      case 2: return '#e67e22';
      case 3: return '#f1c40f';
      case 4: return '#2ecc71';
      default: return 'transparent';
    }
  }};
  transition: all 0.3s ease;
`;

const PasswordStrengthText = styled.div`
  font-size: 0.8rem;
  margin-top: 0.35rem;
  color: rgba(255, 255, 255, 0.5);
`;

// ============ 简化版用户管理组件 ============

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ role: '', isActive: true, groupId: '' });

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('获取用户失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('获取组列表失败', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除此用户吗？')) return;
    try {
      await axios.delete(`/api/users/${id}`);
      toast.success('删除成功');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || '删除失败');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditForm({ 
      role: user.role, 
      isActive: user.isActive,
      groupId: user.groupId || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ role: '', isActive: true, groupId: '' });
  };

  const handleSaveEdit = async (userId) => {
    try {
      await axios.put(`/api/users/${userId}`, editForm);
      toast.success('更新成功');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || '更新失败');
    }
  };

  if (loading) return <div style={{ color: '#fff' }}>加载中...</div>;

  return (
    <>
      <Header>
        <Title>用户管理</Title>
      </Header>

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>用户名</Th>
              <Th>邮箱</Th>
              <Th>角色</Th>
              <Th>所属组</Th>
              <Th>状态</Th>
              <Th>注册时间</Th>
              <Th>操作</Th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <Td>{user.username}</Td>
                <Td>{user.email}</Td>
                <Td>
                  {editingUser === user.id ? (
                    <Select 
                      value={editForm.role} 
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    >
                      <option value="user">普通用户</option>
                      <option value="admin">管理员</option>
                    </Select>
                  ) : (
                    <Badge type={user.role}>{typeLabels[user.role] || user.role}</Badge>
                  )}
                </Td>
                <Td>
                  {editingUser === user.id ? (
                    <Select 
                      value={editForm.groupId} 
                      onChange={(e) => setEditForm({ ...editForm, groupId: e.target.value })}
                    >
                      <option value="">无</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </Select>
                  ) : (
                    <Badge type="default">{user.group?.name || '-'}</Badge>
                  )}
                </Td>
                <Td>
                  {editingUser === user.id ? (
                    <Select 
                      value={editForm.isActive ? 'true' : 'false'} 
                      onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}
                    >
                      <option value="true">正常</option>
                      <option value="false">禁用</option>
                    </Select>
                  ) : (
                    <StatusBadge active={user.isActive}>{user.isActive ? '正常' : '禁用'}</StatusBadge>
                  )}
                </Td>
                <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                <Td>
                  {editingUser === user.id ? (
                    <>
                      <ActionButton success onClick={() => handleSaveEdit(user.id)}>
                        <FaSave />
                      </ActionButton>
                      <ActionButton onClick={handleCancelEdit}>
                        <FaTimes />
                      </ActionButton>
                    </>
                  ) : (
                    <>
                      <ActionButton onClick={() => handleEdit(user)}>
                        <FaEdit />
                      </ActionButton>
                      <ActionButton danger onClick={() => handleDelete(user.id)}>
                        <FaTrash />
                      </ActionButton>
                    </>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
};

// ============ 简化版留言管理组件 ============

const MessageManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMessages, setExpandedMessages] = useState(new Set());

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

  if (loading) return <div style={{ color: '#fff' }}>加载中...</div>;

  return (
    <>
      <Header>
        <Title>留言管理</Title>
      </Header>

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
              {messages.map(msg => {
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
      </Card>
    </>
  );
};

// ============ 修改密码组件 ============

const ChangePassword = () => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast.error('请填写所有字段');
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error('新密码至少需要6个字符');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('两次输入的新密码不一致');
      return;
    }

    setSaving(true);
    try {
      await axios.put('/api/users/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      toast.success('密码修改成功');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const msg = error.response?.data?.message || '修改失败';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <SectionTitle>修改密码</SectionTitle>
      <Description>定期修改密码有助于保护账户安全</Description>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>当前密码</Label>
          <div style={{ position: 'relative' }}>
            <Input
              name="currentPassword"
              type={showCurrent ? 'text' : 'password'}
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="请输入当前密码"
              style={{ paddingRight: '3rem' }}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
            >
              {showCurrent ? '🙈' : '👁'}
            </PasswordToggle>
          </div>
        </FormGroup>

        <FormGroup>
          <Label>新密码</Label>
          <div style={{ position: 'relative' }}>
            <Input
              name="newPassword"
              type={showNew ? 'text' : 'password'}
              value={form.newPassword}
              onChange={handleChange}
              placeholder="至少6个字符"
              style={{ paddingRight: '3rem' }}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowNew(!showNew)}
            >
              {showNew ? '🙈' : '👁'}
            </PasswordToggle>
          </div>
          <Description>建议使用字母、数字和特殊字符的组合</Description>
        </FormGroup>

        <FormGroup>
          <Label>确认新密码</Label>
          <Input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="再次输入新密码"
          />
        </FormGroup>

        <PasswordStrengthBar>
          <PasswordStrengthFill strength={
            form.newPassword.length === 0 ? 0 :
            form.newPassword.length < 6 ? 1 :
            /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(form.newPassword) ? 4 :
            /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.newPassword) ? 3 :
            /(?=.*[a-zA-Z])(?=.*\d)/.test(form.newPassword) ? 2 : 1
          } />
        </PasswordStrengthBar>
        <PasswordStrengthText>
          {form.newPassword.length === 0 ? '' :
           form.newPassword.length < 6 ? '密码太短' :
           /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(form.newPassword) ? '强度：非常强' :
           /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.newPassword) ? '强度：强' :
           /(?=.*[a-zA-Z])(?=.*\d)/.test(form.newPassword) ? '强度：中等' : '强度：弱'}
        </PasswordStrengthText>

        <ButtonGroup>
          <SaveButton type="submit" disabled={saving}>
            <FaLock /> {saving ? '修改中...' : '修改密码'}
          </SaveButton>
        </ButtonGroup>
      </Form>
    </Card>
  );
};

// ============ 邮件配置组件 ============

const EmailSettings = () => {
  const [config, setConfig] = useState({
    enabled: false,
    host: '',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    from: '',
    adminEmail: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get('/api/email-config');
      setConfig(prev => ({ ...prev, ...response.data }));
      setHasPassword(response.data.hasPassword);
    } catch (error) {
      console.error('获取邮件配置失败:', error);
      toast.error('获取邮件配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/api/email-config', config);
      toast.success('邮件配置保存成功');
      setHasPassword(true);
      setConfig(prev => ({ ...prev, pass: '' }));
    } catch (error) {
      toast.error('保存失败: ' + (error.response?.data?.message || '未知错误'));
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail) {
      toast.error('请输入测试邮箱地址');
      return;
    }
    setTesting(true);
    try {
      const response = await axios.post('/api/email-config/test', { testEmail });
      toast.success(response.data.message);
    } catch (error) {
      toast.error('测试失败: ' + (error.response?.data?.message || '未知错误'));
    } finally {
      setTesting(false);
    }
  };

  const handleClearPassword = async () => {
    if (!window.confirm('确定要清除已保存的密码吗？')) return;
    try {
      await axios.delete('/api/email-config/password');
      setHasPassword(false);
      toast.success('密码已清除');
    } catch (error) {
      toast.error('清除失败');
    }
  };

  if (loading) return <div style={{ color: '#fff' }}>加载中...</div>;

  return (
    <>
      <Header>
        <Title>邮件配置</Title>
      </Header>

      <Card>
        <SectionTitle>SMTP 服务器设置</SectionTitle>
        <Description>配置邮件服务器以启用留言通知、密码重置等功能。</Description>

        <FormGroup>
          <Label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              name="enabled"
              checked={config.enabled}
              onChange={handleChange}
              style={{ width: 'auto' }}
            />
            启用邮件服务
          </Label>
          <Description>开启后，系统将自动发送邮件通知</Description>
        </FormGroup>

        <FormGroup>
          <Label>SMTP 服务器地址</Label>
          <Input
            name="host"
            value={config.host}
            onChange={handleChange}
            placeholder="例如：smtp.gmail.com 或 smtp.qq.com"
            disabled={!config.enabled}
          />
          <Description>您的邮件服务商提供的 SMTP 服务器地址</Description>
        </FormGroup>

        <FormGroup>
          <Label>端口</Label>
          <Input
            name="port"
            type="number"
            value={config.port}
            onChange={handleChange}
            placeholder="587"
            disabled={!config.enabled}
          />
          <Description>常用端口：25、465（SSL）、587（TLS）</Description>
        </FormGroup>

        <FormGroup>
          <Label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              name="secure"
              checked={config.secure}
              onChange={handleChange}
              disabled={!config.enabled}
              style={{ width: 'auto' }}
            />
            使用 SSL/TLS 加密
          </Label>
          <Description>465端口通常需要开启，587端口通常不需要</Description>
        </FormGroup>

        <FormGroup>
          <Label>发件人邮箱</Label>
          <Input
            name="user"
            type="email"
            value={config.user}
            onChange={handleChange}
            placeholder="your-email@gmail.com"
            disabled={!config.enabled}
          />
          <Description>用于发送邮件的邮箱账号</Description>
        </FormGroup>

        <FormGroup>
          <Label>邮箱密码 / 授权码</Label>
          <div style={{ position: 'relative' }}>
            <Input
              name="pass"
              type={showPassword ? 'text' : 'password'}
              value={config.pass}
              onChange={handleChange}
              placeholder={hasPassword ? '••••••••（已设置，留空则不修改）' : '请输入密码或授权码'}
              disabled={!config.enabled}
              style={{ paddingRight: '6rem' }}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ right: hasPassword ? '5rem' : '0.75rem' }}
            >
              {showPassword ? '🙈' : '👁'}
            </PasswordToggle>
            {hasPassword && (
              <button
                type="button"
                onClick={handleClearPassword}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(231, 76, 60, 0.2)',
                  border: '1px solid #e74c3c',
                  color: '#e74c3c',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                清除
              </button>
            )}
          </div>
          <Description>建议使用应用专用授权码而非邮箱密码</Description>
        </FormGroup>

        <FormGroup>
          <Label>显示名称（可选）</Label>
          <Input
            name="from"
            value={config.from}
            onChange={handleChange}
            placeholder="网站通知 <your-email@gmail.com>"
            disabled={!config.enabled}
          />
          <Description>收件人看到的发件人名称，默认使用邮箱地址</Description>
        </FormGroup>

        <FormGroup>
          <Label>管理员通知邮箱</Label>
          <Input
            name="adminEmail"
            type="email"
            value={config.adminEmail}
            onChange={handleChange}
            placeholder="admin@example.com"
            disabled={!config.enabled}
          />
          <Description>用于接收新留言通知的邮箱地址</Description>
        </FormGroup>

        <ButtonGroup>
          <SaveButton onClick={handleSave} disabled={saving || !config.enabled}>
            <FaSave /> {saving ? '保存中...' : '保存配置'}
          </SaveButton>
        </ButtonGroup>
      </Card>

      <Card style={{ marginTop: '1.5rem' }}>
        <SectionTitle>发送测试</SectionTitle>
        <Description>保存配置后，可以发送测试邮件验证配置是否正确。</Description>

        <FormGroup>
          <Label>测试邮箱地址</Label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="输入接收测试邮件的邮箱"
              disabled={!config.enabled}
              style={{ flex: 1 }}
            />
            <button
              onClick={handleTest}
              disabled={testing || !config.enabled || !testEmail}
              style={{
                padding: '0.75rem 1.5rem',
                background: config.enabled ? 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)' : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontWeight: 600,
                cursor: config.enabled ? 'pointer' : 'not-allowed',
                opacity: config.enabled ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FaEnvelopeOpen />
              {testing ? '发送中...' : '发送测试邮件'}
            </button>
          </div>
        </FormGroup>

        <div style={{
          background: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          borderRadius: '8px',
          padding: '1rem',
          marginTop: '1rem',
          color: '#ffc107',
          fontSize: '0.9rem'
        }}>
          <strong>💡 常见邮箱配置参考：</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
            <li><strong>Gmail：</strong>smtp.gmail.com:587（需开启两步验证并使用应用密码）</li>
            <li><strong>QQ邮箱：</strong>smtp.qq.com:587（需开启SMTP并使用授权码）</li>
            <li><strong>163邮箱：</strong>smtp.163.com:25 或 465</li>
            <li><strong>Outlook：</strong>smtp.office365.com:587</li>
          </ul>
        </div>
      </Card>
    </>
  );
};

// ============ 个人信息设置组件 ============

const ProfileSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/config');
      setSettings(response.data);
    } catch (error) {
      console.error('获取设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/api/config/batch', settings);
      toast.success('个人信息保存成功');
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 验证图片
    const validation = validateImage(file, { maxSizeMB: 5 });
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      // 压缩图片
      const compressedFile = await compressImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 800
      });

      const formData = new FormData();
      formData.append('image', compressedFile);

      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSettings(prev => ({ ...prev, profile_avatar: response.data.url }));
      toast.success('头像上传成功');
    } catch (error) {
      toast.error('上传失败');
    }
  };

  if (loading) return <div style={{ color: '#fff' }}>加载中...</div>;

  return (
    <>
      <Header>
        <Title>个人信息</Title>
      </Header>

      <Card>
        <SectionTitle>基本资料</SectionTitle>
        <Description>设置公开显示的个人信息，用于展示在网站关于页面或作者介绍中。</Description>

        <FormGroup>
          <Label>头像</Label>
          <AvatarPreview>
            {settings.profile_avatar ? (
              <img 
                src={settings.profile_avatar.startsWith('/') ? `${process.env.REACT_APP_API_URL || ''}${settings.profile_avatar}` : settings.profile_avatar} 
                alt="Avatar" 
              />
            ) : (
              <AvatarPlaceholder>
                <FaUser size={40} />
              </AvatarPlaceholder>
            )}
            <AvatarUploadButton>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.gif,.webp"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />
              上传头像
            </AvatarUploadButton>
          </AvatarPreview>
          <Description>建议上传 200x200 像素以上的正方形图片</Description>
        </FormGroup>

        <FormGroup>
          <Label>公开显示名称</Label>
          <Input 
            name="profile_display_name" 
            value={settings.profile_display_name || ''} 
            onChange={handleChange}
            placeholder="例如：张三、Alex、CodeMaster"
          />
          <Description>用昵称或笔名，保护真实姓名，同时方便读者记住你</Description>
        </FormGroup>

        <FormGroup>
          <Label>个人简介</Label>
          <TextArea 
            name="profile_bio" 
            value={settings.profile_bio || ''} 
            onChange={handleChange}
            placeholder="写一段200字以内的专业背景或写作方向..."
            rows={4}
            maxLength={200}
          />
          <Description>帮助新读者快速判断是否值得关注（最多200字）</Description>
        </FormGroup>

        <FormGroup>
          <Label>联系邮箱</Label>
          <Input 
            name="profile_email" 
            type="email"
            value={settings.profile_email || ''} 
            onChange={handleChange}
            placeholder="your@email.com"
          />
          <Description>读者可能通过邮件联系你，但不会在页面上直接暴露</Description>
        </FormGroup>

        <ButtonGroup>
          <SaveButton onClick={handleSave} disabled={saving}>
            <FaSave /> {saving ? '保存中...' : '保存设置'}
          </SaveButton>
        </ButtonGroup>
      </Card>

      <Card style={{ marginTop: '1.5rem' }}>
        <SectionTitle>社交链接</SectionTitle>
        <Description>放与你定位相关的链接，方便读者进一步了解你、建立跨平台影响力。</Description>

        <FormGroup>
          <Label>个人网站</Label>
          <Input 
            name="profile_website" 
            value={settings.profile_website || ''} 
            onChange={handleChange}
            placeholder="https://yourwebsite.com"
          />
          <Description>你的个人主页或其他网站链接</Description>
        </FormGroup>

        <FormGroup>
          <Label>GitHub</Label>
          <Input 
            name="profile_github" 
            value={settings.profile_github || ''} 
            onChange={handleChange}
            placeholder="https://github.com/username"
          />
          <Description>GitHub 个人主页链接</Description>
        </FormGroup>

        <FormGroup>
          <Label>Twitter / X</Label>
          <Input 
            name="profile_twitter" 
            value={settings.profile_twitter || ''} 
            onChange={handleChange}
            placeholder="https://twitter.com/username"
          />
          <Description>Twitter 个人主页链接</Description>
        </FormGroup>

        <FormGroup>
          <Label>微信公众号</Label>
          <Input 
            name="profile_wechat" 
            value={settings.profile_wechat || ''} 
            onChange={handleChange}
            placeholder="公众号名称或ID"
          />
          <Description>微信公众号名称</Description>
        </FormGroup>

        <FormGroup>
          <Label>其他社交链接</Label>
          <TextArea 
            name="profile_social_links" 
            value={settings.profile_social_links || ''} 
            onChange={handleChange}
            placeholder="其他社交平台链接，每行一个"
            rows={3}
          />
          <Description>其他社交平台链接，方便读者进一步了解你</Description>
        </FormGroup>

        <ButtonGroup>
          <SaveButton onClick={handleSave} disabled={saving}>
            <FaSave /> {saving ? '保存中...' : '保存设置'}
          </SaveButton>
        </ButtonGroup>
      </Card>

      <ChangePassword />
    </>
  );
};

// ============ 简化版设置组件 ============

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/config');
      setSettings(response.data);
    } catch (error) {
      console.error('获取设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/api/config/batch', settings);
      toast.success('设置保存成功');
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('favicon', file);

    try {
      const response = await axios.post('/api/upload/favicon', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSettings(prev => ({ ...prev, site_favicon: response.data.url }));
      toast.success('Favicon 上传成功');
    } catch (error) {
      toast.error('上传失败');
    }
  };

  if (loading) return <div style={{ color: '#fff' }}>加载中...</div>;

  return (
    <>
      <Header>
        <Title>网站设置</Title>
      </Header>

      <Card>
        <SectionTitle>网站信息</SectionTitle>

        <FormGroup>
          <Label>网站标题</Label>
          <Input 
            name="site_title" 
            value={settings.site_title || ''} 
            onChange={handleChange}
            placeholder="显示在浏览器标签页的标题"
          />
          <Description>浏览器标签页显示的网站标题</Description>
        </FormGroup>

        <FormGroup>
          <Label>网站名称</Label>
          <Input 
            name="site_name" 
            value={settings.site_name || ''} 
            onChange={handleChange}
            placeholder="网站名称"
          />
          <Description>网站的主要内容名称</Description>
        </FormGroup>

        <FormGroup>
          <Label>Favicon 图标</Label>
          <FaviconPreview>
            {settings.site_favicon ? (
              <img 
                src={settings.site_favicon.startsWith('/') ? `${process.env.REACT_APP_API_URL || ''}${settings.site_favicon}` : settings.site_favicon} 
                alt="Favicon" 
                style={{ width: 32, height: 32 }}
              />
            ) : (
              <FaviconPlaceholder>无</FaviconPlaceholder>
            )}
            <FaviconUploadButton>
              <input
                type="file"
                accept=".ico,.png,.jpg,.jpeg,.gif,.webp"
                onChange={handleFaviconUpload}
                style={{ display: 'none' }}
              />
              选择图标文件
            </FaviconUploadButton>
          </FaviconPreview>
          <Description>上传 16x16、32x32 或 64x64 像素的图标，支持 ico、png、jpg 格式</Description>
        </FormGroup>

        <FormGroup>
          <Label>网站描述</Label>
          <TextArea name="site_description" value={settings.site_description || ''} onChange={handleChange} />
        </FormGroup>

        <FormGroup>
          <Label>邮箱地址</Label>
          <Input name="email_address" value={settings.email_address || ''} onChange={handleChange} />
        </FormGroup>

        <FormGroup>
          <Label>GitHub</Label>
          <Input name="github_url" value={settings.github_url || ''} onChange={handleChange} />
        </FormGroup>

        <ButtonGroup>
          <SaveButton onClick={handleSave} disabled={saving}>
            <FaSave /> {saving ? '保存中...' : '保存设置'}
          </SaveButton>
        </ButtonGroup>
      </Card>

      <Card style={{ marginTop: '1.5rem' }}>
        <SectionTitle>SSL / HTTPS 安全配置</SectionTitle>
        <Description>配置SSL证书以启用HTTPS加密传输，保护用户数据安全。支持三种配置方式，任选其一即可。</Description>

        <FormGroup>
          <Label>启用 HTTPS</Label>
          <Select 
            name="ssl_enabled" 
            value={settings.ssl_enabled || 'false'} 
            onChange={handleChange}
          >
            <option value="false">关闭</option>
            <option value="true">开启</option>
          </Select>
          <Description>开启后服务器将使用HTTPS协议（需同时配置证书）</Description>
        </FormGroup>

        <SslDivider>方式一：服务器文件路径</SslDivider>

        <FormGroup>
          <Label>证书文件路径</Label>
          <Input 
            name="ssl_cert_path" 
            value={settings.ssl_cert_path || ''} 
            onChange={handleChange}
            placeholder="例如：/etc/ssl/certs/cert.pem"
          />
          <Description>服务器上 SSL 证书文件的完整路径（.pem 或 .crt 格式）</Description>
        </FormGroup>

        <FormGroup>
          <Label>私钥文件路径</Label>
          <Input 
            name="ssl_key_path" 
            value={settings.ssl_key_path || ''} 
            onChange={handleChange}
            placeholder="例如：/etc/ssl/private/key.pem"
          />
          <Description>服务器上 SSL 私钥文件的完整路径（.key 或 .pem 格式）</Description>
        </FormGroup>

        <FormGroup>
          <Label>CA证书链路径（可选）</Label>
          <Input 
            name="ssl_ca_path" 
            value={settings.ssl_ca_path || ''} 
            onChange={handleChange}
            placeholder="例如：/etc/ssl/certs/ca-bundle.crt"
          />
          <Description>CA证书链文件路径，用于中间证书（可选）</Description>
        </FormGroup>

        <SslDivider>方式二：上传证书文件</SslDivider>

        <FormGroup>
          <Label>上传证书文件</Label>
          <FileUploadArea>
            <HiddenFileInput
              type="file"
              accept=".pem,.crt,.cert"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setSettings(prev => ({ ...prev, ssl_cert_content: event.target.result }));
                  };
                  reader.readAsText(file);
                }
              }}
            />
            <FileUploadLabel hasFile={!!settings.ssl_cert_content}>
              {settings.ssl_cert_content ? '✓ 证书文件已选择（点击重新选择）' : '点击选择证书文件（.pem, .crt）'}
            </FileUploadLabel>
          </FileUploadArea>
        </FormGroup>

        <FormGroup>
          <Label>上传私钥文件</Label>
          <FileUploadArea>
            <HiddenFileInput
              type="file"
              accept=".pem,.key"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setSettings(prev => ({ ...prev, ssl_key_content: event.target.result }));
                  };
                  reader.readAsText(file);
                }
              }}
            />
            <FileUploadLabel hasFile={!!settings.ssl_key_content}>
              {settings.ssl_key_content ? '✓ 私钥文件已选择（点击重新选择）' : '点击选择私钥文件（.pem, .key）'}
            </FileUploadLabel>
          </FileUploadArea>
        </FormGroup>

        <FormGroup>
          <Label>上传CA证书链（可选）</Label>
          <FileUploadArea>
            <HiddenFileInput
              type="file"
              accept=".pem,.crt"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setSettings(prev => ({ ...prev, ssl_ca_content: event.target.result }));
                  };
                  reader.readAsText(file);
                }
              }}
            />
            <FileUploadLabel hasFile={!!settings.ssl_ca_content}>
              {settings.ssl_ca_content ? '✓ CA证书链已选择（点击重新选择）' : '点击选择CA证书链文件（可选）'}
            </FileUploadLabel>
          </FileUploadArea>
        </FormGroup>

        <SslDivider>方式三：直接粘贴证书内容</SslDivider>

        <FormGroup>
          <Label>证书内容（CRT/PEM）</Label>
          <TextArea 
            name="ssl_cert_content" 
            value={settings.ssl_cert_content || ''} 
            onChange={handleChange}
            placeholder="-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----"
            rows={5}
            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
          />
          <Description>粘贴 SSL 证书的完整内容（上传文件时会自动填入）</Description>
        </FormGroup>

        <FormGroup>
          <Label>私钥内容（KEY/PEM）</Label>
          <TextArea 
            name="ssl_key_content" 
            value={settings.ssl_key_content || ''} 
            onChange={handleChange}
            placeholder="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----"
            rows={5}
            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
          />
          <Description>粘贴 SSL 私钥的完整内容（上传文件时会自动填入）</Description>
        </FormGroup>

        <FormGroup>
          <Label>CA证书链内容（可选）</Label>
          <TextArea 
            name="ssl_ca_content" 
            value={settings.ssl_ca_content || ''} 
            onChange={handleChange}
            placeholder="-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----"
            rows={4}
            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
          />
          <Description>粘贴 CA 证书链内容（上传文件时会自动填入）</Description>
        </FormGroup>

        <SslDivider>其他配置</SslDivider>

        <FormGroup>
          <Label>强制 HTTPS 跳转</Label>
          <Select 
            name="ssl_force_redirect" 
            value={settings.ssl_force_redirect || 'false'} 
            onChange={handleChange}
          >
            <option value="false">关闭</option>
            <option value="true">开启</option>
          </Select>
          <Description>开启后所有HTTP请求将自动跳转到HTTPS</Description>
        </FormGroup>

        <SslStatus>
          <StatusDot active={settings.ssl_enabled === 'true'} />
          <span>当前状态：{settings.ssl_enabled === 'true' ? 'HTTPS 已启用' : 'HTTPS 未启用'}</span>
        </SslStatus>

        <RestartNote>⚠️ 证书配置保存后需要重启服务生效。优先级：证书内容 > 文件路径</RestartNote>

        <ButtonGroup>
          <SaveButton onClick={handleSave} disabled={saving}>
            <FaSave /> {saving ? '保存中...' : '保存设置'}
          </SaveButton>
        </ButtonGroup>
      </Card>
    </>
  );
};

// ============ 主布局 ============

const Admin = () => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <AdminContainer>
      <Sidebar>
        <Logo>后台管理</Logo>
        <Nav>
          <NavItem to="/admin" active={location.pathname === '/admin'}>
            <FaHome /> 概览
          </NavItem>
          <NavItem to="/admin/contents" active={location.pathname.includes('/admin/contents')}>
            <FaFileAlt /> 内容管理
          </NavItem>
          <NavItem to="/admin/blogs" active={location.pathname.includes('/admin/blogs')}>
            <FaBlog /> 博客管理
          </NavItem>
          <NavItem to="/admin/profile" active={location.pathname.includes('/admin/profile')}>
            <FaUser /> 个人信息
          </NavItem>
          <NavItem to="/admin/users" active={location.pathname.includes('/admin/users')}>
            <FaUsers /> 用户管理
          </NavItem>
          <NavItem to="/admin/groups" active={location.pathname.includes('/admin/groups')}>
            <FaUsers /> 用户组管理
          </NavItem>
          <NavItem to="/admin/register-settings" active={location.pathname.includes('/admin/register-settings')}>
            <FaCog /> 注册设置
          </NavItem>
          <NavItem to="/admin/messages" active={location.pathname.includes('/admin/messages')}>
            <FaEnvelope /> 留言管理
          </NavItem>
          <NavItem to="/admin/visitors" active={location.pathname.includes('/admin/visitors')}>
            <FaChartLine /> 访客统计
          </NavItem>
          <NavItem to="/admin/features" active={location.pathname.includes('/admin/features')}>
            <FaToggleOn /> 功能开关
          </NavItem>
          <NavItem to="/admin/backup" active={location.pathname.includes('/admin/backup')}>
            <FaDatabase /> 数据备份
          </NavItem>
          <NavItem to="/admin/email" active={location.pathname.includes('/admin/email')}>
            <FaEnvelopeOpen /> 邮件配置
          </NavItem>
          <NavItem to="/admin/settings" active={location.pathname.includes('/admin/settings')}>
            <FaCog /> 网站设置
          </NavItem>
        </Nav>
        <LogoutButton onClick={logout}>
          <FaSignOutAlt /> 退出登录
        </LogoutButton>
      </Sidebar>

      <MainContent>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contents" element={<ContentManagement />} />
          <Route path="/blogs" element={<BlogManagement />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/groups" element={<GroupManagement />} />
          <Route path="/register-settings" element={<RegisterSettings />} />
          <Route path="/messages" element={<MessageManagement />} />
          <Route path="/visitors" element={<VisitorStats />} />
          <Route path="/features" element={<FeatureManagement />} />
          <Route path="/backup" element={<DataExport />} />
          <Route path="/email" element={<EmailSettings />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MainContent>
    </AdminContainer>
  );
};

export default Admin;
