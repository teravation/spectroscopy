import type { RGB } from './types'

/**
 * Spectral color breakpoints — exact values from original Java source.
 * Wavelengths in Angstroms.
 */
const COLOR_STOPS: Array<{ w: number; rgb: RGB }> = [
  { w: 4000, rgb: { r: 128, g: 0,   b: 128 } },  // Purple
  { w: 4400, rgb: { r: 0,   g: 0,   b: 255 } },  // Blue
  { w: 4870, rgb: { r: 0,   g: 255, b: 255 } },  // Cyan
  { w: 5170, rgb: { r: 0,   g: 255, b: 0   } },  // Green
  { w: 5790, rgb: { r: 255, g: 255, b: 0   } },  // Yellow
  { w: 6080, rgb: { r: 255, g: 162, b: 0   } },  // Orange
  { w: 6600, rgb: { r: 255, g: 0,   b: 0   } },  // Red
  { w: 7000, rgb: { r: 128, g: 0,   b: 0   } },  // Dark red
]

/**
 * Interpolate an RGB color for a given wavelength (Angstroms).
 * Returns null for wavelengths outside the visible render range [4000–7000].
 */
export function getSpectralColor(wavelength: number): RGB | null {
  if (wavelength < COLOR_STOPS[0].w || wavelength > COLOR_STOPS[COLOR_STOPS.length - 1].w) {
    return null
  }

  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const lo = COLOR_STOPS[i]
    const hi = COLOR_STOPS[i + 1]
    if (wavelength >= lo.w && wavelength <= hi.w) {
      const t = (wavelength - lo.w) / (hi.w - lo.w)
      return {
        r: Math.round(lo.rgb.r + t * (hi.rgb.r - lo.rgb.r)),
        g: Math.round(lo.rgb.g + t * (hi.rgb.g - lo.rgb.g)),
        b: Math.round(lo.rgb.b + t * (hi.rgb.b - lo.rgb.b)),
      }
    }
  }

  return COLOR_STOPS[COLOR_STOPS.length - 1].rgb
}

/**
 * Compute line width in pixels from intensity.
 * Lines with intensity ≤ 5 are invisible (return 0).
 * Width = max(1, floor(log10(intensity - 5)))
 */
export function lineWidth(intensity: number): number {
  if (intensity <= 5) return 0
  return Math.max(1, Math.floor(Math.log10(intensity - 5)))
}

/**
 * Compute the alpha/brightness scale for a line from intensity.
 * Uses log10(intensity - 5); intensity=6 → 0 (min), intensity=105 → 2 (max).
 * Returns a value in [0, 1] normalized to the max of 2.
 */
export function lineIntensityScale(intensity: number): number {
  if (intensity <= 5) return 0
  return Math.min(Math.log10(intensity - 5) / 2, 1)
}
