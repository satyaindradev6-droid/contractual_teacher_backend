import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// Create or Replace School and Post Choice
export const createSchoolPostChoice = async (req: Request, res: Response) => {
  try {
    const {
      application_id,
      school_id,
      kv_id,
      state_id,
      designation_id,
      subject_id,
      ro_id,
      choice
    } = req.body;

    // Validate required fields
    if (!application_id || !school_id || !kv_id || !choice) {
      return res.status(400).json({
        success: false,
        message: 'application_id, school_id, kv_id, and choice are required'
      });
    }

    // Validate choice value (must be 1, 2, or 3)
    const choiceNum = parseInt(choice);
    if (![1, 2, 3].includes(choiceNum)) {
      return res.status(400).json({
        success: false,
        message: 'choice must be 1, 2, or 3'
      });
    }

    // Check if a record with the same application_id and choice already exists
    const existingChoice = await prisma.school_and_post_choice.findFirst({
      where: {
        application_id: BigInt(application_id),
        choice: choiceNum,
        status: 1
      }
    });

    const dataPayload = {
      school_id: parseInt(school_id),
      kv_id: parseInt(kv_id),
      state_id: state_id ? BigInt(state_id) : null,
      designation_id: designation_id ? parseInt(designation_id) : null,
      subject_id: subject_id ? parseInt(subject_id) : null,
      ro_id: ro_id ? parseInt(ro_id) : null,
      choice: choiceNum,
      updated_at: new Date()
    };

    let schoolPostChoice;
    let isUpdate = false;

    if (existingChoice) {
      // Replace (update) the existing choice
      schoolPostChoice = await prisma.school_and_post_choice.update({
        where: { id: existingChoice.id },
        data: dataPayload
      });
      isUpdate = true;
    } else {
      // Validate maximum 3 choices per application
      const activeChoicesCount = await prisma.school_and_post_choice.count({
        where: {
          application_id: BigInt(application_id),
          status: 1
        }
      });

      if (activeChoicesCount >= 3) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 3 choices allowed per application. Please update an existing choice instead.'
        });
      }

      // Create new choice
      schoolPostChoice = await prisma.school_and_post_choice.create({
        data: {
          application_id: BigInt(application_id),
          ...dataPayload,
          status: 1
        }
      });
    }

    res.status(isUpdate ? 200 : 201).json({
      success: true,
      message: isUpdate
        ? 'School and post choice replaced successfully'
        : 'School and post choice created successfully',
      data: {
        id: schoolPostChoice.id.toString(),
        application_id: schoolPostChoice.application_id.toString(),
        school_id: schoolPostChoice.school_id,
        kv_id: schoolPostChoice.kv_id,
        state_id: schoolPostChoice.state_id?.toString() || null,
        designation_id: schoolPostChoice.designation_id,
        subject_id: schoolPostChoice.subject_id,
        ro_id: schoolPostChoice.ro_id,
        choice: schoolPostChoice.choice,
        status: schoolPostChoice.status,
        created_at: schoolPostChoice.created_at,
        updated_at: schoolPostChoice.updated_at
      }
    });
  } catch (error) {
    console.error('Create school post choice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create school and post choice',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get All School and Post Choices by Application ID
export const getSchoolPostChoicesByApplicationId = async (req: Request, res: Response) => {
  try {
    const { application_id } = req.params;

    if (!application_id) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required'
      });
    }

    const schoolPostChoices = await prisma.school_and_post_choice.findMany({
      where: {
        application_id: BigInt(application_id),
        status: 1
      },
      orderBy: {
        choice: 'asc'
      }
    });

    res.json({
      success: true,
      count: schoolPostChoices.length,
      data: schoolPostChoices.map(choice => ({
        id: choice.id.toString(),
        application_id: choice.application_id.toString(),
        school_id: choice.school_id,
        kv_id: choice.kv_id,
        state_id: choice.state_id?.toString() || null,
        designation_id: choice.designation_id,
        subject_id: choice.subject_id,
        ro_id: choice.ro_id,
        choice: choice.choice,
        status: choice.status,
        created_at: choice.created_at,
        updated_at: choice.updated_at
      }))
    });
  } catch (error) {
    console.error('Get school post choices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch school and post choices',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get Single School and Post Choice by ID
export const getSchoolPostChoiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'School post choice ID is required'
      });
    }

    const schoolPostChoice = await prisma.school_and_post_choice.findUnique({
      where: { id: BigInt(id) }
    });

    if (!schoolPostChoice) {
      return res.status(404).json({
        success: false,
        message: 'School and post choice not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: schoolPostChoice.id.toString(),
        application_id: schoolPostChoice.application_id.toString(),
        school_id: schoolPostChoice.school_id,
        kv_id: schoolPostChoice.kv_id,
        state_id: schoolPostChoice.state_id?.toString() || null,
        designation_id: schoolPostChoice.designation_id,
        subject_id: schoolPostChoice.subject_id,
        ro_id: schoolPostChoice.ro_id,
        choice: schoolPostChoice.choice,
        status: schoolPostChoice.status,
        created_at: schoolPostChoice.created_at,
        updated_at: schoolPostChoice.updated_at
      }
    });
  } catch (error) {
    console.error('Get school post choice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch school and post choice',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update School and Post Choice
export const updateSchoolPostChoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      school_id,
      kv_id,
      state_id,
      designation_id,
      subject_id,
      ro_id,
      choice
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'School post choice ID is required'
      });
    }

    // Validate choice value if provided
    if (choice !== undefined) {
      const choiceNum = parseInt(choice);
      if (![1, 2, 3].includes(choiceNum)) {
        return res.status(400).json({
          success: false,
          message: 'choice must be 1, 2, or 3'
        });
      }
    }

    // Check if record exists
    const existingChoice = await prisma.school_and_post_choice.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingChoice) {
      return res.status(404).json({
        success: false,
        message: 'School and post choice not found'
      });
    }

    // Build update data
    const updateData: any = {
      updated_at: new Date()
    };

    if (school_id !== undefined) updateData.school_id = parseInt(school_id);
    if (kv_id !== undefined) updateData.kv_id = parseInt(kv_id);
    if (state_id !== undefined) updateData.state_id = state_id ? BigInt(state_id) : null;
    if (designation_id !== undefined) updateData.designation_id = designation_id ? parseInt(designation_id) : null;
    if (subject_id !== undefined) updateData.subject_id = subject_id ? parseInt(subject_id) : null;
    if (ro_id !== undefined) updateData.ro_id = ro_id ? parseInt(ro_id) : null;
    if (choice !== undefined) updateData.choice = parseInt(choice);

    // Update record
    const updatedChoice = await prisma.school_and_post_choice.update({
      where: { id: BigInt(id) },
      data: updateData
    });

    res.json({
      success: true,
      message: 'School and post choice updated successfully',
      data: {
        id: updatedChoice.id.toString(),
        application_id: updatedChoice.application_id.toString(),
        school_id: updatedChoice.school_id,
        kv_id: updatedChoice.kv_id,
        state_id: updatedChoice.state_id?.toString() || null,
        designation_id: updatedChoice.designation_id,
        subject_id: updatedChoice.subject_id,
        ro_id: updatedChoice.ro_id,
        choice: updatedChoice.choice,
        status: updatedChoice.status,
        created_at: updatedChoice.created_at,
        updated_at: updatedChoice.updated_at
      }
    });
  } catch (error) {
    console.error('Update school post choice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update school and post choice',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete School and Post Choice
export const deleteSchoolPostChoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'School post choice ID is required'
      });
    }

    // Check if record exists
    const existingChoice = await prisma.school_and_post_choice.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingChoice) {
      return res.status(404).json({
        success: false,
        message: 'School and post choice not found'
      });
    }

    // Permanently delete the record
    await prisma.school_and_post_choice.delete({
      where: { id: BigInt(id) }
    });

    res.json({
      success: true,
      message: 'School and post choice deleted successfully'
    });
  } catch (error) {
    console.error('Delete school post choice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete school and post choice',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
