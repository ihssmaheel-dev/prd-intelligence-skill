# OpenAI Codex CLI Integration

## Option A: CODEX.md (Recommended)

Create `CODEX.md` in your project root:

```markdown
# PRD Intelligence

When I type /prd, read AGENTS.md from the prd-intelligence-skill directory and execute the full 20-module PRD analysis workflow. Use PROMPTS.md for all prompts and schemas, WORKFLOW.md for the process, and template.html for the dashboard. Save the result as prd-report.html.
```

## Option B: .codex/rules/

Create `.codex/rules/prd.md`:

```markdown
/prd — Run PRD intelligence analysis. Read AGENTS.md and execute the full workflow. Save as prd-report.html.
```

## Usage

```bash
$ codex
> /prd A mobile app that connects dog owners for playdates...
```

Codex reads CODEX.md, understands the /prd command, and runs the analysis.
