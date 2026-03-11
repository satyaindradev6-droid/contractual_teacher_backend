import { Router } from 'express';
import { checkInvitationEligibility, getActiveSchools } from '../controllers/invitationController';

const router = Router();

router.get('/check-eligibility/:kv_id', checkInvitationEligibility);
router.get('/active-schools', getActiveSchools);

export default router;