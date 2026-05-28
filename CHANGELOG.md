# Changelog

## [1.2.0] — 2026-05-28

### Added
- Dark mode support with `prefers-color-scheme` auto-detection, manual toggle (moon/sun icon), and localStorage persistence
- 14 new CSS custom properties (`--dot-color`, `--dot-opacity`, `--chart-grid`, `--chart-donut-bg`, `--chart-point-bg`, `--swot-s`, `--swot-sb`, `--swot-o`, `--swot-ob`) for themeable components
- `cv()` JS helper for reading CSS custom properties at runtime — enables builder functions to adapt to dark mode
- `PROMPTS.md` — standalone document with all 20 system prompts, JSON schemas, score calibration, and retry logic for provider-agnostic use
- `WORKFLOW.md` — plain-English step-by-step guide for any human+AI team

### Changed
- Refactored all builder functions (`bHeatmap`, `bDemandSignals`, `bCompetitors`, `bFeatures`, `bReadiness`, `bRadar`, `bRisks`, `bOpsHurdles`, `sbg`) to use `cv()` instead of hardcoded hex colors
- `body::before` dot grid now uses `--dot-color` and `--dot-opacity` CSS variables
- SWOT cell backgrounds use theme-aware `--swot-s`, `--swot-o` variables
- Card hover shadow adapts for dark backgrounds
- README overhauled for provider-agnostic positioning with quickstart table

## [1.1.0] — 2026-05-28

### Changed
- Rewrote placeholder reference map (lines 232–477) — replaced old HTML-chunk placeholders (50+ dead) with 37 scalar + 29 JS data array placeholders
- Replaced HTML builder helpers with data shape documentation
- Updated early-stop/warning banner templates from dark-theme CSS classes to light-theme inline styles

### Fixed
- Header `border-radius` from `0 0 14px 14px` to `14px` (full round)
- Page `padding-top: 24px` for header breathing room
- Reduced header `padding-top` from 60px to 40px
- Added `margin-top: 8px` to `.bento` for banner spacing after hero
- `overflow-wrap: break-word; word-break: keep-all` on build decision and executive readout text

## [1.0.0] — 2026-05-28

### Added
- Initial PRD intelligence suite with 20 analysis modules
- Self-contained HTML dashboard with Tailwind CSS, Lucide icons, Chart.js
- 6-column asymmetric bento grid layout
- Executive summary, market sizing, demand signals, competitive landscape, user personas, feature-market fit, SWOT, GTM, monetisation, risk register, competitive moat, tech stack, operational audit, hiring roadmap, ecosystem strategy, unit economics, localization, accessibility, compliance, strategic exit
- Early stop conditions (insufficient context, weak viability)
- Score normalization and retry logic
- Strategic suggestions engine
- `test_gen.ps1` for generating test dashboards
