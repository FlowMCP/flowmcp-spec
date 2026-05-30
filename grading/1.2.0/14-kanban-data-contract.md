# 14 — Kanban Data Contract (minimal)

| Field | Value |
|-------|-------|
| Status | Draft (minimal data contract — no implementation) |
| Version | `gradingSpec/1.1.0` |
| Depends on | [`00-overview.md`](./00-overview.md), [`08-grading-model.md`](./08-grading-model.md) |
| Related | [`04-phases-single.md`](./04-phases-single.md), [`05-phases-selection.md`](./05-phases-selection.md), [`09-security-and-development.md`](./09-security-and-development.md), [`19-folder-layout.md`](./19-folder-layout.md), [`21-pre-conditions.md`](./21-pre-conditions.md) |
| Annex | [`14-kanban-data-contract.schema.json`](./14-kanban-data-contract.schema.json) — JSON-Schema 2020-12 for the phase-status response |
| Follow-up | **Kanban v2** — implementation (GitHub Projects v2 binding, columns, workflow) lives there. |

> **Spec:** `gradingSpec/1.1.0`
> **Status:** stable (additive extension of 1.0.0)
> **Changes vs. 1.0.0:** see [`CHANGELOG.md`](./CHANGELOG.md) — §14 extended with the single-vs-selection lane separation.

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](./00-overview.md). This chapter defines the **data contract only**. Implementation is out of scope.

---

## 1. Scope Boundary (Normative)

This chapter contains **NO** Kanban implementation promise. What it guarantees is only the **data side**: a unique Card-ID candidate, a queryable phase status, a trigger for the Veto column, a filter for the tier. Column layouts, GitHub Projects v2 binding, veto workflow, UI hints, and sync strategies are **not** part of this chapter.

The implementation of the Kanban binding — including the GitHub Projects v2 API binding, columns per phase, card movements, UI hints, and sync strategy — belongs normatively to the **follow-up "Kanban v2" specification** (see [Section 10](#10-follow-up-kanban-v2)). This chapter describes solely **what data is available** against which a later Kanban consumer can work.

Implementation promises are explicitly **excluded** here. Reiterated: implementation = follow-up specification. Implementation = not here.

---

## 2. Card-ID

| Property | Value |
|----------|-------|
| Source | Top-level field `schemaId` from [`08-grading-model.md`](./08-grading-model.md) |
| Format | `<provider>/<route-or-schema-name>` (e.g. `brightsky/bright-sky`) |
| Uniqueness | Unique across all gradings |

Every grading entry MUST carry a unique `schemaId`. This `schemaId` serves as the **Kanban Card-ID candidate**. Consumers MAY group cards on this ID and aggregate re-gradings across multiple entries into a single card.

The Card-ID is **stable** across re-gradings. A re-grading entry (with `regradingTrigger.previousGradingId`) MUST carry the same `schemaId` (= Card-ID) as the referenced predecessor entry.

---

## 3. Phase Status Contract

Every phase (`P1`–`P7`, `S1`–`S4`) MUST expose a queryable status. The enum is closed:

| Status | Condition |
|--------|-----------|
| `passed` | All required dimensions of the phase have `score=pass` OR a numeric score `>=` the phase-specific threshold. |
| `failed` | At least one required dimension has `score=fail` OR a numeric score `<` the phase-specific threshold. |
| `pending` | Phase has not yet been executed. All required dimensions have `score=n/a`. |
| `stale` | At least one required dimension has `score=stale` (aging threshold exceeded; see [`08-grading-model.md` timeline rule](./08-grading-model.md)). |

Consumers MUST interpret the status values exactly this way. `pending` is **not** the same as `failed`. `stale` is **not** the same as `failed` (aging leads to `stale`, not to `fail`).

If no required dimensions can be derived for a phase (e.g. for phases that run purely structurally through a `flowmcp validate` pipeline), the phase MUST be mapped onto the `passed`/`failed` phase status via the pipeline result — see the phase table in [Section 4](#4-phase-status-table-phase--dimensions).

---

## 4. Phase Status Table (Phase → Dimensions)

Normative mapping of phases to the dimensions used for status derivation. Dimension names follow the enum from [`08-grading-model.schema.json`](./08-grading-model.schema.json).

| Phase | Source | Required Dimensions |
|-------|--------|---------------------|
| `P1` | [`03-tos.md`](./03-tos.md), [`04-phases-single.md`](./04-phases-single.md) | `tosMatch`, `legalAssessment` |
| `P2` | [`02-eligibility.md`](./02-eligibility.md) | `apiAvailability` (eligibility classification) |
| `P3` | [`04-phases-single.md`](./04-phases-single.md) | Structural validation (deterministic pipeline result; no grading-model field) |
| `P4` | [`04-phases-single.md`](./04-phases-single.md) | `apiAvailability`, `outputSchemaConformance` |
| `P5` | [`04-phases-single.md`](./04-phases-single.md) | `whenToUse`, `parameters`, `descriptionNeutrality`, `completeness` |
| `P6` | [`04-phases-single.md`](./04-phases-single.md), [`11-about-convention.md`](./11-about-convention.md) | `aboutConventionCompliance`, `namespaceSkillValidity` |
| `P7` | [`04-phases-single.md`](./04-phases-single.md) | `outputSchemaConformance` (jq pipe as a sub-dimension) |
| `S1` | [`05-phases-selection.md`](./05-phases-selection.md) | `domainConformance` (Selection definition) |
| `S2` | [`05-phases-selection.md`](./05-phases-selection.md), [`10-domain-knowledge.md`](./10-domain-knowledge.md) | `domainConformance`, `aboutConventionCompliance` |
| `S3` | [`05-phases-selection.md`](./05-phases-selection.md), [`13-skills.md`](./13-skills.md) | `selectionSkillL1`, `selectionSkillL2`, `selectionSkillL3` |
| `S4` | [`05-phases-selection.md`](./05-phases-selection.md), [`12-personas-contract.md`](./12-personas-contract.md) | `personaUseCaseFit` |

The table is the normative mapping contract for the phase-status resolver. Consumers MUST respect this mapping.

---

## 5. Column Triggers (Data-Side View)

Which data condition allows which column? The following table is **purely data-side** and contains **no** UI prescriptions.

| Column ID | Condition (data-side) |
|-----------|------------------------|
| `Rejected` | `categoricalVeto != null` |
| `Group-Bound` | `gradingTier == "group-bound"` |
| `Autonomous` | `gradingTier == "autonomous"` (default tier) |
| Phase-specific columns per `P1`–`P7`, `S1`–`S4` | Phase status per [Section 4](#4-phase-status-table-phase--dimensions) |

Column names, order, colours, visibility, sort order, and conflict resolution are **not** part of this chapter — see [Section 10](#10-follow-up-kanban-v2). A consumer MUST be able to derive from the trigger conditions defined above which data class a card falls into.

---

## 6. Veto Column (Required)

`categoricalVeto != null` MUST allow a dedicated "Rejected" column. The trigger list is **closed** and identical to [`08-grading-model.md`](./08-grading-model.md) and [`09-security-and-development.md`](./09-security-and-development.md):

| Trigger | Source |
|---------|--------|
| `malicious-module` | [`09-security-and-development.md`](./09-security-and-development.md) |
| `api-key-domain-mismatch` | [`09-security-and-development.md`](./09-security-and-development.md) |
| `illegal-content` | [`03-tos.md`](./03-tos.md), [`09-security-and-development.md`](./09-security-and-development.md) |
| `ai-security-veto` | [`09-security-and-development.md`](./09-security-and-development.md) |

On the data-model side, the following MUST hold: a card in the "Rejected" column **CANNOT** be moved back into other columns. The data side enforces this by never editing or deleting veto entries. A re-evaluation produces a **new** grading entry with the same `schemaId` (= Card-ID). When displaying a card, consumers MUST always use the most recent entry (see [Section 8](#8-re-grading-contract)).

---

## 7. Tier Filter (Required)

`gradingTier=group-bound` SHOULD be exported as a queryable filter via the query interface (see [Section 9](#9-query-interface-data-contract)). Consumers MAY use this to display Selection-level cards separately from autonomous Single-Schema cards.

The default tier of a new grading entry is `autonomous`. `group-bound` entries MUST additionally carry a `selectionId` (see [`08-grading-model.md` Section 3](./08-grading-model.md)).

---

## 8. Re-Grading Contract

A new grading entry with `regradingTrigger.previousGradingId` MUST carry the same `schemaId` (= Card-ID) as the referenced predecessor entry. Consumers therefore potentially see **multiple** entries per card.

| Rule | Meaning |
|------|---------|
| Card-ID stable | `schemaId` is identical across all re-gradings of a card. |
| Latest entry = current status | Consumers MUST interpret the entry with the greatest `timestamp` as "current". |
| Do NOT delete the old entry | The referenced `previousGradingId` entry remains in the dataset. Audit trail. |
| Veto entries are also re-gradable | A new entry MAY lift the veto, but only through a fully new evaluation — not by editing the old entry. |

---

## 9. Query Interface (Data-Contract)

The following minimal, persistence-independent query surface describes **which** operations a later Kanban consumer MAY work against. This contract is **purely descriptive**; this chapter does **NOT** implement it. The pilot gradings use it for smoke tests against the data format.

| Operation | Signature (verbal) | Return |
|-----------|--------------------|--------|
| `listGradings` | `({ tier?, vetoOnly?, phase?, since? })` | Array of all grading entries, filtered by tier, veto status, phase, minimum timestamp. |
| `getCard` | `(schemaId)` | Array of all entries for a card, sorted by `timestamp` (most recent first). |
| `getPhaseStatus` | `(schemaId, phaseId)` | Object with `{ phaseId, status, dimensionsConsidered[], stalestDimensionAge? }`. Conformant to [`14-kanban-data-contract.schema.json`](./14-kanban-data-contract.schema.json). |

This contract is the **only** interface this chapter exports for Kanban consumers. Persistence format (files / DB / GraphQL / REST), transport (local / remote), authentication, and synchronisation are out of scope.

---

## 10. Follow-up: Kanban v2

The following table binds the implementation to a dedicated follow-up specification.

| Follow-up | Content | Rationale for Deferral |
|-----------|---------|-------------------------|
| **Kanban v2** | GitHub Projects v2 binding with columns per phase, veto column, tier filter | Out of scope for this chapter. The legacy Kanban is old; migration and rebuild require their own specification. |

Contents of the follow-up specification (normative, not in this chapter):

- GitHub Projects v2 API binding
- Column layout per phase and tier
- Veto column workflow (resubmission, escalation)
- Tier filter implementation
- Sync strategy between the grading data model and Project items
- Migration of the legacy Kanban (decision belongs in the follow-up specification itself)

---

## 14.X Single-vs-Selection Lane Separation (NEW in 1.1.0)

Kanban lanes for Single-Gradings and Selection-Gradings are **structurally
separated** — no shared lane, no shared backlog. Rationale:

- Single-Gradings test a single schema against 17 dimensions (P1-P7)
- Selection-Gradings test N schemas against 4 dimensions (S1-S4) plus L1/L2/L3
- Dependency direction: a Selection cannot start before all Single-Gradings of
  its member schemas are stable (pre-condition, see [`21-pre-conditions.md`](./21-pre-conditions.md) §20)

Consequence: two lane families:

| Lane | Content | Data source |
|------|---------|-------------|
| `single/<namespace>--<tool>` | Single-Gradings | `single/<ns>--<tool>/gradings/` |
| `selection/<selectionId>` | Selection-Gradings | `selection/<id>/gradings/` |

Cross-Refs:

- Folder layout (`single/` vs `selection/`) → see [`19-folder-layout.md`](./19-folder-layout.md) §17
- Pre-conditions (Selection blocked until all members stable) → see [`21-pre-conditions.md`](./21-pre-conditions.md) §20
- Phase status per lane → see [`19-folder-layout.md`](./19-folder-layout.md) §17.3 (`phase-status/single/` vs `phase-status/selection/`)

The `laneType` property in the phase-status schema ([`14-kanban-data-contract.schema.json`](./14-kanban-data-contract.schema.json)) carries the lane type as the enum `["single", "selection"]`; the `laneId` matches a different pattern depending on `laneType` (`^single/...--...$` vs `^selection/...$`).

---

## Cross-References

- Grading model: [`08-grading-model.md`](./08-grading-model.md) (top-level fields `schemaId`, `categoricalVeto`, `gradingTier`, `regradingTrigger`)
- Phase model: [`04-phases-single.md`](./04-phases-single.md) (P1–P7), [`05-phases-selection.md`](./05-phases-selection.md) (S1–S4)
