import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
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
        userId: user.id.toString(), 
        mobile_no: user.mobile_no 
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token
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

    const user = await prisma.applications.findUnique({
      where: { id: BigInt(userId) },
      select: {
        id: true,
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
        status: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      id: user.id.toString(),
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
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at
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
      alternative_no
    } = req.body;

    // Check if user exists
    const existingUser = await prisma.applications.findUnique({
      where: { id: BigInt(userId) }
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
          id: { not: BigInt(userId) }
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

    console.log('Update data:', updateData);

    // Update user
    const updatedUser = await prisma.applications.update({
      where: { id: BigInt(userId) },
      data: updateData,
      select: {
        id: true,
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
        status: true,
        updated_at: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id.toString(),
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
