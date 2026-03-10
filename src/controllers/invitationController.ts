import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const checkInvitationEligibility = async (req: Request, res: Response) => {
  try {
    const kv_id = parseInt(req.params.kv_id);

    if (isNaN(kv_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid kv_id parameter'
      });
    }

    // Get invitation configuration for the KV
    const invitationConfig = await prisma.config_app_invitation_date.findUnique({
      where: { kv_id },
      select: {
        id: true,
        ro_id: true,
        kv_id: true,
        start_date: true,
        end_date: true,
        created_at: true
      }
    });

    if (!invitationConfig) {
      return res.status(404).json({
        success: false,
        message: 'No invitation configuration found for this KV ID',
        data: {
          kv_id,
          eligible: false,
          reason: 'KV not configured for applications'
        }
      });
    }

    // Get school details
    const schoolDetails = await prisma.master_schools_kvs.findFirst({
      where: { 
        kv_id: kv_id.toString() 
      },
      select: {
        kv_id: true,
        kv_name: true,
        school_name: true,
        ro_name: true,
        state_name: true,
        status: true
      }
    });

    const currentDate = new Date();
    const startDate = invitationConfig.start_date;
    const endDate = invitationConfig.end_date;

    let eligible = false;
    let reason = '';
    let currentDateOnly, startDateOnly, endDateOnly;

    // Check eligibility based on dates (including today's date)
    if (!startDate || !endDate) {
      eligible = false;
      reason = 'Application dates not configured';
    } else {
      // Compare dates only (ignore time) to include the full end date
      currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      
      if (currentDateOnly < startDateOnly) {
        eligible = false;
        reason = `Applications will open on ${startDate.toDateString()}`;
      } else if (currentDateOnly > endDateOnly) {
        eligible = false;
        reason = `Application deadline passed on ${endDate.toDateString()}`;
      } else {
        eligible = true;
        reason = 'School is eligible for applications';
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        invitation_config: invitationConfig,
        school_details: schoolDetails,
        eligibility: {
          eligible,
          reason,
          current_date: currentDate.toISOString(),
          application_period: startDate && endDate ? {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            days_remaining: eligible && currentDateOnly && endDateOnly ? Math.max(0, Math.ceil((endDateOnly.getTime() - currentDateOnly.getTime()) / (1000 * 60 * 60 * 24))) : 0
          } : null
        }
      }
    });

  } catch (error) {
    console.error('Error checking invitation eligibility:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};