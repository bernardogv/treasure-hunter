// File: backend/controllers/auth.controller.js
/**
 * Authentication controller
 * Handles routes for user authentication
 */
const { auth: authService } = require('../services');
const { response } = require('../utils');

// Register new user
const register = async (req, res, next) => {
  try {
    const userData = req.body;
    const result = await authService.register(userData);
    
    return response.success(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    
    return response.success(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

// Refresh token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    
    return response.success(
      res,
      result,
      'Token refreshed successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Request password reset
const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);
    
    // In a real application, you would send an email with the reset token
    // For development, we return the token directly
    return response.success(
      res,
      {
        message: 'Password reset email sent',
        // Only include token in development
        resetToken: process.env.NODE_ENV === 'development' ? result.resetToken : undefined
      },
      'Password reset requested successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Reset password with token
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    
    return response.success(
      res,
      null,
      'Password reset successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Change password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user._id, currentPassword, newPassword);
    
    return response.success(
      res,
      null,
      'Password changed successfully'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  changePassword
};

// File: backend/controllers/user.controller.js
/**
 * User controller
 * Handles routes for user profile and preferences
 */
const { user: userService } = require('../services');
const { response } = require('../utils');

// Get current user
const getCurrentUser = async (req, res, next) => {
  try {
    return response.success(
      res,
      req.user,
      'User retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const profileData = req.body;
    const user = await userService.updateProfile(req.user._id, profileData);
    
    return response.success(
      res,
      user,
      'Profile updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Update user preferences
const updatePreferences = async (req, res, next) => {
  try {
    const preferences = req.body;
    const user = await userService.updatePreferences(req.user._id, preferences);
    
    return response.success(
      res,
      user.preferences,
      'Preferences updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Update user type
const updateUserType = async (req, res, next) => {
  try {
    const { userType } = req.body;
    const user = await userService.updateUserType(req.user._id, userType);
    
    return response.success(
      res,
      { userType: user.userType },
      'User type updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Update subscription status
const updateSubscription = async (req, res, next) => {
  try {
    const { subscriptionStatus, expiryDate } = req.body;
    const user = await userService.updateSubscription(req.user._id, subscriptionStatus, expiryDate);
    
    return response.success(
      res,
      {
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiryDate: user.subscriptionExpiryDate
      },
      'Subscription updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentUser,
  updateProfile,
  updatePreferences,
  updateUserType,
  updateSubscription
};

// File: backend/controllers/listing.controller.js
/**
 * Listing controller
 * Handles routes for listing management
 */
const { listing: listingService } = require('../services');
const { response, pagination } = require('../utils');

// Create new listing
const createListing = async (req, res, next) => {
  try {
    const listingData = req.body;
    const files = req.files;
    const listing = await listingService.createListing(listingData, req.user._id, files);
    
    return response.success(
      res,
      listing,
      'Listing created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

// Get listing by ID
const getListingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await listingService.getListingById(id);
    
    return response.success(
      res,
      listing,
      'Listing retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Update listing
const updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listingData = req.body;
    const files = req.files;
    const listing = await listingService.updateListing(id, listingData, req.user._id, files);
    
    return response.success(
      res,
      listing,
      'Listing updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Delete listing
const deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    await listingService.deleteListing(id, req.user._id);
    
    return response.success(
      res,
      null,
      'Listing deleted successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Continuing the implementation of backend/controllers/listing.controller.js

// Get listings with filtering
const getListings = async (req, res, next) => {
  try {
    // Extract filters from query params
    const filters = {
      status: req.query.status,
      category: req.query.category,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      tags: req.query.tags ? req.query.tags.split(',') : null,
      sellerId: req.query.sellerId,
      search: req.query.search,
      radius: req.query.radius
    };
    
    // Extract pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // Extract coordinates if provided
    const coordinates = req.query.lat && req.query.lng
      ? [parseFloat(req.query.lng), parseFloat(req.query.lat)]
      : null;
    
    const result = await listingService.getListings(filters, page, limit, coordinates);
    
    return response.success(
      res,
      result.listings,
      'Listings retrieved successfully',
      200,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

// Get listings for discovery (swiping)
const getDiscoveryListings = async (req, res, next) => {
  try {
    // Extract pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await listingService.getDiscoveryListings(req.user._id, page, limit);
    
    return response.success(
      res,
      result.listings,
      'Discovery listings retrieved successfully',
      200,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

// Record swipe interaction
const recordSwipeInteraction = async (req, res, next) => {
  try {
    const { listingId, direction } = req.body;
    
    // Here you could implement additional logic to record swipe interactions
    // For example, saving to a user's history, updating recommendations, etc.
    
    return response.success(
      res,
      { listingId, direction },
      'Interaction recorded successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Get merchant's own listings
const getMerchantListings = async (req, res, next) => {
  try {
    // Extract pagination and filter params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    
    const result = await listingService.getMerchantListings(req.user._id, page, limit, status);
    
    return response.success(
      res,
      result.listings,
      'Merchant listings retrieved successfully',
      200,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

// Update listing status
const updateListingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const listing = await listingService.updateListingStatus(id, status, req.user._id);
    
    return response.success(
      res,
      listing,
      'Listing status updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Feature/unfeature listing (premium)
const featureListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;
    
    const listing = await listingService.featureListing(id, featured, req.user._id);
    
    return response.success(
      res,
      listing,
      `Listing ${featured ? 'featured' : 'unfeatured'} successfully`
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createListing,
  getListingById,
  updateListing,
  deleteListing,
  getListings,
  getDiscoveryListings,
  recordSwipeInteraction,
  getMerchantListings,
  updateListingStatus,
  featureListing
};

// File: backend/controllers/offer.controller.js
/**
 * Offer controller
 * Handles routes for offers and negotiation
 */
const { offer: offerService } = require('../services');
const { response } = require('../utils');

// Create new offer
const createOffer = async (req, res, next) => {
  try {
    const { listingId, offerPrice } = req.body;
    const offer = await offerService.createOffer(listingId, req.user._id, offerPrice);
    
    return response.success(
      res,
      offer,
      'Offer created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

// Get offer by ID
const getOfferById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const offer = await offerService.getOfferById(id, req.user._id);
    
    return response.success(
      res,
      offer,
      'Offer retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Update offer status (accept/reject)
const updateOfferStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const offer = await offerService.updateOfferStatus(id, status, req.user._id);
    
    return response.success(
      res,
      offer,
      `Offer ${status} successfully`
    );
  } catch (error) {
    next(error);
  }
};

// Counter offer
const counterOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { counterPrice } = req.body;
    
    const offer = await offerService.counterOffer(id, counterPrice, req.user._id);
    
    return response.success(
      res,
      offer,
      'Counter offer submitted successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Get offers for buyer
const getBuyerOffers = async (req, res, next) => {
  try {
    const status = req.query.status;
    const offers = await offerService.getBuyerOffers(req.user._id, status);
    
    return response.success(
      res,
      offers,
      'Buyer offers retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Get offers for seller
const getSellerOffers = async (req, res, next) => {
  try {
    const status = req.query.status;
    const offers = await offerService.getSellerOffers(req.user._id, status);
    
    return response.success(
      res,
      offers,
      'Seller offers retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Get offers for listing
const getListingOffers = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const offers = await offerService.getListingOffers(listingId, req.user._id);
    
    return response.success(
      res,
      offers,
      'Listing offers retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOffer,
  getOfferById,
  updateOfferStatus,
  counterOffer,
  getBuyerOffers,
  getSellerOffers,
  getListingOffers
};

// File: backend/controllers/message.controller.js
/**
 * Message controller
 * Handles routes for conversations and messages
 */
const { message: messageService } = require('../services');
const { response } = require('../utils');

// Send message
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, receiverId, content } = req.body;
    
    const message = await messageService.sendMessage(
      conversationId,
      req.user._id,
      receiverId,
      content
    );
    
    return response.success(
      res,
      message,
      'Message sent successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

// Get or create conversation
const getOrCreateConversation = async (req, res, next) => {
  try {
    const { receiverId, listingId } = req.body;
    
    const conversation = await messageService.getOrCreateConversation(
      req.user._id,
      receiverId,
      listingId
    );
    
    return response.success(
      res,
      conversation,
      'Conversation retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Get conversation messages
const getConversationMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await messageService.getConversationMessages(
      id,
      req.user._id,
      page,
      limit
    );
    
    return response.success(
      res,
      result.messages,
      'Messages retrieved successfully',
      200,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

// Get user conversations
const getUserConversations = async (req, res, next) => {
  try {
    const conversations = await messageService.getUserConversations(req.user._id);
    
    return response.success(
      res,
      conversations,
      'Conversations retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Mark message as read
const markMessageAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const message = await messageService.markMessageAsRead(id, req.user._id);
    
    return response.success(
      res,
      message,
      'Message marked as read'
    );
  } catch (error) {
    next(error);
  }
};

// Delete conversation
const deleteConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await messageService.deleteConversation(id, req.user._id);
    
    return response.success(
      res,
      null,
      'Conversation deleted successfully'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getOrCreateConversation,
  getConversationMessages,
  getUserConversations,
  markMessageAsRead,
  deleteConversation
};

// File: backend/controllers/merchant.controller.js
/**
 * Merchant controller
 * Handles routes for merchant dashboard and analytics
 */
const { merchant: merchantService } = require('../services');
const { response } = require('../utils');

// Get dashboard summary
const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await merchantService.getDashboardSummary(req.user._id);
    
    return response.success(
      res,
      summary,
      'Dashboard summary retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Get inventory analytics
const getInventoryAnalytics = async (req, res, next) => {
  try {
    const timeframe = req.query.timeframe || 'all';
    
    const analytics = await merchantService.getInventoryAnalytics(req.user._id, timeframe);
    
    return response.success(
      res,
      analytics,
      'Inventory analytics retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Get offer analytics
const getOfferAnalytics = async (req, res, next) => {
  try {
    const timeframe = req.query.timeframe || 'all';
    
    const analytics = await merchantService.getOfferAnalytics(req.user._id, timeframe);
    
    return response.success(
      res,
      analytics,
      'Offer analytics retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getInventoryAnalytics,
  getOfferAnalytics
};

// File: backend/controllers/index.js
/**
 * Export all controllers from a single file
 */
module.exports = {
  auth: require('./auth.controller'),
  user: require('./user.controller'),
  listing: require('./listing.controller'),
  offer: require('./offer.controller'),
  message: require('./message.controller'),
  merchant: require('./merchant.controller')
};