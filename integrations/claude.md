# Claude Code Integration

## Option A: CLAUDE.md

Create `CLAUDE.md` in your project root:

```markdown
# PRD Intelligence

When I type /prd followed by a PRD description, file path, or URL:
1. Read AGENTS.md from the prd-intelligence-skill directory
2. Execute the full 20-module PRD analysis workflow
3. Save the result as prd-report.html
4. Show me a summary

All prompts, schemas, and rules are in PROMPTS.md and WORKFLOW.md.
```

## Option B: Session Init

Start a Claude Code session with:

```
/init I have a PRD intelligence skill at <path>. Read its AGENTS.md so you can handle /prd commands.
```

## Usage

```
/prd We're building a platform that helps restaurants manage their inventory...
```

Claude reads AGENTS.md, runs the analysis, and produces prd-report.html.
