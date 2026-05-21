import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readCollection } from '@/lib/db';

export async function GET(request) {
   const { searchParams } = new URL(request.url);
   const query = searchParams.get('q') || '';

   if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
   }

   const users = readCollection('users');
   const q = query.toLowerCase();

   const results = users
      .filter(u => u.isVerified && (
         u.name.toLowerCase().includes(q) ||
         u.department.toLowerCase().includes(q) ||
         u.email.toLowerCase().includes(q)
      ))
      .slice(0, 20)
      .map(({ password, otp, ...safe }) => safe);

   return NextResponse.json({ users: results });
}
