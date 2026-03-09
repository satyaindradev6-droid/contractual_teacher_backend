import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getSchoolsByState = async (req: Request, res: Response) => {
  try {
    const { state_id } = req.body;

    if (!state_id) {
      return res.status(400).json({
        success: false,
        message: 'state_id is required'
      });
    }

    const schools = await prisma.master_schools_kvs.findMany({
      where: {
        state_id: state_id.toString(),
        status: '1'
      },
      orderBy: {
        school_name: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      data: schools
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schools',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getSchoolById = async (req: Request, res: Response) => {
  try {
    const { school_id } = req.params;

    if (!school_id) {
      return res.status(400).json({
        success: false,
        message: 'school_id is required'
      });
    }

    const school = await prisma.master_schools_kvs.findFirst({
      where: {
        school_id: school_id.toString()
      }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    res.status(200).json({
      success: true,
      data: school
    });
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch school',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

