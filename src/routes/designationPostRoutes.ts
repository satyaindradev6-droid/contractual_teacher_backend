import { Router } from 'express';
import { 
  getDesignationsByKV, 
  getSubjectsByKV,
  getDesignationById,
  getSubjectById,
  getKVPostData,
  getSubjectsByDesignation
} from '../controllers/designationPostController';

const router = Router();

router.get('/kv-post-data/:kv_id', getKVPostData);
router.get('/designations/:kv_id', getDesignationsByKV);
router.get('/subjects/:kv_id/:designation_id', getSubjectsByDesignation);
router.get('/designation/:id', getDesignationById);
router.get('/subject/:id', getSubjectById);

export default router;
