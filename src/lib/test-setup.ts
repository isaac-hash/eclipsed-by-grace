import { seedBlogData } from '@/lib/seed-blog'

/**
 * One-time seed function for Vitest
 * Uncomment in vitest.setup.ts to auto-seed on test run
 */
export async function setupBlogData() {
  // Only seed in test environment
  if (process.env.NODE_ENV !== 'test') {
    return
  }

  try {
    console.log('[Setup] Seeding blog data...')
    await seedBlogData()
    console.log('[Setup] Blog data seeded successfully')
  } catch (error) {
    console.error('[Setup] Error seeding blog data:', error)
    // Don't fail tests if seeding fails - data might already exist
  }
}
