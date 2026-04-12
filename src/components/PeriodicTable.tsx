import { useState } from 'react'
import type React from 'react'
import type { Element } from '../physics/types'

interface Props {
  elements: Element[]
  selectedIds: Set<number>
  onToggle: (atomicNumber: number) => void
  maxRow?: number
  overlay?: React.ReactNode
}

// Element rows 9–10 (lanthanides/actinides) → grid rows 9–10
// Row 8 is left empty as a visual spacer gap
function elementGridRow(row: number): number {
  return row
}

export function PeriodicTable({ elements, selectedIds, onToggle, maxRow, overlay }: Props) {
  const [hoveredName, setHoveredName] = useState('')

  const visible = maxRow ? elements.filter(e => e.row <= maxRow) : elements

  return (
    <div style={styles.wrapper}>
      <div className="pt-grid" style={styles.grid}>
        {overlay && (
          <div style={styles.overlay}>
            {overlay}
          </div>
        )}
        {visible.map(e => {
          const hasLines = e.lines.length > 0
          const isSelected = selectedIds.has(e.atomicNumber)
          const color = isSelected ? '#ffff00' : hasLines ? '#ffffff' : '#333333'
          return (
            <div
              key={e.atomicNumber}
              role={hasLines ? 'button' : undefined}
              tabIndex={hasLines ? 0 : undefined}
              onClick={hasLines ? () => onToggle(e.atomicNumber) : undefined}
              onKeyDown={hasLines ? ev => { if (ev.key === 'Enter' || ev.key === ' ') onToggle(e.atomicNumber) } : undefined}
              onMouseEnter={() => setHoveredName(e.name)}
              onMouseLeave={() => setHoveredName('')}
              style={{
                ...styles.cell,
                gridRow: elementGridRow(e.row),
                gridColumn: e.col,
                color,
                cursor: hasLines ? 'pointer' : 'default',
                // box-shadow extends outside the cell — adjacent cells' shadows
                // overlap at the shared edge, producing a single visible line
                boxShadow: `0 0 0 1px #ffffff`,
              }}
              aria-pressed={hasLines ? isSelected : undefined}
              aria-label={e.name}
            >
              <span className="pt-number">{e.atomicNumber}</span>
              <span className="pt-symbol">{e.symbol}</span>
            </div>
          )
        })}
      </div>
      <div style={styles.statusBar}>{hoveredName}</div>
    </div>
  )
}

const styles = {
  wrapper: {
    background: '#000',
    userSelect: 'none' as const,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(18, 1fr)',
    gridTemplateRows: 'repeat(7, 1fr) 4px repeat(2, 1fr)',
    gap: 0,
    margin: '0 4px 4px',
    padding: 1,
  },
  overlay: {
    gridColumn: '3 / 13',
    gridRow: '1 / 4',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'flex-end',
    padding: '0 4px 4px',
    boxSizing: 'border-box' as const,
    overflow: 'hidden',
  },
  cell: {
    background: '#000',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    padding: '1px 2px',
    aspectRatio: '1',
    cursor: 'pointer',
    minWidth: 0,
  },
  statusBar: {
    color: '#ffffff',
    textAlign: 'center' as const,
    padding: '2px 0',
    fontSize: '0.85em',
    minHeight: '1.2em',
  },
} as const
