---
title: "Prefill and Placeholders"
description: "Skill content carries two complementary template mechanisms that the runtime processes before handing the Skill to an agent. *Placeholders* are tokens embedded directly in the content —..."
spec_version: "4.3.0"
spec_file: "18-prefill.md"
order: 18
section: "Specification"
normative: true
source_commit: "659863f"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/659863f/spec/v4.3.0/18-prefill.md"
generated_at: "2026-06-21T18:39:36.331Z"
generated_from: "spec/v4.3.0/18-prefill.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v4.3.0/18-prefill.md."
---

Skill content carries two complementary template mechanisms that the runtime processes before handing the Skill to an agent. *Placeholders* are tokens embedded directly in the content — `{{type:reference}}` — that are substituted with tool descriptions, resource references, user input, or shared-list values at resolution time. *Prefill* goes one step further: a Skill can declare tool calls in a `prefill` array that the runtime executes up front, then embeds the live results into the content via `{{prefill:...}}` tokens, so the agent receives a Skill already populated with current data.


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

## Related

- [00-overview.md](/specification/overview/) — mission, the two-channel catalog, and the knowledge framing.
- [16-id-schema.md](/specification/id-schema/) — the canonical namespace/type/name identifier for every primitive.
- [14-skills.md](/specification/skills/) — reusable instruction sets an agent can load and follow.
- [12-prompt-architecture.md](/specification/prompt-architecture/) — the two-tier prompt system for provider and agent workflows.
- [17-selections.md](/specification/selections/) — a named bundle of primitives an agent activates together.
- [02-parameters.md](/specification/parameters/) — how a parameter places a value and validates it before the call.

