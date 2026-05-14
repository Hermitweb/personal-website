import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
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

export default VisitorStats;
