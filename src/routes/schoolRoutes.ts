import express from 'express';
import { getSchoolsByState, getSchoolById } from '../controllers/schoolController';

const router = express.Router();

router.post('/by-state', getSchoolsByState);
router.get('/:school_id', getSchoolById);

export default router;
