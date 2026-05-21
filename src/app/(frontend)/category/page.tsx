import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import '../styles.css' // Import global styles for category classes
import { getPayload } from 'payload'
import payloadConfig from '../../../payload.config'
import { headers } from 'next/headers'
const payload = await getPayload({ config: payloadConfig })

export const metadata = {
  title: 'Devotionals | Eclipsed By Grace',
  description: 'Explore our devotional categories.',
}

// Fetch dynamic categories
const categoriesRes = await payload.find({
  collection: 'categories',
  // limit: 4,
  depth: 1,
})
// Count posts for each category
const categoriesWithCount = await Promise.all(
  categoriesRes.docs.map(async (cat) => {
    const postsRes = await payload.count({
      collection: 'posts',
      where: {
        category: {
          equals: cat.id,
        },
        status: {
          equals: 'published',
        },
      },
    })
    return {
      ...cat,
      postCount: postsRes.totalDocs,
    }
  }),
)

export default function CategoryIndexPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">Devotional Categories</h1>
      <div className="page-content" style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <p>
          Choose a topic to explore daily readings, scripture studies, and encouraging testimonies.
        </p>
      </div>

      <div
        className="categories-grid"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}
      >
        {categoriesWithCount.map((cat) => {
          const imageUrl =
            typeof cat.featuredImage === 'object' && cat.featuredImage?.url
              ? cat.featuredImage.url
              : 'https://images.unsplash.com/photo-1518602164578-cd0074062767?q=80&w=200&auto=format&fit=crop'
          return (
            <Link key={cat.id} href={`/category/${cat.slug}`} className="category-card">
              <div className="category-thumb">
                <Image
                  src={imageUrl}
                  alt={cat.name}
                  width={80}
                  height={80}
                  unoptimized={typeof cat.featuredImage === 'object'}
                />
              </div>
              <div className="category-info">
                <h3>{cat.name}</h3>
                <span>
                  {cat.postCount} {cat.postCount === 1 ? 'Article' : 'Articles'}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
