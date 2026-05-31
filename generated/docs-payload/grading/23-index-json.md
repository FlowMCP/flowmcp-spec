---
title: "The `index.json` Rollup"
description: "Status and grade live on the **namespace** level (and the **selection** level), not on a per-schema sidecar file. There is exactly **one `index.json` per namespace and one per selection**. It is the..."
grading_version: "2.0.0"
spec_file: "23-index-json.md"
order: 23
section: "Grading"
normative: true
source_commit: "2d44cb7"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/2d44cb7/grading/2.0.0/23-index-json.md"
generated_at: "2026-05-31T17:29:02.778Z"
generated_from: "grading/2.0.0/23-index-json.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/2.0.0/23-index-json.md."
---

| Field | Value |
|-------|-------|
| Status | Normative |
| Version | `gradingSpec/2.0.0` |
| Depends on | [`00-overview.md`](./00-overview.md), [`19-folder-layout.md`](./19-folder-layout.md) |
| Related | [`14-kanban-data-contract.md`](./14-kanban-data-contract.md) (superseded by this chapter), [`16-selection-lockfile.md`](./16-selection-lockfile.md), [`21-pre-conditions.md`](./21-pre-conditions.md), [`08-grading-model.md`](./08-grading-model.md) |
| Annex | [`index.schema.json`](./index.schema.json) — JSON-Schema 2020-12 for `index.json` |

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](./00-overview.md).

---

## 1. Purpose

Status and grade live on the **namespace** level (and the **selection** level), not on a per-schema sidecar file. There is exactly **one `index.json` per namespace and one per selection**. It is the rollup: a tree of `tool → schema → namespace` (provider flow) or `member → selection` (selection flow), where each node carries its newest grade (resolved via `resolveLatest`) and a rolled-up status.

This chapter supersedes the former Kanban phase-status contract (see [`14-kanban-data-contract.md`](./14-kanban-data-contract.md)). The two salvaged rules from that contract — the audit trail and the irreversible veto — are restated normatively in [Section 5](#5-salvaged-rules-audit-trail--irreversible-veto).

---

## 2. Two Natures: Live-Rollup and Frozen `lockSnapshot`

`index.json` has **two distinct parts** with different lifecycles. Conflating them is an error.

### 2.1 Live-Rollup (recomputed)

Everything outside `lockSnapshot` is a **live rollup**: it is **recomputed on every rebuild**. `rebuildNamespaceIndex` / `rebuildSelectionIndex` walks the folder, runs `resolveLatest` on each `_gradings/`, builds the tree, and writes the file. The live rollup is the **only overwritable artifact** in the island — it is derived and 100% reproducible from the underlying grading entries and snapshots, which are themselves never overwritten. The rebuild MUST run after every grading write.

### 2.2 Frozen `lockSnapshot` (written once, preserved)

`lockSnapshot` is **written exactly once, at grading start**, and is **preserved by every subsequent rebuild** (the rebuild MUST NOT recompute it). It is a point-in-time pin of the member set. The pre-condition gate ([`21-pre-conditions.md`](./21-pre-conditions.md)) reads **only** the frozen `lockSnapshot` — otherwise an aggregate would be computed over members whose status drifts mid-run.

`lockSnapshot` reproduces the former lockfile fields: `selectionId`, `selectionVersion`, `selectionHash`, `generatedAt`, and per member `{ schemaId, schemaVersion, schemaHash, gradingStatus, override }`.

---

## 3. Two Status Vocabularies (do not mix)

There are **two separate status vocabularies**. They MUST NOT be interchanged.

### 3.1 Node status (the 5-status enum)

Each primitive node (a tool, a schema, an about, a skill, a member) carries one of **five** status values:

| Status | Meaning |
|--------|---------|
| `pending` | Not yet graded. |
| `blocked` | Cannot be graded right now; carries a `reason` (e.g. fewer than three tests, no about, API down). Repairable. |
| `graded` | A grade exists. |
| `stable` | Fully graded **and** above threshold; ready to use. |
| `rejected` | Veto — **terminal and irreversible** (see [Section 5.2](#52-irreversible-veto--terminal-status-rejected)). |

`graded` and `stable` are **node** values.

### 3.2 Rollup status (operational vocabulary)

The top-level namespace/selection rollup summarises its nodes with a **different** vocabulary:

| Status | Meaning |
|--------|---------|
| `operational` | Rolled-up summary: the namespace/selection is usable. |
| `partial` | Some nodes graded/stable, others still `pending`/`blocked`. |
| `blocked` | Blocked at the rollup level. |
| `pending` | Nothing graded yet at the rollup level. |
| `rejected` | A veto propagated to the rollup. |

`operational` and `partial` are **rollup** values. A node is never `operational`; a rollup is never `graded`.

---

## 4. Member-Resolution-Manifest (SEL003)

For a selection, the rollup carries a **member-resolution manifest** — the heart of selection grading. For each member it records `schemaId → resolved provider artifact + grade + status`. Without this manifest the selection aggregate cannot reproduce its "M of N members PASS" verdict, because the member IDs in `selection.json` are logical and must be resolved (via `resolveLatest`) to a concrete graded provider artifact. The manifest makes that resolution explicit and auditable.

---

## 5. Salvaged Rules: Audit Trail + Irreversible Veto

### 5.1 Audit trail — never delete, newest is current

Grading entries and source snapshots MUST NOT be deleted or overwritten. A re-grading writes a **new** entry alongside the previous one. The current status of a node is always the **newest** entry (by timestamp; the rollup uses `resolveLatest`). Only the live part of `index.json` is rewritten on rebuild; the underlying entries, snapshots, and the frozen `lockSnapshot` are preserved.

### 5.2 Irreversible veto — terminal status `rejected`

A categorical veto maps to the node status `rejected`, which is **terminal**. The index derivation maps an `aggregateGrade` of `REJECTED` to status `rejected`. A `rejected` node MUST NOT be moved back to any other status by editing or deleting its entry; a veto can only be lifted by a fully new evaluation that writes a new entry, with the original veto entry preserved in the audit trail. The four closed veto triggers are defined in [`09-security-and-development.md`](./09-security-and-development.md).

---

## 6. Example `index.json` (namespace)

```json
{
  "indexVersion": 2,
  "namespace": "defillama",
  "updatedAt": "2026-05-31T12-30Z",
  "status": "partial",
  "grade": "B",
  "summary": { "schemas": 2, "tools": 12, "toolsStable": 8, "about": "graded", "skills": 0 },
  "about": {
    "status": "graded",
    "grade": "B",
    "ref": "prices/resources/about/_gradings/about-namespace--2026-05-31T11-20-00Z.json"
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
    "coins": { "status": "pending", "reason": "not yet imported" }
  },
  "blockers": [
    { "node": "schemas.coins", "reason": "selection member, not imported" }
  ]
}
```

A selection `index.json` is analogous, with a `lockSnapshot` block and a `members` resolution manifest in place of `schemas`.

---

## 7. Rebuild Contract

- `rebuildNamespaceIndex` / `rebuildSelectionIndex` produces the live rollup from the folder.
- The rebuild preserves the frozen `lockSnapshot` byte-for-byte.
- The rebuild runs after every grading write.
- The former per-namespace `summary.json` as an entry point is superseded by `index.json`; only the per-schema `summary.json` (phase-0 pretest data) remains.

---

## Cross-References

- Superseded contract: [`14-kanban-data-contract.md`](./14-kanban-data-contract.md)
- Pre-condition gate reading `lockSnapshot`: [`21-pre-conditions.md`](./21-pre-conditions.md)
- Lock snapshot fields (ex-lockfile): [`16-selection-lockfile.md`](./16-selection-lockfile.md)
- Grading model (`schemaId`, `aggregateGrade`, veto): [`08-grading-model.md`](./08-grading-model.md)
- Selection aggregate that consumes the manifest: [`24-selection-aggregate.md`](./24-selection-aggregate.md)
