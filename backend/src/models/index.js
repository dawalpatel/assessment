const sequelize = require('../config/database');
const User = require('./User');
const Store = require('./Store');
const Rating = require('./Rating');

// Associations
User.hasMany(Rating, { foreignKey: 'user_id', as: 'ratings', onDelete: 'CASCADE' });
Rating.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Store.hasMany(Rating, { foreignKey: 'store_id', as: 'ratings', onDelete: 'CASCADE' });
Rating.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

User.hasMany(Store, { foreignKey: 'owner_id', as: 'stores', onDelete: 'SET NULL' });
Store.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

module.exports = {
  sequelize,
  User,
  Store,
  Rating
};
