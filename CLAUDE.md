# Spectroscopy — Claude Code Instructions

## What this project is

React + TypeScript reboot of a 2003 Java spectroscopy applet. Educational puzzle game where users identify chemical elements and Doppler velocity from a mystery spectrum. Live at spectroscopy.app.

Full spec, architecture decisions, and physics details: **[PROJECT.md](PROJECT.md)**  
Build phases, open tasks, and verification checklist: **[BACKLOG.md](BACKLOG.md)**  
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
- ✅ Route 53 hosted zone for spectroscopy.app — `Z09589702Q2Y4PQNWDZMR`
- ✅ Namecheap NS records → Route 53 — delegated
- ✅ ACM wildcard cert (`*.spectroscopy.app`) in us-east-1 — issued (`56f973dd-b52c-4cf2-b54a-724919192a8e`)
- ✅ S3 buckets — `spectroscopy-app` (app) + `spectroscopy-assets` (data/brands), us-west-2
- ✅ CloudFront distributions — `E3O243NDPE0LG1` (spectroscopy.app) + `E2TYGZ9XLZ0D35` (assets.spectroscopy.app)
- ✅ GitHub Actions deploy pipeline — push to main → build → S3 sync → CloudFront invalidation
- ✅ Phase 1 build — complete and deployed to spectroscopy.app

## Conventions

See [CONTRIBUTING.md](CONTRIBUTING.md) for code standards, branch workflow, and env vars.

## Do not

- Change physics formulas without reading the fidelity notes in PROJECT.md — they must match the original Java applet exactly
- Commit `.env` files
- Push directly to `main`
