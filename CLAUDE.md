# Spectroscopy — Claude Code Instructions

## What this project is

React + TypeScript reboot of a 2003 Java spectroscopy applet. Educational puzzle game where users identify chemical elements and Doppler velocity from a mystery spectrum. Live at spectroscopy.app.

Full spec, architecture decisions, physics details, and phased build plan: **[project.md](project.md)**  
Legacy Java source for reference: **[github.com/teravation/spectroscopy-legacy](https://github.com/teravation/spectroscopy-legacy)**

## Key facts

- **Org:** github.com/teravation — owner is cmreigrut
- **Domain:** spectroscopy.app (Namecheap registrar, DNS delegating to Route 53)
- **Hosting:** AWS S3 + CloudFront
- **Stack:** React + TypeScript + Vite + Zustand + TanStack React Query
- **Data:** elements.json hosted separately on S3 (converted from legacy elements.xml)

## Current status

Phase 1 (playable core) not yet started. See project.md for phased build order.

## Conventions

See [CONTRIBUTING.md](CONTRIBUTING.md) for code standards, branch workflow, and env vars.

## Do not

- Change physics formulas without reading the fidelity notes in project.md — they must match the original Java applet exactly
- Commit `.env` files
- Push directly to `main`
