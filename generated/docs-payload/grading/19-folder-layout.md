---
title: "Folder Layout"
description: "The binding folder layout for grading data is the single source of truth for all other spec sections. The paths in `08-grading-model.md` (grading-entry files), `11-about-convention.md` (About-Pages),..."
grading_version: "2.0.0"
spec_file: "19-folder-layout.md"
order: 19
section: "Grading"
normative: true
source_commit: "b25ff5d"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/b25ff5d/grading/2.0.0/19-folder-layout.md"
generated_at: "2026-06-01T01:39:52.471Z"
generated_from: "grading/2.0.0/19-folder-layout.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/2.0.0/19-folder-layout.md."
---

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](/grading/overview/). The binding source is the FlowMCP Schemas Specification v4.2.0.

---

## Folder Layout

The binding folder layout for grading data is the single source of truth for all other spec sections. The paths in `08-grading-model.md` (grading-entry files), `11-about-convention.md` (About-Pages), and `16-selection-lockfile.md` (selection files + `index.json.lockSnapshot`) all refer to this layout.

The grading data set is a **workbench island**: an internal working area on which schemas and selections are iterated daily. Internally the naming is deliberately verbose (timestamp plus hash in the filename, one folder per primitive) because that is exactly what guarantees predictability, linkability, and version tracking. When the data is mirrored out to the real repositories, names are stripped down to clean spec names.

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

### Source-of-Truth Rule (inverted in 2.0.0)

The two important source files — the schema `.mjs` and the `selection.json` — are **neutral**: they carry only logical names and no in-source hashes or snapshot version keys. Versioning lives in the filename; **the hash bindings live in the derived `index.json`** (see [`16-selection-lockfile.md`](/grading/selection-lockfile/)).

Rationale: an in-source hash drifts the moment the file is edited, so the recorded hash no longer matches the actual content. Keeping the hash out of the source and recording it in the derived `index.json` keeps the source clean while the binding remains traceable.

`providers/` is the source of truth for schema content — no duplication. Schema files are NOT copied into `selections/`. A selection references its member schemas by logical id; the member resolution and hash binding are recorded in `index.json`. A content change creates a new file *next to* the old one — never *over* it (see [`15-versioning-axes.md`](/grading/versioning-axes/)).

`index.json` is the **only overwritable file** — it is fully derived and 100% reproducible from the source files and grading artefacts. Source schemas, selection definitions, and grading snapshots are **never** overwritten.

### Naming Conventions

| Artefact | Format | Explanation |
|----------|--------|-------------|
| Primitive (schema, resource, skill, selection definition) | `<name>--<YYYY-MM-DDTHH-MM-SSZ>--<hash8>.<ext>` | date before hash, so a naive `sort().at(-1)` always yields the newest version |
| Grading | `<area>[--<basePersona>--<lens>]--<ts>.json` | timestamp as the last segment, no hash, so it still sorts correctly |
| Test | `test-<n>.json` | the tool name is already in the path |
| Shared-List | `<listname>--<ts>--<hash8>.json` | same primitive naming grammar |

`<ts>` is in the format `YYYY-MM-DDTHH-MM-SSZ` (hyphens instead of colons for filesystem compatibility). `<hash8>` is the first 8 hex chars of the sha256 over the canonically serialised content (see [`15-versioning-axes.md`](/grading/versioning-axes/)). The hash appears in the filename and in `index.json` only — never inside the source.

`resolveLatest(dir, logicalName)` is the single resolver for both primitives and gradings: it filters on the prefix, sorts, and takes the last entry as the newest version. Date-before-hash is what makes this naive sort correct — with `<name>--<hash>--<ts>` the random hash would dominate the sort and an older file could be picked as the "newest".

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

### Removed in 2.0.0

The following v1 folders and files are **removed** and folded into `index.json`:

| Removed | Replacement |
|---------|-------------|
| `schemas/` (root) | `providers/` (plural, with per-schema sub-folders) |
| `single/` | per-tool `_gradings/` under `providers/<ns>/<schema>/tools/<tool>/` |
| `phase-status/` | `index.json` (5-status rollup per namespace/selection) |
| `projects/` | `providers/<ns>/` + `selections/<sel>/` |
| authored `namespace.json` | folded into `index.json` (see [`16-selection-lockfile.md`](/grading/selection-lockfile/)) |
| `selection.lock.json` | folded into `index.json.lockSnapshot` (see [`16-selection-lockfile.md`](/grading/selection-lockfile/)) |

### Cross-Refs

- Grading-entry top-level fields → [`08-grading-model.md`](/grading/grading-model/) (hashes live in the grading entry and `index.json`, not in the source schema)
- Version axes + canonical hash → [`15-versioning-axes.md`](/grading/versioning-axes/)
- `index.json.lockSnapshot` + selection definition → [`16-selection-lockfile.md`](/grading/selection-lockfile/)
- About-Pages (schema-level resource) → [`11-about-convention.md`](/grading/about-convention/)
- Pre-conditions (`index.json.lockSnapshot` lookup) → [`21-pre-conditions.md`](/grading/pre-conditions/)

## Related

- **Depends on:** [`00-overview.md`](/grading/overview/), [`08-grading-model.md`](/grading/grading-model/), [`15-versioning-axes.md`](/grading/versioning-axes/), [`16-selection-lockfile.md`](/grading/selection-lockfile/)
- **Related:** [`11-about-convention.md`](/grading/about-convention/), [`21-pre-conditions.md`](/grading/pre-conditions/), [`18-flywheel-loop.md`](/grading/flywheel-loop/)

