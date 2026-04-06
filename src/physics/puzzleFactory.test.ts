import { describe, it, expect } from 'vitest'
import { generatePuzzle } from './puzzleFactory'
import type { Element, PuzzleSettings } from './types'

const ELEMENTS: Element[] = [
  { atomicNumber: 1,  symbol: 'H',  name: 'Hydrogen', period: 1, group: 1,  row: 1, col: 1,  lines: [{ w: 6563, i: 180 }, { w: 4861, i: 80 }] },
  { atomicNumber: 2,  symbol: 'He', name: 'Helium',   period: 1, group: 18, row: 1, col: 18, lines: [{ w: 5876, i: 500 }] },
  { atomicNumber: 11, symbol: 'Na', name: 'Sodium',   period: 3, group: 1,  row: 3, col: 1,  lines: [{ w: 5890, i: 1000 }, { w: 5896, i: 500 }] },
]

const BASE_SETTINGS: PuzzleSettings = {
  minElements: 1,
  maxElements: 2,
  elementRowDepth: 7,
  dopplerEnabled: false,
}

describe('generatePuzzle', () => {
  it('returns a puzzle with elements within the row depth', () => {
    const puzzle = generatePuzzle({ ...BASE_SETTINGS, elementRowDepth: 1 }, ELEMENTS)
    for (const e of puzzle.targetElements) {
      expect(e.row).toBeLessThanOrEqual(1)
    }
  })

  it('respects min/max element count', () => {
    for (let i = 0; i < 20; i++) {
      const puzzle = generatePuzzle(BASE_SETTINGS, ELEMENTS)
      expect(puzzle.targetElements.length).toBeGreaterThanOrEqual(BASE_SETTINGS.minElements)
      expect(puzzle.targetElements.length).toBeLessThanOrEqual(BASE_SETTINGS.maxElements)
    }
  })

  it('sets velocity to 0 when doppler disabled', () => {
    const puzzle = generatePuzzle({ ...BASE_SETTINGS, dopplerEnabled: false }, ELEMENTS)
    expect(puzzle.targetVelocity).toBe(0)
  })

  it('sets non-zero velocity when doppler enabled', () => {
    // Run a few times — statistically velocity won't be 0
    const velocities = Array.from({ length: 20 }, () =>
      generatePuzzle({ ...BASE_SETTINGS, dopplerEnabled: true }, ELEMENTS).targetVelocity
    )
    expect(velocities.some(v => v !== 0)).toBe(true)
  })

  it('returns fixed puzzle when fixedElementIds set', () => {
    const puzzle = generatePuzzle({
      ...BASE_SETTINGS,
      fixedElementIds: [1, 2],
      fixedVelocity: 0.35,
    }, ELEMENTS)
    expect(puzzle.targetElements.map(e => e.atomicNumber)).toEqual([1, 2])
    expect(puzzle.targetVelocity).toBe(0.35)
  })

  it('always produces a puzzle with at least one visible line', () => {
    for (let i = 0; i < 50; i++) {
      const puzzle = generatePuzzle(BASE_SETTINGS, ELEMENTS)
      let hasVisible = false
      for (const e of puzzle.targetElements) {
        for (const line of e.lines) {
          if (line.w >= 3000 && line.w <= 7000 && line.i > 5) hasVisible = true
        }
      }
      expect(hasVisible).toBe(true)
    }
  })
})
