import express from 'express';
import {
  createSchoolPostChoice,
  getSchoolPostChoicesByApplicationId,
  getSchoolPostChoiceById,
  updateSchoolPostChoice,
  deleteSchoolPostChoice
} from '../controllers/schoolPostChoiceController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// All routes are protected with authentication
router.post('/', authenticateToken, createSchoolPostChoice);
router.get('/application/:application_id', authenticateToken, getSchoolPostChoicesByApplicationId);
router.get('/:id', authenticateToken, getSchoolPostChoiceById);
router.patch('/:id', authenticateToken, updateSchoolPostChoice);
router.delete('/:id', authenticateToken, deleteSchoolPostChoice);

export default router;
