# 15 — Version Axes + Bump Tables (§10)

| Field | Value |
|-------|-------|
| Status | Normative — NEW in 1.1.0 |
| Version | `gradingSpec/1.1.0` |
| Depends on | [`00-overview.md`](./00-overview.md), [`08-grading-model.md`](./08-grading-model.md) |
| Related | [`16-selection-lockfile.md`](./16-selection-lockfile.md), [`19-folder-layout.md`](./19-folder-layout.md), [`18-flywheel-loop.md`](./18-flywheel-loop.md) |

> **Spec:** `gradingSpec/1.1.0`
> **Status:** stable (additive extension of 1.0.0)
> **Changes vs. 1.0.0:** entirely new section §10 (version axes + bump tables + consistency check + canonical representation).

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](./00-overview.md). The binding source is the FlowMCP Schemas Specification v4.1.0.

---

## §10 Version Axes

### §10.1 Two Version Axes

`gradingSpec/1.1.0` introduces a **second version axis**. In `gradingSpec/1.0.0` there was only the `version` field (FlowMCP spec version). Schema content changes (e.g. adding a parameter, sharpening a description) now require their own version, independent of the FlowMCP spec version.

```
FlowMCP schema/selection header
├── version: '4.x.y'              ⟵ Spec version (frozen on major 4)
└── schemaVersion: 'X.Y.Z'        ⟵ Schema version (free, semver)
     or selectionVersion: 'X.Y.Z'
```

| Axis | Field | Range | Meaning |
|------|-------|-------|---------|
| **Spec version** | `version` | `4.\d+.\d+` (major frozen) | FlowMCP spec |
| **Schema version** | `schemaVersion` | `<major>.<minor>.<patch>` (semver, free) | Schema content |
| **Selection version** | `selectionVersion` | `<major>.<minor>.<patch>` (semver, free) | Selection content |

**Historical background:** earlier schema generations carried two parallel fields (one for the schema, one for the spec); later generations dropped the schema field; v4.0.0 introduced "unified versioning". `gradingSpec/1.1.0` reintroduces the second axis.

### §10.2 Bump Table `schemaVersion`

Changes to schema content force a bump along this table (binding):

| Change type | Bump |
|-------------|------|
| Tool name changed | Major |
| Tool removed | Major |
| Tool added | Minor |
| Tool description improved (semantic) | Minor |
| Tool description stylistic only | Patch |
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

15 change types in total.

### §10.3 Bump Table `selectionVersion`

Changes to selection content force a bump along this table (binding):

| Change type | Bump |
|-------------|------|
| Member removed | Major |
| Persona list changed (semantic) | Major |
| Member added | Minor |
| Description changed (semantic) | Minor |
| Skills list extended (within max 4) | Minor |
| Description stylistic only | Patch |
| Skill implementation changed | Patch |

7 change types in total.

### §10.4 Consistency Check

> Same `schemaVersion` + different `schemaHash` = **bump-rule violation**. The toolchain (a diff-based bump helper) must alert the author to the required bump before the commit is allowed.

The same applies to Selections: same `selectionVersion` + different `selectionHash` = bump-rule violation.

| Check | Expectation | Consequence on violation |
|-------|-------------|--------------------------|
| `(schemaVersion, schemaHash)` consistency | same hash → same version; different hash → bump per table | Toolchain blocks the commit, proposes the bump level |
| `(selectionVersion, selectionHash)` consistency | same | same |

### §10.5 Canonical Representation for `schemaHash`

`schemaHash` is computed by JSON stable-stringify (sorted keys, deterministic whitespace handling) over the schema object and hashed with sha256 (8 hex chars). Cross-reference: [`08-grading-model.md`](./08-grading-model.md) §3.X (mandatory field).

**Pseudo-algorithm:**

```javascript
function computeSchemaHash( { schema } ) {
    const canonical = stableStringify( schema )    // sorted keys, deterministic whitespace
    const fullHash = sha256( canonical )           // hex digest
    const truncated = fullHash.slice( 0, 8 )       // 8 hex chars
    return { schemaHash: truncated }
}
```

The same applies to `selectionHash` (selection object), `aboutHash` (About file bytes), and `namespaceHash` (namespace payload, see [`16-selection-lockfile.md`](./16-selection-lockfile.md) §11.4).

### §10.6 Cross-Refs

- Top-level mandatory fields (`schemaVersion`, `schemaHash`) → [`08-grading-model.md`](./08-grading-model.md) §3.X
- Lockfile fields per member (`schemaVersion`, `schemaHash`, `gradingStatus`) → [`16-selection-lockfile.md`](./16-selection-lockfile.md) §11.2
- Folder layout (`<schema-hash>--v<X.Y.Z>.mjs`) → [`19-folder-layout.md`](./19-folder-layout.md) §17.2
- Flywheel — version bump in the iteration loop → [`18-flywheel-loop.md`](./18-flywheel-loop.md) §16
