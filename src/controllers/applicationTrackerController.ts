import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// Create Application Tracker
export const createApplicationTracker = async (req: Request, res: Response) => {
  try {
    const { application_id } = req.body;

    // Validate required fields
    if (!application_id) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required'
      });
    }

    // Check if tracker already exists for this application
    const existingTracker = await prisma.application_tracker.findFirst({
      where: {
        application_id: BigInt(application_id)
      }
    });

    if (existingTracker) {
      return res.status(400).json({
        success: false,
        message: 'Application tracker already exists for this application'
      });
    }

    // Create application tracker with default values
    const tracker = await prisma.application_tracker.create({
      data: {
        application_id: BigInt(application_id),
        basic_information: 0,
        school_preference_posting: 0,
        academic_qualification: 0,
        professional_qualification: 0,
        experience: 0,
        upload_documents: 0,
        preview: 0,
        declaration_submission: 0,
        current_step: 1,
        status: 1
      }
    });

    res.status(201).json({
      success: true,
      message: 'Application tracker created successfully',
      data: {
        id: tracker.id.toString(),
        application_id: tracker.application_id.toString(),
        basic_information: tracker.basic_information,
        school_preference_posting: tracker.school_preference_posting,
        academic_qualification: tracker.academic_qualification,
        professional_qualification: tracker.professional_qualification,
        experience: tracker.experience,
        upload_documents: tracker.upload_documents,
        preview: tracker.preview,
        declaration_submission: tracker.declaration_submission,
        current_step: tracker.current_step,
        status: tracker.status,
        created_at: tracker.created_at,
        updated_at: tracker.updated_at
      }
    });
  } catch (error) {
    console.error('Create application tracker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create application tracker',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update Application Tracker
export const updateApplicationTracker = async (req: Request, res: Response) => {
  try {
    const { application_id } = req.params;
    const {
      basic_information,
      school_preference_posting,
      academic_qualification,
      professional_qualification,
      experience,
      upload_documents,
      preview,
      declaration_submission,
      current_step,
      status
    } = req.body;

    if (!application_id) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required'
      });
    }

    // Check if tracker exists
    const existingTracker = await prisma.application_tracker.findFirst({
      where: {
        application_id: BigInt(application_id)
      }
    });

    if (!existingTracker) {
      return res.status(404).json({
        success: false,
        message: 'Application tracker not found'
      });
    }

    // Build update data
    const updateData: any = {
      updated_at: new Date()
    };

    if (basic_information !== undefined) updateData.basic_information = parseInt(basic_information);
    if (school_preference_posting !== undefined) updateData.school_preference_posting = parseInt(school_preference_posting);
    if (academic_qualification !== undefined) updateData.academic_qualification = parseInt(academic_qualification);
    if (professional_qualification !== undefined) updateData.professional_qualification = parseInt(professional_qualification);
    if (experience !== undefined) updateData.experience = parseInt(experience);
    if (upload_documents !== undefined) updateData.upload_documents = parseInt(upload_documents);
    if (preview !== undefined) updateData.preview = parseInt(preview);
    if (declaration_submission !== undefined) updateData.declaration_submission = parseInt(declaration_submission);
    if (current_step !== undefined) updateData.current_step = parseInt(current_step);
    if (status !== undefined) updateData.status = parseInt(status);

    // Update tracker
    const updatedTracker = await prisma.application_tracker.update({
      where: { id: existingTracker.id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Application tracker updated successfully',
      data: {
        id: updatedTracker.id.toString(),
        application_id: updatedTracker.application_id.toString(),
        basic_information: updatedTracker.basic_information,
        school_preference_posting: updatedTracker.school_preference_posting,
        academic_qualification: updatedTracker.academic_qualification,
        professional_qualification: updatedTracker.professional_qualification,
        experience: updatedTracker.experience,
        upload_documents: updatedTracker.upload_documents,
        preview: updatedTracker.preview,
        declaration_submission: updatedTracker.declaration_submission,
        current_step: updatedTracker.current_step,
        status: updatedTracker.status,
        created_at: updatedTracker.created_at,
        updated_at: updatedTracker.updated_at
      }
    });
  } catch (error) {
    console.error('Update application tracker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application tracker'
    });
  }
};

// Get Application Tracker by Application ID
export const getApplicationTracker = async (req: Request, res: Response) => {
  try {
    const { application_id } = req.params;

    if (!application_id) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required'
      });
    }

    const tracker = await prisma.application_tracker.findFirst({
      where: {
        application_id: BigInt(application_id)
      }
    });

    if (!tracker) {
      return res.status(404).json({
        success: false,
        message: 'Application tracker not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: tracker.id.toString(),
        application_id: tracker.application_id.toString(),
        basic_information: tracker.basic_information,
        school_preference_posting: tracker.school_preference_posting,
        academic_qualification: tracker.academic_qualification,
        professional_qualification: tracker.professional_qualification,
        experience: tracker.experience,
        upload_documents: tracker.upload_documents,
        preview: tracker.preview,
        declaration_submission: tracker.declaration_submission,
        current_step: tracker.current_step,
        status: tracker.status,
        created_at: tracker.created_at,
        updated_at: tracker.updated_at
      }
    });
  } catch (error) {
    console.error('Get application tracker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application tracker'
    });
  }
};
