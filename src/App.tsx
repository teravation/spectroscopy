import { useEffect, useRef, useState } from 'react'
import './index.css'
import { SpectrumCanvas } from './components/SpectrumCanvas'
import { PeriodicTable } from './components/PeriodicTable'
import { DopplerSlider } from './components/DopplerSlider'
import { AppHeader } from './components/AppHeader'
import { AppMenu } from './components/AppMenu'
import { NewTargetDialog } from './components/NewTargetDialog'
import { AdSlot } from './components/AdSlot'
import { Toast } from './components/Toast'
import { useGameStore } from './store/gameStore'
import { useElements } from './data/useElements'
import { SAMPLE_ELEMENTS } from './data/sampleElements'

export function App() {
  const {
    working, isEmission, gamePhase,
    loadElements, toggleElement, setVelocity,
    checkAnswer, getHint, targetLines, workingLines,
    targetPuzzle,
  } = useGameStore()

  const { data: elements } = useElements()
  const [menuOpen, setMenuOpen] = useState(false)
  const [newTargetOpen, setNewTargetOpen] = useState(false)
  const [zoomMode, setZoomMode] = useState(false)
  const [hoveredElement, setHoveredElement] = useState('')
  const [toast, setToast] = useState({ message: '', visible: false })
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    loadElements(elements ?? SAMPLE_ELEMENTS)
  }, [elements, loadElements])

  // Auto-zoom when viewport is too short for usable fit-mode cells (landscape phones).
  // Bidirectional: silently exits zoom mode when rotating back to portrait.
  // User can always manually override with the zoom button between resize events.
  useEffect(() => {
    const mq = window.matchMedia('(max-height: 500px)')
    const update = () => setZoomMode(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Set controls bar width to fit the longest element name exactly
  useEffect(() => {
    const els = elements ?? SAMPLE_ELEMENTS
    if (!els.length) return
    const longest = els.reduce(
      (a, b) => a.name.length >= b.name.length ? a : b
    ).name
    // Measure rendered text width using a temp span matching .pt-element-name styles
    const span = document.createElement('span')
    span.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font-size:0.85em;font-family:sans-serif;'
    span.textContent = longest
    document.body.appendChild(span)
    const textWidth = span.getBoundingClientRect().width
    document.body.removeChild(span)
    // icon(44) + bar-padding(2×8) + text-breathing(2×8) + textWidth + spacer(44)
    const barWidth = 44 + 16 + 16 + textWidth + 44
    document.documentElement.style.setProperty(
      '--pt-controls-bar-width', `${Math.ceil(barWidth)}px`
    )
  }, [elements])

  function showToast(text: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message: text, visible: true })
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000)
  }

  function handleNewTarget() {
    setNewTargetOpen(true)
  }

  function handleCheck() {
    setMenuOpen(false) // no-op if called from controls bar, harmless
    const result = checkAnswer()
    showToast(result.correct ? 'Correct!' : 'Not quite!')
  }

  function handleHint() {
    setMenuOpen(false)
    const hint = getHint()
    let text = `You have ${hint.correctElementCount} of the ${hint.totalElements} elements correct.`
    if (targetPuzzle && targetPuzzle.targetVelocity !== 0) {
      if (hint.velocityHint === 'correct') text += '  Velocity is correct.'
      else if (hint.velocityHint === 'too_low') text += '  Velocity is too low.'
      else text += '  Velocity is too high.'
    }
    showToast(text)
  }

  const displayElements = elements ?? SAMPLE_ELEMENTS

  return (
    <div className={`app${zoomMode ? ' app--zoom' : ''}`}>

      {/* Sticky zone — stays visible in zoom mode */}
      <div className="sticky-zone">
        <AppHeader onMenuOpen={() => setMenuOpen(true)} hideAds={false} />

        <div className="spectra-section">
          {/* Target spectrum — shows "New Target" invite when idle, feedback toast when active */}
          <div className="spectrum-row">
            <SpectrumCanvas lines={targetLines()} isEmission={isEmission} />
            {gamePhase === 'idle' && (
              <button className="spectrum-cta" onClick={handleNewTarget}>
                ▶ New Target…
              </button>
            )}
            <Toast message={toast.message} visible={toast.visible} />
          </div>
          <div className="spectrum-row">
            <SpectrumCanvas lines={workingLines()} isEmission={isEmission} />
          </div>
          <DopplerSlider velocity={working.velocity} onChange={setVelocity} />
        </div>

        {/* Always-visible bar: zoom toggle + element name + context action */}
        <div className="pt-controls-bar">
          <button
            className="pt-zoom-btn"
            onClick={() => setZoomMode(z => !z)}
            aria-label={zoomMode ? 'Fit to screen' : 'Zoom for touch'}
            title={zoomMode ? 'Fit to screen' : 'Zoom for touch'}
          >
            {zoomMode ? <MagMinusIcon /> : <MagPlusIcon />}
          </button>
          <span className="pt-element-name">{hoveredElement}</span>
          {/* Right slot: context-sensitive by game phase */}
          {gamePhase === 'active'
            ? <button className="pt-check-btn" onClick={handleCheck} title="Check Answer">
                <CheckIcon />
              </button>
            : gamePhase === 'solved'
            ? <button className="pt-check-btn" onClick={handleNewTarget} title="New Target">
                ▶
              </button>
            : <span className="pt-controls-spacer" aria-hidden="true" />
          }
        </div>
      </div>

      {/* Periodic table + bottom ad zone */}
      <div className="pt-section">
        <PeriodicTable
          elements={displayElements}
          selectedIds={working.elementIds}
          onToggle={toggleElement}
          onElementHover={setHoveredElement}
          zoomMode={zoomMode}
        />
        <div className="bottom-ad-zone">
          <AdSlot type="bottom" />
        </div>
      </div>

      {/* Overlays */}
      <AppMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNewTarget={handleNewTarget}
        onCheck={handleCheck}
        onHint={handleHint}
      />
      <NewTargetDialog
        open={newTargetOpen}
        onClose={() => setNewTargetOpen(false)}
      />
    </div>
  )
}

function MagPlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="7.5" cy="7.5" r="5" />
      <line x1="4.5" y1="7.5" x2="10.5" y2="7.5" />
      <line x1="7.5" y1="4.5" x2="7.5" y2="10.5" />
      <line x1="11.5" y1="11.5" x2="16" y2="16" />
    </svg>
  )
}

function MagMinusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="7.5" cy="7.5" r="5" />
      <line x1="4.5" y1="7.5" x2="10.5" y2="7.5" />
      <line x1="11.5" y1="11.5" x2="16" y2="16" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,9 7,14 16,4" />
    </svg>
  )
}
