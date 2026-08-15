const bcrypt = require('bcrypt');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Public Signup (Creates 'user' role only)
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password, address } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return errorResponse(res, 'Email is already registered.', [{
        field: 'email',
        message: 'This email is already in use'
      }], 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user strictly with role 'user'
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      address: address || null,
      role: 'user'
    });

    // Generate JWT token
    const token = generateToken({
      id: newUser.id,
      role: newUser.role
    });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      address: newUser.address,
      role: newUser.role,
      createdAt: newUser.createdAt
    };

    return successResponse(res, 'User registered successfully', {
      user: userResponse,
      token
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Single Login endpoint for all roles
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return errorResponse(res, 'Invalid email or password.', null, 401);
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password.', null, 401);
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      role: user.role
    });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt
    };

    return successResponse(res, 'Logged in successfully', {
      user: userResponse,
      token
    }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Password for authenticated user
 * @route   PUT /api/auth/update-password
 * @access  Private (All Roles)
 */
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return errorResponse(res, 'User not found.', null, 404);
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect.', [{
        field: 'currentPassword',
        message: 'Current password does not match'
      }], 400);
    }

    // Hash and update new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return successResponse(res, 'Password updated successfully', null, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Current Logged-in User Profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    return successResponse(res, 'User profile fetched successfully', {
      user: req.user
    }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout (Clears cookie)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    return successResponse(res, 'Logged out successfully', null, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  updatePassword,
  getMe,
  logout
};
