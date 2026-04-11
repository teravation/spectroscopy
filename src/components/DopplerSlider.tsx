interface Props {
  velocity: number           // -1.0 to 1.0
  onChange: (v: number) => void
}

const VELOCITY_TICKS: Array<{ value: number; label: string }> = [
  { value: -100, label: 'c' },
  { value: -75,  label: '0.75c' },
  { value: -50,  label: '0.5c' },
  { value: -25,  label: '0.25c' },
  { value: 0,    label: '0' },
  { value: 25,   label: '0.25c' },
  { value: 50,   label: '0.5c' },
  { value: 75,   label: '0.75c' },
  { value: 100,  label: 'c' },
]

const DIRECTION_TICKS: Array<{ value: number; label: string }> = [
  { value: -50, label: 'Towards Viewer' },
  { value: 50,  label: 'Away From Viewer' },
]

const ALL_TICKS = [...VELOCITY_TICKS, ...DIRECTION_TICKS]

export function DopplerSlider({ velocity, onChange }: Props) {
  const sliderValue = Math.round(velocity * 100)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(parseInt(e.target.value, 10) / 100)
  }

  function tickLeft(value: number) {
    const pct = (value + 100) / 200
    return `calc(var(--slider-thumb-width) / 2 + ${pct} * (100% - var(--slider-thumb-width)))`
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.sliderWrapper}>
        <input
          type="range"
          min={-100}
          max={100}
          step={1}
          value={sliderValue}
          onChange={handleChange}
          style={styles.slider}
          aria-label="Doppler velocity"
          aria-valuemin={-100}
          aria-valuemax={100}
          aria-valuenow={sliderValue}
          aria-valuetext={ALL_TICKS.find(t => t.value === sliderValue)?.label ?? `${sliderValue}`}
        />
        <div style={styles.tickMarkRow}>
          {VELOCITY_TICKS.map(t => (
            <span key={t.value} style={{ ...styles.tickMark, left: tickLeft(t.value) }} />
          ))}
        </div>
      </div>
      <div style={styles.tickRow}>
        {VELOCITY_TICKS.map(t => (
          <span key={t.value} style={{ ...styles.tick, left: tickLeft(t.value) }}>
            {t.label}
          </span>
        ))}
      </div>
      <div style={styles.tickRow}>
        {DIRECTION_TICKS.map(t => (
          <span key={t.value} style={{ ...styles.tick, left: tickLeft(t.value) }}>
            {t.label}
          </span>
        ))}
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    background: '#000',
    padding: '4px 0',
  },
  slider: {
    width: '100%',
    cursor: 'pointer',
    accentColor: '#ffffff',
  },
  tickRow: {
    position: 'relative' as const,
    height: '1.4em',
    color: '#ffffff',
    fontSize: '0.7em',
  },
  sliderWrapper: {
    position: 'relative' as const,
  },
  tickMarkRow: {
    position: 'absolute' as const,
    inset: 0,
    pointerEvents: 'none' as const,
  },
  tickMark: {
    position: 'absolute' as const,
    display: 'inline-block' as const,
    width: '1px',
    height: 'calc(40% - 4px)',
    background: '#ffffff',
    top: 'calc(50% - 2px)',
    transform: 'translate(-50%, -50%)',
  },
  tick: {
    position: 'absolute' as const,
    transform: 'translateX(-50%)',
    whiteSpace: 'nowrap' as const,
    textAlign: 'center' as const,
  },
} as const
