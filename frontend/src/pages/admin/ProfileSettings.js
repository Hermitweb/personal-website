import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSave, FaUser, FaLock, FaPalette, FaBell, FaCog, FaGlobe } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { compressImage, validateImage } from '../../utils/imageCompression';

// ============ 样式组件 ============

const DomainCard = styled(Card)`
  border-color: ${props => props.hasDomain ? 'rgba(46, 204, 113, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
`;

const DomainStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: ${props => props.active ? 'rgba(46, 204, 113, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.active ? 'rgba(46, 204, 113, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 10px;
  margin-bottom: 1rem;
`;

const DomainStatusDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.active ? '#2ecc71' : '#e74c3c'};
  box-shadow: 0 0 8px ${props => props.active ? 'rgba(46, 204, 113, 0.5)' : 'rgba(231, 76, 60, 0.5)'};
`;

const DomainConfigGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DomainConfigItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.checked ? 'rgba(0, 212, 255, 0.3)' : 'transparent'};

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const DomainConfigCheckbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #00d4ff;
  cursor: pointer;
`;

const DomainConfigLabel = styled.div`
  flex: 1;
`;

const DomainConfigTitle = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-weight: 500;
`;

const DomainConfigDesc = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

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

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  color: #fff;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.5rem;
  margin-bottom: 0;
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

const Form = styled.form`
  padding: 1rem 0;
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
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.2);
  }

  option {
    background: #1a1a2e;
    color: #fff;
  }
`;

const ToggleGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  margin-bottom: 0.75rem;
`;

const ToggleLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.1);
    transition: 0.3s;
    border-radius: 26px;

    &:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: #00d4ff;
  }

  input:checked + span:before {
    transform: translateX(24px);
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid ${props => props.checked ? '#00d4ff' : 'transparent'};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.9);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  input {
    display: none;
  }
`;

const ResetButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;

  svg {
    color: #00d4ff;
    font-size: 1.25rem;
  }
`;

const SubSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const SubSectionTitle = styled.h4`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
`;

// ============ PersonalizationSettings 子组件 ============

const PersonalizationSettings = () => {
  const [prefs, setPrefs] = useState({
    theme: 'dark',
    language: 'zh-CN',
    density: 'comfortable',
    defaultEditor: 'rich',
    pageSize: 20,
    sidebarCollapsed: false,
    notifications: {
      email: true,
      browser: true,
      sound: false
    },
    editor: {
      autoSave: true,
      autoSaveInterval: 30,
      spellCheck: true,
      wordWrap: true,
      lineNumbers: true
    },
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    table: {
      showPagination: true,
      stickyHeader: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // 域名配置状态
  const [domainConfig, setDomainConfig] = useState({
    customDomain: '',
    enabled: false,
    showPublicContent: true,
    showProjects: true,
    showSkills: true,
    showBlog: true,
    showBookmarks: true
  });
  const [domainAvailable, setDomainAvailable] = useState(true);
  const [checkingDomain, setCheckingDomain] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get('/api/user-config');
      setPrefs(prev => ({ ...prev, ...response.data }));

      // 获取域名配置
      try {
        const domainResponse = await axios.get('/api/domain-config/user');
        setDomainConfig(prev => ({
          ...prev,
          ...domainResponse.data
        }));
      } catch (domainError) {
        console.error('获取域名配置失败:', domainError);
      }
    } catch (error) {
      console.error('获取个性化配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 检查域名可用性
  const checkDomainAvailability = async (domain) => {
    if (!domain) return;
    setCheckingDomain(true);
    try {
      const response = await axios.get(`/api/domain-config/check?domain=${domain}`);
      setDomainAvailable(response.data.available);
    } catch (error) {
      setDomainAvailable(false);
    } finally {
      setCheckingDomain(false);
    }
  };

  // 保存域名配置
  const handleSaveDomainConfig = async () => {
    if (domainConfig.customDomain && !domainAvailable) {
      toast.error('该域名已被使用，请更换域名');
      return;
    }

    setSaving(true);
    try {
      await axios.put('/api/domain-config/user', {
        customDomain: domainConfig.customDomain || null,
        domainConfig: {
          enabled: domainConfig.enabled,
          showPublicContent: domainConfig.showPublicContent,
          showProjects: domainConfig.showProjects,
          showSkills: domainConfig.showSkills,
          showBlog: domainConfig.showBlog,
          showBookmarks: domainConfig.showBookmarks
        }
      });
      toast.success('域名配置保存成功');
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  const handleNestedChange = (section, key, value) => {
    setPrefs(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/api/user-config', prefs);
      toast.success('个性化配置保存成功');
      // 应用配置到本地存储，供其他组件使用
      localStorage.setItem('userPreferences', JSON.stringify(prefs));
      // 触发配置变更事件
      window.dispatchEvent(new CustomEvent('userPreferencesChanged', { detail: prefs }));
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('确定要重置为默认配置吗？')) return;
    
    setSaving(true);
    try {
      await axios.delete('/api/user-config');
      const response = await axios.get('/api/user-config');
      setPrefs(response.data);
      localStorage.setItem('userPreferences', JSON.stringify(response.data));
      window.dispatchEvent(new CustomEvent('userPreferencesChanged', { detail: response.data }));
      toast.success('已重置为默认配置');
    } catch (error) {
      toast.error('重置失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Card style={{ color: '#fff' }}>加载中...</Card>;

  return (
    <Card>
      <SectionHeader>
        <FaPalette />
        <SectionTitle>个性化设置</SectionTitle>
      </SectionHeader>
      <Description>自定义您的个人使用体验，这些设置仅对您自己生效</Description>

      {/* 外观设置 */}
      <SubSection>
        <SubSectionTitle>
          <FaCog style={{ marginRight: '0.5rem' }} />
          外观设置
        </SubSectionTitle>

        <FormGroup>
          <Label>主题</Label>
          <RadioGroup>
            <RadioLabel checked={prefs.theme === 'light'}>
              <input
                type="radio"
                name="theme"
                value="light"
                checked={prefs.theme === 'light'}
                onChange={(e) => handleChange('theme', e.target.value)}
              />
              ☀️ 浅色
            </RadioLabel>
            <RadioLabel checked={prefs.theme === 'dark'}>
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={prefs.theme === 'dark'}
                onChange={(e) => handleChange('theme', e.target.value)}
              />
              🌙 深色
            </RadioLabel>
            <RadioLabel checked={prefs.theme === 'auto'}>
              <input
                type="radio"
                name="theme"
                value="auto"
                checked={prefs.theme === 'auto'}
                onChange={(e) => handleChange('theme', e.target.value)}
              />
              🔄 跟随系统
            </RadioLabel>
          </RadioGroup>
          <Description>选择您喜欢的界面主题风格</Description>
        </FormGroup>

        <FormGroup>
          <Label>界面密度</Label>
          <RadioGroup>
            <RadioLabel checked={prefs.density === 'compact'}>
              <input
                type="radio"
                name="density"
                value="compact"
                checked={prefs.density === 'compact'}
                onChange={(e) => handleChange('density', e.target.value)}
              />
              紧凑
            </RadioLabel>
            <RadioLabel checked={prefs.density === 'comfortable'}>
              <input
                type="radio"
                name="density"
                value="comfortable"
                checked={prefs.density === 'comfortable'}
                onChange={(e) => handleChange('density', e.target.value)}
              />
              舒适
            </RadioLabel>
            <RadioLabel checked={prefs.density === 'spacious'}>
              <input
                type="radio"
                name="density"
                value="spacious"
                checked={prefs.density === 'spacious'}
                onChange={(e) => handleChange('density', e.target.value)}
              />
              宽松
            </RadioLabel>
          </RadioGroup>
          <Description>调整界面元素的间距大小</Description>
        </FormGroup>

        <FormGroup>
          <Label>侧边栏状态</Label>
          <ToggleGroup>
            <ToggleLabel>
              默认收起侧边栏
            </ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={prefs.sidebarCollapsed}
                onChange={(e) => handleChange('sidebarCollapsed', e.target.checked)}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleGroup>
          <Description>登录后侧边栏是否默认收起</Description>
        </FormGroup>
      </SubSection>

      {/* 语言与格式 */}
      <SubSection>
        <SubSectionTitle>语言与格式</SubSectionTitle>

        <FormGroup>
          <Label>语言</Label>
          <Select
            value={prefs.language}
            onChange={(e) => handleChange('language', e.target.value)}
          >
            <option value="zh-CN">简体中文</option>
            <option value="en-US">English</option>
          </Select>
          <Description>界面显示语言</Description>
        </FormGroup>

        <FormGroup>
          <Label>日期格式</Label>
          <Select
            value={prefs.dateFormat}
            onChange={(e) => handleChange('dateFormat', e.target.value)}
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY年MM月DD日">YYYY年MM月DD日</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>时间格式</Label>
          <RadioGroup>
            <RadioLabel checked={prefs.timeFormat === '24h'}>
              <input
                type="radio"
                name="timeFormat"
                value="24h"
                checked={prefs.timeFormat === '24h'}
                onChange={(e) => handleChange('timeFormat', e.target.value)}
              />
              24小时制
            </RadioLabel>
            <RadioLabel checked={prefs.timeFormat === '12h'}>
              <input
                type="radio"
                name="timeFormat"
                value="12h"
                checked={prefs.timeFormat === '12h'}
                onChange={(e) => handleChange('timeFormat', e.target.value)}
              />
              12小时制
            </RadioLabel>
          </RadioGroup>
        </FormGroup>
      </SubSection>

      {/* 编辑器设置 */}
      <SubSection>
        <SubSectionTitle>编辑器设置</SubSectionTitle>

        <FormGroup>
          <Label>默认编辑器</Label>
          <RadioGroup>
            <RadioLabel checked={prefs.defaultEditor === 'rich'}>
              <input
                type="radio"
                name="defaultEditor"
                value="rich"
                checked={prefs.defaultEditor === 'rich'}
                onChange={(e) => handleChange('defaultEditor', e.target.value)}
              />
              富文本编辑器
            </RadioLabel>
            <RadioLabel checked={prefs.defaultEditor === 'markdown'}>
              <input
                type="radio"
                name="defaultEditor"
                value="markdown"
                checked={prefs.defaultEditor === 'markdown'}
                onChange={(e) => handleChange('defaultEditor', e.target.value)}
              />
              Markdown编辑器
            </RadioLabel>
          </RadioGroup>
          <Description>新建文章时默认使用的编辑器</Description>
        </FormGroup>

        <FormGroup>
          <Label>自动保存</Label>
          <ToggleGroup>
            <ToggleLabel>启用自动保存</ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={prefs.editor?.autoSave}
                onChange={(e) => handleNestedChange('editor', 'autoSave', e.target.checked)}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleGroup>
        </FormGroup>

        {prefs.editor?.autoSave && (
          <FormGroup>
            <Label>自动保存间隔（秒）</Label>
            <Select
              value={prefs.editor?.autoSaveInterval || 30}
              onChange={(e) => handleNestedChange('editor', 'autoSaveInterval', parseInt(e.target.value))}
            >
              <option value={10}>10秒</option>
              <option value={30}>30秒</option>
              <option value={60}>1分钟</option>
              <option value={120}>2分钟</option>
              <option value={300}>5分钟</option>
            </Select>
          </FormGroup>
        )}

        <FormGroup>
          <Label>编辑器选项</Label>
          <ToggleGroup>
            <ToggleLabel>拼写检查</ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={prefs.editor?.spellCheck}
                onChange={(e) => handleNestedChange('editor', 'spellCheck', e.target.checked)}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleGroup>
          <ToggleGroup>
            <ToggleLabel>自动换行</ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={prefs.editor?.wordWrap}
                onChange={(e) => handleNestedChange('editor', 'wordWrap', e.target.checked)}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleGroup>
          <ToggleGroup>
            <ToggleLabel>显示行号</ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={prefs.editor?.lineNumbers}
                onChange={(e) => handleNestedChange('editor', 'lineNumbers', e.target.checked)}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleGroup>
        </FormGroup>
      </SubSection>

      {/* 表格设置 */}
      <SubSection>
        <SubSectionTitle>表格设置</SubSectionTitle>

        <FormGroup>
          <Label>默认分页大小</Label>
          <Select
            value={prefs.pageSize}
            onChange={(e) => handleChange('pageSize', parseInt(e.target.value))}
          >
            <option value={10}>10条/页</option>
            <option value={20}>20条/页</option>
            <option value={50}>50条/页</option>
            <option value={100}>100条/页</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <ToggleGroup>
            <ToggleLabel>显示分页控件</ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={prefs.table?.showPagination}
                onChange={(e) => handleNestedChange('table', 'showPagination', e.target.checked)}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleGroup>
          <ToggleGroup>
            <ToggleLabel>固定表头</ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={prefs.table?.stickyHeader}
                onChange={(e) => handleNestedChange('table', 'stickyHeader', e.target.checked)}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleGroup>
        </FormGroup>
      </SubSection>

      {/* 通知设置 */}
      <SubSection>
        <SubSectionTitle>
          <FaBell style={{ marginRight: '0.5rem' }} />
          通知设置
        </SubSectionTitle>

        <FormGroup>
          <ToggleGroup>
            <ToggleLabel>邮件通知</ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={prefs.notifications?.email}
                onChange={(e) => handleNestedChange('notifications', 'email', e.target.checked)}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleGroup>
          <ToggleGroup>
            <ToggleLabel>浏览器通知</ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={prefs.notifications?.browser}
                onChange={(e) => handleNestedChange('notifications', 'browser', e.target.checked)}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleGroup>
          <ToggleGroup>
            <ToggleLabel>提示音</ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={prefs.notifications?.sound}
                onChange={(e) => handleNestedChange('notifications', 'sound', e.target.checked)}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleGroup>
        </FormGroup>
      </SubSection>

      <ButtonGroup>
        <ResetButton type="button" onClick={handleReset} disabled={saving}>
          恢复默认
        </ResetButton>
        <SaveButton onClick={handleSave} disabled={saving}>
          <FaSave /> {saving ? '保存中...' : '保存配置'}
        </SaveButton>
      </ButtonGroup>
    </Card>
  );
};

// ============ CustomDomainSettings 子组件 ============

const CustomDomainSettings = () => {
  const [domainConfig, setDomainConfig] = useState({
    customDomain: '',
    enabled: false,
    showPublicContent: true,
    showProjects: true,
    showSkills: true,
    showBlog: true,
    showBookmarks: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [domainAvailable, setDomainAvailable] = useState(true);
  const [checkingDomain, setCheckingDomain] = useState(false);

  useEffect(() => {
    fetchDomainConfig();
  }, []);

  const fetchDomainConfig = async () => {
    try {
      const response = await axios.get('/api/domain-config/user');
      setDomainConfig(prev => ({
        ...prev,
        ...response.data,
        domainConfig: response.data.domainConfig ? {
          enabled: response.data.domainConfig.enabled || false,
          showPublicContent: response.data.domainConfig.showPublicContent !== false,
          showProjects: response.data.domainConfig.showProjects !== false,
          showSkills: response.data.domainConfig.showSkills !== false,
          showBlog: response.data.domainConfig.showBlog !== false,
          showBookmarks: response.data.domainConfig.showBookmarks !== false
        } : prev
      }));
    } catch (error) {
      console.error('获取域名配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkDomainAvailability = async (domain) => {
    if (!domain) return;
    setCheckingDomain(true);
    try {
      const response = await axios.get(`/api/domain-config/check?domain=${domain}`);
      setDomainAvailable(response.data.available);
    } catch (error) {
      setDomainAvailable(false);
    } finally {
      setCheckingDomain(false);
    }
  };

  const handleSave = async () => {
    if (domainConfig.customDomain && !domainAvailable) {
      toast.error('该域名已被使用，请更换域名');
      return;
    }

    setSaving(true);
    try {
      const configData = {
        customDomain: domainConfig.customDomain || null,
        domainConfig: {
          enabled: domainConfig.enabled,
          showPublicContent: domainConfig.showPublicContent,
          showProjects: domainConfig.showProjects,
          showSkills: domainConfig.showSkills,
          showBlog: domainConfig.showBlog,
          showBookmarks: domainConfig.showBookmarks
        }
      };
      await axios.put('/api/domain-config/user', configData);
      toast.success('域名配置保存成功');
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DomainCard><div style={{ color: '#fff' }}>加载中...</div></DomainCard>;

  const effectiveConfig = {
    ...domainConfig,
    ...(domainConfig.domainConfig || {})
  };

  return (
    <DomainCard hasDomain={!!domainConfig.customDomain}>
      <SectionHeader>
        <FaGlobe />
        <SectionTitle>自定义域名</SectionTitle>
      </SectionHeader>
      <Description>绑定您自己的域名，用户可以通过该域名访问您的公开内容</Description>

      <DomainStatus active={domainConfig.enabled && !!domainConfig.customDomain}>
        <DomainStatusDot active={domainConfig.enabled && !!domainConfig.customDomain} />
        <div>
          <div style={{ color: '#fff', fontWeight: 500 }}>
            {domainConfig.customDomain || '未绑定域名'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
            状态：{domainConfig.enabled && domainConfig.customDomain ? '已启用' : '未启用'}
          </div>
        </div>
      </DomainStatus>

      <FormGroup>
        <Label>自定义域名</Label>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Input
            value={domainConfig.customDomain || ''}
            onChange={(e) => {
              setDomainConfig(prev => ({ ...prev, customDomain: e.target.value }));
              setDomainAvailable(true);
            }}
            onBlur={(e) => checkDomainAvailability(e.target.value)}
            placeholder="例如：yoursite.com"
            style={{ flex: 1 }}
          />
          <SaveButton
            onClick={() => checkDomainAvailability(domainConfig.customDomain)}
            disabled={checkingDomain || !domainConfig.customDomain}
            style={{ padding: '0.75rem 1rem' }}
          >
            {checkingDomain ? '检查中...' : '检查'}
          </SaveButton>
        </div>
        {!domainAvailable && (
          <Description style={{ color: '#e74c3c', marginTop: '0.5rem' }}>
            该域名已被其他用户使用
          </Description>
        )}
        {domainAvailable && domainConfig.customDomain && (
          <Description style={{ color: '#2ecc71', marginTop: '0.5rem' }}>
            域名可用
          </Description>
        )}
        <Description>
          在DNS服务商添加 CNAME 记录指向此服务器，然后在此填入您的域名
        </Description>
      </FormGroup>

      <FormGroup>
        <ToggleGroup>
          <ToggleLabel>
            <FaGlobe style={{ marginRight: '0.5rem' }} />
            启用域名访问
          </ToggleLabel>
          <ToggleSwitch>
            <input
              type="checkbox"
              checked={domainConfig.enabled}
              onChange={(e) => setDomainConfig(prev => ({ ...prev, enabled: e.target.checked }))}
            />
            <span></span>
          </ToggleSwitch>
        </ToggleGroup>
      </FormGroup>

      <FormGroup>
        <Label>显示的内容</Label>
        <DomainConfigGrid>
          <DomainConfigItem checked={effectiveConfig.showPublicContent}>
            <DomainConfigCheckbox
              type="checkbox"
              checked={effectiveConfig.showPublicContent}
              onChange={(e) => setDomainConfig(prev => ({
                ...prev,
                domainConfig: { ...prev.domainConfig, showPublicContent: e.target.checked }
              }))}
            />
            <DomainConfigLabel>
              <DomainConfigTitle>自定义板块</DomainConfigTitle>
              <DomainConfigDesc>显示您创建的自定义内容板块</DomainConfigDesc>
            </DomainConfigLabel>
          </DomainConfigItem>

          <DomainConfigItem checked={effectiveConfig.showProjects}>
            <DomainConfigCheckbox
              type="checkbox"
              checked={effectiveConfig.showProjects}
              onChange={(e) => setDomainConfig(prev => ({
                ...prev,
                domainConfig: { ...prev.domainConfig, showProjects: e.target.checked }
              }))}
            />
            <DomainConfigLabel>
              <DomainConfigTitle>项目</DomainConfigTitle>
              <DomainConfigDesc>显示您的项目作品集</DomainConfigDesc>
            </DomainConfigLabel>
          </DomainConfigItem>

          <DomainConfigItem checked={effectiveConfig.showSkills}>
            <DomainConfigCheckbox
              type="checkbox"
              checked={effectiveConfig.showSkills}
              onChange={(e) => setDomainConfig(prev => ({
                ...prev,
                domainConfig: { ...prev.domainConfig, showSkills: e.target.checked }
              }))}
            />
            <DomainConfigLabel>
              <DomainConfigTitle>技能</DomainConfigTitle>
              <DomainConfigDesc>显示您的技能展示</DomainConfigDesc>
            </DomainConfigLabel>
          </DomainConfigItem>

          <DomainConfigItem checked={effectiveConfig.showBlog}>
            <DomainConfigCheckbox
              type="checkbox"
              checked={effectiveConfig.showBlog}
              onChange={(e) => setDomainConfig(prev => ({
                ...prev,
                domainConfig: { ...prev.domainConfig, showBlog: e.target.checked }
              }))}
            />
            <DomainConfigLabel>
              <DomainConfigTitle>博客</DomainConfigTitle>
              <DomainConfigDesc>显示您的博客文章</DomainConfigDesc>
            </DomainConfigLabel>
          </DomainConfigItem>

          <DomainConfigItem checked={effectiveConfig.showBookmarks}>
            <DomainConfigCheckbox
              type="checkbox"
              checked={effectiveConfig.showBookmarks}
              onChange={(e) => setDomainConfig(prev => ({
                ...prev,
                domainConfig: { ...prev.domainConfig, showBookmarks: e.target.checked }
              }))}
            />
            <DomainConfigLabel>
              <DomainConfigTitle>书签</DomainConfigTitle>
              <DomainConfigDesc>显示您的书签收藏</DomainConfigDesc>
            </DomainConfigLabel>
          </DomainConfigItem>
        </DomainConfigGrid>
        <Description style={{ marginTop: '0.75rem' }}>
          选择通过自定义域名访问时显示哪些内容（仅显示标记为"公开"的内容）
        </Description>
      </FormGroup>

      <ButtonGroup>
        <SaveButton onClick={handleSave} disabled={saving}>
          <FaSave /> {saving ? '保存中...' : '保存域名配置'}
        </SaveButton>
      </ButtonGroup>
    </DomainCard>
  );
};

// ============ ChangePassword 子组件 ============

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

// ============ ProfileSettings 组件 ============

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

      <PersonalizationSettings />

      <CustomDomainSettings />

      <ChangePassword />
    </>
  );
};

export default ProfileSettings;
