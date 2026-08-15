const { Store, Rating, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Get Store Owner Dashboard (average rating + list of raters)
 * @route   GET /api/store-owner/dashboard
 * @access  Private (Store Owner only)
 */
const getDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { sortBy = 'date', sortOrder = 'DESC' } = req.query;

    // Find stores owned by this user
    const stores = await Store.findAll({
      where: { owner_id: ownerId },
      include: [
        {
          model: Rating,
          as: 'ratings',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'address']
            }
          ]
        }
      ]
    });

    if (!stores || stores.length === 0) {
      return successResponse(res, 'No stores assigned to this owner yet.', {
        hasStore: false,
        stores: [],
        averageRating: null,
        totalRatings: 0,
        raters: []
      }, 200);
    }

    let allRaters = [];
    let totalScore = 0;
    let totalRatingsCount = 0;

    const formattedStores = stores.map(store => {
      const storeData = store.toJSON();
      const ratings = storeData.ratings || [];
      const count = ratings.length;
      const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
      const avg = count > 0 ? parseFloat((sum / count).toFixed(2)) : null;

      totalScore += sum;
      totalRatingsCount += count;

      ratings.forEach(r => {
        allRaters.push({
          id: r.id,
          storeId: store.id,
          storeName: store.name,
          userId: r.user ? r.user.id : null,
          userName: r.user ? r.user.name : 'Unknown User',
          userEmail: r.user ? r.user.email : 'Unknown Email',
          userAddress: r.user ? r.user.address : '',
          rating: r.rating,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        });
      });

      const { ratings: _, ...cleanStore } = storeData;
      return {
        ...cleanStore,
        ratingCount: count,
        averageRating: avg
      };
    });

    const overallAverageRating = totalRatingsCount > 0
      ? parseFloat((totalScore / totalRatingsCount).toFixed(2))
      : null;

    // Sort raters
    const actualSortOrder = sortOrder.toUpperCase() === 'ASC' ? 1 : -1;
    if (sortBy === 'name' || sortBy === 'userName') {
      allRaters.sort((a, b) => a.userName.localeCompare(b.userName) * actualSortOrder);
    } else if (sortBy === 'email' || sortBy === 'userEmail') {
      allRaters.sort((a, b) => a.userEmail.localeCompare(b.userEmail) * actualSortOrder);
    } else if (sortBy === 'rating') {
      allRaters.sort((a, b) => (a.rating - b.rating) * actualSortOrder);
    } else {
      // Default sort by date
      allRaters.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return (dateA - dateB) * actualSortOrder;
      });
    }

    return successResponse(res, 'Store owner dashboard data retrieved successfully', {
      hasStore: true,
      stores: formattedStores,
      primaryStore: formattedStores[0] || null,
      averageRating: overallAverageRating,
      totalRatings: totalRatingsCount,
      raters: allRaters
    }, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard
};
