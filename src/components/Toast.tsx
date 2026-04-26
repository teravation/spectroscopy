interface Props {
  message: string
  visible: boolean
}

export function Toast({ message, visible }: Props) {
  if (!message) return null
  return (
    <div
      className="toast"
      style={{ opacity: visible ? 1 : 0 }}
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </div>
  )
}
