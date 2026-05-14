const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'groups',
      key: 'id'
    }
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: '用户自定义权限，覆盖角色默认权限'
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: '用户个性化配置（主题、语言、界面设置等）'
  },
  customDomain: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    comment: '用户自定义域名'
  },
  domainConfig: {
    type: DataTypes.JSON,
    defaultValue: {
      enabled: false,
      showPublicContent: true,
      showProjects: true,
      showSkills: true,
      showBlog: true,
      showBookmarks: true,
      customBranding: false,
      siteName: ''
    },
    comment: '自定义域名配置：显示哪些内容'
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
