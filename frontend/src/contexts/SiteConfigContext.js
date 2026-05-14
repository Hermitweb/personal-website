import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SiteConfigContext = createContext();

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    return { siteConfig: {}, refreshSiteConfig: () => {} };
  }
  return context;
};

export const SiteConfigProvider = ({ children }) => {
  const [siteConfig, setSiteConfig] = useState({});

  const refreshSiteConfig = async () => {
    try {
      const response = await axios.get('/api/config');
      const config = response.data;
      setSiteConfig(config);

      // 动态设置网站标题
      if (config.site_title) {
        document.title = config.site_title;
      }

      // 动态设置 favicon
      if (config.site_favicon) {
        let faviconUrl = config.site_favicon.startsWith('http')
          ? config.site_favicon
          : config.site_favicon.startsWith('/')
            ? `http://localhost:5000${config.site_favicon}`
            : config.site_favicon;
        
        // 添加时间戳防止缓存
        faviconUrl = faviconUrl + (faviconUrl.includes('?') ? '&' : '?') + '_t=' + Date.now();

        // 删除所有现有的 favicon link 元素
        const existingLinks = document.querySelectorAll("link[rel*='icon']");
        existingLinks.forEach(link => link.remove());

        // 创建新的 favicon link 元素
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.type = 'image/x-icon';
        newLink.href = faviconUrl;
        document.head.appendChild(newLink);
      }
    } catch (error) {
      console.error('获取网站配置失败:', error);
    }
  };

  useEffect(() => {
    refreshSiteConfig();
  }, []);

  return (
    <SiteConfigContext.Provider value={{ siteConfig, refreshSiteConfig }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export default SiteConfigContext;
