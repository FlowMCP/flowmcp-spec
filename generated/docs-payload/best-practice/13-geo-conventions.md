---
title: "Geo Conventions"
description: "Geo has a few conventions that everyone trips over once. Adopt the established defaults instead of inventing your own — it keeps schemas interoperable and spares the model a class of silent mistakes."
best_practice_version: "0.1.0"
spec_file: "13-geo-conventions.md"
order: 13
section: "Best Practice"
normative: false
source_commit: "2e9a898"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/2e9a898/best-practice/0.1.0/schema-creation/13-geo-conventions.md"
generated_at: "2026-06-04T21:10:58.055Z"
generated_from: "best-practice/0.1.0/schema-creation/13-geo-conventions.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: best-practice/0.1.0/schema-creation/13-geo-conventions.md."
---

Geo has a few conventions that everyone trips over once. Adopt the established defaults instead of inventing your own — it keeps schemas interoperable and spares the model a class of silent mistakes.

---

## Longitude-first bounding boxes

A bounding box is `[ minLon, minLat, maxLon, maxLat ]` — **longitude first** (RFC 7946 / GeoJSON order). Swapping the pair sends a query to the wrong hemisphere and returns plausible-but-wrong results, with no error to warn you. A bbox around Berlin:

```js
// [ minLon, minLat, maxLon, maxLat ]
const berlin = [ 13.088, 52.338, 13.761, 52.675 ]
```

If a schema must accept the other order, make it **explicit** — never guess:

```js
{ position: { key: 'axisOrder', value: '{{USER_PARAM}}', location: 'query' },
  z: { primitive: 'enum(lonlat,latlon)', options: [] } }   // no silent default
```

## One selector per call

Geo tools that accept several ways to locate a place (free text, coordinates, a postal code, an OSM id) should take **exactly one** per call. Two selectors is ambiguous — reject it rather than picking one silently:

```js
// caller sends exactly one of: text | latlon | postalCode | osmId
if( selectorCount !== 1 ) { throw new Error( 'GEO-RESOLVE-001: provide exactly one location selector' ) }
```

## A join key vs. a human anchor

Use a stable administrative code as the **join key** between datasets, and a human-friendly code only as a display **anchor**. For German data, that means joining on the municipality key (AGS) and showing the postal code (PLZ) — not the other way around:

```text
join on:   ags  = "11000000"   (stable, 1:1 with the municipality)
show as:    plz = "10115"       (familiar, but many PLZ per municipality)
```

## One-liner

- **Events are not in OpenStreetMap.** Querying OSM for concerts, markets, or exhibitions returns nothing useful — reach for a dedicated events/culture source instead.

## Related

- **Related:** [`12-load-and-scale.md`](/best-practice/load-and-scale/)

