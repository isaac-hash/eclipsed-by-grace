'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import axios from 'axios'
import { toast } from 'sonner'
import '../../../../styles/blog-post.css'
import { RichText } from '@payloadcms/richtext-lexical/react'

interface PostData {
  id: string
  title: string
  slug: string
  content: any
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
  seo?: {
    title?: string
    description?: string
    keywords?: string
  }
  featuredImage?: {
    id: string
    alt?: string
    url?: string
  }
}

interface Comment {
  id: string
  author: string
  content: string
  approved: boolean
  createdAt: string
}

export default function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}) {
  const [post, setPost] = useState<PostData | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPreview, setIsPreview] = useState(false)
  const [newComment, setNewComment] = useState({
    author: '',
    email: '',
    content: '',
  })
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)
  const [slug, setSlug] = useState('')
  const [preview, setPreview] = useState('')

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params
      const resolvedSearch = await searchParams
      setSlug(resolvedParams.slug)
      setPreview(resolvedSearch.preview || '')
    }
    init()
  }, [params, searchParams])

  useEffect(() => {
    if (!slug) return

    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/posts?where[slug][equals]=${slug}`)

        if (response.data.docs.length === 0) {
          setError('Post not found')
          return
        }

        const postData = response.data.docs[0]
        setPost(postData)
        setIsPreview(preview === 'true')

        // Fetch comments for this post
        const commentsResponse = await axios.get(
          `/api/comments?where[post][equals]=${postData.id}&where[approved][equals]=true&sort=-createdAt`,
        )
        setComments(commentsResponse.data.docs)
        setError(null)
      } catch (err) {
        console.error('Error fetching post:', err)
        setError('Failed to load blog post')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug, preview])

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingComment(true)
    setCommentError(null)

    try {
      await axios.post('/api/comments', {
        post: post?.id,
        author: newComment.author,
        email: newComment.email,
        content: newComment.content,
        approved: false,
      })

      setNewComment({ author: '', email: '', content: '' })
      toast.success('Thank you for your comment! It will appear after moderation.')
    } catch (err) {
      console.error('Error submitting comment:', err)
      toast.error('Failed to submit comment. Please try again.')
      setCommentError('Failed to submit comment. Please try again.')
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="blog-post-container">
        <div className="loading">Loading post...</div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="blog-post-container">
        <div className="error-message">{error || 'Post not found'}</div>
        <Link href="/blog" className="back-link">
          ← Back to Blog
        </Link>
      </div>
    )
  }

  // Check if this is a draft and show preview warning
  if (isPreview && post.status === 'draft') {
    return (
      <div className="blog-post-container">
        <div className="preview-warning">
          🔍 This is a preview of a draft post. Not visible to public.
        </div>

        <article className="blog-post">
          <header className="post-header">
            <Link href="/blog" className="back-link">
              ← Back to Blog
            </Link>

            {post.featuredImage?.url && (
              <div className="featured-image">
                <img
                  src={post.featuredImage.url}
                  alt={post.featuredImage.alt || post.title}
                />
              </div>
            )}

            <div className="post-header-content">
              {post.category && (
                <Link
                  href={`/category/${post.category.slug}`}
                  className="category-badge"
                >
                  {post.category.name}
                </Link>
              )}
              <h1>{post.title}</h1>
              <div className="post-meta">
                <span>By {post.author?.email || 'Unknown'}</span>
                {post.publishedAt && (
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>
          </header>

          <div className="post-body">
            {typeof post.content === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              <RichText data={post.content} />
            )}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((tag, idx) => (
                <span key={idx} className="tag">
                  #{tag.tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>
    )
  }

  // Only show published posts to public
  if (post.status !== 'published') {
    return (
      <div className="blog-post-container">
        <div className="error-message">Post not found</div>
        <Link href="/blog" className="back-link">
          ← Back to Blog
        </Link>
      </div>
    )
  }

  return (
    <div className="blog-post-container">
      <article className="blog-post">
        <header className="post-header">
          <Link href="/blog" className="back-link">
            ← Back to Blog
          </Link>

          {post.featuredImage?.url && (
            <div className="featured-image">
              <img
                src={post.featuredImage.url}
                alt={post.featuredImage.alt || post.title}
              />
            </div>
          )}

          <div className="post-header-content">
            {post.category && (
              <Link
                href={`/category/${post.category.slug}`}
                className="category-badge"
              >
                {post.category.name}
              </Link>
            )}
            <h1>{post.title}</h1>
            <div className="post-meta">
              <span>By {post.author?.email || 'Unknown'}</span>
              {post.publishedAt && (
                <span>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="post-body">
          {typeof post.content === 'string' ? (
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <RichText data={post.content} />
          )}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, idx) => (
              <span key={idx} className="tag">
                #{tag.tag}
              </span>
            ))}
          </div>
        )}
      </article>

      <section className="comments-section">
        <h2>Comments ({comments.length})</h2>

        {comments.length > 0 ? (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <strong>{comment.author}</strong>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        )}

        <form onSubmit={handleCommentSubmit} className="comment-form">
          <h3>Leave a Comment</h3>

          {commentError && (
            <div className="error-message">{commentError}</div>
          )}

          <div className="form-group">
            <label htmlFor="author">Name</label>
            <input
              id="author"
              type="text"
              value={newComment.author}
              onChange={(e) =>
                setNewComment({ ...newComment, author: e.target.value })
              }
              required
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={newComment.email}
              onChange={(e) =>
                setNewComment({ ...newComment, email: e.target.value })
              }
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Comment</label>
            <textarea
              id="content"
              value={newComment.content}
              onChange={(e) =>
                setNewComment({ ...newComment, content: e.target.value })
              }
              required
              placeholder="Your comment here..."
              maxLength={1000}
              rows={5}
            />
            <small>
              {newComment.content.length}/1000 characters
            </small>
          </div>

          <button
            type="submit"
            disabled={submittingComment}
            className="btn-submit"
          >
            {submittingComment ? 'Submitting...' : 'Submit Comment'}
          </button>
        </form>
      </section>
    </div>
  )
}
