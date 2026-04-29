import { create } from 'zustand'
import type { Element, Puzzle, PuzzleSettings, CheckResult, HintResult } from '../physics/types'
import { generatePuzzle } from '../physics/puzzleFactory'
import { shiftLines } from '../physics/doppler'
import { vacuumToAir } from '../physics/wavelength'

// Default settings match the original Java applet init()
const DEFAULT_SETTINGS: PuzzleSettings = {
  minElements: 2,
  maxElements: 2,
  elementRowDepth: 3,
  dopplerEnabled: false,
}

interface GameState {
  elements: Element[] | null
  targetPuzzle: Puzzle | null
  working: { elementIds: Set<number>; velocity: number }
  isEmission: boolean
  showVacuumWavelengths: boolean  // true = vacuum (default); false = air
  gamePhase: 'idle' | 'active' | 'solved'
  settings: PuzzleSettings

  // Derived — call these to get rendered line sets
  targetLines: () => { w: number; i: number }[]
  workingLines: () => { w: number; i: number }[]

  // Actions
  loadElements: (elements: Element[]) => void
  generateNewPuzzle: () => void
  toggleElement: (atomicNumber: number) => void
  setVelocity: (v: number) => void
  setEmissionMode: (emission: boolean) => void
  setShowVacuumWavelengths: (vacuum: boolean) => void
  checkAnswer: () => CheckResult
  getHint: () => HintResult
  resetWorking: () => void
  updateSettings: (s: Partial<PuzzleSettings>) => void
}

export const useGameStore = create<GameState>((set, get) => ({
  elements: null,
  targetPuzzle: null,
  working: { elementIds: new Set(), velocity: 0 },
  isEmission: true,
  showVacuumWavelengths: true,
  gamePhase: 'idle',
  settings: DEFAULT_SETTINGS,

  targetLines: () => {
    const { targetPuzzle, showVacuumWavelengths } = get()
    if (!targetPuzzle) return []
    const allLines = targetPuzzle.targetElements.flatMap(e => e.lines)
    const shifted = shiftLines(allLines, targetPuzzle.targetVelocity)
    const display = showVacuumWavelengths ? shifted : shifted.map(l => ({ w: vacuumToAir(l.w), i: l.i }))
    return display.sort((a, b) => a.w - b.w)
  },

  workingLines: () => {
    const { elements, working, showVacuumWavelengths } = get()
    if (!elements) return []
    const selected = elements.filter(e => working.elementIds.has(e.atomicNumber))
    const allLines = selected.flatMap(e => e.lines)
    const shifted = shiftLines(allLines, working.velocity)
    const display = showVacuumWavelengths ? shifted : shifted.map(l => ({ w: vacuumToAir(l.w), i: l.i }))
    return display.sort((a, b) => a.w - b.w)
  },

  loadElements: (elements) => set({ elements }),

  generateNewPuzzle: () => {
    const { elements, settings } = get()
    if (!elements) return
    const puzzle = generatePuzzle(settings, elements)
    set({
      targetPuzzle: puzzle,
      working: { elementIds: new Set(), velocity: 0 },
      gamePhase: 'active',
    })
  },

  toggleElement: (atomicNumber) => set(state => {
    const next = new Set(state.working.elementIds)
    if (next.has(atomicNumber)) next.delete(atomicNumber)
    else next.add(atomicNumber)
    return { working: { ...state.working, elementIds: next } }
  }),

  setVelocity: (v) => set(state => ({
    working: { ...state.working, velocity: v },
  })),

  setEmissionMode: (isEmission) => set({ isEmission }),

  setShowVacuumWavelengths: (vacuum) => set({ showVacuumWavelengths: vacuum }),

  checkAnswer: () => {
    const { targetPuzzle, working } = get()
    if (!targetPuzzle) return { correct: false }

    const targetIds = new Set(targetPuzzle.targetElements.map(e => e.atomicNumber))
    const workingIds = working.elementIds

    const sameElements =
      targetIds.size === workingIds.size &&
      [...targetIds].every(id => workingIds.has(id))

    const velocityCorrect =
      Math.abs(working.velocity - targetPuzzle.targetVelocity) < 0.01

    const correct = sameElements && velocityCorrect
    if (correct) set({ gamePhase: 'solved' })
    return { correct }
  },

  getHint: () => {
    const { targetPuzzle, working } = get()
    if (!targetPuzzle) return { correctElementCount: 0, totalElements: 0, velocityHint: 'correct' }

    const targetIds = new Set(targetPuzzle.targetElements.map(e => e.atomicNumber))
    const correctElementCount = [...working.elementIds].filter(id => targetIds.has(id)).length
    const totalElements = targetPuzzle.targetElements.length

    let velocityHint: HintResult['velocityHint'] = 'correct'
    // Only give velocity hint if the target has a non-zero velocity (matches Java behavior)
    if (targetPuzzle.targetVelocity !== 0) {
      const diff = working.velocity - targetPuzzle.targetVelocity
      if (Math.abs(diff) < 0.01) velocityHint = 'correct'
      else if (diff < 0) velocityHint = 'too_low'
      else velocityHint = 'too_high'
    }

    return { correctElementCount, totalElements, velocityHint }
  },

  resetWorking: () => set({
    targetPuzzle: null,
    working: { elementIds: new Set(), velocity: 0 },
    gamePhase: 'idle',
  }),

  updateSettings: (s) => set(state => ({
    settings: { ...state.settings, ...s },
  })),
}))
