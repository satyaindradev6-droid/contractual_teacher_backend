import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getSubjectsByKV = async (req: Request, res: Response) => {
  try {
    const kv_id = parseInt(req.params.kv_id);
    if (isNaN(kv_id)) {
      return res.status(400).json({ success: false, message: 'Invalid kv_id parameter' });
    }

    // Step 1: Get subject_ids from config table
    const configRecords = await prisma.config_designation_post.findMany({
      where: { kv_id, is_open: 1, subject_id: { not: null } },
      select: { subject_id: true }
    });

    const subjectIds = [...new Set(configRecords.map(r => r.subject_id as number))];

    if (subjectIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Step 2: Fetch subjects using those IDs
    const subjects = await prisma.master_subjects.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true, name: true }
    });

    return res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getKVPostData = async (req: Request, res: Response) => {
  try {
    const kv_id = parseInt(req.params.kv_id);
    if (isNaN(kv_id)) {
      return res.status(400).json({ success: false, message: 'Invalid kv_id parameter' });
    }

    const invitation = await prisma.config_app_invitation_date.findFirst({
      where: {
        kv_id,
        start_date: { lte: new Date() },
        end_date: { gte: new Date() }
      }
    });

    if (!invitation) {
      return res.status(200).json({ success: true, data: { designations: [], subjects: [] } });
    }

    // Get all open config records for this KV
    const configRecords = await prisma.config_designation_post.findMany({
      where: { kv_id, is_open: 1 },
      select: { designation_id: true, subject_id: true }
    });

    // Extract unique IDs
    const designationIds = [...new Set(configRecords.map(r => r.designation_id).filter(Boolean) as number[])];
    const subjectIds     = [...new Set(configRecords.map(r => r.subject_id).filter(Boolean) as number[])];

    // Fetch both in parallel
    const [designations, subjects] = await Promise.all([
      designationIds.length > 0
        ? prisma.master_designations.findMany({
            where: { id: { in: designationIds } },
            select: { id: true, name: true }
          })
        : [],
      subjectIds.length > 0
        ? prisma.master_subjects.findMany({
            where: { id: { in: subjectIds } },
            select: { id: true, name: true }
          })
        : []
    ]);

    return res.status(200).json({ success: true, data: { designations, subjects } });
  } catch (error) {
    console.error('Error fetching KV post data:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getSubjectsByDesignation = async (req: Request, res: Response) => {
  try {
    const kv_id = parseInt(req.params.kv_id);
    const designation_id = parseInt(req.params.designation_id); // from URL, not body

    if (isNaN(kv_id) || isNaN(designation_id)) {
      return res.status(400).json({ success: false, message: 'Invalid kv_id or designation_id parameter' });
    }

    // SELECT subject_id FROM config_designation_post WHERE designation_id = ? AND kv_id = ? AND is_open = 1
    const configRecords = await prisma.config_designation_post.findMany({
      where: {
        kv_id,
        designation_id,
        is_open: 1,
        subject_id: { not: null }
      },
      select: { subject_id: true }
    });

    const subjectIds = [...new Set(configRecords.map(r => r.subject_id as number))];

    if (subjectIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });  // return empty, not all subjects
    }

    const subjects = await prisma.master_subjects.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true, name: true }
    });

    return res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    console.error('Error fetching subjects by designation:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDesignationsByKV = async (req: Request, res: Response) => {
  try {
    const kv_id = parseInt(req.params.kv_id);
    if (isNaN(kv_id)) {
      return res.status(400).json({ success: false, message: 'Invalid kv_id parameter' });
    }

    // Check invitation date window first
    const currentDate = new Date();
    const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    const invitation = await prisma.config_app_invitation_date.findFirst({
      where: { kv_id }
    });

    if (!invitation || !invitation.start_date || !invitation.end_date) {
      return res.status(200).json({ success: true, data: [], message: 'No invitation configured for this KV' });
    }

    const startDateOnly = new Date(invitation.start_date.getFullYear(), invitation.start_date.getMonth(), invitation.start_date.getDate());
    const endDateOnly = new Date(invitation.end_date.getFullYear(), invitation.end_date.getMonth(), invitation.end_date.getDate());

    if (currentDateOnly < startDateOnly) {
      return res.status(200).json({ success: true, data: [], message: `Applications will open on ${invitation.start_date.toDateString()}` });
    }

    if (currentDateOnly > endDateOnly) {
      return res.status(200).json({ success: true, data: [], message: `Application deadline passed on ${invitation.end_date.toDateString()}` });
    }

    // Date is valid — now fetch designations
    const configRecords = await prisma.config_designation_post.findMany({
      where: { kv_id, is_open: 1, designation_id: { not: null } },
      select: { designation_id: true }
    });

    const designationIds = [...new Set(configRecords.map(r => r.designation_id as number))];

    if (designationIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const designations = await prisma.master_designations.findMany({
      where: { id: { in: designationIds } },
      select: { id: true, name: true }
    });

    return res.status(200).json({ success: true, data: designations });
  } catch (error) {
    console.error('Error fetching designations:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDesignationById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid id parameter' });
    }

    const designation = await prisma.master_designations.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!designation) {
      return res.status(404).json({ success: false, message: 'Designation not found' });
    }

    return res.status(200).json({ success: true, data: designation });
  } catch (error) {
    console.error('Error fetching designation by id:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getSubjectById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid id parameter' });
    }

    const subject = await prisma.master_subjects.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    return res.status(200).json({ success: true, data: subject });
  } catch (error) {
    console.error('Error fetching subject by id:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
