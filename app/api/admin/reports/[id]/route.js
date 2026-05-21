import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { updateItem, deleteItem, findById } from '@/lib/db';

export async function PUT(request, { params }) {
   const authUser = getUserFromRequest(request);
   if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
   }

   const { id } = await params;
   const body = await request.json();
   const { action } = body; // 'dismiss' or 'remove_post'

   const report = findById('reports', id);
   if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
   }

   if (action === 'remove_post') {
      deleteItem('posts', report.postId);
      updateItem('reports', id, { status: 'resolved', resolvedAt: new Date().toISOString() });
      return NextResponse.json({ message: 'Post removed and report resolved' });
   } else {
      updateItem('reports', id, { status: 'dismissed', resolvedAt: new Date().toISOString() });
      return NextResponse.json({ message: 'Report dismissed' });
   }
}
