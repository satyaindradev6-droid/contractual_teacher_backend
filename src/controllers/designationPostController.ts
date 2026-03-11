import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getDesignationById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid designation id parameter'
      });
    }

    const designation = await prisma.master_designations.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        alias: true,
        code: true
      }
    });

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: 'Designation not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: designation
    });
  } catch (error) {
    console.error('Error fetching designation:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getSubjectById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject id parameter'
      });
    }

    const subject = await prisma.master_subjects.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        alias: true,
        subjectCode_10: true,
        subjectCode_12: true
      }
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Error fetching subject:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getDesignationsByKV = async (req: Request, res: Response) => {
  try {
    const kv_id = parseInt(req.params.kv_id);

    if (isNaN(kv_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid kv_id parameter'
      });
    }

    // Much cleaner - directly use designation_id column
    const designations = await prisma.master_designations.findMany({
      where: {
        config_designation_post: {
          some: {
            kv_id,
            is_open: 1
          }
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    return res.status(200).json({
      success: true,
      data: designations
    });
  } catch (error) {
    console.error('Error fetching designations:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getSubjectsByKV = async (req: Request, res: Response) => {
  try {
    const kv_id = parseInt(req.params.kv_id);

    if (isNaN(kv_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid kv_id parameter'
      });
    }

    // Much cleaner - directly use subject_id column
    const subjects = await prisma.master_subjects.findMany({
      where: {
        config_designation_post: {
          some: {
            kv_id,
            is_open: 1
          }
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    return res.status(200).json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getKVPostData = async (req: Request, res: Response) => {
  try {
    const kv_id = parseInt(req.params.kv_id);

    if (isNaN(kv_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid kv_id parameter'
      });
    }

    // Check invitation date
    const invitation = await prisma.config_app_invitation_date.findFirst({
      where: {
        kv_id,
        start_date: { lte: new Date() },
        end_date: { gte: new Date() }
      }
    });

    if (!invitation) {
      return res.status(200).json({
        success: true,
        data: {
          designations: [],
          subjects: []
        }
      });
    }

    // Much cleaner approach - use Prisma relations directly
    const designations = await prisma.master_designations.findMany({
      where: {
        config_designation_post: {
          some: {
            kv_id,
            is_open: 1
          }
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    const subjects = await prisma.master_subjects.findMany({
      where: {
        config_designation_post: {
          some: {
            kv_id,
            is_open: 1
          }
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        designations,
        subjects
      }
    });
  } catch (error) {
    console.error('Error fetching KV post data:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
export const getSubjectsByDesignation = async (req: Request, res: Response) => {
  try {
    const kv_id = parseInt(req.params.kv_id);
    const { designation_id } = req.body;

    if (isNaN(kv_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid kv_id parameter"
      });
    }

    if (!designation_id) {
      return res.status(400).json({
        success: false,
        message: "designation_id is required"
      });
    }

    // Debug: First check what config records exist
    const configRecords = await prisma.config_designation_post.findMany({
      where: {
        kv_id,
        designation_id,
        is_open: 1
      },
      select: {
        id: true,
        subject_id: true,
        designation_subject: true
      }
    });

    console.log(`🔍 Debug - Config records for kv_id: ${kv_id}, designation_id: ${designation_id}:`, configRecords);

    // Filter out records with null subject_id
    const validSubjectIds = configRecords
      .filter(record => record.subject_id !== null)
      .map(record => record.subject_id);

    console.log(`🔍 Debug - Valid subject IDs:`, validSubjectIds);

    if (validSubjectIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const subjects = await prisma.master_subjects.findMany({
      where: {
        id: { in: validSubjectIds }
      },
      distinct: ['id'],
      select: {
        id: true,
        name: true
      }
    });

    console.log(`🔍 Debug - Final subjects:`, subjects);

    return res.status(200).json({
      success: true,
      data: subjects
    });

  } catch (error) {
    console.error("Error fetching subjects by designation:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
