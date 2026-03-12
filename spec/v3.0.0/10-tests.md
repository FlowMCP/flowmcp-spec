# FlowMCP Specification v3.0.0 — Tests

Tests are executable examples embedded in tool and resource query definitions. They serve three purposes: they document what a tool or resource query can do, they provide the input data needed to capture real responses, and those captured responses are the basis for generating accurate output schemas. This document defines the test format for both tools and resources, design principles, the response capture lifecycle, and validation rules.

---

## Purpose

Without tests, a tool or resource query is a black box. The `description` field says what it does in prose, the `parameters` array says what inputs it accepts — but neither shows a concrete usage example with real values. Tests fill this gap.

```mermaid
flowchart LR
    A[Tests] --> B[Learning: what is possible]
    A --> C[Execution: call API or query DB]
    C --> D[Capture: store response]
    D --> E[Generate: output schema]
```

The diagram shows the four roles of a test: teaching consumers what the tool or resource can do, executing real API calls (for tools) or database queries (for resources), capturing the response, and generating the output schema from that response.

### Tests as Learning Instrument

A developer or AI agent reading a schema should understand a tool's or resource query's capabilities **by reading the tests alone**. Well-designed tests express the breadth of what the tool or query can do — different parameter combinations, edge cases, different data categories. They are not regression tests — they are **executable documentation**.

### Tests as Output Schema Source

Output schemas describe the shape of `data` in a successful response. The only reliable source for this shape is a **real API response**. Tests provide the parameter values needed to make real API calls. The captured responses are fed into the `OutputSchemaGenerator` to produce accurate output schemas.

```mermaid
flowchart TD
    A[Test] -->|parameter values| B[API Call or DB Query]
    B -->|real response| C[Response Capture]
    C -->|JSON structure| D[OutputSchemaGenerator]
    D -->|schema definition| E[output.schema in main block]
```

The diagram shows how tests feed the output schema generation pipeline: test parameters drive real API calls, responses are captured, and the generator derives the output schema from the actual data structure.

---

## Tool Test Format

Tests are defined as an array inside each tool, alongside `method`, `path`, `description`, `parameters`, and `output`:

```javascript
tools: {
    getSimplePrice: {
        method: 'GET',
        path: '/simple/price',
        description: 'Fetch current price for one or more coins',
        parameters: [
            { position: { key: 'ids', value: '{{USER_PARAM}}', location: 'query' }, z: { primitive: 'array()', options: [] } },
            { position: { key: 'vs_currencies', value: '{{USER_PARAM}}', location: 'query' }, z: { primitive: 'string()', options: [] } }
        ],
        tests: [
            {
                _description: 'Single coin in single currency',
                ids: ['bitcoin'],
                vs_currencies: 'usd'
            },
            {
                _description: 'Multiple coins in multiple currencies',
                ids: ['bitcoin', 'ethereum', 'solana'],
                vs_currencies: 'usd,eur,gbp'
            }
        ],
        output: { /* ... */ }
    }
}
```

The `tests` array is part of the `main` block and therefore JSON-serializable. It must not contain functions, Date objects, or any non-serializable values.

---

## Test Fields

Each test object contains `_description` and parameter values:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_description` | `string` | Yes | Human-readable explanation of what this test demonstrates |
| `{paramKey}` | matches parameter type | Yes (per required param) | Value for each `{{USER_PARAM}}` parameter, keyed by the parameter's `position.key` |

### `_description`

The description explains **what this specific test demonstrates** — not what the tool does (that is the tool's `description`), but what this particular parameter combination shows.

```javascript
// Good — explains the specific scenario
{ _description: 'ERC-20 token on Ethereum mainnet', ... }
{ _description: 'Native token on Layer 2 chain (Arbitrum)', ... }
{ _description: 'Wallet with high transaction volume', ... }

// Bad — generic, does not explain what makes this test different
{ _description: 'Test getTokenPrice', ... }
{ _description: 'Basic test', ... }
{ _description: 'Test 1', ... }
```

### Parameter Values

Each `{{USER_PARAM}}` parameter's `position.key` becomes a key in the test object. The value must pass the parameter's `z` validation:

```javascript
// Parameter definition
{ position: { key: 'chain_id', value: '{{USER_PARAM}}', location: 'query' }, z: { primitive: 'number()', options: ['min(1)'] } }

// Test value — must be a number >= 1
{ _description: 'Ethereum mainnet', chain_id: 1 }
```

Optional parameters (`optional()` or `default()` in z options) may be omitted from test objects. If omitted, the runtime uses the default value or excludes the parameter.

Fixed parameters (value is not `{{USER_PARAM}}`) and server parameters (`{{SERVER_PARAM:...}}`) are **never included in test objects** — they are handled automatically by the runtime.

---

## Design Principles

### 1. Express the Breadth

Tests should cover the **range of what is possible** with the tool or resource query. A tool that accepts a chain ID should test multiple chains. A tool that accepts different asset types should test each type. The goal is not exhaustive coverage but representative variety.

```javascript
// Good — shows breadth of chains and token types
tests: [
    { _description: 'ERC-20 token on Ethereum', chain_id: 1, contract: '0x6982508145454Ce325dDbE47a25d4ec3d2311933' },
    { _description: 'Native token on Polygon', chain_id: 137, contract: '0x0000000000000000000000000000000000001010' },
    { _description: 'Stablecoin on Arbitrum', chain_id: 42161, contract: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' }
]

// Bad — repetitive, same pattern three times
tests: [
    { _description: 'Test token 1', chain_id: 1, contract: '0xaaa...' },
    { _description: 'Test token 2', chain_id: 1, contract: '0xbbb...' },
    { _description: 'Test token 3', chain_id: 1, contract: '0xccc...' }
]
```

### 2. Teach Through Examples

Someone reading the tests should learn what the tool or resource query can do without reading the documentation. Each test teaches one capability or variation:

```javascript
// The tests teach: this route handles single/multiple coins, different currencies,
// and can mix coin types
tests: [
    { _description: 'Single coin in USD', ids: ['bitcoin'], vs_currencies: 'usd' },
    { _description: 'Multiple coins in single currency', ids: ['bitcoin', 'ethereum'], vs_currencies: 'eur' },
    { _description: 'Single coin in multiple currencies', ids: ['solana'], vs_currencies: 'usd,eur,gbp' }
]
```

### 3. No Personal Data

Tests must never contain personal data. All test values must be **publicly known, verifiable, and non-sensitive**:

| Allowed | Not Allowed |
|---------|-------------|
| Public smart contract addresses | Private wallet addresses with real holdings |
| Well-known token contracts (USDC, WETH) | Personal wallet addresses |
| Public blockchain data (block numbers, tx hashes) | Email addresses, names, phone numbers |
| Standard chain IDs (1, 137, 42161) | API keys, tokens, passwords |
| Published document IDs (government open data) | Session tokens, auth credentials |
| Generic search keywords | Personal identifiers |

```javascript
// Good — public, well-known contract addresses
{ _description: 'USDC on Ethereum', contract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' }

// Bad — personal wallet
{ _description: 'My wallet', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18' }
```

### 4. Reproducible Results

Tests should produce **consistent, verifiable results** when executed. Prefer:

- Well-established tokens/contracts over newly deployed ones
- Historical data queries (specific block numbers) over latest-block queries when possible
- Stable endpoints over experimental ones

The API response may change over time (prices update, new data appears), but the **structure** of the response should remain stable. This structural stability is what makes captured responses useful for output schema generation.

---

## Test Count Guidelines

### Tool Test Count

| Scenario | Minimum | Recommended |
|----------|---------|-------------|
| Tool with no parameters | 1 | 1 |
| Tool with 1-2 parameters | 1 | 2-3 |
| Tool with enum/chain parameters | 1 | 2-4 (different enum values) |
| Tool with multiple optional parameters | 1 | 2-3 (with/without optionals) |

**Minimum: 1 test per tool is required.** A tool without tests is a validation error (TST001). The recommended count depends on the parameter variety — more diverse parameters benefit from more tests.

### Resource Query Test Count

| Scenario | Minimum | Recommended |
|----------|---------|-------------|
| Query with no parameters | 1 | 1 |
| Query with 1-2 parameters | 1 | 2-3 |
| Query with enum parameters | 1 | 2-3 (different enum values) |

**Minimum: 1 test per resource query is required.** Resource query tests execute against the bundled database, so they are always runnable without API keys or network access. Results are deterministic.

**Maximum: No hard limit**, but tests should be purposeful. Each test must demonstrate something different. Duplicate or near-duplicate tests waste execution time during response capture.

---

## Response Capture Lifecycle

Tests are the starting point for a pipeline that ends with accurate output schemas:

```mermaid
flowchart TD
    A[1. Read tests from tool/query] --> B[2. Resolve server params from env]
    B --> C[3. Execute API call per test]
    C --> D[4. Record full response with metadata]
    D --> E[5. Feed response to OutputSchemaGenerator]
    E --> F[6. Write output schema to definition]
```

The diagram shows the six-step lifecycle from test definition to output schema generation.

### Step 1: Read Tests

The runtime reads the `tests` array from the tool or resource query definition and extracts parameter values for each test.

### Step 2: Resolve Server Params

If the schema has `requiredServerParams`, the corresponding environment variables are loaded. Tests that require API keys cannot run without the appropriate `.env` file.

### Step 3: Execute API Call

For each test, the runtime constructs the full API request (URL, headers, body) using the test's parameter values and executes it. A delay between calls (default: 1 second) prevents rate limiting.

### Step 4: Record Response

The full response is recorded with metadata:

```javascript
{
    namespace: 'coingecko',
    routeName: 'getSimplePrice',
    testIndex: 0,
    _description: 'Single coin in USD',
    userParams: { ids: ['bitcoin'], vs_currencies: 'usd' },
    responseTime: 234,
    timestamp: '2026-02-17T10:30:00Z',
    response: {
        status: true,
        messages: [],
        data: { /* actual API response after handler transformation */ }
    }
}
```

The `response.data` field contains the data **after handler transformation** (postRequest, executeRequest). This is critical because the output schema describes the final shape, not the raw API response.

### Step 5: Generate Output Schema

The `OutputSchemaGenerator` analyzes the `response.data` structure and produces a schema definition:

```javascript
// From response.data: [{ id: 'bitcoin', prices: { usd: 45000 } }]
// Generator produces:
{
    type: 'array',
    items: {
        type: 'object',
        properties: {
            id: { type: 'string', description: '' },
            prices: {
                type: 'object',
                description: '',
                properties: {
                    usd: { type: 'number', description: '' }
                }
            }
        }
    }
}
```

### Step 6: Write Output Schema

The generated schema is written back into the tool's or query's `output` field. If it already has an `output` schema, the captured response can be used to **validate** the existing schema against reality.

---

## Test Execution Modes

### Capture Mode

All tests are executed against the real API. Responses are stored as files for inspection and output schema generation. This is the primary use case — run during schema development to build output schemas.

```
capture/
└── {timestamp}/
    └── {namespace}/
        ├── {routeName}-0.json
        ├── {routeName}-1.json
        └── metrics.json
```

### Validation Mode

Tests are executed and the actual response structure is compared against the declared `output.schema`. Mismatches produce warnings (non-blocking, per output schema spec). This mode verifies that output schemas remain accurate over time.

### Dry-Run Mode

Tests are validated for correctness (parameter types, required fields, _description presence) without making API calls. Used during `flowmcp validate` to check test definitions statically.

---

## Connection to Output Schema

The output schema (defined in `04-output-schema.md`) describes the `data` field of a successful response. Tests are the mechanism that produces the real data from which output schemas are derived.

| Without Tests | With Tests |
|---------------|------------|
| Output schema must be written by hand | Output schema is generated from real responses |
| Schema author guesses the response shape | Schema author captures the actual shape |
| Output schema may drift from reality | Output schema is verified against reality |
| No way to detect API changes | Response capture detects structural changes |

**Tests and output schemas are complementary.** Tests provide the input, response capture provides the data, and the generator produces the schema. Maintaining one without the other is incomplete.

---

## Complete Example

### Tool Test Example

A tool with well-designed tests that demonstrate breadth:

```javascript
export const main = {
    namespace: 'chainlist',
    name: 'Chainlist Tools',
    description: 'Query EVM chain metadata from Chainlist',
    version: '3.0.0',
    root: 'https://chainlist.org/rpcs.json',
    tools: {
        getChainById: {
            method: 'GET',
            path: '/',
            description: 'Returns detailed information for a chain given its numeric chainId',
            parameters: [
                { position: { key: 'chain_id', value: '{{USER_PARAM}}', location: 'query' }, z: { primitive: 'number()', options: ['min(1)'] } }
            ],
            tests: [
                { _description: 'Ethereum mainnet — most widely used L1', chain_id: 1 },
                { _description: 'Polygon PoS — popular L2 sidechain', chain_id: 137 },
                { _description: 'Arbitrum One — optimistic rollup L2', chain_id: 42161 },
                { _description: 'Base — Coinbase L2 on OP Stack', chain_id: 8453 }
            ],
            output: {
                mimeType: 'application/json',
                schema: {
                    type: 'object',
                    properties: {
                        chainId: { type: 'number', description: 'Numeric chain identifier' },
                        name: { type: 'string', description: 'Human-readable chain name' },
                        nativeCurrency: {
                            type: 'object',
                            description: 'Native currency details',
                            properties: {
                                name: { type: 'string', description: 'Currency name' },
                                symbol: { type: 'string', description: 'Currency symbol' },
                                decimals: { type: 'number', description: 'Decimal places' }
                            }
                        },
                        rpc: { type: 'array', description: 'Available RPC endpoints' },
                        explorers: { type: 'array', description: 'Block explorer URLs' }
                    }
                }
            }
        },
        getChainsByKeyword: {
            method: 'GET',
            path: '/',
            description: 'Returns all chains matching a keyword substring',
            parameters: [
                { position: { key: 'keyword', value: '{{USER_PARAM}}', location: 'query' }, z: { primitive: 'string()', options: ['min(2)'] } },
                { position: { key: 'limit', value: '{{USER_PARAM}}', location: 'query' }, z: { primitive: 'number()', options: ['min(1)', 'optional()'] } }
            ],
            tests: [
                { _description: 'Search for Ethereum-related chains', keyword: 'Ethereum' },
                { _description: 'Search for Binance chains with limit', keyword: 'BNB', limit: 3 },
                { _description: 'Search for testnet chains', keyword: 'Sepolia' }
            ],
            output: { /* ... */ }
        }
    }
}
```

### What these tests demonstrate

**`getChainById` tests teach:**
- The tool works with well-known L1 chains (Ethereum)
- It works with L2 sidechains (Polygon)
- It works with rollup L2s (Arbitrum)
- It works with newer OP Stack chains (Base)
- All test values are public chain IDs — no personal data

**`getChainsByKeyword` tests teach:**
- The tool does substring matching on chain names
- The `limit` parameter is optional (first test omits it)
- Different keyword patterns produce different result sets
- Testnet chains are also searchable

---

## Resource Query Tests

Resource queries use the same test format as tools. Each test provides parameter values for a query execution against the bundled SQLite database.

### Resource Test Format

```javascript
queries: {
    bySymbol: {
        sql: 'SELECT * FROM tokens WHERE symbol = ? COLLATE NOCASE',
        description: 'Find tokens by ticker symbol',
        parameters: [
            {
                position: { key: 'symbol', value: '{{USER_PARAM}}' },
                z: { primitive: 'string()', options: [ 'min(1)' ] }
            }
        ],
        output: { /* ... */ },
        tests: [
            { _description: 'Well-known stablecoin (USDC)', symbol: 'USDC' },
            { _description: 'Major L1 token (ETH)', symbol: 'ETH' },
            { _description: 'Case-insensitive match (lowercase)', symbol: 'wbtc' }
        ]
    }
}
```

### Resource Test Differences from Tool Tests

| Aspect | Tool Tests | Resource Tests |
|--------|-----------|----------------|
| Execution target | External API over network | Local SQLite database |
| API keys required | Often yes (`requiredServerParams`) | Never |
| Network required | Yes | No |
| Result determinism | Response may vary over time | Always deterministic (bundled data) |
| Test count minimum | 1 per tool | 1 per query |
| Server params in test | Never included | Not applicable |

### Resource Test Design Principles

The same four design principles apply (express breadth, teach through examples, no personal data, reproducible results). Resource tests have an additional advantage: **results are always reproducible** because the data is bundled in the `.db` file. Tests serve as documentation of what data the database contains.

```javascript
// Good — shows different lookup strategies and data coverage
tests: [
    { _description: 'Well-known stablecoin (USDC)', symbol: 'USDC' },
    { _description: 'Major DeFi token (UNI)', symbol: 'UNI' },
    { _description: 'Case-insensitive match (lowercase)', symbol: 'weth' }
]

// Bad — only one test, does not show data variety
tests: [
    { _description: 'Test query', symbol: 'ETH' }
]
```

See `13-resources.md` for the complete resource specification including query definitions, parameter binding, and handler integration.

---

## Validation Rules

| Code | Severity | Rule |
|------|----------|------|
| TST001 | error | Each tool must have at least 1 test. Each resource query must have at least 1 test. |
| TST002 | error | Each test must have a `_description` field of type string |
| TST003 | error | Each test must provide values for all required `{{USER_PARAM}}` parameters |
| TST004 | error | Test parameter values must pass the corresponding `z` validation |
| TST005 | error | Test objects must be JSON-serializable (no functions, no Date, no undefined) |
| TST006 | error | Test objects must only contain keys that match `{{USER_PARAM}}` parameter keys or `_description` |
| TST007 | warning | Tools/queries with enum or chain parameters should have tests covering multiple enum values |
| TST008 | info | Consider adding tests that demonstrate optional parameter usage |
