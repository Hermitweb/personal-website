import React, { Suspense, lazy } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaUsers, FaFileAlt, FaCog, FaSignOutAlt, FaBlog, FaChartLine, FaDatabase, FaEnvelope, FaUser, FaUserCog, FaComments, FaToggleOn, FaEnvelopeOpen, FaLayerGroup } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// ============ 懒加载子组件 ============
const Dashboard = lazy(() => import('./admin/Dashboard'));
const ContentManagement = lazy(() => import('./admin/ContentManagement'));
const BlogManagement = lazy(() => import('./admin/BlogManagement'));
const ProfileSettings = lazy(() => import('./admin/ProfileSettings'));
const UserManagement = lazy(() => import('./admin/UserManagement'));
const GroupManagement = lazy(() => import('./admin/GroupManagement'));
const RegisterSettings = lazy(() => import('./admin/RegisterSettings'));
const MessageManagement = lazy(() => import('./admin/MessageManagement'));
const VisitorStats = lazy(() => import('./admin/VisitorStats'));
const FeatureManagement = lazy(() => import('./admin/FeatureManagement'));
const DataExport = lazy(() => import('./admin/DataExport'));
const EmailSettings = lazy(() => import('./admin/EmailSettings'));
const Settings = lazy(() => import('./admin/Settings'));
const SectionManagement = lazy(() => import('./admin/SectionManagement'));

// ============ 布局样式组件 ============
const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
`;

const Sidebar = styled.aside`
  width: 260px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 10;
`;

const SidebarTop = styled.div`
  flex-shrink: 0;
  background: #1a1a2e;
`;

const SidebarNav = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
  background: #1a1a2e;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
  }
`;

const SidebarBottom = styled.div`
  flex-shrink: 0;
  background: #1a1a2e;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.div`
  padding: 0 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
  
  h1 {
    color: #fff;
    font-size: 1.3rem;
    font-weight: 700;
    background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.8rem;
    margin-top: 0.3rem;
  }
`;

const NavSection = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'marginTop'
})`
  padding: 0.5rem 1rem;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: ${props => props.$marginTop || '0'};
`;

const NavItem = styled(Link).withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: ${props => props.$active ? '#00d4ff' : 'rgba(255, 255, 255, 0.7)'};
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid ${props => props.$active ? '#00d4ff' : 'transparent'};
  background: ${props => props.$active ? 'rgba(0, 212, 255, 0.1)' : 'transparent'};

  &:hover {
    color: #00d4ff;
    background: rgba(0, 212, 255, 0.05);
  }

  svg {
    font-size: 1.1rem;
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 260px;
  padding: 2rem;
  min-height: 100vh;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #fff;
  
  &::after {
    content: '';
    width: 50px;
    height: 50px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #00d4ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const UserInfo = styled.div`
  padding: 1rem 1.5rem;
  
  p {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
  }
  
  span {
    color: #fff;
    font-weight: 600;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid #e74c3c;
  border-radius: 8px;
  color: #e74c3c;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  
  &:hover {
    background: #e74c3c;
    color: #fff;
  }
`;

const HomeButton = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  color: #00d4ff;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  text-decoration: none;
  margin-top: 0.5rem;

  &:hover {
    background: rgba(0, 212, 255, 0.2);
    border-color: #00d4ff;
  }
`;

// 页面切换动画
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
};

// 加载中组件
const LoadingFallback = () => (
  <LoadingContainer />
);

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('已退出登录');
    navigate('/login');
  };

  return (
    <Container>
      <Sidebar>
        <SidebarTop>
          <Logo>
            <h1>管理后台</h1>
            <p>Personal Website Admin</p>
          </Logo>
        </SidebarTop>

        <SidebarNav>
          <NavItem to="/admin" $active={location.pathname === '/admin' || location.pathname === '/admin/'}>
            <FaHome /> 概览
          </NavItem>

          <NavSection $marginTop="1rem">内容管理</NavSection>
          <NavItem to="/admin/contents" $active={location.pathname.includes('/admin/contents')}>
            <FaFileAlt /> 内容管理
          </NavItem>
          <NavItem to="/admin/sections" $active={location.pathname.includes('/admin/sections')}>
            <FaLayerGroup /> 板块管理
          </NavItem>
          <NavItem to="/admin/blogs" $active={location.pathname.includes('/admin/blogs')}>
            <FaBlog /> 博客管理
          </NavItem>

          <NavSection>用户与权限</NavSection>
          <NavItem to="/admin/profile" $active={location.pathname.includes('/admin/profile')}>
            <FaUser /> 个人信息
          </NavItem>
          <NavItem to="/admin/users" $active={location.pathname.includes('/admin/users')}>
            <FaUsers /> 用户管理
          </NavItem>
          <NavItem to="/admin/groups" $active={location.pathname.includes('/admin/groups')}>
            <FaUserCog /> 用户组管理
          </NavItem>
          <NavItem to="/admin/register-settings" $active={location.pathname.includes('/admin/register-settings')}>
            <FaCog /> 注册设置
          </NavItem>

          <NavSection>互动与数据</NavSection>
          <NavItem to="/admin/messages" $active={location.pathname.includes('/admin/messages')}>
            <FaComments /> 留言管理
          </NavItem>
          <NavItem to="/admin/visitors" $active={location.pathname.includes('/admin/visitors')}>
            <FaChartLine /> 访客统计
          </NavItem>

          <NavSection>系统设置</NavSection>
          <NavItem to="/admin/features" $active={location.pathname.includes('/admin/features')}>
            <FaToggleOn /> 功能开关
          </NavItem>
          <NavItem to="/admin/backup" $active={location.pathname.includes('/admin/backup')}>
            <FaDatabase /> 数据备份
          </NavItem>
          <NavItem to="/admin/email" $active={location.pathname.includes('/admin/email')}>
            <FaEnvelopeOpen /> 邮件配置
          </NavItem>
          <NavItem to="/admin/settings" $active={location.pathname.includes('/admin/settings')}>
            <FaCog /> 网站设置
          </NavItem>
        </SidebarNav>

        <SidebarBottom>
          <UserInfo>
            <p>当前用户</p>
            <span>{user?.username || '管理员'}</span>
            <HomeButton href="/" target="_blank" rel="noopener noreferrer">
              <FaHome /> 访问首页
            </HomeButton>
            <LogoutButton onClick={handleLogout}>
              <FaSignOutAlt /> 退出登录
            </LogoutButton>
          </UserInfo>
        </SidebarBottom>
      </Sidebar>

      <MainContent>
        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route index element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Dashboard />
                </motion.div>
              } />
              <Route path="contents" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <ContentManagement />
                </motion.div>
              } />
              <Route path="sections" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <SectionManagement />
                </motion.div>
              } />
              <Route path="blogs" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <BlogManagement />
                </motion.div>
              } />
              <Route path="profile" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <ProfileSettings />
                </motion.div>
              } />
              <Route path="users" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <UserManagement />
                </motion.div>
              } />
              <Route path="groups" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <GroupManagement />
                </motion.div>
              } />
              <Route path="register-settings" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <RegisterSettings />
                </motion.div>
              } />
              <Route path="messages" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <MessageManagement />
                </motion.div>
              } />
              <Route path="visitors" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <VisitorStats />
                </motion.div>
              } />
              <Route path="features" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <FeatureManagement />
                </motion.div>
              } />
              <Route path="backup" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <DataExport />
                </motion.div>
              } />
              <Route path="email" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <EmailSettings />
                </motion.div>
              } />
              <Route path="settings" element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Settings />
                </motion.div>
              } />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </MainContent>
    </Container>
  );
};

export default Admin;
