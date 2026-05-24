# FlowMCP Specification v4.0.0 — Prefill and Placeholders

> Normative language (MUST/SHOULD/MAY) follows the conventions defined in [00-overview.md](./00-overview.md) (Conformance Language).

**Version:** FlowMCP 4.0.0  
**Status:** Active

---

## Overview

**Placeholders** are template tokens embedded in Skill content that are resolved at runtime. **Prefill** is a mechanism to pre-execute a tool and embed its result into the Skill before delivery.

---

## Placeholder Syntax

All placeholders use double-brace syntax: `{{type:reference}}` or `{{type:reference:field}}`.

## Complete Placeholder Table

| Syntax | Resolves To |
|--------|------------|
| `{{tool:ns/name}}` | Complete tool block (description + parameters) |
| `{{tool:ns/name:description}}` | Tool description only |
| `{{tool:ns/name:parameters}}` | Parameter table only |
| `{{tool:ns/name:test}}` | First test case as example call |
| `{{tool:ns/name:meta}}` | Meta flags (isReadOnly, isDestructive, etc.) |
| `{{tool:ns/name:call}}` | Ready-to-use call command |
| `{{resource:ns/name}}` | Resource reference |
| `{{prompt:ns/name}}` | Prompt reference |
| `{{skill:name}}` | Skill reference (1 level, no nesting) |
| `{{input:key}}` | User input parameter |
| `{{prefill:ns/tool/name}}` | Pre-executed tool result |
| `{{listName:alias}}` | Shared List value via alias |

## Prefill Declaration

In a Skill, prefill is declared in the `prefill` array:

```javascript
export const skill = {
    name: 'contract-analysis',
    prefill: [
        {
            tool: 'etherscan-io/tool/getNetworkStatus',
            params: { network: '{{input:chain}}' }
        }
    ],
    content: `
Network status: {{prefill:etherscan-io/tool/getNetworkStatus}}

Now analyze contract at {{input:address}}...
`
}
```

## Resolution Flow (8 Steps)

1. Skill is requested (with `input` parameters)
2. `prefill[]` entries are executed in order
3. Results are stored temporarily
4. `{{input:key}}` tokens are replaced with user parameters
5. `{{prefill:ns/tool/name}}` tokens are replaced with pre-executed results
6. `{{tool:...}}`, `{{resource:...}}`, `{{prompt:...}}` tokens are resolved from catalog
7. `{{listName:alias}}` tokens are resolved from Shared Lists
8. Fully resolved Skill content is delivered to the agent

## Error Handling

**Principle:** Always deliver the Skill. Errors are visible in the placeholder, not silent.

If a placeholder cannot be resolved, the error message replaces the placeholder:

```
{{tool:unknown/ns/missingTool}} → [ERROR: Tool 'unknown/ns/missingTool' not found]
{{prefill:ns/tool/name}} → [ERROR: Prefill execution failed: HTTP 503]
```

This ensures the Skill is always delivered — even if some references are broken.
