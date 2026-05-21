---
name: evaluator-spec-rfc2119
description: >
  Evaluate a FlowMCP specification file against RFC2119 / BCP14 / RFC8174
  conformance rules. Returns a grade from 1 to 5 plus a list of issues
  (error / warning / hint) with rule codes RFC-001 to RFC-008 and line
  numbers. Use this skill when working on files under `spec/v{X.Y.Z}/`
  to verify that normative language follows the established conventions.

  Trigger this skill whenever a spec file has been edited and the user
  asks "is this RFC2119-conformant?", "evaluate this spec file", or
  similar quality-check requests. Also useful as a pre-commit gate after
  RFC2119 migration work.
---

# Evaluator: RFC2119 Conformance

Specific rule-driven evaluation for RFC2119/BCP14/RFC8174 conformance in FlowMCP specification files. This skill does not answer generic questions like "is this well-written?" — it checks eight precise rules and produces a deterministic, actionable grade.

## When to Use

Use this skill when:

- A spec file under `spec/v{X.Y.Z}/*.md` has been edited
- You need to verify RFC2119 conformance before committing
- You want a quality gate as part of CI
- You are migrating lowercase `must`/`should`/`may` to uppercase keywords (Memo 049 Phase 4)

Do **not** use this skill for:

- Generic prose quality assessment
- Markdown style checking (use a linter)
- Semantic correctness of the spec content (that requires human review)

## Rule Catalog

| Code | Question | Severity |
|------|----------|----------|
| `RFC-001` | Does this normative file reference the Conformance Block in `00-overview.md`? | error |
| `RFC-002` | Are RFC2119 keywords used only in UPPERCASE form? | error |
| `RFC-003` | Are there lowercase `must`/`should`/`may` instances in a normative context that should be uppercase? | warning |
| `RFC-004` | Is the verb pattern correctly placed (subject before MUST/SHOULD/MAY)? | warning |
| `RFC-005` | Are negations formatted correctly (`MUST NOT` with a space, not `MUSTNOT`)? | error |
| `RFC-006` | Does a normative file (per granularity table) carry the conformance boilerplate note? | error |
| `RFC-007` | Are there style-filler phrases (`we must remember`, `it should be clear`) that masquerade as normative? | hint |
| `RFC-008` | Are cross-references to other spec files correctly named (`see 14-skills.md` format)? | hint |

## Grading Scale

```
grade = 5
for each error:   grade -= 1.0
for each warning: grade -= 0.25
for each hint:    grade -= 0.0      (hints are informational only)
grade = max(1, round(grade))
```

| Grade | Meaning | Condition |
|-------|---------|-----------|
| **5** | Excellent — spec-conformant | 0 errors, 0-2 warnings |
| **4** | Very good | 0 errors, 3-4 warnings OR 1 error |
| **3** | Acceptable with room for improvement | 1 error + warnings OR 2 errors |
| **2** | Deficient | 3 errors |
| **1** | Not acceptable | 4+ errors |

## Output Format

The skill returns JSON:

```json
{
    "grade": 4,
    "issues": [
        {
            "severity": "error",
            "code": "RFC-001",
            "line": 42,
            "message": "Normative file does not reference Conformance Block in 00-overview.md"
        },
        {
            "severity": "warning",
            "code": "RFC-003",
            "line": 17,
            "message": "Lowercase 'must' in normative context: consider uppercase MUST"
        },
        {
            "severity": "hint",
            "code": "RFC-007",
            "line": 8,
            "message": "Phrase 'we must remember' is not normative — consider rephrasing"
        }
    ],
    "summary": "1 error, 1 warning, 1 hint — RFC2119 conformance is partial"
}
```

## Usage

### Via Claude Code (primary)

Invoke this skill via natural language when working in the `flowmcp-spec` repo:

> Evaluate `spec/v4.0.0/13-resources.md` against RFC2119.

Claude Code auto-discovers `SKILL.md` files under `skills/` — no explicit bootstrap is needed.

### Via deterministic helper (CI / batch)

For deterministic execution (e.g. in CI), use the helper script:

```bash
node skills/spec-quality/evaluator-spec-rfc2119/check.mjs --json spec/v4.0.0/13-resources.md
```

The script reads the target file, applies all eight rule checks, computes the grade, and prints the JSON output to stdout. Exit code is 0 for any grade — the consumer decides what to do with grade < 4.

### Via CLI wrapper (optional, planned)

A `flowmcp dev spec evaluate --rule=rfc2119` wrapper is planned as a follow-up. Not implemented in V1.

## Implementation

The deterministic check logic lives in `check.mjs` (sibling file). The skill body above is the primary documentation; the script is the executable enforcement of the same rules.

## Granularity Awareness

This skill respects the granularity table in `spec/v4.0.0/README.md`. Files marked as prosaic (currently `00-overview.md`, `08-migration.md`, `21-schema-lifecycle.md`) are exempt from rules RFC-001 and RFC-006 — they are not required to carry the conformance note or reference, because they are explicitly written in natural language.

## Rule Catalog: Detailed Definitions

### RFC-001 (error) — Conformance Block reference

Every normative file MUST include a one-line pointer at the top, immediately after the H1, in the form:

```markdown
> Normative language (MUST/SHOULD/MAY) follows the conventions defined in [00-overview.md](./00-overview.md) (Conformance Language).
```

The check verifies that this line exists within the first 10 lines of the file.

### RFC-002 (error) — Uppercase keywords

RFC2119 keywords are only normative in UPPERCASE form. Any lowercase variant in a normative context is non-conformant (see RFC-003 for the warning version, RFC-002 for unambiguous errors like `mUsT` or mixed case).

### RFC-003 (warning) — Lowercase normative keywords

The phrases `must be`, `should be`, `may be`, `is required`, `shall be` in a normative context should be uppercase. The check uses heuristics — sentences with a clear subject-verb structure (e.g. `A schema must export ...`) are flagged. Style-filler phrases (`we must remember`) are caught by RFC-007 instead.

### RFC-004 (warning) — Verb pattern

The recommended pattern is `<subject> MUST <verb>` (e.g. `A schema MUST export a main constant`). Patterns like `It MUST be X` (without antecedent) or `MUST be X` (without subject) are flagged.

### RFC-005 (error) — Negation spacing

`MUST NOT` and `SHALL NOT` MUST have a space between the words. Forms like `MUSTNOT`, `MUST-NOT`, or `mustnt` are non-conformant.

### RFC-006 (error) — Conformance boilerplate

Every normative file (per granularity table) MUST start with the boilerplate note (see RFC-001). This is the structural check: the file simply lacks the note at the top.

### RFC-007 (hint) — Style filler

Phrases that include `must`/`should` as English filler (not as RFC2119 keywords) but in capitalized form would be misleading. The check detects common patterns:

- `we must remember that`
- `it should be clear`
- `one may note`
- `should be obvious`

These should be rephrased to avoid the keyword.

### RFC-008 (hint) — Cross-reference format

Inter-file references should follow the canonical form `see N-file.md` (e.g. `see 14-skills.md`). Forms like `see Skills doc` or `see 14_skills` are flagged for style consistency.

## See also

- [`../README.md`](../README.md) — Spec-Quality-Skills overview
- [`../../README.md`](../../README.md) — Skills two-type model
- [`../../../spec/v4.0.0/00-overview.md`](../../../spec/v4.0.0/00-overview.md) — Conformance Language section
- [`../../../spec/v4.0.0/README.md`](../../../spec/v4.0.0/README.md) — Granularity table (which files are normative)
