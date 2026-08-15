const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
    validate: {
      len: [20, 60]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  address: {
    type: DataTypes.STRING(400),
    allowNull: true,
    validate: {
      len: [0, 400]
    }
  },
  owner_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'stores',
  timestamps: true,
  underscored: true
});

module.exports = Store;
