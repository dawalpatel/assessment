const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/role');
const {
  createUserValidation,
  createStoreValidation
} = require('../middlewares/validators');

// Protect all admin routes
router.use(authenticate, authorize(['admin']));

router.get('/dashboard', adminController.getDashboard);
router.post('/users', createUserValidation, adminController.createUser);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.post('/stores', createStoreValidation, adminController.createStore);
router.get('/stores', adminController.getStores);

module.exports = router;
