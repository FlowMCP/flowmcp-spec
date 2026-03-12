# Changelog

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
