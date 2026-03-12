# FlowMCP Specification v3.0.0 — Agents

An Agent is a complete, purpose-driven definition that bundles tools from multiple providers for a specific task. Agents replace Groups from v2. Where Groups were simple tool lists, Agents are full compositions with a model binding, system prompt, tests, and optional prompts. This document defines the agent manifest format, tool cherry-picking, model binding, system prompts, integrity verification, and validation rules.

---

## Purpose

A typical FlowMCP catalog contains hundreds of tools across dozens of providers. A developer working on a crypto research task needs tools from CoinGecko (prices), Etherscan (on-chain data), and DeFi Llama (TVL data) — but not the other 200 tools in the catalog. An Agent selects exactly the tools needed, binds them to a specific LLM, defines how the LLM should behave, and includes tests that verify the composition works.

```mermaid
flowchart LR
    A[Agent Manifest] --> B[Tool Selection]
    A --> C[Model Binding]
    A --> D[System Prompt]
    A --> E[Tests]
    A --> F[Prompts]

    B --> G["coingecko-com/tool/simplePrice"]
    B --> H["etherscan-io/tool/getContractAbi"]
    B --> I["defillama-com/tool/getProtocolTvl"]

    C --> J["anthropic/claude-sonnet-4-5-20250929"]
    D --> K[Persona + behavioral instructions]
    E --> L["3+ end-to-end test cases"]
    F --> M[Model-specific workflow guidance]
```

The diagram shows how an agent manifest connects five concerns: which tools to use, which model to target, how the model should behave, how to verify the composition, and what workflow guidance to provide.

---

## Agent Manifest Format

Each agent is defined by a `manifest.json` file inside its own directory under `agents/`. The manifest is a JSON file containing all metadata, tool references, configuration, and tests.

```json
{
    "name": "crypto-research",
    "description": "Cross-provider crypto analysis agent",
    "version": "flowmcp/3.0.0",
    "model": "anthropic/claude-sonnet-4-5-20250929",
    "systemPrompt": "You are a crypto research agent. You analyze token prices, on-chain data, and DeFi protocol metrics. Always provide sources for your data. When comparing across chains, normalize values to USD.",
    "tools": [
        "coingecko-com/tool/simplePrice",
        "coingecko-com/tool/getCoinMarkets",
        "etherscan-io/tool/getContractAbi",
        "etherscan-io/tool/getTokenBalances",
        "defillama-com/tool/getProtocolTvl"
    ],
    "tests": [
        {
            "_description": "Basic token lookup",
            "input": "What is the current price of Ethereum?",
            "expectedTools": ["coingecko-com/tool/simplePrice"],
            "expectedContent": ["current price", "USD"]
        },
        {
            "_description": "Cross-provider analysis",
            "input": "Compare TVL of Aave on Ethereum vs Arbitrum",
            "expectedTools": ["defillama-com/tool/getProtocolTvl"],
            "expectedContent": ["TVL", "Ethereum", "Arbitrum"]
        },
        {
            "_description": "Multi-tool wallet analysis",
            "input": "Show top token holdings in vitalik.eth",
            "expectedTools": ["etherscan-io/tool/getTokenBalances", "coingecko-com/tool/simplePrice"],
            "expectedContent": ["token", "balance"]
        }
    ],
    "maxRounds": 5,
    "maxTokens": 4096,
    "prompts": ["prompts/token-deep-dive.mjs"],
    "sharedLists": ["evmChains"],
    "inputSchema": {
        "type": "object",
        "properties": {
            "query": { "type": "string", "description": "Research question" }
        },
        "required": ["query"]
    }
}
```

---

## Manifest Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Agent name. Must match `^[a-z][a-z0-9-]*$`. Must match the agent directory name. |
| `description` | `string` | Yes | Human-readable description of the agent's purpose. |
| `version` | `string` | Yes | Must be `flowmcp/3.0.0`. Declares which spec version this agent conforms to. |
| `model` | `string` | Yes | Target LLM in OpenRouter syntax (`provider/model-name`). Must contain `/`. |
| `systemPrompt` | `string` | Yes | Agent persona and behavioral instructions. Sent as the system message in every conversation. |
| `tools` | `string[]` | Yes | Tool IDs in `namespace/type/name` format (see `16-id-schema.md`). Non-empty. |
| `tests` | `array` | Yes | Minimum 3 agent tests. See [Agent Tests](#agent-tests). |
| `maxRounds` | `number` | No | Maximum tool-call rounds per conversation. Default: `10`. |
| `maxTokens` | `number` | No | Maximum tokens per LLM response. Default: `4096`. |
| `prompts` | `string[]` | No | Relative paths to prompt files within the agent directory. |
| `sharedLists` | `string[]` | No | Names of shared lists the agent needs. Resolved from the catalog's `_lists/` directory. |
| `inputSchema` | `object` | No | JSON Schema defining the agent's input format. |

### Field Details

#### `name`

The agent name serves as both the identifier and the directory name. It must be unique within a catalog.

```
crypto-research          <- valid
defi-monitor             <- valid
wallet-auditor           <- valid
CryptoResearch           <- INVALID (uppercase)
crypto research          <- INVALID (space)
```

#### `version`

The version field uses the format `flowmcp/X.Y.Z` (not semver of the agent itself). It declares which FlowMCP specification the manifest conforms to. This allows the runtime to apply the correct validation rules.

```
flowmcp/3.0.0            <- valid
3.0.0                    <- INVALID (missing flowmcp/ prefix)
flowmcp/2.0.0            <- INVALID (agents are a v3 concept)
```

#### `model`

The model field uses OpenRouter syntax: `provider/model-name`. The `/` separator is required and distinguishes the model provider from the model identifier. The model determines which LLM the agent is tested with and optimized for. Agent prompts are model-specific — a prompt tuned for Claude may not work well with GPT-4o and vice versa.

```
anthropic/claude-sonnet-4-5-20250929     <- valid
openai/gpt-4o                            <- valid
google/gemini-2.0-flash                  <- valid
claude-sonnet                            <- INVALID (no provider prefix)
```

#### `systemPrompt`

The system prompt contains the agent's persona and behavioral instructions. It is sent as the system message at the start of every conversation. The system prompt should:

- Define the agent's role and expertise
- Set behavioral guidelines (tone, format, sources)
- Specify how to handle edge cases
- Reference the available tools by describing capabilities, not by listing tool names

```json
{
    "systemPrompt": "You are a crypto research agent specializing in token analysis and DeFi protocol comparison. Always cite data sources. When comparing metrics across chains, normalize to USD. If data is unavailable for a chain, state this explicitly rather than guessing."
}
```

#### `tools`

Tools are referenced using the ID schema from `16-id-schema.md`. Each entry is a full-form ID: `namespace/type/name`. The agent cherry-picks specific tools from multiple providers — it does not activate entire schemas.

```json
{
    "tools": [
        "coingecko-com/tool/simplePrice",
        "etherscan-io/tool/getContractAbi",
        "defillama-com/tool/getProtocolTvl"
    ]
}
```

See [Tool Cherry-Picking](#tool-cherry-picking) for resolution details.

#### `maxRounds`

The maximum number of tool-call rounds the agent may execute in a single conversation turn. A "round" is one cycle of: LLM generates a tool call, runtime executes it, result is returned to the LLM. Default is `10`. Set lower for agents that should answer quickly, higher for agents that perform complex multi-step analysis.

#### `maxTokens`

The maximum number of tokens the LLM may generate per response. Default is `4096`. This controls response length, not total context.

#### `prompts`

Relative paths to prompt files within the agent directory. Agent-level prompts are **model-specific** — they are written and tested for the LLM specified in `model`. They describe tool combinatorics, chaining strategies, and fallback logic.

```json
{
    "prompts": [
        "prompts/token-deep-dive.mjs",
        "prompts/portfolio-analysis.mjs"
    ]
}
```

Prompt files follow the format defined in `12-prompt-architecture.md` and use the `[[...]]` placeholder syntax for dynamic content.

#### `sharedLists`

Names of shared lists the agent needs. These are resolved from the catalog's `_lists/` directory at load time. Shared lists provide reusable value sets (EVM chain IDs, country codes, trading pairs) that the agent's prompts and system prompt may reference.

#### `inputSchema`

An optional JSON Schema that defines the expected input format when invoking the agent. This allows callers to validate their input before sending it to the agent.

---

## Tool Cherry-Picking

Agents select specific tools from multiple providers. This is the key difference from loading entire schemas — an agent includes only the tools it needs, reducing context size and improving LLM focus.

### How Tool References Are Resolved

```mermaid
flowchart TD
    A["Read manifest.tools[]"] --> B["For each tool ID"]
    B --> C["Parse ID: namespace/type/name"]
    C --> D["Look up namespace in catalog registry"]
    D --> E{Namespace found?}
    E -->|No| F["Error: AGT007 — namespace not registered"]
    E -->|Yes| G["Find schema containing tool name"]
    G --> H{Tool found?}
    H -->|No| I["Error: AGT007 — tool not found in namespace"]
    H -->|Yes| J["Load tool definition from schema"]
    J --> K["Add to agent's active tools"]
```

The diagram shows how each tool reference in the manifest is resolved against the catalog registry. The runtime parses the ID, looks up the namespace, finds the schema containing the tool, and loads the tool definition.

### Resolution Steps

1. **Parse** — split the tool ID on `/` into namespace, type, and name (see `16-id-schema.md`)
2. **Find namespace** — locate the provider namespace in the catalog's `registry.json`
3. **Find schema** — within the namespace, find the schema file that contains the named tool
4. **Load tool** — extract the tool definition from `main.tools[name]`
5. **Register** — add the tool to the agent's active tool set

### Cross-Provider Composition

An agent can combine tools from any number of providers:

```json
{
    "tools": [
        "coingecko-com/tool/simplePrice",
        "coingecko-com/tool/getCoinMarkets",
        "etherscan-io/tool/getContractAbi",
        "etherscan-io/tool/getTokenBalances",
        "defillama-com/tool/getProtocolTvl",
        "defillama-com/tool/getProtocolChainTvl"
    ]
}
```

This agent uses 6 tools from 3 providers. The runtime resolves each tool independently and collects `requiredServerParams` from all involved schemas.

### Server Params Collection

Each provider schema declares its own `requiredServerParams` (API keys). When an agent activates, the runtime collects all unique params across all referenced schemas:

```
Agent "crypto-research" requires:
  - COINGECKO_API_KEY     (from coingecko-com schemas)
  - ETHERSCAN_API_KEY     (from etherscan-io schemas)
  - (none)                (defillama-com has no requiredServerParams)

Checking .env... COINGECKO_API_KEY=set, ETHERSCAN_API_KEY=set
All server params available. Agent ready.
```

If any required param is missing, activation fails with a clear error identifying which schemas need which params.

---

## Model Binding

The `model` field binds the agent to a specific LLM. This binding has three implications:

### 1. Test Execution

Agent tests are executed against the specified model. The `expectedTools` and `expectedContent` assertions are validated using the bound model's behavior. A test suite that passes with `anthropic/claude-sonnet-4-5-20250929` may fail with `openai/gpt-4o` because different models make different tool selection decisions.

### 2. Prompt Optimization

Agent-level prompts (in the `prompts/` directory) are written for the specific model. They leverage the model's strengths and work around its weaknesses. A prompt that works well with Claude's structured thinking may not translate to GPT-4o's different reasoning style.

### 3. Runtime Model Selection

When the agent is invoked, the runtime uses the `model` field to select which LLM to call. The model string uses OpenRouter syntax, enabling routing through OpenRouter or direct provider APIs.

```mermaid
flowchart LR
    A[Agent invoked] --> B[Read model field]
    B --> C["anthropic/claude-sonnet-4-5-20250929"]
    C --> D{Route via OpenRouter?}
    D -->|Yes| E[OpenRouter API]
    D -->|No| F[Direct Anthropic API]
    E --> G[LLM processes prompt + tools]
    F --> G
```

The diagram shows how the model field determines LLM routing at runtime.

---

## System Prompt

The `systemPrompt` field is the agent's core behavioral definition. It is sent as the system message in every conversation, before any user input or tool results.

### What the System Prompt Should Contain

| Aspect | Purpose | Example |
|--------|---------|---------|
| Role | Define the agent's identity | "You are a crypto research agent" |
| Expertise | Scope the agent's knowledge | "specializing in token analysis and DeFi protocols" |
| Behavior | Set interaction guidelines | "Always cite data sources" |
| Format | Define output expectations | "Present comparisons in tables" |
| Edge cases | Handle missing data | "If data is unavailable, state this explicitly" |

### What the System Prompt Should NOT Contain

- **Tool names or IDs** — the LLM discovers available tools through the MCP tool list, not the system prompt
- **API-specific details** — tool descriptions handle this
- **Shared list values** — these are injected at runtime
- **Prompt content** — prompts are separate files with their own lifecycle

### System Prompt and Provider-Prompts

The system prompt works alongside provider-prompts and agent-prompts but serves a different purpose:

| Layer | Scope | Model-specific? | Content |
|-------|-------|-----------------|---------|
| System Prompt | Agent-wide | Yes | Persona, behavior, format |
| Provider-Prompts | Single namespace | No | How to use one provider's tools |
| Agent-Prompts | Cross-provider | Yes | Tool combinatorics, chaining |

At runtime, the system prompt is always included. Provider-prompts and agent-prompts are included based on context — see `12-prompt-architecture.md`.

---

## Agent Tests

Agent tests validate end-to-end behavior: given a natural language input, does the agent invoke the correct tools and produce a response containing the expected content? Tests are defined in the manifest's `tests` array.

### Test Format

```json
{
    "tests": [
        {
            "_description": "Basic token lookup",
            "input": "What is the current price of Ethereum?",
            "expectedTools": ["coingecko-com/tool/simplePrice"],
            "expectedContent": ["current price", "USD"]
        }
    ]
}
```

### Test Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_description` | `string` | Yes | What this test demonstrates |
| `input` | `string` | Yes | Natural language prompt (as a user would ask) |
| `expectedTools` | `string[]` | Yes | Tool IDs that should be called (deterministic check) |
| `expectedContent` | `string[]` | No | Substrings the response text must contain (case-insensitive) |

### Three-Level Test Model

Agent tests operate on three levels of determinism, consistent with the model defined in `10-tests.md`:

```mermaid
flowchart TD
    A[Agent Test] --> B["Level 1: Tool Usage"]
    A --> C["Level 2: Content"]
    A --> D["Level 3: Quality"]

    B --> E["Deterministic — expectedTools vs actual tool calls"]
    C --> F["Semi-deterministic — expectedContent vs response text"]
    D --> G["Subjective — human review or LLM-as-Judge"]
```

| Level | Assertion | Determinism | Method |
|-------|-----------|-------------|--------|
| Tool Usage | `expectedTools[]` | Deterministic | Compare expected tool IDs against actual tool calls |
| Content | `expectedContent[]` | Semi-deterministic | Case-insensitive substring match against response text |
| Quality | (not automated) | Subjective | Human review or LLM-as-Judge |

**Tool Usage** is the strongest assertion. Given a well-scoped prompt, which tools the agent calls is deterministic. "What is the current price of Ethereum?" must invoke a price tool — there is no ambiguity about which tool category to use.

**Content** assertions are semi-deterministic. LLM output varies across runs, but factual elements like "current price" or "USD" should appear in any correct response.

**Quality** is outside the scope of automated validation. It exists in the model for completeness — teams may evaluate response quality through human review or LLM-as-Judge.

### Minimum Test Count

Every agent must have at least 3 tests (validation rule AGT008). Three tests ensure coverage across:

1. **Basic case** — a straightforward single-tool query
2. **Edge case** — a question requiring multiple tools or complex reasoning
3. **Cross-cutting case** — a question that combines data from multiple providers

### Test Design Guidelines

The same principles from `10-tests.md` apply:

- **Express the breadth** — each test should demonstrate a different capability
- **Teach through examples** — reading the tests should reveal what the agent can do
- **No personal data** — use public, well-known entities
- **Reproducible** — prefer stable queries over time-sensitive ones

---

## Integrity Verification

Agents store hashes of their member tools to detect when underlying tool definitions change. When a tool's schema is updated (new parameters, changed output format, modified path), the hash mismatch signals that the agent needs review.

### Per-Tool Hash

Each tool's hash is calculated from its `main` block definition — the declarative, JSON-serializable part:

```
toolHash = SHA-256( JSON.stringify( {
    namespace: 'etherscan-io',
    version: '3.0.0',
    tool: {
        name: 'getContractAbi',
        method: 'GET',
        path: '/api',
        parameters: [ /* full parameter definitions */ ],
        output: { /* output schema if present */ }
    },
    sharedListRefs: [
        { ref: 'evmChains', version: '1.0.0' }
    ]
} ) )
```

The hash input includes:
- `namespace` from the provider schema
- `version` from the provider schema
- The tool definition (name, method, path, parameters, output)
- Shared list references the tool uses

Handler code is **excluded** from the hash. A handler change (e.g., improved response transformation) does not invalidate the agent because it does not change the tool's interface.

### Agent Hash

The agent hash is calculated from its sorted tool references and their individual hashes:

```
agentHash = SHA-256( JSON.stringify(
    tools
        .sort()
        .map( ( toolId ) => {
            const hash = getToolHash( toolId )

            return { id: toolId, hash }
        } )
) )
```

Sorting ensures deterministic output regardless of the order tools appear in the manifest.

### Hash Storage

The agent hash is stored in the manifest alongside the tool list:

```json
{
    "name": "crypto-research",
    "tools": [
        "coingecko-com/tool/simplePrice",
        "etherscan-io/tool/getContractAbi"
    ],
    "hash": "sha256:a1b2c3d4e5f6..."
}
```

The `hash` field is optional in the manifest file. When present, the runtime verifies it on activation. When absent, the runtime calculates and stores it on first activation.

### Verification Flow

```mermaid
flowchart TD
    A[Activate agent] --> B[Read manifest.tools]
    B --> C[Resolve each tool reference]
    C --> D[Calculate per-tool hashes]
    D --> E[Calculate agent hash]
    E --> F{manifest.hash present?}
    F -->|No| G[Store calculated hash in manifest]
    F -->|Yes| H{Hashes match?}
    H -->|Yes| I[Agent activated — integrity verified]
    H -->|No| J[Warning: hash mismatch]
    J --> K[Report which tools changed]
    K --> L[User reviews changes]
    L --> M[Recalculate and update hash]
    M --> I
```

The diagram shows the verification flow from activation through hash comparison to either success or mismatch resolution.

### Verification CLI

```bash
flowmcp agent verify crypto-research
```

Output on success:

```
Agent "crypto-research": 5 tools, all hashes valid
```

Output on hash mismatch:

```
Agent "crypto-research": HASH MISMATCH
  - etherscan-io/tool/getContractAbi: expected sha256:abc... got sha256:def...
  - Tool parameters changed (new optional parameter added)
  Recommendation: Review changes and run `flowmcp agent rehash crypto-research`
```

---

## Directory Structure

Each agent lives in its own directory under `agents/` in the catalog:

```
agents/
└── crypto-research/
    ├── manifest.json
    └── prompts/
        ├── token-deep-dive.mjs
        └── portfolio-analysis.mjs
```

### Directory Rules

- The directory name must match `manifest.name`
- `manifest.json` is required — it is the agent's entry point
- `prompts/` is optional — only needed if the agent defines model-specific prompts
- Prompt file paths in `manifest.prompts` are relative to the agent directory
- No other files or subdirectories are expected

### Relationship to Catalog

The catalog's `registry.json` references each agent by its manifest path:

```json
{
    "agents": [
        {
            "name": "crypto-research",
            "description": "Cross-provider crypto analysis agent",
            "manifest": "agents/crypto-research/manifest.json"
        }
    ]
}
```

See `15-catalog.md` for the full catalog specification.

---

## Agent vs Group Migration

Agents replace Groups from FlowMCP v2. The migration is conceptual — agents are not backward-compatible with groups because they serve a fundamentally different purpose.

### What Changed

| Aspect | Group (v2) | Agent (v3) |
|--------|-----------|------------|
| Definition file | `.flowmcp/groups.json` | `agents/{name}/manifest.json` |
| Purpose | Tool list for activation | Complete agent definition |
| Model binding | None | Required (`model` field) |
| System prompt | None | Required (`systemPrompt` field) |
| Tests | None | Required (minimum 3) |
| Prompts | Optional schema-level | Model-specific agent-level |
| Tool references | `namespace/file::tool` | `namespace/type/name` (ID schema) |
| Location | Local to project (`.flowmcp/`) | Part of catalog (`agents/`) |
| Sharing | Export/import JSON | Distributed via catalog registry |

### Migration Path

Groups cannot be automatically converted to agents because agents require fields that groups do not have (model, systemPrompt, tests). The migration is manual:

1. **Create agent directory** — `agents/{group-name}/`
2. **Create manifest.json** — use the group's tool list as a starting point
3. **Convert tool references** — from `namespace/file::tool` to `namespace/type/name` format
4. **Add model** — choose the target LLM
5. **Add systemPrompt** — define the agent's persona
6. **Add tests** — write at least 3 agent tests
7. **Add prompts** — optionally create model-specific prompts
8. **Register in catalog** — add the agent to `registry.json`

See `08-migration.md` for the complete v2-to-v3 migration guide.

---

## Agent Activation Lifecycle

When an agent is activated, the runtime performs these steps:

```mermaid
flowchart TD
    A[Activate agent] --> B[Read manifest.json]
    B --> C[Validate manifest fields]
    C --> D[Resolve tool references]
    D --> E[Load provider schemas]
    E --> F[Static security scan per schema]
    F --> G[Collect requiredServerParams]
    G --> H{All server params in .env?}
    H -->|No| I[Error: missing server params]
    H -->|Yes| J[Resolve shared lists]
    J --> K[Verify integrity hashes]
    K --> L[Load agent prompts]
    L --> M[Register tools as MCP tools]
    M --> N[Register prompts as MCP prompts]
    N --> O[Agent ready]
```

The diagram shows the full activation lifecycle from reading the manifest to the agent being ready for invocations.

### Activation Steps

1. **Read manifest** — parse `manifest.json` from the agent directory
2. **Validate** — check all required fields, format constraints, and version compatibility
3. **Resolve tools** — parse each tool ID and locate the corresponding provider schema
4. **Load schemas** — import the `.mjs` schema files for all referenced tools
5. **Security scan** — run the static security scanner on each loaded schema
6. **Collect params** — gather all `requiredServerParams` from all involved schemas
7. **Check env** — verify all required API keys are available in the environment
8. **Resolve lists** — load shared lists declared in `manifest.sharedLists`
9. **Verify hashes** — compare stored hash against calculated hash (warn on mismatch)
10. **Load prompts** — load prompt files from `manifest.prompts`
11. **Register tools** — expose the agent's tools via MCP `server.tool`
12. **Register prompts** — expose the agent's prompts via MCP `server.prompt`

---

## Validation Rules

| Code | Severity | Rule |
|------|----------|------|
| AGT001 | error | `name` is required, must match `^[a-z][a-z0-9-]*$` |
| AGT002 | error | `description` is required, must be a non-empty string |
| AGT003 | error | `model` is required, must contain `/` (OpenRouter syntax) |
| AGT004 | error | `version` must be `flowmcp/3.0.0` |
| AGT005 | error | `systemPrompt` is required, must be a non-empty string |
| AGT006 | error | `tools[]` is required, must be a non-empty array |
| AGT007 | error | Each tool reference must be a valid ID format (`namespace/type/name`) |
| AGT008 | error | `tests[]` is required, minimum 3 tests |
| AGT009 | error | Each test must have an `input` field of type string |
| AGT010 | error | Each test must have an `expectedTools` field as a non-empty array |
| AGT011 | error | Each `expectedTools` entry must be a valid ID (contains `/`) |
| AGT012 | warning | Tests should cover different tool combinations |

### Rule Details

**AGT001** — The agent name is the primary identifier and must match the directory name. Invalid names prevent catalog resolution.

**AGT002** — The description is displayed in catalog listings and agent discovery. It must be meaningful — empty strings are rejected.

**AGT003** — The model field uses OpenRouter syntax where the `/` separates the provider from the model name. A model string without `/` cannot be routed to any provider. Examples: `anthropic/claude-sonnet-4-5-20250929`, `openai/gpt-4o`.

**AGT004** — The version must be exactly `flowmcp/3.0.0`. This is not the agent's own version — it declares which FlowMCP specification the manifest conforms to.

**AGT005** — The system prompt defines the agent's behavior. Without it, the agent has no persona or instructions. Empty strings are rejected because they provide no behavioral guidance.

**AGT006** — An agent without tools has nothing to execute. The tools array must contain at least one valid tool reference.

**AGT007** — Tool references must follow the ID schema from `16-id-schema.md`. The full form `namespace/type/name` is required in agent manifests to ensure unambiguous resolution.

**AGT008** — Three tests is the minimum for meaningful coverage: one basic case, one edge case, one cross-cutting case. This matches the tool test minimum from `10-tests.md`.

**AGT009–AGT011** — These rules validate individual test fields. They correspond to the agent test validation rules TST009–TST011 defined in `10-tests.md`. Every test must have a natural language input and at least one expected tool call.

**AGT012** — Tests should demonstrate breadth. If all three tests expect the same single tool, the test suite does not validate the agent's multi-tool orchestration capability. This is a warning, not an error, because some agents genuinely use only one tool.

### Validation Command

```bash
flowmcp validate-agent <agent-directory>
```

The command runs all AGT rules and reports errors and warnings. An agent with any error-level violations cannot be activated.

### Validation Output Example

```
flowmcp validate-agent agents/crypto-research/

  AGT001  pass    name "crypto-research" matches pattern
  AGT002  pass    description is non-empty
  AGT003  pass    model "anthropic/claude-sonnet-4-5-20250929" contains /
  AGT004  pass    version is flowmcp/3.0.0
  AGT005  pass    systemPrompt is non-empty
  AGT006  pass    tools[] has 5 entries
  AGT007  pass    all tool references are valid IDs
  AGT008  pass    tests[] has 3 entries (minimum: 3)
  AGT009  pass    all tests have input field
  AGT010  pass    all tests have expectedTools field
  AGT011  pass    all expectedTools entries are valid IDs
  AGT012  pass    tests cover 4 different tool combinations

  0 errors, 0 warnings
  Agent is valid
```

---

## Complete Example

A fully specified agent manifest with directory structure:

### Directory

```
agents/
└── crypto-research/
    ├── manifest.json
    └── prompts/
        ├── token-deep-dive.mjs
        └── portfolio-analysis.mjs
```

### manifest.json

```json
{
    "name": "crypto-research",
    "description": "Cross-provider crypto analysis agent combining price data, on-chain analytics, and DeFi protocol metrics for comprehensive token and portfolio research",
    "version": "flowmcp/3.0.0",
    "model": "anthropic/claude-sonnet-4-5-20250929",
    "systemPrompt": "You are a crypto research agent specializing in token analysis, wallet forensics, and DeFi protocol comparison. Follow these guidelines:\n\n1. Always cite which data source provided each piece of information.\n2. When comparing metrics across chains, normalize values to USD.\n3. Present comparative data in tables when three or more items are compared.\n4. If data is unavailable for a requested chain or token, state this explicitly rather than guessing.\n5. For wallet analysis, always check both token balances and current prices to show USD values.",
    "tools": [
        "coingecko-com/tool/simplePrice",
        "coingecko-com/tool/getCoinMarkets",
        "etherscan-io/tool/getContractAbi",
        "etherscan-io/tool/getTokenBalances",
        "defillama-com/tool/getProtocolTvl"
    ],
    "tests": [
        {
            "_description": "Basic token lookup — single tool, single provider",
            "input": "What is the current price of Ethereum?",
            "expectedTools": ["coingecko-com/tool/simplePrice"],
            "expectedContent": ["current price", "USD"]
        },
        {
            "_description": "Cross-provider DeFi analysis — comparative query across chains",
            "input": "Compare the TVL of Aave on Ethereum vs Arbitrum",
            "expectedTools": ["defillama-com/tool/getProtocolTvl"],
            "expectedContent": ["TVL", "Ethereum", "Arbitrum"]
        },
        {
            "_description": "Multi-tool wallet analysis — combines on-chain data with pricing",
            "input": "Show top token holdings in vitalik.eth",
            "expectedTools": ["etherscan-io/tool/getTokenBalances", "coingecko-com/tool/simplePrice"],
            "expectedContent": ["token", "balance"]
        }
    ],
    "maxRounds": 5,
    "maxTokens": 4096,
    "prompts": [
        "prompts/token-deep-dive.mjs",
        "prompts/portfolio-analysis.mjs"
    ],
    "sharedLists": ["evmChains"],
    "inputSchema": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Research question about tokens, wallets, or DeFi protocols"
            }
        },
        "required": ["query"]
    },
    "hash": "sha256:a1b2c3d4e5f6789..."
}
```
