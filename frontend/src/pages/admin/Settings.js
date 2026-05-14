import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSave, FaRandom, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useSiteConfig } from '../../contexts/SiteConfigContext';

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

const SslStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  margin-top: 1rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const StatusDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.active ? '#2ecc71' : '#e74c3c'};
  box-shadow: 0 0 8px ${props => props.active ? 'rgba(46, 204, 113, 0.5)' : 'rgba(231, 76, 60, 0.5)'};
`;

const FileUploadArea = styled.div`
  position: relative;
`;

const HiddenFileInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  cursor: pointer;
  z-index: 1;
`;

const FileUploadLabel = styled.div`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed ${props => props.hasFile ? '#2ecc71' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 15px;
  text-align: center;
  color: ${props => props.hasFile ? '#2ecc71' : 'rgba(255, 255, 255, 0.6)'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;

  &:hover {
    border-color: #667eea;
    color: #667eea;
  }
`;

const SslDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const RestartNote = styled.div`
  padding: 0.75rem 1rem;
  background: rgba(241, 196, 15, 0.1);
  border: 1px solid rgba(241, 196, 15, 0.3);
  border-radius: 10px;
  color: #f1c40f;
  font-size: 0.85rem;
  margin-bottom: 1rem;
`;

const FaviconPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FaviconPlaceholder = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.7rem;
`;

const FaviconUploadButton = styled.label`
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

const AdminRouteInputGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const AdminRouteInput = styled(Input)`
  flex: 1;
  font-family: monospace;
  letter-spacing: 0.5px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid #00d4ff;
  border-radius: 10px;
  color: #00d4ff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(0, 212, 255, 0.2);
  }

  &.danger {
    background: rgba(231, 76, 60, 0.1);
    border-color: #e74c3c;
    color: #e74c3c;

    &:hover {
      background: rgba(231, 76, 60, 0.2);
    }
  }
`;

const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(46, 204, 113, 0.1);
  border: 1px solid rgba(46, 204, 113, 0.3);
  border-radius: 10px;
  color: #2ecc71;
  font-size: 0.85rem;
  margin-top: 1rem;
`;

const WarningNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 10px;
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 1rem;
`;

// ============ 网站设置组件 ============

const Settings = () => {
  const { refreshSiteConfig } = useSiteConfig();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminRouteChanged, setAdminRouteChanged] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/config');
      // 设置默认后台入口为 admin
      if (!response.data.admin_route) {
        response.data.admin_route = 'admin';
      }
      setSettings(response.data);

      // 同时获取域名配置
      try {
        const domainResponse = await axios.get('/api/domain-config');
        setSettings(prev => ({ ...prev, ...domainResponse.data }));
      } catch (domainError) {
        console.error('获取域名配置失败:', domainError);
      }
    } catch (error) {
      console.error('获取设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
    if (name === 'admin_route') {
      setAdminRouteChanged(true);
    }
  };

  // 生成随机安全入口
  const generateRandomRoute = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSettings(prev => ({ ...prev, admin_route: result }));
    setAdminRouteChanged(true);
    toast.success('已生成随机安全入口');
  };

  // 重置为默认入口
  const resetToDefault = () => {
    setSettings(prev => ({ ...prev, admin_route: 'admin' }));
    setAdminRouteChanged(true);
    toast.info('已重置为默认入口');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/api/config/batch', settings);
      // 刷新全局配置（更新网站标题和 favicon）
      refreshSiteConfig();
      toast.success('设置保存成功');
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('favicon', file);

    try {
      const response = await axios.post('/api/upload/favicon', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const faviconUrl = response.data.url;
      // 更新设置并立即保存
      const newSettings = { ...settings, site_favicon: faviconUrl };
      setSettings(newSettings);
      
      // 自动保存到数据库
      await axios.put('/api/config/batch', newSettings);
      // 刷新全局配置（更新 favicon）
      refreshSiteConfig();
      toast.success('Favicon 上传并保存成功');
    } catch (error) {
      toast.error('上传失败');
    }
  };

  if (loading) return <div style={{ color: '#fff' }}>加载中...</div>;

  return (
    <>
      <Header>
        <Title>网站设置</Title>
      </Header>

      <Card>
        <SectionTitle>后台入口设置</SectionTitle>
        <Description>设置后台管理页面的访问路径，增强系统安全性。修改后需要使用新地址访问后台。</Description>

        <FormGroup>
          <Label>后台入口路径</Label>
          <AdminRouteInputGroup>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>/</span>
            <AdminRouteInput
              name="admin_route"
              value={settings.admin_route || 'admin'}
              onChange={handleChange}
              placeholder="admin"
            />
            <ActionButton onClick={generateRandomRoute}>
              <FaRandom /> 随机生成
            </ActionButton>
            <ActionButton onClick={resetToDefault} className="danger">
              重置默认
            </ActionButton>
          </AdminRouteInputGroup>
          <Description>当前后台地址：{window.location.origin}/{settings.admin_route || 'admin'}</Description>
        </FormGroup>

        {adminRouteChanged && (
          <WarningNote>
            <FaExclamationTriangle />
            <span>⚠️ 后台入口已更改，保存后请使用新地址访问后台，旧地址将失效！</span>
          </WarningNote>
        )}

        <SecurityNote>
          <FaShieldAlt />
          <span>安全建议：使用随机生成的12位字符作为入口，可有效防止恶意扫描和暴力破解。</span>
        </SecurityNote>

        <ButtonGroup>
          <SaveButton onClick={handleSave} disabled={saving}>
            <FaSave /> {saving ? '保存中...' : '保存设置'}
          </SaveButton>
        </ButtonGroup>
      </Card>

      <Card style={{ marginTop: '1.5rem' }}>
        <SectionTitle>网站信息</SectionTitle>

        <FormGroup>
          <Label>网站标题</Label>
          <Input 
            name="site_title" 
            value={settings.site_title || ''} 
            onChange={handleChange}
            placeholder="显示在浏览器标签页的标题"
          />
          <Description>浏览器标签页显示的网站标题</Description>
        </FormGroup>

        <FormGroup>
          <Label>网站名称</Label>
          <Input 
            name="site_name" 
            value={settings.site_name || ''} 
            onChange={handleChange}
            placeholder="网站名称"
          />
          <Description>网站的主要内容名称</Description>
        </FormGroup>

        <FormGroup>
          <Label>Favicon 图标</Label>
          <FaviconPreview>
            {settings.site_favicon ? (
              <img 
                src={settings.site_favicon.startsWith('http') 
                  ? settings.site_favicon 
                  : settings.site_favicon.startsWith('/') 
                    ? `http://localhost:5000${settings.site_favicon}`
                    : settings.site_favicon
                } 
                alt="Favicon" 
                style={{ width: 32, height: 32 }}
              />
            ) : (
              <FaviconPlaceholder>无</FaviconPlaceholder>
            )}
            <FaviconUploadButton>
              <input
                type="file"
                accept=".ico,.png,.jpg,.jpeg,.gif,.webp"
                onChange={handleFaviconUpload}
                style={{ display: 'none' }}
              />
              选择图标文件
            </FaviconUploadButton>
          </FaviconPreview>
          <Description>上传 16x16、32x32 或 64x64 像素的图标，支持 ico、png、jpg 格式</Description>
        </FormGroup>

        <FormGroup>
          <Label>网站描述</Label>
          <TextArea name="site_description" value={settings.site_description || ''} onChange={handleChange} />
        </FormGroup>

        <FormGroup>
          <Label>邮箱地址</Label>
          <Input name="email_address" value={settings.email_address || ''} onChange={handleChange} />
        </FormGroup>

        <FormGroup>
          <Label>GitHub</Label>
          <Input name="github_url" value={settings.github_url || ''} onChange={handleChange} />
        </FormGroup>

        <ButtonGroup>
          <SaveButton onClick={handleSave} disabled={saving}>
            <FaSave /> {saving ? '保存中...' : '保存设置'}
          </SaveButton>
        </ButtonGroup>
      </Card>

      <Card style={{ marginTop: '1.5rem' }}>
        <SectionTitle>域名配置</SectionTitle>
        <Description>配置网站主域名和自定义域名功能。用户可以在个人设置中绑定自己的域名。</Description>

        <FormGroup>
          <Label>主域名</Label>
          <Input
            name="mainDomain"
            value={settings.mainDomain || ''}
            onChange={handleChange}
            placeholder="例如：yoursite.com"
          />
          <Description>网站的主域名，用户访问时会解析到此域名</Description>
        </FormGroup>

        <FormGroup>
          <Label>允许用户自定义域名</Label>
          <Select
            name="enableCustomDomain"
            value={settings.enableCustomDomain !== false ? 'true' : 'false'}
            onChange={(e) => {
              setSettings(prev => ({ ...prev, enableCustomDomain: e.target.value === 'true' }));
            }}
          >
            <option value="true">开启</option>
            <option value="false">关闭</option>
          </Select>
          <Description>开启后用户可以在个人设置中绑定自己的域名访问对应内容</Description>
        </FormGroup>

        <FormGroup>
          <Label>自动跳转主域名</Label>
          <Select
            name="redirectToMain"
            value={settings.redirectToMain !== false ? 'true' : 'false'}
            onChange={(e) => {
              setSettings(prev => ({ ...prev, redirectToMain: e.target.value === 'true' }));
            }}
          >
            <option value="true">开启</option>
            <option value="false">关闭</option>
          </Select>
          <Description>未绑定用户域名时是否自动跳转到主域名</Description>
        </FormGroup>

        <WarningNote>
          ⚠️ 配置自定义域名需要在DNS服务商添加CNAME记录指向此服务器
        </WarningNote>

        <ButtonGroup>
          <SaveButton onClick={async () => {
            setSaving(true);
            try {
              // 保存常规配置
              await axios.put('/api/config/batch', settings);
              // 保存域名配置
              await axios.put('/api/domain-config', {
                mainDomain: settings.mainDomain,
                enableCustomDomain: settings.enableCustomDomain !== false,
                redirectToMain: settings.redirectToMain !== false
              });
              toast.success('设置保存成功');
            } catch (error) {
              toast.error('保存失败');
            } finally {
              setSaving(false);
            }
          }} disabled={saving}>
            <FaSave /> {saving ? '保存中...' : '保存设置'}
          </SaveButton>
        </ButtonGroup>
      </Card>

      <Card style={{ marginTop: '1.5rem' }}>
        <SectionTitle>SSL / HTTPS 安全配置</SectionTitle>
        <Description>配置SSL证书以启用HTTPS加密传输，保护用户数据安全。支持三种配置方式，任选其一即可。</Description>

        <FormGroup>
          <Label>启用 HTTPS</Label>
          <Select 
            name="ssl_enabled" 
            value={settings.ssl_enabled || 'false'} 
            onChange={handleChange}
          >
            <option value="false">关闭</option>
            <option value="true">开启</option>
          </Select>
          <Description>开启后服务器将使用HTTPS协议（需同时配置证书）</Description>
        </FormGroup>

        <SslDivider>方式一：服务器文件路径</SslDivider>

        <FormGroup>
          <Label>证书文件路径</Label>
          <Input 
            name="ssl_cert_path" 
            value={settings.ssl_cert_path || ''} 
            onChange={handleChange}
            placeholder="例如：/etc/ssl/certs/cert.pem"
          />
          <Description>服务器上 SSL 证书文件的完整路径（.pem 或 .crt 格式）</Description>
        </FormGroup>

        <FormGroup>
          <Label>私钥文件路径</Label>
          <Input 
            name="ssl_key_path" 
            value={settings.ssl_key_path || ''} 
            onChange={handleChange}
            placeholder="例如：/etc/ssl/private/key.pem"
          />
          <Description>服务器上 SSL 私钥文件的完整路径（.key 或 .pem 格式）</Description>
        </FormGroup>

        <FormGroup>
          <Label>CA证书链路径（可选）</Label>
          <Input 
            name="ssl_ca_path" 
            value={settings.ssl_ca_path || ''} 
            onChange={handleChange}
            placeholder="例如：/etc/ssl/certs/ca-bundle.crt"
          />
          <Description>CA证书链文件路径，用于中间证书（可选）</Description>
        </FormGroup>

        <SslDivider>方式二：上传证书文件</SslDivider>

        <FormGroup>
          <Label>上传证书文件</Label>
          <FileUploadArea>
            <HiddenFileInput
              type="file"
              accept=".pem,.crt,.cert"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setSettings(prev => ({ ...prev, ssl_cert_content: event.target.result }));
                  };
                  reader.readAsText(file);
                }
              }}
            />
            <FileUploadLabel hasFile={!!settings.ssl_cert_content}>
              {settings.ssl_cert_content ? '✓ 证书文件已选择（点击重新选择）' : '点击选择证书文件（.pem, .crt）'}
            </FileUploadLabel>
          </FileUploadArea>
        </FormGroup>

        <FormGroup>
          <Label>上传私钥文件</Label>
          <FileUploadArea>
            <HiddenFileInput
              type="file"
              accept=".pem,.key"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setSettings(prev => ({ ...prev, ssl_key_content: event.target.result }));
                  };
                  reader.readAsText(file);
                }
              }}
            />
            <FileUploadLabel hasFile={!!settings.ssl_key_content}>
              {settings.ssl_key_content ? '✓ 私钥文件已选择（点击重新选择）' : '点击选择私钥文件（.pem, .key）'}
            </FileUploadLabel>
          </FileUploadArea>
        </FormGroup>

        <FormGroup>
          <Label>上传CA证书链（可选）</Label>
          <FileUploadArea>
            <HiddenFileInput
              type="file"
              accept=".pem,.crt"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setSettings(prev => ({ ...prev, ssl_ca_content: event.target.result }));
                  };
                  reader.readAsText(file);
                }
              }}
            />
            <FileUploadLabel hasFile={!!settings.ssl_ca_content}>
              {settings.ssl_ca_content ? '✓ CA证书链已选择（点击重新选择）' : '点击选择CA证书链文件（可选）'}
            </FileUploadLabel>
          </FileUploadArea>
        </FormGroup>

        <SslDivider>方式三：直接粘贴证书内容</SslDivider>

        <FormGroup>
          <Label>证书内容（CRT/PEM）</Label>
          <TextArea 
            name="ssl_cert_content" 
            value={settings.ssl_cert_content || ''} 
            onChange={handleChange}
            placeholder={`-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----`}
            rows={5}
            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
          />
          <Description>粘贴 SSL 证书的完整内容（上传文件时会自动填入）</Description>
        </FormGroup>

        <FormGroup>
          <Label>私钥内容（KEY/PEM）</Label>
          <TextArea 
            name="ssl_key_content" 
            value={settings.ssl_key_content || ''} 
            onChange={handleChange}
            placeholder={`-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----`}
            rows={5}
            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
          />
          <Description>粘贴 SSL 私钥的完整内容（上传文件时会自动填入）</Description>
        </FormGroup>

        <FormGroup>
          <Label>CA证书链内容（可选）</Label>
          <TextArea 
            name="ssl_ca_content" 
            value={settings.ssl_ca_content || ''} 
            onChange={handleChange}
            placeholder={`-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----`}
            rows={4}
            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
          />
          <Description>粘贴 CA 证书链内容（上传文件时会自动填入）</Description>
        </FormGroup>

        <SslDivider>其他配置</SslDivider>

        <FormGroup>
          <Label>强制 HTTPS 跳转</Label>
          <Select 
            name="ssl_force_redirect" 
            value={settings.ssl_force_redirect || 'false'} 
            onChange={handleChange}
          >
            <option value="false">关闭</option>
            <option value="true">开启</option>
          </Select>
          <Description>开启后所有HTTP请求将自动跳转到HTTPS</Description>
        </FormGroup>

        <SslStatus>
          <StatusDot active={settings.ssl_enabled === 'true'} />
          <span>当前状态：{settings.ssl_enabled === 'true' ? 'HTTPS 已启用' : 'HTTPS 未启用'}</span>
        </SslStatus>

        <RestartNote>⚠️ 证书配置保存后需要重启服务生效。优先级：证书内容 > 文件路径</RestartNote>

        <ButtonGroup>
          <SaveButton onClick={handleSave} disabled={saving}>
            <FaSave /> {saving ? '保存中...' : '保存设置'}
          </SaveButton>
        </ButtonGroup>
      </Card>
    </>
  );
};

export default Settings;
