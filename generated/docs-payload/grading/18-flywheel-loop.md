---
title: "18 — Flywheel Loop"
description: "The grading process is a **round-trip** between the source repository and the workbench:"
grading_version: "2.0.0"
spec_file: "18-flywheel-loop.md"
order: 18
section: "Grading"
normative: true
source_commit: "6152b7e"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/6152b7e/grading/2.0.0/18-flywheel-loop.md"
generated_at: "2026-05-31T16:18:50.290Z"
generated_from: "grading/2.0.0/18-flywheel-loop.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/2.0.0/18-flywheel-loop.md."
---

| Field | Value |
|-------|-------|
| Status | Normative |
| Version | `gradingSpec/2.0.0` |
| Depends on | [`00-overview.md`](./00-overview.md), [`06-determinism-and-tier.md`](./06-determinism-and-tier.md), [`08-grading-model.md`](./08-grading-model.md), [`19-folder-layout.md`](./19-folder-layout.md), [`21-pre-conditions.md`](./21-pre-conditions.md) |
| Related | [`04-phases-single.md`](./04-phases-single.md), [`05-phases-selection.md`](./05-phases-selection.md), [`11-about-convention.md`](./11-about-convention.md) |

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](./00-overview.md). The binding source is the FlowMCP Schemas Specification v4.2.0.

---

## 1. The Flywheel as an IN/OUT Round-Trip

The grading process is a **round-trip** between the source repository and the workbench:

- **IN** — a provider folder (or selection definition) is imported into the workbench, snapshotted, and normalised.
- **Grade** — the provider-side and selection-side Areas grade the imported primitives, writing `_gradings/` and rolling them up into `index.json`.
- **OUT** — the graded state, primarily the `index.json`, is exported back to the source.

The pattern is self-reinforcing: every improvement raises the aggregate quality of the selections that contain the schema, and every selection run identifies the weakest schemas in a namespace. The loop is iteration over the same artefacts; the workbench `index.json` carries the current graded state across rounds.

---

## 2. Mermaid Diagram

```mermaid
flowchart TD
    SRC[Source: providers/<ns>/*.mjs<br/>or selections/<sel>] --> IMPORT[IN: import<br/>validate + snapshot + normalise]
    IMPORT --> NS[providers/etherscan/<br/>schema files + resources/about/]
    NS --> SCHEMA[Schemas in the namespace<br/>getContract--ts--a1b2.mjs]
    SCHEMA --> SINGLE[providers/etherscan/getContract/tools/.../_gradings/<br/>single-test--ts.json]
    SINGLE --> CHECK{Grade A/B?}
    CHECK -->|no| FIX[Improve schema]
    FIX --> NEWSNAP[New snapshot:<br/>getContract--newts--e5f6.mjs]
    NEWSNAP --> SCHEMA
    CHECK -->|partial| PART[partial grading<br/>aggregate unchanged]
    PART --> CHECK
    CHECK -->|yes, full| STABLE[node status: stable]
    STABLE --> IDXN[providers/etherscan/index.json<br/>rollup + 5-status]
    IDXN --> GATE{Selection pre-condition:<br/>all members stable?<br/>index.json lockSnapshot}
    GATE -->|no| RESOLVE[Dependency resolver]
    RESOLVE --> SINGLE
    GATE -->|yes| SGRADE[selections/crypto/_gradings/<br/>selection-aggregate--ts.json<br/>+ about-selection + selection-skills]
    SGRADE --> IDXS[selections/crypto/index.json]
    NS --> ABOUT[about-namespace:<br/>resources/about/ route-exists + content]
    SCHEMA --> ABOUT
    IDXN --> OUT[OUT: export index.json to source]
    IDXS --> OUT
```

---

## 3. Reading Direction

**Reading direction:** top-down (`flowchart TD`) follows the iteration flow. The pre-condition gate and the `stable` back-reference make the flywheel effect visible: every new `stable` provider-side grade opens the door for selection-side grading, and every selection run identifies the weakest schemas in the namespace.

---

## 4. Reference Fields per Node

| Node | Reference |
|------|-----------|
| IMPORT / OUT | [`19-folder-layout.md`](./19-folder-layout.md) — the IN/OUT round-trip and folder layout |
| NS / SCHEMA | [`04-phases-single.md`](./04-phases-single.md) — provider-side Areas; [`08-grading-model.md`](./08-grading-model.md) — data model |
| SINGLE / SGRADE | [`04-phases-single.md`](./04-phases-single.md), [`05-phases-selection.md`](./05-phases-selection.md) — Area `_gradings/` placement |
| IDXN / IDXS | [`19-folder-layout.md`](./19-folder-layout.md) — the `index.json` rollup (live rollup + frozen lockSnapshot, 5-status) |
| GATE | [`21-pre-conditions.md`](./21-pre-conditions.md) — pre-conditions (only `stable` members pass) |
| STABLE / PART | [`06-determinism-and-tier.md`](./06-determinism-and-tier.md) §8 — partial vs. full and the five node statuses |
| ABOUT | [`11-about-convention.md`](./11-about-convention.md) — About as a schema Resource |

---

## 5. Self-Reinforcing Effect

The flywheel is self-reinforcing along three loops:

1. **Quality loop per schema**: SINGLE → CHECK → FIX → NEWSNAP → SCHEMA → SINGLE. Each iteration writes a new versioned snapshot (timestamp + hash in the file name); the next grading tests the improved schema variant. The hash binding lives in `index.json`, never in the source (see [`19-folder-layout.md`](./19-folder-layout.md)).
2. **Aggregation loop per selection**: SGRADE → (on member change) GATE → SGRADE. Every re-grading of a member updates the namespace `index.json`; the selection's frozen `lockSnapshot` is refreshed at the next selection-grading start.
3. **About-verification loop**: ABOUT (route-exists + content check) → on change a new About snapshot → re-check; the namespace `index.json` records the new About grade.

---

## 6. Anti-Patterns

The following patterns break the flywheel and are excluded by the spec:

- **Partial gradings without a concluding full grading**: the node status never reaches `stable`, the selection stays blocked (see [`06-determinism-and-tier.md`](./06-determinism-and-tier.md) §8.2).
- **Schema edit without a new snapshot**: a source edit MUST produce a new versioned snapshot file; editing in place breaks the latest-resolution and the hash binding (see [`19-folder-layout.md`](./19-folder-layout.md)).
- **Selection grading with non-`stable` members**: the pre-condition (see [`21-pre-conditions.md`](./21-pre-conditions.md)) blocks the selection run before any Area runs.

---

## 7. Cross-References

- Round-trip and folder layout → [`19-folder-layout.md`](./19-folder-layout.md)
- Partial vs. full and the five node statuses → [`06-determinism-and-tier.md`](./06-determinism-and-tier.md) §8
- Pre-condition → [`21-pre-conditions.md`](./21-pre-conditions.md)
- Provider-side Areas → [`04-phases-single.md`](./04-phases-single.md)
- Selection-side Areas → [`05-phases-selection.md`](./05-phases-selection.md)
