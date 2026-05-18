# Scoring Protocol v1

Specification for grading FlowMCP v4 schemas via LLM evaluation. Documents the data formats exchanged between the CLI and an external Grader (e.g. Claude Code harness, third-party implementation).

---

## Purpose

The scoring protocol decouples three concerns:

1. **Prompt generation** — done deterministically by `flowmcp-core/v4/GradeReporter.buildEvalPrompts`
2. **Score production** — done by an external Grader (LLM-based)
3. **Grade calculation** — done deterministically by `flowmcp-core/v4/GradeReporter.grade`

CLI is responsible for 1 and 3. Grader is responsible for 2. Communication via JSON files (`prompts.json`, `scores.json`).

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

Each dimension yields a score on a 1.0-5.0 scale (floating point).

---

## Grade Thresholds

| Grade | Score Range | Action |
|-------|-------------|--------|
| A | >= 4.5 | Production-ready |
| B | 3.5 <= s < 4.5 | Production-ready |
| C | 2.5 <= s < 3.5 | Hold (improvement plan) |
| D / F | < 2.5 | Blocked (no deploy) |

Production-Gate (Memo 027): Score >= 3.5 required for deployment.

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

- Memo 029 PRD F2 (`flowmcp dev grade` original design — superseded by Memo 036)
- Memo 036 (LLM-Integration-Pattern, REV-06)
- Memo 026 REV-09 (Grade-Schwellen)
- Memo 027 REV-07 (Production-Gate)
- Spec 20 (`20-validation-strategy.md` — overall validation strategy)
- Spec 21 (`21-schema-lifecycle.md` — when grading happens in the lifecycle)
