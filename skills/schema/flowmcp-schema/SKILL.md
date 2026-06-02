---
name: flowmcp-schema
description: >
  Entry-point index for FlowMCP schema authoring. Explains the full schema
  lifecycle (research → creation → live-test → validation → ToS/robots →
  grading → improvement → deploy/mirror) and routes to the right authoring
  skill for each stage. Load this first whenever you start FlowMCP schema work
  ("create a schema", "validate a schema", "fix a schema", "grade a provider",
  "which skill do I use for X"). It points at the orchestrator skills only — not
  at internal generator building blocks (PromptBuilder, AreaScorer).
---

# FlowMCP Schema (entry point)

This is the **index skill** for FlowMCP schema authoring. It does not perform
work itself — it explains the lifecycle and routes you to the focused skill for
each stage. When a user mentions schema creation, validation, testing, ToS
research, grading, fixing, or deployment, start here, then load the matching
skill below.

> **Canonical lifecycle reference:** `spec/v4.3.0/21-schema-lifecycle.md` (§21)
> is the **Recommended Way**. Every skill below maps to one of its stages.

---

## Naming convention

All authoring skills use the namespace `flowmcp-<domain>-<verb>` and share the
`flowmcp-` prefix so they are discoverable together. This index skill is named
`flowmcp-schema`; the per-stage skills are named `flowmcp-schema-<verb>`.

---

## Lifecycle → skill map

| Stage (§21) | What it does | Skill |
|-------------|--------------|-------|
| Prospect (pre-research) | Pick the next namespace to work on (read-only) | `flowmcp-kanban` (project `.claude/skills/`) |
| 1 · Research / Discovery | Find a reachable public data source, evaluate feasibility | [`flowmcp-schema-discover`](../flowmcp-schema-discover/SKILL.md) |
| 2 · Creation | Author the canonical v4 `.mjs` schema (single source of truth) | [`flowmcp-schema-create`](../flowmcp-schema-create/SKILL.md) |
| 3 · Live-Test | Build / verify test fixtures, ≥3 working tests per tool | [`flowmcp-schema-test`](../flowmcp-schema-test/SKILL.md) |
| 4 · Validation | Structural + strict key validation + AI-enhanced diagnosis | [`flowmcp-schema-diagnose`](../flowmcp-schema-diagnose/SKILL.md) |
| 5 · ToS / robots | Terms-of-Service URL, robots.txt legal gate, sentinel | [`flowmcp-schema-tos`](../flowmcp-schema-tos/SKILL.md) |
| 6+7 · Grading | LLM grading per area (generator-prompt, one sub-agent per area) | `grade-score-single` / `grade-score-batch` (see [`../../grading/README.md`](../../grading/README.md)) |
| 8 · Improvement | Apply diagnosis fixes (no cheat) and independently inspect them | [`flowmcp-schema-fix`](../flowmcp-schema-fix/SKILL.md) / [`flowmcp-schema-inspect`](../flowmcp-schema-inspect/SKILL.md) |
| 9 · Deploy / Mirror | Move to `schemas/v4.0.0/` and mirror Grade A/B to public | [`flowmcp-schema-deploy`](../flowmcp-schema-deploy/SKILL.md) |
| 10 · Monitoring | Read the grade rollup, next-provider recommendation (read-only) | `flowmcp-kanban` (project `.claude/skills/`) |

---

## What this index does NOT route to

This entry point references the **orchestrator skills** above only. It does
**not** reference internal generator building blocks — `PromptBuilder`,
`AreaScorer`, `FleetRunner` live in `flowmcp-grading/src/` and are driven via
the CLI (`flowmcp grading run --emit-prompts` → `--consume-scores`), never as
stand-alone `SKILL.md` files.

It also does not cover **Schema-Skills** (the `export const skill` primitive,
`spec/v4.3.0/14-skills.md`) — those are a schema content primitive, not an
authoring tool. See the [glossary](../../../spec/v4.3.0/00-overview.md) for the
Agent-Skill vs Schema-Skill distinction.

---

## Recommended order

1. **Discover** a feasible source (`flowmcp-schema-discover`).
2. **Create** the v4 schema (`flowmcp-schema-create`) — this is the single
   source of truth for the v4 shape; the other skills reference it.
3. **Test** against the live API (`flowmcp-schema-test`), then
4. **Diagnose** structurally and with AI checks (`flowmcp-schema-diagnose`).
5. **Research ToS / robots** (`flowmcp-schema-tos`).
6. **Grade** the provider (`grade-score-single` / `-batch`, see `../../grading/README.md`).
7. **Improve** via the fix → inspect loop (`flowmcp-schema-fix` →
   `flowmcp-schema-inspect`) — fix and inspect run in **separate** sub-agent
   contexts (anti-cheat).
8. **Deploy / mirror** when the grade is B or better (`flowmcp-schema-deploy`).

---

## See also

- `spec/v4.3.0/21-schema-lifecycle.md` — canonical lifecycle (§21)
- `spec/v4.3.0/00-overview.md` — terminology (Agent-Skill / Schema-Skill / lens)
- [`../../README.md`](../../README.md) — skills directory overview
- [`../../grading/`](../../grading/) — grading skills
- [`../../spec-quality/`](../../spec-quality/) — spec-quality evaluator skills
