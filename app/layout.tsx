import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clanker — Autonomous Feedback Loop',
  description: 'Monitor, implement, test, and stage client feedback automatically.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-grid" aria-hidden="true" />
        <div className="bg-glow" aria-hidden="true" />
        <div className="bg-noise" aria-hidden="true" />
        {children}
      </body>
    </html>
  )
}