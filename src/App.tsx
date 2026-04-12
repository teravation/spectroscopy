import { useEffect, useRef, useState } from 'react'
import './index.css'
import { SpectrumCanvas } from './components/SpectrumCanvas'
import { PeriodicTable } from './components/PeriodicTable'
import { DopplerSlider } from './components/DopplerSlider'
import { GameControls } from './components/GameControls'
import { PuzzleSettingsPanel } from './components/PuzzleSettingsPanel'
import { Toast } from './components/Toast'
import { useGameStore } from './store/gameStore'
import { useElements } from './data/useElements'
import { SAMPLE_ELEMENTS } from './data/sampleElements'

export function App() {
  const {
    targetPuzzle, working, isEmission, showVacuumWavelengths, gamePhase, settings,
    loadElements, generateNewPuzzle, toggleElement,
    setVelocity, setEmissionMode, setShowVacuumWavelengths, checkAnswer, getHint, resetWorking,
    targetLines, workingLines, updateSettings,
  } = useGameStore()

  const { data: elements } = useElements()
  const [toast, setToast] = useState({ message: '', visible: false })
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  function showToast(text: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message: text, visible: true })
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000)
  }

  useEffect(() => {
    loadElements(elements ?? SAMPLE_ELEMENTS)
  }, [elements, loadElements])

  function handleCheck() {
    const result = checkAnswer()
    showToast(result.correct ? 'Correct!' : 'Not quite!')
  }

  function handleHint() {
    const hint = getHint()
    let text = `You have ${hint.correctElementCount} of the ${hint.totalElements} elements correct.`
    if (targetPuzzle && targetPuzzle.targetVelocity !== 0) {
      if (hint.velocityHint === 'correct') text += '  Velocity is correct.'
      else if (hint.velocityHint === 'too_low') text += '  Velocity is too low.'
      else text += '  Velocity is too high.'
    }
    showToast(text)
  }

  function handleNewTarget() {
    generateNewPuzzle()
  }

  function handleReset() {
    resetWorking()
  }

  const displayElements = elements ?? SAMPLE_ELEMENTS

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Target spectrum */}
      <SpectrumCanvas lines={targetLines()} isEmission={isEmission} height={80} />
      {showSettings && (
        <PuzzleSettingsPanel settings={settings} onChange={updateSettings} />
      )}
      {/* Working spectrum */}
      <SpectrumCanvas lines={workingLines()} isEmission={isEmission} height={80} />
      <DopplerSlider velocity={working.velocity} onChange={setVelocity} />
      <div style={{ position: 'relative', height: 0, zIndex: 1000 }}>
        <Toast message={toast.message} visible={toast.visible} />
      </div>
      <PeriodicTable
        elements={displayElements}
        selectedIds={working.elementIds}
        onToggle={toggleElement}
        overlay={
          <GameControls
            gamePhase={gamePhase}
            isEmission={isEmission}
            showVacuumWavelengths={showVacuumWavelengths}
            showSettings={showSettings}
            onNewTarget={handleNewTarget}
            onCheck={handleCheck}
            onHint={handleHint}
            onReset={handleReset}
            onEmissionChange={setEmissionMode}
            onWavelengthTypeChange={setShowVacuumWavelengths}
            onToggleSettings={() => setShowSettings(s => !s)}
          />
        }
      />
    </div>
  )
}
