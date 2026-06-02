# Grading Skills

This directory is the home for the **public grading-stage skills** of the FlowMCP
schema lifecycle (stages 6+7, `spec/v4.3.0/21-schema-lifecycle.md`). They drive
the v2 island grading path through the CLI and the `AreaScorer` harness — no
external API key required.

## Skills

| Skill | Purpose |
|-------|---------|
| `grade-score-single` | Grade a single schema via the v2 island path (import → emit-prompts → AreaScorer harness scoring → consume-scores), read the grade from `providers/<ns>/index.json`. NO-OVERWRITE guaranteed. |
| `grade-score-batch` | Batch-grade many schemas with crash-recovery, iterating `grade-score-single` sequentially. |

## Current location

As of Memo 097 these two skills are maintained as Claude Code skills and are
invoked by name from the harness. Their canonical home is this directory
(`flowmcp-spec/skills/grading/`); until the SKILL.md copies are normalized to
English and placed here, the live definitions are driven by the CLI grading flow:

```bash
flowmcp grading import <provider-path> --json
flowmcp grading run <ns> --emit-prompts --json
flowmcp grading run <ns> --consume-scores <scores.json> --json
```

> **Note (tracked):** the grade-score SKILL.md sources still contain mixed-language
> (Denglisch) headings and must be normalized to English before being committed
> here verbatim. They were intentionally NOT copied in unmodified to keep this
> public repo English-only. This is a follow-up to Memo 097 PA-7.

## Generator is not a skill

The grading **generator** (`PromptBuilder`, `AreaScorer`, `FleetRunner`) lives in
`flowmcp-grading/src/` and is driven via the CLI (`grading run --emit-prompts` →
`--consume-scores`). It has no `SKILL.md` and is never a stand-alone skill.

## Distribution

Public skills. Place them manually in your Claude Code skills path and install
them yourself — no auto-install command.

## See also

- `spec/v4.3.0/22-scoring-protocol.md` — scoring protocol
- Grading-Spec v3.0.0 (`grading/3.0.0/`) — grading model, monitoring track
- [`../schema/flowmcp-schema/SKILL.md`](../schema/flowmcp-schema/SKILL.md) — lifecycle entry point
- [`../README.md`](../README.md) — skills directory overview
