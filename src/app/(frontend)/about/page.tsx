import React from 'react'

export const metadata = {
  title: 'About | Eclipsed By Grace',
  description: 'Learn more about our mission to help you walk daily with God.',
}

export default function AboutPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">About Us</h1>
      <div className="page-content">
        <p>
          Welcome to <strong>grace.</strong>, a space dedicated to finding peace, purpose, and fulfillment through a daily walk with God.
        </p>
        <p>
          In a busy and often chaotic world, it is easy to lose sight of what truly matters. Our mission is to provide daily devotionals, thoughtful articles, and grounded testimonies that help you stay rooted in faith. We believe that true fulfillment comes from a consistent, unhurried relationship with Christ.
        </p>
        <p>
          Whether you are looking for morning inspiration, deep scriptural study, or a community of believers sharing their testimonies, you will find a home here. Take a deep breath, open your heart, and let grace eclipse your fears.
        </p>
      </div>
    </div>
  )
}
