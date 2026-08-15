const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/role');
const { submitRatingValidation } = require('../middlewares/validators');

// All store routes require authentication
router.use(authenticate);

// Normal user and all roles can list stores
router.get('/', storeController.getStores);

// Only normal users submit and modify ratings
router.post('/:id/rating', authorize(['user']), submitRatingValidation, storeController.submitRating);
router.put('/:id/rating', authorize(['user']), submitRatingValidation, storeController.modifyRating);

module.exports = router;
