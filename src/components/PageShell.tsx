import type React from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: React.ReactNode
  title: string        // browser tab title
  description?: string // meta description for SEO
}

export function PageShell({ children, title, description }: Props) {
  // Set document title and meta description for SEO
  if (typeof document !== 'undefined') {
    document.title = `${title} — Spectroscopy`
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    if (description) meta.content = description
  }

  return (
    <div className="page-shell">
      <header className="page-shell__header">
        <span className="app-header__logo-text">TERAVATION</span>
        <span className="app-header__app-name">Spectroscopy</span>
        <Link to="/" className="page-shell__back">← Back to game</Link>
      </header>
      <main className="page-shell__content">
        {children}
      </main>
    </div>
  )
}
