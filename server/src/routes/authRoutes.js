import express from 'express';
import { signupUser, loginUser, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Signup Route (and register alias)
router.post('/signup', signupUser);
router.post('/register', signupUser);

// Login Route
router.post('/login', loginUser);

// Profile Route
router.get('/me', protect, getMe);

// Verification-only RBAC Test Routes
router.get('/test/student', protect, authorize('student'), (req, res) => {
  res.json({ success: true, message: 'Student access granted', user: req.user });
});

router.get('/test/admin', protect, authorize('admin'), (req, res) => {
  res.json({ success: true, message: 'Admin access granted', user: req.user });
});

router.get('/test/shared', protect, authorize('student', 'admin'), (req, res) => {
  res.json({ success: true, message: 'Shared access granted', user: req.user });
});

export default router;
