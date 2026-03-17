import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PhysicsAI — AI Physics Teacher for JEE & NEET',
  description: 'Learn physics with an AI teacher that explains step-by-step on a virtual whiteboard. JEE Mains, JEE Advanced & NEET physics problems solved in Hindi + English.',
  openGraph: {
    title: 'PhysicsAI — AI Physics Teacher',
    description: 'JEE & NEET Physics solved step-by-step by AI',
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
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
