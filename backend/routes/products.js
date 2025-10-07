const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const productValidation = [
  body('name').isLength({ min: 1, max: 100 }).withMessage('Product name is required and must be less than 100 characters').trim(),
  body('description').isLength({ min: 1, max: 1000 }).withMessage('Description is required and must be less than 1000 characters').trim(),
  body('price').isNumeric({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['electronics', 'clothing', 'books', 'home', 'sports', 'health', 'food', 'other']).withMessage('Invalid category'),
  body('brand').isLength({ min: 1, max: 50 }).withMessage('Brand is required and must be less than 50 characters').trim(),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('weight').optional().isNumeric({ min: 0 }).withMessage('Weight must be a positive number'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
];

// @route   GET /api/products
// @desc    Get all products with search and filters
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('search').optional().isLength({ min: 1 }).withMessage('Search term cannot be empty'),
  query('category').optional().isIn(['electronics', 'clothing', 'books', 'home', 'sports', 'health', 'food', 'other']).withMessage('Invalid category'),
  query('minPrice').optional().isNumeric({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isNumeric({ min: 0 }).withMessage('Max price must be a positive number'),
  query('brand').optional().isLength({ min: 1 }).withMessage('Brand cannot be empty'),
  query('sortBy').optional().isIn(['name', 'price', 'createdAt', 'stock']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
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
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Build filter object
    let filter = { isActive: true };
    
    // Search functionality
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    
    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Brand filter
    if (req.query.brand) {
      filter.brand = { $regex: req.query.brand, $options: 'i' };
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Build sort object
    let sort = {};
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    sort[sortBy] = sortOrder;

    // Add text score for search relevance
    if (req.query.search) {
      sort.score = { $meta: 'textScore' };
    }

    const products = await Product.find(filter)
      .populate('createdBy', 'username firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments(filter);

    // Get available categories and brands for filtering
    const categories = await Product.distinct('category', { isActive: true });
    const brands = await Product.distinct('brand', { isActive: true });

    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        hasNext: page * limit < totalProducts,
        hasPrev: page > 1
      },
      filters: {
        categories,
        brands
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName');
    
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private/Admin
router.post('/', auth, productValidation, async (req, res) => {
  try {
    // Check if user is admin
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

    const productData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Handle specifications if provided
    if (req.body.specifications) {
      productData.specifications = new Map(Object.entries(req.body.specifications));
    }

    const product = new Product(productData);
    await product.save();
    
    await product.populate('createdBy', 'username firstName lastName');

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/:id', auth, productValidation, async (req, res) => {
  try {
    // Check if user is admin
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

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updateData = { ...req.body };
    
    // Handle specifications if provided
    if (req.body.specifications) {
      updateData.specifications = new Map(Object.entries(req.body.specifications));
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username firstName lastName');

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (soft delete)
// @access  Private/Admin
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Soft delete - just mark as inactive
    product.isActive = false;
    await product.save();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id/stock
// @desc    Update product stock
// @access  Private/Admin
router.put('/:id/stock', auth, [
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
  try {
    // Check if user is admin
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

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is the creator or admin
    if (product.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    product.stock = req.body.stock;
    await product.save();

    res.json({
      message: 'Stock updated successfully',
      product
    });
  } catch (error) {
    console.error('Update stock error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;