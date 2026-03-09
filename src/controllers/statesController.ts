import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getStates = async (req: Request, res: Response) => {
  try {
    const states = await prisma.master_states.findMany({
      where: {
        is_active: '1'
      },
      orderBy: {
        state_name: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      data: states
    });
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch states',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getStateById = async (req: Request, res: Response) => {
  try {
    const { state_id } = req.params;

    if (!state_id) {
      return res.status(400).json({
        success: false,
        message: 'state_id is required'
      });
    }

    const state = await prisma.master_states.findUnique({
      where: {
        state_id: parseInt(state_id)
      }
    });

    if (!state) {
      return res.status(404).json({
        success: false,
        message: 'State not found'
      });
    }

    res.status(200).json({
      success: true,
      data: state
    });
  } catch (error) {
    console.error('Error fetching state:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch state',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

