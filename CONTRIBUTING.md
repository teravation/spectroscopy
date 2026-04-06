# Contributing

## Tech Stack

React + TypeScript + Vite + Zustand + TanStack React Query. See [PROJECT.md](PROJECT.md) for full architecture.

## Getting Started

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest unit tests
npm run build      # Production build → dist/
```

## Branch Workflow

```
main       → production (auto-deploys to spectroscopy.app via GitHub Actions)
develop    → staging
feature/*  → normal development
```

PRs target `develop`. `develop` → `main` for releases.

## Code Standards

- **TypeScript strict mode** — no `any`, no implicit returns on non-void functions
- **Functional components only** — no class components
- **Co-locate tests** — `Foo.test.ts` next to `Foo.ts`, not in a separate `__tests__/` tree
- **No default exports** — named exports only (easier to refactor, better IDE support)
- **Physics layer is pure** — `src/physics/` has zero React dependencies; functions take plain data and return plain data. Keep it that way.
- **No CSS-in-JS** — CSS custom properties + plain CSS modules only

## Physics Fidelity

The spectral rendering must match the original Java applet exactly. Do not "improve" the physics formulas without explicit discussion — the exact Doppler formula, intensity thresholds, and line width calculations are documented in [project.md](project.md) and are intentional.

## Commit Messages

Short imperative subject line, present tense: `Add SpectrumCanvas component`, not `Added` or `Adding`.

## Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_PUZZLE_KEY` | AES-GCM key for puzzle token encryption (Phase 1) |
| `VITE_ELEMENTS_URL` | S3 URL for elements.json |
| `VITE_ASSETS_URL` | S3 base URL for brand configs |

Never commit `.env` files. Use `.env.local` for local overrides (gitignored).
