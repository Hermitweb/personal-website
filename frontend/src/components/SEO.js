import React, { useEffect } from 'react';

/**
 * SEO 组件 - 用于管理页面的 meta 标签
 * @param {Object} props - SEO 配置
 * @param {string} props.title - 页面标题
 * @param {string} props.description - 页面描述
 * @param {string} props.keywords - 关键词
 * @param {string} props.image - Open Graph 图片
 * @param {string} props.url - 页面 URL
 * @param {string} props.type - Open Graph 类型 (website, article 等)
 * @param {string} props.author - 作者
 * @param {string} props.canonical - 规范链接
 */
const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author,
  canonical,
  siteName = '个人网站'
}) => {
  useEffect(() => {
    // 更新页面标题
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    document.title = fullTitle;

    // 更新或创建 meta 标签
    const updateMeta = (name, content, property = false) => {
      if (!content) return;
      
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // 更新或创建 link 标签
    const updateLink = (rel, href) => {
      if (!href) return;
      
      let link = document.querySelector(`link[rel="${rel}"]`);
      
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      
      link.setAttribute('href', href);
    };

    // 基本 meta 标签
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('author', author);

    // Open Graph 标签
    updateMeta('og:title', fullTitle, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', image, true);
    updateMeta('og:url', url || window.location.href, true);
    updateMeta('og:type', type, true);
    updateMeta('og:site_name', siteName, true);

    // Twitter Card 标签
    updateMeta('twitter:card', image ? 'summary_large_image' : 'summary');
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);

    // 规范链接
    updateLink('canonical', canonical || url || window.location.href);

    // 清理函数 - 组件卸载时恢复默认标题
    return () => {
      document.title = siteName;
    };
  }, [title, description, keywords, image, url, type, author, canonical, siteName]);

  return null; // SEO 组件不渲染任何内容
};

/**
 * 生成结构化数据 (JSON-LD)
 * @param {Object} data - 结构化数据对象
 * @returns {string} - JSON-LD 字符串
 */
export const generateStructuredData = (data) => {
  return JSON.stringify(data);
};

/**
 * 文章结构化数据
 */
export const articleStructuredData = ({
  title,
  description,
  image,
  author,
  datePublished,
  dateModified,
  url
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": title,
  "description": description,
  "image": image,
  "author": {
    "@type": "Person",
    "name": author
  },
  "datePublished": datePublished,
  "dateModified": dateModified || datePublished,
  "url": url
});

/**
 * 网站结构化数据
 */
export const websiteStructuredData = ({
  name,
  url,
  description,
  logo
}) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": name,
  "url": url,
  "description": description,
  "logo": logo,
  "potentialAction": {
    "@type": "SearchAction",
    "target": `${url}/blog?search={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
});

/**
 * 面包屑结构化数据
 */
export const breadcrumbStructuredData = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export default SEO;
