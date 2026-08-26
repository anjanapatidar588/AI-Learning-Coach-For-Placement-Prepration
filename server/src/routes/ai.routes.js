const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/ai.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/chat', authMiddleware, handleChat);

module.exports = router;
