# Spectroscopy — Build Plan

Phase status, open tasks, and verification checklist. Architecture decisions and spec live in **[PROJECT.md](PROJECT.md)**.

---

## Phased Build Order

### Phase 1 — Playable core ✅
- [x] Init GitHub repo; scaffold Vite + React + TS; add GitHub Actions deploy workflow
- [x] Run `scripts/fetch_elements.py` → upload `elements.json` to S3
- [x] Port physics layer (`types.ts`, `doppler.ts`, `wavelengthToColor.ts`) + unit tests
- [x] `useElements.ts` — React Query fetch from S3
- [x] `SpectrumCanvas.tsx` — validate H and He spectra visually (known fingerprints)
- [x] `PeriodicTable.tsx` — CSS Grid from element `row`/`col` data
- [x] `DopplerSlider.tsx` — wired to Zustand velocity, live repaint
- [x] `PuzzleGenerator` (random mode only)
- [x] Wire `App.tsx` — game is now playable end-to-end
- [x] Deploy to S3 + CloudFront; verify elements.json loads and spectra render

### Phase 1a — Additions and fixes post-launch ✅
- [x] Air/vacuum wavelength toggle (Edlén formula applied at render time; Vacuum/Air in menu)
- [x] Periodic table layout: Lu/Lr in main body group 3; La/Ac at f-block start; d-block column offsets corrected
- [x] Doppler slider tick marks at labeled positions — CSS overlay for cross-browser consistency
- [x] Absorption mode: fixed early-return guard so rainbow continuum renders with no elements selected
- [x] Zero-line / no-renderable-line elements: dimmed in PT, excluded from puzzle pool (`hasRenderableLines()`)
- [x] Te, Rn, Fr, Yb, Np correctly dimmed — had lines in data but none above render threshold in visible range

### Phase 2 — UX redesign + responsive layout ✅
- [x] Full UX redesign: hamburger menu (`AppMenu`), all game controls off the game surface
- [x] `AppHeader` — TERAVATION branding + ☰ trigger + optional top ad slot
- [x] `NewTargetDialog` — settings dialog opened by New Target (matches original Java applet flow)
- [x] Always-square PT cells via CSS container queries: `--cell = min(cqw/18, cqh/9)`
- [x] PT zoom mode: magnifying glass toggle (44px touch target), auto-zoom on `max-height: 500px`
- [x] Controls bar: compact floating pill (sized to longest element name), centered over PT top edge
- [x] Context-sensitive controls bar right slot: ✓ Check when active, ▶ New Target when solved
- [x] "▶ New Target…" button overlaid on target spectrum canvas when idle
- [x] Toast feedback centered in target spectrum canvas
- [x] Element name display in controls bar — fires on hover and tap (including dimmed elements)
- [x] Landscape phone layout: `max-height: 500px` media query shrinks spectra to `clamp(36px, 8vh, 60px)`, hides Doppler direction labels, auto-zooms PT
- [x] Default puzzle settings changed to 2 elements from first 3 rows (more approachable)
- [x] `vite.config.ts`: `server.host = true` for LAN dev access

### Phase 2 — Still open
- [ ] Keyboard navigation on periodic table (arrow keys move focus, Enter toggles, Tab to next button)
- [ ] ARIA labels on spectrum canvases (e.g. "Target spectrum: 2 elements, slight redshift")
- [ ] First-visit tutorial overlay (dismissible, stored in `localStorage`)
- [ ] Spectral line QA: compare rendered spectra against Ohio State reference images; tune `INTENSITY_THRESHOLD` and consider extending canvas left edge to ~3800 Å for Hε
- [ ] Dataset version in ☰ menu (e.g. "Dataset: April 2026") — hook exists, needs real value wired
- [ ] Licenses / copyright in ☰ menu — hook exists, needs content

### Phase 3 — Educator URL sharing
- [ ] Bidirectional URL param sync: changing settings updates URL; loading URL restores settings
- [ ] Pre-programmed puzzle support via `?elements=1,2,11&velocity=0.35`
- [ ] Encrypted student URL via `?puzzle=<token>` (AES-GCM, bundle key Phase 1 → server key Phase 2)

### Phase 4 — PWA + offline
- [ ] Configure `vite-plugin-pwa`: pre-cache app shell, network-first for `elements.json` with offline fallback

### Phase 5 — Science / About page
- [ ] Public-facing "How it works" page (`/about` route or modal). Audience: players, teachers, museum visitors.
  - What spectroscopy is and how astronomers use it
  - Aki normalization: why our spectra differ from discharge tube photos
  - Doppler shift and what velocity means
  - Why Iron looks dense and overwhelming; why Iodine looks sparse (atomic vs molecular I₂)
  - External links: NIST ASD, OSU reference spectra, HyperPhysics, Wikipedia

### Phase 6 — Branding + ads
- [ ] `useBranding.ts` — load brand config from S3 by subdomain or `?brand=` param
- [ ] CSS variables from brand config (`--color-primary`, `--color-accent`, etc.)
- [ ] `AdSlot.tsx` — replace placeholder with real AdSense loading (top: small banner; bottom: leaderboard)
- [ ] Test subdomain routing locally via `/etc/hosts`

---

## Verification Checklist

- [ ] H, He, Na spectra match known reference images. Na doublet (~5890 Å) = two bright adjacent yellow lines.
- [ ] Doppler: `velocity=0.1` shifts all lines ~10% redward; `velocity=-0.1` = blueshift.
- [ ] Puzzle solve: select correct elements + match velocity within 1 slider tick → "Correct!" toast in target canvas.
- [ ] Pre-programmed: `?elements=1,2&velocity=0.00` → exact puzzle loads immediately on start.
- [ ] URL sharing: changing settings updates URL; loading that URL restores settings.
- [ ] Branding: `?brand=test` → custom logo/colors applied, ads absent.
- [ ] Offline: load once, kill network, reload → game still fully playable.
- [ ] HiDPI: spectra appear crisp (not blurry) on Retina/HiDPI displays.
- [ ] AWS Cost Explorer < $2/month after launch.
