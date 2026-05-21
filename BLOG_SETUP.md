# Blog Implementation Guide

This guide documents the complete blog system built with Payload CMS, Next.js, and MongoDB.

## Architecture Overview

### Collections

#### 1. **Posts** (`src/collections/Posts.ts`)
Core blog post collection with comprehensive features:

- **Basic Fields:**
  - `title` - Post title
  - `slug` - URL-friendly identifier (auto-generated from title)
  - `content` - Rich text content using Lexical editor
  - `excerpt` - Short summary (max 300 chars)

- **Media & Relationships:**
  - `featuredImage` - Relationship to Media collection
  - `author` - Relationship to Users collection
  - `category` - Relationship to Categories collection
  - `comments` - Relationship to Comments collection (read-only)

- **Publishing Control:**
  - `status` - Draft or Published
  - `publishedAt` - Publication date
  - `scheduledPublishAt` - Future publication time (auto-publishes)

- **SEO & Metadata:**
  - `seo.title` - Custom SEO title
  - `seo.description` - Meta description (max 160 chars)
  - `seo.keywords` - Comma-separated keywords
  - `seo.image` - Social media share image

- **Tagging:** Array of tags for categorization

**Access Control:**
- Public can read only published posts
- Authenticated users can see their own drafts
- Admins can see all content
- Only admins/editors can create posts
- Editors can only update their own posts

#### 2. **Categories** (`src/collections/Categories.ts`)
Organize posts by category.

- `name` - Category name
- `slug` - URL-friendly identifier
- `description` - Category description

**Access Control:**
- Public can read all categories
- Only admins can create/edit/delete

#### 3. **Comments** (`src/collections/Comments.ts`)
Reader comments on blog posts with moderation.

- `post` - Relationship to Posts collection
- `author` - Commenter name
- `email` - Commenter email (hidden from public)
- `content` - Comment text (max 1000 chars)
- `approved` - Moderation flag

**Access Control:**
- Anyone can create comments (moderation required)
- Public only sees approved comments
- Admins can view/approve all comments

#### 4. **Users** (`src/collections/Users.ts`)
Authentication and user management.

- `role` - Select from: admin, editor, viewer
- Email added by default for authentication

## Key Features

### 1. Search Functionality
**File:** `src/app/(frontend)/blog/page.tsx`

- Full-text search across title and excerpt
- Category filtering
- Pagination (10 posts per page)
- Client-side filtering with Axios

```typescript
// Query example
GET /api/posts?status=published&where[or][0][title][contains]=keyword
```

### 2. Scheduled Publishing
**Files:** 
- `src/collections/Posts.ts` - scheduledPublishAt field
- `src/lib/payload-utils.ts` - publishScheduledPosts() function
- `src/app/api/scheduled-posts/route.ts` - HTTP endpoint

Posts with a future `scheduledPublishAt` date are automatically published:

```bash
# Manually trigger scheduled publishing
curl http://localhost:3000/api/scheduled-posts

# Or call via cron job to automate daily
```

### 3. Draft Preview
**File:** `src/app/(frontend)/blog/[slug]/page.tsx`

- Draft posts show preview warning
- Accessible via `/blog/{slug}?preview=true`
- Only visible to authenticated users (post author or admin)

### 4. Comments System
**File:** `src/collections/Comments.ts` + `src/app/(frontend)/blog/[slug]/page.tsx`

- Visitor comments on posts
- Moderation required (admins approve via admin panel)
- Max 1000 characters per comment
- Email collected but hidden from public

### 5. SEO Optimization
**File:** `src/collections/Posts.ts` - seo group field

Custom SEO metadata per post:
- Unique page titles
- Meta descriptions
- Keywords
- Social media images

Fallback to post title/excerpt if SEO fields empty.

## Frontend Pages

### Blog Listing
**Route:** `/blog`
**File:** `src/app/(frontend)/blog/page.tsx`

Features:
- Displays all published posts
- Search across titles and content
- Filter by category
- Pagination
- Responsive grid layout

### Single Post
**Route:** `/blog/[slug]`
**File:** `src/app/(frontend)/blog/[slug]/page.tsx`

Features:
- Full post content
- Author and publication date
- Featured image
- Related tags
- Comments section
- Comment submission form
- Draft preview mode

### Category Page
**Route:** `/category/[slug]`
**File:** `src/app/(frontend)/category/[slug]/page.tsx`

Features:
- Category header with description
- All posts in category
- Post count
- Back link to blog

## Database Queries

### Using the Local API (Server-side)

```typescript
import { getPayload } from 'payload'
import config from '@/payload.config'

const payload = await getPayload({ config })

// Find published posts
const posts = await payload.find({
  collection: 'posts',
  where: { status: { equals: 'published' } },
  sort: '-publishedAt',
})
```

### Using the REST API (Client-side)

```typescript
// Fetch posts
fetch('/api/posts?status=published&sort=-publishedAt')

// Search posts
fetch('/api/posts?where[title][contains]=keyword')

// Filter by category
fetch('/api/categories/123/posts')

// Create comment
fetch('/api/comments', {
  method: 'POST',
  body: JSON.stringify({
    post: 'postId',
    author: 'John Doe',
    email: 'john@example.com',
    content: 'Great post!'
  })
})
```

## Admin Panel Features

Access at: `http://localhost:3000/admin`

### Posts Management
- Create/edit/delete posts
- Rich text editor (Lexical)
- Media upload integration
- SEO fields editing
- Schedule posts for future publication
- Preview drafts

### Comments Moderation
- View all comments
- Approve/reject comments
- View comment details

### Categories Management
- Create/edit/delete categories
- Slug auto-generation

## Setup & Running

### Prerequisites
- Node.js 18+
- MongoDB (local or Docker)
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment variables
cat > .env << EOF
DATABASE_URL=mongodb://localhost/eclipsed-by-grace-blog
PAYLOAD_SECRET=your-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

# Generate Payload types
pnpm run generate:types

# Start MongoDB (if not running)
docker run -d -p 27017:27017 --name mongodb mongo:6
```

### Development

```bash
# Start development server
pnpm dev

# Access
# Frontend: http://localhost:3000
# Admin Panel: http://localhost:3000/admin
# GraphQL Playground: http://localhost:3000/api/graphql-playground
```

### Testing

```bash
# Run integration tests
pnpm run test:int

# Run e2e tests
pnpm run test:e2e

# Run all tests
pnpm run test
```

## Seed Database

### Manual Seeding

```typescript
// Add to your test setup or use directly:
import { seedBlogData } from '@/lib/seed-blog'

await seedBlogData()
```

This creates:
- Admin user (admin@blog.com / testadmin123)
- 2 categories (Technology, Design)
- 3 sample posts (2 published, 1 scheduled for tomorrow)

## Hooks & Automation

### Auto-generate Slug
Defined in `Posts.ts` `beforeValidate` hook:
```typescript
// "Getting Started with CMS" → "getting-started-with-cms"
if (!data.slug && data.title) {
  data.slug = data.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}
```

### Auto-set PublishedAt
When status changes to "published" and no date set:
```typescript
if (data.status === 'published' && !data.publishedAt) {
  data.publishedAt = new Date()
}
```

## Styling

CSS files are modular:
- `src/app/(frontend)/blog/blog.css` - Blog listing
- `src/styles/blog-post.css` - Single post page
- `src/styles/category.css` - Category page

All use CSS variables for easy theming.

## Utility Functions

**File:** `src/lib/payload-utils.ts`

```typescript
// Publish scheduled posts
publishScheduledPosts()

// Fetch posts with filters
fetchPosts({ 
  status: 'published', 
  category: 'tech',
  search: 'keyword',
  limit: 10,
  page: 1 
})

// Get single post by slug
getPostBySlug(slug)

// Get post comments
getPostComments(postId, onlyApproved)

// Create comment
createComment({ post, author, email, content })
```

## Next Steps

### Optional Enhancements
1. **Email Notifications** - Notify author of new comments
2. **Social Sharing** - Add share buttons
3. **Related Posts** - Display similar posts
4. **Reading Time** - Calculate and display
5. **Tags Page** - Browse posts by tag
6. **Subscribe** - Newsletter subscription
7. **Analytics** - Track views and engagement
8. **Webhooks** - Trigger external services on publish

### Production Deployment
1. Use MongoDB Atlas (cloud)
2. Deploy to Vercel/Next.js hosting
3. Enable HTTPS
4. Set up automated backups
5. Configure CDN for media files
6. Set up email service for comments

## Resources

- [Payload CMS Docs](https://payloadcms.com/docs)
- [Payload Concepts](https://payloadcms.com/docs/getting-started/concepts)
- [Collections Documentation](https://payloadcms.com/docs/configuration/collections)
- [Fields Documentation](https://payloadcms.com/docs/fields/overview)
- [Access Control](https://payloadcms.com/docs/access-control/overview)
- [Hooks](https://payloadcms.com/docs/hooks/overview)
