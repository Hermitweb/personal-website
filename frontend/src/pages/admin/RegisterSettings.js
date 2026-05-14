import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSave } from 'react-icons/fa';
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

const Description = styled.p`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.5rem;
  margin-bottom: 0;
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

// ============ RegisterSettings 组件 ============

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

export default RegisterSettings;
