const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
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
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(400),
    allowNull: true,
    validate: {
      len: [0, 400]
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'user', 'store_owner'),
    allowNull: false,
    defaultValue: 'user'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

module.exports = User;
