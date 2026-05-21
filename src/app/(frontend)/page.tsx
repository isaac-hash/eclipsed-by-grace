import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import './styles.css'
import Link from 'next/link'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // Fetch dynamic categories
  const categoriesRes = await payload.find({
    collection: 'categories',
    limit: 4,
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
    })
  )

  return (
    <div className="main-wrapper">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-subtitle">Daily Devotion</div>
          <h1>Finding peace in His presence every morning.</h1>
          <Link href="/blog" className="btn-teal">
            Read Today's Word
          </Link>
        </div>
        <div className="hero-image-wrapper">
          <Image
            src="https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=1200&auto=format&fit=crop"
            alt="Open Bible in morning sunlight"
            width={1000}
            height={1000}
            priority
          />
        </div>
      </section>

      <div className="categories-container">
        <div className="categories-grid">
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

      <section className="highlighted-section">
        <div className="section-header">
          <h2>Walking with God in a Busy World</h2>
        </div> 
        <div className="highlighted-image">
          <Image
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop"
            alt="Person walking peacefully in nature"
            width={1200}
            height={500}
          />
        </div>
      </section>
    </div>
  )
}
