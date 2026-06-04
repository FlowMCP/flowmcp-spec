---
title: "Schema Lifecycle"
description: "Every FlowMCP schema passes through a defined lifecycle from initial research to production deployment. This document defines the six stages, special rules for static schemas and migrated schemas,..."
spec_version: "4.3.0"
spec_file: "21-schema-lifecycle.md"
order: 21
section: "Specification"
normative: false
source_commit: "62b50d4"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/62b50d4/spec/v4.3.0/21-schema-lifecycle.md"
generated_at: "2026-06-04T13:49:20.413Z"
generated_from: "spec/v4.3.0/21-schema-lifecycle.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v4.3.0/21-schema-lifecycle.md."
---

> Normative language (MUST/SHOULD/MAY) follows the conventions defined in [Conformance Language](/specification/overview/#conformance-language).

---

## Overview

> **Canonical Reference.** This document (§21) is the **Recommended Way** for FlowMCP schema development. The six stages below plus the Prospect-prelude (tracked on the Kanban board, before `stage:research`) define the complete path from idea to production. All other lifecycle descriptions in the project (README files, CLAUDE.md runbooks, skill documentation) are subordinate to this document. When in doubt, §21 takes precedence.

Every FlowMCP schema passes through a defined lifecycle from initial research to production deployment. This document defines the six stages, special rules for static schemas and migrated schemas, and the policy for handling partially passing schemas.

**Prospect-prelude (pre-stage:research):** Before `stage:research`, a namespace candidate lives as a **Prospect** on the Kanban board (see Grading-Spec §26 Monitoring Track). A Prospect has been identified as interesting but not yet confirmed as reachable or feasible. It is not tracked within the six stages of this document — it is upstream of the lifecycle. The transition from Prospect to `stage:research` is the act of verifying reachability and feasibility.

---

## Lifecycle Stages

| Stage | Label | Entry Condition | Exit Condition |
|-------|-------|-----------------|----------------|
| 1 | `stage:research` | API endpoint discovered | API reachable, schema creation is feasible |
| 2 | `stage:creation` | Research complete | Schema file created in `tests/new-schemas/` |
| 3 | `stage:api-test` | Schema created | `flowmcp grading deterministic` → min. 1 PASS (see Special Rule) |
| 4 | `stage:validation` | API test passed | `flowmcp validate` → 0 errors |
| 5 | `stage:grade` | Validation passed | `namespaceAggregate` grade B or better |
| 6 | `stage:production` | `namespaceAggregate` grade B+ confirmed | Deployed to `providers/` in production catalog |

> **Two tracks.** The six stages above are the **development lifecycle** and live here. *Monitoring, issue tracking, and the grade rollup* live in the **Grading-Spec**, not here (see [Grading-Spec v3.0.0 §26 Monitoring Track](https://github.com/FlowMCP/flowmcp-spec/blob/main/grading/3.0.0/26-monitoring-track.md)). These two are no longer the same single sequential gate — see [Validate-before-grade ordering](#validate-before-grade-ordering-two-tracks).

### Stage Details

**`stage:research`** — The API has been identified as a candidate. The developer verifies that the endpoint is reachable and that the schema design is feasible (authentication model, response format, parameter structure).

**`stage:creation`** — The schema file is written and placed in `tests/new-schemas/{provider}/`. This stage covers the authoring process — defining tools, parameters, shared list references, handlers, and test cases.

**`stage:api-test`** — The schema is tested against the live API using `flowmcp grading deterministic <id>`. At least one tool must return a PASS result. See the [API-Test Special Rule](#api-test-special-rule-for-static-schemas) below for schemas with no HTTP tools.

**`stage:validation`** — The schema passes structural validation: `flowmcp validate <path>` returns 0 errors. All validation rules from `09-validation-rules.md` must be satisfied.

**`stage:grade`** — The schema receives a quality grade. The gate references the **`namespaceAggregate`** grade — the provider-level rollup — not an implied per-schema grade computed inside this lifecycle. A per-schema grade rolls up into the namespace aggregate; the aggregate is the gate (Memo 093 F3/F4). The `namespaceAggregate` grade B or better is required for production deployment. See the [Grading-Spec v3.0.0](https://github.com/FlowMCP/flowmcp-spec/blob/main/grading/3.0.0/00-overview.md) for the grading criteria. **The grade computation — including the aggregate — is owned entirely by the Grading-Spec; §21 only consumes the resulting `namespaceAggregate`.** FlowMCP delegates the grading model, the rollup, and the aggregate to that standard.

**`stage:production`** — The schema is moved from `tests/new-schemas/` to `providers/{namespace}/` in the production catalog and registered in `registry.json`.

### Validate-before-grade ordering (two tracks)

Up to v4.2.0 this lifecycle implied a single strict sequence: validation passes, *then* a grade is produced. v4.3.0 relaxes that sequencing for the **monitoring/grading track**:

- A **monitoring/grading record MAY exist in a `blocked` state for a schema that has NOT cleared `stage:validation`** (emit-on-failure — the Grading-Spec import gate emits a `blocked` node with `reason: validation-failed` instead of aborting).
- This `blocked` monitoring record does **NOT** advance the schema toward `stage:production`. The **development gate is unchanged**: validate-clean (`flowmcp validate` → 0 errors) is still required before `stage:production`.

In other words: the *development gate* (validate before production) stays; the *monitoring record* (emitted regardless of validation outcome) is the grading track's concern. §21 no longer implies these are the same single sequential gate. See [Grading-Spec v3.0.0 §22 / §23](https://github.com/FlowMCP/flowmcp-spec/blob/main/grading/3.0.0/22-workbench-island.md) for the emit-on-failure contract and the pinned `blocked` reason set.

---

## API-Test Special Rule for Static Schemas

Not all schemas make HTTP calls. A schema is considered **static** when all of its primitives are non-HTTP:

| Schema Type | Has HTTP? | API-Test Required? |
|-------------|-----------|-------------------|
| At least 1 Tool or HTTP-Resource | Yes | **Yes** — min. 1 PASS required |
| Exclusively Prompts / static Skills | No | **Auto-PASS** — stage skipped |

**Static schemas** — schemas that contain only Prompts and/or static Skills (no Tools, no HTTP-Resource) — receive an automatic PASS for `stage:api-test`. There is no live API to test against. The stage is considered complete and the schema proceeds directly to `stage:validation`.

**Note:** In practice, static schemas are rare. The primary use case is future Prompt-only schemas or documentation-only namespaces. Most schemas in the community catalog contain at least one Tool.

**Migration schemas** — schemas migrated from v3 that contain only static primitives also receive Auto-PASS. See [Migration Special Rule](#migration-special-rule).

---

## Migration Special Rule

Schemas migrated from v3.0.0 to v4.0.0 do not need to repeat the full lifecycle from scratch:

- Migrated schemas start at **`stage:api-test`** (not `stage:research`)
- The research and creation stages are considered complete by virtue of the existing v3 schema
- All subsequent stages (`stage:api-test` through `stage:production`) apply normally

This shortens the migration path: a previously passing v3 schema that has been updated to v4 syntax needs only an API test, validation pass, and grade check before it can re-enter production.

---

## Partial Schema Policy

> **Two tracks.** This policy is part of the *development lifecycle* (the six stages above). *Monitoring, issue tracking, and the grade rollup* live in the Grading-Spec — see [Grading-Spec v3.0.0 §26 Monitoring Track](https://github.com/FlowMCP/flowmcp-spec/blob/main/grading/3.0.0/26-monitoring-track.md). A removed primitive becomes a **blocker on the one grading-issue per namespace**, not a standalone GitHub issue.

### Core Rule

All failing primitives **MUST** be removed before a schema is deployed to production. A schema with failing tools, resources, or skills cannot enter `stage:production`.

**Rationale:** An LLM working with a schema assumes that every registered primitive is functional. If `getTokenPrice` is listed but always errors, the agent has no way to know — it will attempt the call, fail, and potentially produce incorrect results. Removing failing primitives eliminates silent failures at the cost of reduced coverage.

### Example: Before and After

```javascript
// BEFORE — etherscan-io/contracts.mjs with 3 tools, 1 failing
tools: {
    getContractAbi: { /* ... */ },      // PASS — keep
    getSourceCode: { /* ... */ },       // PASS — keep
    getCreationCode: { /* ... */ }      // FAIL — remove before production
}

// AFTER — ready for production
tools: {
    getContractAbi: { /* ... */ },      // PASS
    getSourceCode: { /* ... */ }        // PASS
}
// getCreationCode removed — tracked as a blocker on the namespace grading-issue
```

### Threshold

There is no percentage threshold. **Each failing primitive is evaluated individually:**

- 1 of 8 tools failing → remove the 1 failing tool, deploy the 7 passing tools
- 3 of 5 tools failing → remove 3 failing tools, deploy 2 passing tools
- All tools failing → schema does not deploy (no primitives remain)

The threshold-free policy prevents edge cases where a "60% pass rate" is considered acceptable. Either a primitive works or it does not.

### What Happens to Removed Primitives

Removed primitives are not abandoned — they are tracked for future resolution:

1. **Blocker on the namespace grading-issue** — A removed primitive becomes a `blocked` node / `blockers[]` entry under the **one grading-issue per namespace** (defined in the Grading-Spec [`26-monitoring-track.md`](https://github.com/FlowMCP/flowmcp-spec/blob/main/grading/3.0.0/26-monitoring-track.md)). No separate per-primitive GitHub issue is opened, and there is no parent-schema-issue link — the two tracks are not coupled.
2. **Backlog stage** — The removed primitive starts at `stage:research` (with the API reachability already known).
3. **Resolution path** — When the underlying issue is fixed (changed API, missing auth, updated handler), the primitive is re-added to the schema and goes through `stage:api-test` → `stage:validation` → `stage:grade`.
4. **Re-integration** — The fixed primitive is merged back into the production schema. A new grade check may be required if the primitive significantly changes the schema's scope.

### What Counts as Failing

A primitive fails the API test when:
- The HTTP response is a non-2xx status code (authentication error, rate limit, deprecated endpoint)
- The response does not match the declared `output.schema`
- The handler throws an uncaught exception
- The tool times out consistently (> 30 seconds)

A primitive passes when at least one of its test cases returns a 2xx response with a parseable body that matches the declared output shape.

## Related

- **Depends on:** [00-overview.md](/specification/overview/)
- **Related:** [20-validation-strategy.md](/specification/validation-strategy/), [22-scoring-protocol.md](/specification/scoring-protocol/), [10-tests.md](/specification/tests/), [09-validation-rules.md](/specification/validation-rules/), [15-catalog.md](/specification/catalog/)

