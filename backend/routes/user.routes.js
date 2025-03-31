// File: backend/routes/user.routes.js
/**
 * User routes
 */
const express = require('express');
const userRouter = express.Router();
const { user: userController } = require('../controllers');
const { auth } = require('../middleware');

// All routes require authentication
userRouter.use(auth.authenticate);

// Get current user
userRouter.get('/profile', userController.getCurrentUser);

// Update user profile
userRouter.put('/profile', userController.updateProfile);

// Update user preferences
userRouter.put('/preferences', userController.updatePreferences);

// Update user type
userRouter.put('/type', userController.updateUserType);

// Update subscription
userRouter.put('/subscription', userController.updateSubscription);

module.exports = userRouter;