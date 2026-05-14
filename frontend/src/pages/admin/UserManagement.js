import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import {
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaShieldAlt,
  FaKey,
  FaSearch,
  FaPlus,
  FaUserPlus
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

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['danger', 'success', 'warning'].includes(prop)
})`
  background: none;
  border: none;
  color: ${props => props.$danger ? '#e74c3c' : props.$success ? '#2ecc71' : props.$warning ? '#f39c12' : '#00d4ff'};
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-right: 0.25rem;

  &:hover {
    background: ${props => props.$danger ? 'rgba(231, 76, 60, 0.1)' : props.$success ? 'rgba(46, 204, 113, 0.1)' : props.$warning ? 'rgba(243, 156, 18, 0.1)' : 'rgba(0, 212, 255, 0.1)'};
  }
`;

const Badge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background: ${props => {
    switch(props.type) {
      case 'admin': return 'rgba(0, 212, 255, 0.2)';
      case 'user': return 'rgba(46, 204, 113, 0.2)';
      default: return 'rgba(149, 165, 166, 0.2)';
    }
  }};
  color: ${props => {
    switch(props.type) {
      case 'admin': return '#00d4ff';
      case 'user': return '#2ecc71';
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

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
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

const SearchInput = styled.input`
  width: 100%;
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

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  cursor: pointer;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: #00d4ff;
  }

  option {
    background: #1a1a2e;
    color: #fff;
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

const ResultCount = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  margin-bottom: 1rem;
`;

// ============ 权限弹窗样式 ============

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
`;

const ModalContent = styled.div`
  background: rgba(26, 26, 46, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h2 {
    color: #fff;
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #fff;
  }
`;

const PermissionGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const PermissionGroupTitle = styled.div`
  color: #00d4ff;
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PermissionItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9rem;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #00d4ff;
    cursor: pointer;
  }
`;

const PermissionDesc = styled.span`
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8rem;
  margin-left: auto;
`;

const PermissionNote = styled.div`
  background: rgba(243, 156, 18, 0.1);
  border: 1px solid rgba(243, 156, 18, 0.3);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.25rem;
  color: #f39c12;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const SaveButton = styled.button`
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
  border: none;
  border-radius: 10px;
  color: #000;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 15px rgba(0, 212, 255, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelButton = styled.button`
  padding: 0.6rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ResetButton = styled.button`
  padding: 0.6rem 1.5rem;
  background: rgba(243, 156, 18, 0.2);
  border: 1px solid rgba(243, 156, 18, 0.4);
  border-radius: 10px;
  color: #f39c12;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(243, 156, 18, 0.3);
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
  border: none;
  border-radius: 10px;
  color: #000;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0, 212, 255, 0.4);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
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

// 角色标签映射
const roleLabels = {
  admin: '👑 管理员',
  user: '👤 普通用户'
};

// ============ 权限定义 ============
const PERMISSION_GROUPS = [
  {
    name: '内容管理',
    icon: '📝',
    permissions: [
      { key: 'content_view', label: '查看内容', desc: '查看内容列表' },
      { key: 'content_create', label: '创建内容', desc: '添加新内容' },
      { key: 'content_edit', label: '编辑内容', desc: '修改已有内容' },
      { key: 'content_delete', label: '删除内容', desc: '删除内容' }
    ]
  },
  {
    name: '博客管理',
    icon: '📰',
    permissions: [
      { key: 'blog_view', label: '查看博客', desc: '查看文章列表' },
      { key: 'blog_create', label: '发布文章', desc: '创建新文章' },
      { key: 'blog_edit', label: '编辑文章', desc: '修改已有文章' },
      { key: 'blog_delete', label: '删除文章', desc: '删除文章' }
    ]
  },
  {
    name: '用户管理',
    icon: '👥',
    permissions: [
      { key: 'user_view', label: '查看用户', desc: '查看用户列表' },
      { key: 'user_edit', label: '编辑用户', desc: '修改用户信息' },
      { key: 'user_delete', label: '删除用户', desc: '删除用户' },
      { key: 'user_manage_permissions', label: '设置权限', desc: '修改用户权限' }
    ]
  },
  {
    name: '留言管理',
    icon: '💬',
    permissions: [
      { key: 'message_view', label: '查看留言', desc: '查看留言列表' },
      { key: 'message_reply', label: '回复留言', desc: '回复用户留言' },
      { key: 'message_delete', label: '删除留言', desc: '删除留言' }
    ]
  },
  {
    name: '系统设置',
    icon: '⚙️',
    permissions: [
      { key: 'settings_view', label: '查看设置', desc: '查看系统设置' },
      { key: 'settings_edit', label: '修改设置', desc: '修改网站设置' },
      { key: 'settings_email', label: '邮件配置', desc: '管理邮件服务' },
      { key: 'settings_ssl', label: 'SSL配置', desc: '管理SSL证书' }
    ]
  },
  {
    name: '数据管理',
    icon: '💾',
    permissions: [
      { key: 'data_export', label: '导出数据', desc: '导出网站数据' },
      { key: 'data_import', label: '导入数据', desc: '导入备份数据' },
      { key: 'data_backup', label: '数据备份', desc: '管理数据备份' }
    ]
  },
  {
    name: '功能开关',
    icon: '🔌',
    permissions: [
      { key: 'feature_view', label: '查看开关', desc: '查看功能开关' },
      { key: 'feature_edit', label: '修改开关', desc: '启用/禁用功能' }
    ]
  },
  {
    name: '访客统计',
    icon: '📊',
    permissions: [
      { key: 'stats_view', label: '查看统计', desc: '查看访客数据' }
    ]
  }
];

// 管理员默认拥有全部权限
const ADMIN_DEFAULT_PERMISSIONS = {};
PERMISSION_GROUPS.forEach(group => {
  group.permissions.forEach(p => {
    ADMIN_DEFAULT_PERMISSIONS[p.key] = true;
  });
});

// 普通用户默认权限
const USER_DEFAULT_PERMISSIONS = {
  content_view: true,
  blog_view: true,
  message_view: true,
  stats_view: true,
  feature_view: true,
  settings_view: true
};

// ============ UserManagement 组件 ============

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ role: '', isActive: true, groupId: '' });
  const [permissionModal, setPermissionModal] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    groupId: ''
  });
  const [savingAdd, setSavingAdd] = useState(false);

  // 密码修改弹窗状态
  const [passwordModal, setPasswordModal] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  // 添加用户
  const handleAddUser = async () => {
    if (!addForm.username.trim()) {
      toast.error('用户名不能为空');
      return;
    }
    if (!addForm.email.trim()) {
      toast.error('邮箱不能为空');
      return;
    }
    if (!addForm.password || addForm.password.length < 6) {
      toast.error('密码至少6位');
      return;
    }

    setSavingAdd(true);
    try {
      await axios.post('/api/users/register', addForm);
      toast.success('用户添加成功');
      setAddModalOpen(false);
      setAddForm({ username: '', email: '', password: '', role: 'user', groupId: '' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || '添加用户失败');
    } finally {
      setSavingAdd(false);
    }
  };

  // 过滤后的用户
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

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

  // 打开权限设置弹窗
  const handleOpenPermissions = (user) => {
    setPermissionModal(user);
    if (user.role === 'admin') {
      setPermissions({ ...ADMIN_DEFAULT_PERMISSIONS });
    } else {
      setPermissions({
        ...USER_DEFAULT_PERMISSIONS,
        ...(user.permissions || {})
      });
    }
  };

  // 切换单个权限
  const handleTogglePermission = (key) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // 全选/取消全选某个分组
  const handleToggleGroup = (group) => {
    const groupKeys = group.permissions.map(p => p.key);
    const allEnabled = groupKeys.every(key => permissions[key]);

    const newPermissions = { ...permissions };
    groupKeys.forEach(key => {
      newPermissions[key] = !allEnabled;
    });
    setPermissions(newPermissions);
  };

  // 保存权限
  const handleSavePermissions = async () => {
    if (!permissionModal) return;
    setSavingPermissions(true);
    try {
      await axios.put(`/api/users/${permissionModal.id}`, {
        permissions
      });
      toast.success(`已更新 ${permissionModal.username} 的权限`);
      setPermissionModal(null);
      fetchUsers();
    } catch (error) {
      toast.error('保存权限失败');
    } finally {
      setSavingPermissions(false);
    }
  };

  // 重置为角色默认权限
  const handleResetPermissions = () => {
    if (!permissionModal) return;
    if (permissionModal.role === 'admin') {
      setPermissions({ ...ADMIN_DEFAULT_PERMISSIONS });
    } else {
      setPermissions({ ...USER_DEFAULT_PERMISSIONS });
    }
    toast.info('已重置为默认权限');
  };

  // 打开密码修改弹窗
  const handleOpenPasswordModal = (user) => {
    setPasswordModal(user);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
  };

  // 关闭密码修改弹窗
  const handleClosePasswordModal = () => {
    setPasswordModal(null);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
  };

  // 保存新密码
  const handleSavePassword = async () => {
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      toast.error('密码至少6位');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    setSavingPassword(true);
    try {
      await axios.put(`/api/users/${passwordModal.id}/password`, {
        newPassword: passwordForm.newPassword
      });
      toast.success(`已修改 ${passwordModal.username} 的密码`);
      handleClosePasswordModal();
    } catch (error) {
      toast.error(error.response?.data?.message || '修改密码失败');
    } finally {
      setSavingPassword(false);
    }
  };

  // 统计已启用权限数
  const getEnabledCount = () => {
    return Object.values(permissions).filter(Boolean).length;
  };

  // 获取总权限数
  const getTotalCount = () => {
    return PERMISSION_GROUPS.reduce((sum, g) => sum + g.permissions.length, 0);
  };

  if (loading) return <div style={{ color: '#fff' }}>加载中...</div>;

  return (
    <>
      <StickyHeader>
        <Header>
          <Title>用户管理</Title>
          <AddButton onClick={() => setAddModalOpen(true)}>
            <FaUserPlus /> 添加用户
          </AddButton>
        </Header>
        <FilterBar>
          <SearchWrapper>
            <FaSearch />
            <SearchInput
              type="text"
              placeholder="搜索用户名或邮箱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchWrapper>
          <FilterSelect
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">全部角色</option>
            <option value="admin">管理员</option>
            <option value="user">普通用户</option>
          </FilterSelect>
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">全部状态</option>
            <option value="active">已激活</option>
            <option value="inactive">未激活</option>
          </FilterSelect>
        </FilterBar>
      </StickyHeader>

      <Card>

        <ResultCount>共 {filteredUsers.length} 个用户</ResultCount>

        <Table>
          <thead>
            <tr>
              <Th>用户名</Th>
              <Th>邮箱</Th>
              <Th>角色</Th>
              <Th>所属组</Th>
              <Th>状态</Th>
              <Th>权限</Th>
              <Th>注册时间</Th>
              <Th>操作</Th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map(user => (
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
                    <Badge type={user.role}>{roleLabels[user.role] || user.role}</Badge>
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
                <Td>
                  <Badge type={user.role === 'admin' ? 'admin' : 'default'}>
                    {user.role === 'admin' ? '全部' : `${Object.values(user.permissions || {}).filter(Boolean).length}/${getTotalCount()}`}
                  </Badge>
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
                      <ActionButton $warning onClick={() => handleOpenPermissions(user)} title="设置权限">
                        <FaShieldAlt />
                      </ActionButton>
                      <ActionButton onClick={() => handleEdit(user)} title="编辑">
                        <FaEdit />
                      </ActionButton>
                      <ActionButton $success onClick={() => handleOpenPasswordModal(user)} title="修改密码">
                        <FaKey />
                      </ActionButton>
                      <ActionButton $danger onClick={() => handleDelete(user.id)} title="删除">
                        <FaTrash />
                      </ActionButton>
                    </>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>

        <AdminPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Card>

      {/* 权限设置弹窗 */}
      {/* 添加用户弹窗 */}
      {addModalOpen && ReactDOM.createPortal(
        <ModalOverlay onClick={() => setAddModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2><FaUserPlus /> 添加用户</h2>
              <CloseButton onClick={() => setAddModalOpen(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <FormGroup>
              <Label>用户名</Label>
              <Input
                type="text"
                placeholder="请输入用户名"
                value={addForm.username}
                onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label>邮箱</Label>
              <Input
                type="email"
                placeholder="请输入邮箱地址"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label>密码</Label>
              <Input
                type="password"
                placeholder="请输入密码（至少6位）"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label>角色</Label>
              <FilterSelect
                value={addForm.role}
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
              >
                <option value="user">普通用户</option>
                <option value="admin">管理员</option>
              </FilterSelect>
            </FormGroup>

            <FormGroup>
              <Label>用户组</Label>
              <FilterSelect
                value={addForm.groupId}
                onChange={(e) => setAddForm({ ...addForm, groupId: e.target.value })}
              >
                <option value="">无分组</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </FilterSelect>
            </FormGroup>

            <ButtonGroup>
              <CancelButton onClick={() => setAddModalOpen(false)}>
                取消
              </CancelButton>
              <SaveButton onClick={handleAddUser} disabled={savingAdd}>
                <FaPlus /> {savingAdd ? '添加中...' : '添加用户'}
              </SaveButton>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>,
        document.body
      )}

      {/* 权限设置弹窗 */}
      {permissionModal && ReactDOM.createPortal(
        <ModalOverlay onClick={() => setPermissionModal(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2><FaShieldAlt /> 权限设置 - {permissionModal.username}</h2>
              <CloseButton onClick={() => setPermissionModal(null)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <PermissionNote>
              <FaKey />
              当前角色：{roleLabels[permissionModal.role]} | 已启用 {getEnabledCount()}/{getTotalCount()} 项权限
            </PermissionNote>

            {PERMISSION_GROUPS.map(group => {
              const allEnabled = group.permissions.every(p => permissions[p.key]);
              return (
                <PermissionGroup key={group.name}>
                  <PermissionGroupTitle>
                    <span>{group.icon}</span>
                    {group.name}
                    <label
                      style={{
                        marginLeft: 'auto',
                        fontSize: '0.8rem',
                        color: 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={allEnabled}
                        onChange={() => handleToggleGroup(group)}
                        style={{ width: '16px', height: '16px', accentColor: '#00d4ff' }}
                      />
                      全选
                    </label>
                  </PermissionGroupTitle>
                  {group.permissions.map(perm => (
                    <PermissionItem key={perm.key}>
                      <input
                        type="checkbox"
                        checked={!!permissions[perm.key]}
                        onChange={() => handleTogglePermission(perm.key)}
                      />
                      {perm.label}
                      <PermissionDesc>{perm.desc}</PermissionDesc>
                    </PermissionItem>
                  ))}
                </PermissionGroup>
              );
            })}

            <ButtonGroup>
              <ResetButton onClick={handleResetPermissions}>
                <FaKey /> 恢复默认
              </ResetButton>
              <CancelButton onClick={() => setPermissionModal(null)}>
                取消
              </CancelButton>
              <SaveButton onClick={handleSavePermissions} disabled={savingPermissions}>
                <FaSave /> {savingPermissions ? '保存中...' : '保存权限'}
              </SaveButton>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>,
        document.body
      )}

      {/* 密码修改弹窗 */}
      {passwordModal && ReactDOM.createPortal(
        <ModalOverlay onClick={handleClosePasswordModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2><FaKey /> 修改密码 - {passwordModal.username}</h2>
              <CloseButton onClick={handleClosePasswordModal}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <FormGroup>
              <Label>新密码</Label>
              <Input
                type="password"
                placeholder="请输入新密码（至少6位）"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label>确认密码</Label>
              <Input
                type="password"
                placeholder="请再次输入新密码"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </FormGroup>

            <ButtonGroup>
              <CancelButton onClick={handleClosePasswordModal}>取消</CancelButton>
              <SaveButton onClick={handleSavePassword} disabled={savingPassword}>
                {savingPassword ? '保存中...' : '保存密码'}
              </SaveButton>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>,
        document.body
      )}
    </>
  );
};

export default UserManagement;
