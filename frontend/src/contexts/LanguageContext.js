import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// 翻译文本
const translations = {
  zh: {
    // 导航
    nav: {
      home: '首页',
      blog: '博客',
      projects: '项目',
      messages: '留言板',
      admin: '后台管理',
      login: '登录',
      register: '注册',
      logout: '退出'
    },
    // 首页
    home: {
      hero: {
        greeting: '你好，我是',
        title: '全栈开发者',
        subtitle: '热爱技术，追求卓越',
        viewProjects: '查看项目',
        contactMe: '联系我'
      },
      skills: {
        title: '技能专长',
        subtitle: '我的技术栈'
      },
      projects: {
        title: '项目展示',
        subtitle: '我的作品集'
      },
      contact: {
        title: '联系我',
        subtitle: '期待与您合作',
        name: '姓名',
        email: '邮箱',
        message: '留言',
        send: '发送消息',
        sending: '发送中...'
      }
    },
    // 博客
    blog: {
      title: '博客文章',
      subtitle: '分享技术心得',
      readMore: '阅读更多',
      views: '次浏览',
      likes: '点赞',
      noArticles: '暂无文章',
      categories: '分类',
      all: '全部',
      search: '搜索文章...',
      publishTime: '发布于'
    },
    // 项目
    projects: {
      title: '项目展示',
      subtitle: '我的作品集',
      viewDemo: '查看演示',
      viewCode: '源代码',
      tech: '技术栈'
    },
    // 留言板
    messages: {
      title: '留言板',
      subtitle: '访客留言',
      leaveMessage: '发表留言',
      name: '昵称',
      content: '留言内容',
      submit: '提交',
      noMessages: '暂无留言'
    },
    // 通用
    common: {
      loading: '加载中...',
      error: '出错了',
      success: '操作成功',
      confirm: '确认',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      save: '保存',
      search: '搜索',
      noData: '暂无数据'
    },
    // 主题
    theme: {
      dark: '暗色模式',
      light: '亮色模式'
    }
  },
  en: {
    // Navigation
    nav: {
      home: 'Home',
      blog: 'Blog',
      projects: 'Projects',
      messages: 'Messages',
      admin: 'Admin',
      login: 'Login',
      register: 'Register',
      logout: 'Logout'
    },
    // Home
    home: {
      hero: {
        greeting: "Hello, I'm",
        title: 'Full Stack Developer',
        subtitle: 'Passionate about technology, pursuing excellence',
        viewProjects: 'View Projects',
        contactMe: 'Contact Me'
      },
      skills: {
        title: 'Skills',
        subtitle: 'My Tech Stack'
      },
      projects: {
        title: 'Projects',
        subtitle: 'My Portfolio'
      },
      contact: {
        title: 'Contact Me',
        subtitle: 'Looking forward to working with you',
        name: 'Name',
        email: 'Email',
        message: 'Message',
        send: 'Send Message',
        sending: 'Sending...'
      }
    },
    // Blog
    blog: {
      title: 'Blog',
      subtitle: 'Sharing Technical Insights',
      readMore: 'Read More',
      views: 'views',
      likes: 'likes',
      noArticles: 'No articles yet',
      categories: 'Categories',
      all: 'All',
      search: 'Search articles...',
      publishTime: 'Published on'
    },
    // Projects
    projects: {
      title: 'Projects',
      subtitle: 'My Portfolio',
      viewDemo: 'View Demo',
      viewCode: 'Source Code',
      tech: 'Tech Stack'
    },
    // Messages
    messages: {
      title: 'Message Board',
      subtitle: 'Visitor Messages',
      leaveMessage: 'Leave a Message',
      name: 'Nickname',
      content: 'Message',
      submit: 'Submit',
      noMessages: 'No messages yet'
    },
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      save: 'Save',
      search: 'Search',
      noData: 'No data'
    },
    // Theme
    theme: {
      dark: 'Dark Mode',
      light: 'Light Mode'
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'zh';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const t = (path) => {
    const keys = path.split('.');
    let value = translations[language];
    for (const key of keys) {
      value = value?.[key];
    }
    return value || path;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
