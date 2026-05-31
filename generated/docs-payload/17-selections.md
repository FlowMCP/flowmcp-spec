---
title: "Selections"
description: "**Version:** FlowMCP 4.2.0"
spec_version: "4.2.0"
spec_file: "17-selections.md"
order: 17
section: "Specification"
normative: true
source_commit: "2d44cb7"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/2d44cb7/spec/v4.2.0/17-selections.md"
generated_at: "2026-05-31T17:29:02.778Z"
generated_from: "spec/v4.2.0/17-selections.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v4.2.0/17-selections.md."
---

> Normative language (MUST/SHOULD/MAY) follows the conventions defined in [Conformance Language](/specification/overview/#conformance-language).

**Version:** FlowMCP 4.2.0  
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
| `whenToUse` | string | When an agent SHOULD activate this selection (SEL001) |
| `tools` | string[] | Tool Primitive-IDs included |
| `skills` | string[] | Skill Primitive-IDs included |
| `resources` | string[] | Resource Primitive-IDs included |
| `prompts` | string[] | Prompt Primitive-IDs included |

At least one array MUST be non-empty (SEL002).

## ID Format

Selection ID: `namespace/selection/name` (2 slashes)

Example: `evm-research/selection/contract-analysis`

## File Location

```
schemas/v4.1.0/selections/
  evm-research/
    contract-analysis.mjs
```

Directory `selections/` is at root level, alongside `providers/` and `agents/`.

## Validation Rules

| Code | Severity | Rule |
|------|----------|------|
| SEL001 | error | `whenToUse` is required and MUST NOT be empty |
| SEL002 | error | At least one array (tools/skills/resources/prompts) must be non-empty |
| SEL003 | error | All referenced Primitive-IDs MUST be resolvable |

## Selection as Test-Trigger

A Selection-File can be used as a transitive test trigger via:

```
flowmcp dev test single <selection-file>
```

This:
1. Loads the Selection.
2. Resolves every member ID via the IdResolver (transitive).
3. Recursively gathers tests from each member schema (Tools, Resources, Skills, Prompts).
4. Executes all member tests and aggregates per-primitive PASS/FAIL counts.
5. Reports an aggregate status: `M/N Members PASS`.

**Important**: The Selection itself has no execution tests — it is a *grouping*. The test-trigger model uses Selections as **batch loaders** for transitive testing of their members.

### Inline Skills

When a Selection defines inline skills (`selection.skills[]` entries that are full Skill objects rather than ID references), each inline-skill is treated as a Skill-Test target:
- Structural validation runs (placeholders resolvable, prefills declared)
- The inline skill is then bound to the Selection's namespace for context

### Output Format Example

```
┌─ Selection: defi-pools-toolkit
│  ├─ SEL003: all member IDs resolvable  ✓
│  │
│  ├─ Tools (1)
│  │   └─ dexscreener.searchPair        3/3 PASS
│  │
│  ├─ Resources (2)
│  │   ├─ pools.searchPoolsByToken      3/3 PASS
│  │   └─ tokens.getTokenBySymbol       3/3 PASS
│  │
│  └─ Skills (1)
│      └─ analyze-token-pools
│         ├─ Structural (Placeholder-Resolution)   ✓
│         └─ Prefill executed (2 Resources)        ✓
│
└─ Selection Aggregat: 4/4 Members PASS
```

### New Validation Code: SEL004 (Inline-Skill Sanity)

If a Selection includes inline-skill objects, the SelectionValidator additionally runs SkillValidator on each. This is recorded as SEL004 in the validation report. Optional — present only when inline skills exist.

## Runtime Behavior

- If a referenced Primitive-ID is unresolvable, the Selection fails to load with a clear error message.
- Example: `"Selection evm-research/selection/contract-analysis: Reference 'etherscan-io/tool/getSmartContractAbi' not found"`
- AGT030: Agent startup fails if a referenced Selection cannot be loaded.
