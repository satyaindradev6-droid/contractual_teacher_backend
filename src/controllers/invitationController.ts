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

    // Check if any post is open for this KV
    const openPosts = await prisma.config_designation_post.findFirst({
      where: {
        kv_id,
        is_open: 1
      }
    });

    if (!openPosts) {
      return res.status(200).json({
        success: true,
        data: {
          invitation_config: invitationConfig,
          school_details: null,
          eligibility: {
            eligible: false,
            reason: 'No open posts available for this school'
          }
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


export const getActiveSchools = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    // Get all invitation configurations where end_date >= current_date
    const invitationConfigs = await prisma.config_app_invitation_date.findMany({
      where: {
        end_date: {
          gte: currentDateOnly
        }
      },
      select: {
        id: true,
        ro_id: true,
        kv_id: true,
        start_date: true,
        end_date: true,
        created_at: true
      }
    });

    if (invitationConfigs.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Get school details for all active invitations
    const kvIds = invitationConfigs.map(config => config.kv_id.toString());

    // Get KVs where posts are open
    const openPosts = await prisma.config_designation_post.findMany({
      where: {
        kv_id: {
          in: invitationConfigs.map(c => c.kv_id)
        },
        is_open: 1
      },
      select: {
        kv_id: true
      }
    });

    // Create a set of kv_ids with open posts
    const openPostKvIds = new Set(openPosts.map(post => post.kv_id));

    const schoolDetails = await prisma.master_schools_kvs.findMany({
      where: {
        kv_id: {
          in: kvIds
        }
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

    // Create a map for quick school lookup
    const schoolMap = new Map();
    schoolDetails.forEach(school => {
      schoolMap.set(school.kv_id, school);
    });

    // Process each invitation config with eligibility logic
    const activeSchools = invitationConfigs.map(config => {
      const school = schoolMap.get(config.kv_id.toString());

      const startDate = config.start_date;
      const endDate = config.end_date;

      let eligible = false;
      let reason = '';

      if (!openPostKvIds.has(config.kv_id)) {
        eligible = false;
        reason = 'No open posts available';
      } else if (!startDate || !endDate) {
        eligible = false;
        reason = 'Application dates not configured';
      } else {
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

        if (currentDateOnly < startDateOnly) {
          eligible = false;
          reason = `Application will start on ${startDate.toDateString()}`;
        } else if (currentDateOnly > endDateOnly) {
          eligible = false;
          reason = `Application deadline passed on ${endDate.toDateString()}`;
        } else {
          eligible = true;
          reason = 'Application open';
        }
      }

      const daysRemaining = eligible && endDate ?
        Math.max(0, Math.ceil((new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime() - currentDateOnly.getTime()) / (1000 * 60 * 60 * 24))) : 0;

      return {
        school_details: school || {
          kv_id: config.kv_id.toString(),
          kv_name: null,
          school_name: null,
          ro_name: null,
          state_name: null,
          status: null
        },
        eligibility: {
          eligible,
          reason,
          current_date: currentDate.toISOString(),
          application_period: {
            start_date: startDate ? startDate.toISOString() : null,
            end_date: endDate ? endDate.toISOString() : null,
            days_remaining: daysRemaining
          }
        }
      };
    });

    return res.status(200).json({
      success: true,
      data: activeSchools
    });

  } catch (error) {
    console.error('Error fetching active schools:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
