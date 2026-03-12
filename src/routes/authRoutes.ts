import { Router } from 'express';
import { register, login, forgotPassword, getUserProfile, updateUserProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// Protected routes
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);

// Debug endpoint to test token expiration
router.get('/test-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    userId: (req as any).userId,
    timestamp: new Date().toISOString(),
    serverTime: Date.now()
  });
});

export default router;
