# External Skills (Wegweiser)

This directory does NOT contain skill code — it contains **pointers** to skills that live in other FlowMCP-ecosystem repositories. The actual `SKILL.md` files live in the repo where the skill's end-artifact is deployed.

## Wegweiser-Konzept

When a skill is a **cross-cutting tutorial** (uses multiple repos) but **deploys** into a specific consumer repo, the skill code belongs to the consumer repo. The FlowMCP-Spec repository keeps only a directory-level pointer here.

This ensures:

- **Discoverability** — anyone browsing `flowmcp-spec/skills/` finds all ecosystem skills, including external ones
- **Hoheit** — implementation skills live with their consumer, not with the spec
- **Source-of-Truth-Klarheit** — spec-quality skills (`../spec-quality/`) verify spec; external skills are tutorials/implementations

## Wann ein Skill external ist

A skill belongs in `external/` (pointer here, code elsewhere) when:

1. **Code-Import aus anderem Repo** — the skill's deployment step imports library/server code from another repo (not from `flowmcp-spec`)
2. **Output ist Code-Artefakt** — the skill produces deployable code (e.g. an `agent.mjs` manifest, an Express server)
3. **End-Ziel ist Deployment** — the skill ends with "run the server" / "deploy the agent", not with "understand the spec"

If a skill matches 2 of 3, it is external.

## Aktive Wegweiser

### `flowmcp-create-agent` → `mcp-agent-server`

**Status:** Migration planned (Folge-Memo)
**Currently at:** `flowmcp-spec/skills/flowmcp-create-agent/SKILL.md` (will be moved)
**Target repo:** `mcp-agent-server` (path: `mcp-agent-server/skills/create-agent/SKILL.md`)
**Beschreibung:** Guides through a 7-step process to build and deploy a FlowMCP agent as an MCP server.

**Belege fuer Migration (aus Skill-Read 2026-05-21):**

| Phase | Inhalt | Repo-Bezug |
|-------|--------|------------|
| 1-4 | Define Purpose / Find Primitives / Skills / System Prompt | abstrakt |
| 5 | Create `agent.mjs` | `flowmcp-spec` (Format-Referenz) |
| 6 | Test and Validate | `flowmcp-cli` |
| **7** | **Deploy as MCP Server** | **`import { AgentToolsServer } from 'mcp-agent-server'`** |

Three hard reasons:

1. **Code-Import aus `mcp-agent-server`** — without this repo the skill cannot execute (Phase 7)
2. **Output ist Code-Artefakt** (`agents/{name}/agent.mjs` + `skills/*.mjs`), not spec content
3. **End-Ziel ist Deployment** (Express server on port 4100), not abstract spec understanding

The spec-repo reference in the skill (Phase 5) is a **prerequisite** (read the spec format), not a **production target**.

### Comparison to spec-quality skills

| | `spec-quality/` | `external/` |
|--|----------------|-------------|
| Purpose | verify the spec | tutorial / implementation |
| Source-of-Truth | spec content | consumer repo |
| Output | grade + issues (JSON) | deployable code |
| Deploys here? | yes (verifies spec) | no (deploys elsewhere) |
| Code lives here? | yes | no — pointer only |

## Adding a new external pointer

1. Confirm the skill matches 2 of 3 external criteria
2. Open this README and add an entry under "Aktive Wegweiser"
3. Include:
   - skill name
   - currently at: (if migrating)
   - target repo: (where it should live)
   - description
   - rationale (3 reasons matching the criteria)
4. Coordinate the actual move with the target repo's maintainers

## Siehe auch

- [`../README.md`](../README.md) — Skills-Uebersicht (spec-quality + external)
- [`../spec-quality/README.md`](../spec-quality/README.md) — Spec-Quality-Skills
- [`../../README.md`](../../README.md) — Repo-README mit Quality-Standards-Sektion
