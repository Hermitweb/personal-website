import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import PrivateRoute from './PrivateRoute';
import Admin from '../pages/Admin';

// 动态后台入口路由组件
const DynamicAdminRoute = () => {
  const { '*': subPath } = useParams();
  const location = useLocation();
  const [adminRoute, setAdminRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从配置中获取后台入口路径
    const fetchAdminRoute = async () => {
      try {
        const response = await axios.get('/api/config');
        setAdminRoute(response.data.admin_route || 'admin');
      } catch (error) {
        console.error('获取后台入口配置失败:', error);
        setAdminRoute('admin');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminRoute();
  }, []);

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>加载中...</div>;
  }

  // 获取当前路径的第一段
  const currentPath = location.pathname.split('/')[1];
  
  // 如果当前路径与配置的后台入口不匹配，重定向到正确的入口
  if (currentPath !== adminRoute) {
    return <Navigate to={`/${adminRoute}${subPath ? '/' + subPath : ''}`} replace />;
  }

  // 路径匹配，渲染后台页面
  return (
    <PrivateRoute adminOnly>
      <Admin />
    </PrivateRoute>
  );
};

export default DynamicAdminRoute;
