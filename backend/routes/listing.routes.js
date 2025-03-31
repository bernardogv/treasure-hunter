// File: backend/routes/listing.routes.js
/**
 * Listing routes
 */
const express = require('express');
const listingRouter = express.Router();
const { listing: listingController } = require('../controllers');
const { auth, upload, validation } = require('../middleware');

// Routes that don't require authentication
// Get listings (with filtering)
listingRouter.get('/', listingController.getListings);

// Get listing by ID
listingRouter.get('/:id', listingController.getListingById);

// Routes that require authentication
listingRouter.use(auth.authenticate);

// Create new listing
listingRouter.post(
  '/',
  auth.isSeller,
  upload.uploadListingImages,
  upload.handleUploadError,
  validation.validate(validation.schemas.listingCreation),
  listingController.createListing
);

// Update listing
listingRouter.put(
  '/:id',
  auth.isSeller,
  upload.uploadListingImages,
  upload.handleUploadError,
  listingController.updateListing
);

// Delete listing
listingRouter.delete('/:id', auth.isSeller, listingController.deleteListing);

// Get merchant's own listings
listingRouter.get('/merchant/listings', auth.isSeller, listingController.getMerchantListings);

// Update listing status
listingRouter.patch('/:id/status', auth.isSeller, listingController.updateListingStatus);

// Feature/unfeature listing (premium)
listingRouter.patch('/:id/feature', auth.isSeller, listingController.featureListing);

module.exports = listingRouter;