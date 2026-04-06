import { describe, it, expect } from 'vitest'
import { shiftLines } from './doppler'

describe('shiftLines', () => {
  it('applies no shift at velocity 0', () => {
    const lines = [{ w: 5000, i: 100 }, { w: 6000, i: 50 }]
    expect(shiftLines(lines, 0)).toEqual(lines)
  })

  it('redshifts at positive velocity', () => {
    const lines = [{ w: 5000, i: 100 }]
    const result = shiftLines(lines, 0.1)
    expect(result[0].w).toBeCloseTo(5500)
  })

  it('blueshifts at negative velocity', () => {
    const lines = [{ w: 5000, i: 100 }]
    const result = shiftLines(lines, -0.1)
    expect(result[0].w).toBeCloseTo(4500)
  })

  it('preserves intensity', () => {
    const lines = [{ w: 5000, i: 42 }]
    expect(shiftLines(lines, 0.5)[0].i).toBe(42)
  })

  it('does not mutate input', () => {
    const lines = [{ w: 5000, i: 100 }]
    shiftLines(lines, 0.5)
    expect(lines[0].w).toBe(5000)
  })
})
