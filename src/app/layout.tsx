import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JEETribe AI — AI Teacher for JEE & NEET',
  description: 'Learn Physics, Chemistry & Maths with an AI teacher. NTA-style JEE Mains, JEE Advanced & NEET problems solved step-by-step in Hindi + English.',
  openGraph: {
    title: 'JEETribe AI — AI Teacher for JEE & NEET',
    description: 'Physics, Chemistry & Maths — NTA-style problems solved by AI in Hinglish',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
