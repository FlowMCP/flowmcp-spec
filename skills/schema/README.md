# Schema Authoring Skills

This directory holds the **public schema-authoring skills** for the FlowMCP
lifecycle. Every skill is namespaced `flowmcp-schema[-<verb>]` so the whole
family is discoverable together. The index skill `flowmcp-schema` explains the
lifecycle and routes to each stage.

## Namespace convention

`flowmcp-<domain>-<verb>` — all authoring skills share the `flowmcp-` prefix.
The schema family uses `flowmcp-schema` (index) and `flowmcp-schema-<verb>` for
each stage.

## Skills in this directory

| Skill | Lifecycle stage (§21) | Role |
|-------|-----------------------|------|
| [`flowmcp-schema`](./flowmcp-schema/SKILL.md) | — (index) | Entry point — explains the lifecycle, routes to the others |
| [`flowmcp-schema-discover`](./flowmcp-schema-discover/SKILL.md) | 1 · Research/Discovery | Find a reachable public data source, evaluate feasibility |
| [`flowmcp-schema-create`](./flowmcp-schema-create/SKILL.md) | 2 · Creation | Author the canonical v4 `.mjs` schema (single source of truth) |
| [`flowmcp-schema-diagnose`](./flowmcp-schema-diagnose/SKILL.md) | 4 · Validation | AI-enhanced diagnosis — the detector in the diagnose → fix → inspect loop |
| [`flowmcp-schema-fix`](./flowmcp-schema-fix/SKILL.md) | 8 · Improvement | Apply diagnosis fixes — the repairer (no cheat) |
| [`flowmcp-schema-inspect`](./flowmcp-schema-inspect/SKILL.md) | 8 · Improvement | Independently audit applied fixes — the inspector (fresh context) |
| [`flowmcp-schema-tos`](./flowmcp-schema-tos/SKILL.md) | 5 · ToS/robots | Terms-of-Service URL + robots.txt legal gate, sets `main.*` fields |

## Tracked gaps (Memo 097 Kap. 9.3, PRD-Skill-Gaps)

These stage skills are planned but not yet implemented:

| Skill | Stage | Interim |
|-------|-------|---------|
| `flowmcp-schema-test` | 3 · Live-Test (≥3 fixtures/tool) | use `flowmcp dev test single` directly |
| `flowmcp-schema-deploy` | 9 · Deploy/Mirror (→ `schemas/v4.0.0/` + A/B mirror) | use `mirror-from-private.mjs` |

## Distribution

These are public skills. Place them manually in your Claude Code skills path and
install them yourself — there is no auto-install command. Claude Code
auto-discovers every `SKILL.md` under `skills/**/` when working in this repo.

## See also

- `spec/v4.3.0/21-schema-lifecycle.md` — canonical lifecycle (§21)
- `spec/v4.3.0/00-overview.md` — terminology (Agent-Skill / Schema-Skill / lens)
- [`../grading/README.md`](../grading/README.md) — grading-stage skills
- [`../README.md`](../README.md) — skills directory overview
