import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getUserFromRequest } from '@/lib/auth';
import { readCollection, addItem, findById } from '@/lib/db';

export async function GET(request) {
   const { searchParams } = new URL(request.url);
   const filter = searchParams.get('filter') || 'latest';
   const tag = searchParams.get('tag') || '';
   const page = parseInt(searchParams.get('page') || '1');
   const limit = parseInt(searchParams.get('limit') || '20');

   let posts = readCollection('posts');
   const likes = readCollection('likes');
   const comments = readCollection('comments');
   const bookmarks = readCollection('bookmarks');
   const users = readCollection('users');

   const authUser = getUserFromRequest(request);

   // Filter by tag
   if (tag) {
      posts = posts.filter(p => p.tags && p.tags.includes(tag));
   }

   // Enrich posts
   posts = posts.map(post => {
      const author = !post.isAnonymous ? users.find(u => u.id === post.authorId) : null;
      const postLikes = likes.filter(l => l.postId === post.id);
      const postComments = comments.filter(c => c.postId === post.id);
      const isLiked = authUser ? postLikes.some(l => l.userId === authUser.id) : false;
      const isBookmarked = authUser ? bookmarks.some(b => b.postId === post.id && b.userId === authUser.id) : false;

      return {
         ...post,
         author: post.isAnonymous
            ? { name: 'Anonymous', avatar: '', department: '' }
            : author ? { id: author.id, name: author.name, avatar: author.avatar, department: author.department, year: author.year } : null,
         likesCount: postLikes.length,
         commentsCount: postComments.length,
         isLiked,
         isBookmarked,
      };
   });

   // Sort
   if (filter === 'trending') {
      posts.sort((a, b) => (b.likesCount + b.commentsCount * 2) - (a.likesCount + a.commentsCount * 2));
   } else {
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
   }

   // Paginate
   const total = posts.length;
   const start = (page - 1) * limit;
   posts = posts.slice(start, start + limit);

   return NextResponse.json({ posts, total, page, limit });
}

export async function POST(request) {
   const authUser = getUserFromRequest(request);
   if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   try {
      const body = await request.json();
      const { content, image, tags, isAnonymous } = body;

      if (!content || content.trim().length === 0) {
         return NextResponse.json({ error: 'Post content is required' }, { status: 400 });
      }

      const post = {
         id: uuidv4(),
         authorId: authUser.id,
         content: content.trim(),
         image: image || '',
         tags: tags || [],
         isAnonymous: isAnonymous || false,
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
      };

      addItem('posts', post);

      return NextResponse.json({ post, message: 'Post created!' }, { status: 201 });
   } catch (error) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
   }
}
