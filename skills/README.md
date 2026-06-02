# Skills

This directory contains Claude Code skills (Anthropic Agent-Skill format) that are part of the FlowMCP specification ecosystem.

## Skill tree

Skills are grouped into four sub-folders by purpose. All authoring skills use the
namespace `flowmcp-<domain>-<verb>` (every skill prefixed `flowmcp-`) so the
family is discoverable together. The entry point `flowmcp-schema` (under
`schema/`) explains the whole schema lifecycle and routes to the others.

```
skills/
  schema/        flowmcp-schema (index) + flowmcp-schema-create/-discover/-diagnose/-fix/-inspect/-tos
  grading/       grade-score-single, grade-score-batch (lifecycle stages 6+7)
  spec-quality/  evaluator-spec-rfc2119 (evaluates the spec itself)
  external/      flowmcp-create-agent (pointer — code deploys in mcp-agent-server)
```

| Sub-folder | Content | Example |
|------------|---------|---------|
| [`schema/`](./schema/) | Public schema-authoring skills — the full lifecycle, indexed by `flowmcp-schema` | `flowmcp-schema-create` |
| [`grading/`](./grading/) | Public grading-stage skills (LLM scoring via the island path) | `grade-score-single` |
| [`spec-quality/`](./spec-quality/) | Skills that **evaluate the spec itself** — quality checks, conformance verification | `evaluator-spec-rfc2119` |
| [`external/`](./external/) | **Pointers** to skills that live in other repos (cross-cutting tutorials, implementation skills) | `flowmcp-create-agent` → `mcp-agent-server` |

## Why split?

The FlowMCP-Spec repository owns:
- **Hard Facts** — the specification itself
- **Soft Criteria** — personas, examples, quality tooling
- **Authoring guidance** — the public skills that produce and grade schemas

Authoring skills (`schema/`, `grading/`) live here as the public reference for the
lifecycle. Quality-tooling skills (`spec-quality/`) live here because they verify
Hard Facts. Implementation tutorials (`external/`) only have their **directory
pointer** here — the actual skill code lives in the consumer repo where the
end-artifact is deployed.

Example: `flowmcp-create-agent` produces an agent that imports `AgentToolsServer` from `mcp-agent-server`. The end-artifact deploys with `mcp-agent-server` — so the skill belongs there. This repo only keeps a pointer.

## Anthropic Agent-Skill Format

All skills here follow the [Anthropic Claude Code Agent Skill convention](https://docs.claude.com/en/docs/build-with-claude/agent-skills). Each skill is a `SKILL.md` file with a frontmatter block:

```markdown
---
name: skill-name
description: >
  One-paragraph description of what this skill does and when to use it.
---

# Skill Title

Body of the skill — instructions, rule catalog, output format, usage examples.
```

Claude Code, when working in the `flowmcp-spec/` repo, auto-discovers all `SKILL.md` files under `skills/**/`. No explicit bootstrap is needed — the skills are simply found.

## Adding a new evaluator skill

1. Pick a focused, domain-specific question to answer (e.g. "does this file follow RFC2119?")
2. Define a rule catalog (codes like `RFC-001`, `RFC-002`, ...)
3. Write a `SKILL.md` in `spec-quality/{name}/SKILL.md`
4. Optionally: deterministic helper in `check.mjs` for CI use
5. Document in [`spec-quality/README.md`](./spec-quality/README.md)

## Adding a new external skill pointer

1. The actual skill code lives in another repo (not here)
2. Add an entry to [`external/README.md`](./external/README.md) with:
   - skill name
   - target repo + path
   - brief description
   - rationale why this skill lives outside

## See also

- [`spec-quality/README.md`](./spec-quality/README.md) — pattern, grading scale, severity levels
- [`external/README.md`](./external/README.md) — external skill pointers
- [`spec/v4.0.0/README.md`](../spec/v4.0.0/README.md) — specification index
- Top-level [`README.md`](../README.md) — Conventions & Quality Standards section
