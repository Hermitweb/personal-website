import React, { useState } from 'react';
import styled from 'styled-components';
import { FaDatabase, FaBlog, FaFileAlt, FaEnvelope } from 'react-icons/fa';
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

export default DataExport;
