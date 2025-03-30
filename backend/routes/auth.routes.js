// File: backend/routes/auth.routes.js
/**
 * Authentication routes
 */
const express = require('express');
const router = express.Router();
const { auth: authController } = require('../controllers');
const { auth, validation } = require('../middleware');

// Register new user
router.post(
  '/register',
  validation.validate(validation.schemas.userRegistration),
  authController.register
);

// Login user
router.post(
  '/login',
  validation.validate(validation.schemas.userLogin),
  authController.login
);

// Refresh token
router.post('/refresh-token', authController.refreshToken);

// Request password reset
router.post('/password-reset/request', authController.requestPasswordReset);

// Reset password with token
router.post('/password-reset/reset', authController.resetPassword);

// Change password (requires authentication)
router.post(
  '/password-change',
  auth.authenticate,
  authController.changePassword
);

module.exports = router;

// File: backend/routes/user.routes.js
/**
 * User routes
 */
const express = require('express');
const router = express.Router();
const { user: userController } = require('../controllers');
const { auth } = require('../middleware');

// All routes require authentication
router.use(auth.authenticate);

// Get current user
router.get('/profile', userController.getCurrentUser);

// Update user profile
router.put('/profile', userController.updateProfile);

// Update user preferences
router.put('/preferences', userController.updatePreferences);

// Update user type
router.put('/type', userController.updateUserType);

// Update subscription
router.put('/subscription', userController.updateSubscription);

module.exports = router;

// File: backend/routes/listing.routes.js
/**
 * Listing routes
 */
const express = require('express');
const router = express.Router();
const { listing: listingController } = require('../controllers');
const { auth, upload, validation } = require('../middleware');

// Routes that don't require authentication
// Get listings (with filtering)
router.get('/', listingController.getListings);

// Get listing by ID
router.get('/:id', listingController.getListingById);

// Routes that require authentication
router.use(auth.authenticate);

// Create new listing
router.post(
  '/',
  auth.isSeller,
  upload.uploadListingImages,
  upload.handleUploadError,
  validation.validate(validation.schemas.listingCreation),
  listingController.createListing
);

// Update listing
router.put(
  '/:id',
  auth.isSeller,
  upload.uploadListingImages,
  upload.handleUploadError,
  listingController.updateListing
);

// Delete listing
router.delete('/:id', auth.isSeller, listingController.deleteListing);

// Get merchant's own listings
router.get('/merchant/listings', auth.isSeller, listingController.getMerchantListings);

// Update listing status
router.patch('/:id/status', auth.isSeller, listingController.updateListingStatus);

// Feature/unfeature listing (premium)
router.patch('/:id/feature', auth.isSeller, listingController.featureListing);

module.exports = router;

// File: backend/routes/discovery.routes.js
/**
 * Discovery routes for swiping interface
 */
const express = require('express');
const router = express.Router();
const { listing: listingController } = require('../controllers');
const { auth } = require('../middleware');

// All routes require authentication
router.use(auth.authenticate);

// Get listings for discovery (swiping)
router.get('/', listingController.getDiscoveryListings);

// Record swipe interaction
router.post('/interaction', listingController.recordSwipeInteraction);

module.exports = router;

// File: backend/routes/offer.routes.js
/**
 * Offer routes
 */
const express = require('express');
const router = express.Router();
const { offer: offerController } = require('../controllers');
const { auth, validation } = require('../middleware');

// All routes require authentication
router.use(auth.authenticate);

// Create new offer
router.post(
  '/',
  validation.validate(validation.schemas.offerCreation),
  offerController.createOffer
);

// Get offer by ID
router.get('/:id', offerController.getOfferById);

// Update offer status (accept/reject)
router.patch('/:id/status', offerController.updateOfferStatus);

// Counter offer
router.post('/:id/counter', offerController.counterOffer);

// Get offers for buyer
router.get('/buyer/offers', offerController.getBuyerOffers);

// Get offers for seller
router.get('/seller/offers', auth.isSeller, offerController.getSellerOffers);

// Get offers for listing
router.get('/listing/:listingId', auth.isSeller, offerController.getListingOffers);

module.exports = router;

// File: backend/routes/message.routes.js
/**
 * Message routes
 */
const express = require('express');
const router = express.Router();
const { message: messageController } = require('../controllers');
const { auth, validation } = require('../middleware');

// All routes require authentication
router.use(auth.authenticate);

// Get or create conversation
router.post('/conversations', messageController.getOrCreateConversation);

// Get user conversations
router.get('/conversations', messageController.getUserConversations);

// Get conversation messages
router.get('/conversations/:id/messages', messageController.getConversationMessages);

// Send message
router.post(
  '/messages',
  validation.validate(validation.schemas.messageCreation),
  messageController.sendMessage
);

// Mark message as read
router.patch('/messages/:id/read', messageController.markMessageAsRead);

// Delete conversation
router.delete('/conversations/:id', messageController.deleteConversation);

module.exports = router;

// File: backend/routes/merchant.routes.js
/**
 * Merchant dashboard routes
 */
const express = require('express');
const router = express.Router();
const { merchant: merchantController } = require('../controllers');
const { auth } = require('../middleware');

// All routes require authentication and seller privileges
router.use(auth.authenticate);
router.use(auth.isSeller);

// Get dashboard summary
router.get('/dashboard', merchantController.getDashboardSummary);

// Get inventory analytics
router.get('/analytics/inventory', merchantController.getInventoryAnalytics);

// Get offer analytics
router.get('/analytics/offers', merchantController.getOfferAnalytics);

module.exports = router;

// File: backend/routes/index.js
/**
 * Main router that combines all route modules
 */
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const listingRoutes = require('./listing.routes');
const discoveryRoutes = require('./discovery.routes');
const offerRoutes = require('./offer.routes');
const messageRoutes = require('./message.routes');
const merchantRoutes = require('./merchant.routes');

// Use route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/listings', listingRoutes);
router.use('/discovery', discoveryRoutes);
router.use('/offers', offerRoutes);
router.use('/messages', messageRoutes);
router.use('/merchant', merchantRoutes);

module.exports = router;