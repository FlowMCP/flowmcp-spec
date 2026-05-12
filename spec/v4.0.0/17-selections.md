# FlowMCP Specification v4.0.0 — Selections

**Version:** FlowMCP 4.0.0  
**Status:** Active  
**Primitive:** Selection (5th primitive)

---

## Overview

A **Selection** is a named collection of Primitives (Tools, Resources, Prompts, Skills) that belong together thematically. Selections enable agents to activate a coherent set of capabilities with a single operation.

---

## Export Format

```javascript
export const selection = {
    namespace: 'evm-research',
    name: 'contract-analysis',
    version: 'flowmcp/4.0.0',
    description: 'Tools and Skills for Smart Contract analysis on EVM chains',
    whenToUse: 'Activate this Selection when the user wants to analyze, debug, or inspect a smart contract.',
    tools: [
        'etherscan-io/tool/getSmartContractAbi',
        'etherscan-io/tool/getContractCreation'
    ],
    skills: [ 'etherscan-io/skill/contract-deep-dive' ],
    resources: [],
    prompts: []
}
```

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `namespace` | string | Namespace owning this selection |
| `name` | string | Selection name (kebab-case) |
| `version` | string | Must be `'flowmcp/4.0.0'` |
| `description` | string | What this selection provides |
| `whenToUse` | string | When an agent should activate this selection (SEL001) |
| `tools` | string[] | Tool Primitive-IDs included |
| `skills` | string[] | Skill Primitive-IDs included |
| `resources` | string[] | Resource Primitive-IDs included |
| `prompts` | string[] | Prompt Primitive-IDs included |

At least one array must be non-empty (SEL002).

## ID Format

Selection ID: `namespace/selection/name` (2 slashes)

Example: `evm-research/selection/contract-analysis`

## File Location

```
schemas/v4.0.0/selections/
  evm-research/
    contract-analysis.mjs
```

Directory `selections/` is at root level, alongside `providers/` and `agents/`.

## Validation Rules

| Code | Severity | Rule |
|------|----------|------|
| SEL001 | error | `whenToUse` is required and must not be empty |
| SEL002 | error | At least one array (tools/skills/resources/prompts) must be non-empty |
| SEL003 | error | All referenced Primitive-IDs must be resolvable |

## Runtime Behavior

- If a referenced Primitive-ID is unresolvable, the Selection fails to load with a clear error message.
- Example: `"Selection evm-research/selection/contract-analysis: Reference 'etherscan-io/tool/getSmartContractAbi' not found"`
- AGT030: Agent startup fails if a referenced Selection cannot be loaded.
