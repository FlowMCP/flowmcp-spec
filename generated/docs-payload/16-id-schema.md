---
title: "ID Schema"
description: "A unified ID system for referencing all FlowMCP primitives. IDs MUST be unambiguous, human-readable, and resolvable. This document defines the ID format, component rules, Schema-File-ID, CLI-Adapter..."
spec_version: "4.2.0"
spec_file: "16-id-schema.md"
order: 16
section: "Specification"
normative: true
source_commit: "2d44cb7"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/2d44cb7/spec/v4.2.0/16-id-schema.md"
generated_at: "2026-05-31T17:29:02.778Z"
generated_from: "spec/v4.2.0/16-id-schema.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v4.2.0/16-id-schema.md."
---

> Normative language (MUST/SHOULD/MAY) follows the conventions defined in [Conformance Language](/specification/overview/#conformance-language).

A unified ID system for referencing all FlowMCP primitives. IDs MUST be unambiguous, human-readable, and resolvable. This document defines the ID format, component rules, Schema-File-ID, CLI-Adapter mapping, the No Short Form rule, resolution algorithm, placeholder integration, namespace governance, and validation rules.

---

## Purpose

FlowMCP exposes three MCP primitives — Tools, Resources, and Skills (prompts) — across potentially hundreds of schemas from dozens of providers. As the ecosystem grows, references to these primitives appear in multiple contexts: group definitions, skill placeholders, registry entries, CLI commands, and cross-schema dependencies.

Without a unified ID system, references are ambiguous. Does `simplePrice` refer to a tool, a resource, or a prompt? Which provider owns it? Is `evmChains` a tool name or a shared list?

The ID schema solves this by defining a **structured, human-readable identifier format** that uniquely identifies any primitive in the ecosystem. Every tool, resource, prompt, and shared list has exactly one canonical ID.

```mermaid
flowchart LR
    A[Namespace] --> B[/]
    B --> C[Resource Type]
    C --> D[/]
    D --> E[Name]
    E --> F["coingecko/tool/simplePrice"]
```

The diagram shows the three components of a full ID separated by `/` delimiters, forming a single unambiguous reference string.

---

## Format

The canonical ID format is a three-segment string separated by `/`:

```
namespace/resourceType/name
```

### Complete ID Types

| Type | Format | Slashes | Example |
|------|--------|---------|---------|
| **Schema-File** | `namespace/schema-name` | **1** | `etherscan-io/contracts` |
| Tool | `namespace/tool/name` | 2 | `etherscan-io/tool/getAbi` |
| Resource | `namespace/resource/name` | 2 | `etherscan-io/resource/chainDb` |
| Prompt | `namespace/prompt/name` | 2 | `etherscan-io/prompt/intro` |
| Skill | `namespace/skill/name` | 2 | `etherscan-io/skill/audit` |
| Selection | `namespace/selection/name` | 2 | `evm-research/selection/contract` |
| Agent | `namespace/agent/name` | 2 | `crypto/agent/researcher` |

**Distinguishing rule:** 1 Slash = Schema-File-ID (Container). 2 Slashes = Primitive-ID (Content).

### Full Form Examples

| ID | Description |
|----|-------------|
| `coingecko/tool/simplePrice` | Tool from CoinGecko provider |
| `coingecko/resource/supported-coins` | Resource from CoinGecko |
| `coingecko/prompt/price-comparison` | Prompt from CoinGecko |
| `crypto-research/prompt/token-deep-dive` | Agent prompt |
| `shared/list/evmChains` | Shared list reference |

Each segment serves a distinct purpose: the namespace identifies the owner, the resource type discriminates the primitive kind, and the name identifies the specific item within that namespace and type.

---

## Components

| Component | Pattern | Required | Description |
|-----------|---------|----------|-------------|
| namespace | `^[a-z][a-z0-9-]*$` | Yes | Provider or agent identifier. Lowercase letters, digits, and hyphens. Must start with a letter. |
| resourceType | `tool`, `resource`, `prompt`, `list`, `skill`, `selection`, `agent` | Required | Type discriminator. Always required — Short Form is not supported in v4. |
| name | `^[a-zA-Z][a-zA-Z0-9-]*$` | Yes | Resource name. camelCase for tools and resources, kebab-case for prompts. Must start with a letter. |

### Component Details

#### Namespace

The namespace identifies the owner of the primitive. It is derived from the provider's domain name or agent name and MUST be globally unique within a FlowMCP registry.

```
coingecko          ← provider namespace
etherscan          ← provider namespace
defilama           ← provider namespace
crypto-research    ← agent namespace
shared             ← reserved namespace for shared lists
```

Namespace rules:
- Lowercase letters, digits, and hyphens only
- Must start with a letter
- No dots, underscores, or uppercase characters
- `shared` is a reserved namespace (see [Namespace Rules](#namespace-rules))

#### Resource Type

The resource type discriminates between the seven kinds of addressable primitives in v4.2.0:

| Type | Maps To | Defined In |
|------|---------|-----------|
| `tool` | MCP `server.tool` | `main.tools` |
| `resource` | MCP `server.resource` | `main.resources` |
| `prompt` | MCP `server.prompt` | `main.prompts` |
| `skill` | MCP `server.prompt` (skill variant) | `providers/{ns}/skills/`, `selections/{name}/skills/`, or `agents/{name}/skills/` — never `main.skills` (forbidden) |
| `list` | Shared list | `list.meta.name` |
| `selection` | Selection | `selections/{name}/selection.mjs` |
| `agent` | Agent | `agents/{name}/agent.mjs` |

#### Name

The name identifies the specific primitive within its namespace and type. Naming conventions follow the same rules as schema element names (see [01-schema-format](./01-schema-format.md)):

| Primitive | Convention | Example |
|-----------|-----------|---------|
| Tool | camelCase | `simplePrice`, `getContractAbi` |
| Resource | camelCase | `tokenLookup`, `chainConfig` |
| Prompt | kebab-case | `price-comparison`, `token-deep-dive` |
| Shared List | camelCase | `evmChains`, `countryCodes` |

---

## Schema-File-ID

A schema is a `.mjs` file containing 1–8 Primitives. The Schema-File-ID identifies this file as a whole.

**Format:** `namespace/schema-name` (1 slash)

```
Schema-File-ID:  etherscan-io/contracts
                 └── namespace: etherscan-io
                 └── schema-name: contracts (equals filename without .mjs)

Contains Primitive-IDs:
  etherscan-io/tool/getAbi
  etherscan-io/tool/getContractCreation
  etherscan-io/resource/abiCache
```

### Naming Rules for schema-name

- Kebab-case, only lowercase letters and hyphens
- Thematic, not technical (e.g., `contracts`, `nft`, `defi` — not `schema1`, `tools-v2`)
- For providers with multiple schemas: topic prefix optional (`moralis-nft`, `moralis-defi`)
- Matches exactly the filename without `.mjs`

### Directory Mapping

```
schemas/v4.1.0/providers/etherscan-io/contracts.mjs
                          └── namespace    └── schema-name.mjs
→ Schema-File-ID: etherscan-io/contracts
```

---

## CLI-Adapter

The MCP protocol does not allow slashes in tool names. The CLI maps Spec-IDs to internal MCP tool names:

| External Spec-ID | Internal MCP Tool Name |
|------------------|------------------------|
| `etherscan-io/tool/getAbi` | `getAbi_etherscan-io` |
| `moralis/tool/getTokenBalance` | `getTokenBalance_moralis` |

**Mapping Rule:** `routeName_namespace` (underscore separator, namespace at end). Implemented in `#buildToolName()` in the CLI.

This mapping is internal. Users and agents always use full Spec-IDs.

---

## No Short Form

Short Form is not supported in FlowMCP v4. `flowmcp add getTokenBalance` (without namespace/type) is not allowed.

**Reason:** Ambiguity and hidden data provenance. `moralis/tool/getTokenBalance` is explicit — the namespace immediately shows the data source. For LLMs especially, full Spec-IDs are semantically unambiguous.

All CLI commands use full Spec-IDs.

---

## Resolution

How IDs are resolved to actual files, schemas, and internal references.

### Resolution Algorithm

```mermaid
flowchart TD
    A["Receive ID string"] --> B["Split on /"]
    B --> C{Segment count?}
    C -->|3 segments| D["Full form: namespace / type / name"]
    C -->|2 or less| F["Error: ID001 — full form required"]
    D --> H["Look up namespace in registry"]
    H --> I{Namespace found?}
    I -->|No| J["Error: namespace not registered"]
    I -->|Yes| K["Find schema with matching type + name"]
    K --> L{Match found?}
    L -->|No| M["Error: name not found in namespace"]
    L -->|Yes| N["Return file path + internal reference"]
```

The diagram shows the resolution flow from receiving an ID string through parsing, namespace lookup, and name matching to the final file path reference.

### Resolution Steps

1. **Parse** — split the ID string on `/` to extract segments. Three segments required: namespace, type, name. Any other count: validation error ID001 (Short Form is not supported).
2. **Find** — look up the namespace in the loaded registry or schema catalog. The registry maps namespaces to schema file locations.
3. **Match** — within the namespace, find the schema, tool, resource, or prompt with the matching name and type.
4. **Return** — produce the resolved reference: file path to the schema file and the internal key path (e.g., `main.tools.simplePrice`).

---

## Usage in Placeholders

The ID schema connects to the `{{type:name}}` placeholder syntax used in skill content (see [14-skills](./14-skills.md)). Skill content uses typed placeholders with a `type:` prefix to reference tools, resources, skills, and input parameters.

| Placeholder | Interpretation |
|-------------|---------------|
| `{{tool:getContractAbi}}` | Tool reference — resolved to a tool in the same schema's `main.tools` |
| `{{resource:verifiedContracts}}` | Resource reference — resolved to a resource in the same schema's `main.resources` |
| `{{skill:quick-summary}}` | Skill reference — resolved to a skill registered in the current scope (`selection.skills`, `agent.skills`, or the active namespace's `providers/{ns}/skills/`). `main.skills` is forbidden in v4.0.0. |
| `{{input:address}}` | Input parameter — value provided by the user at runtime |

### Resolution in Skills

When a skill's `content` field contains `{{tool:name}}`, `{{resource:name}}`, or `{{skill:name}}` placeholders, the runtime:

1. Parses the placeholder type prefix to determine the primitive kind
2. Resolves the name to a registered primitive within the same schema
3. Injects the primitive's description or metadata into the rendered content

The ID schema provides the canonical identifier format (`namespace/type/name`) used in registries, group definitions, and cross-schema references. Within skill content, the `{{type:name}}` syntax references primitives scoped to the same schema.

---

## Namespace Rules

Namespaces are the top-level organizational unit. They must be unique within a registry and follow strict governance rules.

### Namespace Assignment

| Source | Namespace Derivation | Example |
|--------|---------------------|---------|
| API Provider | Domain-derived name | `coingecko`, `etherscan`, `defilama` |
| Agent | Agent name | `crypto-research`, `defi-monitor` |
| Shared resources | Reserved `shared` | `shared/list/evmChains` |

### Provider Namespaces

Providers use their domain-derived name as the namespace. The derivation follows these rules:

- Remove the TLD (`.com`, `.io`, `.org`, etc.)
- Lowercase the remainder
- Replace dots with hyphens
- Remove `www.` prefix if present

```
api.coingecko.com   → coingecko
etherscan.io        → etherscan
defillama.com       → defilama
pro-api.coinmarketcap.com → coinmarketcap
```

### Agent Namespaces

Agents use their agent name as the namespace. Agent namespaces follow the same pattern constraints as provider namespaces (`^[a-z][a-z0-9-]*$`).

```
crypto-research     ← agent that performs token research
defi-monitor        ← agent that monitors DeFi protocols
```

### Reserved Namespaces

| Namespace | Purpose |
|-----------|---------|
| `shared` | Shared lists referenced across schemas. Only `list` type is valid under this namespace. |

The `shared` namespace is reserved by the FlowMCP specification. Schema authors MUST NOT use `shared` as a provider or agent namespace.

---

## Validation Rules

| Code | Severity | Rule |
|------|----------|------|
| ID001 | error | ID MUST contain at least one `/` separator |
| ID002 | error | Namespace MUST match `^[a-z][a-z0-9-]*$` |
| ID003 | error | ResourceType MUST be one of: `tool`, `resource`, `prompt`, `list`, `skill`, `selection`, `agent` |
| ID004 | error | Name MUST NOT be empty |
| ID005 | error | Short Form is not supported — full form (`namespace/type/name`) is always required |
| ID006 | error | Full form is required everywhere — no context-based inference |

### Validation Output Examples

```
flowmcp validate --id "coingecko/tool/simplePrice"

  0 errors, 0 warnings
  ID is valid
```

```
flowmcp validate --id "COINGECKO/tool/simplePrice"

  ID002 error   Namespace "COINGECKO" must match ^[a-z][a-z0-9-]*$

  1 error, 0 warnings
  ID is invalid
```

```
flowmcp validate --id "simplePrice"

  ID001 error   ID MUST contain at least one "/" separator

  1 error, 0 warnings
  ID is invalid
```

---

## Examples

### Tool Reference

```
coingecko/tool/simplePrice
```

- **Namespace**: `coingecko` — the CoinGecko provider
- **Type**: `tool` — an MCP tool (API endpoint)
- **Name**: `simplePrice` — the specific tool name (camelCase)

### Resource Reference

```
coingecko/resource/supported-coins
```

- **Namespace**: `coingecko` — the CoinGecko provider
- **Type**: `resource` — an MCP resource (SQLite data)
- **Name**: `supported-coins` — the specific resource

### Prompt Reference

```
crypto-research/prompt/token-deep-dive
```

- **Namespace**: `crypto-research` — an agent namespace
- **Type**: `prompt` — an MCP prompt (skill)
- **Name**: `token-deep-dive` — the specific prompt (kebab-case)

### Shared List Reference

```
shared/list/evmChains
```

- **Namespace**: `shared` — reserved namespace
- **Type**: `list` — a shared list
- **Name**: `evmChains` — the specific list (camelCase)

---

## Relationship to Existing Identifiers

The ID schema unifies several existing identification mechanisms:

| Existing Mechanism | ID Schema Equivalent | Migration |
|-------------------|---------------------|-----------|
| `namespace/file::tool` (group format) | `namespace/tool/name` | Replace `file::tool` with `tool/name` |
| `::resource::namespace/file::query` (group format) | `namespace/resource/name` | Replace prefix + `file::query` with `resource/name` |
| Skill `requires.tools` entries | `namespace/tool/name` | Add namespace prefix |
| Shared list `ref` field | `shared/list/name` | Wrap in `shared/list/` prefix |

The ID schema provides a single, consistent format that replaces these context-specific referencing styles. Backward compatibility with existing formats is maintained during migration — see [08-migration](./08-migration.md).
