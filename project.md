# Spectroscopy Web App v2 — Full Project Specification

## Context

The original Spectroscopy app (Java Swing, circa 2003) was a puzzle-based educational tool teaching how astronomers identify elemental composition and radial velocity of stars via spectroscopy. It has proven real-world traction — deployed at the Denver Museum of Nature & Science and in college curricula. The goal is to reboot it as a modern React web app: keep it free to play, cover hosting via AdSense + branded institutional deals (museums, universities), and host cheaply on AWS. Open-sourced on GitHub.

The app is stateless — no backend or user accounts needed for the core experience, so hosting costs are near-zero.

---

## Tech Stack

| Technology | Purpose | Link |
|---|---|---|
| [React](https://react.dev) | UI framework | https://react.dev |
| [TypeScript](https://www.typescriptlang.org) | Type-safe JavaScript | https://www.typescriptlang.org |
| [Vite](https://vitejs.dev) | Build tool + dev server | https://vitejs.dev |
| [Zustand](https://zustand.docs.pmnd.rs) | Lightweight state management | https://zustand.docs.pmnd.rs |
| [TanStack React Query](https://tanstack.com/query) | Data fetching + caching | https://tanstack.com/query |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app) | PWA / Service Worker (Workbox) | https://vite-pwa-org.netlify.app |
| [Vitest](https://vitest.dev) | Unit testing | https://vitest.dev |
| [Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | Component testing | https://testing-library.com |
| [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) | XML→JSON conversion (one-time script) | https://github.com/NaturalIntelligence/fast-xml-parser |
| [AWS S3](https://aws.amazon.com/s3/) | Static hosting + data assets | https://aws.amazon.com/s3/ |
| [AWS CloudFront](https://aws.amazon.com/cloudfront/) | CDN, HTTPS, custom domains | https://aws.amazon.com/cloudfront/ |
| [AWS Route 53](https://aws.amazon.com/route53/) | DNS + wildcard subdomains for branding (domain registered via Namecheap, NS delegated to Route 53) | https://aws.amazon.com/route53/ |
| [Google AdSense](https://www.google.com/adsense) | Ad monetization (free tier) | https://www.google.com/adsense |
| [Workbox](https://developer.chrome.com/docs/workbox) | Service worker strategies | https://developer.chrome.com/docs/workbox |
| [GitHub](https://github.com) | Source control + CI/CD | https://github.com |
| [GitHub Actions](https://docs.github.com/en/actions) | Deploy pipeline (build → S3 → CloudFront invalidation) | https://docs.github.com/en/actions |

---

## Code Storage & Lifecycle

**Open source on GitHub.** The codebase has no secrets (all config is runtime-loaded from S3), the spectral data is from NIST (public domain), and open-sourcing benefits the educational mission without meaningful competitive risk. The consulting-site link-back survives open sourcing and is arguably strengthened by it.

Repository structure:
```
github.com/teravation/spectroscopy
├── main branch — production (auto-deploys to S3 via GitHub Actions)
├── develop branch — staging
└── feature/* branches — normal dev flow
```

Secrets stored in GitHub Actions secrets (AWS credentials). No secrets in the repo. Brand configs and elements data live in S3, not the repo.

---

## UX Direction

**Preserve the aesthetic.** The dark/black background, spectral color palette, and white-outlined periodic table cells are part of the product's identity — they evoke a real spectrograph instrument, which is exactly right for museum and classroom settings. Existing users at DMNS and in college curricula have muscle memory for this look.

What changes in the reboot:
- Fixed 800×600 → fully **responsive** layout (tablet, desktop, mobile)
- Java Swing buttons/dialogs → clean modern equivalents with the same dark palette
- Font defaults → explicit monospace/sans choices that read well on modern displays
- The `SpectrumFactoryDialog` modal → an inline collapsible panel or popover (less disruptive UX)
- Mobile: two spectrum canvases stacked, periodic table scrollable, larger touch targets

What stays the same:
- Black canvas backgrounds
- Spectral color mapping (exact RGB values below)
- Yellow highlight for selected elements
- White cell borders on periodic table
- Overall top-spectrum / bottom-table layout

---

## Original UI Specification (fully reconstructed from source)

The original was 800×600 px fixed. The modern reboot should be **responsive** but preserve the visual DNA.  We also need to ensure that it will run on a variety of devices, especially mobile phones.

### Visual Hierarchy (original)

```
┌─ 800px ──────────────────────────────────────────┐
│ TARGET SPECTRUM CANVAS (~150px tall)              │
│ [New Target] [Check*] [Hint*]                     │  *disabled until target set
├───────────────────────────────────────────────────┤
│ WORKING SPECTRUM CANVAS (~150px tall)             │
│ ←──── Towards Viewer ─── 0 ─── Away From Viewer ────→ (slider -100..100) │
├───────────────────────────────────────────────────┤
│                                                   │
│         PERIODIC TABLE (black bg, white borders)  │
│         selected elements = yellow text           │
│         hover = element name shown at bottom      │
│                                                   │
│ [Emission ◉] [Absorption ○]    [Reset]           │
└───────────────────────────────────────────────────┘
```

### Color Palette (exact from source)

| Color | RGB | Use |
|---|---|---|
| Background | `(0, 0, 0)` | Canvas and table backgrounds |
| White | `(255, 255, 255)` | Cell borders, unselected element text |
| Yellow | `(255, 255, 0)` | Selected element text/number |

### Spectral Color Breakpoints (exact from source)

| Wavelength (Å) | Color name | RGB |
|---|---|---|
| 4000 | Purple | `(128, 0, 128)` |
| 4400 | Blue | `(0, 0, 255)` |
| 4870 | Cyan | `(0, 255, 255)` |
| 5170 | Green | `(0, 255, 0)` |
| 5790 | Yellow | `(255, 255, 0)` |
| 6080 | Orange | `(255, 162, 0)` |
| 6600 | Red | `(255, 0, 0)` |
| 7000 | Dark red | `(128, 0, 0)` |

### Slider Labels (exact from source)

| Value | Label |
|---|---|
| -100 | `c` |
| -75 | `0.75c` |
| -50 | `Towards Viewer` |
| -25 | `0.25c` |
| 0 | `0` |
| +25 | `0.25c` |
| +50 | `Away From Viewer` |
| +75 | `0.75c` |
| +100 | `c` |

### UI Strings (exact from source)

**New Target settings panel:**
- "Create a spectrum containing [1▾] to [2▾] elements."
- "Select the elements from the first [3▾] rows of the periodic table."
- "Doppler shift the spectrum? [No▾]"
- [OK]

**Default settings when app starts:** 3 min elements, 3 max elements, 5 rows, Doppler shift enabled.

**Hint message:** "You have X of the Y elements correct. [The velocity is correct | too low | too high]."

**Check (correct):** "Correct!\n\nPlay again?" → YES / NO

**Check (incorrect):** "Not quite!"

### Per-Element Cell Rendering (periodic table)
- White rectangle border, 1px
- Atomic number: top-left, 75% of normal font size
- Element symbol: centered bottom, normal font size
- Unselected: white text
- Selected: yellow text (no background fill change)
- Hover: element full name appears in status line at very bottom of table panel

---

## Project Structure

```
spectroscopy-web/
├── scripts/
│   └── convert-elements.ts         # One-time: elements.xml → elements.json
├── src/
│   ├── physics/
│   │   ├── types.ts                 # SpectralLine, Element, Puzzle, PuzzleSettings interfaces
│   │   ├── doppler.ts               # shiftLines(): shifted = w * (1 + velocity)
│   │   ├── wavelengthToColor.ts     # getSpectralColor() — interpolate through 8-stop table
│   │   ├── puzzleFactory.ts         # PuzzleGenerator class
│   │   └── puzzleToken.ts           # encryptPuzzle() / decryptPuzzle() via Web Crypto AES-GCM
│   ├── data/
│   │   └── useElements.ts           # React Query hook: fetch + cache elements JSON from S3
│   ├── components/
│   │   ├── SpectrumCanvas.tsx       # Canvas pixel-scan renderer (port of SpectrumPanel.java)
│   │   ├── PeriodicTable.tsx        # CSS Grid table using row/col from element data
│   │   ├── DopplerSlider.tsx        # range [-100..100] → [-1.0..1.0] with exact labels
│   │   ├── GameControls.tsx         # New Target / Check / Hint / Reset + Emission/Absorption
│   │   ├── PuzzleSettingsPanel.tsx  # Replaces SpectrumFactoryDialog — collapsible/popover
│   │   ├── HintModal.tsx
│   │   ├── BrandingHeader.tsx       # Conditional logo/name/tagline
│   │   └── AdSlot.tsx               # Conditional AdSense (hidden when brand.hideAds)
│   ├── store/
│   │   └── gameStore.ts             # Zustand store
│   ├── branding/
│   │   └── useBranding.ts           # Brand config loader (subdomain or ?brand= param)
│   └── styles/
│       └── index.css                # CSS custom properties + global styles
├── public/
│   └── manifest.json
├── index.html
├── vite.config.ts
└── package.json
```

---

## PuzzleGenerator / PuzzleSettings Architecture

`PuzzleSettings` is a plain data object that fully describes a puzzle configuration. It can come from the UI, URL params, or a brand config's `defaultSettings`.

```typescript
interface PuzzleSettings {
  minElements: number;          // 1–5
  maxElements: number;          // minElements–5
  elementRowDepth: number;      // 1–7 (rows of periodic table to draw from)
  dopplerEnabled: boolean;      // whether to apply a random Doppler shift

  // Optional: pre-programmed puzzle (overrides random generation)
  fixedElementIds?: number[];   // atomic numbers — forces specific elements
  fixedVelocity?: number;       // -1.0 to 1.0 — forces specific velocity
}
```

```typescript
class PuzzleGenerator {
  constructor(private settings: PuzzleSettings, private elements: Element[]) {}

  generate(): Puzzle {
    if (this.settings.fixedElementIds) {
      // Educator pre-programmed mode: use exactly these elements + velocity
      return this.buildFixedPuzzle();
    }
    // Random mode: retry until visible line constraint is met
    return this.generateRandom();
  }
}

interface Puzzle {
  targetElements: Element[];
  targetVelocity: number;
  settings: PuzzleSettings;     // kept for display/sharing
}
```

### URL Param Encoding

URL params come in two flavors: **teacher** (human-readable, for authoring) and **student** (opaque token, for sharing). The student URL must not reveal the answer at a glance.

#### Teacher URL (authoring / preview only — never shared with students)

```
?minEl=1&maxEl=2&rows=3&doppler=true               # random with constraints
?elements=1,2,11&velocity=0.35                      # pre-programmed exact puzzle
```

The `PuzzleSettingsPanel` generates and displays the teacher URL so educators can verify the puzzle before converting it for students.

#### Student URL (the shareable link)

All puzzle data is encrypted into a single opaque token:

```
?puzzle=Axk92mNpQr...   # AES-GCM encrypted, base64url encoded
```

**Encryption — two-phase design:**

#### Phase 1: Bundle key (no server, ship fast)
- Algorithm: AES-GCM (256-bit), via the browser [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) — no library needed
- Key: 32-byte key baked into the app bundle at build time via `VITE_PUZZLE_KEY` (stored in GitHub Actions secrets, not in source)
- Plaintext: `JSON.stringify({ e: [1,2,11], v: 0.35 })` (compact)
- IV: random 12 bytes prepended to ciphertext; output: `base64url(iv + ciphertext)`
- **Security model:** obscurity, not true cryptography. Appropriate for the threat model (students glancing at a URL bar). A determined student could extract the key from the bundle, but the effort far exceeds the reward of knowing H and He are in a spectrum.

#### Phase 2: Server-side keys (when school accounts exist)
Once schools have server-side accounts (for branding, billing, etc.), the encryption key lives entirely on the server — the private key never reaches the browser.

**Flow:**
1. Teacher creates puzzle in teacher portal → portal POSTs settings to server
2. Server encrypts with the school's private key → returns opaque token
3. Teacher copies student URL (`?puzzle=<token>&school=<schoolId>`)
4. Student loads URL → app POSTs token + schoolId to server → server decrypts with private key → returns puzzle data
5. Client renders puzzle — the key never left the server

This is proper cryptographic security. The migration from Phase 1 to Phase 2 is isolated to `puzzleToken.ts` — the rest of the app is unchanged.

```typescript
// src/physics/puzzleToken.ts
// Phase 1: client-side AES-GCM
export async function encryptPuzzle(settings: FixedPuzzleSettings): Promise<string>
export async function decryptPuzzle(token: string): Promise<FixedPuzzleSettings>

// Phase 2: server-side (replaces the above — same interface, different implementation)
export async function decryptPuzzle(token: string, schoolId: string): Promise<FixedPuzzleSettings>
// → POST /api/puzzle/decrypt { token, schoolId } → returns FixedPuzzleSettings

interface FixedPuzzleSettings {
  e: number[];   // element atomic numbers
  v?: number;    // velocity (-1.0 to 1.0), omitted for random-velocity mode
}
```

#### Difficulty-only URL (no answer hidden — safe to share)

Random-constraint URLs (`?minEl=`, `?maxEl=`, `?rows=`, `?doppler=`) reveal no answer, so they don't need encryption and can be shared directly with students. These sync bidirectionally with the `PuzzleSettingsPanel` UI.

Use cases summary:
- **In-class demos**: teacher generates student URL → everyone loads same spectrum
- **Graded quizzes**: teacher generates student URL → puzzle is locked in, answer hidden
- **Open practice**: teacher shares `?rows=2&doppler=false` → random puzzle from easy elements
- **Museum kiosk**: brand config sets `defaultSettings` → auto-start on arrival

---

## Data Pipeline

### One-time conversion script

`scripts/convert-elements.ts` (Node + `fast-xml-parser`, not bundled in app):
- Parse `../data/elements.xml` (from original v1 project)
- Merge names from `../data/elements.properties`
- Fix 12 outdated placeholder names for elements 111–118 (Uuu → Rg, Uub → Cn, etc. — use current IUPAC names)
- Output `elements.json`

### JSON Schema

```typescript
interface ElementsDataFile {
  version: string;         // e.g. "2024-01" — bump on NIST data refresh
  generatedAt: string;     // ISO timestamp
  elements: ElementRecord[];
}

interface ElementRecord {
  atomicNumber: number;
  symbol: string;
  name: string;
  period: number;          // 1–7 (standard periodic table period)
  group: number;           // 1–18, 0 for lanthanides/actinides
  row: number;             // 1–10 (visual row; 9=lanthanides, 10=actinides)
  col: number;             // 1–18 (visual column)
  lines: Array<{ w: number; i: number }>; // wavelength (Å), intensity (shortened keys for size)
}
```

Estimated file size: ~120 KB uncompressed, ~30 KB gzipped. Easily cached.

### S3 Layout

```
s3://spectroscopy-assets/
├── data/
│   ├── elements.json                 # latest (Cache-Control: public, max-age=86400)
│   └── elements-{version}.json      # versioned archive
└── brands/
    └── {brandId}.json               # brand configs (Cache-Control: public, max-age=3600)
```

---

## Branding & School Config System

The `SchoolConfig` is the central server-side record for an institution. It owns branding, billing state, and the puzzle encryption key. This is a two-phase design like the puzzle token.

```typescript
interface SchoolConfig {
  schoolId: string;                    // e.g. "univ-colorado-boulder"
  institutionName: string;             // Shown in header
  logoUrl: string;                     // URL to logo image
  tagline?: string;
  primaryColor: string;               // CSS hex e.g. "#CFB87C"
  accentColor: string;
  hideAds: boolean;                   // true = paid/branded tier, no AdSense
  defaultSettings?: Partial<PuzzleSettings>;
  footerHtml?: string;
  // Phase 2 only — not exposed to client:
  // puzzlePrivateKey: string          // AES or RSA private key, server-side only
}
```

**Phase 1:** `SchoolConfig` (minus `puzzlePrivateKey`) is a static JSON file in S3, hand-authored per client.

**Phase 2:** `SchoolConfig` is a database record managed via a teacher/admin portal. The private key is stored encrypted in the DB, never returned to the client. A `/api/schools/:schoolId/config` endpoint returns only the public-facing fields.

**Loading order (client-side, both phases):**
1. Subdomain: `boulder.spectroscopy.app` → `schoolId = "univ-colorado-boulder"`
2. Query param: `?school=univ-colorado-boulder`

Phase 1: fetch `https://assets.spectroscopy.app/brands/{schoolId}.json`
Phase 2: fetch `https://api.spectroscopy.app/schools/{schoolId}/config`

CSS variables `--color-primary`, `--color-accent`, `--color-bg`, `--color-text` set on `:root`. Single CloudFront distribution + wildcard Route 53 ALIAS `*.spectroscopy.app` handles all subdomains — no Lambda@Edge needed in either phase.

---

## Monetization

- **Free/default tier**: AdSense leaderboard (728×90) below header; right rail (300×250) on screens ≥1200px. Never between the two spectrum canvases or inside the periodic table area.
- **Branded tier**: `hideAds: true` in brand config → AdSense script not loaded at all. Annual flat-fee institutional license.
- **Consulting link-back**: visible in default-tier footer.

---

## AWS Infrastructure

| Service | Use | Est. monthly cost |
|---|---|---|
| S3 | App static files + elements.json + brand configs | ~$0.03 |
| CloudFront | CDN, HTTPS, cache | ~$0–1 (free tier: 1 TB / 10M requests) |
| Route 53 | Hosted zone for `spectroscopy.app` + wildcard `*.spectroscopy.app` | ~$0.90 |
| ACM | Wildcard SSL cert | Free |

**Total: ~$1–2/month**

GitHub Actions deployment:
1. `npm run build`
2. `aws s3 sync dist/ s3://spectroscopy-app/ --delete`
3. `aws cloudfront create-invalidation --paths "/*"` (only needed for `index.html`)

---

## Zustand Store Shape

```typescript
interface GameState {
  elements: Element[] | null;
  targetPuzzle: Puzzle | null;
  working: { elementIds: Set<number>; velocity: number };
  isEmission: boolean;
  gamePhase: 'idle' | 'active' | 'solved';
  settings: PuzzleSettings;

  // Actions
  loadElements: (e: Element[]) => void;
  generateNewPuzzle: () => void;
  toggleElement: (atomicNumber: number) => void;
  setVelocity: (v: number) => void;
  setEmissionMode: (b: boolean) => void;
  checkAnswer: () => CheckResult;
  getHint: () => HintResult;
  resetWorking: () => void;
  updateSettings: (s: Partial<PuzzleSettings>) => void;
}
```

---

## Critical Physics Fidelity

These details are easy to get wrong when porting from Java. Do not deviate from these values.

| Detail | Correct behavior |
|---|---|
| Doppler formula | `shifted = wavelength * (1 + velocity)` — classical, NOT relativistic. Velocity is fraction of c, range [-1.0, 1.0]. |
| Intensity threshold | Lines with intensity ≤ 5 are invisible (no color drawn). |
| Log scale | `log10(intensity - 5)`. Intensity=6 → log10(1)=0 (minimum visible). Intensity=105 → log10(100)=2 (max). |
| Line width | `max(1, floor(log10(intensity - 5)))` pixels wide, centered on column. Strongest lines (intensity > 105) are 2px. |
| Equality tolerance | `|working_velocity - target_velocity| < 0.01`. With slider range [-100..100] integers → [-1.0..1.0], this is exactly 1 slider tick. |
| Canvas HiDPI | `canvas.width = rect.width * devicePixelRatio`; `ctx.scale(dpr, dpr)`. Otherwise spectra are blurry on Retina displays. |
| Rendering optimization | Use a running pointer into the sorted lines array to find max intensity at each pixel — avoids O(n²) scan for elements with many lines (some transition metals have 100+ lines). Pre-skip lines below 4000 Å before the loop — the Java applet did not do this, causing blueshifted sub-visible lines to bleed intensity onto the leftmost pixel. Intentional fix. |
| Table rows 9 & 10 | Row 9 = lanthanides, row 10 = actinides. Render with a visual gap above them in CSS Grid, matching the standard periodic table convention. |
| Puzzle validation | Retry generation loop until at least one spectral line falls in [3000–7000 Å] with intensity > 5. |
| Wavelength render range | 4000–7000 Å displayed (maps linearly to canvas width). |
| Emission vs absorption | Emission: black background, colored lines. Absorption: full rainbow background, dark lines cut out. Same intensity/log logic applies to both. |

---

## Source Files → New Files Mapping

| Original Java file | New TypeScript file | Notes |
|---|---|---|
| `SpectrumPanel.java` | `SpectrumCanvas.tsx` | Port pixel-scan algorithm to Canvas 2D API |
| `Spectrum.java` | `doppler.ts` + `gameStore.ts` | Doppler math + element set management |
| `SpectrumFactory.java` | `puzzleFactory.ts` | PuzzleGenerator class |
| `PeriodicTablePanel.java` | `PeriodicTable.tsx` | CSS Grid using element row/col data |
| `SpectroscopyApplet.java` | `App.tsx` + `gameStore.ts` | Top-level layout + event wiring |
| `SpectrumFactoryDialog.java` | `PuzzleSettingsPanel.tsx` | Inline panel replaces modal dialog |
| `ElementXMLReader.java` | `scripts/convert-elements.ts` | One-time data conversion, not shipped |

Original Java source lives at `../src/` relative to this file (the v1 project root). Reference it for exact algorithm details, especially `SpectrumPanel.java` (rendering) and `SpectrumFactory.java` (puzzle generation loop).

---

## Phased Build Order

### Phase 1 — Playable core (2–3 days)
1. Init GitHub repo; scaffold Vite + React + TS; add GitHub Actions deploy workflow
2. Run `scripts/convert-elements.ts` → upload `elements.json` to S3
3. Port physics layer (`types.ts`, `doppler.ts`, `wavelengthToColor.ts`) + unit tests
4. `useElements.ts` — React Query fetch from S3
5. `SpectrumCanvas.tsx` — validate H and He spectra visually (known fingerprints)
6. `PeriodicTable.tsx` — CSS Grid from element `row`/`col` data
7. `DopplerSlider.tsx` — wired to Zustand velocity, live repaint
8. `GameControls.tsx` + `PuzzleGenerator` (random mode only)
9. Wire `App.tsx` — game is now playable end-to-end
10. Deploy to S3 + CloudFront; verify elements.json loads and spectra render

### Phase 2 — Educator URL sharing (1 day)
11. `PuzzleSettingsPanel.tsx` with bidirectional URL param sync
12. Pre-programmed puzzle support via `?elements=1,2,11&velocity=0.35`
13. Default settings panel: match original dialog defaults (min=1, max=2, rows=3, doppler=No)

### Phase 3 — PWA + offline (half day)
14. Configure `vite-plugin-pwa`: pre-cache app shell, network-first cache for `elements.json` with offline fallback

### Phase 4 — Branding + ads (1 day)
15. `useBranding.ts` + `BrandingHeader.tsx` + CSS variables on `:root`
16. `AdSlot.tsx` — conditional AdSense loading
17. Test subdomain routing locally via `/etc/hosts`

### Phase 5 — Polish (1–2 days)
18. Keyboard navigation on periodic table (arrow keys move focus, Enter toggles, Tab to buttons)
19. ARIA labels on spectrum canvases (text description: "Target spectrum: 3 elements, moderate redshift")
20. Mobile layout: stacked canvases, periodic table cells ≥44px touch targets, horizontal scroll if needed
21. Periodic table cell density: hide atomic number on small screens (symbol sufficient for gameplay); show element name inside cell on large screens (e.g. ≥1400px) where there is room
22. Font sizing polish: current cqw-based scaling needs tuning across breakpoints — symbols and atomic numbers should feel proportional at all screen sizes
23. Height-constrained layout: when the viewport is short (e.g. landscape mobile, small laptop), scale the periodic table down so it fully fits on screen without scrolling — consider CSS `transform: scale()` on the root container based on available height vs. content height
21. First-visit tutorial overlay (dismissible, stored in `localStorage`)

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
