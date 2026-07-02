# Changelog gradingSpec

## 1.1.0 — 2026-05-29 (additive)

| Spec chapter | Change |
|--------------|--------|
| §3 Validity Rules | Empty context as a convention (reference to §18) |
| §5 Data model | New required fields: schemaHash, schemaVersion, gradingId, gradingMode, aboutHash |
| §5.1 Dimensions | Selection dimensions S1-S4 separated from Single dimensions (P1-P7, 17 total) |
| §8 Tier-Trim | Clarification: a partial grading does NOT change aggregateGrade |
| §10 NEW Versioning | Two versioning axes (Spec + Schema/Selection) + bump tables |
| §11 NEW Lockfile | selection.json + selection.lock.json + namespace.json with gradingStatus |
| §12 NEW Scope | Whitelist (Tools + Shared Lists) + public-only principle |
| §14 Kanban | Lane separation Single vs Selection |
| §16 NEW Flywheel | Iteration pattern as a Mermaid diagram |
| §17 NEW Folder layout | Binding layout + source-of-truth rule |
| §18 NEW Entry prompt | Entry-point prompt + personas requirement |
| §19 NEW About-pages | Namespace and Selection about-pages |
| §20 NEW Pre-conditions | Universal: aggregated checks require all members to be stable |

**JSON schemas:**

- `08-grading-model.schema.json` — new required fields, new dimension enums, `$defs.singleDimension` / `$defs.selectionDimension`
- `14-kanban-data-contract.schema.json` — `laneType` enum + pattern constraints
- `selection.schema.json` — NEW (§11.1)
- `selection.lock.schema.json` — NEW (§11.2, with `gradingStatus` enum)
- `namespace.schema.json` — NEW (§11.4, no `namespaceVersion` field)
- `16-selection-lockfile.schema.json` — NEW (annex index)

**New chapter files:**

- `15-versioning-axes.md` (§10)
- `16-selection-lockfile.md` (§11)
- `17-scope-whitelist.md` (§12)
- `18-flywheel-loop.md` (§16)
- `19-folder-layout.md` (§17)
- `20-entry-point-prompt.md` (§18)
- `21-pre-conditions.md` (§20)

Breaking changes: none. Migration from 1.0.0 is purely additive. Existing
1.0.0 schemas and 1.0.0 gradings remain valid — the new required fields
apply from 1.1.0 conformance onward (toolchain migration path provided by the tooling).

## 1.0.0 — 2026-05-29 (initial release)

Initial release.
