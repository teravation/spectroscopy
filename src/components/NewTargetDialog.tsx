import { useRef, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

interface Props {
  open: boolean
  onClose: () => void
}

export function NewTargetDialog({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { settings, updateSettings, generateNewPuzzle } = useGameStore()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      dialog.showModal()
    } else {
      if (dialog.open) dialog.close()
    }
  }, [open])

  // Sync native close event (Escape key) back to parent
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  function handleGo() {
    generateNewPuzzle()
    onClose()
  }

  return (
    <dialog ref={dialogRef} className="new-target-dialog">
      <h2 className="new-target-dialog__title">New Target</h2>

      <div className="new-target-dialog__row">
        <label className="new-target-dialog__label">Elements</label>
        <div className="new-target-dialog__controls">
          <span className="new-target-dialog__hint">min</span>
          <select
            className="new-target-dialog__select"
            value={settings.minElements}
            onChange={e => {
              const min = Number(e.target.value)
              updateSettings({ minElements: min, maxElements: Math.max(settings.maxElements, min) })
            }}
          >
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="new-target-dialog__hint">max</span>
          <select
            className="new-target-dialog__select"
            value={settings.maxElements}
            onChange={e => {
              const max = Number(e.target.value)
              updateSettings({ maxElements: max, minElements: Math.min(settings.minElements, max) })
            }}
          >
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div className="new-target-dialog__row">
        <label className="new-target-dialog__label">Rows</label>
        <select
          className="new-target-dialog__select"
          value={settings.elementRowDepth}
          onChange={e => updateSettings({ elementRowDepth: Number(e.target.value) })}
        >
          {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div className="new-target-dialog__row">
        <label className="new-target-dialog__label">Doppler shift</label>
        <input
          type="checkbox"
          checked={settings.dopplerEnabled}
          onChange={e => updateSettings({ dopplerEnabled: e.target.checked })}
          className="new-target-dialog__checkbox"
        />
      </div>

      <div className="new-target-dialog__buttons">
        <button className="new-target-dialog__btn-cancel" onClick={onClose}>Cancel</button>
        <button className="new-target-dialog__btn-go" onClick={handleGo}>Go</button>
      </div>
    </dialog>
  )
}
