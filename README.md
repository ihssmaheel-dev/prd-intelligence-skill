# PRD Intelligence

> **Analyze any product idea across 20 strategic dimensions. Get a standalone HTML dashboard with scores, risks, market data, and strategic guidance. Works with any AI — Claude, ChatGPT, Gemini, Cursor, or any LLM.**

## Quickstart

```
1. Clone → cd prd-intelligence-skill
2. Wire it into your platform (see INSTALL.md — 30 seconds)
3. Type /prd <your PRD>
4. Open prd-report.html in any browser
```

Full walkthrough: [`WORKFLOW.md`](./WORKFLOW.md) | All prompts: [`PROMPTS.md`](./PROMPTS.md) | Setup per platform: [`INSTALL.md`](./INSTALL.md)

---

## What You Get

A single self-contained HTML file with a bento grid dashboard showing:

| Category | Cards |
|---|---|
| **Viability** | Overall score ring, build decision (green/amber/red), verdict badge |
| **Market** | TAM/SAM/SOM funnel, demand signals, buyer language keywords |
| **Strategy** | SWOT grid, competitive landscape, white space, moat assessment |
| **Product** | Feature-fit roadmap, tech stack, readiness radar |
| **Execution** | GTM phases and metrics, risk register, operational complexity |
| **Business** | Unit economics, revenue model, hiring roadmap, ecosystem |
| **Fit** | Localization, accessibility, compliance flags, exit potential |

Zero dependencies — the dashboard uses Tailwind CSS, Lucide icons, and Chart.js from CDN. Open it in any browser, no server needed.

---

## How It Works

```
PRD → 20 module prompts (JSON-in, JSON-out) → template.html → prd-report.html
```

Each module is a self-contained LLM call: **system prompt + PRD + schema → JSON**. The 20 JSON outputs fill a static HTML template. If the concept is weak after Module 1, the analysis stops early with a warning banner.

### Stop Conditions

- **Insufficient context** (<80 words, no problem/product signals) → partial report
- **Weak viability** (score < 45, verdict "Weak") → partial report with stop banner
- Otherwise → full 20-module dashboard

---

## Files

| File | Purpose |
|---|---|
| `AGENTS.md` | **Start here.** Single instruction file any AI agent reads to run `/prd` |
| `PROMPTS.md` | All 20 system prompts, JSON schemas, score calibration, and retry logic |
| `WORKFLOW.md` | Step-by-step guide for running the analysis with any AI |
| `INSTALL.md` | Platform-specific setup (opencode, Cursor, Claude, Copilot) |
| `template.html` | Self-contained HTML dashboard with 37 scalar + 29 JSON array placeholders |
| `validate.cjs` | Node.js schema validator for all 29 data arrays |
| `test_gen.ps1` | PowerShell script to generate test dashboards |
| `integrations/`  | Pre-built config files for each platform |
| `examples/prd-report.html` | Generated report example |

---

## Template Placeholders

The template uses two kinds of placeholders:

- **Scalar** (`{{REPORT_TITLE}}`, `{{EXECUTIVE_SUMMARY}}`, etc.) — 37 direct text replacements
- **JS data arrays** (`{{MODULE_DATA}}`, `{{COMPETITOR_DATA}}`, etc.) — 29 JSON arrays rendered at runtime

See `WORKFLOW.md` for the full reference map.

---

## Score Calibration

```
  0-14  = nonsense / commercially dead
 15-24  = very weak
 25-34  = weak but coherent
 35-44  = risky, major structural flaws
 45-54  = risky but testable
 55-64  = promising but shallow
 65-74  = promising with real signal
 75-82  = strong with a believable wedge
 83-89  = strong with clear commercial merit
 90-94  = exceptional, rare
 95-100 = outlier-level
```

Most ideas land below 70. Scores are intentionally harsh.

---

## Platform Setup (30 seconds)

| Platform | Action |
|---|---|
| **opencode** | Copy `integrations/opencode.json` into your project's `opencode.json` |
| **Cursor** | Copy `integrations/cursor.md` into `.cursor/rules/prd.mdc` |
| **Claude Code** | Copy `integrations/claude.md` into `CLAUDE.md` |
| **GitHub Copilot** | Copy `integrations/copilot.md` into `.github/copilot-instructions.md` |
| **OpenAI Codex CLI** | Copy `integrations/codex.md` into `CODEX.md` |
| **Any AI** | Paste AGENTS.md content into your system prompt |

Detailed instructions: [`INSTALL.md`](./INSTALL.md)

---

## Requirements

- **Any LLM** that can follow structured JSON output instructions
- A browser to open the HTML dashboard
- ~20 LLM calls per full analysis (2-5 minutes)

---

## License

MIT
