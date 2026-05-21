'use client'

import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { SearchPalette } from './SearchPalette'

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header className="site-header">
        <div className="logo" style={{ letterSpacing: '-0.02em', fontStyle: 'italic' }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Eclipsed by Grace</Link>
        </div>
        <nav className="nav-links">
          <Link href="/" className="active">Home</Link>
          <Link href="/category">Devotionals</Link>
          <Link href="/about">About</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="header-actions">
          <span
            onClick={() => window.dispatchEvent(new Event('open-search-palette'))}
            title="Search (Cmd+K)"
            style={{ cursor: 'pointer' }}
          >
            🔍
          </span>
          <button
            className={`hamburger-btn${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>
        </div>
        <SearchPalette />
      </header>

      {/* Mobile Nav Overlay */}
      <div
        id="mobile-nav"
        className={`mobile-nav-overlay${menuOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <nav className="mobile-nav-links" onClick={closeMenu}>
          <Link href="/">Home</Link>
          <Link href="/category">Devotionals</Link>
          <Link href="/about">About</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </>
  )
}
