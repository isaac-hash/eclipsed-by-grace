import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ posts: [] })
  }

  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    where: {
      and: [
        {
          status: {
            equals: 'published',
          },
        },
        {
          or: [
            {
              title: {
                like: query,
              },
            },
            {
              excerpt: {
                like: query,
              },
            },
            {
              content: {
                like: query,
              },
            },
            {
              category: {
                equals: query,
              },
            },
          ],
        },
      ],
    },
    limit: 10,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
    },
  })

  return NextResponse.json({ posts: posts.docs })
}
