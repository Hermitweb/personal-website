const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Section = sequelize.define('Section', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 板块名称（显示标题）
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  // 板块标识符（用于路由和引用）
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  // 板块类型：'builtin' 内置板块（skills/projects/bookmarks）, 'custom' 自定义板块
  sectionType: {
    type: DataTypes.ENUM('builtin', 'custom'),
    allowNull: false,
    defaultValue: 'custom'
  },
  // 关联的内容类型：'skill', 'project', 'bookmark', 或自定义类型
  contentType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  // 展示模式：'list' 列表模式, 'single' 单一内容模式
  displayMode: {
    type: DataTypes.ENUM('list', 'single'),
    allowNull: false,
    defaultValue: 'list'
  },
  // 板块描述
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // 板块图标（FontAwesome图标名称）
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'FaLayerGroup'
  },
  // 背景颜色/样式配置
  styleConfig: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  // 排序号
  orderNum: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // 是否可见
  isVisible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // 是否需要登录才能查看
  requireLogin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // 扩展配置（如列表模式下的列数、单一内容模式下的布局等）
  config: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      columns: 3,        // 列表模式列数
      rows: 3,           // 列表模式行数（分页用）
      showTitle: true,   // 是否显示板块标题
      showDescription: false // 是否显示板块描述
    }
  }
}, {
  tableName: 'sections',
  timestamps: true
});

module.exports = Section;
