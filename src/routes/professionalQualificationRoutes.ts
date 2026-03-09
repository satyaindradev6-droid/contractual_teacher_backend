import express from 'express';
import {
  createProfessionalQualification,
  getProfessionalQualificationsByApplicationId,
  getProfessionalQualificationById,
  updateProfessionalQualification,
  deleteProfessionalQualification
} from '../controllers/professionalQualificationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// All routes are protected with authentication
router.post('/', authenticateToken, createProfessionalQualification);
router.get('/application/:application_id', authenticateToken, getProfessionalQualificationsByApplicationId);
router.get('/:id', authenticateToken, getProfessionalQualificationById);
router.patch('/:id', authenticateToken, updateProfessionalQualification);
router.delete('/:id', authenticateToken, deleteProfessionalQualification);

export default router;
