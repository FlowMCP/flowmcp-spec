# 20 — Entry-Point Prompt + Personas Requirement (§18)

| Field | Value |
|-------|-------|
| Status | Normative — NEW in 1.1.0 |
| Version | `gradingSpec/1.1.0` |
| Depends on | [`00-overview.md`](./00-overview.md), [`02-eligibility.md`](./02-eligibility.md), [`12-personas-contract.md`](./12-personas-contract.md), [`16-selection-lockfile.md`](./16-selection-lockfile.md) |
| Related | [`21-pre-conditions.md`](./21-pre-conditions.md), [`19-folder-layout.md`](./19-folder-layout.md) |

> **Spec:** `gradingSpec/1.1.0`
> **Status:** stable (additive extension of 1.0.0)
> **Changes vs 1.0.0:** an entirely new section §18 (entry-point prompt template + personas requirement for Single AND Selection).

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](./00-overview.md). The binding source is the FlowMCP Schemas Specification v4.1.0.

---

## §18 Entry-Point Prompt

An empty context (see [`02-eligibility.md`](./02-eligibility.md) §3.5) is a convention — it needs an **operational anchor**. The entry-point prompt is that anchor: the first prompt after `/clear` starts every grading run and binds persona, Selection/Schema, mode, and spec version.

### §18.1 Concept

| Term | Definition | Checkable? |
|------|------------|------------|
| Empty context | Convention: no relevant prior information | No, trust-based |
| Entry-point prompt | First prompt after `/clear` = grading start | No, organisational |

The spec requires: the README in the `flowmcp-grading` repository provides a prompt template. The grader runs `/clear`, copies the prompt, and fills in persona, Selection/Single-Schema, mode, and lockfile hash.

### §18.2 Prompt Template

The binding prompt template is:

```
You are performing a FlowMCP grading. Instructions:

1. Persona: crypto-trader-2026
2. Selection: crypto-domain-full, lockfile hash: <sha>
3. Mode: Full (initial baseline)
4. Spec version: gradingSpec/1.1.0
5. Pre-condition: all member schemas have gradingStatus: stable
6. Output format: gradings/<selection-hash>--<timestamp>.json
```

Six numbered lines. For Single gradings, line 2 is replaced and line 5 is dropped:

```
1. Persona: crypto-trader-2026
2. Single-Schema: etherscan.getContractEthereum, schemaHash: a1b2c3d4
3. Mode: Full (initial baseline)
4. Spec version: gradingSpec/1.1.0
6. Output format: gradings/<schema-hash>--<timestamp>.json
```

(Line 5 is dropped — the pre-condition only applies to aggregated checks, see [`21-pre-conditions.md`](./21-pre-conditions.md) §20.)

### §18.3 Personas Requirement

The personas requirement has two levels — spec requirement and convention. They are complementary (not alternative).

| Level | Applies to | Anchored in |
|-------|------------|-------------|
| **Spec requirement** | Selection only | `personaIds[]` is a required field in `selection.json` (see [`16-selection-lockfile.md`](./16-selection-lockfile.md) §11.1) |
| **Convention via prompt** | Single AND Selection | Every grading run starts with a persona line in the prompt (line 1) |

Rationale: Single gradings without a persona anchor produce evaluation drift. The spec requirement in `selection.json` is the formal anchor; the prompt requirement is the operational one.

**Personas requirement summary:**

- Selection gradings: persona **MUST** be in `selection.json` AND in the prompt
- Single gradings: persona **SHOULD** be in the prompt (organisational, not a spec-required field)

### §18.4 Cross-Reference to the README

The README in the `flowmcp-grading` repository contains the runnable prompt with example values. It anchors the README section (entry-point prompt + personas requirement in a single README block).

### §18.5 Cross-References

- Empty-context convention → [`02-eligibility.md`](./02-eligibility.md) §3.5
- Personas contract (Lens, four personas) → [`12-personas-contract.md`](./12-personas-contract.md)
- Selection `personaIds[]` requirement → [`16-selection-lockfile.md`](./16-selection-lockfile.md) §11.1
- Pre-condition (line 5 of the prompt) → [`21-pre-conditions.md`](./21-pre-conditions.md) §20
- Output format (line 6 of the prompt) → [`19-folder-layout.md`](./19-folder-layout.md) §17.3
