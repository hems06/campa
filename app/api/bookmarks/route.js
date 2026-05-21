import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readCollection } from '@/lib/db';

export async function GET(request) {
   const authUser = getUserFromRequest(request);
   if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   const bookmarks = readCollection('bookmarks');
   const posts = readCollection('posts');
   const users = readCollection('users');
   const likes = readCollection('likes');
   const comments = readCollection('comments');

   const userBookmarks = bookmarks.filter(b => b.userId === authUser.id);
   const bookmarkedPosts = userBookmarks
      .map(b => {
         const post = posts.find(p => p.id === b.postId);
         if (!post) return null;
         const author = !post.isAnonymous ? users.find(u => u.id === post.authorId) : null;
         const postLikes = likes.filter(l => l.postId === post.id);
         const postComments = comments.filter(c => c.postId === post.id);
         return {
            ...post,
            author: post.isAnonymous
               ? { name: 'Anonymous', avatar: '', department: '' }
               : author ? { id: author.id, name: author.name, avatar: author.avatar, department: author.department } : null,
            likesCount: postLikes.length,
            commentsCount: postComments.length,
            isLiked: postLikes.some(l => l.userId === authUser.id),
            isBookmarked: true,
         };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

   return NextResponse.json({ posts: bookmarkedPosts });
}
