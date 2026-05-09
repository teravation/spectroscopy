import { useEffect, useState } from 'react'
import { PageShell } from '../components/PageShell'

export function LicensesPage() {
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/THIRD_PARTY_LICENSES.txt')
      .then(r => {
        if (!r.ok) throw new Error()
        return r.text()
      })
      .then(setContent)
      .catch(() => setError(true))
  }, [])

  return (
    <PageShell
      title="Third-Party Licenses"
      description="Open source licenses for software used in Spectroscopy."
    >
      <h1 className="page-h1">Third-Party Licenses</h1>
      {error && (
        <p className="page-meta">
          License information is generated at build time.
          Run <code>npm run build</code> to generate it.
        </p>
      )}
      {content && <pre className="page-licenses">{content}</pre>}
    </PageShell>
  )
}
