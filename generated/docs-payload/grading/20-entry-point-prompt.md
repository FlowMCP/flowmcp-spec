---
title: "Entry-Point Prompt + Personas Obligation"
description: "Empty context (see [`02-eligibility.md`](./02-eligibility.md)) is a convention — it needs an **operational anchor**. The entry-point prompt is that anchor: the first prompt after `/clear` starts..."
grading_version: "3.0.0"
spec_file: "20-entry-point-prompt.md"
order: 20
section: "Grading"
normative: true
source_commit: "2e9a898"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/2e9a898/grading/3.0.0/20-entry-point-prompt.md"
generated_at: "2026-06-04T21:10:58.055Z"
generated_from: "grading/3.0.0/20-entry-point-prompt.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/3.0.0/20-entry-point-prompt.md."
---

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](/grading/overview/). The binding source is the FlowMCP Schemas Specification v4.3.0.

---

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

### Cross-Reference to the README

The README in the grading repository contains the ready-to-use prompt with example values. The README section anchors the entry-point prompt and the personas obligation in a single block.

### Cross-Refs

- Empty-context convention → [`02-eligibility.md`](/grading/eligibility/)
- Personas contract (Lens, four personas) → [`12-personas-contract.md`](/grading/personas-contract/)
- Selection `personaIds[]` obligation → [`16-selection-lockfile.md`](/grading/selection-lockfile/)
- Pre-condition (line 5 of the prompt) → [`21-pre-conditions.md`](/grading/pre-conditions/)
- Output format `_gradings/` (line 6 of the prompt) → [`19-folder-layout.md`](/grading/folder-layout/)

## Related

- **Depends on:** [`00-overview.md`](/grading/overview/), [`02-eligibility.md`](/grading/eligibility/), [`12-personas-contract.md`](/grading/personas-contract/), [`16-selection-lockfile.md`](/grading/selection-lockfile/)
- **Related:** [`21-pre-conditions.md`](/grading/pre-conditions/), [`19-folder-layout.md`](/grading/folder-layout/)

