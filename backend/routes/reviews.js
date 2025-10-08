const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult, query } = require('express-validator');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const reviewValidation = [
  body('product').isMongoId().withMessage('Invalid product ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').isLength({ min: 1, max: 100 }).withMessage('Title is required and must be less than 100 characters').trim(),
  body('comment').isLength({ min: 1, max: 1000 }).withMessage('Comment is required and must be less than 1000 characters').trim()
];

// @route   GET /api/reviews
// @desc    Get reviews with filters
// @access  Public
router.get('/', [
  query('product').optional().isMongoId().withMessage('Invalid product ID'),
  query('user').optional().isMongoId().withMessage('Invalid user ID'),
  query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sortBy').optional().isIn(['rating', 'createdAt', 'helpful']).withMessage('Invalid sort field')
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
    let filter = { reported: false };
    
    if (req.query.product) {
      filter.product = req.query.product;
    }
    
    if (req.query.user) {
      filter.user = req.query.user;
    }
    
    if (req.query.rating) {
      filter.rating = parseInt(req.query.rating);
    }

    // Build sort
    let sort = {};
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    sort[sortBy] = sortOrder;

    const reviews = await Review.find(filter)
      .populate('user', 'username firstName lastName')
      .populate('product', 'name images')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments(filter);

    // If filtering by product, also get rating statistics
    let ratingStats = null;
    if (req.query.product) {
      const stats = await Review.aggregate([
        { $match: { product: mongoose.Types.ObjectId(req.query.product), reported: false } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            ratingDistribution: {
              $push: '$rating'
            }
          }
        }
      ]);

      if (stats.length > 0) {
        const distribution = [1, 2, 3, 4, 5].map(rating => ({
          rating,
          count: stats[0].ratingDistribution.filter(r => r === rating).length
        }));

        ratingStats = {
          averageRating: Math.round(stats[0].averageRating * 10) / 10,
          totalReviews: stats[0].totalReviews,
          distribution
        };
      }
    }

    res.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNext: page * limit < totalReviews,
        hasPrev: page > 1
      },
      ratingStats
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/my
// @desc    Get current user's reviews
// @access  Private
router.get('/my', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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

    const filter = { user: req.user._id };

    const reviews = await Review.find(filter)
      .populate('product', 'name images price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments(filter);

    res.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNext: page * limit < totalReviews,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/:id
// @desc    Get review by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'username firstName lastName')
      .populate('product', 'name images price');

    if (!review || review.reported) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ review });
  } catch (error) {
    console.error('Get review error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews
// @desc    Create new review
// @access  Private
router.post('/', auth, reviewValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { product, rating, title, comment, images } = req.body;

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists || !productExists.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(409).json({
        message: 'You have already reviewed this product'
      });
    }

    // Check if user has purchased this product (optional verification)
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.product': product,
      status: { $in: ['delivered', 'shipped'] }
    });

    const review = new Review({
      product,
      user: req.user._id,
      rating,
      title,
      comment,
      images: images || [],
      verified: !!hasPurchased
    });

    await review.save();
    
    await review.populate([
      { path: 'user', select: 'username firstName lastName' },
      { path: 'product', select: 'name images' }
    ]);

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private
router.put('/:id', auth, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters').trim(),
  body('comment').optional().isLength({ min: 1, max: 1000 }).withMessage('Comment must be 1-1000 characters').trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const review = await Review.findById(req.params.id);
    
    if (!review || review.reported) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Users can only update their own reviews
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allowedUpdates = ['rating', 'title', 'comment', 'images'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate([
      { path: 'user', select: 'username firstName lastName' },
      { path: 'product', select: 'name images' }
    ]);

    res.json({
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Users can only delete their own reviews, or admin can delete any
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.put('/:id/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review || review.reported) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.helpful += 1;
    await review.save();

    res.json({
      message: 'Review marked as helpful',
      helpful: review.helpful
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reviews/:id/report
// @desc    Report review (admin only)
// @access  Private/Admin
router.put('/:id/report', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.reported = !review.reported;
    await review.save();

    res.json({
      message: `Review ${review.reported ? 'reported' : 'unreported'} successfully`,
      review
    });
  } catch (error) {
    console.error('Report review error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;