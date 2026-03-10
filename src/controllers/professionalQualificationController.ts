import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// Create Professional Qualification
export const createProfessionalQualification = async (req: Request, res: Response) => {
  try {
    const {
      application_id,
      qualification,
      subject,
      qualifying_year,
      maximum_marks,
      marks_obtained,
      percentage,
      grade_system
    } = req.body;

    // Validate required fields
    if (!application_id) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required'
      });
    }

    if (qualification === undefined || !subject || !qualifying_year || 
        !maximum_marks || !marks_obtained) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Create professional qualification
    const professionalQualification = await prisma.professional_qualifications.create({
      data: {
        application_id: BigInt(application_id),
        qualification: parseInt(qualification),
        subject,
        qualifying_year: parseInt(qualifying_year),
        maximum_marks,
        marks_obtained,
        percentage: percentage || null,
        grade_system: grade_system ? parseInt(grade_system) : null,
        status: 1
      }
    });

    res.status(201).json({
      success: true,
      message: 'Professional qualification created successfully',
      data: {
        id: professionalQualification.id.toString(),
        application_id: professionalQualification.application_id.toString(),
        qualification: professionalQualification.qualification,
        subject: professionalQualification.subject,
        qualifying_year: professionalQualification.qualifying_year,
        maximum_marks: professionalQualification.maximum_marks,
        marks_obtained: professionalQualification.marks_obtained,
        percentage: professionalQualification.percentage,
        grade_system: professionalQualification.grade_system,
        status: professionalQualification.status,
        created_at: professionalQualification.created_at,
        updated_at: professionalQualification.updated_at
      }
    });
  } catch (error) {
    console.error('Create professional qualification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create professional qualification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get All Professional Qualifications by Application ID
export const getProfessionalQualificationsByApplicationId = async (req: Request, res: Response) => {
  try {
    const { application_id } = req.params;

    if (!application_id) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required'
      });
    }

    const qualifications = await prisma.professional_qualifications.findMany({
      where: {
        application_id: BigInt(application_id),
        status: 1
      },
      orderBy: {
        qualifying_year: 'desc'
      }
    });

    res.json({
      success: true,
      count: qualifications.length,
      data: qualifications.map(qual => ({
        id: qual.id.toString(),
        application_id: qual.application_id.toString(),
        qualification: qual.qualification,
        subject: qual.subject,
        qualifying_year: qual.qualifying_year,
        maximum_marks: qual.maximum_marks,
        marks_obtained: qual.marks_obtained,
        percentage: qual.percentage,
        grade_system: qual.grade_system,
        status: qual.status,
        created_at: qual.created_at,
        updated_at: qual.updated_at
      }))
    });
  } catch (error) {
    console.error('Get professional qualifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch professional qualifications',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get Single Professional Qualification by ID
export const getProfessionalQualificationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Professional qualification ID is required'
      });
    }

    const qualification = await prisma.professional_qualifications.findUnique({
      where: { id: BigInt(id) }
    });

    if (!qualification) {
      return res.status(404).json({
        success: false,
        message: 'Professional qualification not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: qualification.id.toString(),
        application_id: qualification.application_id.toString(),
        qualification: qualification.qualification,
        subject: qualification.subject,
        qualifying_year: qualification.qualifying_year,
        maximum_marks: qualification.maximum_marks,
        marks_obtained: qualification.marks_obtained,
        percentage: qualification.percentage,
        grade_system: qualification.grade_system,
        status: qualification.status,
        created_at: qualification.created_at,
        updated_at: qualification.updated_at
      }
    });
  } catch (error) {
    console.error('Get professional qualification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch professional qualification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update Professional Qualification
export const updateProfessionalQualification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      qualification,
      subject,
      qualifying_year,
      maximum_marks,
      marks_obtained,
      percentage,
      grade_system
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Professional qualification ID is required'
      });
    }

    // Check if qualification exists
    const existingQualification = await prisma.professional_qualifications.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingQualification) {
      return res.status(404).json({
        success: false,
        message: 'Professional qualification not found'
      });
    }

    // Build update data
    const updateData: any = {
      updated_at: new Date()
    };

    if (qualification !== undefined) updateData.qualification = parseInt(qualification);
    if (subject !== undefined) updateData.subject = subject;
    if (qualifying_year !== undefined) updateData.qualifying_year = parseInt(qualifying_year);
    if (maximum_marks !== undefined) updateData.maximum_marks = maximum_marks;
    if (marks_obtained !== undefined) updateData.marks_obtained = marks_obtained;
    if (percentage !== undefined) updateData.percentage = percentage;
    if (grade_system !== undefined) updateData.grade_system = grade_system ? parseInt(grade_system) : null;

    // Update qualification
    const updatedQualification = await prisma.professional_qualifications.update({
      where: { id: BigInt(id) },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Professional qualification updated successfully',
      data: {
        id: updatedQualification.id.toString(),
        application_id: updatedQualification.application_id.toString(),
        qualification: updatedQualification.qualification,
        subject: updatedQualification.subject,
        qualifying_year: updatedQualification.qualifying_year,
        maximum_marks: updatedQualification.maximum_marks,
        marks_obtained: updatedQualification.marks_obtained,
        percentage: updatedQualification.percentage,
        grade_system: updatedQualification.grade_system,
        status: updatedQualification.status,
        created_at: updatedQualification.created_at,
        updated_at: updatedQualification.updated_at
      }
    });
  } catch (error) {
    console.error('Update professional qualification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update professional qualification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete Professional Qualification (Permanent Delete)
export const deleteProfessionalQualification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Professional qualification ID is required'
      });
    }

    // Check if qualification exists
    const existingQualification = await prisma.professional_qualifications.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingQualification) {
      return res.status(404).json({
        success: false,
        message: 'Professional qualification not found'
      });
    }

    // Permanently delete the record
    await prisma.professional_qualifications.delete({
      where: { id: BigInt(id) }
    });

    res.json({
      success: true,
      message: 'Professional qualification deleted successfully'
    });
  } catch (error) {
    console.error('Delete professional qualification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete professional qualification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
