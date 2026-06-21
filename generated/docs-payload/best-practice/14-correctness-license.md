---
title: "Correctness, License & Provenance"
description: "Assume nothing silently, fake nothing, and document where the data comes from and under which rights. Correctness and provenance are what separate a schema that *passes* from one that can be..."
best_practice_version: "0.1.0"
spec_file: "14-correctness-license.md"
order: 14
section: "Best Practice"
normative: false
source_commit: "236dbb3"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/236dbb3/best-practice/0.1.0/schema-creation/14-correctness-license.md"
generated_at: "2026-06-21T11:44:44.465Z"
generated_from: "best-practice/0.1.0/schema-creation/14-correctness-license.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: best-practice/0.1.0/schema-creation/14-correctness-license.md."
---

Assume nothing silently, fake nothing, and document where the data comes from and under which rights. Correctness and provenance are what separate a schema that *passes* from one that can be *trusted*.

---

## No silent defaults; a 4xx is not a pass

Don't paper over a missing parameter or a failed call. The model needs to know the difference between "no result" and "the call broke":

```js
// BAD — hides a missing input and a failed request:
const limit = payload.limit || 10
if( res.status >= 400 ) { return { response: { items: [] } } }   // looks empty, was actually a 401

// GOOD — explicit:
if( payload.limit === undefined ) { throw new Error( 'REQ-001: limit is required' ) }
if( res.status >= 400 ) { throw new Error( `HTTP-${ res.status }: upstream rejected the request` ) }
```

A result counts as *working* only when the call succeeded **and** returned non-empty, non-duplicate data. A `4xx`/`5xx` or an empty body is a failure, never a quiet success.

## Make parse rules explicit

When a schema ingests a flat file, state every parse rule — separator, date format, column mapping, type coercion. Guessing turns `0`/`1` flags into booleans, or `"01/02"` into the wrong month:

```js
parseConfig: {
    delimiter: ';',
    dateFormat: 'YYYY-MM-DD',
    columns: { plz: 'string', active: 'integer' }   // active = 0|1 stays an integer, not a boolean
}
// missing parseConfig → fail loudly (e.g. CSV-CFG-001), never assume defaults
```

## Use synthetic, CC0 test data

Never commit real provider responses to a public repo — that can breach the source's license. Ship small **synthetic** fixtures under a permissive license (CC0) for tests, and keep production data separate:

```text
tests/fixtures/markets.sample.json   ← hand-made, CC0, 3 rows — safe to publish
(real API responses)                 ← never committed
```

## Cover the documented surface

Expose all endpoints the API documents, and justify any you leave out. An unjustified reduction lowers interoperability — fewer tools means fewer connections to other schemas.

## Record the Terms of Service

Put the ToS URL in the schema itself, so nobody has to hunt for it twice:

```js
main = {
    termsOfService: 'https://acme.example/terms',
    termsOfServiceCheckedAt: '2024-05-29',
    termsOfServiceLanguage: 'en'
    // sentinel 'no-tos-found' is allowed when a source genuinely has none
}
```

A small workflow can fetch the URL, run a robots/legal check, and stamp these fields — turning a one-off search into a recorded fact.

## Related

- [`10-readable-interface.md`](/best-practice/readable-interface/)

