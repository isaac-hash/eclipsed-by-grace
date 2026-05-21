import React from 'react'
import { Lora, Nunito } from 'next/font/google'
import { Toaster } from 'sonner'
import { Header } from '@/components/Header'
import './styles.css'

const lora = Lora({ 
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata = {
  description: 'A thoughtful and calm space for reading and reflection.',
  title: 'Eclipsed By Grace',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className={`${lora.variable} ${nunito.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Toaster 
          position="bottom-center" 
          toastOptions={{
            style: {
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-body)',
              boxShadow: 'var(--shadow-soft)',
              borderRadius: 'var(--radius-sm)'
            }
          }}
        />
      </body>
    </html>
  )
}
