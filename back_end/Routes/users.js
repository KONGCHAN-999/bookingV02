const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const usersController = require('../Controllers/usersControllers');

// @route   POST /api/users
// @desc    Register user
// @access  Public
router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
    ],
    usersController.registerUser
);

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/user', auth, usersController.getUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin or Self
router.get('/user:id', auth, usersController.getUserById);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private/Admin or Self
router.put('/user:id', auth, usersController.updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin or Self
router.delete('/user:id', auth, usersController.deleteUser);

module.exports = router; 