---
title: "Load & Scale: In-Memory, SQLite, Add-ons, Query Bundling"
description: "Choose the load and storage strategy by **data size** and by the **query ability** of the source. A small static file and a large queryable corpus do not deserve the same machinery — match the..."
best_practice_version: "0.1.0"
spec_file: "12-load-and-scale.md"
order: 12
section: "Best Practice"
normative: false
source_commit: "95ebb83"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/95ebb83/best-practice/0.1.0/schema-creation/12-load-and-scale.md"
generated_at: "2026-06-22T15:23:11.485Z"
generated_from: "best-practice/0.1.0/schema-creation/12-load-and-scale.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: best-practice/0.1.0/schema-creation/12-load-and-scale.md."
---

Choose the load and storage strategy by **data size** and by the **query ability** of the source. A small static file and a large queryable corpus do not deserve the same machinery — match the mechanism to the data.


## Preload small static data into memory

A fictional schema needs to turn postal codes into city names from a 5,000-row reference file with no query API. Fetch it **once** at init, parse it into a lookup, and serve every call from memory — not one network round-trip per request:

```js
// once, at init:
const rows = parseCsv( await fetchText( 'https://data.example/plz-cities.csv' ) )
const cityByPlz = new Map( rows.map( ( r ) => [ r.plz, r.city ] ) )

// per call: instant, offline
getCity: async ( { payload } ) => ( { response: { city: cityByPlz.get( payload.plz ) ?? null } } )
```

Preload is a *pattern* — load-on-init plus an in-memory cache — not a schema field.

## Escalate to SQLite for large static data

If that reference set were 5 *million* rows with range and geo queries, holding it in memory is wasteful. Escalate to an embedded SQLite file, declare the driver, and guard the handler so it fails clearly when the driver is missing:

```js
main = { requiredLibraries: [ 'better-sqlite3' ], /* … */ }

findNearby: async ( { libraries, payload } ) => {
    if( !libraries[ 'better-sqlite3' ] ) { throw new Error( 'STOPS-001: SQLite driver not injected' ) }
    // query the prepared DB by bounding box …
}
```

Large + static + queryable → SQLite. Smaller or one-off → keep it in memory.

## Package reusable data as an add-on

When one dataset backs many methods, expose it as a thin add-on that names the source and how to load it, and let init parse it once:

```js
main = { source: 'acme-stops', mode: 'url', url: 'https://data.example/stops.geojson', addon: 'geo-geojson' }
// init parses the file once → memory; every method serves from that single parsed copy
```

## Over-fetch beats under-fetch

A fictional places API rate-limits hard. Asking for cafés, then bakeries, then pharmacies as three calls burns three slots; one combined query costs one:

```text
BAD : query(type=cafe) ; query(type=bakery) ; query(type=pharmacy)   → 3 rate-limit slots
GOOD: query(type in [cafe,bakery,pharmacy])                          → 1 slot
```

Be precise about what the limit governs: the number of clauses is **not** the limit — the size of the **result set** is. Where a source allows it, ship **selections**: pre-built query templates with the known gotchas already baked in, so callers don't rediscover them.

## Related

- [`13-geo-conventions.md`](/best-practice/geo-conventions/) — the established geo defaults that keep schemas interoperable and avoid silent mistakes.

