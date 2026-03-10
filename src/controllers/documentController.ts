import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import fs from 'fs';
import path from 'path';
import { getUploadPaths, generateDocumentUrl } from '../utils/helper';

export const uploadDocuments = async (req: Request, res: Response) => {
  console.log('=== UPLOAD REQUEST STARTED ===');
  console.log('Request headers:', req.headers);
  console.log('Content-Type:', req.get('content-type'));
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);

  try {
    const { application_id } = req.body;

    if (!application_id) {
      console.error('Missing application_id');
      return res.status(400).json({
        status: false,
        message: 'application_id is required'
      });
    }

    console.log('Processing upload for application_id:', application_id);

    // Check if application exists
    const application = await prisma.applications.findUnique({
      where: { application_id: BigInt(application_id) }
    });

    if (!application) {
      console.error('Application not found:', application_id);
      return res.status(404).json({
        status: false,
        message: 'Application not found'
      });
    }

    console.log('Application found:', {
      id: application.application_id.toString(),
      name: `${application.first_name} ${application.last_name}`
    });

    // Get uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || Object.keys(files).length === 0) {
      console.error('No files uploaded');
      return res.status(400).json({
        status: false,
        message: 'No files uploaded'
      });
    }

    console.log('Files received:', Object.keys(files));

    // Validate all_document file size (200 KB max)
    if (files.all_document && files.all_document[0]) {
      const fileSize = files.all_document[0].size;
      const maxSize = 200 * 1024; // 200 KB

      if (fileSize > maxSize) {
        // Delete the uploaded file
        const filePath = files.all_document[0].path;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        return res.status(400).json({
          status: false,
          message: 'all_document file size exceeds 200 KB limit'
        });
      }
    }

    // Prepare data for database
    const documentData: any = {
      application_id: BigInt(application_id)
    };

    // Map file names to database fields
    Object.keys(files).forEach((fieldName) => {
      if (files[fieldName] && files[fieldName][0]) {
        documentData[fieldName] = files[fieldName][0].filename;
        console.log(`Mapped ${fieldName} -> ${files[fieldName][0].filename}`);
      }
    });

    // Check if record exists
    const existingRecord = await prisma.upload_document.findFirst({
      where: { application_id: BigInt(application_id) }
    });

    let result;
    if (existingRecord) {
      console.log('Updating existing record:', existingRecord.id.toString());
      // Update existing record
      result = await prisma.upload_document.update({
        where: { id: existingRecord.id },
        data: {
          ...documentData,
          updated_at: new Date()
        }
      });
    } else {
      console.log('Creating new record');
      // Create new record
      result = await prisma.upload_document.create({
        data: documentData
      });
    }

    console.log('Upload successful:', result.id.toString());

    return res.status(200).json({
      status: true,
      message: existingRecord ? 'Documents updated successfully' : 'Documents uploaded successfully'
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    console.error('Error stack:', error.stack);

    // Handle multer file size error
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: false,
        message: 'File size exceeds 200 KB limit'
      });
    }

    return res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const { application_id } = req.params;

    if (!application_id) {
      return res.status(400).json({
        status: false,
        message: 'application_id is required'
      });
    }

    // Check if application exists
    const application = await prisma.applications.findUnique({
      where: { application_id: BigInt(application_id) }
    });

    if (!application) {
      return res.status(404).json({
        status: false,
        message: 'Application not found'
      });
    }

    // Get document record
    const documents = await prisma.upload_document.findFirst({
      where: { application_id: BigInt(application_id) }
    });

    if (!documents) {
      return res.status(404).json({
        status: false,
        message: 'No documents found for this application'
      });
    }

    // Generate full URLs for each document
    const documentsData = {
      photo: documents.photo ? generateDocumentUrl(application_id, documents.photo) : null,
      pan_card: documents.pan_card ? generateDocumentUrl(application_id, documents.pan_card) : null,
      aadhar_card: documents.aadhar_card ? generateDocumentUrl(application_id, documents.aadhar_card) : null,
      all_document: documents.all_document ? generateDocumentUrl(application_id, documents.all_document) : null
    };

    return res.status(200).json({
      status: true,
      message: 'Documents retrieved successfully',
      data: documentsData
    });

  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};

export const viewDocument = async (req: Request, res: Response) => {
  try {
    const { application_id, document_type } = req.params;

    if (!application_id) {
      return res.status(400).json({
        status: false,
        message: 'application_id is required'
      });
    }

    if (!document_type) {
      return res.status(400).json({
        status: false,
        message: 'document_type is required'
      });
    }

    // Validate document_type
    const validDocumentTypes = ['photo', 'pan_card', 'aadhar_card', 'all_document'];
    if (!validDocumentTypes.includes(document_type)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid document type'
      });
    }

    // Check if application exists
    const application = await prisma.applications.findUnique({
      where: { application_id: BigInt(application_id) }
    });

    if (!application) {
      return res.status(404).json({
        status: false,
        message: 'Application not found'
      });
    }

    // Get document record
    const documents = await prisma.upload_document.findFirst({
      where: { application_id: BigInt(application_id) }
    });

    if (!documents) {
      return res.status(404).json({
        status: false,
        message: 'No documents found for this application'
      });
    }

    // Get the filename for the requested document type
    const filename = (documents as any)[document_type];

    if (!filename) {
      return res.status(404).json({
        status: false,
        message: `Document type '${document_type}' not found or not uploaded`
      });
    }

    // Construct file path using helper
    const { filesystemPath } = getUploadPaths(application_id);
    const filePath = path.join(process.cwd(), filesystemPath, filename);

    console.log('Viewing document:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: false,
        message: 'File not found on server'
      });
    }

    // Get file extension to set content type
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';

    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.pdf') {
      contentType = 'application/pdf';
    }

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    // Send file
    return res.sendFile(filePath);

  } catch (error) {
    console.error('View document error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};
