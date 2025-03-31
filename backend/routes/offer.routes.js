// File: backend/routes/offer.routes.js
/**
 * Offer routes
 */
const express = require('express');
const offerRouter = express.Router();
const { offer: offerController } = require('../controllers');
const { auth, validation } = require('../middleware');

// All routes require authentication
offerRouter.use(auth.authenticate);

// Create new offer
offerRouter.post(
  '/',
  validation.validate(validation.schemas.offerCreation),
  offerController.createOffer
);

// Get offer by ID
offerRouter.get('/:id', offerController.getOfferById);

// Update offer status (accept/reject)
offerRouter.patch('/:id/status', offerController.updateOfferStatus);

// Counter offer
offerRouter.post('/:id/counter', offerController.counterOffer);

// Get offers for buyer
offerRouter.get('/buyer/offers', offerController.getBuyerOffers);

// Get offers for seller
offerRouter.get('/seller/offers', auth.isSeller, offerController.getSellerOffers);

// Get offers for listing
offerRouter.get('/listing/:listingId', auth.isSeller, offerController.getListingOffers);

module.exports = offerRouter;