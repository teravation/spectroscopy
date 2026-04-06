import { describe, it, expect } from 'vitest'
import { getSpectralColor, lineWidth, lineIntensityScale } from './wavelengthToColor'

describe('getSpectralColor', () => {
  it('returns null below 4000 Å', () => {
    expect(getSpectralColor(3999)).toBeNull()
  })

  it('returns null above 7000 Å', () => {
    expect(getSpectralColor(7001)).toBeNull()
  })

  it('returns exact purple at 4000 Å', () => {
    expect(getSpectralColor(4000)).toEqual({ r: 128, g: 0, b: 128 })
  })

  it('returns exact blue at 4400 Å', () => {
    expect(getSpectralColor(4400)).toEqual({ r: 0, g: 0, b: 255 })
  })

  it('returns exact dark red at 7000 Å', () => {
    expect(getSpectralColor(7000)).toEqual({ r: 128, g: 0, b: 0 })
  })

  it('interpolates midpoint between purple and blue', () => {
    // Midpoint between 4000 (128,0,128) and 4400 (0,0,255) = 4200
    const color = getSpectralColor(4200)
    expect(color).toEqual({ r: 64, g: 0, b: 192 })
  })

  it('Na yellow doublet (~5890 Å) is in the yellow-orange range', () => {
    const color = getSpectralColor(5890)
    // Between yellow (5790) and orange (6080): r should be 255, g between 0 and 255
    expect(color?.r).toBe(255)
    expect(color?.g).toBeGreaterThan(0)
    expect(color?.g).toBeLessThan(255)
  })
})

describe('lineWidth', () => {
  it('returns 0 for intensity ≤ 5', () => {
    expect(lineWidth(5)).toBe(0)
    expect(lineWidth(3)).toBe(0)
    expect(lineWidth(0)).toBe(0)
  })

  it('returns 1 for intensity 6 (minimum visible)', () => {
    expect(lineWidth(6)).toBe(1)  // floor(log10(1)) = 0 → max(1, 0) = 1
  })

  it('returns 1 for intensity up to 15', () => {
    expect(lineWidth(15)).toBe(1)  // floor(log10(10)) = 1
  })

  it('returns 2 for intensity 106 and above', () => {
    expect(lineWidth(106)).toBe(2)  // floor(log10(101)) = 2
  })
})

describe('lineIntensityScale', () => {
  it('returns 0 for intensity ≤ 5', () => {
    expect(lineIntensityScale(5)).toBe(0)
  })

  it('returns 0 for intensity 6 (log10(1) = 0)', () => {
    expect(lineIntensityScale(6)).toBe(0)
  })

  it('returns 0.5 for intensity 5 + sqrt(100) = 105... actually log10(100)/2 = 1', () => {
    // intensity=105 → log10(100)=2 → 2/2=1.0
    expect(lineIntensityScale(105)).toBe(1)
  })

  it('clamps at 1 for very high intensities', () => {
    expect(lineIntensityScale(10005)).toBe(1)
  })
})
