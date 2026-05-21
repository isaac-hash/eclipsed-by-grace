import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { s3Storage } from '@payloadcms/storage-s3' 

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Categories } from './collections/Categories'
import { Comments } from './collections/Comments'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Posts, Categories, Comments],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: true, // Links your media collection
      },
      bucket: process.env.CLOUDINARY_CLOUD_NAME || '', 
      config: {
        credentials: {
          accessKeyId: process.env.CLOUDINARY_API_KEY || '',
          secretAccessKey: process.env.CLOUDINARY_API_SECRET || '',
        },
        endpoint: 'https://s3-upload.cloudinary.com', // ◄ Pipes requests to Cloudinary gateway
        region: 'us-east-1', // Required by the SDK block, Cloudinary handles this internally
        forcePathStyle: true,
      },
    }),
  ],
})
