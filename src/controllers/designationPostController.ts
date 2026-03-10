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

    const configPosts = await prisma.config_designation_post.findMany({
      where: {
        kv_id,
        is_open: 1
      },
      select: {
        designation_subject: true,
        designation_id: true
      }
    });

    const uniqueDesignationIds = new Set<number>();

    configPosts.forEach(post => {
      // Parse from designation_subject string first
      if (post.designation_subject) {
        const parts = post.designation_subject.split('-');
        if (parts.length === 2) {
          const desigId = parseInt(parts[0]);
          if (!isNaN(desigId)) uniqueDesignationIds.add(desigId);
        }
      } else if (post.designation_id !== null) {
        // Fallback to designation_id column if designation_subject is empty
        uniqueDesignationIds.add(post.designation_id);
      }
    });

    const designations = Array.from(uniqueDesignationIds).map(id => ({ designation_id: id }));

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

    const configPosts = await prisma.config_designation_post.findMany({
      where: {
        kv_id,
        is_open: 1
      },
      select: {
        designation_subject: true,
        subject_id: true
      }
    });

    const uniqueSubjectIds = new Set<number>();

    configPosts.forEach(post => {
      // Parse from designation_subject string first
      if (post.designation_subject) {
        const parts = post.designation_subject.split('-');
        if (parts.length === 2) {
          const subjId = parseInt(parts[1]);
          if (!isNaN(subjId)) uniqueSubjectIds.add(subjId);
        }
      } else if (post.subject_id !== null) {
        // Fallback to subject_id column if designation_subject is empty
        uniqueSubjectIds.add(post.subject_id);
      }
    });

    const subjects = Array.from(uniqueSubjectIds).map(id => ({ subject_id: id }));

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

    // ✅ NEW CONDITION (check invitation date)
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

    // 🔽 OLD LOGIC STARTS (unchanged)
    // Fetch config records where is_open = 1
    const configPosts = await prisma.config_designation_post.findMany({
      where: {
        kv_id,
        is_open: 1
      },
      select: {
        designation_subject: true,
        designation_id: true,
        subject_id: true
      }
    });

    if (configPosts.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          designations: [],
          subjects: []
        }
      });
    }

    // Extract unique designation and subject IDs
    const uniqueDesignationIds = new Set<number>();
    const uniqueSubjectIds = new Set<number>();

    configPosts.forEach(post => {
      // Parse from designation_subject string (format: "designation_id-subject_id")
      if (post.designation_subject) {
        const parts = post.designation_subject.split('-');
        if (parts.length === 2) {
          const desigId = parseInt(parts[0]);
          const subjId = parseInt(parts[1]);
          if (!isNaN(desigId)) uniqueDesignationIds.add(desigId);
          if (!isNaN(subjId)) uniqueSubjectIds.add(subjId);
        }
      }
      
      // Also check individual columns as fallback (if designation_subject is empty)
      if (!post.designation_subject) {
        if (post.designation_id !== null) {
          uniqueDesignationIds.add(post.designation_id);
        }
        if (post.subject_id !== null) {
          uniqueSubjectIds.add(post.subject_id);
        }
      }
    });

    // Fetch designation details
    const designations = await prisma.master_designations.findMany({
      where: {
        id: { in: Array.from(uniqueDesignationIds) }
      },
      select: {
        id: true,
        name: true
      }
    });

    // Fetch subject details
    const subjects = await prisma.master_subjects.findMany({
      where: {
        id: { in: Array.from(uniqueSubjectIds) }
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
