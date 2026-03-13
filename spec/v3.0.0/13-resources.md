# FlowMCP Specification v3.0.0 — Resources

Resources provide local data access via SQLite databases and Markdown documents. They map to the MCP `server.resource` primitive and are defined in `main.resources` alongside `main.tools`. This document defines the resource format, two SQLite modes (in-memory and file-based), the origin-based storage system, Markdown resources, query definitions, parameter binding, handler integration, and validation rules.

---

## Purpose

Tools fetch data from external APIs over the network — they depend on third-party availability, rate limits, and response format stability. Some use cases require data that is **local, deterministic, and always available**: token metadata lookups, chain ID mappings, contract registries, country code tables. Other use cases require **persistent local storage** for agent-generated data: analysis results, collected metrics, scraping output.

Resources solve both by providing two SQLite modes and a Markdown document type:

```mermaid
flowchart LR
    A[Schema Definition] --> B[Resource Declaration]
    B --> C{"source?"}
    C -->|sqlite| D{"mode?"}
    C -->|markdown| E[Markdown File]
    D -->|in-memory| F["better-sqlite3\nreadonly: true"]
    D -->|file-based| G["better-sqlite3\nWAL mode"]
    F --> H[Query Results]
    G --> H
    E --> I[Text Content]
    H --> J[MCP Resource Response]
    I --> J
```

The diagram shows the data flow from the schema's resource declaration through either SQLite (two modes) or Markdown into MCP resource responses.

### When to Use Resources

| Use Case | Mechanism | Example |
|----------|-----------|---------|
| Live API data | Tool | Current token price from CoinGecko |
| Static reference data | Resource (SQLite in-memory) | Token metadata by symbol or contract address |
| Agent-generated data | Resource (SQLite file-based) | PageSpeed analysis results, collected metrics |
| API documentation | Resource (Markdown) | DuneSQL syntax reference, API field descriptions |

---

## Resource Types

FlowMCP supports two resource types, identified by the `source` field:

```mermaid
flowchart TD
    R[main.resources] --> S["source: 'sqlite'"]
    R --> D["source: 'markdown'"]

    S --> SM["mode: 'in-memory'"]
    S --> SF["mode: 'file-based'"]

    SM --> SM1["Buffer copy in RAM\nSELECT only\nFile unchanged"]
    SF --> SF1["Direct file operations\nAll SQL statements\nChanges persistent"]

    D --> D1["Markdown file\nText loaded as string\nParameter-based access"]
```

| Source | Mode | Description |
|--------|------|-------------|
| `sqlite` | `in-memory` | DB opened with `readonly: true`. SELECT only. File remains unchanged. |
| `sqlite` | `file-based` | DB opened with WAL mode. All SQL statements. Changes persistent on disk. |
| `markdown` | — | Markdown file loaded as string. Parameter-based access (section, lines, search). |

---

## SQLite Resources

### Resource Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `source` | `'sqlite'` | Yes | Resource type. Must be `'sqlite'` for SQLite resources. |
| `mode` | `'in-memory'` or `'file-based'` | Yes | Access mode. Determines readonly vs. writable. |
| `origin` | `'global'`, `'project'`, or `'inline'` | Yes | Storage location. See [Origin System](#origin-system). |
| `name` | `string` | Yes | Filename with extension. Must end with `.db`. Convention: `{namespace}-{descriptive-name}.db`. |
| `description` | `string` | Yes | What this resource provides. Appears in resource discovery. |
| `queries` | `object` | Yes | Query definitions. Must include `getSchema`. Maximum 7 schema-defined queries. |

All fields are required. There are no defaults and no optional fields.

### Mode: `in-memory`

The database is opened with `better-sqlite3` using `readonly: true`. Only SELECT statements are allowed. The file on disk is never modified.

```javascript
resources: {
    rankingDb: {
        source: 'sqlite',
        mode: 'in-memory',
        origin: 'global',
        name: 'tranco-ranking.db',
        description: 'Top 1M domain rankings from Tranco List',
        queries: {
            getSchema: {
                sql: "SELECT name, sql FROM sqlite_master WHERE type='table'",
                description: 'Returns the database schema (tables and their CREATE statements)',
                parameters: [],
                output: {
                    mimeType: 'application/json',
                    schema: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string', description: 'Table name' },
                                sql: { type: 'string', description: 'CREATE TABLE statement' }
                            }
                        }
                    }
                },
                tests: [
                    { _description: 'Get all table definitions' }
                ]
            },
            lookupDomain: {
                sql: 'SELECT rank, domain FROM rankings WHERE domain = ?',
                description: 'Look up the rank of a specific domain',
                parameters: [
                    {
                        position: { key: 'domain', value: '{{USER_PARAM}}' },
                        z: { primitive: 'string()', options: [ 'min(3)' ] }
                    }
                ],
                output: {
                    mimeType: 'application/json',
                    schema: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                rank: { type: 'number', description: 'Domain rank' },
                                domain: { type: 'string', description: 'Domain name' }
                            }
                        }
                    }
                },
                tests: [
                    { _description: 'Look up google.com', domain: 'google.com' },
                    { _description: 'Look up amazon.de', domain: 'amazon.de' },
                    { _description: 'Look up zalando.de', domain: 'zalando.de' }
                ]
            }
        }
        // freeQuery (SELECT only) is auto-injected by the runtime
    }
}
```

| Aspect | Value |
|--------|-------|
| **Runtime** | `better-sqlite3` with `readonly: true` |
| **Allowed statements** | SELECT only |
| **File changes** | Never — readonly flag on DB level |
| **Allowed origins** | `global` (recommended) or `project` |
| **Use case** | Reference data, lookups, open data |
| **getSchema** | **MUST** — defined by schema author in `queries` |
| **freeQuery** | Auto-injected by runtime (SELECT only) |

### Mode: `file-based`

The database is opened with `better-sqlite3` using WAL mode. All SQL statements are allowed. Changes are persistent on disk. Only `origin: 'project'` is allowed.

```javascript
resources: {
    analysisDb: {
        source: 'sqlite',
        mode: 'file-based',
        origin: 'project',
        name: 'pagespeed-results.db',
        description: 'PageSpeed analysis results collected by the agent',
        queries: {
            getSchema: {
                sql: "SELECT name, sql FROM sqlite_master WHERE type='table'",
                description: 'Returns the database schema (tables and their CREATE statements)',
                parameters: [],
                output: {
                    mimeType: 'application/json',
                    schema: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string', description: 'Table name' },
                                sql: { type: 'string', description: 'CREATE TABLE statement' }
                            }
                        }
                    }
                },
                tests: [
                    { _description: 'Get all table definitions' }
                ]
            },
            getLatestResults: {
                sql: 'SELECT domain, score, created_at FROM results ORDER BY created_at DESC LIMIT ?',
                description: 'Get the most recent analysis results',
                parameters: [
                    {
                        position: { key: 'limit', value: '{{USER_PARAM}}' },
                        z: { primitive: 'number()', options: [ 'min(1)', 'max(100)' ] }
                    }
                ],
                output: {
                    mimeType: 'application/json',
                    schema: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                domain: { type: 'string', description: 'Analyzed domain' },
                                score: { type: 'number', description: 'Performance score' },
                                created_at: { type: 'string', description: 'Analysis timestamp' }
                            }
                        }
                    }
                },
                tests: [
                    { _description: 'Get last 10 results', limit: 10 }
                ]
            }
        }
        // freeQuery (all statements) is auto-injected by the runtime
    }
}
```

| Aspect | Value |
|--------|-------|
| **Runtime** | `better-sqlite3` with WAL mode |
| **Allowed statements** | All — SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, DROP |
| **File changes** | Yes — persistent on disk |
| **Only allowed origin** | `project` |
| **Use case** | Analysis results, agent memory, data collection |
| **getSchema** | **MUST** — defined by schema author. CLI derives CREATE TABLE from return value. |
| **freeQuery** | Auto-injected by runtime (all statements) |
| **DB does not exist** | CLI creates DB based on getSchema |
| **Backup** | Automatic `.bak` copy before first write per session |
| **Concurrent writes** | Supported via WAL mode |

### Mode Comparison

| Aspect | `in-memory` | `file-based` |
|--------|------------|-------------|
| Runtime flag | `readonly: true` | WAL mode |
| SELECT | Yes | Yes |
| INSERT/UPDATE/DELETE | No | **Yes** |
| CREATE/DROP TABLE | No | **Yes** |
| Changes persistent | No | **Yes** |
| Allowed origins | `global`, `project` | Only `project` |
| DB must exist | Yes (warning if missing) | No (CLI creates via getSchema) |
| getSchema | **MUST** (schema-defined) | **MUST** (schema-defined) |
| Backup | Not needed | `.bak` before first write |
| Concurrent access | Yes (readonly) | Yes (WAL mode) |

### Why Only Two Modes

Only two modes exist. Either completely readonly (safe) or completely on disk (free). Clear separation:

- **In-memory** = `better-sqlite3` with `readonly: true` — no write operations possible at all
- **File-based** = `better-sqlite3` with WAL mode — full access, but only on project level

Intermediate modes (append-only, insert-but-no-delete) are intentionally omitted:

1. **Hard to enforce** — SQL is too flexible for reliable pattern matching
2. **Misleading** — they suggest safety that cannot be guaranteed
3. **Counterproductive** — they create problems without solving real ones

---

## Origin System

### Three Locations, Explicitly Defined

Instead of pseudo-paths (`~/.flowmcp/data/`, `./data/`), resources use an `origin` + `name` system. The origin determines where the file lives. The name determines the filename.

The **base folder** is configurable. Default: `flowmcp`. Changeable via CLI flag.

```mermaid
flowchart TD
    subgraph "origin: 'inline'"
        A["In schema directory\nproviders/{namespace}/resources/\ntranco-ranking.db"]
    end

    subgraph "origin: 'project'"
        B["In workspace\n.{base}/resources/\ntranco-ranking.db"]
    end

    subgraph "origin: 'global'"
        C["In user home\n~/.{base}/resources/\ntranco-ranking.db"]
    end
```

### Path Resolution

| Origin | Resolved Path | Who Creates | Description |
|--------|---------------|-------------|-------------|
| `inline` | `{schema-dir}/resources/{name}` | Schema author | Ships with the schema. Committed to repo. |
| `project` | `.{base}/resources/{name}` | User or CLI | Project-local. Not committed. |
| `global` | `~/.{base}/resources/{name}` | User (download) | System-level. Shared across projects. |

### Base Folder

| Aspect | Value |
|--------|-------|
| **Default** | `flowmcp` |
| **Configurable** | Yes, via CLI flag |
| **Affects** | `project` and `global` origins |
| **Example default** | `~/.flowmcp/resources/`, `.flowmcp/resources/` |
| **Example custom** | `~/.myagent/resources/`, `.myagent/resources/` |

### Origin Rules per Resource Type

| Origin | SQLite in-memory | SQLite file-based | Markdown |
|--------|-----------------|-------------------|----------|
| `inline` | **Not recommended** (data privacy) | **Not allowed** | **Yes** (recommended) |
| `project` | Yes | **Yes** (only allowed origin) | Yes |
| `global` | Yes (recommended) | **Not allowed** | Yes |

**Why SQLite inline is not recommended:** SQLite databases may contain personal data, proprietary datasets, or large binary files. Committing them to a schema repository exposes data to all users of the catalog. Markdown documents are text, typically documentation, and safe to commit.

**Why file-based is project-only:** Writable databases must be isolated to a single project. A writable global database could be corrupted by concurrent use from multiple projects.

### Name Field

The `name` field contains the **complete filename including extension**:

```javascript
// SQLite
name: 'tranco-ranking.db'
name: 'ofacsdn-sanctions.db'
name: 'pagespeed-results.db'

// Markdown
name: 'duneanalytics-sql-reference.md'
```

| Part | Rule | Example |
|------|------|---------|
| Prefix | Namespace of the schema | `tranco` |
| Separator | Hyphen | `-` |
| Description | Kebab-case | `ranking` |
| Extension | `.db` or `.md` | `.db` |
| **Complete** | | `tranco-ranking.db` |

The folder is always named `resources/` (not `data/`).

---

## Standard Queries

### `getSchema` — MUST (Schema-Defined)

`getSchema` is **required** for both modes. The schema author defines it in the `queries` object. It is NOT auto-injected — it must be explicitly written in the schema.

**Why MUST for both modes:**

- **In-memory:** The agent needs the DB structure to formulate meaningful queries via freeQuery
- **File-based:** The CLI needs the structure to create the DB and tables when the file does not exist

**getSchema and CREATE TABLE:** The CLI can derive CREATE TABLE statements from the getSchema return value (table names, column names, column types). No separate `createSchema` query is needed.

```javascript
getSchema: {
    sql: "SELECT name, sql FROM sqlite_master WHERE type='table'",
    description: 'Returns the database schema (tables and their CREATE statements)',
    parameters: [],
    output: {
        mimeType: 'application/json',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Table name' },
                    sql: { type: 'string', description: 'CREATE TABLE statement' }
                }
            }
        }
    },
    tests: [
        { _description: 'Get all table definitions' }
    ]
}
```

### `freeQuery` — Auto-Injected by Runtime

`freeQuery` is automatically added by the runtime. Schema authors do **not** define it manually.

| Aspect | in-memory | file-based |
|--------|----------|-----------|
| SELECT | Yes | Yes |
| INSERT | No | Yes |
| UPDATE | No | Yes |
| DELETE | No | Yes |
| CREATE TABLE | No | Yes |
| DROP TABLE | No | Yes |
| LIMIT default | 100 (max 1000) | 100 (max 1000) |

For `in-memory`, the auto-injected freeQuery enforces SELECT-only via runtime checks. For `file-based`, all SQL statements are allowed.

### Query Limits

| Type | Count |
|------|-------|
| Auto-injected | 1 (freeQuery) |
| Schema-defined (including getSchema) | Max 7 |
| **Total** | **Max 8** |

### Summary Table

| Query | in-memory | file-based |
|-------|----------|-----------|
| `getSchema` | **MUST** (schema-defined) | **MUST** (schema-defined) |
| `freeQuery` | Auto-injected (SELECT only) | Auto-injected (all statements) |
| Domain queries | Schema-defined | Schema-defined |

---

## Markdown Resources

### `source: 'markdown'`

Markdown resources provide text documents as MCP resources. They are intended for API documentation, syntax references, and other text content that an agent needs alongside tools.

```javascript
resources: {
    sqlReference: {
        source: 'markdown',
        origin: 'inline',
        name: 'duneanalytics-sql-reference.md',
        description: 'Complete DuneSQL syntax reference — functions, datatypes, table catalog'
    }
}
```

### Markdown Resource Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `source` | `'markdown'` | Yes | Resource type. Must be `'markdown'`. |
| `origin` | `'global'`, `'project'`, or `'inline'` | Yes | Storage location. `inline` recommended. |
| `name` | `string` | Yes | Filename with `.md` extension. |
| `description` | `string` | Yes | What this document contains. |

All fields are required. There is no `mode` field (Markdown is always read-only) and no `queries` field.

### Parameter-Based Access

Markdown resources support parameter-based access for large documents. The runtime auto-injects access functions similar to how it auto-injects `freeQuery` for SQLite resources.

```mermaid
flowchart LR
    A[Markdown Resource] --> B{"Size?"}
    B -->|"Small (< 100 KB)"| C["Load full document\n(default behavior)"]
    B -->|"Large (> 100 KB)"| D["Use access parameters"]
    D --> D1["section: '## Functions'"]
    D --> D2["lines: '11-33'"]
    D --> D3["search: 'CREATE TABLE'"]
```

| Parameter | Type | Description |
|-----------|------|-------------|
| *(none)* | — | Full document as string (default) |
| `section` | `string` | Markdown heading name (e.g. `'## Functions'`) |
| `lines` | `string` | Line range as `'from-to'` (e.g. `'11-33'`) |
| `search` | `string` | Text search, returns matches with context lines |

These access parameters are auto-injected by the runtime. Schema authors do not define them.

### Markdown Constraints

| Aspect | Value |
|--------|-------|
| **File format** | Only `.md` (Markdown) |
| **Max size** | ~2 MB (recommendation) |
| **Behavior** | File is read, content returned as string |
| **Recommended origin** | `inline` (committed with schema) |
| **No queries field** | Text is loaded directly |
| **Referenceable** | `[[namespace/resource/name]]` from prompts |

### Why Only Markdown

- **Uniform format** — no parser variety needed
- **AI-friendly** — Markdown is the most natural format for LLMs
- **Renderable** — can be displayed in documentation
- **No ambiguity** — JSON/YAML would raise questions (parse or treat as text?)

### Resolved Path Example

```
{schema-dir}/resources/duneanalytics-sql-reference.md
```

---

## Security Model

### In-Memory: Safe by Architecture

| Layer | What Happens |
|-------|-------------|
| DB opened with `readonly: true` | `better-sqlite3` enforces read-only at DB level |
| Only SELECT in freeQuery | Runtime enforces SELECT-only |
| File unchanged | No write operations possible at all |

No block patterns needed. `better-sqlite3` with `readonly: true` prevents all write operations at the database level. This is more reliable than pattern-matching on SQL strings.

### File-Based: Conscious Decision

| Layer | What Happens |
|-------|-------------|
| Only project-level | No access to global or inline DBs |
| All statements allowed | User has consciously chosen file-based |
| CLI asks on creation | User must confirm |
| Backup before first write | `.bak` copy as safety net |
| WAL mode | Concurrent access safely possible |
| Changes persistent | Intended — that is the purpose |

No block patterns. Schema authors who choose `file-based` want to write. Restrictions would only suggest safety that cannot be guaranteed.

### Summary

```mermaid
flowchart LR
    subgraph "in-memory"
        A["better-sqlite3\nreadonly: true"] --> B[SELECT only]
        B --> C[File unchanged]
    end

    subgraph "file-based"
        D["better-sqlite3\nWAL mode"] --> E[All statements]
        E --> F[Changes persistent]
    end

    subgraph "Protection"
        G["in-memory: DB-level readonly"]
        H["file-based: project-only + backup"]
    end
```

---

## CLI: Database Creation

### Problem

For `file-based` databases at project level, the DB must exist before the agent can write. But who creates it?

### Solution: CLI Creates on Demand

```mermaid
flowchart TD
    A[Agent wants to write to DB] --> B{"DB exists?"}
    B -->|Yes| C[Write]
    B -->|No| D[Error returned to agent]
    D --> E[Agent calls CLI]
    E --> F{"Resource defined?\nsource: sqlite\nmode: file-based"}
    F -->|Yes| G["CLI asks user:\nCreate database {name}?"]
    G -->|"User: Yes"| H["Create DB + tables\nderived from getSchema"]
    G -->|"User: No"| I[Abort]
    F -->|No| J["Error: No writable resource defined"]
```

### Rules

| Rule | Value |
|------|-------|
| CLI creates DB | Only when `source: 'sqlite'` + `mode: 'file-based'` + DB missing |
| User confirmation | **Required** — CLI always asks |
| Path | Always `project`: `.{base}/resources/{name}` |
| getSchema | **MUST** for file-based — CLI derives table structure from it |
| Backup | `.bak` copy before first write (for existing DB) |

### Backup Strategy

Before the first write operation per session, the runtime automatically creates a `.bak` copy:

```
.flowmcp/resources/pagespeed-results.db      <- active DB
.flowmcp/resources/pagespeed-results.db.bak  <- backup before first write
```

| Aspect | Value |
|--------|-------|
| **When** | Before the first write statement per session |
| **Where** | Same directory, `.bak` extension |
| **Overwrite** | Yes — always the latest backup |
| **Deletable** | Yes — `.bak` file can be deleted anytime |
| **Recovery** | Rename `.bak` to `.db` |

---

## Runtime: better-sqlite3

### One Runtime for Both Modes

`better-sqlite3` is the unified runtime for all SQLite resources, replacing `sql.js`:

| Aspect | sql.js (v3.0.0) | better-sqlite3 (v3.1.0) |
|--------|-----------------|------------------------|
| **In-memory** | `readFileSync` -> Buffer -> `new SQL.Database(buffer)` | `new Database(path, { readonly: true })` |
| **File-based** | Not possible (RAM only) | `new Database(path)` + `pragma journal_mode = WAL` |
| **Readonly** | No native support | `readonly: true` flag |
| **WAL mode** | Not supported | Natively supported |
| **Concurrent access** | No | Yes (with WAL mode) |
| **Performance** | Slower (WebAssembly) | Faster (native C binding) |
| **Installation** | Pure JS (no build needed) | Requires native build (node-gyp) |

### Why One Runtime

- **No feature split** — no "this only works in this mode because different library" problems
- **WAL mode** — concurrent writes only possible with `better-sqlite3`
- **Real readonly** — `readonly: true` at DB level instead of pattern matching on SQL strings
- **Performance** — native C binding instead of WebAssembly

### Trade-off: Native Build

`better-sqlite3` requires `node-gyp` (C compiler). This is a trade-off:

- **Pro:** Performance, WAL, real readonly, one runtime for everything
- **Contra:** Native build needed, can cause issues on some systems

Decision: The advantages outweigh the disadvantages. `node-gyp` is standard in Node.js projects. `better-sqlite3` is a core dependency (not optional).

### Code Examples

```javascript
// in-memory
import Database from 'better-sqlite3'
const db = new Database( path, { readonly: true } )
const rows = db.prepare( 'SELECT * FROM rankings WHERE domain = ?' ).all( 'google.com' )

// file-based
const db = new Database( path )
db.pragma( 'journal_mode = WAL' )
db.prepare( 'INSERT INTO results (domain, score) VALUES (?, ?)' ).run( 'google.com', 95 )
```

---

## Query Definition

Each query defines a SQL prepared statement, its parameters, output schema, and tests.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sql` | `string` | Yes | SQL prepared statement with `?` placeholders for parameter binding. |
| `description` | `string` | Yes | What this query does. Appears in the MCP resource description. |
| `parameters` | `array` | Yes | Parameter definitions using the `position` + `z` system. Can be empty `[]` for no-parameter queries. |
| `output` | `object` | Yes | Output schema declaring expected result shape. Uses the same format as tool output schemas (see `04-output-schema.md`). |
| `tests` | `array` | Yes | Executable test cases. At least 1 per query. |

### SQL Field

A SQL prepared statement using `?` as the placeholder for bound parameters. Parameters are bound in the order they appear in the `parameters` array.

```javascript
// Single parameter
sql: 'SELECT * FROM tokens WHERE symbol = ? COLLATE NOCASE'

// Multiple parameters — bound in array order
sql: 'SELECT * FROM tokens WHERE address = ? AND chain_id = ?'

// No parameters
sql: 'SELECT DISTINCT chain_id, chain_name FROM tokens ORDER BY chain_id'
```

For `in-memory` resources, only `SELECT` statements and `WITH` (CTE) expressions are allowed in schema-defined queries. For `file-based` resources, all SQL statements are allowed.

### Dynamic SQL (`{{DYNAMIC_SQL}}`)

For resources where the AI client needs to write its own SQL queries (e.g., exploratory data analysis), the special placeholder `{{DYNAMIC_SQL}}` signals that the SQL comes from the user at runtime.

This is used by the auto-injected `freeQuery`. Schema authors do not normally need to use `{{DYNAMIC_SQL}}` directly — it is documented here for completeness.

#### `{{DYNAMIC_SQL}}` Rules

1. **Runtime security checks** — for `in-memory`, user SQL must start with `SELECT` and must not contain write operations. For `file-based`, all statements are allowed.
2. **Automatic LIMIT** — the runtime appends `LIMIT {n}` to SELECT queries if no LIMIT clause is present. Default: 100, maximum: 1000.
3. **The `sql` parameter** — provides the user's SQL query.
4. **The `limit` parameter** — optional, controls the automatic LIMIT.

---

## Parameters

Resource parameters use the same `position` + `z` system as tool parameters (see `02-parameters.md`), with one key difference: **resource parameters have no `location` field**.

### Why No `location`

Tool parameters need `location` (`query`, `body`, `insert`) because they are placed into HTTP requests. Resource parameters are bound to SQL `?` placeholders — their position is determined by array order, not by an HTTP request structure.

### Parameter Structure

```javascript
{
    position: { key: 'symbol', value: '{{USER_PARAM}}' },
    z: { primitive: 'string()', options: [ 'min(1)' ] }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `position.key` | `string` | Yes | Parameter name exposed to the AI client. |
| `position.value` | `string` | Yes | Must be `'{{USER_PARAM}}'` for user-provided values, or a fixed string. |
| `z.primitive` | `string` | Yes | Zod-based type declaration. Same primitives as tool parameters. |
| `z.options` | `string[]` | Yes | Validation constraints. Same options as tool parameters. |

### Binding Order

Parameters are bound to `?` placeholders in array order. The first parameter in the array binds to the first `?` in the SQL statement, the second to the second `?`, and so on.

```javascript
// SQL: SELECT * FROM tokens WHERE address = ? AND chain_id = ?
//                                             ^               ^
//                                     parameter[0]     parameter[1]

parameters: [
    {
        position: { key: 'address', value: '{{USER_PARAM}}' },
        z: { primitive: 'string()', options: [ 'min(42)', 'max(42)' ] }
    },
    {
        position: { key: 'chainId', value: '{{USER_PARAM}}' },
        z: { primitive: 'number()', options: [ 'min(1)' ] }
    }
]
```

The number of parameters must match the number of `?` placeholders in the SQL statement. A mismatch is a validation error.

### Supported Primitives

Resource parameters support scalar Zod primitives only:

| Primitive | Description | Example |
|-----------|-------------|---------|
| `string()` | String value | `'string()'` |
| `number()` | Numeric value | `'number()'` |
| `boolean()` | Boolean value | `'boolean()'` |
| `enum(A,B,C)` | One of the listed values | `'enum(ethereum,polygon,arbitrum)'` |

The `array()` and `object()` primitives are not supported for resource parameters — SQL parameter binding accepts only scalar values.

---

## Handler Integration

Resources support optional handlers for post-processing query results. Resource handlers are defined in the `handlers` export, nested under the resource name and query name:

```javascript
export const handlers = ( { sharedLists, libraries } ) => ( {
    tokenLookup: {
        bySymbol: {
            postRequest: async ( { response, struct, payload } ) => {
                const enriched = response
                    .map( ( row ) => {
                        const { address, chain_id } = row
                        const explorerUrl = `https://etherscan.io/token/${address}`

                        return { ...row, explorerUrl }
                    } )

                return { response: enriched }
            }
        }
    }
} )
```

### Handler Structure

Resource handlers are nested one level deeper than tool handlers:

```
handlers
  +-- {resourceName}          (tool handlers are at this level)
       +-- {queryName}
            +-- postRequest   (same signature as tool postRequest)
```

### Handler Type

| Handler | When | Input | Must Return |
|---------|------|-------|-------------|
| `postRequest` | After query execution | `{ response, struct, payload }` | `{ response }` |

Resource handlers only support `postRequest`. There is no `preRequest` for resources because there is no HTTP request to modify — the query is executed directly against the local database.

### Handler Rules

1. **Handlers are optional.** Queries without handlers return the raw SQL result rows directly.
2. **Only `postRequest` is supported.** Resource handlers transform query results, not query construction.
3. **Same security restrictions apply.** Resource handlers follow the same rules as tool handlers: no imports, no restricted globals, pure transformations only. See `05-security.md`.
4. **Return shape must match.** `postRequest` must return `{ response }`.

---

## Tests

Resource queries use the same test format as tool tests (see `10-tests.md`). Each test provides parameter values for a query execution against the database.

```javascript
tests: [
    { _description: 'Well-known stablecoin (USDC)', symbol: 'USDC' },
    { _description: 'Major L1 token (ETH)', symbol: 'ETH' },
    { _description: 'Case-insensitive match (lowercase)', symbol: 'wbtc' }
]
```

### Test Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_description` | `string` | Yes | What this test demonstrates |
| `{paramKey}` | matches parameter type | Yes (per required param) | Value for each `{{USER_PARAM}}` parameter |

### Test Count

| Scenario | Minimum | Recommended |
|----------|---------|-------------|
| Query with no parameters | 1 | 1 |
| Query with 1-2 parameters | 1 | 2-3 |
| Query with enum parameters | 1 | 2-3 (different enum values) |

Minimum: 1 test per query is required. A query without tests is a validation error.

---

## Execution Flow

```mermaid
flowchart TD
    A[Schema Load] --> B{"source?"}
    B -->|sqlite| C{"mode?"}
    B -->|markdown| D[Read file as string]
    C -->|in-memory| E["Open DB with readonly: true"]
    C -->|file-based| F{"DB exists?"}
    F -->|Yes| G["Open DB with WAL mode"]
    F -->|No| H["CLI creates DB via getSchema"]
    H --> G
    E --> I[Receive query request]
    G --> I
    I --> J{"DYNAMIC_SQL?"}
    J -->|Yes| K[Runtime security check]
    J -->|No| L[Execute prepared statement]
    K --> M[Execute user SQL with LIMIT]
    L --> N[Return result rows]
    M --> N
    N --> O{"Handler exists?"}
    O -->|Yes| P[postRequest transforms rows]
    O -->|No| Q[Return rows directly]
    P --> R[Wrap in response envelope]
    Q --> R
    D --> S[Return text content]
```

---

## Coexistence with Tools

A schema can define both `tools` and `resources` in the same `main` export:

```javascript
export const main = {
    namespace: 'tokens',
    name: 'TokenExplorer',
    description: 'Token data from API and local database',
    version: '3.0.0',
    root: 'https://api.coingecko.com/api/v3',
    tools: {
        getPrice: {
            method: 'GET',
            path: '/simple/price',
            description: 'Get current token price from CoinGecko API',
            parameters: [ /* ... */ ],
            tests: [ /* ... */ ]
        }
    },
    resources: {
        tokenMetadata: {
            source: 'sqlite',
            mode: 'in-memory',
            origin: 'global',
            name: 'tokens-metadata.db',
            description: 'Token metadata from local database',
            queries: {
                getSchema: { /* ... */ },
                bySymbol: { /* ... */ }
            }
        }
    }
}
```

### Coexistence Rules

1. **`tools` and `resources` are independent.** A schema can have tools only, resources only, or both.
2. **Limits are separate.** The 8-tool limit and 2-resource limit are independent constraints.
3. **Handlers are namespaced.** Tool handlers are keyed by tool name, resource handlers are keyed by resource name then query name. There is no collision because resource handlers are nested one level deeper.
4. **`root` is not required when a schema has only resources.** The `root` field provides the base URL for HTTP tools. A resource-only schema does not make HTTP calls and may omit `root`.

---

## Limits

| Constraint | Value | Rationale |
|------------|-------|-----------|
| Max resources per schema | 2 | Keeps schemas focused. Resources should be tightly scoped to one data domain. |
| Max schema-defined queries per resource | 7 | Including getSchema. Plus 1 auto-injected freeQuery = 8 total. |
| Query name pattern | `^[a-z][a-zA-Z0-9]*$` | camelCase, consistent with tool names. |
| Resource name pattern | `^[a-z][a-zA-Z0-9]*$` | camelCase, consistent with tool names. |
| Database file extension | `.db` | Standardized file extension for SQLite databases. |
| Markdown file extension | `.md` | Standardized file extension for Markdown documents. |
| Resource folder name | `resources/` | Standardized folder name (not `data/`). |
| `source` value | `'sqlite'` or `'markdown'` | Only these two types are supported. |
| `mode` value (sqlite only) | `'in-memory'` or `'file-based'` | Two explicit modes. |
| `origin` value | `'global'`, `'project'`, or `'inline'` | Three storage locations. |
| `freeQuery` LIMIT | Default 100, max 1000 | Prevents unbounded result sets. |
| All fields | Required | No defaults, no optional fields. |

---

## Hash Calculation

Resource definitions participate in schema hash calculation with specific inclusion and exclusion rules:

### Included in Hash

The following fields are part of the `main` export and therefore included in the schema hash (via `JSON.stringify()`):

- Resource name (object key)
- `source`, `mode`, `origin`, `name`
- `description`
- Query definitions (`sql`, `description`, `parameters`, `output`, `tests`)

### Excluded from Hash

| Excluded | Reason |
|----------|--------|
| Database file contents | Data updates should not invalidate the schema hash. |
| Markdown file contents | Same reasoning as database contents. |
| Handler code | Consistent with tool handler exclusion. Handler functions are in the `handlers` export, not in `main`. |

---

## Naming Conventions

| Element | Convention | Pattern | Example |
|---------|-----------|---------|---------|
| Resource name | camelCase | `^[a-z][a-zA-Z0-9]*$` | `tokenLookup`, `chainConfig` |
| Query name | camelCase | `^[a-z][a-zA-Z0-9]*$` | `bySymbol`, `byAddress`, `getSchema` |
| Parameter key | camelCase | `^[a-z][a-zA-Z0-9]*$` | `symbol`, `chainId` |
| Database filename | kebab-case with namespace prefix | `^[a-z][a-z0-9-]*\.db$` | `tranco-ranking.db`, `ofacsdn-sanctions.db` |
| Markdown filename | kebab-case with namespace prefix | `^[a-z][a-z0-9-]*\.md$` | `duneanalytics-sql-reference.md` |
| Resource folder | `resources/` | Fixed | Not `data/` |

---

## Validation Rules

The following rules are enforced when validating resource definitions:

| Code | Severity | Rule |
|------|----------|------|
| RES001 | error | `source` must be `'sqlite'` or `'markdown'`. |
| RES002 | error | `description` must be a non-empty string. |
| RES003 | error | `mode` is required for `source: 'sqlite'` and must be `'in-memory'` or `'file-based'`. |
| RES004 | error | `origin` is required and must be `'global'`, `'project'`, or `'inline'`. |
| RES005 | error | `name` is required, must be a non-empty string with the correct extension (`.db` for sqlite, `.md` for markdown). |
| RES006 | error | Maximum 2 resources per schema. |
| RES007 | error | Maximum 7 schema-defined queries per SQLite resource (8 total with auto-injected freeQuery). |
| RES008 | error | Each query must have a `sql` field of type string. |
| RES009 | error | Each query must have a `description` field of type string. |
| RES010 | error | Each query must have a `parameters` array. |
| RES011 | error | Each query must have an `output` object with `mimeType` and `schema`. |
| RES012 | error | Each query must have at least 1 test. |
| RES013 | error | For `mode: 'in-memory'`, schema-defined SQL must begin with `SELECT` or `WITH` (CTE). |
| RES014 | error | Number of parameters must match number of `?` placeholders in the SQL statement. |
| RES015 | error | Resource parameters must not have a `location` field in `position`. |
| RES016 | error | Resource parameters must not use `{{SERVER_PARAM:...}}` values. |
| RES017 | error | Resource name must match `^[a-z][a-zA-Z0-9]*$` (camelCase). |
| RES018 | error | Query name must match `^[a-z][a-zA-Z0-9]*$` (camelCase). |
| RES019 | error | Resource parameter primitives must be scalar: `string()`, `number()`, `boolean()`, or `enum()`. |
| RES020 | warning | Database file should exist at validation time. Missing file produces a warning. |
| RES021 | error | `output.schema.type` must be `'array'` for resource queries. |
| RES022 | error | Test parameter values must pass the corresponding `z` validation. |
| RES023 | error | Test objects must be JSON-serializable. |
| RES024 | error | SQLite resources must include a `getSchema` query. |
| RES025 | error | `mode: 'file-based'` requires `origin: 'project'`. |
| RES026 | error | `source: 'markdown'` must not have a `mode` field. |
| RES027 | error | `source: 'markdown'` must not have a `queries` field. |
| RES028 | warning | `source: 'sqlite'` with `origin: 'inline'` is not recommended (data privacy). |
| RES029 | error | All resource fields are required. No field may be omitted. |

---

## Complete Example

A full schema combining SQLite in-memory, SQLite file-based, and Markdown resources with tools and prompts:

```javascript
export const main = {
    namespace: 'duneanalytics',
    name: 'Dune Analytics',
    description: 'Query blockchain data with DuneSQL',
    version: '3.0.0',

    tools: {
        executeQuery: { method: 'POST', path: '/api/v1/query', /* ... */ },
        getExecutionResults: { method: 'GET', path: '/api/v1/execution/:id/results', /* ... */ },
        getLatestResults: { method: 'GET', path: '/api/v1/query/:id/results', /* ... */ }
    },

    resources: {
        sqlReference: {
            source: 'markdown',
            origin: 'inline',
            name: 'duneanalytics-sql-reference.md',
            description: 'DuneSQL syntax — functions, datatypes, tables'
        },
        queryTemplates: {
            source: 'sqlite',
            mode: 'in-memory',
            origin: 'global',
            name: 'duneanalytics-templates.db',
            description: 'Pre-built query templates for common blockchain analytics',
            queries: {
                getSchema: {
                    sql: "SELECT name, sql FROM sqlite_master WHERE type='table'",
                    description: 'Returns the database schema',
                    parameters: [],
                    output: {
                        mimeType: 'application/json',
                        schema: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', description: 'Table name' },
                                    sql: { type: 'string', description: 'CREATE TABLE statement' }
                                }
                            }
                        }
                    },
                    tests: [
                        { _description: 'Get all table definitions' }
                    ]
                },
                searchTemplates: {
                    sql: 'SELECT name, description, sql FROM templates WHERE category = ?',
                    description: 'Search query templates by category',
                    parameters: [
                        {
                            position: { key: 'category', value: '{{USER_PARAM}}' },
                            z: { primitive: 'string()', options: [ 'min(1)' ] }
                        }
                    ],
                    output: {
                        mimeType: 'application/json',
                        schema: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', description: 'Template name' },
                                    description: { type: 'string', description: 'Template description' },
                                    sql: { type: 'string', description: 'SQL query template' }
                                }
                            }
                        }
                    },
                    tests: [
                        { _description: 'Find DeFi templates', category: 'defi' },
                        { _description: 'Find NFT templates', category: 'nft' }
                    ]
                }
            }
        }
    },

    prompts: {
        about: {
            name: 'about',
            version: 'flowmcp-prompt/1.0.0',
            namespace: 'duneanalytics',
            description: 'Overview of Dune Analytics — tools, resources, DuneSQL workflow',
            dependsOn: [ 'executeQuery', 'getExecutionResults', 'getLatestResults' ],
            references: [],
            contentFile: './prompts/about.mjs'
        }
    }
}
```

### Directory Structure

```
providers/
+-- duneanalytics/
    +-- analytics.mjs                        # Schema (main export)
    +-- prompts/
    |   +-- about.mjs                        # Content for about prompt
    +-- resources/
        +-- duneanalytics-sql-reference.md   # Markdown resource (inline)
```

The SQLite database `duneanalytics-templates.db` is not in the schema directory — its `origin: 'global'` places it at `~/.flowmcp/resources/duneanalytics-templates.db`.
