import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Publish scheduled posts that have reached their scheduled publish time
 */
export async function publishScheduledPosts() {
  try {
    const payload = await getPayload({ config })

    // Find posts that are scheduled and have reached their publish time
    const now = new Date().toISOString()
    const scheduledPosts = await payload.find({
      collection: 'posts',
      where: {
        and: [
          { status: { equals: 'draft' } },
          { scheduledPublishAt: { less_than_equal: now } },
        ],
      },
    })

    console.log(
      `[Scheduled Publishing] Found ${scheduledPosts.docs.length} posts to publish`,
    )

    // Update each scheduled post to published
    for (const post of scheduledPosts.docs) {
      await payload.update({
        collection: 'posts',
        id: post.id,
        data: {
          status: 'published',
          publishedAt: post.scheduledPublishAt || now,
        },
      })

      console.log(`[Scheduled Publishing] Published: ${post.title}`)
    }

    return scheduledPosts.docs.length
  } catch (error) {
    console.error('[Scheduled Publishing] Error:', error)
    throw error
  }
}

/**
 * Fetch posts with filtering and search
 */
export async function fetchPosts(
  options: {
    status?: 'draft' | 'published'
    category?: string
    search?: string
    limit?: number
    page?: number
    sort?: string
  } = {},
) {
  const payload = await getPayload({ config })

  let where: any = {}

  if (options.status) {
    where.status = { equals: options.status }
  }

  if (options.category) {
    where.category = { equals: options.category }
  }

  if (options.search) {
    where.or = [
      { title: { contains: options.search } },
      { excerpt: { contains: options.search } },
      { 'seo.keywords': { contains: options.search } },
    ]
  }

  // Ensure only published posts are fetched for public queries
  if (!options.status && options.status !== 'draft') {
    where.status = { equals: 'published' }
  }

  return payload.find({
    collection: 'posts',
    where,
    limit: options.limit || 10,
    page: options.page || 1,
    sort: options.sort || '-publishedAt',
  })
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(slug: string) {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
  })

  return result.docs[0] || null
}

/**
 * Get comments for a post
 */
export async function getPostComments(postId: string, onlyApproved = true) {
  const payload = await getPayload({ config })

  let where: any = { post: { equals: postId } }

  if (onlyApproved) {
    where.approved = { equals: true }
  }

  return payload.find({
    collection: 'comments',
    where,
    sort: '-createdAt',
  })
}

/**
 * Create a new comment
 */
export async function createComment(data: {
  post: string
  author: string
  email: string
  content: string
}) {
  const payload = await getPayload({ config })

  return payload.create({
    collection: 'comments',
    data: {
      ...data,
      approved: false, // Comments require moderation by default
    },
  })
}
