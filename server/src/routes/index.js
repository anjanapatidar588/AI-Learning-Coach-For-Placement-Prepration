const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./auth.routes');

const router = express.Router();

// GET /api/v1/health - Foundation API & Database Health Check
router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    status: 'OK',
    message: 'AI Placement Coach API is online',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// Route aggregation structure for authentication module
router.use('/auth', authRoutes);

module.exports = router;
