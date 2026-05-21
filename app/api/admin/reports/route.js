import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readCollection, updateItem } from '@/lib/db';

export async function GET(request) {
   const authUser = getUserFromRequest(request);
   if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
   }

   const reports = readCollection('reports');
   const posts = readCollection('posts');
   const users = readCollection('users');

   const enrichedReports = reports.map(r => {
      const post = posts.find(p => p.id === r.postId);
      const reporter = users.find(u => u.id === r.reporterId);
      return {
         ...r,
         post: post ? { id: post.id, content: post.content.substring(0, 100) } : null,
         reporter: reporter ? { id: reporter.id, name: reporter.name } : null,
      };
   }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

   return NextResponse.json({ reports: enrichedReports });
}
