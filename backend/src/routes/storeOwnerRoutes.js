const express = require('express');
const router = express.Router();
const storeOwnerController = require('../controllers/storeOwnerController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/role');

router.use(authenticate, authorize(['store_owner']));

router.get('/dashboard', storeOwnerController.getDashboard);

module.exports = router;
