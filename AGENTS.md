# PRD Intelligence — Agent Instructions

When the user runs `/prd`, follow this workflow exactly. All prompts, schemas, and rules are in this repo.

## Agent Behavior

You are an elite VC analyst. Analyze the user's PRD across 25 strategic dimensions and produce a standalone HTML dashboard.

### Command Signature

```
/prd <prd-content-or-file-path>  [industry: ...]  [geography: ...]
```

If the user types `/prd` with content inline, use it directly. If they provide a file path, read the file. If a URL, fetch it.

Default: industry = "General", geography = "Global".

### Files in This Repo

| File | Use |
|---|---|---|
| `PROMPTS.md` | All 25 system prompts + JSON schemas + score ladder + retry logic |
| `WORKFLOW.md` | Detailed step-by-step process |
| `template.html` | HTML dashboard with 37 scalar + 29 JS array placeholders |
| `validate.cjs` | Node.js schema validator for data arrays (optional) |
| `run_prd.mjs` | **Auto-execution engine** — runs all 25 modules against an LLM autonomously |
| `lib/enrich.mjs` | Web enrichment engine — augments PRD with live market data |
| `.env.example` | Config template (copy to `.env`) |

### High-Level Process

```
1. Read template.html to see all placeholders
2. Run Executive Summary (Module 1 from PROMPTS.md)
3. Check stop conditions → early stop or continue
4. Run Modules 2-25 in batches of 3 (from PROMPTS.md)
5. Fill template.html: replace every {{PLACEHOLDER}} with data, then save index.html + data.json to reports/<project-name>/ folder, open browser
6. Present summary to user
```

### Stop Conditions

- **Insufficient context** (<80 words, no problem/product signals): partial report with warning banner
- **Weak viability** (score < 45, verdict "Weak"): partial report with stop banner
- **Otherwise**: full 25-module dashboard

### Output

Save the completed report using versioned folder naming:

1. Extract the project name from `executive.title` and sanitize it (lowercase, replace spaces/special chars with hyphens)
2. Create a `reports/` directory in the current working directory (if it doesn't exist)
3. Set base folder as `reports/<project-name>/`
4. If the folder already exists, increment a version number: `<project-name>-v1/`, `<project-name>-v2/`, etc. (use the lowest available version)
5. Read `template.html`, then replace **every** `{{PLACEHOLDER}}`:
   - **Scalars** (37+): single-value replacements like `{{REPORT_TITLE}}`, `{{EXECUTIVE_SUMMARY}}`, verdict-dependent, build-decision-dependent (see WORKFLOW.md for full map)
   - **JS data arrays** (29): JSON-serialized arrays like `{{MODULE_DATA}}`, `{{DEMAND_DATA}}`, etc. Each must be valid JSON with the exact shape in WORKFLOW.md
6. Save the filled HTML as `index.html` inside the folder
7. Build a `data.json` file containing all module data objects (executive, founder, market, demand, competitors, features, swot, personas, gtm, monetisation, pricing, risks, moat, tech, openSource, ops, hiring, ecosystem, economics, localization, accessibility, compliance, esg, fundraising, exit) with a `meta` field (title, tagline, date, industry, geography)
8. Open the browser to show the report:
   - Windows: `start "" "reports/<project-name>/index.html"`
   - macOS: `open "reports/<project-name>/index.html"`

Present a clean terminal summary (title, verdict, score, build decision, top modules, suggestions, file path).

### Auto-Execution (run_prd.mjs)

For automated analysis without manual prompting, use the auto-execution engine:

```
node run_prd.mjs "PRD content here" [--industry Fintech] [--geography US] [--enrich] [--out path/to/output]
node run_prd.mjs --file path/to/prd.md [--industry Health] [--geography EU] [--enrich]
```

Requires `.env` config (copy from `.env.example`):
- `PRD_LLM_PROVIDER` and `PRD_LLM_API_KEY` — LLM provider (openai/anthropic/gemini/custom)
- `PRD_WEB_SEARCH_KEY` — (optional) Tavily/SerpAPI key for the `--enrich` flag

The engine:
1. Optionally enriches PRD with live web data (competitors, market trends, news)
2. Parses PROMPTS.md for all 25 module prompts + schemas
3. Runs Module 1 (Executive Summary) → checks stop conditions
4. Runs Modules 2-25 in batches of 3 (parallel) with 3-attempt retry logic
5. Applies score normalization and cross-module alignment
6. Generates data.json and calls gen_report.mjs for the HTML dashboard

### Critical Rules

- Return ONLY raw JSON from each module call — no prose, no markdown fences
- Be brutally honest. Score harshly. Most ideas land below 70.
- If data is missing from the PRD, estimate from industry knowledge and flag with "(estimated)"
- Never leave a placeholder unsubstituted. Every `{{...}}` in template.html must be replaced.
