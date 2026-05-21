import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getUserFromRequest } from '@/lib/auth';
import { addItem, findById } from '@/lib/db';

export async function POST(request, { params }) {
   const authUser = getUserFromRequest(request);
   if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   const { id } = await params;
   const post = findById('posts', id);
   if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
   }

   const body = await request.json();
   const { reason } = body;

   const report = {
      id: uuidv4(),
      postId: id,
      reporterId: authUser.id,
      reason: reason || 'No reason provided',
      status: 'pending',
      createdAt: new Date().toISOString(),
   };

   addItem('reports', report);
   return NextResponse.json({ message: 'Post reported. Our team will review it.', report }, { status: 201 });
}
