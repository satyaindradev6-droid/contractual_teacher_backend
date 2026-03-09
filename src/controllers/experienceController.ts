import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// Create Experience Detail
export const createExperience = async (req: Request, res: Response) => {
  try {
    const {
      application_id,
      organization_name,
      designation,
      start_date,
      end_date,
      currently_working,
      key_responsibilities
    } = req.body;

    // Validate required fields
    if (!application_id || !organization_name || designation === undefined || !start_date || !key_responsibilities) {
      return res.status(400).json({
        success: false,
        message: 'Application ID, organization name, designation, start date, and key responsibilities are required'
      });
    }

    // Create experience detail
    const experience = await prisma.experience_detail.create({
      data: {
        application_id: BigInt(application_id),
        organization_name,
        designation: parseInt(designation),
        start_date: new Date(start_date),
        end_date: end_date ? new Date(end_date) : null,
        currently_working: currently_working ?? false,
        key_responsibilities,
        status: 1
      }
    });

    res.status(201).json({
      success: true,
      message: 'Experience detail created successfully',
      data: {
        id: experience.id.toString(),
        application_id: experience.application_id.toString(),
        organization_name: experience.organization_name,
        designation: experience.designation,
        start_date: experience.start_date.toISOString().split('T')[0],
        end_date: experience.end_date ? experience.end_date.toISOString().split('T')[0] : null,
        currently_working: experience.currently_working,
        key_responsibilities: experience.key_responsibilities,
        status: experience.status,
        created_at: experience.created_at,
        updated_at: experience.updated_at
      }
    });
  } catch (error) {
    console.error('Create experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create experience detail',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get All Experience Details by Application ID
export const getExperiencesByApplicationId = async (req: Request, res: Response) => {
  try {
    const { application_id } = req.params;

    if (!application_id) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required'
      });
    }

    const experiences = await prisma.experience_detail.findMany({
      where: {
        application_id: BigInt(application_id),
        status: 1
      },
      orderBy: {
        start_date: 'desc'
      }
    });

    res.json({
      success: true,
      count: experiences.length,
      data: experiences.map(exp => ({
        id: exp.id.toString(),
        application_id: exp.application_id.toString(),
        organization_name: exp.organization_name,
        designation: exp.designation,
        start_date: exp.start_date.toISOString().split('T')[0],
        end_date: exp.end_date ? exp.end_date.toISOString().split('T')[0] : null,
        currently_working: exp.currently_working,
        key_responsibilities: exp.key_responsibilities,
        status: exp.status,
        created_at: exp.created_at,
        updated_at: exp.updated_at
      }))
    });
  } catch (error) {
    console.error('Get experiences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch experience details'
    });
  }
};

// Get Single Experience Detail by ID
export const getExperienceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Experience ID is required'
      });
    }

    const experience = await prisma.experience_detail.findUnique({
      where: { id: BigInt(id) }
    });

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience detail not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: experience.id.toString(),
        application_id: experience.application_id.toString(),
        organization_name: experience.organization_name,
        designation: experience.designation,
        start_date: experience.start_date.toISOString().split('T')[0],
        end_date: experience.end_date ? experience.end_date.toISOString().split('T')[0] : null,
        currently_working: experience.currently_working,
        key_responsibilities: experience.key_responsibilities,
        status: experience.status,
        created_at: experience.created_at,
        updated_at: experience.updated_at
      }
    });
  } catch (error) {
    console.error('Get experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch experience detail'
    });
  }
};

// Update Experience Detail
export const updateExperience = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      organization_name,
      designation,
      start_date,
      end_date,
      currently_working,
      key_responsibilities
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Experience ID is required'
      });
    }

    // Check if experience exists
    const existingExperience = await prisma.experience_detail.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingExperience) {
      return res.status(404).json({
        success: false,
        message: 'Experience detail not found'
      });
    }

    // Build update data
    const updateData: any = {
      updated_at: new Date()
    };

    if (organization_name !== undefined) updateData.organization_name = organization_name;
    if (designation !== undefined) updateData.designation = parseInt(designation);
    if (start_date !== undefined) updateData.start_date = new Date(start_date);
    if (end_date !== undefined) updateData.end_date = end_date ? new Date(end_date) : null;
    if (currently_working !== undefined) updateData.currently_working = currently_working;
    if (key_responsibilities !== undefined) updateData.key_responsibilities = key_responsibilities;

    // Update experience
    const updatedExperience = await prisma.experience_detail.update({
      where: { id: BigInt(id) },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Experience detail updated successfully',
      data: {
        id: updatedExperience.id.toString(),
        application_id: updatedExperience.application_id.toString(),
        organization_name: updatedExperience.organization_name,
        designation: updatedExperience.designation,
        start_date: updatedExperience.start_date.toISOString().split('T')[0],
        end_date: updatedExperience.end_date ? updatedExperience.end_date.toISOString().split('T')[0] : null,
        currently_working: updatedExperience.currently_working,
        key_responsibilities: updatedExperience.key_responsibilities,
        status: updatedExperience.status,
        created_at: updatedExperience.created_at,
        updated_at: updatedExperience.updated_at
      }
    });
  } catch (error) {
    console.error('Update experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update experience detail'
    });
  }
};

// Delete Experience Detail (Permanent Delete)
export const deleteExperience = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Experience ID is required'
      });
    }

    // Check if experience exists
    const existingExperience = await prisma.experience_detail.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingExperience) {
      return res.status(404).json({
        success: false,
        message: 'Experience detail not found'
      });
    }

    // Permanently delete the record
    await prisma.experience_detail.delete({
      where: { id: BigInt(id) }
    });

    res.json({
      success: true,
      message: 'Experience detail deleted successfully'
    });
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete experience detail'
    });
  }
};
