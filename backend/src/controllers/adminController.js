const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { User, Store, Rating, sequelize } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Get Admin Dashboard Stats
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin only)
 */
const getDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    return successResponse(res, 'Dashboard statistics fetched successfully', {
      totalUsers,
      totalStores,
      totalRatings
    }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create User by Admin (any role)
 * @route   POST /api/admin/users
 * @access  Private (Admin only)
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      return errorResponse(res, 'Email already exists', [{
        field: 'email',
        message: 'A user with this email already exists'
      }], 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      address: address || null,
      role: role || 'user'
    });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt
    };

    return successResponse(res, 'User created successfully', { user: userResponse }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List Users with Filter and Sorting
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getUsers = async (req, res, next) => {
  try {
    const { name, email, address, role, sortBy = 'createdAt', sortOrder = 'DESC', search } = req.query;

    const where = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (email) {
      where.email = { [Op.like]: `%${email}%` };
    }
    if (address) {
      where.address = { [Op.like]: `%${address}%` };
    }
    if (role) {
      where.role = role;
    }
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ];
    }

    // Allowed sort columns
    const validSortFields = ['name', 'email', 'address', 'role', 'createdAt', 'created_at', 'updatedAt'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const actualSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt', 'updatedAt'],
      order: [[actualSortBy, actualSortOrder]]
    });

    return successResponse(res, 'Users retrieved successfully', { users }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get User Details (Includes store average rating if store_owner)
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin only)
 */
const getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt', 'updatedAt'],
      include: [
        {
          model: Store,
          as: 'stores',
          attributes: ['id', 'name', 'email', 'address', 'createdAt'],
          include: [
            {
              model: Rating,
              as: 'ratings',
              attributes: ['rating']
            }
          ]
        }
      ]
    });

    if (!user) {
      return errorResponse(res, 'User not found', null, 404);
    }

    const userData = user.toJSON();

    // If role is store_owner, calculate average rating
    if (userData.role === 'store_owner') {
      let totalRatingSum = 0;
      let totalRatingCount = 0;

      const storesWithAvg = (userData.stores || []).map(store => {
        const ratings = store.ratings || [];
        const count = ratings.length;
        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        const avg = count > 0 ? parseFloat((sum / count).toFixed(2)) : null;

        totalRatingSum += sum;
        totalRatingCount += count;

        const { ratings: _, ...storeWithoutRatings } = store;
        return {
          ...storeWithoutRatings,
          ratingCount: count,
          averageRating: avg
        };
      });

      userData.stores = storesWithAvg;
      userData.averageRating = totalRatingCount > 0
        ? parseFloat((totalRatingSum / totalRatingCount).toFixed(2))
        : null;
      userData.totalRatingsCount = totalRatingCount;
    }

    return successResponse(res, 'User details retrieved successfully', { user: userData }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create Store by Admin
 * @route   POST /api/admin/stores
 * @access  Private (Admin only)
 */
const createStore = async (req, res, next) => {
  try {
    const { name, email, address, owner_id } = req.body;

    // If owner_id provided, verify user exists and is a store_owner
    if (owner_id) {
      const owner = await User.findByPk(owner_id);
      if (!owner) {
        return errorResponse(res, 'Owner user not found', [{
          field: 'owner_id',
          message: 'Selected owner user does not exist'
        }], 404);
      }
      if (owner.role !== 'store_owner') {
        return errorResponse(res, 'Assigned owner must have the store_owner role', [{
          field: 'owner_id',
          message: 'Assigned owner must be a registered store owner'
        }], 400);
      }
    }

    const store = await Store.create({
      name,
      email: email.toLowerCase(),
      address,
      owner_id: owner_id || null
    });

    const populatedStore = await Store.findByPk(store.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    return successResponse(res, 'Store created successfully', { store: populatedStore }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List Stores with Filter, Sort, and Computed Average Rating
 * @route   GET /api/admin/stores
 * @access  Private (Admin only)
 */
const getStores = async (req, res, next) => {
  try {
    const { name, email, address, sortBy = 'createdAt', sortOrder = 'DESC', search } = req.query;

    const where = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (email) {
      where.email = { [Op.like]: `%${email}%` };
    }
    if (address) {
      where.address = { [Op.like]: `%${address}%` };
    }
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ];
    }

    const stores = await Store.findAll({
      where,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Rating,
          as: 'ratings',
          attributes: ['rating']
        }
      ]
    });

    // Compute average ratings and format response
    let formattedStores = stores.map(store => {
      const storeData = store.toJSON();
      const ratings = storeData.ratings || [];
      const ratingCount = ratings.length;
      const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = ratingCount > 0 ? parseFloat((sum / ratingCount).toFixed(2)) : null;

      const { ratings: _, ...storeClean } = storeData;
      return {
        ...storeClean,
        ratingCount,
        averageRating
      };
    });

    // Handle sorting including 'rating' or 'averageRating'
    const actualSortOrder = sortOrder.toUpperCase() === 'ASC' ? 1 : -1;

    if (sortBy === 'rating' || sortBy === 'averageRating') {
      formattedStores.sort((a, b) => {
        const valA = a.averageRating !== null ? a.averageRating : -1;
        const valB = b.averageRating !== null ? b.averageRating : -1;
        return (valA - valB) * actualSortOrder;
      });
    } else if (sortBy === 'name') {
      formattedStores.sort((a, b) => a.name.localeCompare(b.name) * actualSortOrder);
    } else if (sortBy === 'email') {
      formattedStores.sort((a, b) => a.email.localeCompare(b.email) * actualSortOrder);
    } else if (sortBy === 'address') {
      formattedStores.sort((a, b) => (a.address || '').localeCompare(b.address || '') * actualSortOrder);
    } else {
      // Default sort by createdAt
      formattedStores.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return (dateA - dateB) * actualSortOrder;
      });
    }

    return successResponse(res, 'Stores retrieved successfully', { stores: formattedStores }, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  createUser,
  getUsers,
  getUserDetails,
  createStore,
  getStores
};
