const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../Models/User');

// @desc    Register a user
// @route   POST /api/users
// @access  Public
exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password,
            role: role || 'user'
        });

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        // Check if requesting user is admin
        const user = await User.findById(req.user.id).select('-password');
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied, admin only' });
        }

        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin or Self
exports.getUserById = async (req, res) => {
    try {
        const requestingUser = await User.findById(req.user.id);

        // Allow access if admin or requesting own info
        if (requestingUser.role !== 'admin' && req.params.id !== req.user.id) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin or Self
exports.updateUser = async (req, res) => {
    try {
        const requestingUser = await User.findById(req.user.id);

        // Allow access if admin or updating own info
        if (requestingUser.role !== 'admin' && req.params.id !== req.user.id) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const { name, email, role, password } = req.body;

        // Build user object
        const userFields = {};
        if (name) userFields.name = name;
        if (email) userFields.email = email;

        // Only admins can change roles
        if (role && requestingUser.role === 'admin') {
            userFields.role = role;
        }

        // Update password if provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            userFields.password = await bcrypt.hash(password, salt);
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: userFields },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin or Self
exports.deleteUser = async (req, res) => {
    try {
        const requestingUser = await User.findById(req.user.id);

        // Allow access if admin or deleting own account
        if (requestingUser.role !== 'admin' && req.params.id !== req.user.id) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        await user.remove();

        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
};