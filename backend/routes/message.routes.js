// File: backend/routes/message.routes.js
/**
 * Message routes
 */
const express = require('express');
const messageRouter = express.Router();
const { message: messageController } = require('../controllers');
const { auth, validation } = require('../middleware');

// All routes require authentication
messageRouter.use(auth.authenticate);

// Get or create conversation
messageRouter.post('/conversations', messageController.getOrCreateConversation);

// Get user conversations
messageRouter.get('/conversations', messageController.getUserConversations);

// Get conversation messages
messageRouter.get('/conversations/:id/messages', messageController.getConversationMessages);

// Send message
messageRouter.post(
  '/messages',
  validation.validate(validation.schemas.messageCreation),
  messageController.sendMessage
);

// Mark message as read
messageRouter.patch('/messages/:id/read', messageController.markMessageAsRead);

// Delete conversation
messageRouter.delete('/conversations/:id', messageController.deleteConversation);

module.exports = messageRouter;