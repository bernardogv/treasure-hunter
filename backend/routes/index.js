// File: backend/routes/index.js
/**
 * Main router that combines all route modules
 */
const express = require('express');
const mainRouter = express.Router();

// Import route modules
const authRouter = require('./auth.routes');
const userRouter = require('./user.routes');
const listingRouter = require('./listing.routes');
const discoveryRouter = require('./discovery.routes');
const offerRouter = require('./offer.routes');
const messageRouter = require('./message.routes');
const merchantRouter = require('./merchant.routes');

// Use route modules
mainRouter.use('/auth', authRouter);
mainRouter.use('/users', userRouter);
mainRouter.use('/listings', listingRouter);
mainRouter.use('/discovery', discoveryRouter);
mainRouter.use('/offers', offerRouter);
mainRouter.use('/messages', messageRouter);
mainRouter.use('/merchant', merchantRouter);

module.exports = mainRouter;