import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { findById, updateItem, readCollection } from '@/lib/db';

export async function GET(request) {
   const authUser = getUserFromRequest(request);
   if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   const user = findById('users', authUser.id);
   if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
   }

   const { password: _, otp: __, ...safeUser } = user;

   const follows = readCollection('follows');
   safeUser.followersCount = follows.filter(f => f.followingId === user.id).length;
   safeUser.followingCount = follows.filter(f => f.followerId === user.id).length;

   const posts = readCollection('posts');
   safeUser.postsCount = posts.filter(p => p.authorId === user.id).length;

   return NextResponse.json({ user: safeUser });
}

export async function PUT(request) {
   const authUser = getUserFromRequest(request);
   if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   const body = await request.json();
   const { name, bio, department, year, skills, interests, avatar } = body;

   const updates = {};
   if (name !== undefined) updates.name = name;
   if (bio !== undefined) updates.bio = bio;
   if (department !== undefined) updates.department = department;
   if (year !== undefined) updates.year = year;
   if (skills !== undefined) updates.skills = skills;
   if (interests !== undefined) updates.interests = interests;
   if (avatar !== undefined) updates.avatar = avatar;

   const updated = updateItem('users', authUser.id, updates);
   if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
   }

   const { password: _, otp: __, ...safeUser } = updated;
   return NextResponse.json({ user: safeUser });
}
