# PRD Intelligence — Workflow Guide

This guide explains how to run a full PRD analysis from start to finish. **Provider-agnostic** — works with Claude, ChatGPT, Gemini, Cursor, or any LLM. Steps are written for a human + AI pair to follow together.

---

## Quickstart

```
1. Paste PRD + pick industry/geography
2. Run Module 1 (Executive Summary)
3. Check stop conditions — continue or stop with a partial report
4. Run Modules 2–25 in batches of 3
5. Generate the HTML dashboard
6. Present the summary
```

Total: ~25–50 minutes with a standard LLM. Each module call returns a single JSON object.

---

## Step-by-Step

### Step 1: Gather Input

Collect from the user:
- **PRD content** — paste text, upload a file, or provide a URL
- **Industry** (optional, default: "General")
- **Geography** (optional, default: "Global")

If the user provides a file path, read the file. If a URL, fetch the content.

**Check input quality:**
- Count meaningful words (ignore markdown syntax, code fences, HTML tags)
- Look for problem language: "problem", "pain", "challenge", "issue", "need", "gap"
- Look for product language: "product", "platform", "app", "tool", "solution", "feature"
- If under 80 words AND missing both problem + product signals → mark as insufficient context

### Step 2: Read the Template

Open `template.html` to see every placeholder that needs to be replaced. You will replace:
- **Scalar placeholders** (e.g., `{{REPORT_TITLE}}`) — one-at-a-time string replacements
- **JS data array placeholders** (e.g., `{{MODULE_DATA}}`) — JSON array values that the template renders at runtime

### Step 3: Run Executive Summary (Module 1)

Send the **Executive Summary prompt** (from PROMPTS.md, Module 1) with:
- The PRD content
- The industry and geography
- System prompt: the VC analyst persona + executive summary lens

**Expected response shape:**
```json
{
  "title": "Product name or concept title",
  "tagline": "One-line value proposition",
  "summary": "2-3 sentence executive summary",
  "buildDecisionQuestion": "Short dashboard question",
  "buildDecisionLabel": "18-35 char decision label",
  "buildDecision": "One or two sentence answer",
  "stopAnalysisReason": "Empty or 'Stop.' reason",
  "overallScore": 42,
  "verdict": "Promising",
  "insufficientContext": false,
  "insufficientReason": ""
}
```

**After receiving, apply score normalization:**
- `Excellent` → clamp score to 92-100
- `Strong` → clamp to 78-89
- `Promising` → clamp to 58-74
- `Risky` → clamp to 35-52
- `Weak` → clamp to 0-32
- If `stopAnalysisReason` is non-empty, cap score at 34 max

### Step 4: Check Stop Conditions

**Condition A — Insufficient context:**
If `insufficientContext` is true AND the PRD is under 80 words with no problem/product signals → **STOP**. Generate a partial HTML with a warning banner explaining the issue.

**Condition B — Weak viability:**
If verdict is "Weak" AND overallScore < 45 → **STOP**. Generate a partial HTML with a "Stop" banner explaining why. The `stopAnalysisReason` or `buildDecision` text goes in the banner.

**Condition C — Continue:**
Otherwise, proceed to Modules 2-25.

### Step 5: Run Modules 2-25

Process modules **in batches of 3** to stay within context limits. For each module:

1. Use the **module-specific system prompt lens** from PROMPTS.md
2. Provide the **executive summary** as context (for internal consistency)
3. Include the **PRD content** (truncated if very long)
4. Specify the **exact JSON schema** to return
5. Include industry and geography

**Batch order (recommended):**
- Batch 1: Founder-Market Fit, Market Sizing, Demand Signals
- Batch 2: Competitive Landscape, User Personas, Feature-Market Fit
- Batch 3: SWOT, Go-to-Market, Monetisation
- Batch 4: Pricing Sensitivity, Risk Register, Competitive Moat
- Batch 5: Tech Stack, Open-Source Viability, Operational Audit
- Batch 6: Hiring Roadmap, Ecosystem Strategy, Unit Economics
- Batch 7: Localization Fit, Accessibility, Compliance Risk
- Batch 8: Sustainability/ESG, Fundraising Readiness
- Batch 9: Strategic Exit

**If a module returns invalid JSON:**
1. **Retry 1** — Send a repair prompt with the broken JSON and the schema
2. **Retry 2** — Send the original prompt again with "RETRY: Strict mode"
3. **Retry 3** — If still broken, mark the module as failed and continue

### Step 6: Generate the HTML Dashboard

1. Read `template.html`
2. Replace every scalar placeholder using the placeholder reference map (see below)
3. Write each JS data array placeholder as a JSON array
4. Determine the output path using versioned naming:
   - Extract project name from `executive.title`, sanitize (lowercase, replace spaces/special chars with hyphens)
   - Create `reports/` directory if it doesn't exist
   - Base path: `reports/<project-name>.html`
   - If file exists, append `-v1`, `-v2`, etc. (lowest available version)
5. Save the completed HTML to that path

**Scalar placeholders (replace directly):**
| Placeholder | Source |
|---|---|
| `{{REPORT_TITLE}}` | executive.title |
| `{{REPORT_TAGLINE}}` | executive.tagline |
| `{{REPORT_VERDICT}}` | executive.verdict |
| `{{REPORT_SCORE}}` | executive.overallScore |
| `{{REPORT_INDUSTRY}}` | meta.industry |
| `{{REPORT_GEOGRAPHY}}` | meta.geography |
| `{{REPORT_DATE}}` | current date (MMM DD, YYYY) |
| `{{REPORT_SUCCESSFUL}}` | count of completed modules |
| `{{EXECUTIVE_SUMMARY}}` | executive.summary |
| `{{MARKET_KEY_TREND}}` | market.keyTrend |
| `{{COMPETITOR_WHITESPACE}}` | competitors.whiteSpace |
| `{{FEATURE_MVP_SCORE}}` | features.mvpScore |
| `{{FEATURE_FIT}}` | features.overallFit |
| `{{MOAT_DEFENSIBILITY}}` | moat.defensibility |
| `{{MOAT_OVERALL}}` | moat.overallMoat |
| `{{TECH_COMPLEXITY}}` | tech.complexity |
| `{{TECH_BUILD_TIME}}` | tech.buildTime |
| `{{HIRING_GAP}}` | hiring.teamGap |
| `{{HIRING_STRUCTURE}}` | hiring.structure |
| `{{ECOSYSTEM_DISTRIBUTION}}` | ecosystem.distributionAdvantage |
| `{{LOCALIZATION_FIT}}` | localization.marketFit |
| `{{LOCALIZATION_ADAPTATION}}` | localization.adaptationRequired |
| `{{ACCESSIBILITY_SCORE}}` | accessibility.score |
| `{{COMPLIANCE_RISK_LEVEL}}` | compliance.riskLevel |
| `{{EXIT_ATTRACTIVENESS}}` | exit.attractiveness |
| `{{EXIT_STRATEGIC_VALUE}}` | exit.strategicValue |
| `{{EXIT_TIMELINE}}` | exit.exitTimeline |
| `{{ESG_SCORE}}` | esg.overallScore |
| `{{ESG_ENV}}` | esg.environmentalScore |
| `{{ESG_SOCIAL}}` | esg.socialScore |
| `{{ESG_GOV}}` | esg.governanceScore |
| `{{FOUNDER_SCORE}}` | founder.overallScore |
| `{{FOUNDER_GAP}}` | founder.criticalGap |
| `{{OS_SCORE}}` | openSource.viabilityScore |
| `{{OS_MODEL}}` | openSource.recommendedModel |
| `{{OS_COMMUNITY}}` | openSource.communityPotential |
| `{{PRICING_SCORE}}` | pricing.sensitivityScore |
| `{{PRICING_ELASTICITY}}` | pricing.priceElasticity |
| `{{PRICING_WTP}}` | pricing.willingnessToPay |
| `{{FUNDRAISE_SCORE}}` | fundraising.readinessScore |
| `{{FUNDRAISE_STAGE}}` | fundraising.recommendedStage |
| `{{FUNDRAISE_ASK}}` | fundraising.estimatedAsk |
| `{{FUNDRAISE_TIMELINE}}` | fundraising.timeline |

**Verdict-dependent placeholders:**
| Placeholder | Excellent | Strong | Promising | Risky | Weak |
|---|---|---|---|---|---|
| `{{VERDICT_BG}}` | `bg-green-100 border-green-300` | `bg-blue-100 border-blue-300` | `bg-amber-100 border-amber-300` | `bg-rose-100 border-rose-300` | `bg-rose-100 border-rose-300` |
| `{{VERDICT_TEXT_COLOR}}` | `#15803D` | `#1D4ED8` | `#B45309` | `#BE123C` | `#BE123C` |
| `{{VERDICT_ICON}}` | `award` | `thumbs-up` | `trending-up` | `alert-triangle` | `x-circle` |

**Build decision placeholders (based on overallScore):**
| Placeholder | score ≥ 75 | score ≥ 50 | else |
|---|---|---|---|
| `{{BUILD_ICON}}` | `check-circle` | `alert-triangle` | `x-circle` |
| `{{BUILD_ICON_BG}}` | `background:#F0FDF4;border:1px solid #BBF7D0` | `background:#FFFBEB;border:1px solid #FDE68A` | `background:#FFF1F2;border:1px solid #FECDD3` |
| `{{BUILD_ICON_COLOR}}` | `#15803D` | `#B45309` | `#BE123C` |
| `{{BUILD_TEXT_COLOR}}` | `#15803D` | `#B45309` | `#BE123C` |
| `{{BUILD_BORDER_COLOR}}` | `#15803D` | `#B45309` | `#BE123C` |
| `{{BUILD_QUESTION}}` | executive.buildDecisionQuestion or "Should this move into a focused MVP?" | "Should this be validated before build?" | "Should this be built at all?" |
| `{{BUILD_DECISION}}` | executive.buildDecision or fallback | fallback | fallback |

**Build decision fallback:**
- score ≥ 75 AND defensibility ≥ 60: "No, this does not look like a waste if you keep the MVP narrow around exception management."
- score ≥ 50: "Maybe. The idea has enough signal to test with a small set of design partners first."
- Has high risk: "Maybe. This is not an obvious waste, but {risk.name} can burn time if not addressed early."
- else: "Yes, this is likely to waste time and money if built as described right now."

**Build label fallback:**
- score ≥ 75: "Proceed with narrow scope"
- score ≥ 50: "Validate before spending"
- else: "Do not build this yet"

**JS data array placeholders (replace with JSON arrays):**
| Placeholder | Shape |
|---|---|
| `{{MODULE_DATA}}` | `[{key, label, icon, score\|null}]` |
| `{{DEMAND_DATA}}` | `[{name, strength, desc}]` |
| `{{COMPETITOR_DATA}}` | `[{name, threat, fit, pos, weakness}]` |
| `{{FEATURE_DATA}}` | `[{name, fit, priority}]` |
| `{{READINESS_DATA}}` | `[{dim, score}]` |
| `{{MARKET_FUNNEL_DATA}}` | `[{value, desc}]` (TAM, SAM, SOM) |
| `{{DEMAND_SCORE_DATA}}` | `[{label, value, score?}]` |
| `{{DEMAND_KEYWORD_DATA}}` | `[string]` |
| `{{SWOT_DATA}}` | `[{key, title, items}]` |
| `{{PERSONA_DATA}}` | `[{name, role, pain, goal, tags}]` |
| `{{GTM_DATA}}` | `[{phase, title, desc, timeline, channel}]` |
| `{{GTM_METRIC_DATA}}` | `[{label, value}]` |
| `{{MONETISATION_DATA}}` | `[{name, fit, desc}]` |
| `{{MONETISATION_METRIC_DATA}}` | `[{label, value}]` |
| `{{RISK_DATA}}` | `[{name, level, desc, mit}]` |
| `{{MOAT_DATA}}` | `[{name, desc, strength}]` |
| `{{TECH_STACK_DATA}}` | `[{layer, tech, desc}]` |
| `{{HIRING_DATA}}` | `[{title, priority, timeline}]` |
| `{{ECOSYSTEM_DATA}}` | `[{platform, desc, priority}]` |
| `{{ECON_DATA}}` | `[{label, value}]` |
| `{{LOCAL_NUANCE_DATA}}` | `[string]` |
| `{{LOCAL_COMPETITOR_DATA}}` | `[string]` |
| `{{A11Y_GAP_DATA}}` | `[string]` |
| `{{A11Y_REC_DATA}}` | `[string]` |
| `{{COMPLIANCE_FLAG_DATA}}` | `[{name, level, desc}]` |
| `{{COMPLIANCE_NEXT_DATA}}` | `[string]` |
| `{{EXIT_ACQUIRER_DATA}}` | `[string]` |
| `{{OPS_METRIC_DATA}}` | `[{label, value}]` |
| `{{OPS_HURDLE_DATA}}` | `[{name, impact, desc}]` |
| `{{ESG_FLAG_DATA}}` | `[{name, severity, desc}]` |
| `{{ESG_REC_DATA}}` | `[string]` |
| `{{FOUNDER_DIM_DATA}}` | `[{dim, score}]` |
| `{{OS_RISK_DATA}}` | `[string]` |
| `{{PRICING_TIER_DATA}}` | `[{name, pricePoint, targetSegment}]` |
| `{{FUNDRAISE_STRENGTH_DATA}}` | `[string]` |
| `{{FUNDRAISE_GAP_DATA}}` | `[string]` |

**Score color mapping** (used by helper in template):
- ≥ 75 → `#15803D`
- ≥ 50 → `#B45309`
- ≥ 25 → `#C2410C`
- else → `#DC2626`
- null → `#CBC8BF`

### Step 7: Generate Strategic Suggestions

After all modules complete, build 3-6 suggestions by inspecting the data:

| Condition | Suggestion |
|---|---|
| GTM has primaryChannel | "Lead with {channel}" — High priority |
| Competitors have whiteSpace | "Exploit the clearest white space" — High |
| Core features exist | "Keep the MVP ruthlessly narrow" — High |
| Strong moat exists | "Turn {moat.type} into a real moat" — Medium |
| Monetisation recommended | "Anchor pricing around {model}" — Medium |
| High risk exists | "Neutralise {risk.name}" — High |
| Demand keywords exist | "Build acquisition around live demand language" — Low |
| Ops complexity > 75 | "Address operational complexity early" — Medium |
| Compliance risk is High | "Prioritise regulatory guardrails" — High |
| Unit economics < 60 | "Refine the unit economics model" — Medium |

Sort by priority (High > Medium > Low), take top 6.

### Step 8: Present the Summary

Display a clean terminal summary:

```
╔══════════════════════════════════════════════════╗
║  PRD INTELLIGENCE REPORT                         ║
╠══════════════════════════════════════════════════╣
║  Title:    {title}                               ║
║  Verdict:  {verdict}   Score: {score}/100        ║
║  Build:    {buildDecisionLabel}                  ║
╚══════════════════════════════════════════════════╝

{buildDecision}

-- Executive Summary --
{summary}

-- Market --
TAM: {value} | SAM: {value} | SOM: {value}
CAGR: {value} | Maturity: {value}

-- Competitive Landscape --
{top_competitors}

-- SWOT Highlights --
{top_swot_items}

-- Risks --
{top_risks}

-- Strategic Suggestions --
1. {suggestion}
2. {suggestion}
3. {suggestion}

-- Modules: {successful}/{total} completed --
Failed modules: {failed_modules_list}

-- Dashboard --
HTML report written to: reports/{project-name}.html
```

Tell the user the file is ready and where it was saved.

---

## Module Icons & Labels

| Module | Key | Icon | Label |
|---|---|---|---|---|
| Executive Summary | executive | file-text | Exec |
| Founder-Market Fit | founder | user-check | Founder |
| Market Sizing | market | trending-up | Market |
| Demand Signals | demand | activity | Demand |
| Competitive Landscape | competitors | crosshair | Rivals |
| User Personas | personas | users | Users |
| Feature-Market Fit | features | layers | MVP |
| SWOT | swot | layout-grid | SWOT |
| Go-to-Market | gtm | rocket | GTM |
| Monetisation | monetisation | dollar-sign | Revenue |
| Pricing Sensitivity | pricing | tag | Pricing |
| Risk Register | risks | shield-alert | Risks |
| Competitive Moat | moat | shield | Moat |
| Tech Stack | tech | cpu | Tech |
| Open-Source Viability | openSource | github | OSS |
| Operational Audit | ops | settings-2 | Ops |
| Hiring Roadmap | hiring | briefcase | Hiring |
| Ecosystem Strategy | ecosystem | git-branch | Eco |
| Unit Economics | economics | bar-chart-3 | Econ |
| Localization Fit | localization | globe | Local |
| Accessibility | accessibility | accessibility | A11y |
| Compliance Risk | compliance | scale | Comply |
| Sustainability / ESG | esg | leaf | ESG |
| Fundraising Readiness | fundraising | banknote | Fundraise |
| Strategic Exit | exit | target | Exit |

---

## Early Stop / Warning Banners

**Insufficient context banner** (when stopped at Step 4A):
```
<div style="background:var(--rose-light);border:1px solid var(--rose-mid);border-radius:10px;padding:18px 20px;display:flex;align-items:flex-start;gap:14px;">
  <i data-lucide="octagon-alert" style="width:20px;height:20px;color:var(--rose);flex-shrink:0;margin-top:1px;"></i>
  <div>
    <h3 style="font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--rose);margin-bottom:3px;">Analysis stopped: insufficient context</h3>
    <p style="font-size:13px;color:var(--ink2);line-height:1.6;">${insufficientReason}</p>
  </div>
</div>
```

**Weak viability stop banner** (when stopped at Step 4B):
```
<div style="background:var(--rose-light);border:1px solid var(--rose-mid);border-radius:10px;padding:18px 20px;display:flex;align-items:flex-start;gap:14px;">
  <i data-lucide="octagon-alert" style="width:20px;height:20px;color:var(--rose);flex-shrink:0;margin-top:1px;"></i>
  <div>
    <h3 style="font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--rose);margin-bottom:3px;">Analysis stopped: weak viability</h3>
    <p style="font-size:13px;color:var(--ink2);line-height:1.6;">${stopAnalysisReason || buildDecision}</p>
  </div>
</div>
```

**Failed modules warning** (added to dashboard when some modules errored):
```
<div style="background:var(--amber-light);border:1px solid var(--amber-mid);border-radius:10px;padding:14px 18px;display:flex;align-items:center;gap:12px;">
  <i data-lucide="alert-circle" style="width:16px;height:16px;color:var(--amber);flex-shrink:0;"></i>
  <div>
    <strong style="font-family:'Syne',sans-serif;font-size:12px;color:var(--amber);margin-right:4px;">Module warnings:</strong>
    <span style="font-size:12px;color:var(--ink2);">${failedNames} failed in this run. The dashboard below only reflects completed modules.</span>
  </div>
</div>
```
