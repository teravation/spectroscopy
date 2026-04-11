import { useRef, useEffect } from 'react'
import type { SpectralLine } from '../physics/types'
import { getSpectralColor } from '../physics/wavelengthToColor'

const WAVELENGTH_MIN = 4000
const WAVELENGTH_MAX = 7000
const WAVELENGTH_RANGE = WAVELENGTH_MAX - WAVELENGTH_MIN

// Intensity values are pre-normalized in the pipeline to a 0–1000 scale
// (global max across all elements = 1000). See ELEMENTS.md and scripts/fetch_elements.py.
// Lines at or below this threshold are invisible (~1% of max brightness).
const INTENSITY_THRESHOLD = 10

interface Props {
  lines: SpectralLine[]  // must be sorted by wavelength ascending
  isEmission: boolean
  height?: number
}

export function SpectrumCanvas({ lines, isEmission, height = 150 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio ?? 1
    const rect = canvas.getBoundingClientRect()
    const w = rect.width
    const h = rect.height

    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    render(ctx, w, h, lines, isEmission)
  }, [lines, isEmission])

  // Re-render on resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const observer = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio ?? 1
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height

      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)

      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.scale(dpr, dpr)

      render(ctx, w, h, lines, isEmission)
    })

    observer.observe(canvas)
    return () => observer.disconnect()
  }, [lines, isEmission])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height }}
    />
  )
}

function render(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  lines: SpectralLine[],
  isEmission: boolean,
) {
  // Black background
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, width, height)

  if (lines.length === 0 && isEmission) return

  let lineOffset = 0

  // Skip lines that have shifted below the visible range — they don't contribute.
  // The original Java has this bug; we intentionally fix it here.
  while (lineOffset < lines.length && lines[lineOffset].w < WAVELENGTH_MIN) {
    lineOffset++
  }

  for (let x = 0; x < width; x++) {
    const wavelength = WAVELENGTH_MIN + (x / width) * WAVELENGTH_RANGE

    // Find max intensity of all lines whose wavelength falls in [prev, wavelength)
    let maxIntensity = 0
    while (lineOffset < lines.length && lines[lineOffset].w < wavelength) {
      if (lines[lineOffset].i > maxIntensity) {
        maxIntensity = lines[lineOffset].i
      }
      lineOffset++
    }

    const spectralColor = getSpectralColor(wavelength)
    if (!spectralColor) continue

    let r: number, g: number, b: number

    if (isEmission) {
      if (maxIntensity <= INTENSITY_THRESHOLD) {
        // No line here — black background
        continue
      }
      const log10 = Math.log10(maxIntensity - INTENSITY_THRESHOLD)
      if (log10 < 0) continue  // effectively invisible
      const scale = Math.min(log10 / 2, 1)
      // Interpolate: black → spectral color
      r = Math.round(spectralColor.r * scale)
      g = Math.round(spectralColor.g * scale)
      b = Math.round(spectralColor.b * scale)
    } else {
      // Absorption: start with full spectral color, darken by line intensity
      r = spectralColor.r
      g = spectralColor.g
      b = spectralColor.b

      if (maxIntensity > INTENSITY_THRESHOLD) {
        const log10 = Math.log10(maxIntensity - INTENSITY_THRESHOLD)
        if (log10 >= 2) {
          // Fully absorbed — black
          r = 0; g = 0; b = 0
        } else if (log10 > 0) {
          // Interpolate: spectral color → black
          const scale = 1 - Math.min(log10 / 2, 1)
          r = Math.round(r * scale)
          g = Math.round(g * scale)
          b = Math.round(b * scale)
        }
        // log10 <= 0: nearly no absorption, full color shows through
      }
    }

    const lineWidth = maxIntensity > INTENSITY_THRESHOLD
      ? Math.max(1, Math.floor(Math.log10(maxIntensity - INTENSITY_THRESHOLD)))
      : 1

    ctx.fillStyle = `rgb(${r},${g},${b})`
    ctx.fillRect(x - Math.floor(lineWidth / 2), 0, lineWidth, height)
  }
}
