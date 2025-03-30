// File: backend/config/env.config.js
/**
 * Environment configuration
 * All environment variables should be defined here with sensible defaults
 */
require('dotenv').config();

module.exports = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // MongoDB connection
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/antique-finder',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production',
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '30d',
  
  // AWS S3 configuration for image storage
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || 'antique-finder-images',
  
  // Email configuration for password reset
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  
  // API configuration
  API_URL: process.env.API_URL || 'http://localhost:5000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Limits and constraints
  MAX_IMAGE_SIZE: process.env.MAX_IMAGE_SIZE || 5242880, // 5MB
  MAX_IMAGES_PER_LISTING: process.env.MAX_IMAGES_PER_LISTING || 10,
  DEFAULT_PAGE_SIZE: process.env.DEFAULT_PAGE_SIZE || 20,
  
  // Feature flags
  ENABLE_PUSH_NOTIFICATIONS: process.env.ENABLE_PUSH_NOTIFICATIONS === 'true' || false,
  ENABLE_EMAIL_NOTIFICATIONS: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true' || false,
};

// File: backend/config/db.config.js
/**
 * Database configuration and connection setup
 */
const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env.config');

// MongoDB connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true, // Build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

// Create connection function
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Export the connection function
module.exports = connectDB;

// File: backend/config/jwt.config.js
/**
 * JWT configuration for authentication
 */
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRATION, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRATION } = require('./env.config');

// Generate access token
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION
  });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRATION
  });
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};

// File: backend/config/aws.config.js
/**
 * AWS S3 configuration for image storage
 */
const AWS = require('aws-sdk');
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_BUCKET_NAME } = require('./env.config');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION
});

// Create S3 instance
const s3 = new AWS.S3();

// Upload file to S3
const uploadFile = async (file, key) => {
  const params = {
    Bucket: AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  return s3.upload(params).promise();
};

// Delete file from S3
const deleteFile = async (key) => {
  const params = {
    Bucket: AWS_BUCKET_NAME,
    Key: key
  };

  return s3.deleteObject(params).promise();
};

// Get file from S3
const getFile = async (key) => {
  const params = {
    Bucket: AWS_BUCKET_NAME,
    Key: key
  };

  return s3.getObject(params).promise();
};

module.exports = {
  s3,
  uploadFile,
  deleteFile,
  getFile
};

// File: backend/config/index.js
/**
 * Export all configurations from a single file
 */
module.exports = {
  env: require('./env.config'),
  db: require('./db.config'),
  jwt: require('./jwt.config'),
  aws: require('./aws.config')
};