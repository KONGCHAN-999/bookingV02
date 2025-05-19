const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const authController = require('../Controllers/authControllers');

// @route   GET /api/auth
// @desc    Get current user
// @access  Private
router.get('/', auth, authController.getCurrentUser);

// @route   POST /api/auth
// @desc    Authenticate user & get token (Login)
// @access  Public
router.post(
    '/',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    authController.loginUser
);

module.exports = router;