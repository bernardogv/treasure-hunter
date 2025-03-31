// File: backend/routes/merchant.routes.js
/**
 * Merchant dashboard routes
 */
const express = require('express');
const merchantRouter = express.Router();
const { merchant: merchantController } = require('../controllers');
const { auth } = require('../middleware');

// All routes require authentication and seller privileges
merchantRouter.use(auth.authenticate);
merchantRouter.use(auth.isSeller);

// Get dashboard summary
merchantRouter.get('/dashboard', merchantController.getDashboardSummary);

// Get inventory analytics
merchantRouter.get('/analytics/inventory', merchantController.getInventoryAnalytics);

// Get offer analytics
merchantRouter.get('/analytics/offers', merchantController.getOfferAnalytics);

module.exports = merchantRouter;