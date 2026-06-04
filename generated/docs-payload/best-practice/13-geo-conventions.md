---
title: "Geo Conventions"
description: "Use the established geo defaults instead of rolling your own. The geo entry point already settled these conventions; new geo schemas should inherit them."
best_practice_version: "0.1.0"
spec_file: "13-geo-conventions.md"
order: 13
section: "Best Practice"
normative: false
source_commit: "3979b97"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/3979b97/best-practice/0.1.0/schema-creation/13-geo-conventions.md"
generated_at: "2026-06-04T20:12:27.959Z"
generated_from: "best-practice/0.1.0/schema-creation/13-geo-conventions.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: best-practice/0.1.0/schema-creation/13-geo-conventions.md."
---

Use the established geo defaults instead of rolling your own. The geo entry point already settled these conventions; new geo schemas should inherit them.

---

## Lon-first bounding boxes (RFC 7946)

A bounding box is `[minLon, minLat, maxLon, maxLat]` — longitude first. State the `axisOrder` (`lonlat` | `latlon`) **explicitly, never silently**.

- Beleg: `schemas/v4.0.0/providers/geo/geo.mjs:276-299,:160,:166`
- `geoExtent` is pure calculation — no network call.

## Geo default methods

The geo handgriff tools are the canonical surface — prefer them over bespoke geo logic:

`geoResolve` (dispatcher), `geoForward`, `geoReverse`, `geoPostal`, `geoLookup`, `geoNearby`, `geoExtent`.

Exactly **one selector per call** — otherwise `GEO-RESOLVE-001`.

## AGS = join key, PLZ = anchor

Join internally over the German **AGS** (`Amtlicher Gemeindeschlüssel`, Destatis, licensed dl-de/by-2-0). Use the **PLZ** (postal code, OpenPLZ) as the *human* anchor — never the other way around. (Memo 100 Kap. 6)

## One-liner

- **Events are not in OpenStreetMap.** For cultural events, go to a culture-data source, not OSM. (Memo 100 Kap. 8.6)

## Related

- **Depends on:** [`01-overview.md`](/best-practice/overview/)
- **Related:** [`12-load-and-scale.md`](/best-practice/load-and-scale/)

