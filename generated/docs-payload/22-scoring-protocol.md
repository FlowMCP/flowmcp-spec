---
title: "Scoring Protocol v1"
description: "Specification for grading FlowMCP v4 schemas via LLM evaluation. Documents the data formats exchanged between the CLI and an external Grader (e.g. Claude Code harness, third-party implementation)."
spec_version: "4.2.0"
spec_file: "22-scoring-protocol.md"
order: 22
section: "Specification"
normative: true
source_commit: "6152b7e"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/6152b7e/spec/v4.2.0/22-scoring-protocol.md"
generated_at: "2026-05-31T16:18:50.290Z"
generated_from: "spec/v4.2.0/22-scoring-protocol.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v4.2.0/22-scoring-protocol.md."
---

> Normative language (MUST/SHOULD/MAY) follows the conventions defined in [Conformance Language](/specification/overview/#conformance-language).

Specification for grading FlowMCP v4 schemas via LLM evaluation. Documents the data formats exchanged between the CLI and an external Grader (e.g. Claude Code harness, third-party implementation).

---

## Purpose

The scoring protocol decouples three concerns:

1. **Prompt generation** — done deterministically by `flowmcp-core/v4/GradeReporter.buildEvalPrompts`
2. **Score production** — done by an external Grader (LLM-based)
3. **Grade calculation** — done deterministically by `flowmcp-core/v4/GradeReporter.grade`

CLI is responsible for 1 and 3. Grader is responsible for 2. Communication via JSON files (`prompts.json`, `scores.json`).

---

## Delegation — the grading model lives in the Grading-Spec

FlowMCP is the highest instance and **delegates the grading model** to a separate, independently versioned standard: the **Grading-Spec** (`gradingSpec/2.0.0`), published as a dedicated docs area. The Grading-Spec owns the grading model — score-to-grade thresholds, the extended dimension set, Scoring System, Grading System, Categorical-Veto, Tier-trim, and skill families.

This file owns the **upstream scoring transport** only: the deterministic `prompts.json` / `scores.json` artefact pair exchanged between the CLI and an external Grader. The Grading-Spec **sub-consumes** this transport and treats it as the highest instance for the artefact pair — it does not redefine it.

Entry point: [Grading-Spec 2.0.0 — Overview](https://github.com/FlowMCP/flowmcp-spec/blob/main/grading/2.0.0/00-overview.md).

---

## Protocol Version

`scoringProtocol: "v1"`

Versioning allows future changes without breaking existing graders. Implementations MUST check the version and fail gracefully on unknown values.

---

## Dimensions

Each schema is evaluated on 2 dimensions:

| Dimension | What is rated |
|-----------|---------------|
| `whenToUse` | Clarity and specificity of the schema description (does an LLM know when to use this schema?) |
| `parameters` | How well the parameter descriptions enable correct tool invocation |

Each dimension yields a score on a 1.0-5.0 scale (floating point). These two are the **base transport dimensions**; the Grading-Spec ([`08-grading-model.md` §Dimension Enum](https://github.com/FlowMCP/flowmcp-spec/blob/main/grading/2.0.0/08-grading-model.md)) extends this set with the additional grading dimensions it owns.

---

## Grade Thresholds — delegated to the Grading-Spec

The score-to-grade banding, the production gate, the tier-trim rule and the Categorical-Veto list are **owned by the Grading-Spec** (`gradingSystem/1.0.0`), not by this transport protocol. See [Grading-Spec 2.0.0 — §4.1 Score-to-Grade Thresholds](https://github.com/FlowMCP/flowmcp-spec/blob/main/grading/2.0.0/07-scoring-vs-grading.md). Changing any threshold or the numeric mapping bumps the `gradingSystem` version independently of `scoringProtocol`.

---

## File Formats

### `prompts.json` — Emitted by CLI

Written by `flowmcp dev grade <schema> --emit-prompts`. Read by Grader.

```json
{
    "schemaId": "namespace/file-base",
    "schemaIdSlug": "namespace_file-base",
    "schemaPath": "/abs/path/to/schema.mjs",
    "scoringProtocol": "v1",
    "scoringInstructions": "Du bist ein Schema-Bewerter. Bewerte unabhaengig basierend nur auf den unten gelieferten Informationen. Antworte als JSON-Array: [ { \"dimension\": \"...\", \"score\": <1.0-5.0>, \"reasoning\": \"...\" }, ... ]. Keine externen Annahmen, keine Kontext-Vermutungen.",
    "prompts": [
        {
            "dimension": "whenToUse",
            "prompt": "Rate the clarity and specificity of the following Schema description on a scale 1.0-5.0. Schema description: \"...\""
        },
        {
            "dimension": "parameters",
            "prompt": "Rate how well the parameter descriptions in the following schema enable an LLM to call the tools correctly on a scale 1.0-5.0. Schema: {...}"
        }
    ]
}
```

### `scores.json` — Written by Grader

Read by `flowmcp dev grade <schema> --consume-scores <path>`.

```json
{
    "schemaIdSlug": "namespace_file-base",
    "scoringProtocol": "v1",
    "creator": {
        "skill": "grade-score-single",
        "skillVersion": "1.0.0",
        "session": "claude-code-2026-05-18-03-15"
    },
    "harness": {
        "name": "claude-code",
        "version": "1.0.0",
        "model": "claude-opus-4-7",
        "modelContext": "1M"
    },
    "timestamp": "2026-05-18T03:15:00Z",
    "scores": [
        {
            "dimension": "whenToUse",
            "score": 4.0,
            "reasoning": "Description is clear and specific..."
        },
        {
            "dimension": "parameters",
            "score": 3.5,
            "reasoning": "Tools have descriptive names..."
        }
    ]
}
```

### Grade Report — Written by CLI

`flowmcp dev grade <schema> --consume-scores <path>` writes the final report:

```json
{
    "schemaId": "namespace/file-base",
    "schemaIdSlug": "namespace_file-base",
    "schemaPath": "/abs/path/to/schema.mjs",
    "schemaHash": "sha256:abc...",
    "date": "2026-05-18",
    "grade": "B",
    "score": 3.75,
    "scoringProtocol": "v1",
    "creator": { ... },
    "harness": { ... },
    "timestamps": {
        "startedAt": "2026-05-18T03:00:00Z",
        "scoredAt": "2026-05-18T03:15:00Z",
        "gradedAt": "2026-05-18T03:16:00Z",
        "reportedAt": "2026-05-18T03:16:00Z"
    },
    "dimensions": [ ... ],
    "validationPassed": true,
    "validationErrors": []
}
```

---

## Reproducibility Guarantees

The protocol provides **statistical reproducibility** (not bitwise):

| Guarantee | How |
|-----------|-----|
| Same schema | `schemaHash` (sha256) in report |
| Same prompt template | `scoringProtocol: "v1"` in scores + report |
| Same LLM | `harness.model` in scores + report |
| Same scoring context | Grader MUST use isolated context (no session-state) |
| Same output format | JSON-Schema for scores |

Expectation: same inputs → same score within ±0.2 on the 1.0-5.0 scale.

---

## Schema ID Slug Convention

Schema IDs follow the `<namespace>/<file-base>` pattern (e.g. `mudab/marine-data`).

For use in file paths, the `/` is replaced with `_`:

```
mudab/marine-data → mudab_marine-data
coingecko-com/search-ohlc → coingecko-com_search-ohlc
```

Reference implementation: `flowmcp-core/v4/GradeReporter._formatSuggestedFileName`.

---

## Grader Implementation Requirements

A Grader MUST:

1. Read `prompts.json`, parse `scoringProtocol` field
2. Reject unknown protocol versions
3. Score each prompt independently in an isolated context (no shared state between prompts of the same schema)
4. Return scores in the same order as input prompts (or include `dimension` field for matching)
5. Set `creator`, `harness`, `timestamp` metadata
6. Write `scores.json` atomically (write-temp + rename)

A Grader MUST NOT:

- Use external context beyond what's in `prompts.json`
- Use tools or external lookups
- Embed scores from previous sessions
- Modify the `scoringProtocol` value

---

## Reference Implementations

| Implementation | Type | Location |
|----------------|------|----------|
| `grade-score-single` | Workbench Skill | `cli/memo-toolkit/skills/grade/grade-score-single/SKILL.md` |
| `grade-score-batch` | Workbench Skill | `cli/memo-toolkit/skills/grade/grade-score-batch/SKILL.md` |
| `flowmcp dev grade` | CLI Producer/Consumer | `flowmcp-cli/src/task/FlowMcpCli.mjs:grade()` |
| `GradeReporter` | Core Module | `flowmcp-core/src/v4/task/GradeReporter.mjs` |

---

## References

- [`20-validation-strategy.md`](./20-validation-strategy.md) — overall validation strategy
- [`21-schema-lifecycle.md`](./21-schema-lifecycle.md) — when grading happens in the lifecycle
