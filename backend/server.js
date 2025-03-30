// File: backend/server.js
/**
 * Main server file
 * Entry point for the backend application
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const routes = require('./routes');
const { error } = require('./middleware');
const { db, env } = require('./config');

// Create Express app
const app = express();

// Connect to MongoDB
db();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(error);

// Start server
const PORT = env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process on unhandled rejection
  server.close(() => process.exit(1));
});

module.exports = server; // Export for testing

// File: backend/package.json
{
  "name": "treasure-hunter-backend",
  "version": "1.0.0",
  "description": "Backend API for Treasure Hunter app",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "aws-sdk": "^2.1450.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "helmet": "^7.0.0",
    "joi": "^17.9.2",
    "jsonwebtoken": "^9.0.1",
    "mongoose": "^7.4.3",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "jest": "^29.6.2",
    "nodemon": "^3.0.1",
    "supertest": "^6.3.3"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}

// File: backend/.env.example
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/treasure-hunter

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production
JWT_REFRESH_EXPIRATION=30d

# AWS S3 Configuration for Image Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=treasure-hunter-images

# Email Configuration for Password Reset
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password

# API Configuration
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Limits and Constraints
MAX_IMAGE_SIZE=5242880
MAX_IMAGES_PER_LISTING=10
DEFAULT_PAGE_SIZE=20

# Feature Flags
ENABLE_PUSH_NOTIFICATIONS=false
ENABLE_EMAIL_NOTIFICATIONS=false

// File: backend/.gitignore
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment variables
.env

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/

# Production build
dist/
build/

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local
.vscode/

# Uploaded files (if stored locally)
uploads/