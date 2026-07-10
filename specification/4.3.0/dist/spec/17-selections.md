---
title: "Selections"
description: "A **Selection** is a named, thematically-coherent collection of Primitives (Tools, Resources, Prompts, Skills) that an agent can activate together in a single operation."
family: "specification"
spec_version: "4.3.0"
spec_file: "17-selections.md"
order: 17
section: "specification"
normative: true
generated_at: "2026-07-10T11:41:13.977Z"
generated_from: "specification/4.3.0/draft/spec/17-selections.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: specification/4.3.0/draft/spec/17-selections.md."
---


A **Selection** is a named, thematically-coherent collection of Primitives (Tools, Resources, Prompts, Skills) that an agent can activate together in a single operation.

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
| SEL004 | info | If a Selection includes inline-skill objects, SkillValidator runs on each. Recorded in the validation report. Optional — present only when inline skills exist. |

## Selection as Test-Trigger

A Selection-File can be used as a transitive test trigger via:

```
flowmcp grading deterministic <selection-id>
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

If a Selection includes inline-skill objects, the SelectionValidator additionally runs SkillValidator on each. This is recorded as SEL004 in the validation report. Optional — present only when inline skills exist.

## Runtime Behavior

- If a referenced Primitive-ID is unresolvable, the Selection fails to load with a clear error message.
- Example: `"Selection evm-research/selection/contract-analysis: Reference 'etherscan-io/tool/getSmartContractAbi' not found"`
- AGT030: Agent startup fails if a referenced Selection cannot be loaded.


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./00-overview.md](/specification/overview/) — see chapter 00.
- [./01-schema-format.md](/specification/schema-format/) — see chapter 01.
- [./06-agents.md](/specification/agents/) — see chapter 06.
- [./12-prompt-architecture.md](/specification/prompt-architecture/) — see chapter 12.
- [./14-skills.md](/specification/skills/) — see chapter 14.
- [./16-id-schema.md](/specification/id-schema/) — see chapter 16.
- [./18-prefill.md](/specification/prefill/) — see chapter 18.
