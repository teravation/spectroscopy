# Spectroscopy — Build Plan

Phase status, open tasks, and verification checklist. Architecture decisions and spec live in **[PROJECT.md](PROJECT.md)**.

---

## Phased Build Order

### Phase 1 — Playable core ✅
- [x] Init GitHub repo; scaffold Vite + React + TS; add GitHub Actions deploy workflow
- [x] Run `scripts/convert-elements.ts` → upload `elements.json` to S3
- [x] Port physics layer (`types.ts`, `doppler.ts`, `wavelengthToColor.ts`) + unit tests
- [x] `useElements.ts` — React Query fetch from S3
- [x] `SpectrumCanvas.tsx` — validate H and He spectra visually (known fingerprints)
- [x] `PeriodicTable.tsx` — CSS Grid from element `row`/`col` data
- [x] `DopplerSlider.tsx` — wired to Zustand velocity, live repaint
- [x] `GameControls.tsx` + `PuzzleGenerator` (random mode only)
- [x] Wire `App.tsx` — game is now playable end-to-end
- [x] Deploy to S3 + CloudFront; verify elements.json loads and spectra render

### Phase 1a — Additions and fixes post-launch
- [ ] Air/vacuum wavelength toggle in UI (near Emission/Absorption toggle). Store air wavelengths as canonical; convert to vacuum at render time using Edlén formula. Toggle state lives in Zustand store (`useVacuumWavelengths: boolean`). Doppler shift is applied first (in air), then converted for display. Puzzle answer checking always uses air wavelengths regardless of toggle.
- [x] Periodic table layout: Lu/Lr moved to main body group 3 (rows 6/7, col 3, under Sc/Y); La/Ac stay at start of f-block rows (rows 9/10, col 3); Ce–Yb and Th–No at cols 4–16; d-block (Hf–At, Rf–Ts) corrected to cols 4–17 (was off by +1 due to old script placing both La and Lu in main body).
- [x] Layout condensation: game controls (buttons + Emission/Absorption toggle) moved into the PT empty space (cols 3–12, rows 1–3); message area fixed-height (no layout shift); page title → "Spectroscopy"; favicon.ico added.
- [x] Doppler slider tick marks at labeled positions (−100, −75, −50, −25, 0, +25, +50, +75, +100). CSS overlay preferred over native `<datalist>` for cross-browser consistency.
- [x] Absorption mode shows black canvas when no elements selected — fixed early-return guard to allow rainbow continuum to render.
- [ ] Zero-line elements: exclude from puzzle generation pool (puzzleFactory already filters `e.lines.length > 0` but elements.json may include entries below display threshold — audit and drop or raise floor).
- [x] Message area layout shift: fixed — message area is now a fixed-height container with absolutely-positioned text.

### Phase 2 — Educator URL sharing
- [x] `PuzzleSettingsPanel.tsx` — component exists
- [ ] Bidirectional URL param sync (changing settings updates URL; loading URL restores settings)
- [ ] Pre-programmed puzzle support via `?elements=1,2,11&velocity=0.35`
- [ ] Default settings panel: match original dialog defaults (min=1, max=2, rows=3, doppler=No)

### Phase 3 — PWA + offline
- [ ] Configure `vite-plugin-pwa`: pre-cache app shell, network-first cache for `elements.json` with offline fallback

### Phase 4 — Branding + ads
- [ ] `useBranding.ts` + `BrandingHeader.tsx` + CSS variables on `:root`
- [ ] `AdSlot.tsx` — conditional AdSense loading
- [ ] Test subdomain routing locally via `/etc/hosts`

### Phase 5 — Polish
- [ ] **PT zoom toggle** — button (in bottom-left or bottom-right PT gap: rows 9–10, cols 1–2 or 17–18) that switches between fit-all view (current) and zoomed view (fixed ~44px cells, PT scrolls independently in both directions with `overflow: auto`). Fixes mobile touch targets. Works on desktop too for accessibility.
- [ ] **Mobile layout** — when zoom is on, fix the header (spectra + slider + message) and make the PT fill remaining viewport height as a scroll container. Non-game controls (New Target, Settings) move to a ⋮ overflow menu to reclaim vertical space.
- [ ] Keyboard navigation on periodic table (arrow keys move focus, Enter toggles, Tab to buttons)
- [ ] ARIA labels on spectrum canvases (text description: "Target spectrum: 3 elements, moderate redshift")
- [ ] **Mobile portrait (≤390px) layout** — tested at 390×844 (iPhone 14):
  - [ ] Horizontal overflow: page renders ~516px wide, causing horizontal scroll — root cause is the 18-column periodic table with no mobile breakpoint; needs `overflow-x: hidden` on root + responsive table scaling
  - [ ] Button bar clips: "New Target" wraps to 2 lines; "Absorption" label overflows and is cut off at viewport edge — button bar needs wrapping or condensed layout at narrow widths
  - [ ] Touch targets: periodic table cells render ~20px each, well below the 44px minimum — cells need to scale up or the table needs a horizontal-scroll container with fixed cell size
  - [ ] Canvases very short (~60px each) at narrow width — consider stacking canvases vertically with min-height
- [ ] **Mobile landscape (844×390) layout** — tested at 844×390:
  - [ ] No horizontal overflow at this width ✓
  - [ ] Both canvases crushed to ~50px each — spectra barely readable; height-constrained layout needed
  - [ ] Periodic table extends below fold; requires vertical scroll to reach most elements
  - [ ] Consider `transform: scale()` on the root container to fit everything in viewport height without scrolling
- [ ] Periodic table cell density: hide atomic number on small screens; show element name inside cell on large screens (≥1400px)
- [ ] Font sizing polish: cqw-based scaling needs tuning across breakpoints — symbols and atomic numbers should feel proportional at all screen sizes
- [ ] First-visit tutorial overlay (dismissible, stored in `localStorage`)
- [ ] Spectral line QA: compare rendered spectra against Ohio State reference images; tune INTENSITY_THRESHOLD and canvas range (consider extending left edge to ~3800 Å for Hε)

---

## Verification Checklist

- [ ] H, He, Na spectra match known reference images. Na doublet (~5890 Å) = two bright adjacent yellow lines.
- [ ] Doppler: `velocity=0.1` shifts all lines ~10% redward; `velocity=-0.1` = blueshift.
- [ ] Puzzle solve: select correct elements + match velocity within 1 slider tick → "Correct!"
- [ ] Pre-programmed: `?elements=1,2&velocity=0.00` → exact puzzle loads immediately on start, no random generation.
- [ ] URL sharing: changing settings updates URL; loading that URL restores settings.
- [ ] Branding: `?brand=test` → custom logo/colors applied, ads absent.
- [ ] Offline: load once, kill network, reload → game still fully playable.
- [ ] HiDPI: spectra appear crisp (not blurry) on Retina/HiDPI displays.
- [ ] AWS Cost Explorer < $2/month after launch.
