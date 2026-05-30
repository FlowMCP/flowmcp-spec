# 19 — Folder Layout (§17)

| Field | Value |
|-------|-------|
| Status | Normative — NEW in 1.1.0 |
| Version | `gradingSpec/1.1.0` |
| Depends on | [`00-overview.md`](./00-overview.md), [`08-grading-model.md`](./08-grading-model.md), [`15-versioning-axes.md`](./15-versioning-axes.md), [`16-selection-lockfile.md`](./16-selection-lockfile.md) |
| Related | [`14-kanban-data-contract.md`](./14-kanban-data-contract.md), [`11-about-convention.md`](./11-about-convention.md), [`21-pre-conditions.md`](./21-pre-conditions.md), [`18-flywheel-loop.md`](./18-flywheel-loop.md) |

> **Spec:** `gradingSpec/1.1.0`
> **Status:** stable (additive extension of 1.0.0)
> **Changes vs 1.0.0:** an entirely new section §17 (binding folder layout + source-of-truth rule + naming conventions).

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](./00-overview.md). The binding source is the FlowMCP Schemas Specification v4.1.0.

---

## §17 Folder Layout

The binding folder layout for grading data is the single source of truth for all other spec sections. The paths in `08-grading-model.md` (grading-entry files), `11-about-convention.md` §19 (about-pages), `14-kanban-data-contract.md` §14 (lanes), and `16-selection-lockfile.md` §11 (selection files) all refer to this layout.

### §17.1 Binding Layout

```
grading-data/
├── schemas/
│   └── <namespace>/
│       ├── namespace.json
│       ├── about/<hash>--about.md
│       └── <schema-hash>--v<X.Y.Z>.mjs
├── shared-lists/
│   └── <listname>/<hash>--v<X.Y.Z>.json
├── single/
│   └── <namespace>--<tool>/
│       └── gradings/
│           ├── <schema-hash>--<timestamp>.json
│           └── <schema-hash>--<timestamp>--partial.json
├── selection/
│   └── <selectionId>/
│       ├── selection.json
│       ├── selection.lock.json
│       ├── about/<hash>--about.md
│       ├── skills/<skillname>.mjs        (max 4)
│       └── gradings/<selection-hash>--<timestamp>.json
└── phase-status/
    ├── single/<namespace>--<tool>.json
    └── selection/<selectionId>.json
```

Five top-level folders: `schemas/`, `shared-lists/`, `single/`, `selection/`, `phase-status/`.

### §17.2 Source-of-Truth Rule

`schemas/` is the **source of truth** — no duplication. Schema files are NOT copied into `single/` or `selection/`. Instead, the grading JSON references the entry in `schemas/<namespace>/<schemaHash>--v<X.Y.Z>.mjs` via `schemaHash` (see [`08-grading-model.md`](./08-grading-model.md) §3.1).

Consequence: a single schema can be referenced by any number of Single and Selection gradings without copying the schema. A version change (`schemaHash` changes) produces a new schema file *next to* the old one — not *over* it (see [`15-versioning-axes.md`](./15-versioning-axes.md) §10).

### §17.3 Naming Conventions

| File | Format | Explanation |
|------|--------|-------------|
| Schema source | `<schema-hash>--v<X.Y.Z>.mjs` | hash = `schemaHash`, version = `schemaVersion` |
| About | `<hash>--about.md` | hash = `aboutHash` |
| Single grading (Full) | `<schema-hash>--<timestamp>.json` | timestamp ISO-8601 |
| Single grading (Partial) | `<schema-hash>--<timestamp>--partial.json` | the `--partial` suffix makes the mode visible |
| Selection grading | `<selection-hash>--<timestamp>.json` | hash = `selectionHash` |
| Shared List | `<hash>--v<X.Y.Z>.json` | hash + version analogous to schema |

Six naming conventions total. `<timestamp>` is in the format `YYYY-MM-DDTHH-mmZ` (e.g. `2026-05-29T15-34Z`) — ISO-8601 with hyphens instead of colons for file-system compatibility.

### §17.3a `shared-lists/`

```
grading-data/shared-lists/<listname>/<hash>--v<X.Y.Z>.json
```

- `<listname>` is the identifier of the list (e.g. `evmChains`, `tradingExchanges`).
- `<hash>` is the sha256-first-8-chars representation of the canonically
  serialised list (same procedure as the schema hash, see §10).
- `<X.Y.Z>` is the list's own semver (bump rule see §10 table).

Shared Lists are **secondary in-scope**. They are hashed but not graded on their own — they enter tool gradings as a data source. Reference implementation: [`src/SharedLists.mjs`](../../src/SharedLists.mjs); migration: [`scripts/migrate-080-phase-5-shared-lists.mjs`](../../scripts/migrate-080-phase-5-shared-lists.mjs).

### §17.4 `phase-status/`

Separate sub-folders `phase-status/single/` and `phase-status/selection/`, analogous to [`14-kanban-data-contract.md`](./14-kanban-data-contract.md) §14 (Kanban lanes). Each `*.json` file describes the current phase status (P1-P7 or S1-S4) for a Single/Selection and is validated against [`14-kanban-data-contract.schema.json`](./14-kanban-data-contract.schema.json).

### §17.5 Lifecycle per Schema Iteration

```
1. Initial: schemas/etherscan/a1b2--v1.0.0.mjs is created
2. Single grading: single/etherscan--getContract/gradings/a1b2--T1.json
3. Schema fix with bump: schemas/etherscan/e5f6--v1.1.0.mjs (NEW, old schema remains)
4. Re-grading: single/etherscan--getContract/gradings/e5f6--T2.json
5. Stable after a Full grading: phase-status/single/etherscan--getContract.json updated
6. Selection pre-condition met → Selection grading released
```

Old schema files (`a1b2--v1.0.0.mjs`) remain referenceable for historical gradings — they are not deleted.

### §17.6 Cross-References

- Grading-entry top-level fields (`gradingId`, `schemaHash`, `schemaVersion`) → [`08-grading-model.md`](./08-grading-model.md) §3.1
- Versioning axes + bump tables → [`15-versioning-axes.md`](./15-versioning-axes.md) §10
- Lockfile schema (`selection.json`, `selection.lock.json`, `namespace.json`) → [`16-selection-lockfile.md`](./16-selection-lockfile.md) §11
- About-pages (hash convention) → [`11-about-convention.md`](./11-about-convention.md) §19
- Kanban lanes (Single vs Selection) → [`14-kanban-data-contract.md`](./14-kanban-data-contract.md) §14
- Pre-conditions (lockfile lookup) → [`21-pre-conditions.md`](./21-pre-conditions.md) §20
