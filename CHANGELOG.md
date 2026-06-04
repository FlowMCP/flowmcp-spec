# Changelog

## v4.3.0 — 2026-06-02 (two-track lifecycle)

The Schemas-Spec delegates grading to the now-`gradingSpec/3.0.0` standard (a **BREAKING** grading release) and decouples the development lifecycle from the grading-monitoring track. The schema *format* is unchanged; the substance of the `4.3.0` bump is the lifecycle split and the alignment to Grading-Spec 3.0.0.

### Changed

- **`21-schema-lifecycle.md`** — **two-track split.** The six development-lifecycle stages stay in this spec; *monitoring, issue tracking, and the grade rollup* move to the Grading-Spec (new `26-monitoring-track.md`). Validate-before-grade is relaxed for the monitoring track only: a grading record MAY exist in a `blocked` state (`reason: validation-failed`) for a schema that has not cleared `stage:validation` (**emit-on-failure**). The development gate is unchanged — `flowmcp validate` → 0 errors is still required before `stage:production`.
- **Grading delegation now targets `gradingSpec/3.0.0`** (was `2.0.0`). The grading import contract flips from hard-abort to emit-`blocked`-node-and-continue; this is a MAJOR grading bump. The legacy `grading/2.0.0/` directory is retained unchanged.

### Added

- **`09-validation-rules.md` — VAL019.** Folder↔namespace invariant: a `providers/<dir>/` directory name MUST equal the `main.namespace` of every schema it contains (sibling of `CAT002` / `AGT001` / `SKL003`), with an unparseable-folder fallback and rename-on-parse lifecycle.

### Released

- Spec folder hardcopied to `spec/v4.3.0/`; `package.json` and `data/refs.manual.json` aligned (`spec` → `4.3.0`, `grading` → `3.0.0`). Tag `v4.3.0`.

## v4.2.0 — 2026-05-31 (delegation)

The Schemas-Spec remains the highest instance and now **delegates** schema grading to a separate, independently versioned standard — the **Grading-Spec** (`gradingSpec/2.0.0`), published as Navigation point 5 in the docs. This delegation is the substance of the `4.2.0` bump; the schema format itself is unchanged.

### Changed

- **`22-scoring-protocol.md`** — **delegates the grading model** (score-to-grade thresholds, the extended dimension set, Veto/Tier) to the Grading-Spec, while **retaining the upstream scoring transport** (the `prompts.json` / `scores.json` artefact pair) that the Grading-Spec sub-consumes and treats as the highest instance.
- **`20-validation-strategy.md`** — references the Grading-Spec (`gradingSpec/2.0.0`) as the extended grading layer above the deterministic A–F baseline.
- Spec folder hardcopied to `spec/v4.2.0/`; version constants in `package.json` and `data/refs.manual.json` aligned.

## v4.1.1 — 2026-05-29 (additive)

Additive release introducing two new schema-header fields that ride alongside the existing `version` field. Grading-System Iteration 2 requires deterministic schema identification across iterations.

### Added

- **`schemaVersion`** (required, semver pattern `\d+\.\d+\.\d+`). Schema-Content-Version. Decouples schema content evolution from the FlowMCP spec version. Initial value for all migrated schemas: `1.0.0`.
- **`schemaHash`** (required, regex `[0-9a-f]{8}`). 8-character sha256-prefix of canonical-JSON-serialized schema (excluding the `schemaHash` field itself). Used as stable identifier in `grading-data/schemas/<namespace>/<hash>--v<X.Y.Z>.mjs` snapshots.

### Migration

- Migration script in `flowmcp-schemas-private`: `scripts/add-schema-version-field.mjs` (additive, idempotent, dry-run capable).
- 406 production schemas in `schemas/v4.0.0/providers/` migrated. Skill-files under `<namespace>/skills/` excluded (no `main`/`schema` export, by design).
- Verification: `tests/manual/check-schemas-have-schema-version.mjs` asserts 100 % coverage and recomputes hash to ensure consistency.

### Bump-Rule

- Same `schemaVersion` + different `schemaHash` = bump-rule violation (bump rules defined in the grading specification). Detected by `BumpHelper.checkVersionHashConsistency` in `flowmcp-grading`.

---

## v4.1.0 — 2026-05-24

Additive, non-breaking release introducing the `sqlite-gtfs` resource source type, six new validation codes, the first FlowMCP add-on, and the `FLOWMCP_*` path variable family.

### Added

- **New resource source type `sqlite-gtfs`** (Design C — extends sqlite with seal verification and add-on reference). The new source delegates the catalog of standard tools to a FlowMCP add-on, enabling capability-driven auto-injection. See `spec/v4.1.0/13-resources.md` section "SQLite-GTFS Resources". Example schema: `examples/sqlite-gtfs-example.mjs`.
- **Validation codes RES030–RES035** for sqlite-gtfs resources (mode constraint, addon requirement, seal verification, DB open failure, spec drift, path variable resolution).
- **First FlowMCP add-on: `geo-gtfs-toolkit`** (`github:FlowMCP/geo-gtfs-toolkit`). Add-ons supply the converter, the default-method catalog, and the capability detector for a given seal value. NPM is not used — add-ons are referenced via `github:` paths only.
- **Path variable support** (`${FLOWMCP_RESOURCES}`) for user-configurable resource locations. Resolution falls back to `~/.flowmcp/resources/` when the environment variable is unset.

### Notes

- Provider GTFS data is never published in this repository. Users provide data locally under `${FLOWMCP_RESOURCES}`. The only GTFS-shaped data permitted in any public FlowMCP repository is the synthetic Mini-GTFS fixture (CC0) bundled with `geo-gtfs-toolkit` for testing and CI.
- The variable name follows the `main.resources` primitive — establishes the `FLOWMCP_*` naming family. Future variables (`FLOWMCP_LOGS`, `FLOWMCP_CACHE`) follow the same pattern.

---

## v4.0.0 — 2026-05-14

Major release introducing Selection as the 5th primitive, MCP integration via meta blocks, two-layer validation strategy, and unified versioning across all primitives.

### Added

- **Selection**: 5th primitive — named collections of Primitives for agent activation. `selections/` directory at root level. Validation rules SEL001–SEL003. See `17-selections.md`.
- **Prefill & Placeholders**: Complete placeholder system (12 types) with pre-execution support. `prefill[]` array in skills. See `18-prefill.md`.
- **MCP Integration**: `meta` block required per Tool (VAL100–VAL106). `alwaysLoad`, `searchHint`, `aliases` fields. MCP annotation translation. See `19-mcp-integration.md`.
- **Validation Strategy**: Two-layer validation (deterministic + probabilistic). Grade system A–F with thresholds **4.5 / 3.5 / 2.5** [Consolidation 2026-05-14]. Grade Report with `schemaId` (Schema-File-ID), `primitives[]` array, `validatorVersion`. See `20-validation-strategy.md`.
- **Schema Lifecycle**: 6-stage lifecycle from Research to Production. Production gate: **Score >= 3.5 (Grade B)** [Consolidation 2026-05-14]. Partial Schema Policy: failing Primitives removed before deploy. Static schema auto-PASS. See `21-schema-lifecycle.md`.
- **HTTP Resources**: `source: 'http'` for remote files via HTTPS (rule RES024). RES001 extended to accept **`'sqlite' | 'markdown' | 'http'`** [Consolidation 2026-05-14]. See `13-resources.md`.
- **Schema-File-ID**: New ID type `namespace/schema-name` (1 slash) identifying the physical schema file. See `16-id-schema.md`.
- **CLI-Adapter**: Internal MCP tool name mapping `name_namespace` documented. No Short Form rule. See `16-id-schema.md`.
- **Agent Selections**: `agent.selections[]` field for loading Selections. Rule AGT030 [Consolidation 2026-05-14, code renumbered from AGT010]. See `06-agents.md`.
- **Agent Elicitation**: `agent.elicitation` field (MCP Spec 2025-06-18). `requestedSchemas[]` with restricted JSON Schema. Rule AGT031 [Consolidation 2026-05-14, code renumbered from AGT011]. See `06-agents.md`.
- **One-Shot Skill Design**: Skills must be self-contained for single-pass execution. One-Shot test (probabilistic). See `14-skills.md`.
- **VAL110 Slash-Rule** [Consolidation 2026-05-14]: References in `selection.tools/resources/prompts` and `agent.tools/prompts` MUST contain `/` (full ID form). Keys in `selection.skills` and `agent.skills` MUST NOT contain `/` (inline form). See VAL110 in `09-validation-rules.md`.
- **Central code registry** [Consolidation 2026-05-14]: `09-validation-rules.md` is the single source of truth for all VAL/SEL/AGT/SKL/RES codes. Downstream tooling references, does not redefine.

### Changed

- **`main.skills` removed**: Hard breaking change. Skills now live at Namespace, Selection, or Agent level (never `main.skills`). Enforced via VAL016 [Consolidation 2026-05-14].
- **`meta` block required per Tool**: VAL100–VAL106 are errors.
- **Namespace pattern**: `^[a-z]+$` → `^[a-z][a-z0-9-]*$` (allows digits and hyphens). Now explicitly coded as VAL011.
- **Version pattern**: `^3\.\d+\.\d+$` → `^4\.\d+\.\d+$`. Now explicitly coded as VAL014.
- **Unified versioning** [Consolidation 2026-05-14]: All primitives use `flowmcp/4.0.0` (Schema, Selection, Agent, Skill, Prompt). Was previously split (`flowmcp/3.0.0` for schemas/agents vs `flowmcp-skill/1.0.0` for skills).
- **Skill type enum** [Consolidation 2026-05-14]: Bare strings `'namespace' | 'selection' | 'agent'` (was: `-skill` suffix).
- **AGT004 Agent Version**: Required value `flowmcp/4.0.0` [Consolidation 2026-05-14].
- **SKL004 Skill Version**: Required value `'flowmcp/4.0.0'` (was: `'flowmcp-skill/1.0.0'`) [Consolidation 2026-05-14].
- **`executeRequest` handler documented**: Standard HTTP fetch replacement. See `01-schema-format.md`.
- **VAL107**: Enums matching Shared List MUST use `{{listName:alias}}` interpolation.
- **`03-shared-lists.md`**: Header corrected (was v2.0.0), Alias-Mapping Pattern section added.
- **Skill fields**: `whenToUse`, `type`, `version` are required in v4. `prefill` optional.

### Fixed

- **VAL011/VAL014 explicit codes** [Consolidation 2026-05-14]: Namespace and version regex checks now carry explicit code prefixes for diagnostic clarity.
- **`16-id-schema.md` Resource Type table** [Consolidation 2026-05-14]: Extended to seven primitives (tool, resource, prompt, skill, list, selection, agent). Bug fix: `prompt` maps to `main.prompts` (was incorrectly `main.skills`).
- **Pipeline Skills-only Sonderpfad removed** [Consolidation 2026-05-14]: Dead code removed from `flowmcp-core/src/v4/task/Pipeline.mjs` — `main.skills` is forbidden in v4, special path has no use.
- **SelectionValidator SEL003 Resolvability** [Consolidation 2026-05-14]: Check now implemented in `flowmcp-core/src/v4/task/SelectionValidator.mjs` (optional `catalog` parameter).

---

## v3.0.0 Revision 8.0 — 2026-03-12

Three-level architecture, Agents, Prompt Architecture, Catalog, and ID Schema.

### Added

- **Agents**: Groups evolve into full agent manifests (`manifest.json`) with model binding (OpenRouter syntax), system prompts, tool cherry-picking via ID schema, and minimum 3 tests per agent. Agent tests use `expectedTools` (deterministic) and `expectedContent` (assertions). See `06-agents.md`.
- **Prompt Architecture**: Two-tier prompt system — Provider-Prompts (model-neutral, single namespace) and Agent-Prompts (model-specific with `testedWith`, multi-provider). Unified `[[...]]` placeholder syntax. Composable via `references[]` (1 level deep). Version `flowmcp-prompt/1.0.0`. See `12-prompt-architecture.md`.
- **Catalog**: Named directory with `registry.json` manifest listing shared lists, provider schemas, and agent definitions. Multiple catalogs can coexist. Import flow via `import-registry` + `import-agent`. See `15-catalog.md`.
- **ID Schema**: Unified `namespace/type/name` format for referencing tools, resources, and prompts. Short form `namespace/name` in unambiguous contexts. Validation rules ID001-ID006. See `16-id-schema.md`.
- **Placeholder Syntax**: `[[...]]` for prompt content — with `/` = reference (resolved via ID schema), without `/` = parameter (user input). Validation rules PH001-PH004. See `02-parameters.md`.
- **Agent Tests**: Three-level test model — Tool Usage (deterministic), Content (assertions), Quality (subjective). `expectedTools[]` and `expectedContent[]`. Validation rules TST009-TST013. See `10-tests.md`.
- **Example Files**: Agent manifest, Agent-Prompt, Provider-Prompt, and registry.json examples in `examples/v3.0.0/`.
- **New Validation Rules**: AGT001-AGT012 (agents), PRM001-PRM010 (prompts), CAT001-CAT007 (catalog), ID001-ID006 (IDs), PH001-PH004 (placeholders). See `09-validation-rules.md`.

### Changed

- **Groups renamed to Agents**: `06-groups.md` becomes `06-agents.md`. Groups were simple tool lists; Agents are complete definitions with model, prompts, tests, and system prompt.
- **Group Skills renamed to Prompt Architecture**: `12-group-skills.md` becomes `12-prompt-architecture.md`. Skills (14-skills.md) remain separate.
- **Test minimum increased from 1 to 3**: TST001 now requires minimum 3 tests per tool, resource query, and agent.
- **Three-level architecture**: Root (shared lists, helpers, registry) → Provider (one API per namespace) → Agent (purpose-driven compositions).
- **LLM-First Design Philosophy**: Open/flat structures optimized for LLM comprehension, not machine enforcement.

---

## v3.0.0 — 2026-03-11

Major release aligning FlowMCP with all three MCP primitives: Tools, Resources, and Skills.

### Added

- **Skills**: New MCP primitive (`main.skills`) for reusable AI agent instructions. Skills are `.mjs` files with `export const skill` containing structured metadata and Markdown instructions. Own versioning format `flowmcp-skill/1.0.0` enables structural validation and future evals. Placeholder system (`{{tool:x}}`, `{{resource:x}}`, `{{skill:x}}`, `{{input:x}}`) for cross-referencing within schemas. Max 4 skills per schema.
- **Resources**: New MCP primitive (`main.resources`) for deterministic read-only data access via SQLite. Prepared statements with parameter binding, SQL security enforcement (blocks ATTACH DATABASE, LOAD_EXTENSION, PRAGMA). Runtime via `sql.js` (pure JS/WASM). Max 2 resources per schema, max 4 queries per resource.
- **Spec Documents**: `13-resources.md` (23 validation rules RES001-RES023) and `14-skills.md` (24 validation rules SKL001-SKL025)
- **Example Schemas**: 7 new examples — tools-only, resource, skill, full-v3, resource-only, example-skill, example-skill-external
- **Type Discriminators**: Group references support `::tool::name` and `::resource::name` syntax
- **`includeSchemaSkills`**: Groups can auto-expose schema-level skills
- **`flowmcp migrate` Command**: Automatic v2 to v3 schema migration

### Changed

- **Routes renamed to Tools**: `main.routes` becomes `main.tools` (primary key). `main.routes` accepted as deprecated alias with warning.
- **Group Prompts renamed to Group Skills**: `12-group-prompts.md` becomes `12-group-skills.md`
- **Route Tests renamed to Tests**: `10-route-tests.md` becomes `10-tests.md`, now covers resource query tests
- **Schema without Tools valid**: Schemas with only resources or only skills are now valid (E1)
- **Version pattern**: Accepts `3.x.x` in addition to `2.x.x`

### Deprecated

- `main.routes` key — use `main.tools` instead. Deprecation timeline: v3.0.0 (alias+warning) → v3.1.0 (loud warning) → v3.2.0 (validation error)

---

## v2.0.0 — 2026-02-16

Initial release of the FlowMCP Specification v2.0.0.

### Added

- **Schema Format**: `main` + `handlers` split for hashable declarations and executable code
- **Shared Lists**: Reusable value lists with dependencies and version pinning
- **Output Schema**: Per-route output definitions with MIME-Type support
- **Security Model**: Static scan, trust boundary, restricted handler zone
- **Cherry-Pick Groups**: Tool-level grouping with SHA-256 integrity hashes
- **MCP Tasks**: Reserved fields for async operations (implementation in v2.1.0)
- **Migration Guide**: Step-by-step migration from v1.2.0 to v2.0.0
- **Validation Rules**: Complete validation checklist for schemas, lists, and groups
- **Route Tests**: Declarative test format for schema routes
- **Preload**: Schema initialization with startup data before first request
- **Group Prompts**: LLM prompt workflows that guide agents through multi-step tool usage within groups
- **Example Schemas**: Minimal, shared-list, multi-route, async, and list definition examples
