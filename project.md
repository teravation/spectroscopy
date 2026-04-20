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
| [Python + requests](https://docs.python-requests.org) | Data pipeline: fetch NIST spectral data → elements.json | https://docs.python-requests.org |
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
spectroscopy/
├── scripts/                         # Python data pipeline (not bundled in app)
│   ├── fetch_elements.py            # Fetch NIST ASD → elements.json
│   └── requirements.txt
├── data/                            # gitignored; scratch space for raw/intermediate files
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

### Fetch script

`scripts/fetch_elements.py` (Python + `requests`, not bundled in app). Re-run whenever NIST data is refreshed or a new element is added. Supports two-phase operation:

```bash
# Full fetch + save raw cache (~10 min, be polite to NIST):
python fetch_elements.py --save-raw data/nist_raw.json

# Transform-only from cache (seconds — use this when iterating on thresholds/normalization):
python fetch_elements.py --from-raw data/nist_raw.json
```

### Intensity methodology — Aki-based global normalization

The NIST `intens` (relative intensity) field has no common scale across elements — NIST's own documentation states it is meaningful "only within a given spectrum." To enable cross-element brightness comparison (required for the game), we use the **Einstein A coefficient (Aki, s⁻¹)** instead.

Aki is the spontaneous emission rate for a transition — the number of photons emitted per excited atom per second. It is an intrinsic quantum mechanical property of the transition, independent of experimental conditions, and is directly comparable across elements and across labs.

**Processing steps:**

1. **Visible-range anchor:** For each element, compute `k = median(Aki / intens)` using only lines in the 4000–7000 Å visible range. Restricting to visible range prevents UV transitions (high Aki but low population in discharge lamps at moderate temperatures) from distorting the scale for visible lines — e.g. Na has strong UV lines at 3882 Å with high Aki, but the D lines at 5890 Å dominate visually; visible-range anchors correctly preserve that hierarchy. Falls back to all-wavelength anchors if no visible anchors exist.

2. **Display intensity:** For lines with `intens`: `i = max(intens * k, Aki)`. The `intens * k` term gives the correct intra-element visual shape scaled to Aki-equivalent units. The `max(..., Aki)` floor prevents lines with very small `intens` values (e.g. rel=5) from being suppressed below their physically significant Aki contribution.

3. **Lines with no `intens`:** Use Aki directly.

4. **No Aki anchors at all (Ritz-only elements):** Normalize `intens` so the element's max maps to `FALLBACK_MAX_AKI = 1e8`, preserving the spectral fingerprint shape.

5. **Ritz fallback:** Elements with no observed lines in range (`line_out=1` returns nothing or HTML) are re-queried with `line_out=0` to include Ritz-calculated (theoretical) lines. Ritz lines are derived from measured energy levels and are physically valid for educational use.

6. **Global normalization:** All intensities are scaled so the 99th-percentile Aki across all elements maps to `OUTPUT_MAX=1000`. Outlier values (top 1%) are clamped to 1000 — they're just "very bright." This preserves cross-element comparability while preventing a handful of extreme transitions from compressing the bulk of lines to near-zero.

7. **Threshold:** After normalization, lines below `INTENSITY_THRESHOLD_OBSERVED=7` (observed elements) or `INTENSITY_THRESHOLD_RITZ=1` (Ritz-fallback elements) are dropped. These thresholds are intentionally different: Ritz-normalized elements land much lower on the global scale, so a more permissive threshold is needed to preserve their fingerprints.

**Why not `intens` alone:** The old Java app used `intens` directly with no cross-element normalization. It worked because the game relied on line *positions* for identification, not cross-element brightness. The new app uses Aki so that elements that are genuinely brighter (higher emission rates) appear brighter, making the spectra physically meaningful and not just fingerprint maps.

**Why the v1 dataset worked despite using `intens`:** The original v1 data was fetched from a 2003 NIST API endpoint (`display.ksh`) that no longer exists. That API almost certainly drew from a single curated compilation — likely the *NIST Atomic Spectra Handbook* — where intensities were normalized to a consistent cross-element scale before publication. This is why v1 Hydrogen looked brighter than v1 Neon without any normalization code: the source data already had cross-element consistency baked in. The modern public ASD API aggregates data from hundreds of independent measurement campaigns with different instruments and calibration standards, so that consistency no longer exists in the raw `intens` field.

The v1 vs modern NIST intensity scale comparison (approximate, for context):

| Element | v1 XML max intensity | Modern NIST raw max | Notes |
|---|---|---|---|
| Ne | ~80,000 | ~800,000 | ~10× higher in modern API |
| Mn | ~27,000 | ~270,000 | ~10× — consistent with Ne/Co |
| Co | ~21,000 | ~210,000 | ~10× — consistent |
| Fe | *(missing in v1)* | ~25,000,000 | ~1000× vs Ne/Mn/Co — different source paper |

The 10× factor is consistent for Ne/Mn/Co, but Fe's modern NIST data comes from a different higher-precision source and is another 100× higher than those. There is no single divisor that brings all elements onto the same cross-element scale — which is exactly why Aki is the correct solution.

**Known v1 data bug — Iron mislabeled as Francium:** In the original `elements.xml`, element 26 (Iron) had `symbol="Fr"` (Francium) and an empty `<spectralLines>` block — the data was never populated when the file was generated in 2003. This is why the original app had no Iron spectrum. Both bugs (wrong symbol, missing lines) were fixed in April 2025 when the v2 pipeline was written.

### Why this model is physically correct

Our model is appropriate for **stellar spectroscopy** — the game's actual context. In a stellar atmosphere or hot plasma:

- The temperature is high enough to populate a wide range of excited states
- All elements are present simultaneously in the same environment
- The relative brightness of lines from different elements is governed directly by Aki weighted by excited-state populations (Boltzmann distribution at that temperature)
- Cross-element intensity comparison is not just valid — it's essential

An **iron-rich stellar spectrum** genuinely looks like our iron spectrum: hundreds of lines densely packed across the visible, often overwhelming other elements. That's exactly why astronomers need spectrographs and pattern-matching — the iron "forest" is a real observational challenge.

A **museum discharge tube** is a different scenario: low current, low temperature, one element per tube, each tube optimized for its own element. In that context, per-element relative display makes sense because you're never comparing across elements simultaneously. Our model would be misleading for comparing tube-to-tube brightness, but that's not the game's use case.

**The exception — Iodine:** Iodine's strongest atomic lines are in the near-IR (8000–10000 Å). Its visible-range atomic emission is sparse (4–5 lines in the canvas window). An iodine discharge tube appears to have a rich visible spectrum, but most of that is **molecular I₂ emission** — dense electronic band transitions from the diatomic molecule, not atomic line emission. NIST ASD contains only atomic line data, so our sparse Iodine visible spectrum is physically correct for atomic I; it will not match a discharge tube photo.

### Procedure

- Per-element queries (one NIST request per element, 2 s delay to be polite to NIST servers)
- Wavelength range: 3800–10000 Å (vacuum), `show_av=3`
- Parses tab-delimited response: strips intensity suffixes (`h`, `l`, `bl`, etc.), obs→Ritz fallback on HTML response, deduplicates on wavelength preferring higher `intens`
- Merges with element metadata (name, period, group, row, col) from hardcoded table in script
- Outputs `public/elements.json` (vacuum wavelengths, ~800 KB uncompressed)
- Also uploaded to `s3://spectroscopy-assets/data/elements.json` via CI pipeline

### JSON Schema

```typescript
interface ElementsDataFile {
  version: string;              // e.g. "2026-04" — bump on NIST data refresh
  generatedAt: string;          // ISO 8601 timestamp
  wavelengthType: "vacuum";     // always vacuum; air conversion done in UI if needed
  intensityScale: "aki-normalized-1000";  // global 99th-pct Aki = 1000
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
  lines: Array<{ w: number; i: number }>; // wavelength (Å vacuum), intensity 0–1000
}
```

Lines are pre-sorted by wavelength ascending. Intensity is globally normalized: 1000 = 99th-percentile Aki across all elements. The renderer applies `log10(i - INTENSITY_THRESHOLD) / 2` to map to a [0,1] brightness scale, clamped to 1.

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

---

## Reference Spectra

Use these for visual QA of the rendered spectra and intensity methodology. **All of these will differ from ours in predictable ways — see the notes.**

| Reference | URL | How it differs from ours |
|---|---|---|
| Ohio State representative emission spectra | https://www.astronomy.ohio-state.edu/pogge.1/TeachRes/HandSpec/atoms.html | Also sourced from NIST ASD, but uses **per-element normalization**: each element's lines are thresholded as a fraction of *that element's own* maximum intensity, then rendered at uniform height (binary show/hide — no brightness variation). This makes Carbon show ~12 clean lines and Iron show many more, but the two cannot be compared in brightness. Our model is cross-element: Carbon's lines are genuinely dimmer than Iron's, and that's reflected in how they render. OSU's approach is useful for "what lines should I see within this element"; ours is useful for "how bright is this element relative to another." |
| RIT photo mosaic of discharge lamps | http://spiff.rit.edu/classes/phys200/lectures/spectra/photo_mosaic.gif | Actual **photographs of discharge tubes** — real experimental data, not generated from NIST. Differences from ours: (1) only elements that work in low-current discharge tubes are shown (noble gases, Na, Hg — no transition metals); (2) intensity is the camera's response to the tube, which depends on tube current, pressure, and temperature, not Aki alone; (3) wavelength axis runs red→left (reversed from our canvas). Good sanity check for noble gases and alkali metals at the qualitative level. |
| NIST Atomic Spectra Database | https://physics.nist.gov/PhysRefData/ASD/lines_form.html | Primary data source. The `intens` field in NIST is empirical and per-element only — NIST's own documentation says it is meaningful "only within a given spectrum." We use Aki (Einstein A coefficient) for cross-element intensity. |
| HyperPhysics atomic spectra | http://hyperphysics.phy-astr.gsu.edu/hbase/quantum/atspect.html#c1 | Computer-generated from NIST data, per-element normalized. Good for checking which lines should dominate *within* an element. Sources disagree on some relative intensities (e.g. He's two red lines near 6562 Å and 6680 Å) due to differing excitation conditions — this is a known physics ambiguity, not an error in either source. |
| HyperPhysics iodine discharge tube photo | http://hyperphysics.phy-astr.gsu.edu/hbase/quantum/modpic/iodinetube.jpg | Shows a **molecular iodine (I₂) discharge tube**, not atomic iodine. I₂ has dense electronic band transitions throughout the visible spectrum, giving it a rich purple/violet glow. Our data is atomic I from NIST ASD — correctly sparse in the visible (most strong atomic I lines are in the near-IR, 8000–10000 Å). The two are not comparable: molecular vs atomic emission are completely different physical processes. |

---

Phase plan and verification checklist: **[BACKLOG.md](BACKLOG.md)**
