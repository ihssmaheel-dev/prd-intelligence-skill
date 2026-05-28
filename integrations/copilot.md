# GitHub Copilot Integration

## Using Copilot Instructions

Create `.github/copilot-instructions.md` in your repository:

```markdown
## /prd — PRD Intelligence Analysis

When the user types /prd, you have access to a PRD intelligence skill. The skill directory contains:

- AGENTS.md — master instruction file (read this first)
- PROMPTS.md — all 25 system prompts and JSON schemas
- WORKFLOW.md — step-by-step process
- template.html — the HTML dashboard to fill

Execute the full workflow: run Executive Summary, check stop conditions, then run remaining modules. Fill template.html and save to reports/ with versioned naming (sanitize project title, -v1/-v2 if exists).

Be brutally honest in analysis. Score harshly. Most ideas land below 70.
```

## Usage in Chat

```
@copilot /prd A mobile app that helps dog owners find nearby playdates...
```

Copilot reads the instructions and runs the analysis.
