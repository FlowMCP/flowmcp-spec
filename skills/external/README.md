# External Skills (Pointers)

This directory does NOT contain skill code — it contains **pointers** to skills that live in other FlowMCP-ecosystem repositories. The actual `SKILL.md` files live in the repo where the skill's end-artifact is deployed.

## Pointer concept

When a skill is a **cross-cutting tutorial** (uses multiple repos) but **deploys** into a specific consumer repo, the skill code belongs to the consumer repo. The FlowMCP-Spec repository keeps only a directory-level pointer here.

This ensures:

- **Discoverability** — anyone browsing `flowmcp-spec/skills/` finds all ecosystem skills, including external ones
- **Ownership** — implementation skills live with their consumer, not with the spec
- **Source-of-truth clarity** — spec-quality skills (`../spec-quality/`) verify the spec; external skills are tutorials/implementations

## When a skill is external

A skill belongs in `external/` (pointer here, code elsewhere) when:

1. **Code import from another repo** — the skill's deployment step imports library/server code from another repo (not from `flowmcp-spec`)
2. **Output is a code artifact** — the skill produces deployable code (e.g. an `agent.mjs` manifest, an Express server)
3. **End goal is deployment** — the skill ends with "run the server" / "deploy the agent", not with "understand the spec"

If a skill matches 2 of 3, it is external.

## Active pointers

### `flowmcp-create-agent` → `mcp-agent-server`

**Status:** Migration planned (follow-up memo)
**Currently at:** `flowmcp-spec/skills/external/flowmcp-create-agent/SKILL.md` (parked in `external/` pending repo migration)
**Target repo:** `mcp-agent-server` (path: `mcp-agent-server/skills/create-agent/SKILL.md`)
**Description:** Guides through a 7-step process to build and deploy a FlowMCP agent as an MCP server.

**Migration evidence (from skill review 2026-05-21):**

| Phase | Content | Repo reference |
|-------|--------|------------|
| 1-4 | Define Purpose / Find Primitives / Skills / System Prompt | abstract |
| 5 | Create `agent.mjs` | `flowmcp-spec` (format reference) |
| 6 | Test and Validate | `flowmcp-cli` |
| **7** | **Deploy as MCP Server** | **`import { AgentToolsServer } from 'mcp-agent-server'`** |

Three hard reasons:

1. **Code import from `mcp-agent-server`** — without this repo the skill cannot execute (Phase 7)
2. **Output is a code artifact** (`agents/{name}/agent.mjs` + `skills/*.mjs`), not spec content
3. **End goal is deployment** (Express server on port 4100), not abstract spec understanding

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
2. Open this README and add an entry under "Active pointers"
3. Include:
   - skill name
   - currently at: (if migrating)
   - target repo: (where it should live)
   - description
   - rationale (3 reasons matching the criteria)
4. Coordinate the actual move with the target repo's maintainers

## See also

- [`../README.md`](../README.md) — skills overview (schema / grading / spec-quality / external)
- [`../spec-quality/README.md`](../spec-quality/README.md) — spec-quality skills
- [`../../README.md`](../../README.md) — repo README with the Quality Standards section
