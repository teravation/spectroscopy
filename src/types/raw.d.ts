// MDX/markdown files compile to React components at build time via @mdx-js/rollup
declare module '*.md' {
  import type { ComponentType, ReactNode } from 'react'
  const MDXComponent: ComponentType<{
    components?: Record<string, ComponentType<{ children?: ReactNode; href?: string }>>
  }>
  export default MDXComponent
}
