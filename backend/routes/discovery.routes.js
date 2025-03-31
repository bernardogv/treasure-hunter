// File: backend/routes/discovery.routes.js
/**
 * Discovery routes for swiping interface
 */
const express = require('express');
const discoveryRouter = express.Router();
const { listing: listingController } = require('../controllers');
const { auth } = require('../middleware');

// All routes require authentication
discoveryRouter.use(auth.authenticate);

// Get listings for discovery (swiping)
discoveryRouter.get('/', listingController.getDiscoveryListings);

// Record swipe interaction
discoveryRouter.post('/interaction', listingController.recordSwipeInteraction);

module.exports = discoveryRouter;