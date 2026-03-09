import { Router } from 'express';
import { submitApplication, getSubmission } from '../controllers/submitApplicationController';

const router = Router();

// Submit application
router.post('/', submitApplication);

// Get submission by application_id
router.get('/:application_id', getSubmission);

export default router;
