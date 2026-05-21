import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readCollection, addItem, writeCollection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request, { params }) {
   const authUser = getUserFromRequest(request);
   if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   const { id } = await params;
   if (authUser.id === id) {
      return NextResponse.json({ error: 'You cannot follow yourself' }, { status: 400 });
   }

   const follows = readCollection('follows');
   const existingIndex = follows.findIndex(
      f => f.followerId === authUser.id && f.followingId === id
   );

   if (existingIndex > -1) {
      follows.splice(existingIndex, 1);
      writeCollection('follows', follows);
      return NextResponse.json({ message: 'Unfollowed', isFollowing: false });
   } else {
      addItem('follows', {
         id: uuidv4(),
         followerId: authUser.id,
         followingId: id,
         createdAt: new Date().toISOString(),
      });
      return NextResponse.json({ message: 'Followed', isFollowing: true });
   }
}
