const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', adminAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isLength({ min: 1 }).withMessage('Search term cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search;

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: page * limit < totalUsers,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id/details
// @desc    Get user details with orders and cart (admin only)
// @access  Private/Admin
router.get('/:id/details', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's orders
    const Order = require('../models/Order');
    const orders = await Order.find({ user: req.params.id })
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's cart
    const Cart = require('../models/Cart');
    const cart = await Cart.findOne({ user: req.params.id })
      .populate('items.product', 'name price images');

    // Calculate user statistics
    const totalOrders = await Order.countDocuments({ user: req.params.id });
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    const ordersByStatus = await Order.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.params.id) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      user,
      orders,
      cart: cart || { items: [] },
      statistics: {
        totalOrders,
        totalSpent,
        cartItems: cart ? cart.items.length : 0,
        ordersByStatus
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    // Users can only view their own profile unless they are admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', auth, [
  body('firstName').optional().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters').trim(),
  body('lastName').optional().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters').trim(),
  body('username').optional().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters').isAlphanumeric(),
  body('email').optional().isEmail().withMessage('Please provide a valid email').normalizeEmail()
], async (req, res) => {
  try {
    // Users can only update their own profile unless they are admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const allowedUpdates = ['firstName', 'lastName', 'username', 'email'];
    const updates = {};

    // Filter only allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Check if username or email already exists (if updating them)
    if (updates.username || updates.email) {
      const existingUser = await User.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(updates.username ? [{ username: updates.username }] : []),
          ...(updates.email ? [{ email: updates.email }] : [])
        ]
      });

      if (existingUser) {
        const field = existingUser.username === updates.username ? 'username' : 'email';
        return res.status(409).json({
          message: `This ${field} is already taken`
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/toggle-status
// @desc    Toggle user active status (admin only)
// @access  Private/Admin
router.put('/:id/toggle-status', adminAuth, async (req, res) => {
  try {
    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;