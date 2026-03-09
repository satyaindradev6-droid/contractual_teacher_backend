import express from 'express';
import {
  createAcademic,
  getAcademicsByApplicationId,
  getAcademicById,
  updateAcademic,
  deleteAcademic
} from '../controllers/academicController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// All routes are protected with authentication
router.post('/', authenticateToken, createAcademic);
router.get('/application/:application_id', authenticateToken, getAcademicsByApplicationId);
router.get('/:id', authenticateToken, getAcademicById);
router.patch('/:id', authenticateToken, updateAcademic);
router.delete('/:id', authenticateToken, deleteAcademic);

export default router;
