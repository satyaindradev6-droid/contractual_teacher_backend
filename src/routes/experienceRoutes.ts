import express from 'express';
import {
  createExperience,
  getExperiencesByApplicationId,
  getExperienceById,
  updateExperience,
  deleteExperience
} from '../controllers/experienceController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// All routes are protected with authentication
router.post('/', authenticateToken, createExperience);
router.get('/application/:application_id', authenticateToken, getExperiencesByApplicationId);
router.get('/:id', authenticateToken, getExperienceById);
router.patch('/:id', authenticateToken, updateExperience);
router.delete('/:id', authenticateToken, deleteExperience);

export default router;
