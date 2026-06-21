---
title: "Entry-Point Prompt + Personas Obligation"
description: "Every grading run begins from an empty context, and an empty context needs a concrete starting signal. This chapter defines that signal: the entry-point prompt, the first prompt a grader pastes after..."
grading_version: "3.0.0"
spec_file: "20-entry-point-prompt.md"
order: 20
section: "Grading"
normative: true
source_commit: "659863f"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/659863f/grading/3.0.0/20-entry-point-prompt.md"
generated_at: "2026-06-21T18:39:36.331Z"
generated_from: "grading/3.0.0/20-entry-point-prompt.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/3.0.0/20-entry-point-prompt.md."
---

Every grading run begins from an empty context, and an empty context needs a concrete starting signal. This chapter defines that signal: the entry-point prompt, the first prompt a grader pastes after `/clear`, which binds the persona, the selection or single schema, the mode, and the spec version into one block. It also fixes the personas obligation — when a persona is spec-mandatory versus merely conventional — so that Single- and Selection-Gradings stay anchored to the same evaluation lens.


## Entry-Point Prompt

Empty context (see [`02-eligibility.md`](/grading/eligibility/)) is a convention — it needs an **operational anchor**. The entry-point prompt is that anchor: the first prompt after `/clear` starts every grading run and binds persona, selection/schema, mode, and spec version.

### Concept

| Term | Definition | Checkable? |
|------|------------|------------|
| Empty context | Convention: no relevant prior information | No, trust-based |
| Entry-point prompt | First prompt after `/clear` = grading start | No, organisational |

The spec requires: the README in the grading repository provides a prompt template. The grader runs `/clear`, copies the prompt, and fills in persona, selection/single-schema, mode, and the `lockSnapshot` hash from the selection's `index.json`.

### Prompt Template

The binding prompt template is:

```
You are performing a FlowMCP grading. Instructions:

1. Persona: crypto-trader-2026
2. Selection: crypto-domain-full, lockSnapshot hash: <sha>
3. Mode: Full (initial baseline)
4. Spec version: gradingSpec/3.0.0
5. Pre-condition: all member schemas have gradingStatus: stable
6. Output format: _gradings/<area>--<timestamp>.json
```

Six numbered lines. For Single-Gradings, line 2 is replaced and line 5 is dropped:

```
1. Persona: crypto-trader-2026
2. Single-Schema: etherscan.getContractEthereum, area: single-test
3. Mode: Full (initial baseline)
4. Spec version: gradingSpec/3.0.0
6. Output format: _gradings/<area>--<timestamp>.json
```

(Line 5 is dropped — the pre-condition applies only to aggregated checks, see [`21-pre-conditions.md`](/grading/pre-conditions/).)

### Personas Obligation

The personas obligation has two levels — spec obligation and convention. They are complementary (not alternative).

| Level | Applies to | Anchoring |
|-------|------------|-----------|
| **Spec obligation** | Selection only | `personaIds[]` is a mandatory field in `selection.json` (see [`16-selection-lockfile.md`](/grading/selection-lockfile/)) |
| **Convention via prompt** | Single AND Selection | Every grading run starts with the persona line in the prompt (line 1) |

Rationale: Single-Gradings without a persona anchor produce evaluation drift. The spec obligation in `selection.json` is the formal anchoring; the prompt requirement is the operational one.

**Personas-obligation summary:**

- Selection-Gradings: persona **MUST** be in `selection.json` AND in the prompt
- Single-Gradings: persona **SHOULD** be in the prompt (organisational, not a spec-mandatory field)

### Where the Template Lives

The README in the grading repository carries the ready-to-use prompt with example values, anchoring the entry-point prompt and the personas obligation in a single block. The grader copies that block, runs `/clear`, and fills in the run-specific values (persona, selection or single schema, mode, and the `lockSnapshot` hash).

## Related

- [`00-overview.md`](/grading/overview/) — how FlowMCP schemas and selections are evaluated and graded.
- [`02-eligibility.md`](/grading/eligibility/) — what is allowed to be part of a gradable schema before scoring begins.
- [`12-personas-contract.md`](/grading/personas-contract/) — how a grading entry references one of the four base personas and a lens.
- [`16-selection-lockfile.md`](/grading/selection-lockfile/) — the neutral selection definition and the frozen member-pin lock snapshot.
- [`21-pre-conditions.md`](/grading/pre-conditions/) — the universal rule blocking aggregate checks until every member schema is stable.
- [`19-folder-layout.md`](/grading/folder-layout/) — the three top-level folders and timestamp-first naming grammar of the grading island.

