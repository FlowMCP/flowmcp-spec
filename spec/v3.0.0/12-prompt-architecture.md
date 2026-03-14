# FlowMCP Specification v3.0.0 — Prompt Architecture

FlowMCP uses a two-tier prompt system to bridge deterministic tools with non-deterministic AI orchestration. **Provider-Prompts** explain how to use a single provider's tools effectively. **Agent-Prompts** compose tools from multiple providers into tested workflows. Both types use the `{{type:name}}` placeholder syntax for references and parameters. Provider-Prompts are defined in `main.prompts` with content loaded from external `.mjs` files via `contentFile`. Agent-Prompts are standalone `.mjs` files with `export const prompt = { ... }` containing inline content.

---

## Purpose

Individual tools are deterministic — same input, same API call. But real-world tasks rarely involve a single tool. Analyzing a token requires price data from CoinGecko, on-chain metrics from Etherscan, and TVL data from DeFi Llama. An agent needs to know not just which tools exist, but in what order to call them, how to pass results between steps, and when to fall back to alternative providers.

Prompts encode this knowledge. They are the non-deterministic layer that teaches LLMs **tool combinatorics** — which tools to call in which order, how to chain outputs to inputs, and what alternatives exist when a provider is unavailable. This is knowledge that would take hours to figure out manually by reading API docs and experimenting with endpoints.

```mermaid
flowchart TD
    A[FlowMCP Prompts] --> B[Provider-Prompts]
    A --> C[Agent-Prompts]

    B --> D["Single namespace<br/>Model-neutral<br/>Any LLM can use them"]
    C --> E["Multi-provider<br/>Model-specific<br/>Tested with one LLM"]

    D --> F["How to use CoinGecko tools effectively"]
    E --> G["How to combine CoinGecko + Etherscan + DeFi Llama"]
```

The diagram shows the two tiers: Provider-Prompts are scoped to one namespace and work with any model. Agent-Prompts span multiple providers and are optimized for a specific model.

---

## Provider-Prompt vs Agent-Prompt

The two prompt types serve different purposes and operate at different levels of the architecture.

| Aspect | Provider-Prompt | Agent-Prompt |
|--------|----------------|--------------|
| Scope | Single namespace | Multi-provider |
| Model dependency | Model-neutral — works with any LLM | Model-specific — tested against a particular LLM |
| Scoping field | `namespace` | `agent` |
| Tested with | Any model (no `testedWith` field) | Specific model (`testedWith` required) |
| Location in catalog | `providers/{namespace}/prompts/` | `agents/{agent-name}/prompts/` |
| Tool references | Own namespace tools only (bare names in `dependsOn`) | Tools from any provider (full ID format in `dependsOn`) |
| Primary use case | Teach effective use of one provider's API | Orchestrate multi-provider workflows |

### When to Use Which

**Provider-Prompts** are the right choice when the instructions are about a single API — how to paginate CoinGecko results, how to interpret Etherscan's response codes, or how to combine two endpoints from the same provider for richer data.

**Agent-Prompts** are the right choice when the instructions span multiple providers — combining CoinGecko pricing with Etherscan contract data and DeFi Llama TVL metrics into a unified analysis workflow.

---

## Provider-Prompt vs Agent-Prompt: Structural Difference

Provider-Prompts and Agent-Prompts differ structurally in how they handle content:

| Aspect | Provider-Prompt | Agent-Prompt |
|--------|----------------|--------------|
| **Definition location** | In `main.prompts` (schema file) | Standalone `.mjs` file |
| **Content location** | External file via `contentFile` | Inline in the file (`content` field) |
| **Export** | Part of `main` export | `export const prompt = { ... }` |

**Why the split?** Provider-Prompt definitions are compact metadata that belongs in the schema's `main` block (hashable, JSON-serializable). The actual prompt content is long text that would clutter the schema — so it lives in a separate file. Agent-Prompts are already standalone files, so content stays inline.

### Why `.mjs` Files

Prompt files (both content files and Agent-Prompt files) use the same `.mjs` format as schema and skill files for three reasons:

1. **Consistent loading.** The runtime loads prompts via `import()` — the same mechanism used for schemas and skills. No separate parser needed.
2. **Static security scanning.** The same `SecurityScanner` that checks schema files also checks prompt files. The zero-import policy applies uniformly.
3. **Multiline content.** Template literals handle multiline prompt content naturally without escaping issues.

---

## Provider-Prompt Format

A Provider-Prompt is scoped to a single namespace. It describes how to use that provider's tools effectively, without assuming any specific LLM model. The definition lives in `main.prompts`, and the content is loaded from an external file via `contentFile`.

### Definition in `main.prompts`

```javascript
export const main = {
    namespace: 'coingecko',
    tools: { /* ... */ },
    resources: { /* ... */ },
    prompts: {
        priceComparison: {
            name: 'price-comparison',
            version: 'flowmcp-prompt/1.0.0',
            namespace: 'coingecko',
            description: 'Compare prices across multiple coins using CoinGecko data',
            dependsOn: [ 'simplePrice', 'coinMarkets' ],
            references: [],
            contentFile: './prompts/price-comparison.mjs'
        }
    }
}
```

### Content File

The `contentFile` field points to a separate `.mjs` file that exports the prompt content:

```javascript
// prompts/price-comparison.mjs

export const content = `
Use {{tool:coingecko/simplePrice}} to fetch current prices for the requested coins.
Then use {{tool:coingecko/coinMarkets}} to get market cap data.

Compare the following metrics for {{input:coins}}:
- Current price in {{input:currency}}
- 24h price change
- Market cap ranking

If the user asks for historical data, note that simplePrice only returns current
prices. Suggest using coinMarkets with the order parameter for trending analysis.
`
```

**Content file rules:**

- Export must be `export const content` (not `export const prompt`)
- No imports allowed (zero-import policy)
- `{{type:name}}` placeholder syntax for references and parameters
- Content must not be empty

### Provider-Prompt Characteristics

- **`namespace` field** identifies the provider. Must match the provider's namespace in the catalog.
- **`dependsOn` uses bare tool names** — since the scope is a single namespace, fully qualified IDs are unnecessary. `'simplePrice'` is sufficient because it can only refer to `coingecko/tool/simplePrice`.
- **`references` array** lists other prompts to compose. Empty array when none. Required field.
- **`contentFile` field** is a relative path to the `.mjs` file containing the prompt content.
- **No `testedWith` field** — Provider-Prompts are model-neutral. Any LLM can benefit from them.
- **No `agent` field** — the `namespace` field indicates this is a Provider-Prompt.
- **`{{type:name}}` references** in content use the type prefix to distinguish tool references (`{{tool:coingecko/simplePrice}}`), resource references (`{{resource:name}}`), and input parameters (`{{input:coins}}`). References must target tools within the same namespace.

---

## Agent-Prompt Format

An Agent-Prompt is scoped to an agent. It describes multi-provider workflows and is tested against a specific LLM model.

```javascript
const content = `
First, get the contract details using {{tool:etherscan/getContractAbi}} for address {{input:address}}.
Then fetch pricing data using {{tool:coingecko/simplePrice}}.

For price comparison context, follow the approach in {{prompt:coingecko/price-comparison}}.

Analyze the {{input:token}} considering:
- Contract verification status
- Current price and volume
- Historical price trends

If Etherscan returns an unverified contract, skip the ABI analysis and focus on
the pricing data. Use {{tool:coingecko/coinMarkets}} as a fallback for additional
market context.
`


export const prompt = {
    name: 'token-deep-dive',
    version: 'flowmcp-prompt/1.0.0',
    agent: 'crypto-research',
    description: 'Deep analysis of a token across multiple data sources',
    testedWith: 'anthropic/claude-sonnet-4-5-20250929',
    dependsOn: [
        'coingecko/tool/simplePrice',
        'coingecko/tool/coinMarkets',
        'etherscan/tool/getContractAbi'
    ],
    references: [ 'coingecko/prompt/price-comparison' ],
    content
}
```

### Agent-Prompt Characteristics

- **`agent` field** identifies the owning agent. Must match an agent name in the catalog.
- **`dependsOn` uses full ID format** — since Agent-Prompts span multiple providers, each tool reference must be unambiguous. `'coingecko/tool/simplePrice'` specifies both the namespace and the tool name.
- **`testedWith` is required** — documents which LLM model the prompt was tested and optimized for.
- **No `namespace` field** — the `agent` field indicates this is an Agent-Prompt.
- **`references` array** allows including content from other prompts (see [Composable Prompts](#composable-prompts)).
- **`{{type:name}}` references** in `content` use type-prefixed placeholders to reference tools (`{{tool:...}}`), prompts (`{{prompt:...}}`), and parameters (`{{input:...}}`) across namespaces.

---

## Prompt Fields

The `export const prompt` object contains all metadata and instructions. Some fields are shared across both types, others are exclusive to one type.

| Field | Type | Provider-Prompt | Agent-Prompt | Description |
|-------|------|----------------|--------------|-------------|
| `name` | `string` | Required | Required | Kebab-case identifier. Must match `^[a-z][a-z0-9-]*$`. |
| `version` | `string` | Required | Required | Must be `flowmcp-prompt/1.0.0`. |
| `namespace` | `string` | Required | Forbidden | Provider namespace this prompt belongs to. |
| `agent` | `string` | Forbidden | Required | Agent name this prompt belongs to. |
| `description` | `string` | Required | Required | What the prompt teaches. Maximum 1024 characters. |
| `testedWith` | `string` | Forbidden | Required | OpenRouter model ID (must contain `/`). |
| `dependsOn` | `string[]` | Required | Required | Tool dependencies. Bare names for Provider-Prompts, full IDs for Agent-Prompts. |
| `references` | `string[]` | Required | Required | Other prompts to compose. Full ID format. Empty array `[]` when none. |
| `contentFile` | `string` | Required | Forbidden | Relative path to the content `.mjs` file. |
| `content` | `string` | Forbidden | Required | Prompt instructions with `{{type:name}}` placeholders. Must not be empty. |

**Key structural difference:** Provider-Prompts use `contentFile` (content in external file), Agent-Prompts use `content` (content inline). These fields are mutually exclusive — a prompt has either `contentFile` or `content`, never both.

### Field Details

#### `name`

The prompt name is the primary identifier. It is used in the catalog, in `{{prompt:name}}` placeholder references, and in MCP prompt registration. Only lowercase letters, numbers, and hyphens are allowed.

```javascript
// Valid
name: 'price-comparison'
name: 'token-deep-dive'
name: 'quick-check'

// Invalid
name: 'Price-Comparison'    // uppercase not allowed
name: '3d-analysis'         // must start with letter
name: 'my_prompt'           // underscore not allowed
```

#### `version`

The version string identifies the prompt format specification. In this release, the only valid value is `'flowmcp-prompt/1.0.0'`. The prefix `flowmcp-prompt/` distinguishes prompt versioning from schema versioning (`3.x.x`), skill versioning (`flowmcp-skill/1.0.0`), and shared list versioning.

```javascript
// Valid
version: 'flowmcp-prompt/1.0.0'

// Invalid
version: '1.0.0'                  // missing prefix
version: 'flowmcp-prompt/2.0.0'   // version 2.0.0 does not exist yet
version: 'flowmcp-skill/1.0.0'    // wrong prefix (this is a skill version)
```

#### `namespace` vs `agent`

These two fields are mutually exclusive. Exactly one must be set — not both, not neither. The presence of `namespace` marks a Provider-Prompt. The presence of `agent` marks an Agent-Prompt.

```javascript
// Provider-Prompt
namespace: 'coingecko'
// agent field must NOT be present

// Agent-Prompt
agent: 'crypto-research'
// namespace field must NOT be present
```

#### `testedWith`

Required for Agent-Prompts, forbidden for Provider-Prompts. Uses OpenRouter model syntax, which always contains a `/` separator between organization and model name.

```javascript
// Valid
testedWith: 'anthropic/claude-sonnet-4-5-20250929'
testedWith: 'openai/gpt-4o'
testedWith: 'google/gemini-2.0-flash'

// Invalid
testedWith: 'claude-sonnet'      // missing organization prefix
testedWith: 'gpt-4o'             // must contain /
```

The `testedWith` field documents which model the prompt was optimized for. Other models may work but are not guaranteed to produce the same quality of results. This is especially relevant for complex multi-step workflows where models differ in their ability to chain tool calls and handle intermediate results.

#### `dependsOn`

Lists the tools that the prompt references. Every tool mentioned in the prompt's `content` via `{{tool:...}}` placeholders should appear in `dependsOn`. This enables validation — the runtime checks that all declared dependencies resolve to existing tools.

**Provider-Prompts** use bare tool names (same namespace is implied):

```javascript
// Provider-Prompt for coingecko
dependsOn: [ 'simplePrice', 'coinMarkets' ]
// Resolves to: coingecko/tool/simplePrice, coingecko/tool/coinMarkets
```

**Agent-Prompts** use full ID format (namespace is required):

```javascript
// Agent-Prompt spanning coingecko and etherscan
dependsOn: [
    'coingecko/tool/simplePrice',
    'coingecko/tool/coinMarkets',
    'etherscan/tool/getContractAbi'
]
```

#### `references`

A required array of prompt IDs that this prompt composes. Use an empty array `[]` when the prompt does not reference other prompts. See [Composable Prompts](#composable-prompts) for full details.

```javascript
// No references
references: []

// Agent-Prompt referencing a Provider-Prompt
references: [ 'coingecko/prompt/price-comparison' ]
```

#### `contentFile` (Provider-Prompt only)

A relative path to the `.mjs` file containing the prompt content. Required for Provider-Prompts, forbidden for Agent-Prompts. The file must export `export const content = '...'`.

```javascript
// Valid
contentFile: './prompts/price-comparison.mjs'
contentFile: './prompts/about.mjs'

// Invalid
contentFile: './prompts/about.js'     // must be .mjs
contentFile: '/absolute/path.mjs'     // must be relative
```

The content file is loaded via `import()` at schema load-time. The runtime reads the `content` named export from the file.

#### `content` (Agent-Prompt only)

The prompt instructions that the AI agent follows. Contains `{{type:name}}` placeholders for tool references and user parameters. Must not be empty. Required for Agent-Prompts, forbidden for Provider-Prompts. See [Placeholder Syntax](#placeholder-syntax) for the full reference.

---

## Placeholder Syntax

Prompt content uses the `{{type:name}}` placeholder syntax. The **type prefix** (before the colon) determines the category, and the **name** (after the colon) identifies the target. This is the same syntax used in Skills (`14-skills.md`), providing a unified placeholder system across all FlowMCP content primitives.

### Two Categories

Placeholders fall into two categories based on their type prefix:

| Category | Type Prefixes | Purpose |
|----------|---------------|---------|
| **References** | `tool:`, `resource:`, `prompt:` | Resolved at load-time against the catalog to a registered tool, resource, or prompt |
| **Parameters** | `input:` | Value provided by the user at runtime |

### Reference Placeholders

Reference placeholders point to registered primitives in the catalog:

| Placeholder | Example | Meaning |
|-------------|---------|---------|
| `{{tool:name}}` | `{{tool:simplePrice}}` | Tool in the same namespace/agent |
| `{{tool:namespace/name}}` | `{{tool:coingecko/simplePrice}}` | Tool in an explicit namespace |
| `{{resource:name}}` | `{{resource:placesDb}}` | Resource in the same namespace/agent |
| `{{resource:namespace/name}}` | `{{resource:etherscan/verifiedContracts}}` | Resource in an explicit namespace |
| `{{prompt:name}}` | `{{prompt:about}}` | Prompt in the same namespace/agent |
| `{{prompt:namespace/name}}` | `{{prompt:coingecko/price-comparison}}` | Prompt in an explicit namespace |

**Namespace rule:** Without `/` after the type prefix, the reference targets the own schema or agent. With `/`, the reference targets an explicit namespace.

### Parameter Placeholders

Parameter placeholders represent user-input values:

```
{{input:token}}            <- user provides a token symbol
{{input:address}}          <- user provides a contract address
{{input:currency}}         <- user provides a currency code
{{input:timeframeDays}}    <- user provides a number of days
```

### Example

```
Analyze the token {{input:token}} on chain {{input:chainId}}.

First, fetch the current price using {{tool:coingecko/simplePrice}}.
Then retrieve the contract ABI via {{tool:etherscan/getContractAbi}}.
```

In this example, `{{input:token}}` and `{{input:chainId}}` are parameters (type prefix `input:`). `{{tool:coingecko/simplePrice}}` and `{{tool:etherscan/getContractAbi}}` are references (type prefix `tool:`).

### Edge Case: Schema Parameter Placeholders

The `{{type:name}}` content placeholder syntax coexists with schema parameter placeholders like `{{USER_PARAM}}` or `{{DYNAMIC_SQL}}` used in `main.tools` and `main.resources` blocks. There is no conflict because the content renderer only matches patterns with a **colon** (`:`):

| Syntax | Context | Matched by Content Renderer? |
|--------|---------|------------------------------|
| `{{tool:simplePrice}}` | Prompt/Skill `content` | Yes — has colon |
| `{{input:token}}` | Prompt/Skill `content` | Yes — has colon |
| `{{USER_PARAM}}` | Schema `main` blocks | No — no colon, UPPER_CASE |
| `{{DYNAMIC_SQL}}` | Schema `main` blocks | No — no colon, UPPER_CASE |

**Regex for Content Renderer:** `\{\{(tool|resource|skill|prompt|input):([a-zA-Z/]+)\}\}`

### Migration Note

Earlier versions of this specification used `[[...]]` bracket syntax for prompt placeholders (e.g., `[[coingecko/tool/simplePrice]]`, `[[token]]`). This has been replaced with the unified `{{type:name}}` syntax to align prompts with the same placeholder system used in Skills (`14-skills.md`).

---

## Tool Combinatorics

The primary purpose of prompts is teaching LLMs **tool combinatorics** — the knowledge of how to combine multiple tools into effective workflows. This includes:

### Call Order

Which tools to call first, second, third. Some tools depend on output from previous calls:

```
First call {{tool:coingecko/simplePrice}} to get the current price.
Use the coin ID from the response to call {{tool:coingecko/coinMarkets}}
for detailed market data.
```

### Result Passing

How to extract values from one tool's response and pass them to the next:

```
Extract the "id" field from {{tool:coingecko/coinList}} response.
Pass that ID as the "ids" parameter to {{tool:coingecko/simplePrice}}.
```

### Fallback Strategies

What to do when a tool fails or returns incomplete data:

```
If {{tool:etherscan/getContractAbi}} returns "Contract source code not verified",
skip the ABI analysis and use {{tool:etherscan/getContractCreation}} instead
to get basic contract metadata.
```

### Cross-Provider Enrichment

How to combine data from different providers for richer analysis:

```
Get the token price from {{tool:coingecko/simplePrice}}.
Get the contract details from {{tool:etherscan/getContractAbi}}.
Get the protocol TVL from {{tool:defillama/getTvlProtocol}}.

Cross-reference: if the token has high TVL but low price, it may indicate
a yield farming opportunity. If the contract is unverified but has high
volume, flag it as a potential risk.
```

This combinatoric knowledge is what would take hours to acquire manually — reading multiple API docs, experimenting with endpoints, discovering which response fields map to which request parameters, and building mental models of how different data sources complement each other.

---

## Composable Prompts

The `references[]` array enables prompt composition — one prompt can incorporate another prompt's content without duplication.

### How It Works

When a prompt declares `references`, the runtime loads each referenced prompt and makes its content available to the AI agent alongside the primary prompt. Referenced prompts are **not** inlined into the content — they are provided as additional context that the agent can draw from.

```javascript
export const prompt = {
    name: 'token-deep-dive',
    agent: 'crypto-research',
    // ...
    references: [ 'coingecko/prompt/price-comparison' ],
    content: `
Perform a deep analysis of {{input:token}}.

For price comparison methodology, follow {{prompt:coingecko/price-comparison}}.

Then add on-chain analysis using {{tool:etherscan/getContractAbi}}.
`
}
```

When the runtime renders `token-deep-dive`, it also loads `coingecko/prompt/price-comparison` and provides both to the agent.

### Composition Rules

```mermaid
flowchart LR
    A["Agent-Prompt<br/>token-deep-dive"] -->|references| B["Provider-Prompt<br/>price-comparison"]
    B -.->|"NOT allowed to reference"| C["Another Prompt"]

    style C stroke-dasharray: 5 5
```

The diagram shows that composition is limited to one level. The referencing prompt can include another prompt, but that referenced prompt cannot itself reference further prompts.

| Rule | Description |
|------|-------------|
| **One level deep** | A referenced prompt must not itself have `references[]`. No chains: A -> B -> C is forbidden. |
| **Agent -> Provider** | Agent-Prompts can reference Provider-Prompts (cross-scope). |
| **Provider -> Provider** | Provider-Prompts can reference other prompts within the same namespace only. |
| **Provider -> Agent** | Provider-Prompts cannot reference Agent-Prompts (Agent-Prompts are model-specific, Provider-Prompts are model-neutral). |
| **Full ID format** | All entries in `references[]` use the full ID format: `namespace/prompt/name` or `agent/prompt/name`. |

### Why One Level Deep

The one-level restriction prevents three problems:

1. **Circular references** — prompt A references prompt B references prompt A
2. **Context explosion** — each level adds content, which can exceed LLM context limits
3. **Unpredictable behavior** — deeply nested prompts become difficult to reason about and test

---

## `testedWith` Field

The `testedWith` field documents which LLM model an Agent-Prompt was tested and optimized for. It uses the OpenRouter model identifier format.

### Format

The value must contain a `/` separator between the organization and model name:

```
organization/model-name
```

### Examples

| Value | Organization | Model |
|-------|-------------|-------|
| `anthropic/claude-sonnet-4-5-20250929` | Anthropic | Claude Sonnet 4.5 |
| `openai/gpt-4o` | OpenAI | GPT-4o |
| `google/gemini-2.0-flash` | Google | Gemini 2.0 Flash |
| `meta-llama/llama-3.1-405b-instruct` | Meta | Llama 3.1 405B |

### Implications

- **Required for Agent-Prompts** — every Agent-Prompt must declare which model it was tested with.
- **Forbidden for Provider-Prompts** — Provider-Prompts are model-neutral by design.
- **Not a restriction** — the field documents testing history, not a runtime requirement. Other models may work, but the prompt author has only verified behavior with the declared model.
- **Model-specific optimizations** — different models handle tool chaining, JSON parsing, and multi-step reasoning differently. An Agent-Prompt tested with Claude may structure instructions differently than one tested with GPT-4o.

---

## Directory Structure

Provider-Prompt content files are stored in `prompts/` subdirectories alongside their provider's schema files. Agent-Prompt files are stored alongside their agent's manifest.

```
providers/
+-- coingecko/
    +-- simple-price.mjs              # Schema with tools + prompt definitions in main.prompts
    +-- coin-markets.mjs              # Schema with tools
    +-- prompts/
    |   +-- about.mjs                 # Content file for main.prompts.about
    |   +-- price-comparison.mjs      # Content file for main.prompts.priceComparison
    +-- resources/
        +-- coingecko-metadata.md     # Markdown resource (inline)

agents/
+-- crypto-research/
    +-- agent.mjs                      # Agent manifest (with about definition)
    +-- prompts/
        +-- token-deep-dive.mjs        # Agent-Prompt (definition + content in one file)
```

### File Organization Rules

| Level | Directory | Contains |
|-------|-----------|----------|
| Provider | `providers/{namespace}/prompts/` | Content files for Provider-Prompts (referenced via `contentFile`) |
| Agent | `agents/{agent-name}/prompts/` | Agent-Prompt files (standalone, definition + content) |

- Provider-Prompt content filenames use kebab-case and match the prompt's `name` field: `price-comparison.mjs` contains the content for `name: 'price-comparison'`.
- Provider-Prompt definitions live in the schema's `main.prompts`. Content files live in `prompts/`.
- Agent-Prompts are standalone files with both definition and content.

---

## The `about` Convention

### Reserved Prompt Name

`about` is a **reserved prompt name** as a convention (SHOULD, not MUST) for both Provider-Prompts and Agent-Prompts. It serves as the entry point to a namespace or agent — what it offers, how its tools relate, what resources are available.

| Aspect | Provider-Schema | Agent-Manifest |
|--------|----------------|----------------|
| **Name** | `about` — reserved | `about` — reserved |
| **Requirement** | SHOULD | SHOULD |
| **Where** | `main.prompts.about` | In the agent manifest |
| **When loaded** | Only on request | Only on request |
| **Purpose** | Entry point to the namespace | Entry point to the agent |

### Provider `about`

```javascript
// In main.prompts
about: {
    name: 'about',
    version: 'flowmcp-prompt/1.0.0',
    namespace: 'pagespeed',
    description: 'Overview of PageSpeed Insights — tools, resources, workflows',
    dependsOn: [ 'runPagespeedAnalysis', 'getCoreWebVitals' ],
    references: [],
    contentFile: './prompts/about.mjs'
}
```

### Agent `about`

```javascript
// In agent manifest or as separate file
about: {
    name: 'about',
    version: 'flowmcp-prompt/1.0.0',
    agent: 'competitive-analysis',
    description: 'Overview of Competitive Analysis Agent — what it does, which providers it uses',
    testedWith: 'anthropic/claude-opus-4-6',
    dependsOn: [ 'tranco/resource/rankingDb', 'pagespeed/tool/runPagespeedAnalysis' ],
    references: [],
    content: '...'
}
```

### What `about` Is NOT

- **Not a repetition** — does not restate tool descriptions that are already available
- **Not a tutorial** — not a step-by-step guide for beginners
- **Not API documentation** — that is what Markdown resources are for

`about` is like an **index file**: entry point, context, relationships. What can this namespace/agent do? How do the tools relate? Are there resources?

---

## Prompts vs Skills

Prompts and Skills are both non-deterministic guidance for AI agents, but they serve different purposes and use different formats. Skills remain as defined in `14-skills.md` — this document does not replace them.

| Aspect | Prompts (`12-prompt-architecture.md`) | Skills (`14-skills.md`) |
|--------|---------------------------------------|------------------------|
| Export | `export const prompt` | `export const skill` |
| Version prefix | `flowmcp-prompt/1.0.0` | `flowmcp-skill/1.0.0` |
| Scope | Provider-level or Agent-level | Schema-level |
| Placeholder syntax | `{{type:name}}` (unified syntax) | `{{type:name}}` (unified syntax) |
| Tool references | `{{tool:namespace/name}}` or `{{tool:name}}` | `{{tool:name}}` (bare names within same schema) |
| Input declaration | Parameters as `{{input:paramName}}` in content | Typed `input` array with key, type, description, required |
| Cross-provider | Agent-Prompts can span providers | Not directly (only via group-level skills) |
| Model binding | Agent-Prompts require `testedWith` | No model binding |
| Composition | `references[]` array | `{{skill:name}}` placeholder |
| Primary purpose | Tool combinatorics and workflow guidance | Structured instructions with typed inputs |

Skills are schema-scoped instruction sets with explicit input typing and structured metadata. Prompts are catalog-level guidance focused on tool combinatorics and cross-provider workflows. Both map to the MCP `server.prompt` primitive.

---

## Validation Rules

### Structural Rules

| Code | Severity | Rule |
|------|----------|------|
| PRM001 | error | `name` is required, must be a string, must match `^[a-z][a-z0-9-]*$` |
| PRM002 | error | `version` is required and must be `'flowmcp-prompt/1.0.0'` |
| PRM003 | error | Exactly one of `namespace` or `agent` must be set (not both, not neither) |
| PRM004 | error | `testedWith` is required when `agent` is set, forbidden when `namespace` is set |
| PRM005 | error | `testedWith` value must contain `/` (OpenRouter model ID format) |
| PRM006 | error | Each `dependsOn` entry must resolve to an existing tool in the catalog |
| PRM007 | error | Each `references[]` entry must resolve to an existing prompt in the catalog |
| PRM008 | error | Referenced prompts must not themselves have `references[]` (one level deep only) |
| PRM009 | error | `{{type:name}}` reference placeholders in prompt content must resolve to registered primitives |
| PRM010 | error | Agent-Prompts: `content` is required and must be a non-empty string. Provider-Prompts: `content` is forbidden. |
| PRM011 | error | Provider-Prompts: `contentFile` is required, must be a relative path ending with `.mjs`. Agent-Prompts: `contentFile` is forbidden. |
| PRM012 | error | Content file must export `export const content` (not `export const prompt`). |
| PRM013 | error | `references` is required and must be an array (empty `[]` when no references). |

### Rule Details

**PRM001** — The name is the primary identifier. It appears in MCP prompt listings, ID references, and filenames. Kebab-case is enforced to ensure URL-safe, filesystem-safe identifiers.

**PRM002** — The version string enables the validator to apply the correct rule set. Future versions of the prompt format will increment this value.

**PRM003** — A prompt must be either a Provider-Prompt (has `namespace`) or an Agent-Prompt (has `agent`). Having both or neither is invalid. This rule enforces the two-tier architecture.

**PRM004** — Provider-Prompts are model-neutral, so `testedWith` would be misleading. Agent-Prompts are model-specific, so `testedWith` is mandatory to document the testing context.

**PRM005** — OpenRouter model IDs always contain a `/` between organization and model name (e.g., `anthropic/claude-sonnet-4-5-20250929`). A value without `/` indicates an incorrect format.

**PRM006** — Every tool listed in `dependsOn` must exist in the catalog. For Provider-Prompts, bare names are resolved within the prompt's namespace. For Agent-Prompts, full IDs are resolved across the catalog.

**PRM007** — Every prompt listed in `references[]` must exist in the catalog. References use full ID format (`namespace/prompt/name`).

**PRM008** — If prompt A references prompt B, prompt B must not have its own `references[]` array. This enforces one-level-deep composition.

**PRM009** — All `{{tool:...}}`, `{{resource:...}}`, and `{{prompt:...}}` reference placeholders in the `content` field must resolve to registered tools, resources, or prompts. Parameter placeholders (`{{input:...}}`) are not validated against the catalog — they are user inputs.

**PRM010** — Agent-Prompts need inline content. Provider-Prompts get their content from an external file via `contentFile`.

**PRM011** — Provider-Prompts must declare where their content lives via `contentFile`. The file must be a relative `.mjs` path. Agent-Prompts must not have `contentFile` because their content is inline.

**PRM012** — Content files must use `export const content` as the named export. Using `export const prompt` would create ambiguity with the Agent-Prompt export pattern.

**PRM013** — The `references` field is always required. When a prompt does not compose other prompts, an empty array `[]` must be provided. This makes the absence of references explicit rather than ambiguous.

### Validation Output Examples

```
flowmcp validate providers/coingecko/prompts/price-comparison.mjs

  0 errors, 0 warnings
  Prompt is valid
```

```
flowmcp validate agents/crypto-research/prompts/token-deep-dive.mjs

  PRM004 error   Agent-Prompt "token-deep-dive" requires testedWith field
  PRM006 error   dependsOn entry "etherscan/tool/nonExistent" does not resolve

  2 errors, 0 warnings
  Prompt is invalid
```

```
flowmcp validate providers/coingecko/prompts/bad-prompt.mjs

  PRM003 error   Prompt "bad-prompt" has both namespace and agent set
  PRM005 error   testedWith "claude-sonnet" must contain /

  2 errors, 0 warnings
  Prompt is invalid
```

---

## Loading

Prompts are loaded as part of the catalog loading sequence. Provider-Prompts are loaded when their provider's schemas are loaded. Agent-Prompts are loaded when their agent's manifest is loaded.

### Loading Sequence

```mermaid
flowchart TD
    A{Prompt type?} -->|Provider| B["Read main.prompts definitions"]
    A -->|Agent| C["Scan agents/{name}/prompts/ directory"]

    B --> D["Validate fields — PRM001-PRM013"]
    C --> E["Read each .mjs file as string"]
    E --> F[Static security scan]
    F --> G{"Security violations?"}
    G -->|Yes| H[Reject with SEC error]
    G -->|No| I["Dynamic import()"]
    I --> J[Extract prompt export]
    J --> D

    D --> K{"Has contentFile?"}
    K -->|Yes| L["Load content file via import()"]
    L --> M["Extract content export"]
    K -->|No| N["Use inline content"]

    M --> O{Provider or Agent?}
    N --> O
    O -->|Provider| P[Validate dependsOn against namespace tools]
    O -->|Agent| Q[Validate dependsOn against catalog tools]
    P --> R[Validate references against catalog prompts]
    Q --> R
    R --> S[Validate placeholder references in content]
    S --> T[Register as MCP prompt]
```

The diagram shows how prompt loading works for both types. Provider-Prompts are loaded from `main.prompts` definitions with content from external files. Agent-Prompts are loaded from standalone files. Both go through field validation and reference resolution.

### Security

Prompt files are subject to the same zero-import security model as schema and skill files. The static security scan checks for all forbidden patterns listed in `05-security.md` before the file is loaded via `import()`.

```javascript
// Allowed
const content = `Instructions with {{tool:coingecko/simplePrice}}...`
export const prompt = { /* metadata */ }

// Forbidden — import statement (SEC001)
import { something } from 'somewhere'

// Forbidden — require call (SEC002)
const lib = require( 'lib' )
```

---

## Complete Examples

### Provider-Prompt: CoinGecko Price Comparison

**Schema definition** (in `providers/coingecko/simple-price.mjs`):

```javascript
export const main = {
    namespace: 'coingecko',
    tools: { /* ... */ },
    prompts: {
        priceComparison: {
            name: 'price-comparison',
            version: 'flowmcp-prompt/1.0.0',
            namespace: 'coingecko',
            description: 'Compare prices, market caps, and volumes across multiple coins using CoinGecko data',
            dependsOn: [ 'simplePrice', 'coinMarkets' ],
            references: [],
            contentFile: './prompts/price-comparison.mjs'
        }
    }
}
```

**Content file** (`providers/coingecko/prompts/price-comparison.mjs`):

```javascript
export const content = `
Use {{tool:coingecko/simplePrice}} to fetch current prices for the requested coins.
Pass the coin IDs as a comma-separated string in the "ids" parameter and the target
currency in the "vs_currencies" parameter.

Then use {{tool:coingecko/coinMarkets}} to get detailed market data. Pass the same
currency as "vs_currency" and set "order" to "market_cap_desc" for ranked results.

Compare the following metrics for {{input:coins}}:
- Current price in {{input:currency}}
- 24h price change percentage
- Market cap ranking
- 24h trading volume

Present the comparison as a Markdown table with one row per coin. Sort by market
cap descending. Include a summary paragraph highlighting the top performer and any
coins with unusual 24h volume relative to market cap.

If simplePrice returns a coin ID that coinMarkets does not recognize, skip that
coin in the comparison table and note it at the bottom of the report.
`
```

### Agent-Prompt: Cross-Provider Token Analysis

**File:** `agents/crypto-research/prompts/token-deep-dive.mjs`

```javascript
const content = `
First, get the contract details using {{tool:etherscan/getContractAbi}} for address {{input:address}}.
If the contract is verified, parse the ABI to identify the token standard (ERC-20, ERC-721, etc.)
and extract key function signatures.

Then fetch pricing data using {{tool:coingecko/simplePrice}} with the token's CoinGecko ID.
If the token ID is unknown, try searching with the contract address or token symbol.

For price comparison context, follow the approach in {{prompt:coingecko/price-comparison}}.
Compare the target token against the top 3 tokens in the same category.

Use {{tool:coingecko/coinMarkets}} to get 24h volume and market cap data for broader context.

Analyze {{input:token}} considering:
- Contract verification status (from Etherscan)
- Token standard and key functions (from ABI)
- Current price and 24h change (from CoinGecko)
- Trading volume relative to market cap
- Market cap ranking in category

If {{tool:etherscan/getContractAbi}} returns "Contract source code not verified",
note this as a risk factor but continue with the price analysis. Unverified contracts
are not necessarily malicious but warrant caution.

Produce a Markdown report with sections: Contract Overview, Price Analysis,
Market Position, and Risk Assessment.
`


export const prompt = {
    name: 'token-deep-dive',
    version: 'flowmcp-prompt/1.0.0',
    agent: 'crypto-research',
    description: 'Deep analysis of a token across multiple data sources combining on-chain and market data',
    testedWith: 'anthropic/claude-sonnet-4-5-20250929',
    dependsOn: [
        'coingecko/tool/simplePrice',
        'coingecko/tool/coinMarkets',
        'etherscan/tool/getContractAbi'
    ],
    references: [ 'coingecko/prompt/price-comparison' ],
    content
}
```

### What These Examples Demonstrate

1. **Provider-Prompt** — `price-comparison` definition lives in `main.prompts`, content in an external file via `contentFile`. Scoped to `coingecko`, uses bare tool names in `dependsOn`.
2. **Agent-Prompt** — `token-deep-dive` is a standalone file with inline `content`. Scoped to `crypto-research`, uses full IDs in `dependsOn`, requires `testedWith`.
3. **Placeholder syntax** — `{{tool:coingecko/simplePrice}}` is a tool reference (type prefix `tool:`), `{{input:token}}` is a parameter (type prefix `input:`).
4. **Composable prompts** — `token-deep-dive` references `coingecko/prompt/price-comparison` via the `references` array.
5. **Tool combinatorics** — both prompts describe call order, result passing, and fallback strategies.
6. **Fallback instructions** — both prompts handle edge cases (unrecognized coin IDs, unverified contracts).
7. **Content separation** — Provider-Prompt uses `export const content` in a separate file. Agent-Prompt defines `content` inline above the export.
8. **Zero imports** — no file contains import statements.
9. **`references` always present** — Provider-Prompt has `references: []`, Agent-Prompt has `references: [ 'coingecko/prompt/price-comparison' ]`.

### File Structure

```
providers/
+-- coingecko/
    +-- simple-price.mjs              # Schema with main.prompts definitions
    +-- coin-markets.mjs
    +-- prompts/
        +-- price-comparison.mjs       # Content file (export const content)

agents/
+-- crypto-research/
    +-- agent.mjs
    +-- prompts/
        +-- token-deep-dive.mjs        # Agent-Prompt (export const prompt)
```
