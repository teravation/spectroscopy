import type { SpectralLine } from './types'

/**
 * Apply classical Doppler shift to a set of spectral lines.
 * shifted = wavelength * (1 + velocity)
 * velocity: fraction of c, range [-1.0, 1.0]
 * Negative = blueshift (towards viewer), positive = redshift (away from viewer)
 */
export function shiftLines(lines: SpectralLine[], velocity: number): SpectralLine[] {
  return lines.map(line => ({
    w: line.w * (1 + velocity),
    i: line.i,
  }))
}
