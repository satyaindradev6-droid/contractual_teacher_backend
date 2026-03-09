import { Router } from 'express';
import {
  createApplicationTracker,
  updateApplicationTracker,
  getApplicationTracker
} from '../controllers/applicationTrackerController';

const router = Router();

// Create application tracker
router.post('/', createApplicationTracker);

// Update application tracker by application_id
router.post('/:application_id', updateApplicationTracker);

// Get application tracker by application_id
router.get('/:application_id', getApplicationTracker);

export default router;
