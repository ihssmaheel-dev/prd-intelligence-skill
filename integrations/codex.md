# Codex Integration (Optional)

PRD Intelligence is platform-agnostic. This file documents the Codex-specific adapter only.
Use the same `/prd` workflow with any agentic coding platform by pointing it to `AGENTS.md`, `PROMPTS.md`, `WORKFLOW.md`, and `template.html`.

## Option A: CODEX.md (Recommended)

Create `CODEX.md` in your project root:

```markdown
# PRD Intelligence

When I type /prd, read AGENTS.md from the prd-intelligence-skill directory and execute the full 25-module PRD analysis workflow. Use PROMPTS.md for all prompts and schemas, WORKFLOW.md for the process, and template.html for the dashboard. Save the result in reports/ with versioned naming.
```

## Option B: .codex/rules/

Create `.codex/rules/prd.md`:

```markdown
/prd - Run PRD intelligence analysis. Read AGENTS.md and execute the full workflow. Save to reports/ with versioned naming.
```

## Option C: Install Local Skill

Copy this folder into your Codex skills directory:

- Source: `skills/prd-intelligence`
- Destination: `~/.codex/skills/prd-intelligence` (Windows: `C:\Users\<you>\.codex\skills\prd-intelligence`)

Then restart Codex and invoke:

```text
Use $prd-intelligence to analyze this PRD:
<your PRD content or file path>
```

## Usage

```bash
$ codex
> /prd A mobile app that connects dog owners for playdates...
```

Codex reads `CODEX.md` (or the skill), understands the `/prd` workflow, and runs the analysis.
Other platforms can use their own integration files under `integrations/` with the same core workflow.
