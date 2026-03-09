import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register User
export const register = async (req: Request, res: Response) => {
  try {
    const { first_name, middle_name, last_name, date_of_birth, mobile_no, email, password } = req.body;

    // Validate required fields
    if (!first_name || !date_of_birth || !mobile_no || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'First name, date of birth, mobile number, email, and password are required' 
      });
    }

    // Check if mobile_no already exists
    const existingMobile = await prisma.applications.findFirst({
      where: { mobile_no }
    });

    if (existingMobile) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mobile number already exists' 
      });
    }

    // Check if email already exists
    const existingEmail = await prisma.applications.findFirst({
      where: { email }
    });

    if (existingEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await prisma.applications.create({
      data: {
        first_name,
        middle_name: middle_name || null,
        last_name: last_name || null,
        date_of_birth: new Date(date_of_birth),
        mobile_no,
        email,
        password: hashedPassword,
        gender: 1,
        category: 1,
        marital_status: 1,
        contact_address: '',
        city: '',
        state: '',
        district: '',
        status: 1
      }
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed' 
    });
  }
};

// Login User
export const login = async (req: Request, res: Response) => {
  try {
    const { mobile_no, password } = req.body;

    // Validate required fields
    if (!mobile_no || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mobile number and password are required' 
      });
    }

    // Find user using mobile_no
    const user = await prisma.applications.findFirst({
      where: { mobile_no }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }

    // Generate JWT token with 1 day expiry
    const token = jwt.sign(
      { 
        userId: user.application_id.toString(), 
        mobile_no: user.mobile_no 
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token,
      application_id: user.application_id.toString()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    });
  }
};

// Get User Profile (Protected)
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    console.log('Getting profile for userId:', userId);

    const user = await prisma.applications.findUnique({
      where: { application_id: BigInt(userId) },
      select: {
        application_id: true,
        first_name: true,
        middle_name: true,
        last_name: true,
        date_of_birth: true,
        gender: true,
        pan_no: true,
        aadhar_no: true,
        category: true,
        marital_status: true,
        contact_address: true,
        city: true,
        state: true,
        district: true,
        phone_std: true,
        mobile_no: true,
        email: true,
        alternative_no: true,
        know_hindi_english: true,
        know_computer: true,
        know_religional_language: true,
        religional_language_name: true,
        status: true,
        created_at: true,
        updated_at: true,
        academic_detail: {
          where: { status: 1 },
          orderBy: { year_of_passing: 'desc' }
        },
        experience_detail: {
          where: { status: 1 },
          orderBy: { start_date: 'desc' }
        },
        school_and_post_choice: {
          where: { status: 1 }
        },
        upload_document: {
          where: { status: 1 }
        },
        application_tracker: {
          where: { status: 1 }
        }
      }
    });

    if (!user) {
      console.log('User not found for userId:', userId);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('User found, returning profile data');
    res.json({
      success: true,
      data: {
        application_id: user.application_id.toString(),
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        date_of_birth: user.date_of_birth.toISOString().split('T')[0],
        gender: user.gender,
        pan_no: user.pan_no,
        aadhar_no: user.aadhar_no,
        category: user.category,
        marital_status: user.marital_status,
        contact_address: user.contact_address,
        city: user.city,
        state: user.state,
        district: user.district,
        phone_std: user.phone_std,
        mobile_no: user.mobile_no,
        email: user.email,
        alternative_no: user.alternative_no,
        know_hindi_english: user.know_hindi_english,
        know_computer: user.know_computer,
        know_religional_language: user.know_religional_language,
        religional_language_name: user.religional_language_name,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at,
        academic_details: user.academic_detail.map(academic => ({
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
        })),
        experience_details: user.experience_detail.map(exp => ({
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
        })),
        school_post_choices: user.school_and_post_choice.map(choice => ({
          id: choice.id.toString(),
          application_id: choice.application_id.toString(),
          school_id: choice.school_id,
          kv_id: choice.kv_id,
          post1: choice.post1,
          post2: choice.post2,
          post3: choice.post3,
          choice1: choice.choice1,
          choice2: choice.choice2,
          choice3: choice.choice3,
          status: choice.status,
          created_at: choice.created_at,
          updated_at: choice.updated_at
        })),
        upload_documents: user.upload_document.map(doc => ({
          id: doc.id.toString(),
          application_id: doc.application_id.toString(),
          photo: doc.photo,
          pan_card: doc.pan_card,
          aadhar_card: doc.aadhar_card,
          marksheet1: doc.marksheet1,
          marksheet2: doc.marksheet2,
          marksheet3: doc.marksheet3,
          marksheet4: doc.marksheet4,
          marksheet5: doc.marksheet5,
          degree1: doc.degree1,
          degree2: doc.degree2,
          degree3: doc.degree3,
          degree4: doc.degree4,
          degree5: doc.degree5,
          status: doc.status,
          created_at: doc.created_at,
          updated_at: doc.updated_at
        })),
        application_trackers: user.application_tracker.map(tracker => ({
          id: tracker.id.toString(),
          application_id: tracker.application_id.toString(),
          basic_information: tracker.basic_information,
          school_preference_posting: tracker.school_preference_posting,
          academic_qualification: tracker.academic_qualification,
          professional_qualification: tracker.professional_qualification,
          experience: tracker.experience,
          upload_documents: tracker.upload_documents,
          preview: tracker.preview,
          declaration_submission: tracker.declaration_submission,
          current_step: tracker.current_step,
          status: tracker.status,
          created_at: tracker.created_at,
          updated_at: tracker.updated_at
        }))
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user profile' 
    });
  }
};

// Update User Profile (Protected)
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    console.log('Update request - userId:', userId);
    console.log('Update request - body:', req.body);
    
    const {
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      gender,
      pan_no,
      aadhar_no,
      category,
      marital_status,
      contact_address,
      city,
      state,
      district,
      phone_std,
      email,
      alternative_no,
      know_hindi_english,
      know_computer,
      know_religional_language,
      religional_language_name,
      status
    } = req.body;

    // Check if user exists
    const existingUser = await prisma.applications.findUnique({
      where: { application_id: BigInt(userId) }
    });

    if (!existingUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // If email is being updated, check if it's already taken by another user
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.applications.findFirst({
        where: { 
          email,
          application_id: { not: BigInt(userId) }
        }
      });

      if (emailExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already exists' 
        });
      }
    }

    // Build update data object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (first_name !== undefined && first_name !== null) updateData.first_name = first_name;
    if (middle_name !== undefined) updateData.middle_name = middle_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (date_of_birth !== undefined && date_of_birth !== null) updateData.date_of_birth = new Date(date_of_birth);
    if (gender !== undefined && gender !== null) updateData.gender = gender;
    if (pan_no !== undefined) updateData.pan_no = pan_no;
    if (aadhar_no !== undefined) updateData.aadhar_no = aadhar_no;
    if (category !== undefined && category !== null) updateData.category = category;
    if (marital_status !== undefined && marital_status !== null) updateData.marital_status = marital_status;
    if (contact_address !== undefined && contact_address !== null) updateData.contact_address = contact_address;
    if (city !== undefined && city !== null) updateData.city = city;
    if (state !== undefined && state !== null) updateData.state = state;
    if (district !== undefined && district !== null) updateData.district = district;
    if (phone_std !== undefined) updateData.phone_std = phone_std;
    if (email !== undefined && email !== null) updateData.email = email;
    if (alternative_no !== undefined) updateData.alternative_no = alternative_no;
    if (know_hindi_english !== undefined) updateData.know_hindi_english = know_hindi_english;
    if (know_computer !== undefined) updateData.know_computer = know_computer;
    if (know_religional_language !== undefined) updateData.know_religional_language = know_religional_language;
    if (religional_language_name !== undefined) updateData.religional_language_name = religional_language_name;
    if (status !== undefined && status !== null) updateData.status = status;

    console.log('Update data:', updateData);

    // Update user
    const updatedUser = await prisma.applications.update({
      where: { application_id: BigInt(userId) },
      data: updateData,
      select: {
        application_id: true,
        first_name: true,
        middle_name: true,
        last_name: true,
        date_of_birth: true,
        gender: true,
        pan_no: true,
        aadhar_no: true,
        category: true,
        marital_status: true,
        contact_address: true,
        city: true,
        state: true,
        district: true,
        phone_std: true,
        mobile_no: true,
        email: true,
        alternative_no: true,
        know_hindi_english: true,
        know_computer: true,
        know_religional_language: true,
        religional_language_name: true,
        status: true,
        updated_at: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        application_id: updatedUser.application_id.toString(),
        first_name: updatedUser.first_name,
        middle_name: updatedUser.middle_name,
        last_name: updatedUser.last_name,
        date_of_birth: updatedUser.date_of_birth.toISOString().split('T')[0],
        gender: updatedUser.gender,
        pan_no: updatedUser.pan_no,
        aadhar_no: updatedUser.aadhar_no,
        category: updatedUser.category,
        marital_status: updatedUser.marital_status,
        contact_address: updatedUser.contact_address,
        city: updatedUser.city,
        state: updatedUser.state,
        district: updatedUser.district,
        phone_std: updatedUser.phone_std,
        mobile_no: updatedUser.mobile_no,
        email: updatedUser.email,
        alternative_no: updatedUser.alternative_no,
        know_hindi_english: updatedUser.know_hindi_english,
        know_computer: updatedUser.know_computer,
        know_religional_language: updatedUser.know_religional_language,
        religional_language_name: updatedUser.religional_language_name,
        status: updatedUser.status,
        updated_at: updatedUser.updated_at
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user profile' 
    });
  }
};
