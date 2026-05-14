import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// 默认配置
const DEFAULT_PREFERENCES = {
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
};

// 创建Context
const UserPreferencesContext = createContext({
  preferences: DEFAULT_PREFERENCES,
  loading: true,
  updatePreferences: () => {},
  resetPreferences: () => {},
  getPreference: () => null,
  setPreference: () => {}
});

// 自定义Hook
export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  }
  return context;
};

// Provider组件
export const UserPreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  // 从服务器获取用户配置
  const fetchPreferences = useCallback(async () => {
    try {
      const response = await axios.get('/api/user-config');
      const mergedPrefs = { ...DEFAULT_PREFERENCES, ...response.data };
      setPreferences(mergedPrefs);
      // 同步到localStorage
      localStorage.setItem('userPreferences', JSON.stringify(mergedPrefs));
      return mergedPrefs;
    } catch (error) {
      console.error('获取用户配置失败:', error);
      // 尝试从localStorage恢复
      const cached = localStorage.getItem('userPreferences');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
        } catch (e) {
          setPreferences(DEFAULT_PREFERENCES);
        }
      }
      return DEFAULT_PREFERENCES;
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // 监听配置变更事件
  useEffect(() => {
    const handlePreferencesChanged = (e) => {
      setPreferences(e.detail);
    };
    window.addEventListener('userPreferencesChanged', handlePreferencesChanged);
    return () => {
      window.removeEventListener('userPreferencesChanged', handlePreferencesChanged);
    };
  }, []);

  // 更新配置
  const updatePreferences = useCallback(async (newPrefs) => {
    try {
      const merged = { ...preferences, ...newPrefs };
      await axios.put('/api/user-config', merged);
      setPreferences(merged);
      localStorage.setItem('userPreferences', JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('userPreferencesChanged', { detail: merged }));
      return true;
    } catch (error) {
      console.error('更新配置失败:', error);
      return false;
    }
  }, [preferences]);

  // 重置配置
  const resetPreferences = useCallback(async () => {
    try {
      await axios.delete('/api/user-config');
      setPreferences(DEFAULT_PREFERENCES);
      localStorage.setItem('userPreferences', JSON.stringify(DEFAULT_PREFERENCES));
      window.dispatchEvent(new CustomEvent('userPreferencesChanged', { detail: DEFAULT_PREFERENCES }));
      return true;
    } catch (error) {
      console.error('重置配置失败:', error);
      return false;
    }
  }, []);

  // 获取单个配置项
  const getPreference = useCallback((key, defaultValue = null) => {
    const keys = key.split('.');
    let value = preferences;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    return value;
  }, [preferences]);

  // 设置单个配置项
  const setPreference = useCallback(async (key, value) => {
    const keys = key.split('.');
    const newPrefs = { ...preferences };
    let target = newPrefs;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in target) || typeof target[keys[i]] !== 'object') {
        target[keys[i]] = {};
      }
      target = target[keys[i]];
    }
    target[keys[keys.length - 1]] = value;
    return updatePreferences(newPrefs);
  }, [preferences, updatePreferences]);

  // 应用主题
  useEffect(() => {
    const theme = preferences.theme;
    const root = document.documentElement;
    
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [preferences.theme]);

  // 应用语言
  useEffect(() => {
    document.documentElement.setAttribute('lang', preferences.language);
  }, [preferences.language]);

  // 应用密度
  useEffect(() => {
    document.body.setAttribute('data-density', preferences.density);
  }, [preferences.density]);

  const value = {
    preferences,
    loading,
    updatePreferences,
    resetPreferences,
    getPreference,
    setPreference,
    defaultPreferences: DEFAULT_PREFERENCES
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export default UserPreferencesContext;
