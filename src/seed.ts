import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from './payload.config'

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function seed() {
  console.log('Starting DB seed...')
  const payload = await getPayload({ config: configPromise })

  // Ensure an admin user exists
  const existingUsers = await payload.find({ collection: 'users', limit: 1 })
  let adminUserId = existingUsers.docs[0]?.id

  if (!adminUserId) {
    console.log('Creating admin user...')
    const user = await payload.create({
      collection: 'users',
      data: {
        email: 'admin@example.com',
        password: 'password',
        role: 'admin',
      },
    })
    adminUserId = user.id
  }

  // Helper to upload media
  async function uploadMedia(alt: string, url: string) {
    console.log(`Uploading media: ${alt}...`)
    const buffer = await fetchImageBuffer(url)
    const media = await payload.create({
      collection: 'media',
      data: { alt },
      file: {
        data: buffer,
        mimetype: 'image/jpeg',
        name: `${alt.replace(/\s+/g, '-').toLowerCase()}.jpg`,
        size: buffer.length,
      },
    })
    return media.id
  }

  // 1. Upload Images
  const faithImageId = await uploadMedia('Faith', 'https://images.unsplash.com/photo-1518602164578-cd0074062767?q=80&w=600&auto=format&fit=crop')
  const prayerImageId = await uploadMedia('Prayer', 'https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=600&auto=format&fit=crop')
  const studyImageId = await uploadMedia('Study', 'https://images.unsplash.com/photo-1455582916367-25f75bfc6710?q=80&w=600&auto=format&fit=crop')
  const testimoniesImageId = await uploadMedia('Testimonies', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=600&auto=format&fit=crop')
  const defaultPostImageId = await uploadMedia('Default Post Image', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop')

  // 2. Create Categories
  console.log('Creating categories...')
  const categories = [
    { name: 'Faith', featuredImage: faithImageId, description: 'Growing your trust in Him.' },
    { name: 'Prayer', featuredImage: prayerImageId, description: 'Communicating with God.' },
    { name: 'Study', featuredImage: studyImageId, description: 'Diving deep into the Word.' },
    { name: 'Testimonies', featuredImage: testimoniesImageId, description: 'Stories of grace.' },
  ]

  const categoryIds = []
  for (const cat of categories) {
    const existing = await payload.find({ collection: 'categories', where: { name: { equals: cat.name } } })
    if (existing.docs.length > 0) {
      // Update with image if it already exists
      const updated = await payload.update({
        collection: 'categories',
        id: existing.docs[0].id,
        data: { featuredImage: cat.featuredImage, description: cat.description },
      })
      categoryIds.push(updated.id)
    } else {
      const created = await payload.create({
        collection: 'categories',
        data: cat,
      })
      categoryIds.push(created.id)
    }
  }

  // 3. Create Posts
  console.log('Creating dummy posts...')
  const dummyContent = {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      children: [
        {
          type: "paragraph",
          format: "",
          indent: 0,
          version: 1,
          children: [
            {
              mode: "normal",
              text: "This is a dummy post seeded into the database. It represents a typical article that you might read in this beautiful blog.",
              type: "text",
              style: "",
              detail: 0,
              format: 0,
              version: 1
            }
          ]
        }
      ]
    }
  }

  for (let i = 1; i <= 20; i++) {
    const categoryId = categoryIds[i % categoryIds.length]
    await payload.create({
      collection: 'posts',
      data: {
        title: `Seeded Post Number ${i}`,
        status: 'published',
        author: adminUserId as any,
        category: categoryId as any,
        featuredImage: defaultPostImageId as any,
        excerpt: `This is the excerpt for seeded post ${i}. It gives a quick preview of what the article is about.`,
        content: dummyContent as any,
      },
    })
  }

  console.log('Seed complete!')
  process.exit(0)
}

seed().catch(console.error)
