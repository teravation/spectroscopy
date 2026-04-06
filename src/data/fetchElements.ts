import type { Element } from '../physics/types'

interface ElementsDataFile {
  version: string
  generatedAt: string
  elements: Element[]
}

export async function fetchElements(url = import.meta.env.VITE_ELEMENTS_URL as string): Promise<Element[]> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch elements: ${res.status}`)
  const data: ElementsDataFile = await res.json()
  return data.elements
}
