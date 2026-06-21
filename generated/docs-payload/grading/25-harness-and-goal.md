---
title: "Harness and `/goal`"
description: "Non-deterministic grading runs inside a harness, and the harness is driven by a completion condition rather than a fixed step count. This chapter defines that harness, the completion-condition..."
grading_version: "3.0.0"
spec_file: "25-harness-and-goal.md"
order: 25
section: "Grading"
normative: true
source_commit: "236dbb3"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/236dbb3/grading/3.0.0/25-harness-and-goal.md"
generated_at: "2026-06-21T11:44:44.465Z"
generated_from: "grading/3.0.0/25-harness-and-goal.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/3.0.0/25-harness-and-goal.md."
---

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](/grading/overview/).

Non-deterministic grading runs inside a harness, and the harness is driven by a completion condition rather than a fixed step count. This chapter defines that harness, the completion-condition mechanism, and the surfacing convention that makes the run's progress visible to the transcript-only evaluator. Because each turn restarts from scratch, it also fixes the two-loop structure and the idempotency rule that keep state in files rather than in memory.

---

## The Harness

Non-deterministic grading runs in a **harness**. The harness enum is `claude-code` and is recorded in the grading envelope (`harness`). A non-deterministic evaluation is performed by a sub-agent with a fresh, empty context, read-only tools, a single pass, and strict-JSON output. Deterministic answers come from code and are merged with the sub-agent answers into one area output.

## The completion condition

`/goal` sets a completion condition. The agent then works turn by turn, autonomously, until the condition is satisfied. A **small, fast evaluator model** confirms the condition. The completion condition is at most 4000 characters and can be bounded with "or stop after N turns".

**Critical: the evaluator reads ONLY the transcript and calls NO tools.** It cannot inspect the file system, run a check, or open a grading file. It only sees the text of the conversation so far. Everything the evaluator needs to decide "done or not done" MUST be visible in the transcript.

The `/goal` documentation is at `https://code.claude.com/docs/en/goal`. Headless invocation: `claude -p "/goal <condition>"`.

## The mandatory surfacing convention

Because the evaluator sees only the transcript, the grading loop **MUST surface its progress and end-state into the transcript**. Writing silently to disk is not enough for `/goal` — the evaluator cannot see disk. This surfacing convention is how the data is moved into view, and it is mandatory.

The loop MUST emit `[GRADING]` lines:

- Per area, on completion:
  `[GRADING] area=single-test/getFirstPrice schema-valid=✓ status=graded written=✓`
- Progress:
  `[GRADING] PROGRESS 7/12`
- Final:
  `[GRADING] DONE`

A `schema-valid=✓` marker confirms the area output validated against its output schema; `status=…` reflects the resulting node status; `written=✓` confirms the grading file was written. The evaluator confirms completion by reading these lines from the transcript.

## Outer goal loop and inner micro-loop

Two nested loops:

- **Outer loop = `/goal`.** Condition example: "grade every area in scope until each one is schema-valid — or stop after N turns".
- **Inner micro-loop = the skill triad** per area: `start-grade → evaluate → apply-improvement`. It stops on empty `improvementHints`, `iteration >= N`, or a blocker.

## Idempotent turns

Because `/goal` restarts each turn from scratch, every turn MUST be **idempotent**. State lives in files (`state.json` plus the `_gradings/` folders, rolled up in [`index.json`](/grading/index-json/)). Each turn reads the state, picks the **next ungraded area**, grades it, surfaces the result, and writes state. No turn may depend on in-memory state from a previous turn.

## Harness-agnostic artifacts

The same artifacts (`state.json`, `_gradings/`, area output schemas, the surfacing lines) are driven by different drivers; only the driver changes:

| Driver | Use |
|--------|-----|
| `/goal` (interactive) | The interactive workbench session; `/goal` alone with a turn bound. |
| `claude -p "/goal …"` + script stop-hook | Headless / CI; the stop-hook deterministically checks the `_gradings/` folders so the run does not rely on the transcript-only evaluator alone. |
| `FleetRunner.skillInvoker` callback | Programmatic seam; `FleetRunner` makes no LLM calls itself — it invokes the skill via the callback. |

The prompt builder appends a **Goal-Block** (a fitting completion condition plus the surfacing convention) to the area prompt. The entry-point prompt ([`20-entry-point-prompt.md`](/grading/entry-point-prompt/)) MAY reference this Goal-Block.

## Related

- [`00-overview.md`](/grading/overview/)
- [`08-grading-model.md`](/grading/grading-model/)
- [`20-entry-point-prompt.md`](/grading/entry-point-prompt/)
- [`23-index-json.md`](/grading/index-json/)
- [`24-selection-aggregate.md`](/grading/selection-aggregate/)

