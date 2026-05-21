import { NextResponse } from 'next/server';
import { findById, updateItem } from '@/lib/db';
import { generateToken } from '@/lib/auth';

export async function POST(request) {
   try {
      const body = await request.json();
      const { userId, otp } = body;

      if (!userId || !otp) {
         return NextResponse.json({ error: 'User ID and OTP are required' }, { status: 400 });
      }

      const user = findById('users', userId);
      if (!user) {
         return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (user.isVerified) {
         return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
      }

      if (user.otp !== otp) {
         return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
      }

      updateItem('users', userId, { isVerified: true, otp: null });

      const token = generateToken(user);
      const { password: _, otp: __, ...safeUser } = user;

      return NextResponse.json({
         message: 'Email verified successfully!',
         token,
         user: { ...safeUser, isVerified: true },
      });
   } catch (error) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
   }
}
