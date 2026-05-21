import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getUserFromRequest } from '@/lib/auth';
import { readCollection, addItem, writeCollection } from '@/lib/db';

export async function POST(request, { params }) {
   const authUser = getUserFromRequest(request);
   if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   const { id } = await params;
   const likes = readCollection('likes');
   const existingIndex = likes.findIndex(l => l.postId === id && l.userId === authUser.id);

   if (existingIndex > -1) {
      likes.splice(existingIndex, 1);
      writeCollection('likes', likes);
      return NextResponse.json({ message: 'Unliked', isLiked: false, likesCount: likes.filter(l => l.postId === id).length });
   } else {
      addItem('likes', { id: uuidv4(), postId: id, userId: authUser.id, createdAt: new Date().toISOString() });
      const updated = readCollection('likes');
      return NextResponse.json({ message: 'Liked', isLiked: true, likesCount: updated.filter(l => l.postId === id).length });
   }
}
