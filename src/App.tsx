import { useEffect, useState } from 'react'
import './index.css'
import { SpectrumCanvas } from './components/SpectrumCanvas'
import { PeriodicTable } from './components/PeriodicTable'
import { DopplerSlider } from './components/DopplerSlider'
import { GameControls } from './components/GameControls'
import { useGameStore } from './store/gameStore'
import { SAMPLE_ELEMENTS } from './data/sampleElements'

export function App() {
  const {
    targetPuzzle, working, isEmission, gamePhase,
    loadElements, generateNewPuzzle, toggleElement,
    setVelocity, setEmissionMode, checkAnswer, getHint, resetWorking,
    targetLines, workingLines,
  } = useGameStore()

  const [message, setMessage] = useState('')

  useEffect(() => {
    loadElements(SAMPLE_ELEMENTS)
  }, [loadElements])

  function handleCheck() {
    const result = checkAnswer()
    if (result.correct) {
      setMessage('Correct!')
    } else {
      setMessage('Not quite!')
    }
  }

  function handleHint() {
    const hint = getHint()
    let text = `You have ${hint.correctElementCount} of the ${hint.totalElements} elements correct.`
    if (targetPuzzle && targetPuzzle.targetVelocity !== 0) {
      if (hint.velocityHint === 'correct') text += '  The velocity is correct.'
      else if (hint.velocityHint === 'too_low') text += '  The velocity is too low.'
      else text += '  The velocity is too high.'
    }
    setMessage(text)
  }

  function handleNewTarget() {
    setMessage('')
    generateNewPuzzle()
  }

  function handleReset() {
    setMessage('')
    resetWorking()
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Target spectrum */}
      <SpectrumCanvas lines={targetLines()} isEmission={isEmission} height={80} />
      <GameControls
        gamePhase={gamePhase}
        isEmission={isEmission}
        onNewTarget={handleNewTarget}
        onCheck={handleCheck}
        onHint={handleHint}
        onReset={handleReset}
        onEmissionChange={setEmissionMode}
      />
      {/* Working spectrum */}
      <SpectrumCanvas lines={workingLines()} isEmission={isEmission} height={80} />
      <DopplerSlider velocity={working.velocity} onChange={setVelocity} />
      {message && (
        <div style={{ color: '#fff', textAlign: 'center', padding: '4px', fontSize: '0.9em' }}>
          {message}
        </div>
      )}
      <PeriodicTable
        elements={SAMPLE_ELEMENTS}
        selectedIds={working.elementIds}
        onToggle={toggleElement}
      />
    </div>
  )
}
