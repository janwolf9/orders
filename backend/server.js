const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Database connection middleware for serverless
app.use(async (req, res, next) => {
  if (process.env.NODE_ENV === 'production' && mongoose.connection.readyState !== 1) {
    try {
      await connectToMongoDB();
    } catch (error) {
      console.error('Failed to connect to database:', error);
      return res.status(500).json({ message: 'Database connection failed' });
    }
  }
  next();
});

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3001', 
  'http://127.0.0.1:3001', 
  'http://localhost:3000',
  /^https:\/\/.*\.vercel\.app$/
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection with enhanced configuration for Vercel
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferCommands: true, // Enable mongoose buffering for serverless compatibility
};

// Global connection promise for serverless functions
let cachedConnection = null;
let connectionTimeout = null;

// Function to connect to MongoDB
async function connectToMongoDB() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  
  try {
    cachedConnection = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/webapp', 
      mongooseOptions
    );
    console.log('MongoDB connected successfully');
    
    // Set timeout to close connection after inactivity in serverless
    if (process.env.NODE_ENV === 'production') {
      if (connectionTimeout) clearTimeout(connectionTimeout);
      connectionTimeout = setTimeout(() => {
        if (mongoose.connection.readyState === 1) {
          mongoose.connection.close();
          cachedConnection = null;
          console.log('MongoDB connection closed due to inactivity');
        }
      }, 300000); // 5 minutes
    }
    
    return cachedConnection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    cachedConnection = null;
    throw error;
  }
}

// Handle connection for serverless environment
if (process.env.NODE_ENV === 'production') {
  // For Vercel serverless functions, we'll connect on first request
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
  });
  
  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
    cachedConnection = null;
  });
  
  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    cachedConnection = null;
  });
} else {
  // For local development - connect immediately
  connectToMongoDB().catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
}

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const uploadRoutes = require('./routes/uploads');
const cartRoutes = require('./routes/cart');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cart', cartRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(error.status || 500).json({
    message: error.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? error : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

// Export the Express API for Vercel
module.exports = app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}