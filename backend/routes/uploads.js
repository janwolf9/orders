const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage(); // Use memory storage for Vercel compatibility

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5 // Maximum 5 files per upload
  }
});

// @route   POST /api/upload/single
// @desc    Upload single file
// @access  Private
router.post('/single', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Convert file to base64 for storage in database or return buffer info
    const base64Data = req.file.buffer.toString('base64');
    const fileUrl = `data:${req.file.mimetype};base64,${base64Data}`;

    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: `upload-${Date.now()}-${Math.round(Math.random() * 1E9)}.${req.file.originalname.split('.').pop()}`,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        base64: base64Data
      }
    });
  } catch (error) {
    console.error('Single file upload error:', error);
    res.status(500).json({ message: 'File upload failed' });
  }
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple files
// @access  Private
router.post('/multiple', auth, upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const files = req.files.map(file => {
      const base64Data = file.buffer.toString('base64');
      return {
        filename: `upload-${Date.now()}-${Math.round(Math.random() * 1E9)}.${file.originalname.split('.').pop()}`,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `data:${file.mimetype};base64,${base64Data}`,
        base64: base64Data
      };
    });

    res.json({
      message: 'Files uploaded successfully',
      files
    });
  } catch (error) {
    console.error('Multiple files upload error:', error);
    res.status(500).json({ message: 'Files upload failed' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: `File too large. Maximum size is ${(parseInt(process.env.MAX_FILE_SIZE) || 5242880) / 1024 / 1024}MB`
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum 5 files allowed'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected file field'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      message: 'Only image files are allowed'
    });
  }

  next(error);
});

module.exports = router;