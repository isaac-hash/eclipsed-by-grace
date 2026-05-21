# 🚀 Blog with Payload CMS - Quick Start Guide

## What You Get

✅ Complete blog system with admin panel
✅ Full-text search across posts
✅ Comment system with moderation
✅ Scheduled publishing (auto-publish on time)
✅ Draft preview mode
✅ SEO optimization per post
✅ Category management
✅ Responsive design

## 5-Minute Setup

### 1. Start MongoDB (if not running)
```bash
docker run -d -p 27017:27017 --name mongodb mongo:6
```

### 2. Start Dev Server
```bash
pnpm dev
```

### 3. Access the App
- **Frontend:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin
- **Blog:** http://localhost:3000/blog
- **GraphQL:** http://localhost:3000/api/graphql-playground

### 4. Login to Admin Panel
```
Email: admin@blog.com
Password: testadmin123
```
*(From seed data, create your own user if needed)*

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/blog` | Blog listing with search |
| `/blog/{slug}` | Single post view with comments |
| `/category/{slug}` | Posts in category |
| `/admin` | Admin panel |
| `/api/posts` | REST API - Posts |
| `/api/comments` | REST API - Comments |
| `/api/categories` | REST API - Categories |
| `/api/scheduled-posts` | Trigger scheduled publishing |

## Common Tasks

### Create a Blog Post
1. Go to http://localhost:3000/admin
2. Click "Posts" in sidebar
3. Click "Create New"
4. Fill in:
   - **Title** (auto-generates slug)
   - **Content** (rich text editor)
   - **Excerpt** (short summary)
   - **Featured Image** (upload image)
   - **Category** (select or create)
   - **Status** (Draft or Published)
5. Add SEO fields for better search ranking
6. Click "Save"

### Schedule a Post
1. Create post as above
2. Set **Status** to "Draft"
3. Set **Scheduled Publish At** to future date/time
4. Save
5. Post will auto-publish at scheduled time

### Approve Comments
1. Go to **Comments** in admin panel
2. View pending comments
3. Check the **Approved** checkbox
4. Save
5. Comment now visible on post

### Search & Filter Posts
1. Go to http://localhost:3000/blog
2. Type in search box to find posts by title
3. Select category to filter
4. Pagination at bottom

## File Structure

```
src/
├── collections/              # Payload collections
│   ├── Users.ts              # Users with roles
│   ├── Posts.ts              # Blog posts (main)
│   ├── Categories.ts         # Post categories
│   ├── Comments.ts           # Comment moderation
│   └── Media.ts              # Image uploads
├── app/
│   ├── (frontend)/
│   │   ├── page.tsx          # Homepage
│   │   ├── blog/
│   │   │   ├── page.tsx      # Blog listing + search
│   │   │   └── [slug]/
│   │   │       └── page.tsx  # Single post + comments
│   │   └── category/
│   │       └── [slug]/
│   │           └── page.tsx  # Category page
│   ├── (payload)/
│   │   └── admin/            # Auto-generated admin UI
│   └── api/
│       ├── posts/            # REST API endpoints
│       ├── comments/         # Comment endpoints
│       └── scheduled-posts/  # Scheduled publishing trigger
├── lib/
│   ├── payload-utils.ts      # Utility functions
│   └── seed-blog.ts          # Sample data
├── styles/
│   ├── blog-post.css         # Post page styles
│   └── category.css          # Category page styles
└── payload.config.ts         # Main config (Collections defined)
```

## API Examples

### Fetch Published Posts
```bash
curl "http://localhost:3000/api/posts?status=published&sort=-publishedAt"
```

### Search Posts
```bash
curl "http://localhost:3000/api/posts?where[or][0][title][contains]=search%20term"
```

### Create Comment (Auto-moderated)
```bash
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "post": "postId123",
    "author": "John Doe",
    "email": "john@example.com",
    "content": "Great article!"
  }'
```

### Trigger Scheduled Publishing
```bash
curl http://localhost:3000/api/scheduled-posts
```

## Seed Sample Data

```bash
# Option 1: Auto-seed on first run (if configured)
# Data: 1 admin user + 2 categories + 3 sample posts

# Option 2: Manual seed
node -e "import('./src/lib/seed-blog.ts').then(m => m.seedBlogData())"
```

## Environment Variables

```env
DATABASE_URL=mongodb://127.0.0.1/eclipsed-by-grace-blog
PAYLOAD_SECRET=your-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## User Roles

| Role | Permissions |
|------|------------|
| **Admin** | Full access - create/edit/delete all posts & comments |
| **Editor** | Create & edit own posts, view all comments |
| **Viewer** | Read-only access |

## Useful Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Testing
pnpm test             # Run all tests
pnpm test:int         # Integration tests
pnpm test:e2e         # E2E tests

# Admin
pnpm payload          # Payload CLI
pnpm generate:types   # Regenerate TypeScript types
```

## Features Overview

### 🔍 Search & Filter
- Full-text search on post title and excerpt
- Filter by category
- Pagination (10 posts per page)

### 📅 Scheduled Publishing
- Set future publish date/time
- Auto-publishes when time arrives
- Call `/api/scheduled-posts` to trigger manually

### 👁️ Draft Preview
- Preview drafts before publishing
- URL: `/blog/{slug}?preview=true`
- Visible to author/admins only

### 💬 Comments
- Visitors can leave comments
- Admin moderation required
- Spam protection via moderation

### 🎨 SEO
- Custom meta titles & descriptions
- Keywords per post
- Social media preview images
- Auto-fallback to title/excerpt

### 📸 Media Management
- Upload featured images
- Image alt text
- Responsive image display

## Troubleshooting

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
docker ps | grep mongodb

# Or start it
docker run -d -p 27017:27017 --name mongodb mongo:6
```

### Admin Panel Not Loading
- Clear browser cache
- Run: `pnpm run generate:importmap`
- Restart dev server

### Search Not Working
- Check that posts are published (not draft)
- Ensure `status` field is set to "published"
- Verify MongoDB is running

### Comments Not Showing
- Check "Approved" checkbox for comments in admin
- Only approved comments show on frontend
- Check moderation status in admin panel

## Next Steps

1. **Customize Branding**
   - Edit homepage (`src/app/(frontend)/page.tsx`)
   - Update CSS files for colors/fonts

2. **Add More Features**
   - Related posts sidebar
   - Author profile pages
   - Social sharing buttons
   - Newsletter subscription

3. **Deploy to Production**
   - Use MongoDB Atlas (cloud)
   - Deploy to Vercel
   - Configure CDN for images
   - Set up automated backups

4. **Setup Automation**
   - Cron job for scheduled publishing
   - Email notifications for comments
   - Analytics integration

## Documentation

- **Full Setup Guide:** See [BLOG_SETUP.md](./BLOG_SETUP.md)
- **Payload CMS Docs:** https://payloadcms.com/docs
- **Next.js Guide:** https://nextjs.org/docs

## Support

- Payload Community: https://discord.com/invite/r6sCXqVk3v
- GitHub Issues: https://github.com/payloadcms/payload/issues

---

**Happy blogging!** 🎉
