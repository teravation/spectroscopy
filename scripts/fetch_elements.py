#!/usr/bin/env python3
"""
fetch_elements.py — Generate elements.json from the NIST Atomic Spectra Database.

Re-run whenever NIST data is refreshed or a new element is confirmed.
Output is written to ../public/elements.json (served as a static asset).

Usage:
    pip install -r requirements.txt
    python fetch_elements.py [--output ../public/elements.json] [--dry-run]

The reader counterpart is src/data/fetchElements.ts. If you change the JSON
schema here, update the TypeScript types in src/physics/types.ts to match.
"""

import argparse
import json
import re
import sys
import time
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path

import requests

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

NIST_URL = "https://physics.nist.gov/cgi-bin/ASD/lines1.pl"
HEADERS = {"User-Agent": "Mozilla/5.0 (spectroscopy.app data pipeline)"}

# Wavelength range (Å) — covers visible + near-IR useful for the app.
WAVELENGTH_LOW  = 3800
WAVELENGTH_HIGH = 10000

# Lines at or below this intensity are invisible in the renderer and excluded.
# Matches INTENSITY_THRESHOLD in src/components/SpectrumCanvas.tsx.
# For elements with no Aki anchors at all, normalize relative intensities to
# this assumed max Aki before global normalization. Not physically accurate
# but preserves the spectral fingerprint shape for those elements.
FALLBACK_MAX_AKI = 1e8

# Final output scale: global max Aki across all elements maps to this value.
# Matches INTENSITY_THRESHOLD in src/components/SpectrumCanvas.tsx (50/1000 = 5%).
OUTPUT_MAX = 1000
INTENSITY_THRESHOLD = 10   # lines below this after normalization are dropped (~1% of max)

# Seconds between per-element requests — be polite to NIST.
REQUEST_DELAY = 2.0
REQUEST_RETRIES = 2
REQUEST_RETRY_DELAY = 10.0

NIST_PARAMS_BASE = {
    "limits_type": "0",
    "low_w": str(WAVELENGTH_LOW),
    "upp_w": str(WAVELENGTH_HIGH),
    "unit": "0",               # Ångströms
    "submit": "Retrieve Data",   # encoded as + by quote_plus, not %2B
    "de": "0",
    "format": "3",             # tab-delimited plain text
    "line_out": "1",           # observed lines only — drops theoretical Ritz-only lines
    "en_unit": "0",
    "output": "0",
    "bibrefs": "1",
    "page_size": "15",
    "show_obs_wl": "1",
    "show_calc_wl": "1",       # Ritz wavelength as fallback for wavelength only
    "unc_out": "1",
    "order_out": "0",
    "show_av": "3",            # VACUUM wavelengths — canonical, see ELEMENTS.md
    "A_out": "1",              # Einstein A coefficient (Aki) — cross-element comparable
    "intens_out": "on",        # also fetch NIST relative intensity for anchor scaling
    "allowed_out": "1",
    "forbid_out": "1",
    "no_spaces": "1",
    # spectra is set per-element in fetch_element()
}

# ---------------------------------------------------------------------------
# Element metadata
# Name, period, group, row (visual grid row), col (visual grid col).
# row 9 = lanthanides, row 10 = actinides (visual gap after row 7).
# This table is the authoritative layout for PeriodicTable.tsx.
# ---------------------------------------------------------------------------

ELEMENT_META = {
    1:   ("H",   "Hydrogen",        1, 1,  1,  1),
    2:   ("He",  "Helium",          1, 18, 1,  18),
    3:   ("Li",  "Lithium",         2, 1,  2,  1),
    4:   ("Be",  "Beryllium",       2, 2,  2,  2),
    5:   ("B",   "Boron",           2, 13, 2,  13),
    6:   ("C",   "Carbon",          2, 14, 2,  14),
    7:   ("N",   "Nitrogen",        2, 15, 2,  15),
    8:   ("O",   "Oxygen",          2, 16, 2,  16),
    9:   ("F",   "Fluorine",        2, 17, 2,  17),
    10:  ("Ne",  "Neon",            2, 18, 2,  18),
    11:  ("Na",  "Sodium",          3, 1,  3,  1),
    12:  ("Mg",  "Magnesium",       3, 2,  3,  2),
    13:  ("Al",  "Aluminum",        3, 13, 3,  13),
    14:  ("Si",  "Silicon",         3, 14, 3,  14),
    15:  ("P",   "Phosphorus",      3, 15, 3,  15),
    16:  ("S",   "Sulfur",          3, 16, 3,  16),
    17:  ("Cl",  "Chlorine",        3, 17, 3,  17),
    18:  ("Ar",  "Argon",           3, 18, 3,  18),
    19:  ("K",   "Potassium",       4, 1,  4,  1),
    20:  ("Ca",  "Calcium",         4, 2,  4,  2),
    21:  ("Sc",  "Scandium",        4, 3,  4,  3),
    22:  ("Ti",  "Titanium",        4, 4,  4,  4),
    23:  ("V",   "Vanadium",        4, 5,  4,  5),
    24:  ("Cr",  "Chromium",        4, 6,  4,  6),
    25:  ("Mn",  "Manganese",       4, 7,  4,  7),
    26:  ("Fe",  "Iron",            4, 8,  4,  8),
    27:  ("Co",  "Cobalt",          4, 9,  4,  9),
    28:  ("Ni",  "Nickel",          4, 10, 4,  10),
    29:  ("Cu",  "Copper",          4, 11, 4,  11),
    30:  ("Zn",  "Zinc",            4, 12, 4,  12),
    31:  ("Ga",  "Gallium",         4, 13, 4,  13),
    32:  ("Ge",  "Germanium",       4, 14, 4,  14),
    33:  ("As",  "Arsenic",         4, 15, 4,  15),
    34:  ("Se",  "Selenium",        4, 16, 4,  16),
    35:  ("Br",  "Bromine",         4, 17, 4,  17),
    36:  ("Kr",  "Krypton",         4, 18, 4,  18),
    37:  ("Rb",  "Rubidium",        5, 1,  5,  1),
    38:  ("Sr",  "Strontium",       5, 2,  5,  2),
    39:  ("Y",   "Yttrium",         5, 3,  5,  3),
    40:  ("Zr",  "Zirconium",       5, 4,  5,  4),
    41:  ("Nb",  "Niobium",         5, 5,  5,  5),
    42:  ("Mo",  "Molybdenum",      5, 6,  5,  6),
    43:  ("Tc",  "Technetium",      5, 7,  5,  7),
    44:  ("Ru",  "Ruthenium",       5, 8,  5,  8),
    45:  ("Rh",  "Rhodium",         5, 9,  5,  9),
    46:  ("Pd",  "Palladium",       5, 10, 5,  10),
    47:  ("Ag",  "Silver",          5, 11, 5,  11),
    48:  ("Cd",  "Cadmium",         5, 12, 5,  12),
    49:  ("In",  "Indium",          5, 13, 5,  13),
    50:  ("Sn",  "Tin",             5, 14, 5,  14),
    51:  ("Sb",  "Antimony",        5, 15, 5,  15),
    52:  ("Te",  "Tellurium",       5, 16, 5,  16),
    53:  ("I",   "Iodine",          5, 17, 5,  17),
    54:  ("Xe",  "Xenon",           5, 18, 5,  18),
    55:  ("Cs",  "Cesium",          6, 1,  6,  1),
    56:  ("Ba",  "Barium",          6, 2,  6,  2),
    57:  ("La",  "Lanthanum",       6, 3,  9,  3),
    58:  ("Ce",  "Cerium",          6, 0,  9,  4),
    59:  ("Pr",  "Praseodymium",    6, 0,  9,  5),
    60:  ("Nd",  "Neodymium",       6, 0,  9,  6),
    61:  ("Pm",  "Promethium",      6, 0,  9,  7),
    62:  ("Sm",  "Samarium",        6, 0,  9,  8),
    63:  ("Eu",  "Europium",        6, 0,  9,  9),
    64:  ("Gd",  "Gadolinium",      6, 0,  9,  10),
    65:  ("Tb",  "Terbium",         6, 0,  9,  11),
    66:  ("Dy",  "Dysprosium",      6, 0,  9,  12),
    67:  ("Ho",  "Holmium",         6, 0,  9,  13),
    68:  ("Er",  "Erbium",          6, 0,  9,  14),
    69:  ("Tm",  "Thulium",         6, 0,  9,  15),
    70:  ("Yb",  "Ytterbium",       6, 0,  9,  16),
    71:  ("Lu",  "Lutetium",        6, 3,  6,  3),
    72:  ("Hf",  "Hafnium",         6, 4,  6,  4),
    73:  ("Ta",  "Tantalum",        6, 5,  6,  5),
    74:  ("W",   "Tungsten",        6, 6,  6,  6),
    75:  ("Re",  "Rhenium",         6, 7,  6,  7),
    76:  ("Os",  "Osmium",          6, 8,  6,  8),
    77:  ("Ir",  "Iridium",         6, 9,  6,  9),
    78:  ("Pt",  "Platinum",        6, 10, 6,  10),
    79:  ("Au",  "Gold",            6, 11, 6,  11),
    80:  ("Hg",  "Mercury",         6, 12, 6,  12),
    81:  ("Tl",  "Thallium",        6, 13, 6,  13),
    82:  ("Pb",  "Lead",            6, 14, 6,  14),
    83:  ("Bi",  "Bismuth",         6, 15, 6,  15),
    84:  ("Po",  "Polonium",        6, 16, 6,  16),
    85:  ("At",  "Astatine",        6, 17, 6,  17),
    86:  ("Rn",  "Radon",           6, 18, 6,  18),
    87:  ("Fr",  "Francium",        7, 1,  7,  1),
    88:  ("Ra",  "Radium",          7, 2,  7,  2),
    89:  ("Ac",  "Actinium",        7, 3,  10, 3),
    90:  ("Th",  "Thorium",         7, 0,  10, 4),
    91:  ("Pa",  "Protactinium",    7, 0,  10, 5),
    92:  ("U",   "Uranium",         7, 0,  10, 6),
    93:  ("Np",  "Neptunium",       7, 0,  10, 7),
    94:  ("Pu",  "Plutonium",       7, 0,  10, 8),
    95:  ("Am",  "Americium",       7, 0,  10, 9),
    96:  ("Cm",  "Curium",          7, 0,  10, 10),
    97:  ("Bk",  "Berkelium",       7, 0,  10, 11),
    98:  ("Cf",  "Californium",     7, 0,  10, 12),
    99:  ("Es",  "Einsteinium",     7, 0,  10, 13),
    100: ("Fm",  "Fermium",         7, 0,  10, 14),
    101: ("Md",  "Mendelevium",     7, 0,  10, 15),
    102: ("No",  "Nobelium",        7, 0,  10, 16),
    103: ("Lr",  "Lawrencium",      7, 3,  7,  3),
    104: ("Rf",  "Rutherfordium",   7, 4,  7,  4),
    105: ("Db",  "Dubnium",         7, 5,  7,  5),
    106: ("Sg",  "Seaborgium",      7, 6,  7,  6),
    107: ("Bh",  "Bohrium",         7, 7,  7,  7),
    108: ("Hs",  "Hassium",         7, 8,  7,  8),
    109: ("Mt",  "Meitnerium",      7, 9,  7,  9),
    110: ("Ds",  "Darmstadtium",    7, 10, 7,  10),
    111: ("Rg",  "Roentgenium",     7, 11, 7,  11),
    112: ("Cn",  "Copernicium",     7, 12, 7,  12),
    113: ("Nh",  "Nihonium",        7, 13, 7,  13),
    114: ("Fl",  "Flerovium",       7, 14, 7,  14),
    115: ("Mc",  "Moscovium",       7, 15, 7,  15),
    116: ("Lv",  "Livermorium",     7, 16, 7,  16),
    117: ("Ts",  "Tennessine",      7, 17, 7,  17),
    118: ("Og",  "Oganesson",       7, 18, 7,  18),
}

# Map NIST symbol → atomic number. NIST uses neutral symbols (e.g. "Fe", "Ne").
SYMBOL_TO_Z = {v[0]: k for k, v in ELEMENT_META.items()}

# ---------------------------------------------------------------------------
# Fetching
# ---------------------------------------------------------------------------

def fetch_element(symbol: str, debug_dir: Path | None = None) -> list[dict]:
    """
    Fetch all spectral lines for one element from NIST ASD.
    Returns list of {w, i} dicts (symbol already known from caller).

    Per-element queries omit the 'element' and 'sp_num' columns — column
    layout is detected dynamically from the header row.
    """
    params = {**NIST_PARAMS_BASE, "spectra": symbol}
    # NIST CGI requires form-style encoding: spaces as +, not %20.
    query = urllib.parse.urlencode(params, quote_via=urllib.parse.quote_plus)

    resp = None
    for attempt in range(1 + REQUEST_RETRIES):
        resp = requests.get(f"{NIST_URL}?{query}", headers=HEADERS, timeout=60)
        resp.raise_for_status()
        if "<html" not in resp.text[:200].lower():
            break
        z = SYMBOL_TO_Z.get(symbol, 0)
        if z > 99:
            return []  # no NIST data for superheavy elements — expected
        if attempt == 0:
            # line_out=1 returns an error page when an element has no directly
            # observed lines in range (only theoretical Ritz-calculated lines).
            # We only use observed data — return empty rather than falling back.
            return []
        if attempt < REQUEST_RETRIES:
            print(f"  (HTML response for {symbol}, retrying in {REQUEST_RETRY_DELAY}s...)", end=" ", flush=True)
            time.sleep(REQUEST_RETRY_DELAY)
        else:
            print(f"WARNING: NIST returned HTML for {symbol} (Z={z}) after {1+REQUEST_RETRIES} attempts")
            return []

    if debug_dir is not None:
        debug_dir.mkdir(parents=True, exist_ok=True)
        raw_path = debug_dir / f"nist_raw_{symbol}.txt"
        raw_path.write_text(resp.text, encoding="utf-8")

    lines = []
    col: dict[str, int] = {}

    for row in resp.text.splitlines():
        if not col:
            if "obs_wl" in row or "ritz_wl" in row:
                headers = [h.strip() for h in row.split("\t")]
                col = {h: i for i, h in enumerate(headers)}
            continue

        cols = row.split("\t")

        def get(name: str) -> str:
            idx = col.get(name)
            return cols[idx].strip().strip('"') if idx is not None and idx < len(cols) else ""

        obs_wl  = get("obs_wl_vac(A)")
        ritz_wl = get("ritz_wl_vac(A)")

        wl_str = obs_wl if obs_wl else ritz_wl
        wl = _parse_float(wl_str)
        if wl is None:
            continue

        # Column name is "gA(s^-1)" (statistical weight × Einstein A) with line_out=1
        aki = _parse_float(get("gA(s^-1)"))
        rel = _parse_int(get("intens"))

        if aki is not None and aki > 0:
            lines.append({"w": wl, "aki": aki, "rel": rel})
        elif rel is not None and rel > 0:
            lines.append({"w": wl, "aki": None, "rel": rel})

    if not col:
        print(f"  WARNING: no header row found for {symbol} — 0 lines")

    return lines


def _parse_float(s: str) -> float | None:
    """Parse float including scientific notation; ignore non-numeric suffixes."""
    m = re.match(r"[\d.]+(?:[eE][+-]?\d+)?", s)
    try:
        return float(m.group()) if m else None
    except ValueError:
        return None


def _parse_int(s: str) -> int | None:
    """Strip trailing non-numeric suffixes (h, l, d, bl, w, r, *) and return int."""
    m = re.match(r"\d+", s)
    return int(m.group()) if m else None

# ---------------------------------------------------------------------------
# Processing
# ---------------------------------------------------------------------------

def process_lines(raw_lines: list[dict], symbol: str = "?") -> list[dict]:
    """
    Convert raw NIST lines to a unified intensity scale using Aki (Einstein A
    coefficient, s⁻¹) as the primary value — cross-element physically comparable.

    Strategy (anchor scaling, per ELEMENTS.md):
    1. For lines with Aki: use Aki directly as intensity.
    2. For lines with only relative intensity: compute a per-element scale factor
       k = median(Aki / rel) from lines that have both, then i = rel * k.
    3. If no anchor lines exist: normalize relative intensities so max = FALLBACK_MAX_AKI.

    After scaling, deduplicate on wavelength (keep highest i), filter below
    INTENSITY_THRESHOLD, and sort ascending.
    """
    from statistics import median

    if not raw_lines:
        return []

    # Deduplicate on wavelength, keeping the entry with the best Aki (or highest rel)
    wl_map: dict[float, dict] = {}
    for line in raw_lines:
        w = round(line["w"], 1)
        existing = wl_map.get(w)
        if existing is None:
            wl_map[w] = line
        else:
            # Prefer entries with Aki; break ties by higher value
            if (line["aki"] or 0) > (existing["aki"] or 0):
                wl_map[w] = line
            elif line["aki"] is None and (line["rel"] or 0) > (existing["rel"] or 0):
                wl_map[w] = existing  # keep existing if it has Aki or higher rel

    deduped = list(wl_map.values())

    # Compute anchor scale factor k from lines that have both Aki and rel
    anchor_lines = [l for l in deduped if l["aki"] and l["rel"]]
    if anchor_lines:
        ratios = [l["aki"] / l["rel"] for l in anchor_lines]
        k = median(ratios)
        src = "anchor"
    else:
        k = None
        src = "normalized"
        if any(l["aki"] for l in deduped):
            src = "aki-only"

    # Assign unified intensity
    result = []
    for line in deduped:
        if line["aki"]:
            i = line["aki"]
            line_src = "aki"
        elif k is not None and line["rel"]:
            i = line["rel"] * k
            line_src = "scaled"
        elif line["rel"]:
            # No anchors — normalize relative intensities to FALLBACK_MAX_AKI
            i = line["rel"]  # will normalize below
            line_src = "normalized"
        else:
            continue
        result.append({"w": line["w"], "i": i, "_src": line_src})

    # Apply fallback normalization if no Aki anchors at all
    if src == "normalized" and result:
        max_rel = max(l["i"] for l in result)
        if max_rel > 0:
            for l in result:
                l["i"] = l["i"] / max_rel * FALLBACK_MAX_AKI

    # Sort, keep internal _src for debugging, drop zero/negative
    output = [
        {"w": round(l["w"], 1), "i": l["i"]}
        for l in result
        if l["i"] > 0
    ]
    output.sort(key=lambda x: x["w"])

    # Log a warning if anchor coverage is poor for a real element
    n_aki = sum(1 for l in deduped if l["aki"])
    n_total = len(deduped)
    if n_total > 0 and n_aki == 0 and n_total > 5:
        print(f"  NOTE: {symbol} has no Aki values — using {src} normalization ({n_total} lines)")

    return output  # intensities are in Aki-equivalent (s⁻¹) units, not yet normalized


def global_normalize(lines_by_z: dict[int, list[dict]]) -> dict[int, list[dict]]:
    """
    Normalize all intensities to a 0–OUTPUT_MAX scale, then drop below threshold.

    Uses the 99th percentile as the normalization reference rather than the
    absolute maximum — a handful of outlier transitions (e.g. high-gA Ne lines)
    would otherwise compress the bulk of lines into near-zero. Values above the
    99th percentile are clamped to OUTPUT_MAX; they're just "very bright".
    """
    all_intensities = sorted(
        line["i"] for lines in lines_by_z.values() for line in lines
    )
    if not all_intensities:
        return lines_by_z

    p99_idx = max(0, int(len(all_intensities) * 0.99) - 1)
    ref = all_intensities[p99_idx]
    print(f"Normalization reference (99th pct): {ref:.3e}  "
          f"(absolute max: {all_intensities[-1]:.3e})")

    normalized: dict[int, list[dict]] = {}
    for z, lines in lines_by_z.items():
        scaled = [
            {"w": l["w"], "i": min(OUTPUT_MAX, round(l["i"] / ref * OUTPUT_MAX))}
            for l in lines
        ]
        normalized[z] = [l for l in scaled if l["i"] > INTENSITY_THRESHOLD]

    return normalized

# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------

def build_output(lines_by_z: dict[int, list[dict]]) -> dict:
    elements = []
    for z in sorted(ELEMENT_META.keys()):
        symbol, name, period, group, row, col = ELEMENT_META[z]
        elements.append({
            "atomicNumber": z,
            "symbol": symbol,
            "name": name,
            "period": period,
            "group": group,
            "row": row,
            "col": col,
            "lines": lines_by_z.get(z, []),
        })

    return {
        "version": datetime.now(timezone.utc).strftime("%Y-%m"),
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "wavelengthType": "vacuum",
        "intensityScale": "aki-normalized-1000",  # Aki-equivalent, global max = 1000
        "elements": elements,
    }

# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

KNOWN_LINES = {
    # element: [(wavelength_vacuum_Å, description)]
    # Only include lines bright enough to clear INTENSITY_THRESHOLD after normalization.
    "H":  [(6564.6, "Hα"), (4862.7, "Hβ"), (4341.7, "Hγ"), (4102.9, "Hδ"), (3971.2, "Hε")],
    "Na": [(5891.6, "Na D2"), (5897.6, "Na D1")],
    "Ne": [(6403.4, "Ne"), (6680.1, "Ne"), (7034.3, "Ne")],
    "He": [(5877.2, "He"), (4472.7, "He"), (6680.0, "He")],
}

def validate(output: dict) -> bool:
    by_symbol = {e["symbol"]: e for e in output["elements"]}
    ok = True
    for symbol, known in KNOWN_LINES.items():
        el = by_symbol.get(symbol)
        if el is None:
            print(f"  WARN: {symbol} not found in output")
            ok = False
            continue
        wls = sorted(line["w"] for line in el["lines"])
        for target_wl, desc in known:
            if not any(abs(w - target_wl) <= 1.0 for w in wls):
                # Find nearest actual line to help diagnose offset or vacuum/air issue
                nearest = min(wls, key=lambda w: abs(w - target_wl), default=None)
                nearest_str = f" (nearest: {nearest:.1f} Å, Δ={nearest - target_wl:+.1f})" if nearest else ""
                print(f"  WARN: {symbol} missing {desc} at {target_wl} Å{nearest_str}")
                ok = False
    if ok:
        for symbol, known in KNOWN_LINES.items():
            el = by_symbol.get(symbol)
            if el:
                print(f"  OK  : {symbol} — {len(el['lines'])} lines, "
                      f"reference lines present")
    return ok

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Fetch NIST spectral data → elements.json")
    parser.add_argument(
        "--output",
        default=str(Path(__file__).parent.parent / "public" / "elements.json"),
        help="Output path (default: ../public/elements.json)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Fetch and parse but do not write output file",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Save raw NIST responses to ../data/ and print column layout",
    )
    args = parser.parse_args()

    debug_dir = Path(__file__).parent.parent / "data" if args.debug else None

    print(f"Fetching spectral data from NIST ASD ({len(ELEMENT_META)} elements)...")
    lines_by_z: dict[int, list[dict]] = {}
    for idx, (z, meta) in enumerate(sorted(ELEMENT_META.items())):
        symbol = meta[0]
        print(f"  [{idx+1:3d}/{len(ELEMENT_META)}] {symbol:3s} ...", end=" ", flush=True)
        raw = fetch_element(symbol, debug_dir=debug_dir)
        processed = process_lines(raw, symbol=symbol)
        lines_by_z[z] = processed
        print(f"{len(processed)} lines" if processed else "(no data)")
        if idx < len(ELEMENT_META) - 1:
            time.sleep(REQUEST_DELAY)

    n_with_lines = sum(1 for v in lines_by_z.values() if v)
    print(f"\nFetched {n_with_lines} elements with spectral data")

    print("Normalizing to global 0-1000 scale...")
    lines_by_z = global_normalize(lines_by_z)
    total_kept = sum(len(v) for v in lines_by_z.values())
    print(f"Total lines after normalization + threshold filter: {total_kept}")

    output = build_output(lines_by_z)

    print("\nValidating known reference lines...")
    valid = validate(output)
    if not valid:
        print("Validation warnings above — review before shipping.")
    else:
        print("  All reference lines present.")

    if args.dry_run:
        print("\n--dry-run: skipping file write.")
        return

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, separators=(",", ":"))

    size_kb = out_path.stat().st_size / 1024
    print(f"\nWrote {out_path} ({size_kb:.0f} KB)")


if __name__ == "__main__":
    main()
