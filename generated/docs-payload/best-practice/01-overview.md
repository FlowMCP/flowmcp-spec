---
title: "Overview"
description: "This page explains how to read the Best-Practice track, how it is versioned, and bundles the one-liners that are too small for their own page."
best_practice_version: "0.1.0"
spec_file: "01-overview.md"
order: 1
section: "Best Practice"
normative: false
source_commit: "3979b97"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/3979b97/best-practice/0.1.0/01-overview.md"
generated_at: "2026-06-04T20:12:27.959Z"
generated_from: "best-practice/0.1.0/01-overview.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: best-practice/0.1.0/01-overview.md."
---

This page explains how to read the Best-Practice track, how it is versioned, and bundles the one-liners that are too small for their own page.

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

The Best-Practice track is independently versioned as `bestPracticeSpec/0.1.0`, recorded in `data/refs.manual.json` (`bestPractice.currentVersion` + `specDir`) — analogous to `spec` and `grading`. The doc-site surfaces the version as a sidebar badge.

`0.1.0` ships **schema-creation only**. Further categories (e.g. schema maintenance, grading hints) are deliberately a later backlog — first the scaffold, then the growth.

## Naming

The source folder is `best-practice/` (singular, consistent with `spec/` and `grading/`); the published file is **`best-practices.txt`** (plural). The generation maps between them.

## Bundled one-liners

Small, sharp learnings that do not warrant a full page:

- **Events are not in OpenStreetMap.** Querying OSM for cultural events returns nothing useful — use a culture-data source instead (e.g. kulturdaten.berlin). (Memo 100 Kap. 8.6)
- **"No errors" is the floor, not the ceiling.** A schema that passes `flowmcp grading deterministic` is the *minimum* bar — real quality shows over weeks of use.
- **Read the source first.** Never build from an invented prompt; the prospect issue's `URL` + `Typ` are the authoritative starting point.

## Related

- **Depends on:** [`00-introduction.md`](/best-practice/introduction/)
- **Related:** [`schema-creation/10-readable-interface.md`](/best-practice/readable-interface/)

