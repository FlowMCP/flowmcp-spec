---
title: "MCP Server Integration"
description: "When FlowMCP runs as an MCP Server, each Tool may be exposed to the agent with MCP-specific metadata that an MCP host can read before it decides whether and how to invoke the Tool. That metadata is..."
family: "specification"
spec_version: "4.3.0"
spec_file: "19-mcp-integration.md"
order: 19
section: "specification"
normative: true
generated_at: "2026-07-16T12:43:22.312Z"
generated_from: "specification/4.3.0/draft/spec/19-mcp-integration.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: specification/4.3.0/draft/spec/19-mcp-integration.md."
---


When FlowMCP runs as an MCP Server, each Tool may be exposed to the agent with MCP-specific metadata that an MCP host can read before it decides whether and how to invoke the Tool. That metadata is declared optionally, per Tool, in a `meta` block, and the CLI/Core translates the relevant fields into MCP annotations at registration time. This page describes the `meta` block, how its fields map to MCP, and the behaviour of the search-related and loading-related fields.

---

## Meta Block (Optional per Tool)

A Tool MAY declare a `meta` block. It is optional — a Tool without a `meta` block is valid. When a `meta` block IS present, it MUST be complete: all fields below are required (VAL101–VAL106).

```javascript
export const schema = {
    main: { /* ... */ },
    tools: {
        getSmartContractAbi: {
            description: 'Get the ABI for a verified smart contract',
            parameters: { /* ... */ },
            meta: {
                isReadOnly: true,
                isConcurrencySafe: true,
                isDestructive: false,
                searchHint: 'contract ABI ethereum smart contract',
                aliases: [ 'getAbi' ],
                alwaysLoad: false
            }
        }
    }
}
```

## Meta Fields

The `meta` block is optional, but when present every field below is required:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `isReadOnly` | boolean | Yes (VAL101) | Tool does not modify any state |
| `isConcurrencySafe` | boolean | Yes (VAL102) | Safe to call concurrently |
| `isDestructive` | boolean | Yes (VAL103) | Tool can cause irreversible changes |
| `searchHint` | string | Yes (VAL104) | Keywords for ToolSearch (not empty) |
| `aliases` | string[] | Yes (VAL105) | Alternative names for ToolSearch |
| `alwaysLoad` | boolean | Yes (VAL106) | Always register with MCP (bypass lazy loading) |

## MCP Translation

When a Tool is registered with an MCP Server, the loading- and search-related `meta` fields are translated to MCP annotations:

| FlowMCP Field | MCP Annotation |
|---------------|----------------|
| `meta.alwaysLoad` | `_meta['anthropic/alwaysLoad']` |
| `meta.searchHint` | `_meta['anthropic/searchHint']` |

This translation happens at registration time in the FlowMCP CLI/Core. Schema authors set the FlowMCP-side fields; the annotation shape is produced by the registration step.

## alwaysLoad Policy

`alwaysLoad: true` should be used sparingly:

- **true**: Tool is almost always needed in any session (e.g., a core utility tool).
- **false** (default): Tool is loaded on demand via ToolSearch.

Excessive `alwaysLoad: true` pollutes the agent's active tool list and degrades performance, so the default of lazy loading is the right choice for most Tools.

## aliases Field

`aliases` lets ToolSearch find a Tool by alternative names. If an agent searches for `getAbi`, ToolSearch finds `getSmartContractAbi` because `getAbi` is in its `aliases` array. An empty array `[]` is valid and simply means the Tool declares no aliases.

## Validation Rules

The structural rules for the `meta` block are defined alongside the other schema rules in [09-validation-rules.md](/specification/validation-rules/); they are listed here for reference at the point of use:

| Code | Severity | Rule |
|------|----------|------|
| VAL100 | error | `meta` block is optional; when present it MUST be a plain object (absent `meta` is allowed) |
| VAL101 | error | `meta.isReadOnly` required (boolean) |
| VAL102 | error | `meta.isConcurrencySafe` required (boolean) |
| VAL103 | error | `meta.isDestructive` required (boolean) |
| VAL104 | error | `meta.searchHint` required (string, not empty) |
| VAL105 | error | `meta.aliases` required (string[]) |
| VAL106 | error | `meta.alwaysLoad` required (boolean) |


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./00-overview.md](/specification/overview/) — see chapter 00.
- [./01-schema-format.md](/specification/schema-format/) — see chapter 01.
- [./04-output-schema.md](/specification/output-schema/) — see chapter 04.
- [./09-validation-rules.md](/specification/validation-rules/) — see chapter 09.
- [./13-resources.md](/specification/resources/) — see chapter 13.
- [./14-skills.md](/specification/skills/) — see chapter 14.
