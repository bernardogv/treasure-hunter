// File: backend/models/user.model.js
/**
 * User model for authentication and profile information
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: {
      type: String,
      trim: true
    }
  },
  userType: {
    type: String,
    enum: ['buyer', 'seller', 'both'],
    default: 'buyer'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  subscriptionStatus: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  subscriptionExpiryDate: {
    type: Date
  },
  preferences: {
    categories: [String],
    priceRange: {
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 10000
      }
    },
    searchRadius: {
      type: Number,
      default: 50 // miles
    }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date
}, {
  timestamps: true
});

// Create geospatial index on location
userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

// File: backend/models/listing.model.js
/**
 * Listing model for antique items
 */
const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: {
    type: [String], // Array of image URLs
    required: true,
    validate: {
      validator: function(v) {
        return v.length > 0; // At least one image required
      },
      message: 'At least one image is required'
    }
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  tags: {
    type: [String],
    index: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'sold'],
    default: 'available'
  },
  featured: {
    type: Boolean,
    default: false
  },
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    offers: {
      type: Number,
      default: 0
    },
    saves: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Create geospatial index on location
listingSchema.index({ location: '2dsphere' });

// Create text index on title and description for search
listingSchema.index({ title: 'text', description: 'text' });

// Create compound index on status and sellerId
listingSchema.index({ status: 1, sellerId: 1 });

// Create index on category
listingSchema.index({ category: 1 });

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;

// File: backend/models/offer.model.js
/**
 * Offer model for item negotiation
 */
const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  offerPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired', 'countered'],
    default: 'pending'
  },
  counterOffers: [{
    price: {
      type: Number,
      required: true,
      min: 0
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Create compound indices
offerSchema.index({ listingId: 1, buyerId: 1 });
offerSchema.index({ sellerId: 1, status: 1 });
offerSchema.index({ buyerId: 1, status: 1 });
offerSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-expiration

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;

// File: backend/models/message.model.js
/**
 * Message model for in-app messaging
 */
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indices
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, read: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;

// File: backend/models/conversation.model.js
/**
 * Conversation model to group messages between users
 */
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 2; // Exactly 2 participants required
      },
      message: 'A conversation must have exactly 2 participants'
    }
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  },
  unreadCounts: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, {
  timestamps: true
});

// Create indices
conversationSchema.index({ participants: 1 });
conversationSchema.index({ listingId: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// Create compound index to find conversations between two users about a listing
conversationSchema.index({ participants: 1, listingId: 1 }, { unique: true });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;

// File: backend/models/index.js
/**
 * Export all models from a single file
 */
module.exports = {
  User: require('./user.model'),
  Listing: require('./listing.model'),
  Offer: require('./offer.model'),
  Message: require('./message.model'),
  Conversation: require('./conversation.model')
};