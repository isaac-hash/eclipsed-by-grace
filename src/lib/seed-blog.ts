import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Seed the database with sample blog data
 * Run this from the test setup or manually
 */
export async function seedBlogData() {
  const payload = await getPayload({ config })

  // Check if we already have posts
  const existingPosts = await payload.find({
    collection: 'posts',
  })

  if (existingPosts.totalDocs > 0) {
    console.log('Blog data already seeded, skipping...')
    return
  }

  try {
    // Get or create admin user
    const users = await payload.find({
      collection: 'users',
    })

    let adminUser = users.docs.find((u) => u.role === 'admin')

    if (!adminUser) {
      adminUser = await payload.create({
        collection: 'users',
        data: {
          email: 'admin@blog.com',
          password: 'testadmin123',
          role: 'admin',
        },
      })
    }

    // Create categories
    const categoryRefs: Record<string, string> = {}

    const techCategory = await payload.create({
      collection: 'categories',
      data: {
        name: 'Technology',
        slug: 'technology',
        description: 'Articles about technology and programming',
      },
    })
    categoryRefs['technology'] = techCategory.id

    const designCategory = await payload.create({
      collection: 'categories',
      data: {
        name: 'Design',
        slug: 'design',
        description: 'Articles about design and UX',
      },
    })
    categoryRefs['design'] = designCategory.id

    // Create sample posts
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const post1 = await payload.create({
      collection: 'posts',
      draft: false,
      data: {
        title: 'Getting Started with Payload CMS',
        slug: 'getting-started-payload-cms',
        excerpt:
          'Learn how to build a powerful blog with Payload CMS and Next.js',
        content: {
          root: {
            type: 'root',
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr',
            children: [
              {
                children: [
                  {
                    text: 'Introduction',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'heading',
                version: 1,
                tag: 'h2',
              },
              {
                children: [
                  {
                    text: 'Payload CMS is a headless CMS that makes it easy to build custom applications with a modern tech stack.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
          },
        },
        author: adminUser.id,
        category: categoryRefs['technology'],
        status: 'published',
        publishedAt: '2026-05-10T00:00:00Z',
        tags: [{ tag: 'payload' }, { tag: 'cms' }, { tag: 'nextjs' }],
        seo: {
          title: 'Getting Started with Payload CMS - Blog',
          description: 'Learn how to build a blog with Payload CMS and Next.js',
          keywords: 'payload, cms, nextjs, headless',
        },
      },
    })

    const post2 = await payload.create({
      collection: 'posts',
      draft: false,
      data: {
        title: 'Advanced SEO Techniques for Modern Websites',
        slug: 'advanced-seo-techniques',
        excerpt:
          'Master SEO optimization strategies for better search engine rankings',
        content: {
          root: {
            type: 'root',
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr',
            children: [
              {
                children: [
                  {
                    text: 'SEO Optimization',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'heading',
                version: 1,
                tag: 'h2',
              },
              {
                children: [
                  {
                    text: 'Search engine optimization is crucial for website visibility.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
          },
        },
        author: adminUser.id,
        category: categoryRefs['design'],
        status: 'published',
        publishedAt: '2026-05-12T00:00:00Z',
        tags: [{ tag: 'seo' }, { tag: 'optimization' }],
        seo: {
          title: 'Advanced SEO Techniques - Blog',
          description: 'Learn advanced SEO optimization strategies',
          keywords: 'seo, optimization, search engines',
        },
      },
    })

    // Create a scheduled post
    const scheduledPost = await payload.create({
      collection: 'posts',
      draft: true,
      data: {
        title: 'Upcoming: The Future of Web Development',
        slug: 'future-web-development',
        excerpt: 'Exploring trends and technologies shaping the future',
        content: {
          root: {
            type: 'root',
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr',
            children: [
              {
                children: [
                  {
                    text: 'Coming Soon',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'heading',
                version: 1,
                tag: 'h2',
              },
              {
                children: [
                  {
                    text: 'This post will be automatically published tomorrow.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
          },
        },
        author: adminUser.id,
        category: categoryRefs['technology'],
        status: 'draft',
        scheduledPublishAt: tomorrow.toISOString(),
        tags: [{ tag: 'future' }, { tag: 'web' }],
      },
    })

    console.log('✅ Blog data seeded successfully!')
    console.log(`Created admin user: admin@blog.com (password: testadmin123)`)
    console.log(`Created ${Object.keys(categoryRefs).length} categories`)
    console.log(`Created 3 sample posts (1 scheduled for tomorrow)`)

    return {
      adminUser,
      categories: categoryRefs,
      posts: [post1, post2, scheduledPost],
    }
  } catch (error) {
    console.error('Error seeding blog data:', error)
    throw error
  }
}
