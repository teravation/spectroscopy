import type { Element } from '../physics/types'
import { hasRenderableLines } from '../physics/types'

interface Props {
  elements: Element[]
  selectedIds: Set<number>
  onToggle: (atomicNumber: number) => void
  onElementHover: (name: string) => void
  maxRow?: number
  zoomMode: boolean
}

export function PeriodicTable({ elements, selectedIds, onToggle, onElementHover, maxRow, zoomMode }: Props) {
  const visible = maxRow ? elements.filter(e => e.row <= maxRow) : elements

  return (
    <div className={`pt-wrapper${zoomMode ? ' pt-wrapper--zoom' : ''}`}>
      <div className={`pt-grid${zoomMode ? ' pt-grid--zoom' : ''}`}>
        {visible.map(e => {
          const hasLines = hasRenderableLines(e)
          const isSelected = selectedIds.has(e.atomicNumber)
          const color = isSelected ? '#ffff00' : hasLines ? '#ffffff' : '#333333'
          return (
            <div
              key={e.atomicNumber}
              role={hasLines ? 'button' : undefined}
              tabIndex={hasLines ? 0 : undefined}
              onClick={hasLines ? () => { onElementHover(e.name); onToggle(e.atomicNumber) } : undefined}
              onKeyDown={hasLines ? ev => { if (ev.key === 'Enter' || ev.key === ' ') onToggle(e.atomicNumber) } : undefined}
              onMouseEnter={hasLines ? () => onElementHover(e.name) : undefined}
              onMouseLeave={hasLines ? () => onElementHover('') : undefined}
              className="pt-cell"
              style={{
                gridRow: e.row,
                gridColumn: e.col,
                color,
                cursor: hasLines ? 'pointer' : 'default',
                boxShadow: '0 0 0 1px #ffffff',
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
    </div>
  )
}
