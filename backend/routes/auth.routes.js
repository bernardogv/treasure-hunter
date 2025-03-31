// File: backend/routes/auth.routes.js
/**
 * Authentication routes
 */
const express = require('express');
const authRouter = express.Router();
const { auth: authController } = require('../controllers');
const { auth, validation } = require('../middleware');

// Register new user
authRouter.post(
  '/register',
  validation.validate(validation.schemas.userRegistration),
  authController.register
);

// Login user
authRouter.post(
  '/login',
  validation.validate(validation.schemas.userLogin),
  authController.login
);

// Refresh token
authRouter.post('/refresh-token', authController.refreshToken);

// Request password reset
authRouter.post('/password-reset/request', authController.requestPasswordReset);

// Reset password with token
authRouter.post('/password-reset/reset', authController.resetPassword);

// Change password (requires authentication)
authRouter.post(
  '/password-change',
  auth.authenticate,
  authController.changePassword
);

module.exports = authRouter;