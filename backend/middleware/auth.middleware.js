// File: backend/middleware/auth.middleware.js
/**
 * Authentication middleware
 * Verifies JWT token and adds user to request object
 */
const { jwt } = require('../config');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. Authentication failed.' 
      });
    }
    
    // Find user by id
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found. Authentication failed.' 
      });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication.' 
    });
  }
};

// Check if user is a seller
const isSeller = (req, res, next) => {
  if (req.user.userType === 'seller' || req.user.userType === 'both') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Seller privileges required.' 
    });
  }
};

module.exports = {
  authenticate,
  isSeller
};

// File: backend/middleware/error.middleware.js
/**
 * Error handling middleware
 * Centralized error handling for consistent error responses
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists.`
    });
  }
  
  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`
    });
  }
  
  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  // Default to 500 server error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
};

module.exports = errorHandler;

// File: backend/middleware/upload.middleware.js
/**
 * Middleware for handling file uploads
 * Uses multer for file parsing and validation
 */
const multer = require('multer');
const path = require('path');
const { env } = require('../config');

// Configure storage
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (req, file, cb) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Create upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_IMAGE_SIZE // File size limit from config
  }
});

// Middleware for handling multiple images
const uploadListingImages = upload.array('images', env.MAX_IMAGES_PER_LISTING);

// Error handler for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File size exceeds limit of ${env.MAX_IMAGE_SIZE / 1024 / 1024}MB`
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: `Too many files. Maximum allowed is ${env.MAX_IMAGES_PER_LISTING}`
      });
    }
    
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next(err);
};

module.exports = {
  uploadListingImages,
  handleUploadError
};

// File: backend/middleware/validation.middleware.js
/**
 * Request validation middleware using Joi
 */
const Joi = require('joi');

// Create a validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    next();
  };
};

// Common validation schemas
const schemas = {
  // User registration schema
  userRegistration: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required(),
    phone: Joi.string().allow('', null),
    userType: Joi.string().valid('buyer', 'seller', 'both').required(),
    location: Joi.object({
      coordinates: Joi.array().items(Joi.number()).length(2).required(),
      address: Joi.string().allow('', null)
    })
  }),
  
  // User login schema
  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  // Listing creation schema
  listingCreation: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().min(0).required(),
    description: Joi.string().allow('', null),
    category: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
    location: Joi.object({
      coordinates: Joi.array().items(Joi.number()).length(2).required(),
      address: Joi.string().allow('', null)
    }).required()
  }),
  
  // Offer creation schema
  offerCreation: Joi.object({
    listingId: Joi.string().required(),
    offerPrice: Joi.number().min(0).required()
  }),
  
  // Message creation schema
  messageCreation: Joi.object({
    content: Joi.string().required(),
    receiverId: Joi.string().required(),
    listingId: Joi.string().required()
  })
};

module.exports = {
  validate,
  schemas
};

// File: backend/middleware/index.js
/**
 * Export all middleware from a single file
 */
module.exports = {
  auth: require('./auth.middleware'),
  error: require('./error.middleware'),
  upload: require('./upload.middleware'),
  validation: require('./validation.middleware'),
};