import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { getUploadPaths } from '../utils/helper';

// Define allowed fields
const allowedFields = [
  'photo',
  'pan_card',
  'aadhar_card',
  'all_document'
];

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    try {
      console.log('=== DESTINATION CALLBACK ===');
      console.log('Request body:', req.body);
      console.log('File:', file.fieldname, file.originalname);
      
      const { application_id } = req.body;

      if (!application_id) {
        console.error('ERROR: application_id is missing');
        return cb(new Error('application_id is required'), '');
      }

      console.log('Application ID:', application_id);

      // Get upload paths using helper
      const { filesystemPath } = getUploadPaths(application_id);
      console.log('Filesystem path (relative):', filesystemPath);
      
      const targetDir = path.join(process.cwd(), filesystemPath);
      console.log('Target directory (absolute):', targetDir);

      // Create directory if it doesn't exist
      if (!fs.existsSync(targetDir)) {
        console.log('Directory does not exist, creating...');
        fs.mkdirSync(targetDir, { recursive: true });
        console.log('✅ Directory created successfully');
      } else {
        console.log('✅ Directory already exists');
      }

      // Verify directory was created
      if (fs.existsSync(targetDir)) {
        console.log('✅ Directory verified:', targetDir);
        cb(null, targetDir);
      } else {
        console.error('❌ Directory creation failed');
        cb(new Error('Failed to create upload directory'), '');
      }
    } catch (error: any) {
      console.error('❌ Destination error:', error);
      console.error('Error stack:', error.stack);
      cb(error, '');
    }
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    try {
      console.log('=== FILENAME CALLBACK ===');
      console.log('Original filename:', file.originalname);
      
      // Get file extension
      const ext = path.extname(file.originalname).toLowerCase();
      
      // Use field name as filename
      const filename = `${file.fieldname}${ext}`;
      
      console.log('✅ Generated filename:', filename);
      cb(null, filename);
    } catch (error: any) {
      console.error('❌ Filename error:', error);
      cb(error, '');
    }
  }
});

// File filter for validation
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  console.log('File filter - Field:', file.fieldname, 'Mimetype:', file.mimetype);
  
  // Check if field is allowed
  if (!allowedFields.includes(file.fieldname)) {
    console.error('Field not allowed:', file.fieldname);
    return cb(new Error(`Field ${file.fieldname} is not allowed`));
  }

  // For all_document field, only PDF is allowed
  if (file.fieldname === 'all_document') {
    if (file.mimetype !== 'application/pdf') {
      console.error('Invalid file type for all_document:', file.mimetype);
      return cb(new Error('all_document must be a PDF file'));
    }
  } else {
    // For other fields (photo, pan_card, aadhar_card), allow images and PDF
    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/pdf'
    ];
    
    if (!allowedMimes.includes(file.mimetype)) {
      console.error('Invalid file type:', file.mimetype);
      return cb(new Error(`File type ${file.mimetype} not allowed. Only JPEG, PNG and PDF files are allowed.`));
    }
  }

  cb(null, true);
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 200 * 1024 // 200 KB
  }
});

// Create fields array for multer
export const uploadFields = allowedFields.map(field => ({ name: field, maxCount: 1 }));
