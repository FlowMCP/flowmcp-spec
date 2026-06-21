---
title: "MCP Server Integration"
description: "When FlowMCP runs as an MCP Server, each Tool is exposed to the agent with MCP-specific metadata that an MCP host can read before it decides whether and how to invoke the Tool. That metadata is..."
spec_version: "4.3.0"
spec_file: "19-mcp-integration.md"
order: 19
section: "Specification"
normative: true
source_commit: "236dbb3"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/236dbb3/spec/v4.3.0/19-mcp-integration.md"
generated_at: "2026-06-21T11:44:44.465Z"
generated_from: "spec/v4.3.0/19-mcp-integration.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v4.3.0/19-mcp-integration.md."
---

When FlowMCP runs as an MCP Server, each Tool is exposed to the agent with MCP-specific metadata that an MCP host can read before it decides whether and how to invoke the Tool. That metadata is declared once, per Tool, in a `meta` block, and the CLI/Core translates the relevant fields into MCP annotations at registration time. This page describes the `meta` block, how its fields map to MCP, and the behaviour of the search-related and loading-related fields.

---

## Meta Block (Required per Tool)

Every Tool MUST have a `meta` block:

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
| VAL100 | error | Every Tool MUST have a `meta` block |
| VAL101 | error | `meta.isReadOnly` required (boolean) |
| VAL102 | error | `meta.isConcurrencySafe` required (boolean) |
| VAL103 | error | `meta.isDestructive` required (boolean) |
| VAL104 | error | `meta.searchHint` required (string, not empty) |
| VAL105 | error | `meta.aliases` required (string[]) |
| VAL106 | error | `meta.alwaysLoad` required (boolean) |

## Related

- [00-overview.md](/specification/overview/)
- [01-schema-format.md](/specification/schema-format/)
- [09-validation-rules.md](/specification/validation-rules/)
- [13-resources.md](/specification/resources/)
- [14-skills.md](/specification/skills/)
- [04-output-schema.md](/specification/output-schema/)

