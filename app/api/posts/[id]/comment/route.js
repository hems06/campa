import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getUserFromRequest } from '@/lib/auth';
import { readCollection, addItem } from '@/lib/db';

export async function GET(request, { params }) {
   const { id } = await params;
   const comments = readCollection('comments');
   const users = readCollection('users');

   const postComments = comments
      .filter(c => c.postId === id)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(c => {
         const author = c.isAnonymous ? null : users.find(u => u.id === c.authorId);
         return {
            ...c,
            author: c.isAnonymous
               ? { name: 'Anonymous', avatar: '' }
               : author ? { id: author.id, name: author.name, avatar: author.avatar } : null,
         };
      });

   return NextResponse.json({ comments: postComments });
}

export async function POST(request, { params }) {
   const authUser = getUserFromRequest(request);
   if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   const { id } = await params;
   const body = await request.json();
   const { content, isAnonymous } = body;

   if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
   }

   const comment = {
      id: uuidv4(),
      postId: id,
      authorId: authUser.id,
      content: content.trim(),
      isAnonymous: isAnonymous || false,
      createdAt: new Date().toISOString(),
   };

   addItem('comments', comment);

   const users = readCollection('users');
   const author = comment.isAnonymous ? null : users.find(u => u.id === authUser.id);

   return NextResponse.json({
      comment: {
         ...comment,
         author: comment.isAnonymous
            ? { name: 'Anonymous', avatar: '' }
            : author ? { id: author.id, name: author.name, avatar: author.avatar } : null,
      },
      message: 'Comment added!',
   }, { status: 201 });
}
