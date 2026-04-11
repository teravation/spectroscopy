interface Props {
  message: string
  visible: boolean
}

export function Toast({ message, visible }: Props) {
  if (!message) return null
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(15, 15, 15, 0.92)',
      color: '#fff',
      padding: '12px 28px',
      border: '1px solid #555',
      fontSize: '1em',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      zIndex: 1000,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.4s',
    }}>
      {message}
    </div>
  )
}
