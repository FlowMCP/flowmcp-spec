---
name: flowmcp-schema-create
description: >
  FlowMCP schema creation guide for the canonical v4 model. Covers the .mjs
  module shape (export const main + optional factory export const handlers), the
  human-readable enum principle, horizontal vs vertical schema decisions, the
  6-phase workflow (Preparation, Analysis, Schema Creation, Validation, Testing,
  Release), and quality checklist. This is the single canonical v4 creation
  skill — other authoring skills reference this form. Must be loaded when
  creating new FlowMCP API schemas or validating existing ones.
---

# FlowMCP Schema Creation (canonical v4)

Guide for creating FlowMCP API schemas following the canonical v4 model.
This skill is the **single source of truth** for the v4 schema shape — other
creation/repair skills reference this form rather than carrying their own.

Spec reference: `spec/v4.3.0/01-schema-format.md`, `02-parameters.md`,
`04-output-schema.md`, `19-mcp-integration.md`.

---

## Trigger

- When creating a new FlowMCP schema
- When validating an existing schema
- When converting an API to a FlowMCP tool

---

## Schema Module Shape (v4)

A schema is an **`.mjs` ES module**, not a flat JSON file. It exports a static
`main` object and (only when custom request/response logic is needed) a
`handlers` **factory**. The schema file has **zero `import` statements** — all
dependencies are injected (security model).

```javascript
export const main = {
    namespace: 'crypto-data',                  // /^[a-z][a-z0-9-]*$/ — lowercase, digits, hyphens
    name: 'CryptoMarketData',                  // PascalCase human-readable name
    description: 'Get current token prices and market data.',
    version: '4.0.0',                          // FlowMCP-Spec-Version, major pinned to 4
    schemaVersion: '1.0.0',                    // Schema-Content-Version, free per schema (v4.1.1+)
    schemaHash: 'a1b2c3d4',                    // 8-char sha256 prefix — AUTO-GENERATED, never hand-authored
    docs: [ 'https://api.example.com/docs' ],
    tags: [ 'crypto', 'price' ],               // semantic domain tags
    root: 'https://api.example.com/v2',        // https://, no trailing slash
    requiredServerParams: [ 'CRYPTO_DATA_API_KEY' ],
    headers: { token: '{{SERVER_PARAM:CRYPTO_DATA_API_KEY}}' },
    tools: {
        getTokenPrice: {
            method: 'GET',
            path: '/price/{{address}}',
            description: 'Get current price for a token by contract address.',
            parameters: [
                {
                    position: { key: 'address', value: '{{USER_PARAM}}', location: 'insert' },
                    z: { primitive: 'string()', options: [] }
                },
                {
                    position: { key: 'currency', value: '{{USER_PARAM}}', location: 'query' },
                    z: { primitive: 'enum(usd,eur,gbp)', options: [ 'default(usd)' ] }
                }
            ],
            output: {
                mimeType: 'application/json',
                schema: { type: 'object', properties: { price: { type: 'number' }, currency: { type: 'string' } } }
            },
            meta: {
                isReadOnly: true,
                isConcurrencySafe: true,
                isDestructive: false,
                searchHint: 'token price crypto market data',
                aliases: [ 'getPrice' ],
                alwaysLoad: false
            },
            tests: [
                { _description: 'Get USDC price in USD', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', currency: 'usd' }
            ]
        }
    }
}

// Optional — only when the tool needs custom hooks (pre/post/execute).
// Factory with injected dependencies — NO import/require anywhere.
export const handlers = ( { sharedLists, libraries } ) => ( {
    getTokenPrice: {
        postRequest: async ( { response, struct, payload } ) => {
            return { response: response[ 'result' ] }
        }
    }
} )
```

Key points for v4:

- **`export const main`** is the required export. It is static and JSON-serializable
  (it must survive `JSON.parse( JSON.stringify( main ) )`).
- **`export const handlers`** is an optional **factory** `( { sharedLists, libraries } ) => ( {...} )`
  with `preRequest` / `executeRequest` / `postRequest` hooks. It contains **no `import`/`require`** —
  dependencies are injected via `sharedLists` / `libraries` (security model). Omit it for plain HTTP tools.
- **Endpoints live under `tools`** (camelCase keys, max 8). Each tool has `method`, `path`,
  `description`, `parameters`, `output`, `meta`, and `tests`.
- **Parameters are an ARRAY** of `{ position, z }` objects (see below). The legacy
  object-keyed `{ name: { type, required } }` form is gone.
- **`meta` is mandatory in v4.2.0** (one block per tool). **`output` is canonical for production**.
- **Server params** are interpolated via the `{{SERVER_PARAM:KEY}}` syntax in `headers` / parameter
  values; user input uses `{{USER_PARAM}}`.
- **Work only in `flowmcp-schemas-private`** — the public mirror is generated automatically
  (Grade A/B), never edited by hand.

---

## The 5 v3→v4 Deltas

Every schema produced or migrated here MUST reflect these:

1. **Version split** — `version: '3.0.0'` → `version: '4.X.Y'` **plus** `schemaVersion` **plus** `schemaHash` (auto-generated, never hand-authored).
2. **Parameters** — object `{ key: { type, required } }` → **array** `[ { position: { key, value, location }, z: { primitive, options } } ]`.
3. **Per-tool `output`** — add the `output: { mimeType, schema }` block.
4. **Handler factory-injection** — `( { sharedLists, libraries } ) => ({…})` instead of direct imports (zero `import`/`require`).
5. **Namespace constraint** — `/^[a-zA-Z]+$/` → `/^[a-z][a-z0-9-]*$/` (lowercase, digits, hyphens — allows `coingecko-com`).

---

## Required Fields (`main`)

| Field | Rule |
|-------|------|
| `namespace` | `/^[a-z][a-z0-9-]*$/` — lowercase letters, digits, hyphens. No underscores/uppercase. |
| `name` | PascalCase human-readable name (e.g. `SmartContractExplorer`). |
| `description` | 1–2 sentences. |
| `version` | `4.\d+.\d+` (FlowMCP-Spec-Version, major pinned to 4). |
| `schemaVersion` | `\d+\.\d+\.\d+` (Schema-Content-Version, free per schema; v4.1.1+; migrated initial value `1.0.0`). |
| `schemaHash` | 8-char sha256 prefix `[0-9a-f]{8}` — **auto-generated** (v4.1.1+), never hand-authored. |
| `root` | `https://…`, no trailing slash. |
| `tools` | camelCase tool keys, max 8. |
| `meta` | per-tool MCP integration block — **mandatory in v4.2.0**. |

Optional (commonly used): `docs`, `tags`, `requiredServerParams`, `requiredLibraries`, `headers`, `sharedLists`, `resources`, `termsOfService*`, `dataLicense*`.

---

## Parameter Form (array)

Each parameter is `{ position, z }`. `position` says where the value goes; `z` says how it is validated.

```javascript
parameters: [
    {
        position: { key: 'address', value: '{{USER_PARAM}}', location: 'insert' },
        z: { primitive: 'string()', options: [] }
    },
    {
        position: { key: 'limit', value: '{{USER_PARAM}}', location: 'query' },
        z: { primitive: 'number()', options: [ 'min(1)', 'max(100)', 'default(10)' ] }
    }
]
```

**`position`:**

| Field | Rule |
|-------|------|
| `key` | Parameter name (input field exposed to the AI client). |
| `value` | `{{USER_PARAM}}` (user input), `{{SERVER_PARAM:KEY}}` (server param), or a fixed string. |
| `location` | `insert` (URL `{{key}}` placeholder), `query` (URL query param), or `body` (JSON body, POST/PUT). |

**`z`:**

| Field | Rule |
|-------|------|
| `primitive` | `string()`, `number()`, `boolean()`, `enum(A,B,C)` (no spaces after commas), `array()`, `object()`. |
| `options` | Array of constraints, may be empty `[]`: `min(n)`, `max(n)`, `length(n)`, `optional()`, `default(value)`. |

Notes: `default(value)` implies `optional()`. Regex options are intentionally excluded. An `insert` parameter requires a matching `{{key}}` placeholder in the tool `path`.

---

## Output Block (per tool, canonical)

```javascript
output: {
    mimeType: 'application/json',
    schema: { type: 'object', properties: { /* mirror the real API response */ } }
}
```

Per spec the `output` block is technically optional, but **all real v4 production schemas declare it** — treat it as required. Mirror the actual API response structure, max 4 nesting levels, include a `description` for each property where it adds clarity.

---

## Meta Block (per tool, required v4.2.0)

```javascript
meta: {
    isReadOnly: true,
    isConcurrencySafe: true,
    isDestructive: false,
    searchHint: 'short keyword phrase for ToolSearch',
    aliases: [ 'altName' ],   // [] is valid
    alwaysLoad: false         // true only for near-universal tools
}
```

All six fields are required (VAL100–VAL106). `searchHint` must be a non-empty string.

---

## Human-Readable Enum Principle

Core design rule: enum values must be human-readable, not cryptic API codes.

```javascript
// CORRECT — human-readable
{ position: { key: 'interval', value: '{{USER_PARAM}}', location: 'query' },
  z: { primitive: 'enum(1-hour,1-day,1-week)', options: [] } }

// WRONG — API codes
{ position: { key: 'interval', value: '{{USER_PARAM}}', location: 'query' },
  z: { primitive: 'enum(h1,d1,w1)', options: [] } }
```

Convert the human-readable value to the API code inside a `preRequest` handler before the request is sent (mapping derived from injected `sharedLists` or a local lookup in the factory closure).

---

## Horizontal vs Vertical Decision

| Type | When | Example |
|------|------|---------|
| **Horizontal** | One schema covers multiple related endpoints | `crypto-prices` with an `action` enum |
| **Vertical** | Each endpoint gets its own schema | `getEthPrice`, `getBtcPrice` |

**Default:** Vertical (simpler, easier to discover). Horizontal only when endpoints share >80% parameters and enum lists stay under ~30 entries.

---

## 6-Phase Workflow

1. **Preparation** — Read API docs, identify endpoints
2. **Analysis** — Map parameters, identify enums, check rate limits
3. **Schema Creation** — Write the `.mjs` module (`export const main` with array parameters, `output`, `meta`; plus the `export const handlers` factory only if custom logic is needed)
4. **Validation** — `flowmcp validate <path>` (acceptance gate, must return 0 errors)
5. **Testing** — `flowmcp dev test single <path>` (per-tool HTTP status, env auto-loaded)
6. **Release** — Move to `flowmcp-schemas-private/schemas/v4.0.0/providers/<namespace>/`

---

## Quality Checklist

- [ ] Schema is an `.mjs` module with static `export const main`
- [ ] `version: '4.X.Y'` **plus** `schemaVersion` **plus** auto-generated `schemaHash` (never hand-authored)
- [ ] `export const handlers` is a factory `( { sharedLists, libraries } ) => ({…})` with **no `import`/`require`** — present only if custom logic is needed
- [ ] `namespace` matches `/^[a-z][a-z0-9-]*$/` and is unique (no collision in production)
- [ ] `tags` are semantic (no `namespace.toolName`)
- [ ] Tools under `tools` (camelCase, max 8) with `method`, `path`, `description`, `parameters`, `output`, `meta`, `tests`
- [ ] Parameters are an **array** of `{ position: { key, value, location }, z: { primitive, options } }`
- [ ] Every tool has an `output: { mimeType, schema }` block mirroring the real response
- [ ] Every tool has a `meta` block (all 6 fields, non-empty `searchHint`)
- [ ] Enums are human-readable
- [ ] Every tool has at least one test with a `_description` and real values
- [ ] `flowmcp validate` passes with 0 errors
- [ ] `flowmcp dev test single` passes
- [ ] Schema lives under `flowmcp-schemas-private/schemas/v4.0.0/providers/<namespace>/`
