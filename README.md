# PRD Intelligence

> **Analyze any product idea across 25 strategic dimensions. Get a standalone HTML dashboard with scores, risks, market data, and strategic guidance. Works with any AI — Claude, ChatGPT, Gemini, Cursor, or any LLM.**

## Quickstart

```
1. Clone → cd prd-intelligence-skill
2. Wire it into your platform (see INSTALL.md — 30 seconds)
3. Type /prd <your PRD>
4. Open `reports/<project-name>.html` in any browser
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
| **Product** | Feature-fit roadmap, tech stack, readiness, open-source viability |
| **Pricing** | Pricing sensitivity, willingness to pay, tier strategy |
| **Execution** | GTM phases and metrics, risk register, operational complexity |
| **Business** | Unit economics, revenue model, hiring, ecosystem, fundraising readiness |
| **Team** | Founder-market fit evaluation |
| **Governance** | ESG assessment, compliance flags, accessibility |
| **Exit** | Strategic exit, localization fit |

Zero dependencies — the dashboard uses Tailwind CSS, Lucide icons, and Chart.js from CDN. Open it in any browser, no server needed.

---

## How It Works

```
PRD → 25 module prompts (JSON-in, JSON-out) → template.html → reports/ output
```

Each module is a self-contained LLM call: **system prompt + PRD + schema → JSON**. The 25 JSON outputs fill a static HTML template. If the concept is weak after Module 1, the analysis stops early with a warning banner.

### Stop Conditions

- **Insufficient context** (<80 words, no problem/product signals) → partial report
- **Weak viability** (score < 45, verdict "Weak") → partial report with stop banner
- Otherwise → full 25-module dashboard

---

## Files

| File | Purpose |
|---|---|
| `AGENTS.md` | **Start here.** Single instruction file any AI agent reads to run `/prd` |
| `PROMPTS.md` | All 25 system prompts, JSON schemas, score calibration, and retry logic |
| `WORKFLOW.md` | Step-by-step guide for running the analysis with any AI |
| `INSTALL.md` | Platform-specific setup (opencode, Cursor, Claude, Copilot, generic) |
| `template.html` | Self-contained HTML dashboard with 53 scalar + 36 JSON array placeholders |
| `docs/DESIGN.md` | Design system spec (Linear-style editorial brutalism) for reuse in other projects |
| `validate.cjs` | Node.js schema validator for all 29 data arrays |
| `test_gen.ps1` | PowerShell script to generate test dashboards |
| `run_prd.mjs` | **Auto-execution engine** — runs all 25 modules against an LLM autonomously |
| `lib/enrich.mjs` | Web enrichment engine — augments PRD with live market data |
| `.env.example` | Config template (copy to `.env`) |
| `integrations/`  | Pre-built config files for each platform |
| `reports/` | Generated report output directory (versioned naming) |

---

## Template Placeholders

The template uses two kinds of placeholders:

- **Scalar** (`{{REPORT_TITLE}}`, `{{EXECUTIVE_SUMMARY}}`, etc.) — 53 direct text replacements
- **JS data arrays** (`{{MODULE_DATA}}`, `{{COMPETITOR_DATA}}`, etc.) — 36 JSON arrays rendered at runtime

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
| **Any Agentic Platform** | Copy `integrations/any-agent.md` into your rules/system prompt area |
| **Any AI** | Paste AGENTS.md content into your system prompt |

Detailed instructions: [`INSTALL.md`](./INSTALL.md)

---

## Auto-Execution Engine

Run the full 25-module analysis on autopilot with one command:

```
cp .env.example .env    # configure LLM provider + API key
node run_prd.mjs "A B2B SaaS that helps customer success teams predict churn..." --enrich
node run_prd.mjs --file path/to/prd.md --industry Fintech --geography US
```

Features:
- **Provider-agnostic** — works with OpenAI, Anthropic, Gemini, or any OpenAI-compatible endpoint
- **3-attempt retry** with repair prompts per module
- **Score normalization** and cross-module alignment
- **Web enrichment** (`--enrich`) — searches Tavily/SerpAPI for live market data
- **Stop conditions** — early exit for weak or insufficient PRDs
- Calls `gen_report.mjs` to produce the HTML dashboard automatically

## Requirements

- **Node.js 18+** (for `fetch` and ES modules)
- **Any LLM API key** (OpenAI, Anthropic, or Gemini)
- A browser to open the HTML dashboard
- ~25 LLM calls per full analysis (2-5 minutes, ~£0.50-2.00 with GPT-4o)

---

## License

MIT
