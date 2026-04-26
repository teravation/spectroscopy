import type React from 'react'
import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

interface Props {
  open: boolean
  onClose: () => void
  onNewTarget: () => void
  onCheck: () => void
  onHint: () => void
}

export function AppMenu({ open, onClose, onNewTarget, onCheck, onHint }: Props) {
  const {
    gamePhase,
    isEmission,
    showVacuumWavelengths,
    setEmissionMode,
    setShowVacuumWavelengths,
    resetWorking,
  } = useGameStore()

  const hasTarget = gamePhase !== 'idle'

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  function handleReset() {
    resetWorking()
    onClose()
  }

  return (
    <>
      <div
        className={`app-menu-backdrop${open ? ' app-menu-backdrop--open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <nav
        className={`app-menu-panel${open ? ' app-menu-panel--open' : ''}`}
        aria-label="Game menu"
        aria-hidden={!open}
      >
        <div className="app-menu-header">
          <button className="app-menu-close" onClick={onClose} aria-label="Close menu">
            ✕
          </button>
        </div>

        <div className="app-menu-section">
          <MenuItem onClick={() => { onClose(); onNewTarget() }}>▶  New Target…</MenuItem>
          <MenuItem onClick={onCheck} disabled={!hasTarget}>✓  Check Answer</MenuItem>
          <MenuItem onClick={onHint} disabled={!hasTarget}>💡  Hint</MenuItem>
          <MenuItem onClick={handleReset}>↺  Reset</MenuItem>
        </div>

        <div className="app-menu-divider" />

        <div className="app-menu-section">
          <div className="app-menu-group-label">Spectrum type</div>
          <RadioItem
            name="menu-spectrum"
            checked={isEmission}
            onChange={() => setEmissionMode(true)}
          >
            Emission
          </RadioItem>
          <RadioItem
            name="menu-spectrum"
            checked={!isEmission}
            onChange={() => setEmissionMode(false)}
          >
            Absorption
          </RadioItem>
        </div>

        <div className="app-menu-divider" />

        <div className="app-menu-section">
          <div className="app-menu-group-label">Wavelengths</div>
          <RadioItem
            name="menu-wavelength"
            checked={showVacuumWavelengths}
            onChange={() => setShowVacuumWavelengths(true)}
          >
            Vacuum
          </RadioItem>
          <RadioItem
            name="menu-wavelength"
            checked={!showVacuumWavelengths}
            onChange={() => setShowVacuumWavelengths(false)}
          >
            Air
          </RadioItem>
        </div>

        <div className="app-menu-divider" />

        <div className="app-menu-section">
          <MenuItem onClick={onClose}>ℹ  About…</MenuItem>
        </div>
      </nav>
    </>
  )
}

function MenuItem({ onClick, disabled, children }: {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      className={`app-menu-item${disabled ? ' app-menu-item--disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

function RadioItem({ name, checked, onChange, children }: {
  name: string
  checked: boolean
  onChange: () => void
  children: React.ReactNode
}) {
  return (
    <label className="app-menu-radio">
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      {children}
    </label>
  )
}
