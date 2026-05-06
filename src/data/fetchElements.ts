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

export interface ElementsMeta {
  elements: Element[]
  datasetDate: string   // YYYY-MM-DD derived from generatedAt
}

export async function fetchElements(url = DEFAULT_URL): Promise<ElementsMeta> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch elements: ${res.status}`)
  const data: ElementsDataFile = await res.json()
  return {
    elements: data.elements,
    datasetDate: data.generatedAt.slice(0, 10),
  }
}
