import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    // Demo / mock authentication response for rapid development and testing
    const demoPayload = {
      userId: 'usr-' + Date.now(),
      email,
      role: (role ? role.toUpperCase() : 'STUDENT') as any,
      tenantId: 'tenant-apex-academy',
      firstName: email.split('@')[0],
      lastName: 'User',
    };

    const token = jwt.sign(demoPayload, config.jwtSecret, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: demoPayload,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const registerStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, gradeLevel, studentIdNo } = req.body;

    if (!email || !password || !firstName) {
      res.status(400).json({ success: false, message: 'Missing required student registration fields' });
      return;
    }

    const newUser = {
      userId: 'stu-' + Date.now(),
      email,
      role: 'STUDENT',
      firstName,
      lastName: lastName || '',
      gradeLevel: gradeLevel || 'Grade 10',
      studentIdNo: studentIdNo || 'STU-' + Math.floor(1000 + Math.random() * 9000),
      tenantId: 'tenant-apex-academy',
    };

    const token = jwt.sign(newUser, config.jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      token,
      user: newUser,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const registerTutor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, specialization, employeeNo } = req.body;

    if (!email || !password || !firstName) {
      res.status(400).json({ success: false, message: 'Missing required tutor registration fields' });
      return;
    }

    const newUser = {
      userId: 'tut-' + Date.now(),
      email,
      role: 'TEACHER',
      firstName,
      lastName: lastName || '',
      specialization: specialization || 'Computer Science',
      employeeNo: employeeNo || 'FAC-' + Math.floor(1000 + Math.random() * 9000),
      tenantId: 'tenant-apex-academy',
    };

    const token = jwt.sign(newUser, config.jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Tutor registered successfully',
      token,
      user: newUser,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const registerParent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, phoneNumber, childStudentId } = req.body;

    if (!email || !password || !firstName) {
      res.status(400).json({ success: false, message: 'Missing required parent registration fields' });
      return;
    }

    const newUser = {
      userId: 'par-' + Date.now(),
      email,
      role: 'PARENT',
      firstName,
      lastName: lastName || '',
      phoneNumber: phoneNumber || '',
      childStudentId: childStudentId || '',
      tenantId: 'tenant-apex-academy',
    };

    const token = jwt.sign(newUser, config.jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Parent registered successfully',
      token,
      user: newUser,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
