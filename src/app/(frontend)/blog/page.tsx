'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import './blog.css'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  status: 'draft' | 'published'
  publishedAt?: string
  author?: {
    id: string
    email: string
  }
  category?: {
    id: string
    name: string
    slug: string
  }
  tags?: Array<{ tag: string }>
  featuredImage?: {
    id: string
    alt?: string
    url?: string
  }
}

interface BlogListResponse {
  docs: Post[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        let query = `status=published&sort=-publishedAt&page=${page}&limit=10`

        if (searchQuery) {
          query += `&where[or][0][title][contains]=${encodeURIComponent(searchQuery)}`
          query += `&where[or][1][excerpt][contains]=${encodeURIComponent(searchQuery)}`
        }

        if (selectedCategory) {
          query += `&where[category][equals]=${selectedCategory}`
        }

        const response = await axios.get<BlogListResponse>(
          `/api/posts?${query}`,
        )

        setPosts(response.data.docs)
        setTotalPages(response.data.totalPages)
        setError(null)
      } catch (err) {
        console.error('Error fetching posts:', err)
        setError('Failed to load blog posts')
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [searchQuery, selectedCategory, page])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1)
  }

  const handleCategoryFilter = (categoryId: string | null) => {
    setSelectedCategory(categoryId)
    setPage(1)
  }

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages))
  }

  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1>Blog</h1>
        <p>Discover our latest articles and insights</p>
      </div>

      <div className="blog-controls">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="no-posts">
          <p>No posts found. Try adjusting your filters.</p>
        </div>
      ) : (
        <>
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
                  {post.category && (
                    <Link
                      href={`/category/${post.category.slug}`}
                      className="category-badge"
                    >
                      {post.category.name}
                    </Link>
                  )}
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

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                className="btn-pagination"
              >
                ← Previous
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className="btn-pagination"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
