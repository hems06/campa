import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findByField } from '@/lib/db';
import { generateToken } from '@/lib/auth';

export async function POST(request) {
   try {
      const body = await request.json();
      const { email, password } = body;

      if (!email || !password) {
         return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const user = findByField('users', 'email', email);
      if (!user) {
         return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
         return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      if (!user.isVerified) {
         return NextResponse.json({ error: 'Please verify your email first', userId: user.id }, { status: 403 });
      }

      const token = generateToken(user);

      const { password: _, otp: __, ...safeUser } = user;

      return NextResponse.json({
         message: 'Login successful',
         token,
         user: safeUser,
      });
   } catch (error) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
   }
}
