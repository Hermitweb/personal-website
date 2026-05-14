const User = require('../models/User');

/**
 * 域名解析中间件
 * 根据请求域名解析对应的用户配置
 */
const domainResolver = async (req, res, next) => {
  try {
    // 获取请求域名
    const domain = req.headers.host?.replace(/:\d+$/, '').replace(/^www\./, '');
    
    // 如果是 localhost 或主域名，跳过解析
    const mainDomainConfig = process.env.MAIN_DOMAIN || '';
    if (!domain || domain === 'localhost' || domain === `localhost:${process.env.PORT || 5000}` || domain === mainDomainConfig) {
      req.customDomain = null;
      req.domainUser = null;
      return next();
    }

    // 查询对应用户
    const user = await User.findOne({
      where: { customDomain: domain, isActive: true },
      attributes: ['id', 'username', 'domainConfig', 'preferences', 'customDomain']
    });

    if (!user || !user.domainConfig?.enabled) {
      req.customDomain = null;
      req.domainUser = null;
      return next();
    }

    // 将用户信息附加到请求对象
    req.customDomain = domain;
    req.domainUser = {
      userId: user.id,
      username: user.username,
      domainConfig: user.domainConfig,
      preferences: user.preferences
    };

    next();
  } catch (error) {
    console.error('域名解析中间件错误:', error);
    req.customDomain = null;
    req.domainUser = null;
    next();
  }
};

/**
 * 需要域名用户的中间件（用于某些需要特定配置的路由）
 */
const requireDomainUser = (req, res, next) => {
  if (!req.domainUser) {
    return res.status(404).json({ 
      message: '该域名未配置或已禁用',
      code: 'DOMAIN_NOT_FOUND'
    });
  }
  next();
};

/**
 * 根据域名用户配置过滤板块
 */
const filterSectionsByDomainConfig = (sections, domainConfig) => {
  if (!domainConfig) return sections;

  const config = {
    showPublicContent: true,
    showProjects: true,
    showSkills: true,
    showBlog: true,
    showBookmarks: true,
    ...domainConfig
  };

  // 定义板块类型映射
  const typeMap = {
    project: 'showProjects',
    skill: 'showSkills',
    blog: 'showBlog',
    bookmark: 'showBookmarks'
  };

  return sections.filter(section => {
    const type = section.contentType;
    
    // 自定义板块检查
    if (type?.startsWith('section_')) {
      return config.showPublicContent;
    }

    // 内置板块类型检查
    const configKey = typeMap[type];
    if (configKey) {
      return config[configKey] !== false;
    }

    // 默认显示
    return true;
  });
};

/**
 * 根据域名用户配置过滤内容
 */
const filterContentByDomainConfig = (contents, domainConfig) => {
  if (!domainConfig) return contents;

  // 只显示公开内容（不需要登录）
  return contents.filter(content => !content.requireLogin);
};

module.exports = {
  domainResolver,
  requireDomainUser,
  filterSectionsByDomainConfig,
  filterContentByDomainConfig
};
