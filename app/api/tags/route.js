import { NextResponse } from 'next/server';
import { readCollection } from '@/lib/db';

export async function GET() {
   const posts = readCollection('posts');
   const tagCount = {};

   posts.forEach(post => {
      if (post.tags) {
         post.tags.forEach(tag => {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
         });
      }
   });

   const tags = Object.entries(tagCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

   return NextResponse.json({ tags });
}
