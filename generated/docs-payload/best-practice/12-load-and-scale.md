---
title: "Load & Scale: In-Memory, SQLite, Add-ons, Query Bundling"
description: "Pick the load/store strategy by **data size** and by the **query ability** of the source. A small static file and a large queryable corpus do not deserve the same machinery."
best_practice_version: "0.1.0"
spec_file: "12-load-and-scale.md"
order: 12
section: "Best Practice"
normative: false
source_commit: "3979b97"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/3979b97/best-practice/0.1.0/schema-creation/12-load-and-scale.md"
generated_at: "2026-06-04T20:12:27.959Z"
generated_from: "best-practice/0.1.0/schema-creation/12-load-and-scale.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: best-practice/0.1.0/schema-creation/12-load-and-scale.md."
---

Pick the load/store strategy by **data size** and by the **query ability** of the source. A small static file and a large queryable corpus do not deserve the same machinery.

---

## Preload via `loadFromUrl` (in-memory)

A source with no — or only limited — query ability: fetch it **once** at init, parse + validate + type-coerce, then serve from memory by URL. This is **not** a schema field and **not** SQLite.

- Beleg: `geo-csv-tsv-toolkit/src/adapters/FlowMcpAdapter.mjs:14-21`, `converters/csv/CsvUrlStore.mjs:29` (Memo 096)

> **Gotcha:** "Preload" is a *pattern*, not a schema key. There is no `preload:` field — the behaviour is `loadFromUrl()` plus an in-memory cache.

## In-memory → SQLite escalation

Static large data with no query ability: escalate to SQLite via `requiredLibraries: ['better-sqlite3']` plus a handler guard. Smaller / one-off data stays in memory.

- Beleg: `schemas/v4.0.0/providers/geo/geo.mjs:24,:183-185,:495-500`; `_shared/sqliteRadius.mjs:13-16` (gtfs/overture).

## Add-on as a URL resource

A thin schema `{ source, mode: url, url, addon }`. Init parses the file **once** into memory; runtime serves all methods from the add-on. (Memo 096)

## Over-fetch > under-fetch

Bundle N tag predicates into **one** union query (one rate-limit slot) instead of N separate queries.

- The clause count ≠ the limit; the **result size** is the limit.
- **Selections** are pre-built query templates with the gotchas baked in. (Memo 100 Kap. 9)

## Related

- **Depends on:** [`01-overview.md`](/best-practice/overview/)
- **Related:** [`13-geo-conventions.md`](/best-practice/geo-conventions/)

