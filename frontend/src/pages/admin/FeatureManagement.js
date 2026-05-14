import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background: ${props => props.active ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)'};
  color: ${props => props.active ? '#2ecc71' : '#e74c3c'};
`;

const FeatureList = styled.div`
  min-height: 600px;
`;

// ============ 功能开关组件 ============

const FeatureManagement = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

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

  const totalPages = Math.ceil(features.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedFeatures = features.slice(startIndex, startIndex + pageSize);

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
    blog: { title: '博客系统', desc: '启用后前台显示博客文章列表、详情页和管理入口' },
    messageBoard: { title: '留言板', desc: '启用后访客可以公开发布留言和查看留言列表' },
    visitorStats: { title: '访客统计', desc: '启用后记录访客访问数据，可在后台查看统计报表' },
    search: { title: '全站搜索', desc: '启用后支持搜索博客文章和网站内容' },
    multiLanguage: { title: '多语言支持', desc: '启用后支持中英文界面切换' },
    themeToggle: { title: '主题切换', desc: '启用后支持暗色/亮色主题切换按钮' },
    projectDetail: { title: '项目详情页', desc: '启用后项目卡片可点击查看独立详情页面' },
    bookmarks: { title: '站点收藏', desc: '启用后首页显示站点收藏板块和推荐链接' }
  };

  if (loading) return <div style={{ color: '#fff' }}>加载中...</div>;

  return (
    <>
      <StickyHeader>
        <Header>
          <Title>功能开关</Title>
        </Header>
      </StickyHeader>

      <Card>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
          在这里可以开启或关闭网站的各项功能，关闭后前台将不显示相关入口。
        </p>

        <FeatureList>
        {paginatedFeatures.map(feature => {
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
        </FeatureList>

        <AdminPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Card>
    </>
  );
};

export default FeatureManagement;
