---
title: "Reference Data Without Duplicates: Shared Lists & Canonical Values"
description: "Maintain recurring lists and value formats **once**, and inherit them everywhere. Duplicated reference data drifts; a single canonical source does not."
best_practice_version: "0.1.0"
spec_file: "11-reference-data.md"
order: 11
section: "Best Practice"
normative: false
source_commit: "3979b97"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/3979b97/best-practice/0.1.0/schema-creation/11-reference-data.md"
generated_at: "2026-06-04T20:12:27.959Z"
generated_from: "best-practice/0.1.0/schema-creation/11-reference-data.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: best-practice/0.1.0/schema-creation/11-reference-data.md."
---

Maintain recurring lists and value formats **once**, and inherit them everywhere. Duplicated reference data drifts; a single canonical source does not.

---

## Shared lists

Declare `sharedLists` and reference entries with the token `{{listName:field}}`; the loader interpolates them when the schema is loaded.

- Beleg: `flowmcp-core/.../Pipeline.mjs:277`, `SharedListResolver.interpolateEnum()` `:39-71`
- Example: `schemas/v4.0.0/providers/taapi/indicators-part1.mjs:17-19,:30` (Memo 073)

> **Gotcha:** the `_shared/` and `_lists/` directories are a pure **storage convention** — they are **not** loader-skipped. The mechanism that resolves shared lists is `SharedListResolver.mjs:74-99`; the schema field is `sharedLists`. (This corrects an earlier assumption that `_shared`/`_lists` were skipped by the loader.)

## ISO-8601 as canonical time

Keep time values internally in ISO-8601 (UTC). When the source carries its own time representation, preserve it **additively** as an `_ISO8601` shadow field — never overwrite the original. (Memo 106)

## Keyless-first ordering

Order data sources by **descending reachability**: open APIs before key-bound ones. Never force a key at the very start of a journey — a keyless path should always exist first.

- Beleg: the provider ordering in `schemas/v4.0.0/providers/geo/geo.mjs` (Nominatim/OpenPLZ before Geoapify/GeoNames). (Memo 092/100)

## Related

- **Depends on:** [`01-overview.md`](/best-practice/overview/)
- **Related:** [`10-readable-interface.md`](/best-practice/readable-interface/)

