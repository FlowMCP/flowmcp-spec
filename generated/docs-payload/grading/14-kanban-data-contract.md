---
title: "Kanban Data Contract (superseded)"
description: "This chapter is **superseded**: the earlier Kanban data contract — a per-phase status response with a `single`/`selection` lane separation — has been replaced by a single derived rollup file per..."
grading_version: "3.0.0"
spec_file: "14-kanban-data-contract.md"
order: 14
section: "Grading"
normative: false
source_commit: "236dbb3"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/236dbb3/grading/3.0.0/14-kanban-data-contract.md"
generated_at: "2026-06-21T11:44:44.465Z"
generated_from: "grading/3.0.0/14-kanban-data-contract.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/3.0.0/14-kanban-data-contract.md."
---

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](/grading/overview/).

---

This chapter is **superseded**: the earlier Kanban data contract — a per-phase status response with a `single`/`selection` lane separation — has been replaced by a single derived rollup file per namespace and per selection, the [`index.json`](/grading/index-json/), which carries node status, member resolution, the frozen lock snapshot, and the aggregate grade in one place. Consumers MUST read status from `index.json`; the old phase-status surface and its annex schema are no longer normative. Two principles survive the break and are restated here for traceability — the never-delete audit trail and the irreversible `rejected` veto — and now also govern the grading-monitoring board defined in [`26-monitoring-track.md`](/grading/monitoring-track/).

## Why this chapter is superseded

The earlier Kanban data contract exposed a per-phase status response (`P1`–`P7`, `S1`–`S4`) with a `single`/`selection` lane separation. That surface is replaced by a single derived rollup file per namespace and per selection: **`index.json`**. The rollup carries the per-node status, the per-member resolution, the frozen lock snapshot, and the aggregate grade in one place. There is no longer a separate phase-status response surface, and the `P*`/`S*` phase identifiers are replaced by the eleven grading areas (see [`23-index-json.md`](/grading/index-json/) and the area chapters).

Consumers MUST read status from `index.json`. The earlier phase-status response and its annex schema are no longer normative.

> The grading-monitoring board returns **in scope** in [`26-monitoring-track.md`](/grading/monitoring-track/). The two salvaged rules below (audit trail; irreversible veto) remain normative and now apply to that monitoring track.

---

## Salvaged principles (still normative)

Two rules from the former Kanban contract survive the break and are carried forward into the `index.json` model. They are restated here for traceability and are defined normatively in [`23-index-json.md`](/grading/index-json/).

### Audit-trail rule — never delete, newest is current

Grading entries MUST NOT be deleted or overwritten. A re-grading produces a **new** grading file alongside the previous one; the previous file is preserved as an audit trail. When determining the current status of a primitive, consumers MUST use the **newest** entry (resolved by timestamp; the rollup uses `resolveLatest`). Only the derived `index.json` is rewritten on rebuild — never the underlying grading entries or source snapshots.

### Irreversible veto — terminal status `rejected`

A categorical veto produces the terminal node status `rejected`. This status is **irreversible**: a primitive in `rejected` MUST NOT be moved back to any other status by editing or deleting its grading entry. A veto can only be lifted by a fully new evaluation that produces a new grading entry; the original veto entry remains in the audit trail. The four closed veto triggers (`malicious-module`, `api-key-domain-mismatch`, `illegal-content`, `ai-security-veto`) are defined in [`09-security-and-development.md`](/grading/security-and-development/).

## Related

- [`14-kanban-data-contract.schema.json`](./14-kanban-data-contract.schema.json)
- [`23-index-json.md`](/grading/index-json/)
- [`22-workbench-island.md`](/grading/workbench-island/)
- [`26-monitoring-track.md`](/grading/monitoring-track/)
- [`09-security-and-development.md`](/grading/security-and-development/)

