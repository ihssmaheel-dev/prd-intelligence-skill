---
name: prd-intelligence
description: Analyze product requirement documents with a harsh VC-style rubric across 25 strategic modules and generate a standalone HTML dashboard report. Use when the user invokes `/prd`, asks for PRD viability analysis, requests investment-readiness scoring, or needs a full strategic breakdown with executable recommendations.
---

# PRD Intelligence

## Execute Command

Run this command signature:

`/prd <prd-content-or-file-path> [industry: ...] [geography: ...]`

Resolve input as follows:

1. Use inline PRD content directly when present.
2. Read the file when the argument is a local path.
3. Fetch content when the argument is a URL.
4. Default to `industry = "General"` and `geography = "Global"` when not provided.

## Load Required Files

Read these files from the current workspace before analysis:

1. `template.html`
2. `PROMPTS.md`
3. `WORKFLOW.md`

Use `AGENTS.md` as the behavior contract for stop conditions and output rules.

## Produce Analysis

Follow this sequence:

1. Read `template.html` and enumerate placeholders.
2. Run Executive Summary (Module 1 from `PROMPTS.md`).
3. Evaluate stop conditions.
4. If continuing, run Modules 2-25 in batches of 3.
5. Fill all scalar and array placeholders in `template.html`.
6. Save final output as `prd-report.html` in the working directory.
7. Print a concise terminal summary with title, verdict, score, build decision, top modules, suggestions, and file path.

## Apply Stop Conditions

Stop early and produce a partial report when either condition is true:

1. Insufficient context: fewer than 80 words and no clear problem or product signal.
2. Weak viability: overall score below 45 and verdict is `Weak`.

For early-stop paths, include a clear warning banner in the generated report.

## Enforce Output Rules

1. Return only raw JSON from each module call.
2. Use harsh calibration; do not inflate scores.
3. Estimate missing data using industry knowledge and mark estimates with `(estimated)`.
4. Replace every placeholder; do not leave any `{{...}}` token unresolved.
