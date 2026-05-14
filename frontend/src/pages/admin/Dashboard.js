import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaUsers,
  FaFileAlt,
  FaBlog,
  FaCog
} from 'react-icons/fa';
import axios from 'axios';

// ============ 样式组件 ============

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

const AddButton = ({ as: Component = motion.button, children, ...props }) => (
  <Component
    {...props}
    whileHover={Component === motion.button ? { scale: 1.02 } : undefined}
    whileTap={Component === motion.button ? { scale: 0.98 } : undefined}
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
      cursor: 'pointer',
      textDecoration: 'none',
      ...props.style
    }}
  >
    {children}
  </Component>
);

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 1.5rem;
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

// ============ Dashboard 组件 ============

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

export default Dashboard;
