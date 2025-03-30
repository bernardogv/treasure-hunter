// File: backend/services/auth.service.js
/**
 * Authentication service
 * Handles user authentication, registration, and password management
 */
const { User } = require('../models');
const { jwt } = require('../config');
const { validation } = require('../utils');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Register a new user
const register = async (userData) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('Email already registered');
  }
  
  // Create new user
  const user = new User(userData);
  await user.save();
  
  // Generate tokens
  const accessToken = jwt.generateAccessToken(user._id);
  const refreshToken = jwt.generateRefreshToken(user._id);
  
  return {
    user,
    accessToken,
    refreshToken
  };
};

// Login user
const login = async (email, password) => {
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }
  
  // Update last login
  user.lastLogin = Date.now();
  await user.save();
  
  // Generate tokens
  const accessToken = jwt.generateAccessToken(user._id);
  const refreshToken = jwt.generateRefreshToken(user._id);
  
  return {
    user,
    accessToken,
    refreshToken
  };
};

// Refresh token
const refreshToken = async (token) => {
  // Verify refresh token
  const decoded = jwt.verifyRefreshToken(token);
  if (!decoded) {
    throw new Error('Invalid refresh token');
  }
  
  // Find user
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Generate new tokens
  const accessToken = jwt.generateAccessToken(user._id);
  const refreshToken = jwt.generateRefreshToken(user._id);
  
  return {
    accessToken,
    refreshToken
  };
};

// Request password reset
const requestPasswordReset = async (email) => {
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Email not found');
  }
  
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and set expiration
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();
  
  return {
    user,
    resetToken
  };
};

// Reset password with token
const resetPassword = async (token, newPassword) => {
  // Hash token to match stored hash
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  // Find user with token and valid expiration
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    throw new Error('Invalid or expired reset token');
  }
  
  // Validate password strength
  if (!validation.isStrongPassword(newPassword)) {
    throw new Error('Password does not meet security requirements');
  }
  
  // Update password and clear reset token
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  
  return { success: true };
};

// Change password
const changePassword = async (userId, currentPassword, newPassword) => {
  // Find user
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }
  
  // Validate password strength
  if (!validation.isStrongPassword(newPassword)) {
    throw new Error('New password does not meet security requirements');
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  return { success: true };
};

module.exports = {
  register,
  login,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  changePassword
};

// File: backend/services/user.service.js
/**
 * User service
 * Handles user profile and preference management
 */
const { User } = require('../models');
const { validation } = require('../utils');

// Get user by ID
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

// Update user profile
const updateProfile = async (userId, profileData) => {
  // Find user
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Validate email if provided
  if (profileData.email && profileData.email !== user.email) {
    // Check if email already exists
    const existingUser = await User.findOne({ email: profileData.email });
    if (existingUser) {
      throw new Error('Email already in use');
    }
    
    // Validate email format
    if (!validation.isValidEmail(profileData.email)) {
      throw new Error('Invalid email format');
    }
  }
  
  // Validate phone if provided
  if (profileData.phone && !validation.isValidPhone(profileData.phone)) {
    throw new Error('Invalid phone format');
  }
  
  // Validate location coordinates if provided
  if (profileData.location && profileData.location.coordinates) {
    if (!validation.isValidCoordinates(profileData.location.coordinates)) {
      throw new Error('Invalid coordinates');
    }
  }
  
  // Update allowed fields
  const allowedFields = ['name', 'email', 'phone', 'location'];
  
  allowedFields.forEach(field => {
    if (profileData[field] !== undefined) {
      user[field] = profileData[field];
    }
  });
  
  await user.save();
  return user;
};

// Update user preferences
const updatePreferences = async (userId, preferences) => {
  // Find user
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Merge preferences
  user.preferences = {
    ...user.preferences,
    ...preferences
  };
  
  await user.save();
  return user;
};

// Update user type (buyer, seller, both)
const updateUserType = async (userId, userType) => {
  // Validate user type
  if (!['buyer', 'seller', 'both'].includes(userType)) {
    throw new Error('Invalid user type');
  }
  
  // Find user
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Update user type
  user.userType = userType;
  await user.save();
  
  return user;
};

// Update subscription status
const updateSubscription = async (userId, subscriptionStatus, expiryDate) => {
  // Validate subscription status
  if (!['free', 'premium'].includes(subscriptionStatus)) {
    throw new Error('Invalid subscription status');
  }
  
  // Find user
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Update subscription
  user.subscriptionStatus = subscriptionStatus;
  
  if (expiryDate) {
    user.subscriptionExpiryDate = expiryDate;
  } else if (subscriptionStatus === 'free') {
    user.subscriptionExpiryDate = null;
  }
  
  await user.save();
  return user;
};

module.exports = {
  getUserById,
  updateProfile,
  updatePreferences,
  updateUserType,
  updateSubscription
};

// File: backend/services/listing.service.js
/**
 * Listing service
 * Handles listing creation, update, deletion and filtering
 */
const { Listing, User } = require('../models');
const { validation, geocoding, image, pagination } = require('../utils');

// Create new listing
const createListing = async (listingData, userId, files) => {
  // Check if user exists and is a seller
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  if (user.userType !== 'seller' && user.userType !== 'both') {
    throw new Error('Only sellers can create listings');
  }
  
  // Validate coordinates
  if (!validation.isValidCoordinates(listingData.location.coordinates)) {
    throw new Error('Invalid coordinates');
  }
  
  // Process images if provided
  let images = [];
  if (files && files.length > 0) {
    const uploadPromises = files.map(file => image.uploadImageToS3(file, userId));
    const uploadResults = await Promise.all(uploadPromises);
    images = uploadResults.map(result => result.url);
  }
  
  // Create listing
  const listing = new Listing({
    ...listingData,
    sellerId: userId,
    images: images.length > 0 ? images : listingData.images
  });
  
  await listing.save();
  return listing;
};

// Get listing by ID
const getListingById = async (listingId) => {
  // Validate listing ID
  if (!validation.isValidObjectId(listingId)) {
    throw new Error('Invalid listing ID');
  }
  
  // Find listing
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new Error('Listing not found');
  }
  
  // Increment view count
  listing.metrics.views += 1;
  await listing.save();
  
  return listing;
};

// Update listing
const updateListing = async (listingId, listingData, userId, files) => {
  // Validate listing ID
  if (!validation.isValidObjectId(listingId)) {
    throw new Error('Invalid listing ID');
  }
  
  // Find listing
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new Error('Listing not found');
  }
  
  // Check if user owns the listing
  if (listing.sellerId.toString() !== userId) {
    throw new Error('You do not have permission to update this listing');
  }
  
  // Process new images if provided
  if (files && files.length > 0) {
    const uploadPromises = files.map(file => image.uploadImageToS3(file, userId));
    const uploadResults = await Promise.all(uploadPromises);
    const newImages = uploadResults.map(result => result.url);
    
    // Update images array
    if (listingData.keepImages && Array.isArray(listingData.keepImages)) {
      // Keep selected existing images and add new ones
      listingData.images = [...listingData.keepImages, ...newImages];
    } else {
      // Replace all images with new ones
      listingData.images = newImages;
    }
  }
  
  // Update allowed fields
  const allowedFields = ['title', 'price', 'description', 'category', 'tags', 'location', 'status', 'images'];
  
  allowedFields.forEach(field => {
    if (listingData[field] !== undefined) {
      listing[field] = listingData[field];
    }
  });
  
  await listing.save();
  return listing;
};

// Delete listing
const deleteListing = async (listingId, userId) => {
  // Validate listing ID
  if (!validation.isValidObjectId(listingId)) {
    throw new Error('Invalid listing ID');
  }
  
  // Find listing
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new Error('Listing not found');
  }
  
  // Check if user owns the listing
  if (listing.sellerId.toString() !== userId) {
    throw new Error('You do not have permission to delete this listing');
  }
  
  // Delete listing
  await listing.deleteOne();
  
  return { success: true };
};

// Get listings with filtering and pagination
const getListings = async (filters, page, limit, coordinates) => {
  // Build query
  const query = {};
  
  // Status filter
  if (filters.status) {
    query.status = filters.status;
  } else {
    // Default to available listings
    query.status = 'available';
  }
  
  // Category filter
  if (filters.category) {
    query.category = filters.category;
  }
  
  // Price range filter
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    
    if (filters.minPrice) {
      query.price.$gte = parseFloat(filters.minPrice);
    }
    
    if (filters.maxPrice) {
      query.price.$lte = parseFloat(filters.maxPrice);
    }
  }
  
  // Tags filter
  if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  
  // Seller filter
  if (filters.sellerId) {
    query.sellerId = filters.sellerId;
  }
  
  // Text search
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  
  // Location filter
  if (coordinates && filters.radius) {
    query.location = geocoding.createNearQuery(coordinates, filters.radius);
  }
  
  // Calculate pagination parameters
  const skip = (page - 1) * limit;
  
  // Get listings
  const listings = await Listing.find(query)
    .sort({ 'createdAt': -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count
  const total = await Listing.countDocuments(query);
  
  return {
    listings,
    pagination: pagination.paginationMeta(page, limit, total)
  };
};

// Get listings for discovery (Tinder-like swiping)
const getDiscoveryListings = async (userId, page, limit) => {
  // Get user for preferences
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Build query based on user preferences
  const query = {
    status: 'available'
  };
  
  // Apply category preferences if set
  if (user.preferences.categories && user.preferences.categories.length > 0) {
    query.category = { $in: user.preferences.categories };
  }
  
  // Apply price range preferences if set
  query.price = {
    $gte: user.preferences.priceRange.min,
    $lte: user.preferences.priceRange.max
  };
  
  // Apply location preferences if set
  if (user.location && user.location.coordinates) {
    query.location = geocoding.createNearQuery(
      user.location.coordinates,
      user.preferences.searchRadius
    );
  }
  
  // Calculate pagination parameters
  const skip = (page - 1) * limit;
  
  // Get listings
  const listings = await Listing.find(query)
    .sort({ featured: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count
  const total = await Listing.countDocuments(query);
  
  return {
    listings,
    pagination: pagination.paginationMeta(page, limit, total)
  };
};

// Get merchant's own listings
const getMerchantListings = async (userId, page, limit, status) => {
  // Build query
  const query = {
    sellerId: userId
  };
  
  if (status) {
    query.status = status;
  }
  
  // Calculate pagination parameters
  const skip = (page - 1) * limit;
  
  // Get listings
  const listings = await Listing.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count
  const total = await Listing.countDocuments(query);
  
  return {
    listings,
    pagination: pagination.paginationMeta(page, limit, total)
  };
};

// Update listing status
const updateListingStatus = async (listingId, status, userId) => {
  // Validate status
  if (!['available', 'pending', 'sold'].includes(status)) {
    throw new Error('Invalid status');
  }
  
  // Validate listing ID
  if (!validation.isValidObjectId(listingId)) {
    throw new Error('Invalid listing ID');
  }
  
  // Find listing
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new Error('Listing not found');
  }
  
  // Check if user owns the listing
  if (listing.sellerId.toString() !== userId) {
    throw new Error('You do not have permission to update this listing');
  }
  
  // Update status
  listing.status = status;
  await listing.save();
  
  return listing;
};

// Feature listing (premium functionality)
const featureListing = async (listingId, featured, userId) => {
  // Validate listing ID
  if (!validation.isValidObjectId(listingId)) {
    throw new Error('Invalid listing ID');
  }
  
  // Find listing
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new Error('Listing not found');
  }
  
  // Check if user owns the listing
  if (listing.sellerId.toString() !== userId) {
    throw new Error('You do not have permission to update this listing');
  }
  
  // Check if user has premium subscription
  const user = await User.findById(userId);
  if (user.subscriptionStatus !== 'premium') {
    throw new Error('Premium subscription required to feature listings');
  }
  
  // Update featured status
  listing.featured = featured;
  await listing.save();
  
  return listing;
};

module.exports = {
  createListing,
  getListingById,
  updateListing,
  deleteListing,
  getListings,
  getDiscoveryListings,
  getMerchantListings,
  updateListingStatus,
  featureListing
};

// File: backend/services/offer.service.js
/**
 * Offer service
 * Handles offers on listings and negotiation functionality
 */
const { Offer, Listing, User } = require('../models');
const { validation } = require('../utils');

// Create new offer
const createOffer = async (listingId, buyerId, offerPrice) => {
  // Validate listing ID
  if (!validation.isValidObjectId(listingId)) {
    throw new Error('Invalid listing ID');
  }
  
  // Find listing
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new Error('Listing not found');
  }
  
  // Check if listing is available
  if (listing.status !== 'available') {
    throw new Error('Listing is not available for offers');
  }
  
  // Check if buyer is not the seller
  if (listing.sellerId.toString() === buyerId) {
    throw new Error('You cannot make an offer on your own listing');
  }
  
  // Check if offer price is valid
  if (offerPrice <= 0) {
    throw new Error('Offer price must be greater than zero');
  }
  
  // Create offer
  const offer = new Offer({
    listingId,
    buyerId,
    sellerId: listing.sellerId,
    originalPrice: listing.price,
    offerPrice,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  });
  
  await offer.save();
  
  // Update listing metrics
  listing.metrics.offers += 1;
  await listing.save();
  
  return offer;
};

// Get offer by ID
const getOfferById = async (offerId, userId) => {
  // Validate offer ID
  if (!validation.isValidObjectId(offerId)) {
    throw new Error('Invalid offer ID');
  }
  
  // Find offer
  const offer = await Offer.findById(offerId);
  if (!offer) {
    throw new Error('Offer not found');
  }
  
  // Check if user is buyer or seller
  if (offer.buyerId.toString() !== userId && offer.sellerId.toString() !== userId) {
    throw new Error('You do not have permission to view this offer');
  }
  
  return offer;
};

// Update offer status
const updateOfferStatus = async (offerId, status, userId) => {
  // Validate status
  if (!['accepted', 'rejected', 'expired'].includes(status)) {
    throw new Error('Invalid status');
  }
  
  // Validate offer ID
  if (!validation.isValidObjectId(offerId)) {
    throw new Error('Invalid offer ID');
  }
  
  // Find offer
  const offer = await Offer.findById(offerId);
  if (!offer) {
    throw new Error('Offer not found');
  }
  
  // Check if user is the seller
  if (offer.sellerId.toString() !== userId) {
    throw new Error('Only the seller can update offer status');
  }
  
  // Check if offer is still pending
  if (offer.status !== 'pending') {
    throw new Error('Offer is no longer pending');
  }
  
  // Update status
  offer.status = status;
  await offer.save();
  
  // Continuing the implementation of backend/services/offer.service.js

  // If offer is accepted, update listing status
  if (status === 'accepted') {
    const listing = await Listing.findById(offer.listingId);
    if (listing) {
      listing.status = 'pending';
      await listing.save();
    }
  }
  
  return offer;
};

// Counter offer
const counterOffer = async (offerId, counterPrice, userId) => {
  // Validate offer ID
  if (!validation.isValidObjectId(offerId)) {
    throw new Error('Invalid offer ID');
  }
  
  // Find offer
  const offer = await Offer.findById(offerId);
  if (!offer) {
    throw new Error('Offer not found');
  }
  
  // Check if user is buyer or seller
  const isBuyer = offer.buyerId.toString() === userId;
  const isSeller = offer.sellerId.toString() === userId;
  
  if (!isBuyer && !isSeller) {
    throw new Error('You do not have permission to counter this offer');
  }
  
  // Check if offer is still pending
  if (offer.status !== 'pending') {
    throw new Error('Offer is no longer pending');
  }
  
  // Check if counter price is valid
  if (counterPrice <= 0) {
    throw new Error('Counter price must be greater than zero');
  }
  
  // Add counter offer
  offer.counterOffers.push({
    price: counterPrice,
    userId
  });
  
  // Update status to countered
  offer.status = 'countered';
  
  // Extend expiration date
  offer.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  
  await offer.save();
  return offer;
};

// Get offers for buyer
const getBuyerOffers = async (buyerId, status) => {
  // Build query
  const query = {
    buyerId
  };
  
  if (status) {
    query.status = status;
  }
  
  // Get offers
  const offers = await Offer.find(query)
    .sort({ createdAt: -1 })
    .populate('listingId', 'title price images status');
  
  return offers;
};

// Get offers for seller
const getSellerOffers = async (sellerId, status) => {
  // Build query
  const query = {
    sellerId
  };
  
  if (status) {
    query.status = status;
  }
  
  // Get offers
  const offers = await Offer.find(query)
    .sort({ createdAt: -1 })
    .populate('listingId', 'title price images status')
    .populate('buyerId', 'name');
  
  return offers;
};

// Get offers for listing
const getListingOffers = async (listingId, userId) => {
  // Validate listing ID
  if (!validation.isValidObjectId(listingId)) {
    throw new Error('Invalid listing ID');
  }
  
  // Find listing
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new Error('Listing not found');
  }
  
  // Check if user is seller
  if (listing.sellerId.toString() !== userId) {
    throw new Error('You do not have permission to view offers for this listing');
  }
  
  // Get offers
  const offers = await Offer.find({ listingId })
    .sort({ createdAt: -1 })
    .populate('buyerId', 'name');
  
  return offers;
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

// File: backend/services/message.service.js
/**
 * Message service
 * Handles conversations and messages between users
 */
const { Message, Conversation, Listing } = require('../models');
const { validation } = require('../utils');
const { ObjectId } = require('mongoose').Types;

// Create or get conversation
const getOrCreateConversation = async (buyerId, sellerId, listingId) => {
  // Validate IDs
  if (!validation.isValidObjectId(buyerId) || !validation.isValidObjectId(sellerId) || !validation.isValidObjectId(listingId)) {
    throw new Error('Invalid IDs provided');
  }
  
  // Find existing conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [buyerId, sellerId] },
    listingId
  });
  
  // Create new conversation if not found
  if (!conversation) {
    conversation = new Conversation({
      participants: [buyerId, sellerId],
      listingId,
      lastMessageAt: new Date(),
      unreadCounts: new Map([[buyerId.toString(), 0], [sellerId.toString(), 0]])
    });
    
    await conversation.save();
  }
  
  return conversation;
};

// Send message
const sendMessage = async (conversationId, senderId, receiverId, content) => {
  // Validate conversation ID
  if (!validation.isValidObjectId(conversationId)) {
    throw new Error('Invalid conversation ID');
  }
  
  // Find conversation
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new Error('Conversation not found');
  }
  
  // Check if sender is a participant
  if (!conversation.participants.includes(senderId)) {
    throw new Error('You are not a participant in this conversation');
  }
  
  // Check if receiver is a participant
  if (!conversation.participants.includes(receiverId)) {
    throw new Error('Receiver is not a participant in this conversation');
  }
  
  // Create message
  const message = new Message({
    conversationId,
    senderId,
    receiverId,
    content
  });
  
  await message.save();
  
  // Update conversation
  conversation.lastMessageAt = new Date();
  
  // Increment unread count for receiver
  const receiverUnreadCount = conversation.unreadCounts.get(receiverId.toString()) || 0;
  conversation.unreadCounts.set(receiverId.toString(), receiverUnreadCount + 1);
  
  await conversation.save();
  
  return message;
};

// Get conversation messages
const getConversationMessages = async (conversationId, userId, page = 1, limit = 20) => {
  // Validate conversation ID
  if (!validation.isValidObjectId(conversationId)) {
    throw new Error('Invalid conversation ID');
  }
  
  // Find conversation
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new Error('Conversation not found');
  }
  
  // Check if user is a participant
  if (!conversation.participants.includes(userId)) {
    throw new Error('You are not a participant in this conversation');
  }
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Get messages
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count
  const total = await Message.countDocuments({ conversationId });
  
  // Mark messages as read
  await Message.updateMany(
    {
      conversationId,
      receiverId: userId,
      read: false
    },
    {
      $set: { read: true }
    }
  );
  
  // Reset unread count for user
  conversation.unreadCounts.set(userId.toString(), 0);
  await conversation.save();
  
  return {
    messages: messages.reverse(), // Return in ascending order
    pagination: {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit
    }
  };
};

// Get user conversations
const getUserConversations = async (userId) => {
  // Find conversations
  const conversations = await Conversation.find({
    participants: userId
  })
    .sort({ lastMessageAt: -1 })
    .populate('listingId', 'title images')
    .populate('participants', 'name');
  
  // Add last message to each conversation
  const conversationsWithLastMessage = await Promise.all(
    conversations.map(async (conversation) => {
      const lastMessage = await Message.findOne({ conversationId: conversation._id })
        .sort({ createdAt: -1 })
        .limit(1);
      
      // Get other participant
      const otherParticipant = conversation.participants.find(
        p => p._id.toString() !== userId
      );
      
      return {
        _id: conversation._id,
        listing: conversation.listingId,
        otherParticipant,
        lastMessage: lastMessage || null,
        unreadCount: conversation.unreadCounts.get(userId.toString()) || 0,
        lastMessageAt: conversation.lastMessageAt
      };
    })
  );
  
  return conversationsWithLastMessage;
};

// Mark message as read
const markMessageAsRead = async (messageId, userId) => {
  // Validate message ID
  if (!validation.isValidObjectId(messageId)) {
    throw new Error('Invalid message ID');
  }
  
  // Find message
  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error('Message not found');
  }
  
  // Check if user is receiver
  if (message.receiverId.toString() !== userId) {
    throw new Error('You can only mark your own messages as read');
  }
  
  // Mark as read
  message.read = true;
  await message.save();
  
  // Update conversation unread count
  const conversation = await Conversation.findById(message.conversationId);
  if (conversation) {
    // Get current unread count
    const unreadCount = conversation.unreadCounts.get(userId.toString()) || 0;
    
    // Update if greater than 0
    if (unreadCount > 0) {
      conversation.unreadCounts.set(userId.toString(), unreadCount - 1);
      await conversation.save();
    }
  }
  
  return message;
};

// Delete conversation
const deleteConversation = async (conversationId, userId) => {
  // Validate conversation ID
  if (!validation.isValidObjectId(conversationId)) {
    throw new Error('Invalid conversation ID');
  }
  
  // Find conversation
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new Error('Conversation not found');
  }
  
  // Check if user is a participant
  if (!conversation.participants.includes(userId)) {
    throw new Error('You are not a participant in this conversation');
  }
  
  // Delete conversation and messages
  await Message.deleteMany({ conversationId });
  await conversation.deleteOne();
  
  return { success: true };
};

module.exports = {
  getOrCreateConversation,
  sendMessage,
  getConversationMessages,
  getUserConversations,
  markMessageAsRead,
  deleteConversation
};

// File: backend/services/merchant.service.js
/**
 * Merchant service
 * Handles merchant-specific functionality and analytics
 */
const { Listing, Offer, User } = require('../models');
const { validation } = require('../utils');

// Get merchant dashboard summary
const getDashboardSummary = async (userId) => {
  // Check if user is a seller
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  if (user.userType !== 'seller' && user.userType !== 'both') {
    throw new Error('Only sellers can access merchant dashboard');
  }
  
  // Get total listings count
  const totalListings = await Listing.countDocuments({ sellerId: userId });
  
  // Get active listings count
  const activeListings = await Listing.countDocuments({
    sellerId: userId,
    status: 'available'
  });
  
  // Get pending listings count
  const pendingListings = await Listing.countDocuments({
    sellerId: userId,
    status: 'pending'
  });
  
  // Get sold listings count
  const soldListings = await Listing.countDocuments({
    sellerId: userId,
    status: 'sold'
  });
  
  // Get total offers count
  const totalOffers = await Offer.countDocuments({ sellerId: userId });
  
  // Get pending offers count
  const pendingOffers = await Offer.countDocuments({
    sellerId: userId,
    status: 'pending'
  });
  
  // Get total views
  const viewsResult = await Listing.aggregate([
    { $match: { sellerId: new ObjectId(userId) } },
    { $group: { _id: null, totalViews: { $sum: '$metrics.views' } } }
  ]);
  
  const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;
  
  // Get recent listings (last 5)
  const recentListings = await Listing.find({ sellerId: userId })
    .sort({ createdAt: -1 })
    .limit(5);
  
  // Get recent offers (last 5)
  const recentOffers = await Offer.find({ sellerId: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('listingId', 'title price images')
    .populate('buyerId', 'name');
  
  return {
    counts: {
      totalListings,
      activeListings,
      pendingListings,
      soldListings,
      totalOffers,
      pendingOffers,
      totalViews
    },
    recent: {
      listings: recentListings,
      offers: recentOffers
    }
  };
};

// Get merchant inventory analytics
const getInventoryAnalytics = async (userId, timeframe = 'all') => {
  // Check if user is a seller
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  if (user.userType !== 'seller' && user.userType !== 'both') {
    throw new Error('Only sellers can access merchant analytics');
  }
  
  // Build date filter based on timeframe
  const dateFilter = {};
  const now = new Date();
  
  if (timeframe === 'week') {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    dateFilter.createdAt = { $gte: weekAgo };
  } else if (timeframe === 'month') {
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    dateFilter.createdAt = { $gte: monthAgo };
  } else if (timeframe === 'year') {
    const yearAgo = new Date(now);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    dateFilter.createdAt = { $gte: yearAgo };
  }
  
  // Get category breakdown
  const categoryBreakdown = await Listing.aggregate([
    {
      $match: {
        sellerId: new ObjectId(userId),
        ...dateFilter
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        views: { $sum: '$metrics.views' },
        offers: { $sum: '$metrics.offers' },
        totalPrice: { $sum: '$price' }
      }
    },
    {
      $project: {
        category: '$_id',
        count: 1,
        views: 1,
        offers: 1,
        averagePrice: { $divide: ['$totalPrice', '$count'] },
        _id: 0
      }
    }
  ]);
  
  // Get status breakdown
  const statusBreakdown = await Listing.aggregate([
    {
      $match: {
        sellerId: new ObjectId(userId),
        ...dateFilter
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        views: { $sum: '$metrics.views' },
        offers: { $sum: '$metrics.offers' }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        views: 1,
        offers: 1,
        _id: 0
      }
    }
  ]);
  
  // Get most viewed listings
  const mostViewedListings = await Listing.find({
    sellerId: userId,
    ...dateFilter
  })
    .sort({ 'metrics.views': -1 })
    .limit(5);
  
  // Get most offered listings
  const mostOfferedListings = await Listing.find({
    sellerId: userId,
    ...dateFilter
  })
    .sort({ 'metrics.offers': -1 })
    .limit(5);
  
  return {
    categoryBreakdown,
    statusBreakdown,
    mostViewedListings,
    mostOfferedListings
  };
};

// Get offer analytics
const getOfferAnalytics = async (userId, timeframe = 'all') => {
  // Check if user is a seller
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  if (user.userType !== 'seller' && user.userType !== 'both') {
    throw new Error('Only sellers can access merchant analytics');
  }
  
  // Build date filter based on timeframe
  const dateFilter = {};
  const now = new Date();
  
  if (timeframe === 'week') {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    dateFilter.createdAt = { $gte: weekAgo };
  } else if (timeframe === 'month') {
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    dateFilter.createdAt = { $gte: monthAgo };
  } else if (timeframe === 'year') {
    const yearAgo = new Date(now);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    dateFilter.createdAt = { $gte: yearAgo };
  }
  
  // Get offer status breakdown
  const offerStatusBreakdown = await Offer.aggregate([
    {
      $match: {
        sellerId: new ObjectId(userId),
        ...dateFilter
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        averageOffer: { $avg: '$offerPrice' },
        totalOffers: { $sum: 1 }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        averageOffer: 1,
        percentage: { $multiply: [{ $divide: ['$count', '$totalOffers'] }, 100] },
        _id: 0
      }
    }
  ]);
  
  // Get average offer percentage
  const offerPercentages = await Offer.aggregate([
    {
      $match: {
        sellerId: new ObjectId(userId),
        ...dateFilter
      }
    },
    {
      $project: {
        percentOfOriginal: { $multiply: [{ $divide: ['$offerPrice', '$originalPrice'] }, 100] }
      }
    },
    {
      $group: {
        _id: null,
        averagePercentage: { $avg: '$percentOfOriginal' },
        minPercentage: { $min: '$percentOfOriginal' },
        maxPercentage: { $max: '$percentOfOriginal' }
      }
    }
  ]);
  
  const averageOfferData = offerPercentages.length > 0 ? {
    averagePercentage: offerPercentages[0].averagePercentage,
    minPercentage: offerPercentages[0].minPercentage,
    maxPercentage: offerPercentages[0].maxPercentage
  } : {
    averagePercentage: 0,
    minPercentage: 0,
    maxPercentage: 0
  };
  
  // Get negotiation efficiency (counter offers to accepted ratio)
  const negotiationData = await Offer.aggregate([
    {
      $match: {
        sellerId: new ObjectId(userId),
        ...dateFilter
      }
    },
    {
      $group: {
        _id: null,
        totalOffers: { $sum: 1 },
        offersWithCounters: { $sum: { $cond: [{ $gt: [{ $size: '$counterOffers' }, 0] }, 1, 0] } },
        acceptedOffers: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } }
      }
    },
    {
      $project: {
        _id: 0,
        totalOffers: 1,
        offersWithCounters: 1,
        acceptedOffers: 1,
        counterToAcceptedRatio: {
          $cond: [
            { $eq: ['$acceptedOffers', 0] },
            0,
            { $divide: ['$offersWithCounters', '$acceptedOffers'] }
          ]
        }
      }
    }
  ]);
  
  const negotiationEfficiency = negotiationData.length > 0 ? negotiationData[0] : {
    totalOffers: 0,
    offersWithCounters: 0,
    acceptedOffers: 0,
    counterToAcceptedRatio: 0
  };
  
  return {
    offerStatusBreakdown,
    averageOfferData,
    negotiationEfficiency
  };
};

module.exports = {
  getDashboardSummary,
  getInventoryAnalytics,
  getOfferAnalytics
};

// File: backend/services/index.js
/**
 * Export all services from a single file
 */
module.exports = {
  auth: require('./auth.service'),
  user: require('./user.service'),
  listing: require('./listing.service'),
  offer: require('./offer.service'),
  message: require('./message.service'),
  merchant: require('./merchant.service')
};