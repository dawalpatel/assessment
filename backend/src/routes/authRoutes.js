const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middlewares/auth');
const {
  signupValidation,
  loginValidation,
  updatePasswordValidation
} = require('../middlewares/validators');

router.post('/signup', signupValidation, authController.signup);
router.post('/login', loginValidation, authController.login);
router.post('/logout', authenticate, authController.logout);
router.put('/update-password', authenticate, updatePasswordValidation, authController.updatePassword);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
