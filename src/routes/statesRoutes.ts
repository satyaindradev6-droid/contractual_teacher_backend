import express from 'express';
import { getStates, getStateById } from '../controllers/statesController';

const router = express.Router();

router.get('/', getStates);
router.get('/:state_id', getStateById);

export default router;
