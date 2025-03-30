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
  return error(res, message, 401)} ;