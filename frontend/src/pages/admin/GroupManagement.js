import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaShieldAlt,
  FaKey,
  FaSave
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

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.5);
`;

// ============ 创建/编辑组弹窗样式 ============

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
  z-index: 2000;
  padding: 20px;
  overflow-y: auto;
`;

const ModalContent = styled.div`
  background: rgba(26, 26, 46, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  width: 90%;
  max-width: 700px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h2, h3 {
    color: #fff;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
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

// ============ 权限弹窗样式 ============

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

const getTotalCount = () => PERMISSION_GROUPS.reduce((sum, g) => sum + g.permissions.length, 0);

// ============ GroupManagement 组件 ============

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [permGroup, setPermGroup] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [permissions, setPermissions] = useState({});
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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

  // 打开权限设置弹窗
  const handleOpenPermissions = (group) => {
    setPermGroup(group);
    // 将数组格式转为对象格式
    const permObj = {};
    if (Array.isArray(group.permissions)) {
      group.permissions.forEach(key => { permObj[key] = true; });
    } else if (group.permissions && typeof group.permissions === 'object') {
      Object.assign(permObj, group.permissions);
    }
    setPermissions(permObj);
    setShowPermModal(true);
  };

  const handleTogglePermission = (key) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleToggleGroup = (group) => {
    const groupKeys = group.permissions.map(p => p.key);
    const allEnabled = groupKeys.every(key => permissions[key]);
    const newPermissions = { ...permissions };
    groupKeys.forEach(key => {
      newPermissions[key] = !allEnabled;
    });
    setPermissions(newPermissions);
  };

  const handleSavePermissions = async () => {
    if (!permGroup) return;
    setSavingPermissions(true);
    try {
      // 转为数组格式存储
      const enabledKeys = Object.entries(permissions)
        .filter(([_, v]) => v)
        .map(([k]) => k);
      await axios.put(`/api/groups/${permGroup.id}`, {
        permissions: enabledKeys
      });
      toast.success(`已更新「${permGroup.name}」的权限`);
      setShowPermModal(false);
      fetchGroups();
    } catch (error) {
      toast.error('保存权限失败');
    } finally {
      setSavingPermissions(false);
    }
  };

  const handleResetPermissions = () => {
    setPermissions({});
    toast.info('已清除所有权限');
  };

  const getEnabledCount = () => Object.values(permissions).filter(Boolean).length;

  const totalPages = Math.ceil(groups.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedGroups = groups.slice(startIndex, startIndex + pageSize);

  if (loading) return <div style={{ color: '#fff' }}>加载中...</div>;

  return (
    <>
      <StickyHeader>
        <Header>
          <Title>用户组管理</Title>
          <AddButton onClick={() => { setEditingGroup(null); setFormData({ name: '', description: '' }); setShowModal(true); }}>
            <FaPlus /> 新建组
          </AddButton>
        </Header>
      </StickyHeader>

      <Card>
        {groups.length === 0 ? (
          <EmptyState>暂无组，点击上方按钮创建</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>组名</Th>
                <Th>描述</Th>
                <Th>权限</Th>
                <Th>成员数</Th>
                <Th>创建时间</Th>
                <Th>操作</Th>
              </tr>
            </thead>
            <tbody>
              {paginatedGroups.map(group => {
                const permCount = Array.isArray(group.permissions)
                  ? group.permissions.length
                  : Object.values(group.permissions || {}).filter(Boolean).length;
                return (
                  <tr key={group.id}>
                    <Td>{group.name}</Td>
                    <Td>{group.description || '-'}</Td>
                    <Td>
                      <Badge type={permCount === getTotalCount() ? 'admin' : 'default'}>
                        {permCount === getTotalCount() ? '全部' : `${permCount}/${getTotalCount()}`}
                      </Badge>
                    </Td>
                    <Td>{group.users?.length || 0}</Td>
                    <Td>{new Date(group.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      <ActionButton $warning onClick={() => handleOpenPermissions(group)} title="设置权限">
                        <FaShieldAlt />
                      </ActionButton>
                      <ActionButton onClick={() => handleEdit(group)} title="编辑">
                        <FaEdit />
                      </ActionButton>
                      <ActionButton $danger onClick={() => handleDelete(group.id)} title="删除">
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

      {/* 创建/编辑组弹窗 */}
      {showModal && ReactDOM.createPortal(
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
        </ModalOverlay>,
        document.body
      )}

      {/* 权限设置弹窗 */}
      {showPermModal && permGroup && ReactDOM.createPortal(
        <ModalOverlay onClick={() => setShowPermModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h2><FaShieldAlt /> 权限设置 - {permGroup.name}</h2>
              <CloseButton onClick={() => setShowPermModal(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <PermissionNote>
              <FaKey />
              组权限将自动应用于该组下的所有用户 | 已启用 {getEnabledCount()}/{getTotalCount()} 项权限
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
                <FaKey /> 清除全部
              </ResetButton>
              <CancelButton onClick={() => setShowPermModal(false)}>
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
    </>
  );
};

export default GroupManagement;
