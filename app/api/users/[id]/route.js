import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { findById, readCollection, addItem, writeCollection } from '@/lib/db';

export async function GET(request, { params }) {
   const { id } = await params;
   const user = findById('users', id);
   if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
   }

   const { password: _, otp: __, ...safeUser } = user;

   const follows = readCollection('follows');
   const posts = readCollection('posts');

   safeUser.followersCount = follows.filter(f => f.followingId === id).length;
   safeUser.followingCount = follows.filter(f => f.followerId === id).length;
   safeUser.postsCount = posts.filter(p => p.authorId === id && !p.isAnonymous).length;

   const authUser = getUserFromRequest(request);
   safeUser.isFollowing = authUser ? follows.some(f => f.followerId === authUser.id && f.followingId === id) : false;
   safeUser.isOwnProfile = authUser ? authUser.id === id : false;

   const userPosts = posts
      .filter(p => p.authorId === id && !p.isAnonymous)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

   return NextResponse.json({ user: safeUser, posts: userPosts });
}
