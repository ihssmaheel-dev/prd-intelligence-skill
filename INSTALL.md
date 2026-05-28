# Installation

Clone or download this repo, then wire it into your platform of choice.

```
git clone <repo-url>
cd prd-intelligence-skill
```

---

## opencode

Add the agent to your project's `opencode.json`:

```json
{
  "agent": {
    "prd-intelligence": {
      "description": "Analyze PRDs across 20 strategic dimensions with HTML dashboard output",
      "mode": "subagent",
      "model": "anthropic/claude-sonnet-4-6",
      "permission": {
        "read": "allow",
        "grep": "allow",
        "glob": "allow",
        "edit": "allow",
        "bash": "allow",
        "webfetch": "allow"
      }
    }
  },
  "command": {
    "prd": {
      "template": "Read AGENTS.md and run the full PRD intelligence analysis on {{input}}."
    }
  }
}
```

Restart opencode. Run `/prd <your PRD>`.

---

## Cursor

Create `.cursorrules` in your project root:

```
Always follow the instructions in AGENTS.md when the user invokes /prd or asks for PRD analysis.
```

Then reference the repo path. Or use Cursor Rules (`.cursor/rules/prd.mdc`):

```
---
description: PRD Intelligence analysis
globs: *.md
---
Read AGENTS.md and run the full PRD intelligence workflow.
```

---

## Claude Code

Create `CLAUDE.md` in your project root:

```markdown
# PRD Intelligence

When the user runs /prd, read AGENTS.md in the prd-intelligence-skill directory
and execute the full analysis workflow.
```

Or add directly to your Claude Code session:
```
/init read AGENTS.md and set up as a /prd command
```

---

## GitHub Copilot

Add to `.github/copilot-instructions.md`:

```markdown
/prd — Run PRD intelligence analysis. Read AGENTS.md and execute the full workflow.
```

---

## OpenAI Codex CLI

Create `CODEX.md` in your project root:

```markdown
# PRD Intelligence

When I type /prd, read AGENTS.md from the prd-intelligence-skill directory
and execute the full 20-module PRD analysis workflow.
```

Alternatively, add to `.codex/rules/prd.md`.

---

## Any AI (ChatGPT, Gemini, manual)

Just paste into your chat:

```
Read AGENTS.md from the PRD Intelligence skill, then help me run /prd on the following:
[paste PRD content]
```

---

## Verifying It Works

```
/prd A product that helps remote teams track their daily standup notes and generate weekly summaries.

Expected: analysis starts with Executive Summary module, returns JSON with scores and verdict.
```
