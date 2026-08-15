const { Op } = require('sequelize');
const { Store, Rating, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    List all stores with average rating & current user's rating
 * @route   GET /api/stores
 * @access  Private (All authenticated users, mainly Normal User)
 */
const getStores = async (req, res, next) => {
  try {
    const { name, address, search, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    const currentUserId = req.user ? req.user.id : null;

    const where = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (address) {
      where.address = { [Op.like]: `%${address}%` };
    }
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ];
    }

    const stores = await Store.findAll({
      where,
      include: [
        {
          model: Rating,
          as: 'ratings',
          attributes: ['id', 'user_id', 'rating', 'createdAt', 'updatedAt']
        }
      ]
    });

    let formattedStores = stores.map(store => {
      const storeData = store.toJSON();
      const ratings = storeData.ratings || [];
      const ratingCount = ratings.length;
      const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = ratingCount > 0 ? parseFloat((sum / ratingCount).toFixed(2)) : null;

      // Find if current user submitted a rating
      const userRatingObj = currentUserId
        ? ratings.find(r => r.user_id === currentUserId)
        : null;

      const userRating = userRatingObj ? userRatingObj.rating : null;
      const userRatingId = userRatingObj ? userRatingObj.id : null;

      const { ratings: _, ...cleanStore } = storeData;

      return {
        ...cleanStore,
        averageRating,
        ratingCount,
        userRating,
        userRatingId
      };
    });

    // Handle sorting
    const actualSortOrder = sortOrder.toUpperCase() === 'ASC' ? 1 : -1;

    if (sortBy === 'rating' || sortBy === 'averageRating') {
      formattedStores.sort((a, b) => {
        const valA = a.averageRating !== null ? a.averageRating : -1;
        const valB = b.averageRating !== null ? b.averageRating : -1;
        return (valA - valB) * actualSortOrder;
      });
    } else if (sortBy === 'userRating') {
      formattedStores.sort((a, b) => {
        const valA = a.userRating !== null ? a.userRating : -1;
        const valB = b.userRating !== null ? b.userRating : -1;
        return (valA - valB) * actualSortOrder;
      });
    } else if (sortBy === 'name') {
      formattedStores.sort((a, b) => a.name.localeCompare(b.name) * actualSortOrder);
    } else if (sortBy === 'address') {
      formattedStores.sort((a, b) => (a.address || '').localeCompare(b.address || '') * actualSortOrder);
    } else {
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

/**
 * @desc    Submit rating for a store (1–5)
 * @route   POST /api/stores/:id/rating
 * @access  Private (Normal User)
 */
const submitRating = async (req, res, next) => {
  try {
    const storeId = req.params.id;
    const userId = req.user.id;
    const { rating } = req.body;

    const store = await Store.findByPk(storeId);
    if (!store) {
      return errorResponse(res, 'Store not found', null, 404);
    }

    // Check if user already submitted a rating
    let userRating = await Rating.findOne({
      where: {
        user_id: userId,
        store_id: storeId
      }
    });

    if (userRating) {
      // If rating already exists, update it (or prompt to modify)
      userRating.rating = rating;
      await userRating.save();
      return successResponse(res, 'Rating updated successfully', { rating: userRating }, 200);
    }

    // Create new rating
    userRating = await Rating.create({
      user_id: userId,
      store_id: storeId,
      rating
    });

    return successResponse(res, 'Rating submitted successfully', { rating: userRating }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Modify existing rating for a store (1–5)
 * @route   PUT /api/stores/:id/rating
 * @access  Private (Normal User)
 */
const modifyRating = async (req, res, next) => {
  try {
    const storeId = req.params.id;
    const userId = req.user.id;
    const { rating } = req.body;

    const userRating = await Rating.findOne({
      where: {
        user_id: userId,
        store_id: storeId
      }
    });

    if (!userRating) {
      return errorResponse(res, 'You have not submitted a rating for this store yet.', null, 404);
    }

    userRating.rating = rating;
    await userRating.save();

    return successResponse(res, 'Rating modified successfully', { rating: userRating }, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStores,
  submitRating,
  modifyRating
};
