import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const DomainContext = createContext();

export const useDomain = () => {
  const context = useContext(DomainContext);
  if (!context) {
    // 返回默认值
    return {
      isCustomDomain: false,
      domainUser: null,
      domainConfig: null,
      loading: true,
      error: null
    };
  }
  return context;
};

export const DomainProvider = ({ children }) => {
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [domainUser, setDomainUser] = useState(null);
  const [domainConfig, setDomainConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkDomainConfig();
  }, []);

  const checkDomainConfig = async () => {
    try {
      // 从当前主机名检测域名
      const hostname = window.location.hostname;
      const port = window.location.port;

      // 如果是 localhost 或 127.0.0.1，跳过域名检测
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
        setLoading(false);
        return;
      }

      // 尝试解析域名配置
      const response = await axios.get('/api/domain-config/resolve', {
        params: { domain: `${hostname}${port ? `:${port}` : ''}` },
        timeout: 5000
      });

      if (response.data && response.data.username) {
        setIsCustomDomain(true);
        setDomainUser({
          userId: response.data.userId,
          username: response.data.username
        });
        setDomainConfig(response.data.domainConfig);
      }
    } catch (err) {
      // 域名未配置或解析失败，不是错误
      if (err.response?.status === 404) {
        // 该域名没有绑定用户
        setIsCustomDomain(false);
      } else {
        console.error('域名配置检测失败:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isCustomDomain,
    domainUser,
    domainConfig,
    loading,
    error,
    refreshDomainConfig: checkDomainConfig
  };

  return (
    <DomainContext.Provider value={value}>
      {children}
    </DomainContext.Provider>
  );
};

export default DomainContext;
