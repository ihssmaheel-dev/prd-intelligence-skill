# Claude Code Integration

## Option A: CLAUDE.md

Create `CLAUDE.md` in your project root:

```markdown
# PRD Intelligence

When I type /prd followed by a PRD description, file path, or URL:
1. Read AGENTS.md from the prd-intelligence-skill directory
2. Execute the full 25-module PRD analysis workflow
3. Save the result to reports/ with versioned naming (sanitized project name, -v1/-v2 if exists)

Target audience: developers building AI-powered applications
Globs: *.md
---
Claude reads AGENTS.md, runs the analysis, and produces the report in reports/.
