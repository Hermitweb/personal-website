const sequelize = require('../config/database');
const User = require('./User');
const Content = require('./Content');
const SiteConfig = require('./SiteConfig');
const Message = require('./Message');
const Blog = require('./Blog');
const Visitor = require('./Visitor');
const SiteFeature = require('./SiteFeature');
const Group = require('./Group');
const Section = require('./Section');
const OperationLog = require('./OperationLog');

// 定义关联关系
User.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });
Group.hasMany(User, { foreignKey: 'groupId', as: 'users' });

const db = {
  sequelize,
  User,
  Content,
  SiteConfig,
  Message,
  Blog,
  Visitor,
  SiteFeature,
  Group,
  Section,
  OperationLog
};

module.exports = db;
