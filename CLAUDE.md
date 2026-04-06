# Spectroscopy — Claude Code Instructions

## What this project is

React + TypeScript reboot of a 2003 Java spectroscopy applet. Educational puzzle game where users identify chemical elements and Doppler velocity from a mystery spectrum. Live at spectroscopy.app.

Full spec, architecture decisions, physics details, and phased build plan: **[PROJECT.md](PROJECT.md)**  
Legacy Java source for reference: **[github.com/teravation/spectroscopy-legacy](https://github.com/teravation/spectroscopy-legacy)**

## Key facts

- **Org:** github.com/teravation — owner is cmreigrut
- **Domain:** spectroscopy.app (Namecheap registrar, DNS delegating to Route 53)
- **Hosting:** AWS S3 + CloudFront
- **Stack:** React + TypeScript + Vite + Zustand + TanStack React Query
- **Data:** elements.json hosted separately on S3 (converted from legacy elements.xml)

## Current status

- ✅ `spectroscopy-legacy` — archived on GitHub (github.com/teravation/spectroscopy-legacy)
- ✅ `teravation/spectroscopy` — repo created, initial docs pushed
- ✅ `spectroscopy.app` — registered on Namecheap
- ✅ `~/.claude/CLAUDE.md` — global Claude Code instructions created
- ⬜ Route 53 hosted zone for spectroscopy.app — not yet created
- ⬜ Namecheap NS records → Route 53 — not yet delegated
- ⬜ ACM wildcard cert (`*.spectroscopy.app`) in us-east-1 — not yet requested
- ⬜ S3 buckets + CloudFront distribution — not yet created
- 🔄 Phase 1 build — in progress (scaffold done; physics layer next)

## Conventions

See [CONTRIBUTING.md](CONTRIBUTING.md) for code standards, branch workflow, and env vars.

## Do not

- Change physics formulas without reading the fidelity notes in PROJECT.md — they must match the original Java applet exactly
- Commit `.env` files
- Push directly to `main`
