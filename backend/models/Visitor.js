const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Visitor = sequelize.define('Visitor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ip: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  path: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  referrer: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  sessionId: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'visitors',
  timestamps: true,
  indexes: [
    { fields: ['path'] },
    { fields: ['createdAt'] },
    { fields: ['sessionId'] }
  ]
});

module.exports = Visitor;
