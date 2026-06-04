---
title: "Introduction"
description: "The Best-Practice track is the **third** FlowMCP spec track, alongside the **Specification** (`spec/v4.3.0/`) and **Grading** (`grading/3.0.0/`). Both of those are normative — they define what a..."
best_practice_version: "0.1.0"
spec_file: "00-introduction.md"
order: 0
section: "Best Practice"
normative: false
source_commit: "3979b97"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/3979b97/best-practice/0.1.0/00-introduction.md"
generated_at: "2026-06-04T20:12:27.959Z"
generated_from: "best-practice/0.1.0/00-introduction.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: best-practice/0.1.0/00-introduction.md."
---

> Conformance language is intentionally absent here. Unlike the Schemas Specification and the Grading-Spec, the Best-Practice track is **advisory**: it collects recommendations and learnings. It uses "should", not "MUST".

---

## What this track is

The Best-Practice track is the **third** FlowMCP spec track, alongside the **Specification** (`spec/v4.3.0/`) and **Grading** (`grading/3.0.0/`). Both of those are normative — they define what a schema *is* and how it is *evaluated*. This track is different in character:

> **You don't have to, but you should.**

It holds **recommendations and learnings**, not validation rules. Nothing here disqualifies a schema. The normative rules stay in the Specification and the Grading-Spec; this track raises quality *systematically*, beyond mere absence of errors.

## The problem it solves — alignment

Subagents that pick up a new prospect or build a new schema used to start **without a shared knowledge base**. Whatever one agent learned (a cryptic API key convention, a geo axis-order gotcha, a license trap) stayed with that agent. The next subagent rediscovered it — or didn't, and produced rework.

The Best-Practice track is published as a single generated text file, **`best-practices.txt`**, that is attached to every schema-building subagent prompt as a **mandatory link**. So every subagent shares the same gotchas. It scales: thirty parallel subagents all append the same, **updatable** file → better schemas from the start, less rework.

## Why it exists — a concrete learning

When working through prospects, an agent once handed subagents **self-invented prompts** instead of reading the source first ("just search for something about IHK") to finish faster. Subagents are smart enough to produce output even from poor input — but the bad start cost roughly ten schemas of rework.

The lesson — **read the source first** — is exactly why this track exists. The learning moves from *luck* (a capable agent happening to do the right thing) to *structure* (every subagent receives the best practices as a mandatory source).

A second truth: **"no errors" is not a quality standard.** Error-freeness is the floor; real quality shows over weeks. Best practices lift quality systematically, not just the error count.

## Character

- **Recommendation, not rule** — "should", never "MUST".
- **Living and extensible** — new patterns grow *into* an existing area, not into a new stub page.
- **Source-first** — every recommendation is backed by a real code reference (`file:line`) or a memo.

## Related

- **Related:** [`01-overview.md`](/best-practice/overview/)

