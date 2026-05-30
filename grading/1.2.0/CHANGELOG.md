# Changelog gradingSpec

## 1.2.0 — 2026-05-30 (additive)

Additive extension of 1.1.0. No breaking changes; existing 1.1.0 schemas and 1.1.0 gradings
remain valid.

| Spec chapter | Change |
|--------------|--------|
| `12-personas-contract.md` | NEW §7 — Technical Schema-Persona tier. The spec now recognises repository-level technical Schema-Personas (`security-reviewer`, `api-integration-engineer`, `documentation-dx-reviewer`) for autonomous Task-A schema grading (`gradingTier = autonomous`, max grade B). The existing four generalised base personas and the Lens model (§1–§6) are unchanged. Cross-Reference section renumbered §7 → §8. |
| `00-overview.md` | Version reference bumped to `gradingSpec/1.2.0`; status/changes header rephrased as additive extension of 1.1.0. |

The technical Schema-Personas are owned by `repos/flowmcp-grading/personas/`; this spec recognises
the tier and its three slugs while the persona content lives in the grading repository.

## 1.1.0 — 2026-05-29 (additive)

| Spec chapter | Change |
|--------------|--------|
| §3 Validity Rules | Empty context as a convention (reference to §18) |
| §5 Data model | New mandatory fields: schemaHash, schemaVersion, gradingId, gradingMode, aboutHash |
| §5.1 Dimensions | Selection dimensions S1-S4 separated from Single dimensions (P1-P7, 17 total) |
| §8 Tier trim | Clarification: partial grading does NOT change aggregateGrade |
| §10 NEW Versioning | Two version axes (spec + schema/selection) + bump tables |
| §11 NEW Lockfile | selection.json + selection.lock.json + namespace.json with gradingStatus |
| §12 NEW Scope | Whitelist (Tools + Shared Lists) + public-only principle |
| §14 Kanban | Single-vs-selection lane separation |
| §16 NEW Flywheel | Iteration pattern as a Mermaid diagram |
| §17 NEW Folder layout | Binding layout + source-of-truth rule |
| §18 NEW Entry prompt | Entry-point prompt + personas obligation |
| §19 NEW About-Pages | Namespace and selection About-Pages |
| §20 NEW Pre-conditions | Universal: aggregated checks require all members stable |

**JSON-Schemas:**

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
1.0.0 schemas and 1.0.0 gradings remain valid — the new mandatory fields apply
from 1.1.0 conformance onward (toolchain migration path provided separately).

## 1.0.0 — 2026-05-29 (initial release)

Initial release.
