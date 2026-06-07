import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Manas Prakriti & Anxiety Assessment Platform',
  description: 'Research-grade clinical assessment tool for Ayurvedic constitutional analysis and anxiety evaluation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-body bg-bg-primary text-text-primary">{children}</body>
    </html>
  )
}
