import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// Create Academic Detail
export const createAcademic = async (req: Request, res: Response) => {
  try {
    const {
      application_id,
      qualification,
      course,
      course_type,
      subjects_specialization,
      board_university,
      course_duration_months,
      year_of_passing,
      marks_total,
      marks_obtained,
      percentage
    } = req.body;

    // Validate required fields
    if (!application_id) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required'
      });
    }

    if (!qualification || !course || !course_type || !subjects_specialization || 
        !board_university || !course_duration_months || !year_of_passing || 
        !marks_total || !marks_obtained) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Create academic detail
    const academic = await prisma.academic_detail.create({
      data: {
        application_id: BigInt(application_id),
        qualification: parseInt(qualification),
        course: parseInt(course),
        course_type: parseInt(course_type),
        subjects_specialization,
        board_university,
        course_duration_months: parseInt(course_duration_months),
        year_of_passing: parseInt(year_of_passing),
        marks_total,
        marks_obtained,
        percentage: percentage || null,
        status: 1
      }
    });

    res.status(201).json({
      success: true,
      message: 'Academic detail created successfully',
      data: {
        id: academic.id.toString(),
        application_id: academic.application_id.toString(),
        qualification: academic.qualification,
        course: academic.course,
        course_type: academic.course_type,
        subjects_specialization: academic.subjects_specialization,
        board_university: academic.board_university,
        course_duration_months: academic.course_duration_months,
        year_of_passing: academic.year_of_passing,
        marks_total: academic.marks_total,
        marks_obtained: academic.marks_obtained,
        percentage: academic.percentage,
        status: academic.status,
        created_at: academic.created_at,
        updated_at: academic.updated_at
      }
    });
  } catch (error) {
    console.error('Create academic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create academic detail',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get All Academic Details by Application ID
export const getAcademicsByApplicationId = async (req: Request, res: Response) => {
  try {
    const { application_id } = req.params;

    if (!application_id) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required'
      });
    }

    const academics = await prisma.academic_detail.findMany({
      where: {
        application_id: BigInt(application_id),
        status: 1
      },
      orderBy: {
        year_of_passing: 'desc'
      }
    });

    res.json({
      success: true,
      count: academics.length,
      data: academics.map(academic => ({
        id: academic.id.toString(),
        application_id: academic.application_id.toString(),
        qualification: academic.qualification,
        course: academic.course,
        course_type: academic.course_type,
        subjects_specialization: academic.subjects_specialization,
        board_university: academic.board_university,
        course_duration_months: academic.course_duration_months,
        year_of_passing: academic.year_of_passing,
        marks_total: academic.marks_total,
        marks_obtained: academic.marks_obtained,
        percentage: academic.percentage,
        status: academic.status,
        created_at: academic.created_at,
        updated_at: academic.updated_at
      }))
    });
  } catch (error) {
    console.error('Get academics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch academic details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get Single Academic Detail by ID
export const getAcademicById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Academic ID is required'
      });
    }

    const academic = await prisma.academic_detail.findUnique({
      where: { id: BigInt(id) }
    });

    if (!academic) {
      return res.status(404).json({
        success: false,
        message: 'Academic detail not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: academic.id.toString(),
        application_id: academic.application_id.toString(),
        qualification: academic.qualification,
        course: academic.course,
        course_type: academic.course_type,
        subjects_specialization: academic.subjects_specialization,
        board_university: academic.board_university,
        course_duration_months: academic.course_duration_months,
        year_of_passing: academic.year_of_passing,
        marks_total: academic.marks_total,
        marks_obtained: academic.marks_obtained,
        percentage: academic.percentage,
        status: academic.status,
        created_at: academic.created_at,
        updated_at: academic.updated_at
      }
    });
  } catch (error) {
    console.error('Get academic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch academic detail',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update Academic Detail
export const updateAcademic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      qualification,
      course,
      course_type,
      subjects_specialization,
      board_university,
      course_duration_months,
      year_of_passing,
      marks_total,
      marks_obtained,
      percentage
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Academic ID is required'
      });
    }

    // Check if academic exists
    const existingAcademic = await prisma.academic_detail.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingAcademic) {
      return res.status(404).json({
        success: false,
        message: 'Academic detail not found'
      });
    }

    // Build update data
    const updateData: any = {
      updated_at: new Date()
    };

    if (qualification !== undefined) updateData.qualification = parseInt(qualification);
    if (course !== undefined) updateData.course = parseInt(course);
    if (course_type !== undefined) updateData.course_type = parseInt(course_type);
    if (subjects_specialization !== undefined) updateData.subjects_specialization = subjects_specialization;
    if (board_university !== undefined) updateData.board_university = board_university;
    if (course_duration_months !== undefined) updateData.course_duration_months = parseInt(course_duration_months);
    if (year_of_passing !== undefined) updateData.year_of_passing = parseInt(year_of_passing);
    if (marks_total !== undefined) updateData.marks_total = marks_total;
    if (marks_obtained !== undefined) updateData.marks_obtained = marks_obtained;
    if (percentage !== undefined) updateData.percentage = percentage;

    // Update academic
    const updatedAcademic = await prisma.academic_detail.update({
      where: { id: BigInt(id) },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Academic detail updated successfully',
      data: {
        id: updatedAcademic.id.toString(),
        application_id: updatedAcademic.application_id.toString(),
        qualification: updatedAcademic.qualification,
        course: updatedAcademic.course,
        course_type: updatedAcademic.course_type,
        subjects_specialization: updatedAcademic.subjects_specialization,
        board_university: updatedAcademic.board_university,
        course_duration_months: updatedAcademic.course_duration_months,
        year_of_passing: updatedAcademic.year_of_passing,
        marks_total: updatedAcademic.marks_total,
        marks_obtained: updatedAcademic.marks_obtained,
        percentage: updatedAcademic.percentage,
        status: updatedAcademic.status,
        created_at: updatedAcademic.created_at,
        updated_at: updatedAcademic.updated_at
      }
    });
  } catch (error) {
    console.error('Update academic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update academic detail',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete Academic Detail (Permanent Delete)
export const deleteAcademic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Academic ID is required'
      });
    }

    // Check if academic exists
    const existingAcademic = await prisma.academic_detail.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingAcademic) {
      return res.status(404).json({
        success: false,
        message: 'Academic detail not found'
      });
    }

    // Permanently delete the record
    await prisma.academic_detail.delete({
      where: { id: BigInt(id) }
    });

    res.json({
      success: true,
      message: 'Academic detail deleted successfully'
    });
  } catch (error) {
    console.error('Delete academic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete academic detail',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
