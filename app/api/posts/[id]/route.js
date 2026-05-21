import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { findById, updateItem, deleteItem, readCollection } from '@/lib/db';

export async function GET(request, { params }) {
   const { id } = await params;
   const post = findById('posts', id);
   if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
   }

   const users = readCollection('users');
   const likes = readCollection('likes');
   const comments = readCollection('comments');
   const bookmarks = readCollection('bookmarks');
   const authUser = getUserFromRequest(request);

   const author = !post.isAnonymous ? users.find(u => u.id === post.authorId) : null;
   const postLikes = likes.filter(l => l.postId === id);
   const postComments = comments
      .filter(c => c.postId === id)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(c => {
         const commentAuthor = c.isAnonymous ? null : users.find(u => u.id === c.authorId);
         return {
            ...c,
            author: c.isAnonymous
               ? { name: 'Anonymous', avatar: '' }
               : commentAuthor ? { id: commentAuthor.id, name: commentAuthor.name, avatar: commentAuthor.avatar } : null,
         };
      });

   const enrichedPost = {
      ...post,
      author: post.isAnonymous
         ? { name: 'Anonymous', avatar: '', department: '' }
         : author ? { id: author.id, name: author.name, avatar: author.avatar, department: author.department, year: author.year } : null,
      likesCount: postLikes.length,
      commentsCount: postComments.length,
      comments: postComments,
      isLiked: authUser ? postLikes.some(l => l.userId === authUser.id) : false,
      isBookmarked: authUser ? bookmarks.some(b => b.postId === id && b.userId === authUser.id) : false,
      isOwner: authUser ? authUser.id === post.authorId : false,
   };

   return NextResponse.json({ post: enrichedPost });
}

export async function PUT(request, { params }) {
   const authUser = getUserFromRequest(request);
   if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   const { id } = await params;
   const post = findById('posts', id);
   if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
   }

   if (post.authorId !== authUser.id) {
      return NextResponse.json({ error: 'Not authorized to edit this post' }, { status: 403 });
   }

   const body = await request.json();
   const { content, tags } = body;
   const updates = { updatedAt: new Date().toISOString() };
   if (content !== undefined) updates.content = content;
   if (tags !== undefined) updates.tags = tags;

   const updated = updateItem('posts', id, updates);
   return NextResponse.json({ post: updated });
}

export async function DELETE(request, { params }) {
   const authUser = getUserFromRequest(request);
   if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   const { id } = await params;
   const post = findById('posts', id);
   if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
   }

   if (post.authorId !== authUser.id && authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized to delete this post' }, { status: 403 });
   }

   deleteItem('posts', id);
   return NextResponse.json({ message: 'Post deleted' });
}
