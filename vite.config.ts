import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { Plugin } from 'vite'

// Generates public/THIRD_PARTY_LICENSES.txt from runtime dependencies.
// Runs on buildStart which fires in both `vite dev` and `vite build`,
// so the file is always available to the dev server and is copied to
// dist/ as part of the normal public/ directory handling.
function licensesPlugin(): Plugin {
  return {
    name: 'generate-licenses',
    buildStart() {
      const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
      const deps = Object.keys(pkg.dependencies ?? {}).sort()

      const lines: string[] = [
        'THIRD-PARTY SOFTWARE LICENSES',
        '==============================',
        '',
        'The following open-source packages are included in this application.',
        '',
      ]

      for (const name of deps) {
        try {
          const d = JSON.parse(
            readFileSync(join('node_modules', name, 'package.json'), 'utf-8')
          )
          const repoRaw = typeof d.repository === 'string'
            ? d.repository
            : (d.repository?.url ?? '')
          const url = repoRaw
            .replace(/^git\+/, '')
            .replace(/\.git$/, '')
            || d.homepage
            || ''

          lines.push(`${name} ${d.version}`)
          lines.push(`License: ${d.license ?? 'See package'}`)
          if (url) lines.push(`URL: ${url}`)
          lines.push('')
        } catch {
          // dependency's package.json not found — skip
        }
      }

      lines.push('---', '')
      lines.push('Spectral data: NIST Atomic Spectra Database (public domain)')
      lines.push('https://physics.nist.gov/PhysRefData/ASD/lines_form.html')
      lines.push('')

      writeFileSync('public/THIRD_PARTY_LICENSES.txt', lines.join('\n'), 'utf-8')
    },
  }
}

export default defineConfig({
  plugins: [
    licensesPlugin(),
    mdx(),   // must be before react()
    react(),
  ],
  server: {
    host: true,
  },
  test: {
    environment: 'node',
    globals: true,
    pool: 'forks',
  },
})
