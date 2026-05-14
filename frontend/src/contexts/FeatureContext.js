import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const FeatureContext = createContext();

export const useFeatures = () => {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeatures must be used within a FeatureProvider');
  }
  return context;
};

// 默认启用所有核心功能
const DEFAULT_ENABLED_FEATURES = ['blog', 'messageBoard', 'visitorStats', 'search', 'themeToggle', 'multiLanguage', 'projectDetail', 'bookmarks'];

export const FeatureProvider = ({ children }) => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeatures = async () => {
    try {
      const response = await axios.get('/api/features');
      setFeatures(response.data);
    } catch (error) {
      console.error('获取功能配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const isFeatureEnabled = useCallback((featureName) => {
    if (!features || features.length === 0) {
      return DEFAULT_ENABLED_FEATURES.includes(featureName);
    }
    const feature = features.find(f => f.feature === featureName);
    return feature ? feature.enabled : true;
  }, [features]);

  const getFeatureConfig = useCallback((featureName) => {
    const feature = features.find(f => f.feature === featureName);
    return feature ? feature.config : {};
  }, [features]);

  return (
    <FeatureContext.Provider value={{
      features,
      loading,
      isFeatureEnabled,
      getFeatureConfig,
      refreshFeatures: fetchFeatures
    }}>
      {children}
    </FeatureContext.Provider>
  );
};

export default FeatureContext;
