---
title: "Overview"
description: "The Best-Practice track is the third FlowMCP spec track, sitting alongside the normative **Specification** and the **Grading** spec. Where those two define what a schema *is* and how it is..."
best_practice_version: "0.1.0"
spec_file: "01-overview.md"
order: 1
section: "Best Practice"
normative: false
source_commit: "42b4603"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/42b4603/best-practice/0.1.0/01-overview.md"
generated_at: "2026-06-21T01:06:21.418Z"
generated_from: "best-practice/0.1.0/01-overview.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: best-practice/0.1.0/01-overview.md."
---

The Best-Practice track is the third FlowMCP spec track, sitting alongside the normative **Specification** and the **Grading** spec. Where those two define what a schema *is* and how it is *evaluated*, this track is **advisory and non-normative**: it gathers the recommendations and hard-won learnings for writing good schemas, not compliance rules. Nothing on these pages can disqualify a schema — they raise quality systematically, beyond the mere absence of errors.

> This track is informative and advisory. It introduces no new normative keywords of its own and uses "should", never "MUST" — the normative-language conventions (MUST / SHOULD / MAY) are defined once in the [Specification overview](/specification/overview/) and are not redefined here.

---

## What this track is

The character of the track in one line:

> **You don't have to, but you should.**

It holds recommendations and learnings, not validation rules. The normative rules stay in the Specification and the Grading-Spec; this track is where quality grows *systematically*, beyond the mere absence of errors.

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

---

## How to read this track

The track is organised into **categories**. The first — and currently only — category is **Schema Creation**: how to build a FlowMCP schema that reads well for an LLM and grades well. It is split into five **areas**, each a single page:

| Area | Page | Core recommendation |
|------|------|---------------------|
| BP-1 | [Readable Interface](/best-practice/readable-interface/) | Make the schema readable for the LLM, not for the API |
| BP-2 | [Reference Data](/best-practice/reference-data/) | Maintain recurring lists and value formats once, inherit everywhere |
| BP-3 | [Load & Scale](/best-practice/load-and-scale/) | Pick the load/store strategy by data size and query ability |
| BP-4 | [Geo Conventions](/best-practice/geo-conventions/) | Use the established geo defaults instead of rolling your own |
| BP-5 | [Correctness & License](/best-practice/correctness-license/) | Assume nothing silently, fake nothing, document provenance and rights |

The principle behind the cut is **few strong pages over many thin ones**: fifteen documented patterns are bundled into five thematic areas, so new patterns grow into an existing area rather than into a new stub.

## Versioning

The Best-Practice track is independently versioned as `bestPracticeSpec/0.1.0` — analogous to the Specification and Grading tracks. The documentation site surfaces the version as a sidebar badge.

`0.1.0` ships **schema-creation only**. Further categories (e.g. schema maintenance, grading hints) are deliberately a later backlog — first the scaffold, then the growth.

## Naming

The source folder is `best-practice/` (singular, consistent with `spec/` and `grading/`); the published file is **`best-practices.txt`** (plural). The generation maps between them.

## Bundled one-liners

Small, sharp learnings that do not warrant a full page:

- **Events are not in OpenStreetMap.** Querying OSM for concerts, markets, or exhibitions returns nothing useful — reach for a dedicated events/culture source instead.
- **"No errors" is the floor, not the ceiling.** A schema that passes `flowmcp grading deterministic` is the *minimum* bar — real quality shows over weeks of use.
- **Read the source first.** Never build from an invented prompt; the prospect issue's `URL` + `Typ` are the authoritative starting point.

## Related

- [`schema-creation/10-readable-interface.md`](/best-practice/readable-interface/)

