import { Router } from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protected routes
router.get('/profile', authenticateToken, getUserProfile);
router.patch('/profile', authenticateToken, updateUserProfile);

export default router;
