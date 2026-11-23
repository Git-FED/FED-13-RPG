# FED-13 RPG Field Guide

A static, GitHub Pages / Cloudflare Pages-ready promotional site built from the FED-13 RPG design documents.

## Pages

- `index.html` — animated landing page, looping ticker, promo art
- `codex.html` — filterable creature codex
- `classes.html` — warden classes and progression
- `systems.html` — battle, Shards, homestead, clan and travel systems
- `community.html` — centered Discord community hall
- `payments.html` — age-gated subscription, donation, card and crypto support tabs
- `sponsor.html` — centered responsive GitHub Sponsors card
- `private-communities.html` — 18+ checkbox and country eligibility gate for restricted Matrix access
- `thanks.html` — branded donation landing page adapted from the supplied thanks.dev layout
- `404.html` — HTML fallback page for missing routes

## Visuals and behavior

- Symbol-only crystal crest favicon in every HTML page; no letter favicon.
- Original hero, banner, Bondkin, crest, and animated GIF assets.
- CSS reveal, hover, ticker, float, spark, and panel animations.
- Payment controls stay hidden behind an 18+ confirmation gate.
- Ko-fi widget and funding entry removed.
- All internal buttons and navigation lead to HTML pages.
- GitHub Sponsors card is embedded in Donate and available as a standalone HTML route.
- Discord iframe is centered in a responsive community card.
- Animated FED-OS footer with compact social icon buttons, public ecosystem links, contact mail links, media, support, and a gated Private Communities route.
- The restricted Matrix URL is not exposed in the public footer; it is revealed only after the private-community checks.
- The thanks page uses the existing symbol crest instead of a blank/data favicon or embedded base64 avatar.
- `index.html` includes a FED-13-styled Supabase login modal with email/password sign-in, account creation, password reset, session restoration, and sign-out.
- Authentication behavior is isolated in `js/auth.js`; the browser-safe Supabase URL and publishable key are the only provider values used in the static frontend.

## Hosting

This repository has no build step. Publish the repository root as the static output directory. For GitHub Pages, select the branch root in Pages settings. For Cloudflare Pages, use a direct upload or connect the repository with the build command left empty and the output directory set to `/`.
