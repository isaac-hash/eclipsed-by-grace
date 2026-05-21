'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success('Message sent successfully! We will get back to you soon.')
    }, 1000)
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Contact Us</h1>
      <div className="page-content" style={{ textAlign: 'center' }}>
        <p>
          We would love to hear from you. Whether you have a prayer request, a question about a devotional, or simply want to share your testimony, please reach out.
        </p>
      </div>

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" required placeholder="Your name" />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" required placeholder="your@email.com" />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message / Prayer Request</label>
          <textarea id="message" required rows={5} placeholder="How can we pray for you?"></textarea>
        </div>
        <button type="submit" className="btn-teal" disabled={isSubmitting} style={{ width: '100%' }}>
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}
