export interface SpectralLine {
  w: number  // wavelength in Angstroms
  i: number  // intensity
}

export interface Element {
  atomicNumber: number
  symbol: string
  name: string
  period: number
  group: number
  row: number   // 1–10; 9=lanthanides, 10=actinides
  col: number   // 1–18
  lines: SpectralLine[]
}

export interface PuzzleSettings {
  minElements: number          // 1–5
  maxElements: number          // minElements–5
  elementRowDepth: number      // 1–7 (rows of periodic table to draw from)
  dopplerEnabled: boolean

  // Optional: pre-programmed puzzle (overrides random generation)
  fixedElementIds?: number[]   // atomic numbers
  fixedVelocity?: number       // -1.0 to 1.0
}

export interface Puzzle {
  targetElements: Element[]
  targetVelocity: number
  settings: PuzzleSettings
}

export interface CheckResult {
  correct: boolean
}

export interface HintResult {
  correctElementCount: number
  totalElements: number
  velocityHint: 'correct' | 'too_low' | 'too_high'
}

export interface RGB {
  r: number
  g: number
  b: number
}

// The wavelength window rendered by SpectrumCanvas and the intensity floor
// below which lines are invisible. Used to determine whether an element has
// any lines that will actually appear on screen.
const RENDER_MIN = 4000
const RENDER_MAX = 7000
const RENDER_THRESHOLD = 10

export function hasRenderableLines(element: Element): boolean {
  return element.lines.some(
    l => l.w >= RENDER_MIN && l.w <= RENDER_MAX && l.i > RENDER_THRESHOLD
  )
}
