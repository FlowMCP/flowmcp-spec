---
title: "The `index.json` Rollup"
description: "Status and grade live on the **namespace** level (and the **selection** level), not on a per-schema sidecar file. There is exactly **one `index.json` per namespace and one per selection**. It is the..."
grading_version: "3.0.0"
spec_file: "23-index-json.md"
order: 23
section: "Grading"
normative: true
source_commit: "3979b97"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/3979b97/grading/3.0.0/23-index-json.md"
generated_at: "2026-06-04T20:12:27.959Z"
generated_from: "grading/3.0.0/23-index-json.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/3.0.0/23-index-json.md."
---

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](/grading/overview/).

---

## Purpose

Status and grade live on the **namespace** level (and the **selection** level), not on a per-schema sidecar file. There is exactly **one `index.json` per namespace and one per selection**. It is the rollup: a tree of `tool → schema → namespace` (provider flow) or `member → selection` (selection flow), where each node carries its newest grade (resolved via `resolveLatest`) and a rolled-up status.

This chapter supersedes the former Kanban phase-status contract (see [`14-kanban-data-contract.md`](/grading/kanban-data-contract/)). The two salvaged rules from that contract — the audit trail and the irreversible veto — are restated normatively in [Salvaged Rules: Audit Trail + Irreversible Veto](#salvaged-rules-audit-trail--irreversible-veto).

---

## Two Natures: Live-Rollup and Frozen `lockSnapshot`

`index.json` has **two distinct parts** with different lifecycles. Conflating them is an error.

### Live-Rollup (recomputed)

Everything outside `lockSnapshot` is a **live rollup**: it is **recomputed on every rebuild**. `rebuildNamespaceIndex` / `rebuildSelectionIndex` walks the folder, runs `resolveLatest` on each `_gradings/`, builds the tree, and writes the file. The live rollup is the **only overwritable artifact** in the island — it is derived and 100% reproducible from the underlying grading entries and snapshots, which are themselves never overwritten. The rebuild MUST run after every grading write.

### Frozen `lockSnapshot` (written once, preserved)

`lockSnapshot` is **written exactly once, at grading start**, and is **preserved by every subsequent rebuild** (the rebuild MUST NOT recompute it). It is a point-in-time pin of the member set. The pre-condition gate ([`21-pre-conditions.md`](/grading/pre-conditions/)) reads **only** the frozen `lockSnapshot` — otherwise an aggregate would be computed over members whose status drifts mid-run.

`lockSnapshot` reproduces the former lockfile fields: `selectionId`, `selectionVersion`, `selectionHash`, `generatedAt`, and per member `{ schemaId, schemaVersion, schemaHash, gradingStatus, override }`.

---

## Two Status Vocabularies (do not mix)

There are **two separate status vocabularies**. They MUST NOT be interchanged.

### Node status (the 5-status enum)

Each primitive node (a tool, a schema, an about, a skill, a member) carries one of **five** status values:

| Status | Meaning |
|--------|---------|
| `pending` | Not yet graded. |
| `blocked` | Cannot be graded right now; carries a `reason` from the pinned reason set below. Repairable. |
| `graded` | A grade exists. |
| `stable` | Fully graded **and** above threshold; ready to use. |
| `rejected` | Veto — **terminal and irreversible** (see [Irreversible veto — terminal status `rejected`](#irreversible-veto--terminal-status-rejected)). |

`graded` and `stable` are **node** values.

#### Pinned `blocked` reason set

A `blocked` node MUST carry a `reason` from the following **closed set**. Free-text reasons are not permitted (the [`index.schema.json`](./index.schema.json) annex enforces the enum):

| `reason` | When |
|----------|------|
| `validation-failed` | The schema(s) failed the `grading import` validate gate (emit-on-failure, see [`22-workbench-island.md`](/grading/workbench-island/)). Matches the closed reason set in the grading module (`Grading.VALID_BLOCKED_REASONS`). |
| `fewer-than-three-tests` | The schema has fewer than three working downloadable tests. |
| `fewer-than-two-tests` | The schema has fewer than two working downloadable tests (the current Bar=2 minimum; the genuine "below 2" reason that previously collapsed onto `fewer-than-three-tests`). |
| `no-about` | No About Resource is declared / found namespace-wide. |
| `api-down` | The API is unreachable at grading time. |
| `all-schemas-unparseable` | Every `.mjs` in the folder is unparseable (the namespace folder name is the fallback key — see [`19-folder-layout.md`](/grading/folder-layout/)). |
| `not-imported` | A referenced member exists logically but was never imported. |

Adding a reason value is a `gradingSpec` bump.

#### Status record vs. grading entry

A `blocked` node MAY exist **without a conformant grading entry**. An emit-on-failure `blocked`/`validation-failed` node is a **status record** (it lives in `index.json` with only `status` + `reason`, and optionally `githubIssue` / `boardColumn`), not a graded entry — see the status-record artefact class in [`08-grading-model.md`](/grading/grading-model/). It MUST NOT be treated as a graded entry anywhere a grade is consumed.

### Rollup status (operational vocabulary)

The top-level namespace/selection rollup summarises its nodes with a **different** vocabulary:

| Status | Meaning |
|--------|---------|
| `operational` | Rolled-up summary: the namespace/selection is usable. |
| `partial` | Some nodes graded/stable, others still `pending`/`blocked`. |
| `blocked` | Blocked at the rollup level. |
| `pending` | Nothing graded yet at the rollup level. |
| `rejected` | A veto propagated to the rollup. |

`operational` and `partial` are **rollup** values. A node is never `operational`; a rollup is never `graded`.

### Which vocabulary drives the board

The grading-monitoring board columns (see [`26-monitoring-track.md`](/grading/monitoring-track/)) are driven by the **rollup operational vocabulary** (`operational` / `partial` / `blocked` / `pending` / `rejected`), **not** the node 5-status enum. The status→column mapping is specified in [`26-monitoring-track.md`](/grading/monitoring-track/).

---

## Which `index.json` CI reads (exported, repo-resident copy)

`index.json` is **born and rebuilt inside the workbench island** (`grading-data/`), which is gitignored and never CI-visible. The copy that CI and the board sync read is the **exported, repo-resident** per-namespace rollup committed into the provider folder of `flowmcp-schemas-private` (the **provider-proof** `providers/<ns>/grade.json`; see [`19-folder-layout.md`](/grading/folder-layout/) and the full data flow in [`26-monitoring-track.md`](/grading/monitoring-track/)). The island-local `index.json` is **never** CI-visible. The producer/sync detail lives in [`26-monitoring-track.md`](/grading/monitoring-track/); this chapter only pins the location rule.

## Idempotency backref: `githubIssue` / `boardColumn`

A node MAY carry two optional backref fields used by the deterministic board sync:

| Field | Type | Meaning |
|-------|------|---------|
| `githubIssue` | `string` | The number/URL of the one grading-issue already created for this namespace. |
| `boardColumn` | `string` | The board column the node currently occupies. |

The sync MUST treat a present `githubIssue` backref as idempotency proof: it MUST NOT create a second issue for the namespace — it updates the existing issue / column instead (see [`26-monitoring-track.md`](/grading/monitoring-track/)). Both fields are OPTIONAL in [`index.schema.json`](./index.schema.json).

---

## Member-Resolution-Manifest (SEL003)

For a selection, the rollup carries a **member-resolution manifest** — the heart of selection grading. For each member it records `schemaId → resolved provider artifact + grade + status`. Without this manifest the selection aggregate cannot reproduce its "M of N members PASS" verdict, because the member IDs in `selection.json` are logical and must be resolved (via `resolveLatest`) to a concrete graded provider artifact. The manifest makes that resolution explicit and auditable.

---

## Salvaged Rules: Audit Trail + Irreversible Veto

### Audit trail — never delete, newest is current

Grading entries and source snapshots MUST NOT be deleted or overwritten. A re-grading writes a **new** entry alongside the previous one. The current status of a node is always the **newest** entry (by timestamp; the rollup uses `resolveLatest`). Only the live part of `index.json` is rewritten on rebuild; the underlying entries, snapshots, and the frozen `lockSnapshot` are preserved.

### Irreversible veto — terminal status `rejected`

A categorical veto maps to the node status `rejected`, which is **terminal**. The index derivation maps an `aggregateGrade` of `REJECTED` to status `rejected`. A `rejected` node MUST NOT be moved back to any other status by editing or deleting its entry; a veto can only be lifted by a fully new evaluation that writes a new entry, with the original veto entry preserved in the audit trail. The four closed veto triggers are defined in [`09-security-and-development.md`](/grading/security-and-development/).

---

## Example `index.json` (namespace)

```json
{
  "indexVersion": 2,
  "namespace": "defillama",
  "updatedAt": "2026-05-31T12-30Z",
  "status": "partial",
  "grade": "B",
  "summary": { "schemas": 2, "tools": 12, "toolsStable": 8, "about": "graded", "description": "graded", "skills": 1 },
  "about": {
    "status": "graded",
    "grade": "B",
    "ref": "prices/resources/about/_gradings/about-namespace--2026-05-31T11-20-00Z.json"
  },
  "description": {
    "status": "graded",
    "grade": "B",
    "ref": "_gradings/namespace-description--2026-05-31T11-21-00Z.json"
  },
  "skills": {
    "prices.summarizePrices": {
      "status": "graded",
      "grade": "B",
      "ref": "prices/skills/summarizePrices/_gradings/namespace-skills--2026-05-31T11-23-00Z.json"
    }
  },
  "namespaceAggregate": {
    "status": "graded",
    "grade": "B",
    "ref": "_gradings/tools-aggregate-namespace--2026-05-31T11-22-00Z.json"
  },
  "schemas": {
    "prices": {
      "status": "graded",
      "grade": "B",
      "snapshot": { "file": "prices--2026-05-30T19-44-23Z--93baef35.mjs", "hash": "93baef35" },
      "toolsAggregate": { "status": "graded", "grade": "B", "boundTo": "93baef35" },
      "tools": {
        "getFirstPrice": {
          "status": "stable",
          "grade": "A",
          "ref": "prices/tools/getFirstPrice/_gradings/single-test--2026-05-31T11-05-00Z.json"
        }
      }
    },
    "coins": { "status": "blocked", "reason": "not-imported" }
  },
  "blockers": [
    { "node": "schemas.coins", "reason": "not-imported" }
  ]
}
```

A selection `index.json` is analogous, with a `lockSnapshot` block and a `members` resolution manifest in place of `schemas`.

### Example — emit-on-failure status record (namespace-level)

When every schema in a folder fails the import validate gate, the namespace rollup carries a `blocked` status record with `reason: validation-failed` and no grading entry. The optional backref fields appear once the deterministic sync has created the namespace grading-issue:

```json
{
  "indexVersion": 2,
  "namespace": "example-broken",
  "updatedAt": "2026-06-02T09-00-00Z",
  "status": "blocked",
  "reason": "validation-failed",
  "githubIssue": "FlowMCP/flowmcp-schemas-private#1234",
  "boardColumn": "Blocked"
}
```

This record validates against [`index.schema.json`](./index.schema.json) with only `status` (+ `reason`); see the status-record artefact class in [`08-grading-model.md`](/grading/grading-model/).

---

## Rebuild Contract

- `rebuildNamespaceIndex` / `rebuildSelectionIndex` produces the live rollup from the folder.
- The rebuild preserves the frozen `lockSnapshot` byte-for-byte.
- The rebuild runs after every grading write.
- The former per-namespace `summary.json` as an entry point is superseded by `index.json`; only the per-schema `summary.json` (phase-0 pretest data) remains.

---

## Cross-References

- Superseded contract: [`14-kanban-data-contract.md`](/grading/kanban-data-contract/)
- Pre-condition gate reading `lockSnapshot`: [`21-pre-conditions.md`](/grading/pre-conditions/)
- Lock snapshot fields (ex-lockfile): [`16-selection-lockfile.md`](/grading/selection-lockfile/)
- Grading model (`schemaId`, `aggregateGrade`, veto): [`08-grading-model.md`](/grading/grading-model/)
- Selection aggregate that consumes the manifest: [`24-selection-aggregate.md`](/grading/selection-aggregate/)

## Related

- **Depends on:** [`00-overview.md`](/grading/overview/), [`19-folder-layout.md`](/grading/folder-layout/)
- **Related:** [`14-kanban-data-contract.md`](/grading/kanban-data-contract/) (superseded by this chapter), [`16-selection-lockfile.md`](/grading/selection-lockfile/), [`21-pre-conditions.md`](/grading/pre-conditions/), [`08-grading-model.md`](/grading/grading-model/), [`26-monitoring-track.md`](/grading/monitoring-track/)
- **Annex:** [`index.schema.json`](./index.schema.json) — JSON-Schema 2020-12 for `index.json`

