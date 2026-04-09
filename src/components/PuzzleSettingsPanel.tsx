import type { PuzzleSettings } from '../physics/types'

interface Props {
  settings: PuzzleSettings
  onChange: (s: Partial<PuzzleSettings>) => void
}

export function PuzzleSettingsPanel({ settings, onChange }: Props) {
  return (
    <div style={styles.panel}>
      <div style={styles.row}>
        <label style={styles.label}>Elements</label>
        <div style={styles.controls}>
          <span style={styles.hint}>min</span>
          <select
            style={styles.select}
            value={settings.minElements}
            onChange={e => {
              const min = Number(e.target.value)
              onChange({ minElements: min, maxElements: Math.max(settings.maxElements, min) })
            }}
          >
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span style={styles.hint}>max</span>
          <select
            style={styles.select}
            value={settings.maxElements}
            onChange={e => {
              const max = Number(e.target.value)
              onChange({ maxElements: max, minElements: Math.min(settings.minElements, max) })
            }}
          >
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div style={styles.row}>
        <label style={styles.label}>Rows</label>
        <div style={styles.controls}>
          <span style={styles.hint}>1–</span>
          <select
            style={styles.select}
            value={settings.elementRowDepth}
            onChange={e => onChange({ elementRowDepth: Number(e.target.value) })}
          >
            {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div style={styles.row}>
        <label style={styles.label}>Doppler</label>
        <div style={styles.controls}>
          <input
            type="checkbox"
            checked={settings.dopplerEnabled}
            onChange={e => onChange({ dopplerEnabled: e.target.checked })}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
  )
}

const styles = {
  panel: {
    background: '#111',
    border: '1px solid #444',
    padding: '6px 12px',
    display: 'flex',
    flexDirection: 'row' as const,
    gap: 16,
    flexWrap: 'wrap' as const,
    alignItems: 'center',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    color: '#aaa',
    fontSize: '0.8em',
    minWidth: 48,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  hint: {
    color: '#666',
    fontSize: '0.75em',
  },
  select: {
    background: '#222',
    color: '#fff',
    border: '1px solid #555',
    padding: '2px 4px',
    fontSize: '0.85em',
    cursor: 'pointer',
  },
} as const
