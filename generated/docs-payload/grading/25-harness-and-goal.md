---
title: "Harness and `/goal`"
description: "Non-deterministic grading runs in a **harness**. The harness enum is `claude-code` and is recorded in the grading envelope (`harness`). A non-deterministic evaluation is performed by a sub-agent with..."
grading_version: "2.0.0"
spec_file: "25-harness-and-goal.md"
order: 25
section: "Grading"
normative: true
source_commit: "5971378"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/5971378/grading/2.0.0/25-harness-and-goal.md"
generated_at: "2026-05-31T17:32:40.771Z"
generated_from: "grading/2.0.0/25-harness-and-goal.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/2.0.0/25-harness-and-goal.md."
---

| Field | Value |
|-------|-------|
| Status | Normative |
| Version | `gradingSpec/2.0.0` |
| Depends on | [`00-overview.md`](./00-overview.md), [`08-grading-model.md`](./08-grading-model.md) |
| Related | [`20-entry-point-prompt.md`](./20-entry-point-prompt.md), [`23-index-json.md`](./23-index-json.md), [`24-selection-aggregate.md`](./24-selection-aggregate.md) |

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](./00-overview.md).

---

## 1. The Harness

Non-deterministic grading runs in a **harness**. The harness enum is `claude-code` and is recorded in the grading envelope (`harness`). A non-deterministic evaluation is performed by a sub-agent with a fresh, empty context, read-only tools, a single pass, and strict-JSON output. Deterministic answers come from code and are merged with the sub-agent answers into one area output.

---

## 2. `/goal`

`/goal` sets a completion condition. The agent then works turn by turn, autonomously, until the condition is satisfied. A **small, fast evaluator model** confirms the condition. The completion condition is at most 4000 characters and can be bounded with "or stop after N turns".

**Critical: the evaluator reads ONLY the transcript and calls NO tools.** It cannot inspect the file system, run a check, or open a grading file. It only sees the text of the conversation so far. Everything the evaluator needs to decide "done or not done" MUST be visible in the transcript.

The `/goal` documentation is at `https://code.claude.com/docs/en/goal`. Headless invocation: `claude -p "/goal <condition>"`.

---

## 3. The Surfacing Convention (mandatory)

Because the evaluator sees only the transcript, the grading loop **MUST surface its progress and end-state into the transcript**. Writing silently to disk is not enough for `/goal` — the evaluator cannot see disk. This surfacing convention is how the data is moved into view, and it is mandatory.

The loop MUST emit `[GRADING]` lines:

- Per area, on completion:
  `[GRADING] area=single-test/getFirstPrice schema-valid=✓ status=graded written=✓`
- Progress:
  `[GRADING] PROGRESS 7/12`
- Final:
  `[GRADING] DONE`

A `schema-valid=✓` marker confirms the area output validated against its output schema; `status=…` reflects the resulting node status; `written=✓` confirms the grading file was written. The evaluator confirms completion by reading these lines from the transcript.

---

## 4. Outer Goal Loop and Inner Micro-Loop

Two nested loops:

- **Outer loop = `/goal`.** Condition example: "grade every area in scope until each one is schema-valid — or stop after N turns".
- **Inner micro-loop = the skill triad** per area: `start-grade → evaluate → apply-improvement`. It stops on empty `improvementHints`, `iteration >= N`, or a blocker.

---

## 5. Idempotent Turns

Because `/goal` restarts each turn from scratch, every turn MUST be **idempotent**. State lives in files (`state.json` plus the `_gradings/` folders, rolled up in [`index.json`](./23-index-json.md)). Each turn reads the state, picks the **next ungraded area**, grades it, surfaces the result, and writes state. No turn may depend on in-memory state from a previous turn.

---

## 6. Harness-Agnostic Artifacts

The same artifacts (`state.json`, `_gradings/`, area output schemas, the surfacing lines) are driven by different drivers; only the driver changes:

| Driver | Use |
|--------|-----|
| `/goal` (interactive) | The interactive workbench session; `/goal` alone with a turn bound. |
| `claude -p "/goal …"` + script stop-hook | Headless / CI; the stop-hook deterministically checks the `_gradings/` folders so the run does not rely on the transcript-only evaluator alone. |
| `FleetRunner.skillInvoker` callback | Programmatic seam; `FleetRunner` makes no LLM calls itself — it invokes the skill via the callback. |

The prompt builder appends a **Goal-Block** (a fitting completion condition plus the surfacing convention) to the area prompt. The entry-point prompt ([`20-entry-point-prompt.md`](./20-entry-point-prompt.md)) MAY reference this Goal-Block.

---

## Cross-References

- Grading envelope and `harness` field: [`08-grading-model.md`](./08-grading-model.md)
- Entry-point prompt (Goal-Block reference): [`20-entry-point-prompt.md`](./20-entry-point-prompt.md)
- State rollup the turns read/write: [`23-index-json.md`](./23-index-json.md)
- `/goal` documentation: `https://code.claude.com/docs/en/goal`
