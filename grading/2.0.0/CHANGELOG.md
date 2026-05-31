# Changelog gradingSpec

## 2.0.0 — 2026-05-31 (v2 break)

`2.0.0` is the **v2 break**. The 1.0.0/1.1.0 line was a short-lived experiment; v2 reorganises
grading around eleven areas, a five-status node model, the workbench island, the derived
`index.json` rollup, and a `/goal`-driven harness. Breaking changes are permitted; legacy
1.0.0/1.1.0 gradings are treated as legacy.

> This break was developed internally under the `1.2.0` designation and is released publicly as
> `2.0.0` — a version that carries a breaking change belongs on a major bump. The `1.2.0/` folder
> is retained as a legacy snapshot.

**New chapters:**

| Spec chapter | Change |
|--------------|--------|
| `22-workbench-island.md` | NEW — the workbench island as a spec category: internally verbose names (date + hash), stripped to clean spec names on mirror-out; namespace as the outside view; the IN/OUT round-trip (`grading import` / `grading export`). |
| `23-index-json.md` | NEW — the `index.json` rollup, one per namespace and per selection. Five-status node enum (`pending`/`blocked`/`graded`/`stable`/`rejected`) plus the operational rollup vocabulary; the two natures (live-rollup recomputed each rebuild + frozen `lockSnapshot` written once at grading start); the member-resolution manifest (SEL003). Supersedes `14-kanban-data-contract.md`. |
| `24-selection-aggregate.md` | NEW — the 11th area `selection-aggregate`: output schema, template, skill triad, carried dimensions (soft `>=5` / hard `>=7` thresholds, topic coherence, `domainConformance`, `personaUseCaseFit`, group-bound tier path to Grade A, cascade-stop). Stored at `selections/<sel>/_gradings/`. |
| `25-harness-and-goal.md` | NEW — harness (`claude-code`) + `/goal`: the evaluator reads only the transcript and calls no tools, so the `[GRADING]` surfacing convention is mandatory; idempotent turns; harness-agnostic artifacts. |

**Changed chapters and annexes:**

| Spec chapter | Change |
|--------------|--------|
| `00-overview.md` | Version story rephrased to the v2 break; the workbench-island category and IN/OUT round-trip added to the overview; chapter map refreshed; interoperability/maximalism and the three-namespaces model retained. |
| `14-kanban-data-contract.md` | Rewritten to a "superseded by `index.json`" note carrying the two salvaged rules (audit trail: never delete, newest is current; irreversible veto: terminal status `rejected`). |
| `14-kanban-data-contract.schema.json` | Marked `deprecated` (kept as valid JSON for reference only). |
| `12-personas-contract.md` | §7 — Technical Schema-Persona tier (`security-reviewer`, `api-integration-engineer`, `documentation-dx-reviewer`) for autonomous schema grading. |

**New JSON-Schema:**

- `index.schema.json` — NEW (annex for `23-index-json.md`): five-status node enum, operational rollup enum, frozen `lockSnapshot`, member-resolution manifest, `additionalProperties: false` on the envelope.

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
