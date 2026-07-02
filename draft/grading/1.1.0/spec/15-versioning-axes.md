# 15 — Versioning Axes + Bump Tables (§10)

| Field | Value |
|-------|-------|
| Status | Normative — NEW in 1.1.0 |
| Version | `gradingSpec/1.1.0` |
| Depends on | [`00-overview.md`](./00-overview.md), [`08-grading-model.md`](./08-grading-model.md) |
| Related | [`16-selection-lockfile.md`](./16-selection-lockfile.md), [`19-folder-layout.md`](./19-folder-layout.md), [`18-flywheel-loop.md`](./18-flywheel-loop.md) |

> **Spec:** `gradingSpec/1.1.0`
> **Status:** stable (additive extension of 1.0.0)
> **Changes vs 1.0.0:** an entirely new section §10 (versioning axes + bump tables + consistency check + canonical representation).

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](./00-overview.md). The binding source is the FlowMCP Schemas Specification v4.1.0.

---

## §10 Versioning Axes

### §10.1 Two Versioning Axes

`gradingSpec/1.1.0` introduces a **second versioning axis**. In `gradingSpec/1.0.0` there was only the `version` field (FlowMCP spec version). Schema content changes (e.g. adding a parameter, sharpening a description) now require their own version, independent of the FlowMCP spec version.

```
FlowMCP schema/selection header
├── version: '4.x.y'              ⟵ spec version (frozen on major 4)
└── schemaVersion: 'X.Y.Z'        ⟵ schema version (free, semver)
     or selectionVersion: 'X.Y.Z'
```

| Axis | Field | Range | Meaning |
|------|-------|-------|---------|
| **Spec version** | `version` | `4.\d+.\d+` (major frozen) | FlowMCP spec |
| **Schema version** | `schemaVersion` | `<major>.<minor>.<patch>` (semver, free) | Schema content |
| **Selection version** | `selectionVersion` | `<major>.<minor>.<patch>` (semver, free) | Selection content |

**Historical note:** earlier schemas had two parallel fields (`version` for the schema, `flowMCP` for the spec). A later version removed `version`. v4.0.0 introduced "unified versioning". gradingSpec/1.1.0 re-introduces the second axis.

### §10.2 Bump Table `schemaVersion`

Changes to the schema content force a bump along this table (binding):

| Change type | Bump |
|-------------|------|
| Tool name changed | Major |
| Tool removed | Major |
| Tool added | Minor |
| Tool description improved (semantically) | Minor |
| Tool description only stylistic | Patch |
| Parameter added (optional) | Minor |
| Parameter added (required) | Major |
| Parameter renamed | Major |
| Parameter default changed | Minor |
| Output field added | Minor |
| Output field renamed/removed | Major |
| `requiredServerParams` changed | Minor |
| Comment/JSDoc update | Patch |
| Whitespace/formatting | Patch |
| Shared-List entry changed | Patch |

15 change types total.

### §10.3 Bump Table `selectionVersion`

Changes to the selection content force a bump along this table (binding):

| Change type | Bump |
|-------------|------|
| Member removed | Major |
| Persona list changed (semantically) | Major |
| Member added | Minor |
| Description changed (semantically) | Minor |
| Skills list extended (within max 4) | Minor |
| Description only stylistic | Patch |
| Skill implementation changed | Patch |

7 change types total.

### §10.4 Consistency Check

> Same `schemaVersion` + different `schemaHash` = **bump-rule violation**. The toolchain (a diff-based bump helper) must alert the author to the necessary bump before the commit is allowed.

The same applies analogously to Selections: same `selectionVersion` + different `selectionHash` = bump-rule violation.

| Check | Expectation | Consequence on violation |
|-------|-------------|--------------------------|
| `(schemaVersion, schemaHash)` consistency | same hash → same version; different hash → bump per table | toolchain blocks the commit, proposes a bump level |
| `(selectionVersion, selectionHash)` consistency | same | same |

### §10.5 Canonical Representation for `schemaHash`

`schemaHash` is computed via JSON stable-stringify (sorted keys, deterministic whitespace handling) over the schema object and hashed with sha256 (8 hex chars). Cross-reference [`08-grading-model.md`](./08-grading-model.md) §3.1 (required field).

**Pseudo-algorithm:**

```javascript
function computeSchemaHash( { schema } ) {
    const canonical = stableStringify( schema )    // sorted keys, deterministic whitespace
    const fullHash = sha256( canonical )           // hex digest
    const truncated = fullHash.slice( 0, 8 )       // 8 hex chars
    return { schemaHash: truncated }
}
```

The same applies analogously to `selectionHash` (selection object), `aboutHash` (about-file bytes), and `namespaceHash` (namespace payload, see [`16-selection-lockfile.md`](./16-selection-lockfile.md) §11.4).

### §10.6 Cross-References

- Top-level required fields (`schemaVersion`, `schemaHash`) → [`08-grading-model.md`](./08-grading-model.md) §3.1
- Lockfile fields per member (`schemaVersion`, `schemaHash`, `gradingStatus`) → [`16-selection-lockfile.md`](./16-selection-lockfile.md) §11.2
- Folder layout (`<schema-hash>--v<X.Y.Z>.mjs`) → [`19-folder-layout.md`](./19-folder-layout.md) §17.2
- Flywheel — version bump in the iteration loop → [`18-flywheel-loop.md`](./18-flywheel-loop.md) §16
