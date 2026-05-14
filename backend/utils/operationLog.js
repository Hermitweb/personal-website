const OperationLog = require('../models/OperationLog');

/**
 * 记录操作日志
 * @param {Object} options - 日志选项
 */
const logOperation = async (options) => {
  try {
    const {
      userId,
      username,
      action,
      module,
      targetId,
      targetName,
      description,
      ip,
      userAgent,
      method,
      path,
      status = 'success',
      errorMessage,
      duration
    } = options;

    await OperationLog.create({
      userId,
      username,
      action,
      module,
      targetId,
      targetName,
      description,
      ip,
      userAgent,
      method,
      path,
      status,
      errorMessage,
      duration
    });
  } catch (error) {
    console.error('记录操作日志失败:', error);
  }
};

/**
 * 操作日志中间件
 * 自动记录所有需要认证的API请求
 */
const operationLogMiddleware = (module, action) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // 保存原始的 res.json 方法
    const originalJson = res.json.bind(res);
    
    // 重写 res.json 方法
    res.json = function(data) {
      const duration = Date.now() - startTime;
      
      // 异步记录日志，不阻塞响应
      logOperation({
        userId: req.user?.userId,
        username: req.user?.username,
        action: action || req.method.toLowerCase(),
        module: module || 'unknown',
        targetId: req.params?.id ? parseInt(req.params.id) : null,
        targetName: req.body?.title || req.body?.name || null,
        description: `${req.method} ${req.originalUrl}`,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode >= 400 ? 'fail' : 'success',
        errorMessage: res.statusCode >= 400 ? (data?.message || 'Unknown error') : null,
        duration
      }).catch(err => console.error('日志记录错误:', err));
      
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * 操作类型常量
 */
const ActionTypes = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  VIEW: 'view',
  EXPORT: 'export',
  IMPORT: 'import',
  UPLOAD: 'upload',
  DOWNLOAD: 'download'
};

/**
 * 模块常量
 */
const Modules = {
  USER: 'user',
  BLOG: 'blog',
  CONTENT: 'content',
  MESSAGE: 'message',
  CONFIG: 'config',
  FEATURE: 'feature',
  GROUP: 'group',
  AUTH: 'auth',
  UPLOAD: 'upload',
  EXPORT: 'export'
};

module.exports = {
  logOperation,
  operationLogMiddleware,
  ActionTypes,
  Modules
};
