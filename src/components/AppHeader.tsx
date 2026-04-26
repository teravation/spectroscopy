import { AdSlot } from './AdSlot'

interface Props {
  onMenuOpen: () => void
  hideAds?: boolean
}

export function AppHeader({ onMenuOpen, hideAds = false }: Props) {
  return (
    <header className="app-header">
      <div className="app-header__branding">
        {/* TODO: replace with transparent PNG export from logo.psd */}
        <span className="app-header__logo-text" aria-label="Teravation">TERAVATION</span>
        <span className="app-header__app-name">Spectroscopy</span>
        <button
          className="app-header__menu-btn"
          onClick={onMenuOpen}
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>
      {!hideAds && <AdSlot type="top" />}
    </header>
  )
}
