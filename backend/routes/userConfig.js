const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// 默认配置
const DEFAULT_PREFERENCES = {
  // 主题设置
  theme: 'dark', // 'dark' | 'light' | 'auto'

  // 语言设置
  language: 'zh-CN', // 'zh-CN' | 'en-US'

  // 界面密度
  density: 'comfortable', // 'compact' | 'comfortable' | 'spacious'

  // 默认编辑器
  defaultEditor: 'rich', // 'rich' | 'markdown'

  // 每页显示条数
  pageSize: 20, // 10 | 20 | 50 | 100

  // 侧边栏状态
  sidebarCollapsed: false,

  // 通知设置
  notifications: {
    email: true,
    browser: true,
    sound: false
  },

  // 编辑器设置
  editor: {
    autoSave: true,
    autoSaveInterval: 30, // 秒
    spellCheck: true,
    wordWrap: true,
    lineNumbers: true
  },

  // 日期时间格式
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h', // '12h' | '24h'

  // 表格设置
  table: {
    showPagination: true,
    stickyHeader: true
  },

  // 功能开关偏好（可覆盖全局功能开关）
  features: {
    // 博客相关
    blog: {
      postsPerPage: 10,
      allowComments: true,
      showAuthor: true,
      showDate: true,
      showCategory: true
    },
    // 留言板
    messageBoard: {
      requireLogin: false,
      showEmail: false,
      notification: true
    },
    // 项目详情页
    projectDetail: {
      showGithub: true,
      showDemo: true,
      showGallery: true,
      showTechStack: true
    },
    // 界面偏好
    ui: {
      animations: true,
      reducedMotion: false,
      compactMode: false
    },
    // SEO设置
    seo: {
      showReadingTime: true,
      showWordCount: true,
      showShareButtons: true
    }
  },

  // 快捷键配置
  shortcuts: {
    newPost: 'Ctrl+N',
    save: 'Ctrl+S',
    search: 'Ctrl+K',
    toggleSidebar: 'Ctrl+B'
  },

  // 数据管理
  dataManagement: {
    autoBackup: false,
    backupInterval: 24, // 小时
    exportFormat: 'json' // 'json' | 'csv'
  },

  // 自定义域名配置
  customDomain: {
    enabled: false,
    domain: '',
    showPublicContent: true,
    showProjects: true,
    showSkills: true,
    showBlog: true,
    showBookmarks: true
  },

  // 内容展示偏好
  contentDisplay: {
    // 图片默认显示位置
    defaultImagePosition: 'center', // 'top' | 'center' | 'bottom' | 'custom'
    customImagePosition: 50, // 0-100，当 position 为 'custom' 时使用
    // 列表显示设置
    listView: 'grid', // 'grid' | 'list'
    itemsPerRow: 3, // 1-4
    // 卡片显示设置
    cardStyle: 'default', // 'default' | 'compact' | 'detailed'
    showDescription: true,
    showTags: true,
    showDate: true
  },

  // 安全设置
  security: {
    twoFactorEnabled: false,
    loginNotification: true,
    sessionTimeout: 30, // 分钟
    ipWhitelist: []
  },

  // 隐私设置
  privacy: {
    profileVisible: true,
    showEmail: false,
    showStats: true,
    allowSearch: true
  }
};

/**
 * 获取当前用户的个性化配置
 * GET /api/user-config
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'username', 'preferences']
    });

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 合并默认配置和用户自定义配置
    const preferences = {
      ...DEFAULT_PREFERENCES,
      ...(user.preferences || {})
    };

    res.json({
      preferences,
      defaults: DEFAULT_PREFERENCES
    });
  } catch (error) {
    console.error('获取用户配置失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

/**
 * 更新当前用户的个性化配置
 * PUT /api/user-config
 */
router.put('/', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    
    // 获取当前用户
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 合并现有配置和新配置
    const currentPrefs = user.preferences || {};
    const newPrefs = { ...currentPrefs, ...updates };

    // 验证配置值
    const validation = validatePreferences(newPrefs);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    // 保存配置
    await user.update({ preferences: newPrefs });

    res.json({
      message: '配置已保存',
      preferences: newPrefs
    });
  } catch (error) {
    console.error('保存用户配置失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

/**
 * 重置配置为默认值
 * POST /api/user-config/reset
 */
router.post('/reset', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    await user.update({ preferences: {} });

    res.json({
      message: '配置已重置为默认值',
      preferences: DEFAULT_PREFERENCES
    });
  } catch (error) {
    console.error('重置用户配置失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

/**
 * 获取配置默认值
 * GET /api/user-config/defaults
 */
router.get('/defaults', authMiddleware, async (req, res) => {
  res.json({ defaults: DEFAULT_PREFERENCES });
});

/**
 * 验证配置值
 */
function validatePreferences(prefs) {
  const validThemes = ['dark', 'light', 'auto'];
  const validLanguages = ['zh-CN', 'en-US'];
  const validDensities = ['compact', 'comfortable', 'spacious'];
  const validEditors = ['rich', 'markdown'];
  const validPageSizes = [10, 20, 50, 100];
  const validTimeFormats = ['12h', '24h'];
  const validExportFormats = ['json', 'csv'];
  const validImagePositions = ['top', 'center', 'bottom', 'custom'];
  const validListViews = ['grid', 'list'];
  const validCardStyles = ['default', 'compact', 'detailed'];

  if (prefs.theme && !validThemes.includes(prefs.theme)) {
    return { valid: false, message: '无效的主题值' };
  }
  if (prefs.language && !validLanguages.includes(prefs.language)) {
    return { valid: false, message: '无效的语言值' };
  }
  if (prefs.density && !validDensities.includes(prefs.density)) {
    return { valid: false, message: '无效的密度值' };
  }
  if (prefs.defaultEditor && !validEditors.includes(prefs.defaultEditor)) {
    return { valid: false, message: '无效的编辑器值' };
  }
  if (prefs.pageSize && !validPageSizes.includes(prefs.pageSize)) {
    return { valid: false, message: '无效的分页大小' };
  }
  if (prefs.timeFormat && !validTimeFormats.includes(prefs.timeFormat)) {
    return { valid: false, message: '无效的时间格式' };
  }
  if (prefs.features) {
    if (prefs.features.blog?.postsPerPage && !validPageSizes.includes(prefs.features.blog.postsPerPage)) {
      return { valid: false, message: '无效的博客分页大小' };
    }
  }
  if (prefs.dataManagement?.exportFormat && !validExportFormats.includes(prefs.dataManagement.exportFormat)) {
    return { valid: false, message: '无效的导出格式' };
  }

  // 验证内容展示偏好
  if (prefs.contentDisplay) {
    if (prefs.contentDisplay.defaultImagePosition && !validImagePositions.includes(prefs.contentDisplay.defaultImagePosition)) {
      return { valid: false, message: '无效的图片位置设置' };
    }
    if (prefs.contentDisplay.listView && !validListViews.includes(prefs.contentDisplay.listView)) {
      return { valid: false, message: '无效的列表视图设置' };
    }
    if (prefs.contentDisplay.cardStyle && !validCardStyles.includes(prefs.contentDisplay.cardStyle)) {
      return { valid: false, message: '无效的卡片样式设置' };
    }
    if (prefs.contentDisplay.itemsPerRow && (prefs.contentDisplay.itemsPerRow < 1 || prefs.contentDisplay.itemsPerRow > 4)) {
      return { valid: false, message: '无效的每行项目数' };
    }
    if (prefs.contentDisplay.customImagePosition !== undefined) {
      const pos = Number(prefs.contentDisplay.customImagePosition);
      if (isNaN(pos) || pos < 0 || pos > 100) {
        return { valid: false, message: '无效的图片位置数值' };
      }
    }
  }

  // 验证安全设置
  if (prefs.security?.sessionTimeout) {
    const timeout = Number(prefs.security.sessionTimeout);
    if (isNaN(timeout) || timeout < 5 || timeout > 1440) {
      return { valid: false, message: '无效的会话超时时间（5-1440分钟）' };
    }
  }

  return { valid: true };
}

module.exports = router;
