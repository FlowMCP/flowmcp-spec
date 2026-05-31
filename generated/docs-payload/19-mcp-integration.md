---
title: "MCP Server Integration"
description: "**Version:** FlowMCP 4.2.0"
spec_version: "4.2.0"
spec_file: "19-mcp-integration.md"
order: 19
section: "Specification"
normative: true
source_commit: "4a4d7c2"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/4a4d7c2/spec/v4.2.0/19-mcp-integration.md"
generated_at: "2026-05-31T16:52:18.836Z"
generated_from: "spec/v4.2.0/19-mcp-integration.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v4.2.0/19-mcp-integration.md."
---

> Normative language (MUST/SHOULD/MAY) follows the conventions defined in [Conformance Language](/specification/overview/#conformance-language).

**Version:** FlowMCP 4.2.0  
**Status:** Active

---

## Overview

When FlowMCP is used as an MCP Server, each Tool is registered with MCP-specific metadata. The `meta` block in every Tool definition provides this metadata.

---

## Meta Block (Required per Tool)

Every Tool in v4.2.0 MUST have a `meta` block:

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

When a Tool is registered with an MCP Server, `meta` fields are translated to MCP annotations:

| FlowMCP Field | MCP Annotation |
|---------------|----------------|
| `meta.alwaysLoad` | `_meta['anthropic/alwaysLoad']` |
| `meta.searchHint` | `_meta['anthropic/searchHint']` |

This translation happens at registration time in the FlowMCP CLI/Core.

## alwaysLoad Policy

`alwaysLoad: true` should be used sparingly. Guidelines:

- **true**: Tool is almost always needed in any session (e.g., a core utility tool)
- **false** (default): Tool is loaded on demand via ToolSearch

Excessive `alwaysLoad: true` pollutes the agent's active tool list and degrades performance.

## aliases Field

`aliases` enables ToolSearch to find a Tool by alternative names:

If an agent searches for `getAbi`, ToolSearch finds `getSmartContractAbi` because `getAbi` is in its `aliases` array.

Empty array `[]` is valid — means no aliases.

## Validation Rules

| Code | Severity | Rule |
|------|----------|------|
| VAL100 | error | Every Tool MUST have a `meta` block |
| VAL101 | error | `meta.isReadOnly` required (boolean) |
| VAL102 | error | `meta.isConcurrencySafe` required (boolean) |
| VAL103 | error | `meta.isDestructive` required (boolean) |
| VAL104 | error | `meta.searchHint` required (string, not empty) |
| VAL105 | error | `meta.aliases` required (string[]) |
| VAL106 | error | `meta.alwaysLoad` required (boolean) |
