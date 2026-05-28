# Any Agentic Platform Integration (Universal)

Use this when your platform is not Codex/Cursor/Claude/Copilot, or when you want one portable setup.

## 1) Add This As A Project Rule / System Instruction

```markdown
# PRD Intelligence

When the user invokes `/prd`, execute the PRD Intelligence workflow from this repository.

Read these files first:
- AGENTS.md (behavior contract)
- PROMPTS.md (module prompts + JSON schemas)
- WORKFLOW.md (execution process)
- template.html (dashboard placeholders)

Command signature:
/prd <prd-content-or-file-path> [industry: ...] [geography: ...]

Input handling:
- If inline text is provided, use it as PRD content.
- If a local file path is provided, read the file.
- If a URL is provided, fetch the URL content.
- Defaults: industry = "General", geography = "Global".

Execution requirements:
- Run Executive Summary first, then stop checks, then remaining modules in batches.
- Return only raw JSON from each module call (no markdown/prose wrappers).
- Replace every placeholder in template.html.
- Save output to `reports/` with versioned naming (sanitize project title from exec summary, use `-v1`, `-v2` if file exists)
- Print terminal summary with title, verdict, score, build decision, top modules, suggestions, and file path.
```

## 2) Map A Slash Command

If the platform supports slash commands, map `/prd` to:

`Run the PRD Intelligence workflow from AGENTS.md for: {{input}}`

If slash commands are not supported, trigger with:

`Run /prd on this: <your PRD text or file path>`

## 3) Required Agent Permissions

Enable these capabilities:

- Read workspace files
- Write/edit workspace files
- Run shell commands
- Fetch URLs/network content

## 4) Run It

Example:

```text
/prd A B2B SaaS product that helps customer success teams detect churn risk early...
```

Expected output: `reports/{project-name}.html` (versioned if exists)

---

## Platform Notes

- Codex: use `integrations/codex.md`
- Cursor: use `integrations/cursor.md`
- Claude Code: use `integrations/claude.md`
- Copilot: use `integrations/copilot.md`
- Opencode: use `integrations/opencode.json`

For other tools (Windsurf, Roo Code, Cline, Aider, etc.), paste section 1 into their rule/system prompt config.
