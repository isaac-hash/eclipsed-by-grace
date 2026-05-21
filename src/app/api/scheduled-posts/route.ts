import { publishScheduledPosts } from '@/lib/payload-utils'

/**
 * Route handler for scheduled post publishing
 * Call this periodically (e.g., via a cron job or scheduled task)
 */
export async function GET() {
  try {
    const publishedCount = await publishScheduledPosts()

    return Response.json(
      {
        success: true,
        message: `Published ${publishedCount} scheduled posts`,
        count: publishedCount,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('[Scheduled Publishing Route] Error:', error)
    return Response.json(
      {
        success: false,
        error: 'Failed to publish scheduled posts',
      },
      { status: 500 },
    )
  }
}
