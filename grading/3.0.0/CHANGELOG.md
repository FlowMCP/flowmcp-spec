# Changelog gradingSpec

## 3.0.3 — 2026-06-05 (additive — Area dependency model + Emit-Skill format)

Additive, non-breaking. Promotes the Area dependency model from reference-engine DATA
into the normative spec and pins the Emit-Skill format.

| File | Change |
|------|--------|
| `21-pre-conditions.md` | New normative **Area Dependency Model**: the readiness ladder (`imported → structural-valid → deterministic-green → stable`), the per-Area `dependsOn`/`requiredLevel`/dimension table, and the two binding gates — the **Provider-Namespace-Gate** (`namespace-*` held until every schema is `deterministic-green`, folding onto the weakest schema) and the **About-Namespace-Gate** (`stable`, per the universal pre-condition). `single-test` / `tools-aggregate-schema` are classified **both** (deterministic gate + non-deterministic description scoring). |
| `21-pre-conditions.md` | New normative **Emit-Skill Format**: `--emit-prompts` returns ONE self-contained skill text carrying the ready-stage Area prompts (real paths + inline output schema, no surviving placeholder), the Task-ID, and the `--consume-scores` return command; gated `namespace-*` Areas follow in a separate emit once the Provider-Namespace-Gate opens. |

## 3.0.2 — 2026-06-04 (corrections + additive)

Internal-consistency corrections to the deterministic grading model, plus two additive
deterministic dimensions. Non-breaking for any artefact that was already valid (the schema
`required`/type fixes only *accept* artefacts the engine actually produces and *reject*
sweep-only blobs that were never conformant).

| File | Change |
|------|--------|
| `06-determinism-and-tier.md` | New binding rule 5: **parameterless tools reach the pass bar at 1** (parameterised stay at 2, SHOULD 3). Test-Leiter rung-1 + rule-3 carve-out for parameterless. |
| `04-phases-single.md` | Description-cascade step 1 no longer sets a divergent "3 MUST"; it references the ch06 pass bar (2 / parameterless 1, SHOULD 3). Resolves the 3-vs-2 contradiction. |
| `06-determinism-and-tier.md` | New **deterministic response-size dimension**: `responseBytes`/`recordCount`/`durationMs` (metadata) and threshold-booleans `large` (> 1 MB) / `extreme` (> 10 MB, grade-effective on `single-test`). |
| `19-folder-layout.md` | New normative **addressing grammar** (`<ns>` · `<ns>/<schema>` · `<ns>/tool/<name>` · `<ns>/tool/<name>/tests/<N>`) mapped 1:1 to the layout; new **sweep-only-is-non-conformant** conformance rule (machine-falsifiable). |
| `index.schema.json` | `proofVersion` type corrected `string` → `integer` (the engine writes `1`). `required` made discriminated: `oneOf` { island `index.json` carries `indexVersion`, no `proofVersion` } / { provider-proof `grade.json` carries `proofVersion`+`generatedAt`, no `indexVersion` }. A blob with neither discriminator now fails validation (falsifiable). |

## 3.0.1 — 2026-06-04 (additive)

Additive, non-breaking. The pinned `blockedReason` enum gains **`fewer-than-two-tests`** —
the genuine "below 2 working tests" reason for the current Bar=2 minimum, which previously
collapsed onto `fewer-than-three-tests`. A consumer that switch-cased the
old set still validates; the new value only widens the closed set.

| File | Change |
|------|--------|
| `index.schema.json` | `$defs/blockedReason` enum gains `fewer-than-two-tests` (now 7 values). |
| `08-grading-model.md` | Canonical set widened to 7 values. |
| `23-index-json.md` | New `reason` row defining `fewer-than-two-tests`. |

## 3.0.0 — 2026-06-02 (v3 break, BREAKING)

`3.0.0` is the **v3 break**. It is **BREAKING**: the `grading import` contract changes from a
**hard abort** (on a `flowmcp validate` failure or a multi-namespace folder) to an
**emit-`blocked`-node-and-continue** behaviour. A consumer relying on the old fail-closed import
guarantee breaks — hence a MAJOR bump. A **new version directory `grading/3.0.0/`** is created by
copying `grading/2.0.0/` forward; the legacy `grading/2.0.0/` directory is retained **unchanged**.

**Breaking change:**

- **Import-gate flip (abort → emit-on-failure).** `22-workbench-island.md` IN-step: a validate
  failure no longer aborts; it emits a `blocked` node with `reason: "validation-failed"` and
  continues. The single-namespace expectation is retained as a normative invariant but its
  violation is now an emitted record, not an abort (a genuine namespace *disagreement* stays a hard
  error).

**New / changed chapters and annexes:**

| Item | Change |
|------|--------|
| `26-monitoring-track.md` | **NEW** — grading-monitoring track: two-track decoupling, one grading-issue per namespace, the board contract (rollup-operational column mapping + idempotency backref), and the island↔repo↔provider-proof data flow with a Mermaid diagram. |
| `00-overview.md` | Kanban "out of scope" line removed — the monitoring track + board are now **in scope**; chapter map gains `26`; v3 version story added; header bumped to `gradingSpec/3.0.0`. |
| `22-workbench-island.md` | Import-gate flip to emit-on-failure + namespace-folder fallback; non-destructive guarantees restated; OUT names the provider-proof. |
| `08-grading-model.md` | NEW **status-record vs. grading-entry** artefact class: a `blocked`/`validation-failed` node is a status record (`gradings: []`, `aggregateGrade: null`, `blocked: true` + `blockedReason`), not a grading entry, and never becomes `stable`. |
| `19-folder-layout.md` | Binding folder↔namespace invariant; unparseable-folder fallback key; rename-on-parse identity transition; provider-proof location (`providers/<ns>/grade.json` in `flowmcp-schemas-private`). |
| `06-determinism-and-tier.md` | `validation-failed` added as a documented `blocked` reason (status values unchanged). |
| `16-selection-lockfile.md` | `gradingStatus` reason vocabulary synced — `validation-failed`-as-`blocked`. |
| `23-index-json.md` | Pinned `blocked` `reason` value-set; status-record-without-grading; declares the repo-resident exported proof as the CI source; board driven by the rollup-operational vocabulary; `githubIssue` / `boardColumn` idempotency backref. |
| `14-kanban-data-contract.md` | Pointer line to `26-monitoring-track.md`; the two salvaged rules now apply to the monitoring track. |
| `index.schema.json` | `reason` constrained to the pinned `blockedReason` enum (`validation-failed`, `fewer-than-three-tests`, `no-about`, `api-down`, `all-schemas-unparseable`, `not-imported`); `githubIssue` + `boardColumn` optional props on the node and the rollup envelope; `$id` → `…/grading/3.0.0/…`. A `blocked` node still validates with only `status` (+ `reason`). |

All chapter `Version` headers in `grading/3.0.0/` read `gradingSpec/3.0.0`. The implementation
matches `repos/flowmcp-grading` (Phase 1): the closed `blockedReason` set is `[ "validation-failed" ]`
(`Grading.VALID_BLOCKED_REASONS`); the blocked record carries top-level `blocked: true` +
`blockedReason`; error codes `IMP-001`..`IMP-008`, `GRD-038`, `GRD-039` are registered; the
namespace regex is `/^[a-z][a-z0-9-]*$/`.

## 2.0.1 — 2026-06-01 — Full 6-area namespace rollup

Additive patch. The namespace `index.json` rollup now carries **all six** provider areas.
Previously only four areas (`single-test`, `tools-aggregate-schema`,
`tools-aggregate-namespace`, `about-namespace`) were rolled up; the two areas
`namespace-description` and `namespace-skills` were graded and written by the harness but
**dropped** at rollup time. They now appear in `index.json`:

- A top-level `description` node (single node, status + grade).
- A top-level `skills` subtree (`{ '<schema>.<skill>': node }`), recomputed on every rebuild.
- `summary.description` (status string) and `summary.skills` (count of graded skill entries,
  no longer hardcoded `0`).

The `index.schema.json` annex gains the `description` and `skills` top-level properties.
No breaking change: existing four-area indexes remain valid; the new fields are additive.
The `grading/2.0.0/` directory is retained — a patch bump does not create a new version
directory.

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
