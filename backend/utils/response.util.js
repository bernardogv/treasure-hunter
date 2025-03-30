// File: backend/utils/response.util.js
/**
 * Standardized API response utilities
 */

// Success response
const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// Error response
const error = (res, message = 'Error', statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

// Not found response
const notFound = (res, message = 'Resource not found') => {
  return error(res, message, 404);
};

// Unauthorized response
const unauthorized = (res, message = 'Unauthorized access') => {
  return error(res, message, 401);
};

// Forbidden response
const forbidden = (res, message = 'Forbidden') => {
  return error(res, message, 403);
};

module.exports = {
  success,
  error,
  notFound,
  unauthorized,
  forbidden
};

// File: backend/utils/validation.util.js
/**
 * Common validation functions
 */

// Check if valid MongoDB ObjectId
const isValidObjectId = (id) => {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
};

// Validate email format
const isValidEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

// Validate phone number format
const isValidPhone = (phone) => {
  const phonePattern = /^\+?[0-9]{10,15}$/;
  return phonePattern.test(phone);
};

// Validate password strength
const isStrongPassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordPattern.test(password);
};

// Validate URL format
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Validate coordinates
const isValidCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return false;
  }
  
  const [longitude, latitude] = coordinates;
  
  // Longitude: -180 to 180, Latitude: -90 to 90
  return (
    typeof longitude === 'number' &&
    typeof latitude === 'number' &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
};

module.exports = {
  isValidObjectId,
  isValidEmail,
  isValidPhone,
  isStrongPassword,
  isValidUrl,
  isValidCoordinates
};

// File: backend/utils/pagination.util.js
/**
 * Pagination utilities for API responses
 */
const { env } = require('../config');

// Create pagination for MongoDB queries
const createPagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || env.DEFAULT_PAGE_SIZE);
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

// Format pagination metadata for response
const paginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    pagination: {
      total,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage,
      hasPrevPage
    }
  };
};

module.exports = {
  createPagination,
  paginationMeta
};

// File: backend/utils/geocoding.util.js
/**
 * Utilities for handling geographic data and distance calculations
 */

// Convert miles to meters (for MongoDB geospatial queries)
const milesToMeters = (miles) => {
  return miles * 1609.34;
};

// Convert meters to miles
const metersToMiles = (meters) => {
  return meters / 1609.34;
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (coords1, coords2) => {
  // Destructure coordinates (longitude, latitude)
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  
  // Convert to radians
  const toRadians = (degree) => (degree * Math.PI) / 180;
  
  const R = 3959; // Earth radius in miles
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
           Math.cos(φ1) * Math.cos(φ2) *
           Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in miles
};

// Create geospatial query for MongoDB
const createNearQuery = (coords, radiusMiles) => {
  if (!coords || coords.length !== 2) {
    return null;
  }
  
  return {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: coords
      },
      $maxDistance: milesToMeters(radiusMiles)
    }
  };
};

module.exports = {
  milesToMeters,
  metersToMiles,
  calculateDistance,
  createNearQuery
};

// File: backend/utils/image.util.js
/**
 * Utilities for handling image uploads and processing
 */
const { v4: uuidv4 } = require('uuid');
const { aws } = require('../config');

// Generate unique filename for S3
const generateUniqueFilename = (originalFilename) => {
  const extension = originalFilename.split('.').pop();
  return `${uuidv4()}.${extension}`;
};

// Upload image to S3
const uploadImageToS3 = async (file, userId) => {
  try {
    const filename = generateUniqueFilename(file.originalname);
    const key = `uploads/${userId}/${filename}`;
    
    const result = await aws.uploadFile(file, key);
    
    return {
      url: result.Location,
      key: result.Key
    };
  } catch (error) {
    console.error('Error uploading image to S3:', error);
    throw new Error('Image upload failed');
  }
};

// Delete image from S3
const deleteImageFromS3 = async (key) => {
  try {
    await aws.deleteFile(key);
    return true;
  } catch (error) {
    console.error('Error deleting image from S3:', error);
    return false;
  }
};

module.exports = {
  generateUniqueFilename,
  uploadImageToS3,
  deleteImageFromS3
};

// File: backend/utils/index.js
/**
 * Export all utilities from a single file
 */
module.exports = {
  response: require('./response.util'),
  validation: require('./validation.util'),
  pagination: require('./pagination.util'),
  geocoding: require('./geocoding.util'),
  image: require('./image.util')
};