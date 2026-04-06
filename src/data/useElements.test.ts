import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchElements } from './fetchElements'
import type { Element } from '../physics/types'

const mockElements: Element[] = [
  {
    atomicNumber: 1,
    symbol: 'H',
    name: 'Hydrogen',
    period: 1,
    group: 1,
    row: 1,
    col: 1,
    lines: [{ w: 6563, i: 1000 }, { w: 4861, i: 500 }],
  },
]

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

describe('fetchElements', () => {
  it('returns elements array from a successful response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        version: '2024-01',
        generatedAt: '2024-01-01T00:00:00Z',
        elements: mockElements,
      }),
    } as Response)

    const result = await fetchElements('https://example.com/elements.json')
    expect(result).toEqual(mockElements)
  })

  it('throws on non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 403,
    } as Response)

    await expect(fetchElements('https://example.com/elements.json')).rejects.toThrow('Failed to fetch elements: 403')
  })
})
