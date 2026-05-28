# Cursor Integration

## Option A: Project Rules (Recommended)

Create `.cursor/rules/prd.mdc`:

```yaml
---
description: PRD Intelligence — analyze product requirements
globs: *.md, *.txt, *.pdf
---
When the user invokes /prd, read AGENTS.md from the prd-intelligence-skill directory and execute the full PRD analysis workflow. Use PROMPTS.md for all module prompts and schemas, WORKFLOW.md for the process, and template.html for the dashboard.
```

## Option B: .cursorrules

Create `.cursorrules` in your project root:

```
You have access to a PRD Intelligence skill at <path-to>/prd-intelligence-skill/. When the user types /prd, read AGENTS.md and run the analysis workflow. All prompts are in PROMPTS.md.
```

## Usage

Once configured, just type:

```
/prd analyze this: [paste PRD or file path]
```

The agent will read AGENTS.md, execute the 25-module analysis, and save the report to `reports/` with versioned naming.
