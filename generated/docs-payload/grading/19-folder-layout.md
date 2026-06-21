---
title: "Folder Layout"
description: "The grading data set is a workbench island organised under three top-level folders — `providers/`, `selections/`, and `shared-lists/` — with one folder per primitive and a timestamp-first naming..."
grading_version: "3.0.0"
spec_file: "19-folder-layout.md"
order: 19
section: "Grading"
normative: true
source_commit: "236dbb3"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/236dbb3/grading/3.0.0/19-folder-layout.md"
generated_at: "2026-06-21T11:44:44.465Z"
generated_from: "grading/3.0.0/19-folder-layout.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/3.0.0/19-folder-layout.md."
---

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](/grading/overview/). The binding source is the FlowMCP Schemas Specification v4.3.0.

The grading data set is a workbench island organised under three top-level folders — `providers/`, `selections/`, and `shared-lists/` — with one folder per primitive and a timestamp-first naming grammar that makes the newest revision resolvable by a naive sort. Source files stay neutral (no in-source hashes), every hash binding and rollup lives in the derived, overwritable `index.json`, and content is never edited in place or deleted: a change writes a new file next to the old one. This chapter is the single source of truth for those paths; the addressing grammar, the folder↔namespace invariant, the universal `_gradings/` placement rule, and the per-schema lifecycle all build on it.

---

## Folder Layout

The binding folder layout is the single source of truth for all other spec sections: the paths in [`08-grading-model.md`](/grading/grading-model/) (grading-entry files), [`11-about-convention.md`](/grading/about-convention/) (About-Pages), and [`16-selection-lockfile.md`](/grading/selection-lockfile/) (selection files + `index.json.lockSnapshot`) all refer to it.

The island is an internal working area on which schemas and selections are iterated daily. Internally the naming is deliberately verbose (timestamp plus hash in the filename, one folder per primitive) because that is exactly what guarantees predictability, linkability, and version tracking. When the data is mirrored out to the real repositories, names are stripped down to clean spec names.

### Binding Layout

There are **three top-level folders** (plural, aligned with the source layout `…/providers/` + `…/selections/`):

```
grading-data/
├── providers/<namespace>/
│   ├── index.json                              ← rollup (derived: 5-status, lockSnapshot, member resolution, hash bindings)
│   ├── _gradings/                              ← tools-aggregate-namespace, namespace-description
│   └── <schema>/                               ← SCHEMA (namespace special case: one namespace, several schemas)
│       ├── schema/<schema>--<ts>--<hash8>.mjs      (neutral: no in-source hashes)
│       ├── summary.json                            (pretest summary)
│       ├── _gradings/                              ← tools-aggregate-schema
│       ├── resources/about/<ns>-about--<ts>--<hash8>.md + _gradings/   (about-namespace)
│       ├── skills/<skill>/<skill>--<ts>--<hash8>.mjs + _gradings/      (namespace-skills, per skill)
│       └── tools/<tool>/{ tests/test-N.json, _gradings/ (single-test) }
├── selections/<selection>/
│   ├── index.json                              ← selection rollup (analogous)
│   ├── selection/<sel>--<ts>--<hash8>.json     ← neutral definition (members[], skills[], personaIds[], whenToUse)
│   ├── _gradings/                              ← selection-aggregate
│   ├── resources/about/<sel>-about--<ts>--<hash8>.md + _gradings/   (about-selection; About = internal domain knowledge)
│   ├── skills/<skill>/<skill>--<ts>--<hash8>.mjs + _gradings/       (selection-skills, per skill)
│   ├── prompts/                                ← slot for UNIQUE prompts (import layer)
│   └── tools/                                  ← slot for UNIQUE tools (import layer)
└── shared-lists/<listname>/<listname>--<ts>--<hash8>.json
```

Three top-level folders: `providers/`, `selections/`, `shared-lists/`.

### Source-of-Truth Rule

The two important source files — the schema `.mjs` and the `selection.json` — are **neutral**: they carry only logical names and no in-source hashes or snapshot version keys. Versioning lives in the filename; **the hash bindings live in the derived `index.json`** (see [`16-selection-lockfile.md`](/grading/selection-lockfile/)).

Rationale: an in-source hash drifts the moment the file is edited, so the recorded hash no longer matches the actual content. Keeping the hash out of the source and recording it in the derived `index.json` keeps the source clean while the binding remains traceable.

`providers/` is the source of truth for schema content — no duplication. Schema files are NOT copied into `selections/`. A selection references its member schemas by logical id; the member resolution and hash binding are recorded in `index.json`. A content change creates a new file *next to* the old one — never *over* it (see [`15-versioning-axes.md`](/grading/versioning-axes/)).

`index.json` is the **only overwritable file** — it is fully derived and 100% reproducible from the source files and grading artefacts. Source schemas, selection definitions, and grading snapshots are **never** overwritten.

### Folder ↔ Namespace Invariant

The `providers/<dir>/` directory name MUST equal `main.namespace` of **every** schema it contains. This is the binding folder↔namespace invariant — previously only described loosely as "one namespace, several schemas". It is the same invariant the Schemas-Spec writes as a tested validation rule (`VAL012`, see the Schemas-Spec validation rules and Namespace Resolution sections); the grading import asserts it on the island side and the grading track consumes it. The grading module enforces it as `IMP-007` (folder↔namespace invariant violation).

#### Unparseable-folder case (fallback key)

A `providers/<folder>/` with **0 valid schemas** still produces an `index.json` — it carries a `blocked` rollup keyed by the **folder name** as the fallback namespace identifier (`reason: validation-failed` / `all-schemas-unparseable`; see the pinned set in [`23-index-json.md`](/grading/index-json/)). The fallback folder name MUST itself be a valid namespace (`/^[a-z][a-z0-9-]*$/`); a folder name that is not a valid namespace is a hard error (`IMP-006`), never silently normalised.

#### Rename-on-parse lifecycle

Once **≥1** schema in the folder parses and exposes `main.namespace`, that field is **authoritative** and the folder is renamed to match it. A rename is an **identity transition**, not a delete: the never-delete / never-overwrite framing of this chapter is extended to cover folder-identity transitions. The rename runs **exactly once** and never clobbers a differing existing target (the grading module reports `IMP-008` instead of overwriting). This is the IN-side reconciliation of a folder that was first imported under a foldername-fallback placeholder and later acquired a real declared namespace.

#### Provider-proof location

The committed, CI-visible per-namespace grade/status rollup — the **provider-proof** `providers/<ns>/grade.json` — lives **inside the provider folder** in `flowmcp-schemas-private` (Memo 093 Kap. 4, F10). It is distinct from the island-local `index.json`:

| Artefact | Location | Nature | CI-visible |
|----------|----------|--------|------------|
| `index.json` | `grading-data/providers/<ns>/` (the island) | born + rebuilt on the workbench, gitignored | no |
| `grade.json` (provider-proof) | `flowmcp-schemas-private/providers/<ns>/` (the repo) | exported, committed, per-namespace rollup | yes |

The full data flow (where each is born, where it is committed, what the board sync reads) is specified in [`26-monitoring-track.md`](/grading/monitoring-track/).

### Naming Conventions

| Artefact | Format | Explanation |
|----------|--------|-------------|
| Primitive (schema, resource, skill, selection definition) | `<name>--<YYYY-MM-DDTHH-MM-SSZ>--<hash8>.<ext>` | date before hash, so a naive `sort().at(-1)` always yields the newest version |
| Grading | `<area>[--<basePersona>--<lens>]--<ts>.json` | timestamp as the last segment, no hash, so it still sorts correctly |
| Test | `test-<n>.json` | the tool name is already in the path |
| Shared-List | `<listname>--<ts>--<hash8>.json` | same primitive naming grammar |

`<ts>` is in the format `YYYY-MM-DDTHH-MM-SSZ` (hyphens instead of colons for filesystem compatibility). `<hash8>` is the first 8 hex chars of the sha256 over the canonically serialised content (see [`15-versioning-axes.md`](/grading/versioning-axes/)). The hash appears in the filename and in `index.json` only — never inside the source.

`resolveLatest(dir, logicalName)` is the single resolver for both primitives and gradings: it filters on the prefix, sorts, and takes the last entry as the newest version. Date-before-hash is what makes this naive sort correct — with `<name>--<hash>--<ts>` the random hash would dominate the sort and an older file could be picked as the "newest".

### Addressing Grammar

A grading target is addressed by a slash-delimited **id grammar** that maps one-to-one onto the folder layout above. Tooling (the CLI grading commands) parses these ids; the grammar is normative so that addressing is portable across implementations.

| Id form | Resolves to | Layout path |
|---------|-------------|-------------|
| `<ns>` | whole namespace | `providers/<ns>/` |
| `<ns>/<schema>` | one schema | `providers/<ns>/<schema>/` |
| `<ns>/tool/<name>` | one tool | `providers/<ns>/<schema>/tools/<name>/` |
| `<ns>/tool/<name>/tests/<N>` | one single recorded test of a tool | `providers/<ns>/<schema>/tools/<name>/tests/test-<N>.json` |

`<N>` is the test index matching the `test-<N>.json` filename. An id MUST resolve to exactly one layout node; an unresolvable id is a hard error (never silently widened to a parent node). The per-test form `<ns>/tool/<name>/tests/<N>` is the finest addressing granularity and exists so that a single recorded test can be re-graded in isolation without touching its siblings, the schema, or the namespace rollup.

### Conformance: sweep-only is non-conformant

A schema folder that carries a `summary.json` (pretest data) but **no** `_gradings/` for its graded primitives is **non-conformant** — it has been *swept* (the data-pretest ran) but not *graded* (no deterministic Area entry was written). The universal `_gradings/` rule below is therefore machine-falsifiable: a conformance check MUST flag a `providers/<ns>/<schema>/` that has `summary.json` and `tools/<tool>/tests/` but lacks the corresponding `tools/<tool>/_gradings/` and `<schema>/_gradings/`. A conforming deterministic grading produces the full structure (`_gradings/` + the namespace `index.json` + the exported `grade.json`), never summary-only. The enforcing gate is specified on the consumer side (the grading `doctor` / layout conformance check).

### `shared-lists/`

```
grading-data/shared-lists/<listname>/<listname>--<ts>--<hash8>.json
```

- `<listname>` is the identifier of the list (e.g. `evmChains`, `tradingExchanges`).
- `<hash8>` is the first-8-chars sha256 of the canonically serialised list (same procedure as the schema hash, see [`15-versioning-axes.md`](/grading/versioning-axes/)).

Shared Lists are **secondary in-scope** (see [`17-scope-whitelist.md`](/grading/scope-whitelist/)). They are hashed but not graded on their own — they feed into tool gradings as a data source. Reference implementation: [`src/SharedLists.mjs`](../../src/SharedLists.mjs).

### Universal `_gradings/` Rule

Every `_gradings/` folder lives in the folder of the primitive it grades; aggregates live at the level they aggregate. There is **no** `_gradings/` at the collection level (`tools/`, `skills/`, `resources/` themselves).

| Primitive graded | `_gradings/` location |
|------------------|-----------------------|
| One tool (`single-test`) | `providers/<ns>/<schema>/tools/<tool>/_gradings/` |
| Tools collection, schema-wide (`tools-aggregate-schema`) | `providers/<ns>/<schema>/_gradings/` |
| Tools across the namespace (`tools-aggregate-namespace`) | `providers/<ns>/_gradings/` |
| Namespace metadata (`namespace-description`) | `providers/<ns>/_gradings/` |
| One namespace skill (`namespace-skills`) | `providers/<ns>/<schema>/skills/<skill>/_gradings/` |
| About resource (`about-namespace`) | `providers/<ns>/<schema>/resources/about/_gradings/` |
| About of the selection (`about-selection`) | `selections/<sel>/resources/about/_gradings/` |
| One selection skill (`selection-skills-L1/L2/L3`) | `selections/<sel>/skills/<skill>/_gradings/` |
| The selection as a whole (`selection-aggregate`) | `selections/<sel>/_gradings/` |

In `selections/`, own folders exist only for **unique** primitives (the import layer — a tool or prompt defined only in the selection). Member schemas are referenced, never copied.

### Resource Rule

A resource is **never** placed at the namespace level technically — there is no namespace object to attach it to, only schemas. The About is declared in **one** schema (`main.resources`); the detector **searches** for it namespace-wide. See [`11-about-convention.md`](/grading/about-convention/).

### Lifecycle per Schema Iteration

```
1. Initial: providers/etherscan/getContract/schema/getContract--2026-05-30T19-44-23Z--a1b2c3d4.mjs is created
2. Single-grading: providers/etherscan/getContract/tools/getContract/_gradings/single-test--<ts>.json
3. Schema fix: a new file next to the old one (new <ts> + new <hash8>); the old file remains
4. Re-grading: a new single-test grading next to the previous one
5. Rebuild: rebuildNamespaceIndex resolves the latest of everything, writes providers/etherscan/index.json
6. Selection pre-condition met (read from index.json.lockSnapshot) → selection grading enabled
```

Old source files remain referenceable for historical gradings — they are not deleted (legacy files are never deleted). The newest file is always the current one (`resolveLatest`).

## Related

- [`00-overview.md`](/grading/overview/)
- [`08-grading-model.md`](/grading/grading-model/)
- [`15-versioning-axes.md`](/grading/versioning-axes/)
- [`16-selection-lockfile.md`](/grading/selection-lockfile/)
- [`11-about-convention.md`](/grading/about-convention/)
- [`21-pre-conditions.md`](/grading/pre-conditions/)
- [`18-flywheel-loop.md`](/grading/flywheel-loop/)
- [`22-workbench-island.md`](/grading/workbench-island/)
- [`23-index-json.md`](/grading/index-json/)
- [`26-monitoring-track.md`](/grading/monitoring-track/)

