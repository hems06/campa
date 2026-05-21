import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { isCollegeEmail, generateOTP } from '@/lib/auth';
import { findByField, addItem } from '@/lib/db';

export async function POST(request) {
   try {
      const body = await request.json();
      const { email, password, name, department, year } = body;

      if (!email || !password || !name) {
         return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
      }

      if (!isCollegeEmail(email)) {
         return NextResponse.json({ error: 'Only college email addresses (@ksrce.ac.in) are allowed' }, { status: 400 });
      }

      const existingUser = findByField('users', 'email', email);
      if (existingUser) {
         return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = generateOTP();

      const user = {
         id: uuidv4(),
         email,
         password: hashedPassword,
         name,
         department: department || '',
         year: year || '',
         bio: '',
         avatar: '',
         skills: [],
         interests: [],
         role: 'student',
         isVerified: false,
         otp,
         createdAt: new Date().toISOString(),
      };

      addItem('users', user);

      // In production, send OTP via email. For now, return it for testing.
      return NextResponse.json({
         message: 'Registration successful! Please verify your email.',
         userId: user.id,
         otp: otp, // Remove in production
      }, { status: 201 });
   } catch (error) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
   }
}
