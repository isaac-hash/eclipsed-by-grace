import type { CollectionConfig } from 'payload'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'author',
    defaultColumns: ['author', 'post', 'approved', 'createdAt'],
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      index: true,
    },
    {
      name: 'author',
      type: 'text',
      required: true,
      admin: {
        description: 'Name of the comment author',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      maxLength: 1000,
    },
    {
      name: 'approved',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Only approved comments are shown on the blog',
        position: 'sidebar',
      },
    },
  ],
  access: {
    read: ({ req }) => {
      // Public can only see approved comments
      if (!req.user) {
        return {
          approved: {
            equals: true,
          },
        }
      }
      // Admins can see all comments
      if (req.user.role === 'admin') {
        return true
      }
      // Users can see approved comments
      return {
        approved: {
          equals: true,
        },
      }
    },
    create: () => true, // Anyone can comment
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  timestamps: true,
}
