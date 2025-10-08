const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation rules for address
const addressValidation = [
  body('street').isLength({ min: 1 }).withMessage('Street is required').trim(),
  body('city').isLength({ min: 1 }).withMessage('City is required').trim(),
  body('postalCode').isLength({ min: 1 }).withMessage('Postal code is required').trim(),
  body('country').isLength({ min: 1 }).withMessage('Country is required').trim()
];

// Validation rules for order
const orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.product').isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('billingAddress').isObject().withMessage('Billing address is required'),
  body('paymentMethod').isIn(['credit_card', 'debit_card', 'paypal', 'cash_on_delivery']).withMessage('Invalid payment method'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

// @route   GET /api/orders
// @desc    Get user's orders or all orders (admin)
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  query('userId').optional().isMongoId().withMessage('Invalid user ID')
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

    // Build filter
    let filter = {};
    
    // If not admin, only show user's orders
    if (req.user.role !== 'admin') {
      filter.user = req.user._id;
    } else if (req.query.userId) {
      filter.user = req.query.userId;
    }

    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Order number search
    if (req.query.orderNumber) {
      filter.orderNumber = { $regex: req.query.orderNumber, $options: 'i' };
    }

    // Build query for user search
    let query = Order.find(filter);

    // User search (only for admin)
    if (req.user.role === 'admin' && req.query.userSearch) {
      const userSearchRegex = { $regex: req.query.userSearch, $options: 'i' };
      query = Order.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $match: {
            $or: [
              { 'user.firstName': userSearchRegex },
              { 'user.lastName': userSearchRegex },
              { 'user.username': userSearchRegex },
              { 'user.email': userSearchRegex }
            ]
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]);

      const orders = await query;
      const totalOrders = await Order.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $match: {
            $or: [
              { 'user.firstName': userSearchRegex },
              { 'user.lastName': userSearchRegex },
              { 'user.username': userSearchRegex },
              { 'user.email': userSearchRegex }
            ]
          }
        },
        { $count: "total" }
      ]);

      const total = totalOrders[0]?.total || 0;

      return res.json({
        orders: orders.map(order => ({
          ...order,
          items: order.items.map(item => ({
            ...item,
            product: order.productDetails.find(p => p._id.toString() === item.product.toString()) || item.product
          }))
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      });
    }

    const orders = await query
      .populate('user', 'username firstName lastName email')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNext: page * limit < totalOrders,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/my
// @desc    Get current user's orders
// @access  Private
router.get('/my', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status')
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

    let filter = { user: req.user._id };
    
    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNext: page * limit < totalOrders,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'username firstName lastName email')
      .populate('items.product', 'name price images description');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Users can only view their own orders unless they are admin
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', auth, orderValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { items, shippingAddress, billingAddress, paymentMethod, notes } = req.body;

    // Validate and calculate order total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product || !product.isActive) {
        return res.status(400).json({
          message: `Product not found: ${item.product}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Generate unique order number
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Create order
    const order = new Order({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    await order.save();
    
    await order.populate([
      { path: 'user', select: 'username firstName lastName email' },
      { path: 'items.product', select: 'name price images' }
    ]);

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (admin only)
// @access  Private/Admin
router.put('/:id/status', auth, [
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  body('trackingNumber').optional().isLength({ min: 1 }).withMessage('Tracking number cannot be empty')
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Handle stock restoration for cancelled orders
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();
    
    await order.populate([
      { path: 'user', select: 'username firstName lastName email' },
      { path: 'items.product', select: 'name price images' }
    ]);

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order (user can cancel their own pending orders)
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Users can only cancel their own orders unless they are admin
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        message: 'Order cannot be cancelled. Current status: ' + order.status
      });
    }

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/stats/summary
// @desc    Get order statistics (admin only)
// @access  Private/Admin
router.get('/stats/summary', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      {
        $match: { status: { $in: ['delivered', 'shipped', 'processing'] } }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      statusBreakdown: stats
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;