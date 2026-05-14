const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SiteFeature = sequelize.define('SiteFeature', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  feature: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  config: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'site_features',
  timestamps: true
});

module.exports = SiteFeature;
