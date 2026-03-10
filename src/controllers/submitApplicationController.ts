import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const submitApplication = async (req: Request, res: Response) => {
  try {
    const { application_id, is_submitted } = req.body;

    // Validate input
    if (!application_id) {
      return res.status(400).json({
        success: false,
        message: 'application_id is required'
      });
    }

    // Convert to BigInt safely
    const appIdBigInt = BigInt(application_id);

    // Check if application exists
    const application = await prisma.applications.findUnique({
      where: { application_id: appIdBigInt }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Generate submission_id: 26000000 + application_id
    const generatedSubmissionId = (26000000 + Number(application_id)).toString();

    // Check if submission already exists
    const existingSubmission = await prisma.submit_application.findFirst({
      where: { application_id: appIdBigInt }
    });

    const submissionData = {
      submission_id: generatedSubmissionId,
      is_submitted: is_submitted !== undefined ? Number(is_submitted) : 0,
      submitted_at: is_submitted === 1 ? new Date() : null,
      updated_at: new Date()
    };

    let result;
    if (existingSubmission) {
      // Update existing submission
      result = await prisma.submit_application.update({
        where: { id: existingSubmission.id },
        data: submissionData
      });

      console.log('Updated submission:', result);
    } else {
      // Create new submission
      result = await prisma.submit_application.create({
        data: {
          application_id: appIdBigInt,
          ...submissionData
        }
      });

      console.log('Created new submission:', result);
    }

    res.status(200).json({
      success: true,
      message: existingSubmission ? 'Application submission updated successfully' : 'Application submitted successfully',
      data: {
        id: result.id.toString(),
        application_id: result.application_id.toString(),
        submission_id: result.submission_id,
        is_submitted: result.is_submitted,
        submitted_at: result.submitted_at,
        status: result.status,
        created_at: result.created_at,
        updated_at: result.updated_at
      }
    });
  } catch (error) {
    console.error('Submit application error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getSubmission = async (req: Request, res: Response) => {
  try {
    const { application_id } = req.params;

    if (!application_id) {
      return res.status(400).json({
        success: false,
        message: 'application_id is required'
      });
    }

    // Check if application exists
    const application = await prisma.applications.findUnique({
      where: { application_id: BigInt(application_id) }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Get submission record
    const submission = await prisma.submit_application.findFirst({
      where: { application_id: BigInt(application_id) }
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found for this application'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Submission retrieved successfully',
      data: {
        id: submission.id.toString(),
        application_id: submission.application_id.toString(),
        submission_id: submission.submission_id,
        is_submitted: submission.is_submitted,
        submitted_at: submission.submitted_at,
        status: submission.status,
        created_at: submission.created_at,
        updated_at: submission.updated_at
      }
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submission'
    });
  }
};
