import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import AboutContent from './about.md'

// Custom renderers applied at runtime — keep markdown content clean
// Internal hrefs use React Router <Link> (no page reload); external open in new tab
const components = {
  h1: ({ children }: { children?: ReactNode }) => <h1 className="page-h1">{children}</h1>,
  h2: ({ children }: { children?: ReactNode }) => <h2 className="page-h2">{children}</h2>,
  h3: ({ children }: { children?: ReactNode }) => <h3 className="page-h3">{children}</h3>,
  hr: () => <hr className="page-hr" />,
  a: ({ href, children }: { href?: string; children?: ReactNode }) =>
    href?.startsWith('/')
      ? <Link to={href} className="page-link">{children}</Link>
      : <a href={href} target="_blank" rel="noreferrer" className="page-link">{children}</a>,
}

export function AboutPage() {
  return (
    <PageShell
      title="About"
      description="Learn how astronomical spectroscopy works, the science behind this app, and the story of its origins at the Denver Museum of Nature and Science."
    >
      <AboutContent components={components} />
    </PageShell>
  )
}
