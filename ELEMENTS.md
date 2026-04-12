# Elements Data Pipeline

How to regenerate the spectral line dataset for the v2 app, based on hard-won lessons from working with the original v1 Java pipeline.

---

## What the data is

Each element has a list of spectral lines: wavelength (Ångströms) + intensity (unitless, relative). The app renders these as colored vertical lines on the spectrum canvas. The dataset comes from the [NIST Atomic Spectra Database](https://physics.nist.gov/PhysRefData/ASD/lines_form.html) (public domain).

The v1 app stored this in `data/elements.xml` (~50,000 lines across 118 elements). v2 will use JSON.

---

## The NIST API

### Modern endpoint (use this)

```
https://physics.nist.gov/cgi-bin/ASD/lines1.pl
```

Key parameters:

| Parameter | Value | Notes |
|---|---|---|
| `spectra` | `` (empty) | Empty = all elements. Or `Ne+I` for a specific element. |
| `low_w` / `upp_w` | e.g. `3800` / `10000` | Wavelength range in Ångströms |
| `unit` | `0` | Output unit = Ångströms (not nm) |
| `format` | `3` | Tab-delimited plain text |
| `show_obs_wl` | `1` | Include observed wavelength column |
| `show_calc_wl` | `1` | Include Ritz (calculated) wavelength as fallback |
| `intens_out` | `on` | Include relative intensity column |
| `A_out` | `1` | Include Einstein A coefficient (Aki) column — **use this as intensity** |
| `line_out` | `1` | Observed lines only — omits theoretical Ritz-only lines |
| `show_av` | `2` | **Air wavelengths.** Use `3` for vacuum. See critical note below. |
| `no_spaces` | `1` | Suppress extra whitespace |

Full working URL for 3800–10000 Å, all elements, air wavelengths:

```
https://physics.nist.gov/cgi-bin/ASD/lines1.pl?spectra=&limits_type=0&low_w=3800&upp_w=10000&unit=0&submit=Retrieve+Data&de=0&format=3&line_out=1&en_unit=0&output=0&bibrefs=1&page_size=15&show_obs_wl=1&show_calc_wl=1&unc_out=1&order_out=0&max_low_enrg=&show_av=2&max_upp_enrg=&tsb_value=0&min_str=&A_out=1&intens_out=on&allowed_out=1&forbid_out=1&no_spaces=1
```

**Set a browser-like User-Agent header** — NIST returns HTTP 403 to the default Java/Python/Node user agent strings:

```python
headers = {"User-Agent": "Mozilla/5.0"}
```

### Response format

Tab-delimited, all non-empty values double-quoted. Header row is unquoted.

**All-elements query columns (0-based):**
```
element  sp_num  obs_wl_air(A)  unc_obs_wl  ritz_wl_air(A)  unc_ritz_wl  intens  ...
```

**Per-element query columns** (when `spectra=Ne+I`) — element and sp_num columns are absent:
```
obs_wl_air(A)  unc_obs_wl  ritz_wl_air(A)  unc_ritz_wl  intens  ...
```

Example rows (all-elements query):
```
element	sp_num	obs_wl_air(A)	unc_obs_wl	ritz_wl_air(A)	unc_ritz_wl	intens	...
Ne	1	"4037.262"	"0.020"	"4037.261"	"0.020"	"50"	...
Fe	1	"4037.462"	"0.005"	"4037.460"	"0.004"	"15"	...
```

### Parsing rules

1. **Strip double-quotes** from all values.
2. **Wavelength**: use `obs_wl_air(A)` (col 2); fall back to `ritz_wl_air(A)` (col 4) if observed is blank.
3. **Intensity**: strip all non-numeric suffix characters (`h`, `l`, `d`, `bl`, `w`, `r`, `*`, etc.) — keep only the leading integer. Skip the line if no integer remains.
4. **Ionization stage**: `sp_num=1` means neutral (Fe I), `sp_num=2` means singly ionized (Fe II), etc. The original app included all ionization stages for a given element symbol.
5. **Skip** lines where intensity is 0 after parsing. The app's rendering threshold is intensity > 5 (lines ≤ 5 are invisible), so you may also want to drop those at generation time to keep the file small.
6. **Duplicate wavelengths**: if two lines have the same wavelength (can happen across ionization stages), keep the one with higher intensity.
7. **Sort** lines by wavelength ascending within each element (NIST output is already sorted, but verify).

---

## Critical: Air vs Vacuum Wavelengths

**This is the most important thing to get right.**

The original v1 dataset (and the 2003 NIST API it was built from) used **air wavelengths**. The modern NIST API defaults to **vacuum wavelengths** (`show_av=3`). At visible wavelengths (~4000–7000 Å), the difference is approximately **+1.2 Å** for vacuum vs air — large enough to make spectral fingerprints look wrong, and to misalign your rendered lines against any reference.

Air-to-vacuum correction formula (Edlén 1966):
```
λ_vac = λ_air × n_air
n_air ≈ 1 + 8.34213×10⁻⁵ + 2.406030×10⁻²/(130 - σ²) + 1.5997×10⁻⁴/(38.9 - σ²)
where σ = 10000 / λ_air (wavenumber in µm⁻¹)
```

Simpler approximation (accurate to ~0.05 Å in the visible):
```
λ_vac ≈ λ_air × 1.0002929
```

### For the v2 app

**Store vacuum wavelengths as canonical** — vacuum is the physical standard and what modern databases (including NIST) use as their primary value. The UI toggle converts to air at render time using `vacuumToAir()`. This lives in `src/physics/wavelength.ts`.

Fetch vacuum from NIST with `show_av=3`; the response columns are `obs_wl_vac(A)` and `ritz_wl_vac(A)`.

Conversion at render time (see `src/physics/wavelength.ts`):

```typescript
// Edlén 1966 — accurate to ~0.01 Å in the visible
function vacuumToAir(lambdaVac: number): number {
  const sigma = 1e4 / lambdaVac;  // μm⁻¹
  const s2 = sigma * sigma;
  const n = 1 + 8.34213e-5 + 2.40603e-2 / (130 - s2) + 1.5997e-4 / (38.9 - s2);
  return lambdaVac / n;
}
```

Doppler shift is applied first (in vacuum), then `vacuumToAir()` is applied if the user has selected air display. Puzzle answer checking (element IDs + velocity) is wavelength-system-agnostic.

---

## Intensity Scale: The Core Problem

**NIST relative intensities are not cross-element comparable.** This is the most critical design decision for v2, and the root cause of most of the difficulty encountered when patching the v1 dataset.

### Why NIST intensities can't be used directly

The NIST ASD aggregates data from hundreds of published papers spanning decades. Each element's intensity values come from whichever measurement campaign(s) studied that element — different instruments, light sources, and calibration standards. NIST itself flags this: *"Relative intensities are source dependent and typically are useful only as guidelines for low density sources."*

In practice this means there is no cross-element multiplier that normalizes them. For example, even after correcting for air/vacuum convention, Iron's strongest visible lines ended up ~10× brighter than neighboring elements Manganese and Cobalt when fetched from the modern NIST ASD — not because Iron is physically brighter, but because Iron's data comes from a higher-precision measurement campaign with a larger intensity scale.

### Why the 2003 v1 dataset worked

The original v1 data was fetched from a 2003 NIST API (`display.ksh`) that no longer exists. That API returned all elements in a single cross-element query, almost certainly drawing from a single curated compilation — likely the *NIST Atomic Spectra Handbook* or similar — where intensities were normalized to a consistent cross-element scale. This is what made the app work: Hydrogen's lines render brighter than Neon's, matching what you see in a real spectrograph.

The Ohio State teaching resource ([atoms.html](https://www.astronomy.ohio-state.edu/pogge.1/TeachRes/HandSpec/atoms.html)) also uses NIST data and shows cross-element brightness differences without per-element normalization — Neon looks dimmer than Hydrogen. This confirms that cross-element consistent intensities exist in NIST somewhere; the modern public API just doesn't expose them directly through the relative intensity field.

### The right solution for v2: Einstein A coefficients

The correct cross-element comparable quantity is the **Einstein A coefficient** (`Aki`, in s⁻¹), also called the transition probability. These are absolute physical values — independent of measurement setup — and are available in the modern NIST ASD for most strong lines.

```
Aki (s⁻¹) = rate at which an excited atom spontaneously emits a photon
             Higher = stronger/brighter emission line
```

`Aki` is included in the tab-delimited NIST output. Enable it with `A_out=1` in the query. It appears as a separate column after `intens`. Many weak or forbidden lines have no `Aki` — skip those, or use the relative intensity as a secondary fallback.

**Recommended v2 approach:**

1. Fetch both `intens` and `Aki` from NIST (`A_out=1&intens_out=on`)
2. Use `Aki` as the primary intensity stored in the JSON — it is physically meaningful and cross-element comparable
3. Fall back to NIST relative intensity only when `Aki` is absent, flagging those lines as lower-confidence
4. Set a visibility threshold in `Aki` units (e.g., `Aki < 1×10⁵ s⁻¹` is a reasonable starting point for the visible range — tune visually)
5. Render line width as `max(1, floor(log10(Aki) - 4))` or similar log scale

The JSON schema should record which intensity field was used:

```typescript
interface SpectralLine {
  w: number;    // wavelength (Å, air)
  i: number;    // Aki in s⁻¹ if available, else NIST relative intensity
  src: "aki" | "rel";  // which field i came from
}
```

### Hybrid approach: anchor scaling

This is the recommended strategy. It combines the cross-element accuracy of `Aki` with the broader coverage of NIST relative intensities.

**The insight:** for any given element, NIST relative intensities are internally self-consistent. If even one line has both an `Aki` value and a relative intensity, you can compute a per-element scale factor `k` and use it to convert all relative-intensity-only lines into `Aki`-equivalent units.

```
k = Aki / relative_intensity   (for lines that have both)
scaled_intensity = relative_intensity × k
```

The theoretical relationship is `I_relative ∝ g_upper × Aki × λ`, so the ratio isn't perfectly constant — it varies slightly with wavelength and the statistical weight of the upper level. In practice for a teaching app this scatter is small compared to the orders-of-magnitude span between strong and weak lines, and using the **median ratio** across all anchor lines makes it robust against outliers.

```python
from statistics import median

def anchor_scale_element(lines: list[dict]) -> list[dict]:
    """
    lines: list of dicts with keys w, aki (float|None), rel (int|None)
    Returns lines with a unified 'i' value in Aki-equivalent units (s⁻¹).
    """
    anchor_lines = [l for l in lines if l.get("aki") and l.get("rel")]

    if anchor_lines:
        ratios = [l["aki"] / l["rel"] for l in anchor_lines]
        k = median(ratios)
        for line in lines:
            if line.get("aki"):
                line["i"] = line["aki"]        # authoritative
                line["src"] = "aki"
            elif line.get("rel"):
                line["i"] = line["rel"] * k    # scaled estimate
                line["src"] = "scaled"
    else:
        # No anchor lines — flag element, normalize to a fixed max
        # (will not be cross-element comparable)
        max_rel = max((l.get("rel") or 0) for l in lines)
        if max_rel > 0:
            for line in lines:
                line["i"] = (line.get("rel") or 0) / max_rel * FALLBACK_MAX_AKI
                line["src"] = "normalized"

    return lines

FALLBACK_MAX_AKI = 1e8  # approximate Aki for a strong allowed transition
```

**Aki coverage is excellent in practice.** Empirically verified across 9 elements in the 3800–7000 Å range (`line_out=1`, `intens > 100`):

| Element | Total lines | Aki populated | Strong lines (intens>100) with Aki | without Aki |
|---|---|---|---|---|
| H  | 15  | 15  | 7  | 0 |
| He | 17  | 17  | 14 | 0 |
| Li | 5   | 4   | 2  | 0 |
| Na | 17  | 17  | 12 | 0 |
| Ne | 15  | 15  | 11 | 1 |
| Ca | 10  | 9   | 6  | 1 |
| Fe | 106 | 105 | 61 | 1 |
| Mn | 31  | 30  | 17 | 0 |
| Co | 18  | 15  | 9  | 2 |

Nearly every line above the visibility threshold has Aki. The handful without are outliers — the anchor-scaling fallback handles them. **The anchor-scaling approach is viable and recommended.**

If any element has zero anchor lines (unlikely for common elements, possible for rare ones), log it and use the normalized fallback.

### Fallback: per-element normalization only

If `Aki` coverage proves unexpectedly sparse, the last resort is:

1. Keep only the top N lines by NIST relative intensity per element (e.g., top 300–500)
2. Normalize each element so its brightest line = a fixed value (e.g., 10,000)
3. Accept that cross-element brightness isn't physically accurate

The game mechanic (matching target vs working spectra) only requires that each element has a distinctive fingerprint — not that Hydrogen is physically brighter than Neon. But this should be a last resort; the anchor-scaling approach above is both achievable and physically correct.

### line_out parameter: observed lines only

Use `line_out=1` (observed lines only) rather than the default `line_out=0` (all lines). The default includes thousands of purely theoretical Ritz-calculated lines that were never directly measured. Validated: `line_out=1` reduces Fe I line count by ~40% (615 → 377 lines in 4000–4500 Å) while keeping all physically observed transitions.

### v1 intensity scale for reference

For anyone doing visual QA against the v1 app:

| Element | v1 XML max intensity | Modern NIST raw max | Ratio |
|---|---|---|---|
| Ne (Neon) | ~80,000 | ~800,000 | 10× |
| Mn (Manganese) | 27,000 | 270,000 | 10× |
| Co (Cobalt) | 21,000 | 210,000 | 10× |
| Fe (Iron) | *(missing in v1)* | ~25,000,000 | ~1000× vs neighbors |

The 10× factor is consistent for Ne/Mn/Co — but Fe's data in the modern NIST comes from a different source paper and is another 100× higher than those. There is no single divisor that brings all elements onto the same scale as v1. **Do not try to replicate the v1 intensity scale in v2** — use `Aki` instead and set new rendering thresholds.

---

## Query Strategy

NIST will return very large responses for wide wavelength ranges across all elements. Recommended approach: **chunk by wavelength range**, ~2000 Å per request, and merge.

```python
RANGES = [(3800, 5800), (5800, 7800), (7800, 10000)]
```

Alternatively, query **per element** (`spectra=Fe+I`) — slower (118 requests) but more reliable and easier to retry individual failures. Either works.

---

## JSON Schema

```typescript
interface ElementsDataFile {
  version: string;         // e.g. "2025-01" — bump on NIST data refresh
  generatedAt: string;     // ISO 8601 timestamp
  wavelengthType: "air" | "vacuum";  // which convention lines[] uses
  intensityType: "aki" | "relative" | "mixed";
  // "aki"      = all lines use Einstein A coefficient (s⁻¹) — cross-element comparable, recommended
  // "relative" = all lines use NIST relative intensity — NOT cross-element comparable
  // "mixed"    = Aki where available, NIST relative as fallback (store "src" field per line)
  elements: ElementRecord[];
}

interface ElementRecord {
  atomicNumber: number;
  symbol: string;
  name: string;
  period: number;    // 1–7 (standard periodic table period)
  group: number;     // 1–18; lanthanides/actinides = 0
  row: number;       // 1–10 (visual row; 9=lanthanides, 10=actinides)
  col: number;       // 1–18 (visual column)
  lines: SpectralLine[];
}

interface SpectralLine {
  w: number;           // wavelength (Å)
  i: number;           // intensity: Aki in s⁻¹ if src="aki", else NIST relative intensity
  src?: "aki" | "rel"; // omit if intensityType is not "mixed"
}
```

Abbreviated keys keep file size reasonable. Estimated: ~200 KB uncompressed, ~50 KB gzipped.

---

## Element Metadata

The NIST spectral line query gives you symbol and ionization data but not name, period, group, or periodic table position. Source these separately:

- **Name**: the v1 app used `data/elements.properties` (symbol → name mapping). Use a standard periodic table JSON package, or hardcode the 118 names — they don't change.
- **Period / Group**: standard chemistry data, hardcode or pull from any periodic table dataset.
- **Row / Col**: the v1 app used a custom row/col scheme (row 9 = lanthanides, row 10 = actinides) for CSS Grid layout. See `data/elementsTemplate.xml` for the complete mapping of all 118 elements — this is the authoritative source for v2 layout positions.

---

## Known Data Issue: Iron (Fe, atomic number 26)

In the v1 `elements.xml`, element 26 was mislabeled `symbol="Fr"` (Francium) instead of `symbol="Fe"` (Iron), and its `<spectralLines>` block was empty — the data was never populated when the original file was generated. Both bugs were fixed in April 2025 using the pipeline described in this document.

**When regenerating the full dataset**, Iron will be correctly populated automatically since it's queried by atomic symbol like every other element.

---

## UI: Air vs Vacuum Toggle

Implemented. Air/Vacuum radio group lives next to the Emission/Absorption toggle in `GameControls.tsx`. State is `showVacuumWavelengths: boolean` (default `false` = show air) in the Zustand store.

```typescript
// In the Zustand store (gameStore.ts)
showVacuumWavelengths: boolean;          // false = air (default)
setShowVacuumWavelengths: (v: boolean) => void;

// In targetLines() / workingLines() selectors
const shifted = shiftLines(allLines, velocity);   // Doppler in vacuum
const display = showVacuumWavelengths
  ? shifted
  : shifted.map(l => ({ w: vacuumToAir(l.w), i: l.i }));
```

For the puzzle solver: element matching and velocity checking are done by comparing element IDs and velocity values — no wavelength comparisons involved — so the toggle has no effect on correctness checking.

---

## Script Outline (Python)

```python
import requests, json, time

NIST_URL = "https://physics.nist.gov/cgi-bin/ASD/lines1.pl"
HEADERS = {"User-Agent": "Mozilla/5.0"}

PARAMS_BASE = {
    "limits_type": "0", "unit": "0", "submit": "Retrieve+Data",
    "de": "0", "format": "3", "line_out": "0", "en_unit": "0",
    "output": "0", "bibrefs": "1", "page_size": "15",
    "show_obs_wl": "1", "show_calc_wl": "1", "unc_out": "1",
    "order_out": "0", "show_av": "2",    # air wavelengths
    "line_out": "1",                      # observed lines only, not theoretical Ritz
    "A_out": "1", "intens_out": "on",    # fetch both Aki and relative intensity
    "allowed_out": "1", "forbid_out": "1", "no_spaces": "1",
}

def fetch_lines(low_w: int, upp_w: int) -> list[dict]:
    params = {**PARAMS_BASE, "spectra": "", "low_w": low_w, "upp_w": upp_w}
    r = requests.get(NIST_URL, params=params, headers=HEADERS, timeout=60)
    r.raise_for_status()

    lines = []
    col_index = {}  # populated from header row

    for row in r.text.splitlines():
        if not col_index:
            if row.startswith("element\t"):
                # Parse column positions from header
                headers = row.rstrip("\t").split("\t")
                col_index = {name: i for i, name in enumerate(headers)}
            continue

        cols = row.split("\t")
        if len(cols) < 7:
            continue

        def get(name):
            idx = col_index.get(name)
            return cols[idx].strip().strip('"') if idx is not None and idx < len(cols) else ""

        symbol  = get("element")
        obs_wl  = get("obs_wl_air(A)")
        ritz_wl = get("ritz_wl_air(A)")
        aki_str = get("Aki(s^-1)")
        rel_str = get("intens")

        if not symbol:
            continue

        wl_str = obs_wl if obs_wl else ritz_wl
        wl = try_float(wl_str)
        if wl is None:
            continue

        # Prefer Aki (cross-element comparable); fall back to relative intensity
        aki = try_float(numeric_prefix(aki_str))
        if aki and aki > 0:
            intensity, src = int(aki), "aki"
        else:
            rel = try_int(numeric_prefix(rel_str))
            if rel and rel > 0:
                intensity, src = rel, "rel"
            else:
                continue

        lines.append({"symbol": symbol, "w": wl, "i": intensity, "src": src})

    return lines

def numeric_prefix(s: str) -> str:
    """Strip non-numeric suffixes like 'bl', 'h', 'e+07' qualifiers — keep leading digits/decimal/exponent."""
    import re
    m = re.match(r"[\d.]+(?:[eE][+-]?\d+)?", s)
    return m.group(0) if m else ""

def try_float(s: str):
    try: return float(s)
    except (ValueError, TypeError): return None

def try_int(s: str):
    try: return int(s)
    except (ValueError, TypeError): return None
```

---

## Validation

Before shipping the JSON, spot-check against known spectral fingerprints:

| Element | Known strong lines (air, Å) | Notes |
|---|---|---|
| H (Hydrogen) | 6562.8, 4861.3, 4340.5, 4101.7 | Balmer series — very bright, easy to verify |
| Na (Sodium) | 5889.95, 5895.92 | Famous yellow doublet — ~6 Å apart |
| Ne (Neon) | 5852.5, 6402.2, 6598.9, 7032.4 | Neon sign lines |
| Fe (Iron) | 3859.9, 4045.8, 4271.8, 5270.4 | Many hundreds of lines — verify count > 1000 |
| He (Helium) | 5875.6, 4471.5, 4026.2, 6678.2 | First confirmed in sun before Earth |

The Na doublet at 5890/5896 Å is the best single sanity check — two bright lines ~6 Å apart in the yellow region. If those render correctly and are separated by the right amount, the wavelength scale and air/vacuum choice are correct.
