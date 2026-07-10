# 14 — Kanban Data Contract (superseded)

| Field | Value |
|-------|-------|
| Status | **Superseded** by [`23-index-json.md`](./23-index-json.md) |
| Version | `gradingSpec/1.2.0` |
| Replaced by | [`23-index-json.md`](./23-index-json.md) — the namespace/selection rollup `index.json` |
| Annex | [`14-kanban-data-contract.schema.json`](./14-kanban-data-contract.schema.json) — **deprecated** (kept as valid JSON for reference only) |

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](./00-overview.md).

---

## 1. Why this chapter is superseded

The earlier `1.1.0` Kanban data contract exposed a per-phase status response (`P1`–`P7`, `S1`–`S4`) with a `single`/`selection` lane separation. The `1.2.0` break replaces this with a single derived rollup file per namespace and per selection: **`index.json`**. The rollup carries the per-node status, the per-member resolution, the frozen lock snapshot, and the aggregate grade in one place. There is no longer a separate phase-status response surface, and the `P*`/`S*` phase identifiers are replaced by the eleven grading areas (see [`23-index-json.md`](./23-index-json.md) and the area chapters).

Consumers MUST read status from `index.json`. The phase-status response described in `1.1.0` and its annex schema are no longer normative.

---

## 2. Salvaged principles (still normative)

Two rules from the former Kanban contract survive the break and are carried forward into the `index.json` model. They are restated here for traceability and are defined normatively in [`23-index-json.md`](./23-index-json.md).

### 2.1 Audit-trail rule — never delete, newest is current

Grading entries MUST NOT be deleted or overwritten. A re-grading produces a **new** grading file alongside the previous one; the previous file is preserved as an audit trail. When determining the current status of a primitive, consumers MUST use the **newest** entry (resolved by timestamp; the rollup uses `resolveLatest`). Only the derived `index.json` is rewritten on rebuild — never the underlying grading entries or source snapshots.

### 2.2 Irreversible veto — terminal status `rejected`

A categorical veto produces the terminal node status `rejected`. This status is **irreversible**: a primitive in `rejected` MUST NOT be moved back to any other status by editing or deleting its grading entry. A veto can only be lifted by a fully new evaluation that produces a new grading entry; the original veto entry remains in the audit trail. The four closed veto triggers (`malicious-module`, `api-key-domain-mismatch`, `illegal-content`, `ai-security-veto`) are defined in [`09-security-and-development.md`](./09-security-and-development.md).

---

## Cross-References

- Rollup model that replaces this chapter: [`23-index-json.md`](./23-index-json.md)
- Workbench island that produces the data: [`22-workbench-island.md`](./22-workbench-island.md)
- Veto triggers: [`09-security-and-development.md`](./09-security-and-development.md)
