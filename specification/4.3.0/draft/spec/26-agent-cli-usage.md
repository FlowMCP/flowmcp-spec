# 26. Agent CLI Usage Contract

| Field | Value |
|---|---|
| Status | Normative |
| Depends on | [00-overview.md](./00-overview.md), [16-id-schema.md](./16-id-schema.md) |
| Related | [05-security.md](./05-security.md), [13-resources.md](./13-resources.md), [15-catalog.md](./15-catalog.md), [24-philosophy.md](./24-philosophy.md) |

This chapter is the normative contract for how an AI client or an agent uses the FlowMCP CLI to discover and invoke tools. Where [24-philosophy.md](./24-philosophy.md) explains *why* the interaction model is shaped the way it is (search-then-call, disabled-not-broken, fail loudly), this chapter states the binding rules an agent MUST follow. It is the specification home for the FlowMCP usage and SOP skills.

The contract has one governing idea: **the catalog an agent can see is exactly the catalog it can use, and every callable name is the same across `search`, `call`, and `serve`.** There is no activation step, no hidden registry, and no per-surface name drift.

---

## The Two-Move Workflow

An agent interacts with the trusted catalog through exactly two moves. There is no third, intermediate move.

| Step | Move | Command | Returns |
|------|------|---------|---------|
| Discover | `search` / `list` | `flowmcp search <query>` · `flowmcp list` | Matching tools, each with its `requiredParams` and a callable `example` |
| Invoke | `call` | `flowmcp call <tool-name> '{json}'` | The live result of the tool, called directly |

Rules:

1. An agent MUST discover a tool through `search` or `list` before calling it, and MUST read the `requiredParams` and `example` from the discovery result to build the call — it MUST NOT construct tool names or parameter shapes from memory.
2. An agent MUST NOT perform any activation, registration, installation, or enable step between discovery and invocation. No such step exists — a tool that appears in `search`/`list` is immediately callable via `call`.
3. Every tool in the folders configured in `schemaFolders[]` (see [15-catalog.md](./15-catalog.md)) is part of the trusted catalog and is discoverable and callable without further ceremony.
4. `list` MAY be used instead of `search` to enumerate the whole catalog; `flowmcp call list-tools` enumerates the callable wire names (tools **and** resource queries, see [Call-ID Grammar](#call-id-grammar)).

This two-move model is normative precisely because a gap between discovery and use — a tool that is visible but needs a separate step before it runs — is a trap for an autonomous agent.

---

## Private Ad-Hoc Calls

A schema that is **not** registered in `schemaFolders[]` is never part of the trusted catalog: it does not appear in `search`, `list`, or an MCP `serve` session (invisibility is structural, see [05-security.md](./05-security.md)). Such a schema is invoked by its exact file path through a distinct move:

```
flowmcp private call <schema-path> <tool> '{json}'
```

Rules:

1. `private call` takes an explicit filesystem path to the schema file, a tool (or resource-query) name, and a JSON argument object.
2. The runtime MUST run the security scan **before** any `import()` of the private schema file. A file matching a forbidden pattern is rejected and never executed. Only a clean file is imported and run. See [05-security.md](./05-security.md) (the "scan on the private path" rule).
3. A private schema MUST NOT be written into `schemaFolders[]` and MUST NOT be merged into the shared catalog. `private call` is the single supported way to invoke it — there is no registered "private folder".
4. `private call` resolves resource queries the same way `call` does: a resource query is addressed by its wire name `${queryName}_${namespace}` (see [Call-ID Grammar](#call-id-grammar)).

---

## Parameter Types

The JSON argument object passed to `call` / `private call` is built from the parameter declarations carried in the discovery result. An agent MUST supply parameters that conform to the declared type.

| Declared type | Meaning | Example declaration |
|---------------|---------|---------------------|
| `string` | Text value | `"address": { "type": "string", "required": true }` |
| `number` | Numeric value | `"start": { "type": "number", "required": false }` |
| `enum` | One value from a fixed list | `"interval": { "type": "enum", "values": ["h1", "d1"] }` |
| `array` | List of values | `"ids": { "type": "array", "required": true }` |

Modifiers:

- `"required": true` — the parameter MUST be present in the call. A missing required parameter MUST fail loudly (no silent default, see [24-philosophy.md](./24-philosophy.md)); it MUST NOT be substituted with an invented value.
- `"required": false` — the parameter MAY be omitted.
- `"default": <value>` — when the parameter is omitted, the runtime applies the declared default. Defaults are always declared in the schema; the runtime MUST NOT invent an undeclared default.

For an `enum` parameter, the supplied value MUST be one of the declared `values`. The full parameter model is specified in [02-parameters.md](./02-parameters.md).

---

## Disabled Tools — Missing Keys

A tool whose required credential (a `requiredServerParams` key, see [15-catalog.md](./15-catalog.md)) is not present in the environment is **disabled, not hidden and not removed**.

Rules:

1. A key-gated tool with a missing key MUST still appear in `search` / `list`, clearly labeled `[disabled: missing KEY]`, naming the exact credential it requires.
2. Calling a disabled tool MUST return a clear, actionable message that names the missing key and states that the other tools remain callable — it MUST NOT throw an opaque framework error.
3. A missing key MUST NOT hide the capability and MUST NOT silently return empty data disguised as success.

This "disabled, not broken" behavior is honesty about credentials: the capability exists, the message names precisely what it needs to come online, and every other tool stays usable.

---

## Call-ID Grammar

Every reference an agent uses resolves through the ID schema in [16-id-schema.md](./16-id-schema.md). The forms an agent encounters are:

| Form | Slashes | Meaning | Example |
|------|---------|---------|---------|
| `namespace` | 0 | A whole namespace / provider | `weather` |
| `namespace/schema-name` | 1 | A schema file (container) | `directory-io/records` |
| `namespace/tool/name` | 2 | A tool primitive | `weather/tool/getForecast` |
| `namespace/resource/name` | 2 | A resource primitive | `weather/resource/supportedCities` |
| `namespace/prompt/name` | 2 | A prompt primitive | `weather/prompt/forecast-summary` |
| `namespace/selection/name` | 2 | A selection | `record-research/selection/lookup` |

Any form MAY carry an optional source coordinate prefix `<source>:` to pin one folder when the CLI aggregates several `schemaFolders[]` that expose the same namespace — e.g. `folder-b:weather/tool/getForecast` (see [16-id-schema.md](./16-id-schema.md#source-coordinate)). Short form (a bare name without namespace/type) is not supported.

### MCP Wire Names

The MCP protocol forbids `/` in tool names, so the CLI maps a Spec-ID to an internal wire name with the `name_namespace` rule. Two cases matter to an agent that reads a served tool list:

| Primitive | Wire name | Example |
|-----------|-----------|---------|
| Tool | `${routeName}_${namespace}` | `getForecast_weather` |
| Resource query | `${queryName}_${namespace}` | `searchMail_mailarchive` |

A resource does not map to a single tool: **each query it declares is exposed as its own callable wire name** `${queryName}_${namespace}` — the query name, not the resource name, is the wire name. The auto-injected `runSql` and `describeTables` follow the same rule (`runSql_${namespace}`, `describeTables_${namespace}`). This wire name MUST be identical across `search` (advertised), `call` (resolved), and `serve` (registered) — a single canonical convention with no per-surface drift. See [13-resources.md](./13-resources.md#mcp-exposure-of-resource-queries).

---

## Forbidden Patterns

An agent MUST NOT:

1. Call `flowmcp schemas` directly — the output is unbounded.
2. Pipe CLI output through `node -e`, `sh -c`, or similar shells to post-process it.
3. Guess flags. Flags that are not declared in a command's help do not exist and MUST NOT be invented.
4. Construct tool wire names, Spec-IDs, or schema paths by hand — these come from the `search` / `list` result.
5. Use an activation, registration, or install step (`add`, `group`, `import`, `update`) — none exist; every catalog tool is immediately callable.
6. Treat an HTTP 4xx/5xx or an empty result as success — a call that does not return real data is a failure, not a pass.

Structural validation and grading are separate developer-track commands (`flowmcp schema-check`, `flowmcp grading …`, `flowmcp doctor`, `flowmcp --version`) and are not part of the agent invocation path.

---

<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./00-overview.md](./00-overview.md) — see chapter 00.
- [./05-security.md](./05-security.md) — see chapter 05.
- [./13-resources.md](./13-resources.md) — see chapter 13.
- [./15-catalog.md](./15-catalog.md) — see chapter 15.
- [./16-id-schema.md](./16-id-schema.md) — see chapter 16.
- [./24-philosophy.md](./24-philosophy.md) — see chapter 24.
