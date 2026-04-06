interface Props {
  gamePhase: 'idle' | 'active' | 'solved'
  isEmission: boolean
  onNewTarget: () => void
  onCheck: () => void
  onHint: () => void
  onReset: () => void
  onEmissionChange: (emission: boolean) => void
}

export function GameControls({
  gamePhase,
  isEmission,
  onNewTarget,
  onCheck,
  onHint,
  onReset,
  onEmissionChange,
}: Props) {
  const hasTarget = gamePhase !== 'idle'

  return (
    <div style={styles.wrapper}>
      <div style={styles.left}>
        <button style={styles.button} onClick={onNewTarget}>
          New Target
        </button>
        <button style={styles.button} onClick={onCheck} disabled={!hasTarget}>
          Check
        </button>
        <button style={styles.button} onClick={onHint} disabled={!hasTarget}>
          Hint
        </button>
      </div>
      <div style={styles.right}>
        <label style={styles.radioLabel}>
          <input
            type="radio"
            name="spectrumType"
            checked={isEmission}
            onChange={() => onEmissionChange(true)}
          />
          Emission
        </label>
        <label style={styles.radioLabel}>
          <input
            type="radio"
            name="spectrumType"
            checked={!isEmission}
            onChange={() => onEmissionChange(false)}
          />
          Absorption
        </label>
        <button style={styles.button} onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#000',
    padding: '4px 8px',
    gap: 8,
  },
  left: {
    display: 'flex',
    gap: 4,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    background: '#222',
    color: '#fff',
    border: '1px solid #666',
    padding: '3px 10px',
    cursor: 'pointer',
    fontSize: '0.85em',
  },
  radioLabel: {
    color: '#fff',
    fontSize: '0.85em',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
} as const
