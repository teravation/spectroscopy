import type { Element, Puzzle, PuzzleSettings, SpectralLine } from './types'
import { shiftLines } from './doppler'

const VISIBLE_MIN = 3000
const VISIBLE_MAX = 7000
const MAX_RETRIES = 1000

export function generatePuzzle(settings: PuzzleSettings, elements: Element[]): Puzzle {
  if (settings.fixedElementIds) {
    return buildFixedPuzzle(settings, elements)
  }
  return generateRandom(settings, elements)
}

function buildFixedPuzzle(settings: PuzzleSettings, elements: Element[]): Puzzle {
  const targetElements = settings.fixedElementIds!
    .map(id => elements.find(e => e.atomicNumber === id))
    .filter((e): e is Element => e !== undefined)

  return {
    targetElements,
    targetVelocity: settings.fixedVelocity ?? 0,
    settings,
  }
}

function generateRandom(settings: PuzzleSettings, elements: Element[]): Puzzle {
  const pool = elements.filter(e => e.row <= settings.elementRowDepth && e.lines.length > 0)

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const count = settings.minElements + Math.floor(Math.random() * (settings.maxElements - settings.minElements + 1))

    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    const targetElements = shuffled.slice(0, count)

    const targetVelocity = settings.dopplerEnabled
      ? (Math.random() * 2 - 1)  // -1.0 to 1.0
      : 0

    // Validate: at least one line visible after Doppler shift
    if (hasVisibleLine(targetElements, targetVelocity)) {
      return { targetElements, targetVelocity, settings }
    }
  }

  throw new Error(`Could not generate a valid puzzle after ${MAX_RETRIES} attempts`)
}

function hasVisibleLine(elements: Element[], velocity: number): boolean {
  for (const element of elements) {
    const shifted: SpectralLine[] = shiftLines(element.lines, velocity)
    for (const line of shifted) {
      if (line.w >= VISIBLE_MIN && line.w <= VISIBLE_MAX && line.i > 5) {
        return true
      }
    }
  }
  return false
}
