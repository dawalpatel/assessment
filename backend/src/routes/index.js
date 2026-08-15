const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const storeRoutes = require('./storeRoutes');
const storeOwnerRoutes = require('./storeOwnerRoutes');

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/stores', storeRoutes);
router.use('/store-owner', storeOwnerRoutes);

module.exports = router;
