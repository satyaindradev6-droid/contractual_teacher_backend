import { Router } from 'express';
import { checkInvitationEligibility } from '../controllers/invitationController';

const router = Router();

router.get('/check-eligibility/:kv_id', checkInvitationEligibility);

export default router;