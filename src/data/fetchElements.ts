import type { Element } from '../physics/types'

interface ElementsDataFile {
  version: string
  generatedAt: string
  wavelengthType: 'air' | 'vacuum'
  intensityScale: string
  elements: Element[]
}

const DEFAULT_URL = import.meta.env.VITE_ELEMENTS_URL as string | undefined
  ?? '/elements.json'

export async function fetchElements(url = DEFAULT_URL): Promise<Element[]> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch elements: ${res.status}`)
  const data: ElementsDataFile = await res.json()
  return data.elements
}
