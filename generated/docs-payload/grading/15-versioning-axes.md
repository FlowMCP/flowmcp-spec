---
title: "15 — Versioning + Canonical Hash (§10)"
description: "Versioning is carried by the **filename**, not by an in-source version key. Each primitive (schema, resource, skill, selection definition) is stored under the naming grammar defined in..."
grading_version: "2.0.0"
spec_file: "15-versioning-axes.md"
order: 15
section: "Grading"
normative: true
source_commit: "6152b7e"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/6152b7e/grading/2.0.0/15-versioning-axes.md"
generated_at: "2026-05-31T16:18:50.290Z"
generated_from: "grading/2.0.0/15-versioning-axes.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/2.0.0/15-versioning-axes.md."
---

| Field | Value |
|-------|-------|
| Status | Normative — restructured in 2.0.0 |
| Version | `gradingSpec/2.0.0` |
| Depends on | [`00-overview.md`](./00-overview.md), [`08-grading-model.md`](./08-grading-model.md) |
| Related | [`16-selection-lockfile.md`](./16-selection-lockfile.md), [`19-folder-layout.md`](./19-folder-layout.md), [`18-flywheel-loop.md`](./18-flywheel-loop.md) |

> **Spec:** `gradingSpec/2.0.0`
> **Status:** stable (structural break vs. 1.1.0)
> **Changes vs. 1.1.0:** the SemVer bump tables are removed — versioning is timestamp-based, carried by the filename. The sha256-8 hash algorithm is kept but the hash is moved out of the source files into the filename and the derived `index.json`. The `schemaVersion` / `selectionVersion` snapshot fields are removed from the source.

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](./00-overview.md). The binding source is the FlowMCP Schemas Specification v4.2.0.

---

## §10 Versioning + Canonical Hash

### §10.1 Timestamp Versioning

Versioning is carried by the **filename**, not by an in-source version key. Each primitive (schema, resource, skill, selection definition) is stored under the naming grammar defined in [`19-folder-layout.md`](./19-folder-layout.md) §17.3:

```
<name>--<YYYY-MM-DDTHH-MM-SSZ>--<hash8>.<ext>
```

The timestamp comes **before** the hash, so a naive `sort().at(-1)` always yields the newest version. A content change writes a new file next to the old one; the old file is never overwritten and remains referenceable for historical gradings.

The only version key that stays inside the source is `version` (FlowMCP spec format, e.g. `'flowmcp/4.0.0'`), which is a FlowMCP-Spec mandatory field. The snapshot version keys `schemaVersion` and `selectionVersion` are **removed** from the source — the snapshot a grading was run against is identified by the filename timestamp plus hash and recorded (frozen) in `index.json.lockSnapshot` (see [`16-selection-lockfile.md`](./16-selection-lockfile.md) §11.2).

| Field | Status | Location | Meaning |
|-------|--------|----------|---------|
| `version` | KEEP | source (`flowmcp/4.x.y`) | FlowMCP spec version (major frozen on 4) |
| `schemaVersion` | REMOVED from source | filename timestamp + `index.json` | snapshot identity of a schema |
| `selectionVersion` | REMOVED from source | filename timestamp + `index.json.lockSnapshot` | snapshot identity of a selection |

### §10.2 Hash Out of Source (Neutrality)

The schema `.mjs` and the `selection.json` are **neutral**: they carry only logical names. The in-source keys `schemaHash`, `selectionHash`, and `aboutHash` are **removed** — they drifted on every edit, so the recorded value no longer matched the actual content.

The hash is still computed (see §10.3) but it lands only in the **filename** and in the derived **`index.json`** — never inside the source. The source stays clean; the binding stays traceable through the derived index.

Reference resolution by logical name (examples):

- `resources.about.name: 'defillama-about.md'` → newest `…/resources/about/defillama-about--<ts>--<hash8>.md`
- `members[].schemaId: 'defillama.prices'` → newest `…/prices/schema/prices--<ts>--<hash8>.mjs`
- `skills: ['crypto-price-entry']` → newest `…/skills/crypto-price-entry/crypto-price-entry--<ts>--<hash8>.mjs`

There is no flat `defillama-about.md` — only the versioned file. `resolveLatest` knows which one is newest.

### §10.3 Canonical Representation for the Hash

The hash is computed by JSON stable-stringify (sorted keys, deterministic whitespace handling) over the object and hashed with sha256 (8 hex chars). The same procedure applies to `schemaHash` (schema object), `selectionHash` (selection object), `aboutHash` (About file bytes), and `namespaceHash` (namespace rollup payload). These values are recorded in the grading entry (see [`08-grading-model.md`](./08-grading-model.md) §3) and in `index.json` — not in the source.

**Pseudo-algorithm:**

```javascript
function computeSchemaHash( { schema } ) {
    const canonical = stableStringify( schema )    // sorted keys, deterministic whitespace
    const fullHash = sha256( canonical )           // hex digest
    const truncated = fullHash.slice( 0, 8 )       // 8 hex chars
    return { schemaHash: truncated }
}
```

Reference implementation: [`src/HashGenerator.mjs`](../../src/HashGenerator.mjs) (`computeSchemaHash` / `computeSelectionHash` / `computeNamespaceHash`). The algorithm is unchanged from 1.1.0; only the placement of the result changed (filename + `index.json`, never source).

### §10.4 Cross-Refs

- Hashes in the grading entry → [`08-grading-model.md`](./08-grading-model.md) §3
- Per-member hash binding (frozen) → [`16-selection-lockfile.md`](./16-selection-lockfile.md) §11.2 (`index.json.lockSnapshot`)
- Filename naming grammar → [`19-folder-layout.md`](./19-folder-layout.md) §17.3
- Flywheel — new file in the iteration loop → [`18-flywheel-loop.md`](./18-flywheel-loop.md) §16
