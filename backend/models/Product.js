const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: ['electronics', 'clothing', 'books', 'home', 'sports', 'health', 'food', 'other']
  },
  brand: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  images: [{
    type: String
  }],
  specifications: {
    type: Map,
    of: String
  },
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for text search
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  brand: 'text',
  category: 'text',
  tags: 'text'
});

// Index for filtering
productSchema.index({ category: 1, price: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);