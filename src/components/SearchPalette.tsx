'use client'

import * as React from 'react'
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import './search-palette.css'

export function SearchPalette() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  // Toggle the menu when ⌘K is pressed
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Listen to a custom event from the Header
  React.useEffect(() => {
    const handleOpenSearch = () => setOpen(true)
    window.addEventListener('open-search-palette', handleOpenSearch)
    return () => window.removeEventListener('open-search-palette', handleOpenSearch)
  }, [])

  // Fetch results when query changes
  React.useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.posts || [])
      } catch (e) {
        console.error('Search failed', e)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <Command.Dialog 
      open={open} 
      onOpenChange={setOpen} 
      label="Global Command Menu"
      shouldFilter={false} // We handle filtering via the API
    >
      <div className="cmdk-header">
        <Search className="cmdk-search-icon" size={20} />
        <Command.Input 
          value={query}
          onValueChange={setQuery}
          placeholder="Search articles..." 
        />
      </div>
      <Command.List>
        <Command.Empty>
          {loading ? 'Searching...' : 'No results found.'}
        </Command.Empty>

        {results.length > 0 && (
          <Command.Group heading="Articles">
            {results.map((post) => (
              <Command.Item
                key={post.id}
                value={post.id}
                onSelect={() => {
                  router.push(`/blog/${post.slug}`)
                  setOpen(false)
                }}
              >
                <div className="cmdk-item-content">
                  <div className="cmdk-item-title">{post.title}</div>
                  <div className="cmdk-item-excerpt">
                    {post.excerpt?.slice(0, 100)}{post.excerpt?.length > 100 ? '...' : ''}
                  </div>
                </div>
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </Command.List>
    </Command.Dialog>
  )
}
