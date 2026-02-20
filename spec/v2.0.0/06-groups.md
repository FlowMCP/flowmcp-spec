# FlowMCP Specification v2.0.0 — Cherry-Pick Groups

Groups allow users to create named collections of specific tools from across multiple schemas. Instead of activating entire schemas, users cherry-pick individual routes they need.

---

## Purpose

A typical FlowMCP installation has hundreds of schemas with thousands of routes. Most projects only need a handful of specific tools. Groups solve this by letting users:

1. **Select specific routes** from any schema
2. **Name the collection** for reuse
3. **Verify integrity** with cryptographic hashes
4. **Share collections** across projects and teams

---

## Group Definition

Groups are defined in a project's `.flowmcp/groups.json`:

```json
{
    "specVersion": "2.0.0",
    "groups": {
        "my-crypto-monitor": {
            "description": "Crypto price and TVL monitoring tools",
            "tools": [
                "etherscan/contracts.mjs::getContractAbi",
                "coingecko/coins.mjs::getSimplePrice",
                "coingecko/coins.mjs::getCoinMarkets",
                "defillama/protocols.mjs::getTvlProtocol"
            ],
            "hash": "sha256:a1b2c3d4e5f6..."
        },
        "defi-analytics": {
            "description": "DeFi protocol analysis tools",
            "tools": [
                "defillama/protocols.mjs::getProtocols",
                "defillama/protocols.mjs::getTvlProtocol",
                "dune/queries.mjs::executeQuery"
            ],
            "hash": "sha256:f6e5d4c3b2a1..."
        }
    }
}
```

The `specVersion` field declares which FlowMCP specification version the groups file conforms to. This allows future versions to extend the format without breaking existing files.

---

## Tool Reference Format

Tools are referenced as: `namespace/schemaFile::routeName`

| Part | Description | Example |
|------|-------------|---------|
| `namespace` | Provider namespace | `etherscan` |
| `schemaFile` | Schema filename | `contracts.mjs` |
| `routeName` | Route name within the schema | `getContractAbi` |

Full reference: `etherscan/contracts.mjs::getContractAbi`

### Reference Resolution

When a tool reference is resolved, the runtime:

```
1. Parse reference into { namespace, schemaFile, routeName }
2. Locate schema at schemas/{version}/{namespace}/{schemaFile}
3. Load schema and extract main.routes[routeName]
4. If any step fails -> report unresolvable reference
```

A tool reference is **valid** if and only if:
- The schema file exists in the schemas directory
- The schema file passes the security scan
- The route name exists in the schema's `main.routes`

---

## Hash Calculation

Integrity hashes ensure that group definitions haven't changed unexpectedly. When a schema is updated (new parameters, different version, changed shared list references), the hash changes and the group verification fails. This alerts users to review the changes before continuing.

### Per-Tool Hash

Calculated from the `main` block only (deterministic, no handler code):

```
toolHash = SHA-256( JSON.stringify( {
    namespace: 'etherscan',
    version: '2.0.0',
    route: {
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
- `namespace` from `main`
- `version` from `main`
- The specific `route` definition (name, method, path, parameters, output schema)
- All `sharedListRefs` that the route uses (resolved from `main.sharedLists`)

Handler code is excluded from the hash because it does not affect the tool's interface. A handler change (e.g., improved response transformation) does not invalidate the group.

### Per-Group Hash

Calculated from sorted tool references and their individual hashes:

```
groupHash = SHA-256( JSON.stringify(
    tools
        .sort()
        .map( ( toolRef ) => {
            const hash = getToolHash( toolRef )

            return { ref: toolRef, hash }
        } )
) )
```

Sorting ensures deterministic output regardless of the order tools were added to the group.

---

## Verification

CLI command to verify group integrity:

```bash
flowmcp group verify my-crypto-monitor
```

Output on success:

```
Group "my-crypto-monitor": 4 tools, all hashes valid
```

Output on hash mismatch:

```
Group "my-crypto-monitor": HASH MISMATCH
  - etherscan/contracts.mjs::getContractAbi: expected sha256:abc... got sha256:def...
  - Schema version changed from 2.0.0 to 2.1.0
```

Output on unresolvable reference:

```
Group "my-crypto-monitor": RESOLUTION ERROR
  - etherscan/contracts.mjs::getContractAbi: Schema file not found
  - coingecko/coins.mjs::getMarketData: Route "getMarketData" not found in schema
```

---

## Group Operations

| Operation | Command | Description |
|-----------|---------|-------------|
| Create | `flowmcp group create <name>` | Create empty group |
| Add tool | `flowmcp group add <name> <tool-ref>` | Add tool and recalculate hash |
| Remove tool | `flowmcp group remove <name> <tool-ref>` | Remove tool and recalculate hash |
| Verify | `flowmcp group verify <name>` | Check all hashes |
| List | `flowmcp group list` | Show all groups |
| Export | `flowmcp group export <name>` | Export group as shareable JSON |
| Import | `flowmcp group import <file>` | Import group from JSON |

### Operation Details

**Create** initializes a new group with an empty tools array and a null hash:

```bash
flowmcp group create my-crypto-monitor
# -> Created group "my-crypto-monitor" (0 tools)
```

**Add** resolves the tool reference, calculates its hash, appends it, and recalculates the group hash:

```bash
flowmcp group add my-crypto-monitor etherscan/contracts.mjs::getContractAbi
# -> Added "etherscan/contracts.mjs::getContractAbi" to "my-crypto-monitor" (1 tool)
# -> Group hash: sha256:a1b2c3...
```

**Remove** removes the tool reference and recalculates the group hash:

```bash
flowmcp group remove my-crypto-monitor etherscan/contracts.mjs::getContractAbi
# -> Removed "etherscan/contracts.mjs::getContractAbi" from "my-crypto-monitor" (0 tools)
# -> Group hash: sha256:e4f5g6...
```

**List** shows all groups with tool counts:

```bash
flowmcp group list
# -> my-crypto-monitor    4 tools    "Crypto price and TVL monitoring tools"
# -> defi-analytics        3 tools    "DeFi protocol analysis tools"
```

---

## Group Constraints

1. Group names must match `^[a-z][a-z0-9-]*$` (lowercase, hyphens allowed, must start with a letter)
2. Maximum 50 tools per group
3. All referenced tools must be resolvable (schema + route exists)
4. Duplicate tool references within a group are an error
5. A tool can belong to multiple groups
6. Groups are local to the project (`.flowmcp/groups.json`)

### Constraint Error Messages

| Constraint | Error Message |
|------------|---------------|
| Invalid name | `GRP001 "My Group": Name must match ^[a-z][a-z0-9-]*$` |
| Too many tools | `GRP002 "my-group": Maximum 50 tools per group (currently 51)` |
| Unresolvable tool | `GRP003 "my-group": Tool "etherscan/foo.mjs::bar" not found` |
| Duplicate tool | `GRP004 "my-group": Duplicate tool "etherscan/contracts.mjs::getContractAbi"` |

---

## Sharing Groups

Groups can be exported and shared between projects and teams:

```bash
# Export
flowmcp group export my-crypto-monitor > my-crypto-monitor.json

# Import (verifies hashes on import)
flowmcp group import my-crypto-monitor.json
```

### Export Format

The exported JSON contains the group definition plus metadata:

```json
{
    "specVersion": "2.0.0",
    "exportedAt": "2026-02-16T12:00:00.000Z",
    "group": {
        "name": "my-crypto-monitor",
        "description": "Crypto price and TVL monitoring tools",
        "tools": [
            "etherscan/contracts.mjs::getContractAbi",
            "coingecko/coins.mjs::getSimplePrice",
            "coingecko/coins.mjs::getCoinMarkets",
            "defillama/protocols.mjs::getTvlProtocol"
        ],
        "hash": "sha256:a1b2c3d4e5f6...",
        "toolHashes": {
            "etherscan/contracts.mjs::getContractAbi": "sha256:111...",
            "coingecko/coins.mjs::getSimplePrice": "sha256:222...",
            "coingecko/coins.mjs::getCoinMarkets": "sha256:333...",
            "defillama/protocols.mjs::getTvlProtocol": "sha256:444..."
        }
    }
}
```

The `toolHashes` field is included only in exports (not in `groups.json`) to enable per-tool comparison during import.

### Import Behavior

On import, hash verification runs automatically:

```
1. Parse imported JSON
2. Validate specVersion compatibility
3. For each tool reference:
   a. Resolve locally (schema + route must exist)
   b. Calculate local tool hash
   c. Compare with exported tool hash
4. If all match -> import group as-is
5. If hashes differ -> warn user with per-tool diff
6. If tool not resolvable -> reject import with error
```

The user can force import with `--force` to skip hash verification:

```bash
flowmcp group import my-crypto-monitor.json --force
# -> WARNING: Imported "my-crypto-monitor" with 2 hash mismatches (forced)
```

---

## Group Activation Lifecycle

When a group is activated (e.g. via `flowmcp group activate my-crypto-monitor`), the runtime performs these steps for each tool in the group:

```mermaid
flowchart TD
    A[Group: my-crypto-monitor] --> B[Resolve tool references]
    B --> C[Load each schema file]
    C --> D[Static security scan]
    D --> E[Collect requiredServerParams across all schemas]
    E --> F{All server params available in .env?}
    F -->|Yes| G[Resolve shared lists]
    F -->|No| H[Error: missing server params]
    G --> I[Load libraries from allowlist]
    I --> J["Call handlers() factories"]
    J --> K[Register routes as MCP tools]
```

### Server Params Resolution

Each schema in the group declares its own `requiredServerParams`. The runtime collects **all unique params** across the group and verifies they exist in the environment:

```
Group "my-crypto-monitor" requires:
  - ETHERSCAN_API_KEY    (from etherscan/contracts.mjs)
  - COINGECKO_API_KEY    (from coingecko/coins.mjs)
  - (none)               (defillama/protocols.mjs has no requiredServerParams)

Checking .env... ETHERSCAN_API_KEY=set, COINGECKO_API_KEY=set
All server params available. Group activated.
```

If any param is missing, activation fails with a clear error listing which schemas need which params:

```
Error: Group "my-crypto-monitor" cannot activate.
  Missing server params:
  - COINGECKO_API_KEY (required by coingecko/coins.mjs)
```

### Schema Directory Structure

Schemas are resolved from the global schema registry at `~/.flowmcp/schemas/`:

```
~/.flowmcp/schemas/
├── v2.0.0/
│   ├── etherscan/
│   │   ├── contracts.mjs
│   │   └── gas.mjs
│   ├── coingecko/
│   │   └── coins.mjs
│   └── defillama/
│       └── protocols.mjs
└── _lists/
    ├── evm-chains.mjs
    └── _registry.json
```

The tool reference `etherscan/contracts.mjs::getContractAbi` resolves to `~/.flowmcp/schemas/v2.0.0/etherscan/contracts.mjs`, route `getContractAbi`.
