'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import '@/styles/category.css'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  publishedAt?: string
  author?: {
    email: string
  }
  tags?: Array<{ tag: string }>
  featuredImage?: {
    alt?: string
    url?: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [category, setCategory] = useState<Category | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [slug, setSlug] = useState('')

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
    }
    init()
  }, [params])

  useEffect(() => {
    if (!slug) return

    const fetchCategoryAndPosts = async () => {
      try {
        setLoading(true)

        // Fetch category
        const categoryResponse = await axios.get(
          `/api/categories?where[slug][equals]=${slug}`,
        )

        if (categoryResponse.data.docs.length === 0) {
          setError('Category not found')
          return
        }

        const categoryData = categoryResponse.data.docs[0]
        setCategory(categoryData)

        // Fetch posts in this category
        const postsResponse = await axios.get(
          `/api/posts?where[category][equals]=${categoryData.id}&where[status][equals]=published&sort=-publishedAt`,
        )

        setPosts(postsResponse.data.docs)
        setError(null)
      } catch (err) {
        console.error('Error fetching category:', err)
        setError('Failed to load category')
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryAndPosts()
  }, [slug])

  if (loading) {
    return (
      <div className="category-container">
        <div className="loading">Loading category...</div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="category-container">
        <div className="error-message">{error || 'Category not found'}</div>
        <Link href="/blog" className="back-link">
          ← Back to Blog
        </Link>
      </div>
    )
  } 

  return (
    <div className="category-container" style={{ marginTop: '6rem' }}>
      <Link href="/blog" className="back-link">
        ← Back to Blog
      </Link>

      <header className="category-header">
        <h1>{category.name}</h1>
        {category.description && <p>{category.description}</p>}
        <p className="post-count">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="no-posts">
          <p>No posts found in this category yet.</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <article key={post.id} className="post-card">
              {post.featuredImage?.url && (
                <div className="post-image">
                  <img
                    src={post.featuredImage.url}
                    alt={post.featuredImage.alt || post.title}
                  />
                </div>
              )}
              <div className="post-content">
                <h2>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="excerpt">{post.excerpt}</p>
                <div className="post-meta">
                  <span className="author">
                    By {post.author?.email || 'Unknown'}
                  </span>
                  {post.publishedAt && (
                    <span className="date">
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="tags">
                    {post.tags.map((tag, idx) => (
                      <span key={idx} className="tag">
                        {tag.tag}
                      </span>
                    ))}
                  </div>
                )}
                <Link href={`/blog/${post.slug}`} className="read-more">
                  Read More →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
