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
   const bookmarks = readCollection('bookmarks');
   const existingIndex = bookmarks.findIndex(b => b.postId === id && b.userId === authUser.id);

   if (existingIndex > -1) {
      bookmarks.splice(existingIndex, 1);
      writeCollection('bookmarks', bookmarks);
      return NextResponse.json({ message: 'Removed bookmark', isBookmarked: false });
   } else {
      addItem('bookmarks', { id: uuidv4(), postId: id, userId: authUser.id, createdAt: new Date().toISOString() });
      return NextResponse.json({ message: 'Bookmarked', isBookmarked: true });
   }
}
