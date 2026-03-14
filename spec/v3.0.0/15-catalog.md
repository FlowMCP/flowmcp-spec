# FlowMCP Specification v3.0.0 — Catalog

A Catalog is the top-level organizational unit in FlowMCP v3. It is a named directory containing a `registry.json` manifest that describes all shared lists, provider schemas, and agent definitions within that directory. Multiple catalogs can coexist side by side, enabling community, company-internal, and experimental tool collections to operate independently.

---

## Purpose

As FlowMCP grows beyond individual schemas and shared lists, a higher-level structure is needed to group related content into a cohesive, distributable unit. Without catalogs:

- **No manifest** — the runtime must scan directories and infer relationships between schemas, lists, and agents
- **No isolation** — company-internal schemas mix with community schemas in a flat namespace
- **No import boundary** — importing from a remote registry requires knowledge of internal file structure

Catalogs solve this by providing a single `registry.json` manifest that declares everything the directory contains. The runtime reads this manifest instead of scanning the filesystem, and import commands use it as the entry point for downloading and resolving dependencies.

```mermaid
flowchart LR
    A[Catalog Directory] --> B[registry.json]
    B --> C[Shared Lists]
    B --> D[Provider Schemas]
    B --> E[Agent Definitions]
    C --> F[Runtime Resolution]
    D --> F
    E --> F
    F --> G[MCP Server]
```

The diagram shows how the catalog directory contains a manifest that references shared lists, provider schemas, and agent definitions. The runtime resolves all three through the manifest and exposes them via the MCP server.

---

## Catalog Structure

A catalog is a named directory containing a `registry.json` manifest and three content areas: shared lists, provider schemas, and agent definitions.

```
schemas/v3.0.0/
└── flowmcp-community/              <- Named catalog directory
    ├── registry.json                <- Catalog manifest
    ├── _lists/                      <- Shared Lists (root level)
    │   ├── evm-chains.mjs
    │   ├── german-bundeslaender.mjs
    │   └── ...
    ├── _shared/                     <- Shared Helpers (root level)
    ├── providers/                   <- All provider schemas
    │   ├── aave/
    │   │   └── reserves.mjs
    │   ├── coingecko-com/
    │   │   ├── simple-price.mjs
    │   │   └── prompts/             <- Provider prompts (model-neutral)
    │   └── ...
    └── agents/                      <- Agent definitions
        ├── crypto-research/
        │   ├── agent.mjs            <- Agent manifest (export const main)
        │   ├── prompts/             <- Agent-specific prompts
        │   │   └── prompt-name.mjs
        │   ├── skills/              <- Agent-specific skills
        │   │   └── skill-name.mjs
        │   └── resources/           <- Agent-specific resources (optional)
        └── defi-monitor/
            ├── agent.mjs
            ├── prompts/
            ├── skills/
            └── resources/
```

### Directory Conventions

| Directory | Level | Purpose |
|-----------|-------|---------|
| `_lists/` | Root | Shared value lists consumed by all providers and agents |
| `_shared/` | Root | Shared helper modules consumed by provider schemas |
| `providers/` | Root | Provider schema directories, one per namespace |
| `providers/{namespace}/` | Provider | Schema files for a single data source |
| `providers/{namespace}/prompts/` | Provider | Model-neutral prompts for the provider's tools |
| `agents/` | Root | Agent definition directories |
| `agents/{agent-name}/` | Agent | Agent manifest, prompts, skills, and resources |
| `agents/{agent-name}/prompts/` | Agent | Agent-specific prompts |
| `agents/{agent-name}/skills/` | Agent | Agent-specific skills |
| `agents/{agent-name}/resources/` | Agent | Agent-specific resources (optional) |

### Naming Rules

- The catalog directory name must match the `name` field in `registry.json`
- Directory names use kebab-case: `flowmcp-community`, `my-company-tools`
- Provider namespace directories use kebab-case: `coingecko-com`, `defi-llama`
- Agent directories use kebab-case: `crypto-research`, `defi-monitor`

---

## Multiple Catalogs

Multiple catalogs can exist side by side under the same parent directory. Each catalog is fully self-contained — its `registry.json` references only files within its own directory tree. There are no cross-catalog dependencies.

```
schemas/v3.0.0/
├── flowmcp-community/           <- Official community catalog
│   └── registry.json
├── my-company-tools/            <- Company-internal catalog
│   └── registry.json
└── experimental/                <- Personal experiments
    └── registry.json
```

### Isolation Guarantees

1. **No cross-catalog shared lists** — a schema in `my-company-tools` cannot reference a shared list defined in `flowmcp-community`. If both catalogs need the same list, each must include its own copy.
2. **No namespace collisions across catalogs** — two catalogs may contain providers with the same namespace (e.g. both have `etherscan/`). The runtime qualifies tool names with the catalog name to prevent collisions.
3. **Independent versioning** — each catalog has its own `version` field. Updating `flowmcp-community` to version `3.1.0` does not affect `my-company-tools` at version `3.0.0`.
4. **Independent import** — `flowmcp import-registry` targets a single catalog. Importing one catalog does not pull in others.

---

## Registry Manifest Format

The `registry.json` file is the entry point for a catalog. It declares identity metadata and lists all shared lists, provider schemas, and agent definitions within the catalog.

```json
{
    "name": "flowmcp-community",
    "version": "3.0.0",
    "description": "Official FlowMCP community catalog",
    "schemaSpec": "3.0.0",

    "shared": [
        { "file": "_lists/evm-chains.mjs", "name": "evmChains" },
        { "file": "_lists/german-bundeslaender.mjs", "name": "germanBundeslaender" }
    ],

    "schemas": [
        {
            "namespace": "coingecko-com",
            "file": "providers/coingecko-com/simple-price.mjs",
            "name": "CoinGecko Simple Price",
            "requiredServerParams": [],
            "hasHandlers": false,
            "sharedLists": []
        }
    ],

    "agents": [
        {
            "name": "crypto-research",
            "description": "Cross-provider crypto analysis agent",
            "manifest": "agents/crypto-research/agent.mjs"
        }
    ]
}
```

All file paths in `registry.json` are relative to the catalog root directory. Absolute paths and paths that escape the catalog directory (e.g. `../other-catalog/file.mjs`) are forbidden.

---

## Registry Fields

### Top-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Catalog name. Must match the catalog directory name. Kebab-case. |
| `version` | `string` | Yes | Catalog version (semver). Independent of schema spec version. |
| `description` | `string` | Yes | Human-readable description of the catalog's purpose. |
| `schemaSpec` | `string` | Yes | FlowMCP specification version this catalog conforms to (e.g. `"3.0.0"`). |
| `shared` | `array` | Yes | Shared list references. May be empty (`[]`). |
| `schemas` | `array` | Yes | Schema entries. May be empty (`[]`). |
| `agents` | `array` | Yes | Agent entries. May be empty (`[]`). |

### Shared List Entry Fields

Each object in the `shared` array describes one shared list file.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | `string` | Yes | Relative path from catalog root to the `.mjs` list file. |
| `name` | `string` | Yes | List name (camelCase). Must match `meta.name` in the referenced file. |

### Schema Entry Fields

Each object in the `schemas` array describes one provider schema file.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `namespace` | `string` | Yes | Provider namespace (kebab-case). Groups schemas by data source. |
| `file` | `string` | Yes | Relative path from catalog root to the `.mjs` schema file. |
| `name` | `string` | Yes | Human-readable schema name. |
| `requiredServerParams` | `string[]` | Yes | Server parameters (API keys) the schema requires. May be empty. |
| `hasHandlers` | `boolean` | Yes | Whether the schema exports a `handlers` factory function. |
| `sharedLists` | `string[]` | Yes | Names of shared lists this schema references. May be empty. |

### Agent Entry Fields

Each object in the `agents` array describes one agent definition.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Agent name (kebab-case). Must match the agent directory name. |
| `description` | `string` | Yes | Human-readable description of the agent's purpose. |
| `manifest` | `string` | Yes | Relative path from catalog root to the agent's `agent.mjs` file. |
| `prompts` | `Object` | No | Agent-specific prompts exported by the agent. |
| `skills` | `Object` | No | Agent-specific skills exported by the agent. |
| `resources` | `Object` | No | Agent-specific resources exported by the agent. |

---

## Import Flow

The import flow describes how a catalog is downloaded and activated locally. The v3 import flow extends the v2 flow by adding agent manifest resolution.

```mermaid
flowchart LR
    A["flowmcp import-registry URL"] --> B[Download registry.json]
    B --> C[Download shared lists]
    B --> D[Download provider schemas]
    B --> E[Download agent manifests]
    E --> F[Agents available locally]
    F --> G["flowmcp import-agent crypto-research"]
    G --> H[Activate agent tools locally]
```

The diagram shows the two-phase import process: `import-registry` downloads the catalog contents, and `import-agent` activates a specific agent's tools locally.

### Phase 1: Catalog Import (`import-registry`)

1. **Download `registry.json`** from the remote URL.
2. **Validate manifest** — check required fields, verify `schemaSpec` compatibility.
3. **Download shared lists** — resolve each `shared[].file` path and download the `.mjs` files.
4. **Download provider schemas** — resolve each `schemas[].file` path and download the `.mjs` files.
5. **Download agent manifests** — resolve each `agents[].manifest` path and download the `agent.mjs` files (and associated prompt, skill, and resource files).
6. **Store locally** — write all downloaded files into the local catalog directory.

### Phase 2: Agent Activation (`import-agent`)

1. **Read agent manifest** — parse the locally stored `agent.mjs` for the named agent.
2. **Resolve tool dependencies** — identify which provider schemas the agent requires.
3. **Activate tools** — add the agent's required tools to the local project configuration.
4. **Register prompts** — make the agent's prompts available as MCP prompts.

### v2 vs v3 Comparison

| Step | v2 (Current) | v3 (New) |
|------|-------------|----------|
| Download | Schemas + shared lists | Schemas + shared lists + agent manifests |
| Agent setup | User creates groups manually | Pre-built agents available via `import-agent` |
| Tool composition | Manual cherry-picking into groups | Agent manifest declares required tools |
| Prompts | Group-level prompts only | Schema-level + agent-level prompts |

---

## Three-Level Architecture

The catalog structure maps directly to the three-level architecture of FlowMCP: Root, Provider, and Agent.

```mermaid
flowchart TD
    A[Catalog Root] --> B["_lists/ — Shared Lists"]
    A --> C["_shared/ — Shared Helpers"]
    A --> D["providers/ — Provider Schemas"]
    A --> E["agents/ — Agent Definitions"]
    D --> F["providers/aave/"]
    D --> G["providers/coingecko-com/"]
    E --> H["agents/crypto-research/"]
    E --> I["agents/defi-monitor/"]
    B --> F
    B --> G
    B --> H
    B --> I
```

The diagram shows how shared lists at the root level flow down to both providers and agents. Providers and agents consume shared lists but never define their own.

### Root Level

The root level contains resources shared across all providers and agents:

| Directory | Content | Consumed By |
|-----------|---------|-------------|
| `_lists/` | Shared value lists (`.mjs` files) | Providers, agents |
| `_shared/` | Shared helper modules | Providers |
| `registry.json` | Catalog manifest | Runtime, CLI |

### Provider Level

Each provider directory contains schemas for a single data source:

| Content | Description |
|---------|-------------|
| `*.mjs` schema files | Tool and resource definitions |
| `prompts/` directory | Model-neutral prompts for the provider's tools |

Providers reference shared lists from the root `_lists/` directory via `main.sharedLists`. They never define their own lists.

### Agent Level

Each agent directory contains a manifest and prompts for a pre-built tool composition:

| Content | Description |
|---------|-------------|
| `agent.mjs` | Agent manifest (`export const main`), metadata, tool dependencies, configuration |
| `prompts/` directory | Agent-specific prompts |
| `skills/` directory | Agent-specific skills |
| `resources/` directory | Agent-specific resources (optional) |

Agents reference tools from providers and shared lists from root. Like providers, agents never define their own shared lists.

### Shared List Ownership Rule

Shared lists are defined **exclusively** at the catalog root level in the `_lists/` directory. Neither providers nor agents define their own lists — they consume from root. This ensures:

- **Single source of truth** — one canonical version of each list
- **No duplication** — providers and agents reference the same list entries
- **Consistent updates** — changing a list at root propagates to all consumers

---

## Validation Rules

The following rules are enforced when loading and validating a catalog.

| Code | Severity | Rule |
|------|----------|------|
| CAT001 | error | `registry.json` must exist in the catalog root directory |
| CAT002 | error | `name` field must match the catalog directory name |
| CAT003 | error | All `shared[].file` paths must resolve to existing files |
| CAT004 | error | All `schemas[].file` paths must resolve to existing files |
| CAT005 | error | All `agents[].manifest` paths must resolve to existing files |
| CAT006 | warning | Orphaned files (exist in the catalog directory but are not listed in `registry.json`) should be reported |
| CAT007 | error | `schemaSpec` must be a valid FlowMCP specification version |

### Rule Details

**CAT001** — The `registry.json` file is the entry point for catalog resolution. Without it, the runtime cannot discover the catalog contents. A directory without `registry.json` is not a catalog.

**CAT002** — The catalog name in the manifest must match the directory name. If the directory is `flowmcp-community/`, then `name` must be `"flowmcp-community"`. This prevents confusion when multiple catalogs coexist.

**CAT003** — Every shared list declared in `shared[]` must have a corresponding `.mjs` file at the declared path. Missing files indicate a broken manifest that was not regenerated after file operations.

**CAT004** — Every schema declared in `schemas[]` must have a corresponding `.mjs` file at the declared path. The validator checks file existence, not schema validity — schema-level validation is handled by the rules in `01-schema-format.md` and `09-validation-rules.md`.

**CAT005** — Every agent declared in `agents[]` must have an `agent.mjs` at the declared path. Missing manifests prevent agent activation.

**CAT006** — Files that exist in the catalog directory tree but are not referenced in `registry.json` may indicate forgotten schemas or leftover files from development. The validator reports these as warnings to help catalog authors maintain a clean manifest.

**CAT007** — The `schemaSpec` field must reference a known FlowMCP specification version. This ensures the runtime applies the correct validation rules and loading behavior for the catalog's contents. Invalid version strings (e.g. `"latest"`, `"2.x"`) are rejected.

### Validation Command

```bash
flowmcp validate-catalog <catalog-directory>
```

The command runs all CAT rules and reports errors and warnings. A catalog with any error-level violations cannot be imported or published.
