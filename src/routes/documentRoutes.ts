import { Router, Request, Response, NextFunction } from 'express';
import { upload, uploadFields } from '../middleware/uploadMiddleware';
import { uploadDocuments, getDocuments, viewDocument } from '../controllers/documentController';
import { authenticateToken } from '../middleware/authMiddleware';
import multer from 'multer';

const router = Router();

// Multer error handling middleware
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: false,
        message: 'File size exceeds limit of 200KB'
      });
    }
    return res.status(400).json({
      status: false,
      message: err.message
    });
  } else if (err) {
    return res.status(400).json({
      status: false,
      message: err.message || 'Invalid file upload'
    });
  }
  next();
};

// Upload documents endpoint (requires authentication)
router.post('/upload-documents', authenticateToken, upload.fields(uploadFields), handleMulterError, uploadDocuments);

// Test endpoint to check if application exists
router.get('/test-application/:application_id', async (req: Request, res: Response) => {
  try {
    const { prisma } = require('../utils/prisma');
    
    const application = await prisma.applications.findUnique({
      where: { application_id: BigInt(req.params.application_id) }
    });
    
    if (application) {
      return res.json({
        status: true,
        message: 'Application exists',
        data: {
          application_id: application.application_id.toString(),
          name: `${application.first_name} ${application.last_name}`,
          email: application.email
        }
      });
    } else {
      return res.json({
        status: false,
        message: 'Application not found'
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
});

// Get all documents metadata for an application (requires authentication)
router.get('/documents/:application_id', authenticateToken, getDocuments);

// View/download a specific document (requires authentication)
router.get('/documents/:application_id/:document_type', authenticateToken, viewDocument);

export default router;
