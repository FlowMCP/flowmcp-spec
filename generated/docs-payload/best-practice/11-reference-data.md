---
title: "Reference Data Without Duplicates: Shared Lists & Canonical Values"
description: "Maintain recurring lists and value formats **once**, and inherit them everywhere. Duplicated reference data drifts: one copy gets a new entry, the others quietly fall behind. A single canonical..."
best_practice_version: "0.1.0"
spec_file: "11-reference-data.md"
order: 11
section: "Best Practice"
normative: false
source_commit: "659863f"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/659863f/best-practice/0.1.0/schema-creation/11-reference-data.md"
generated_at: "2026-06-21T18:39:36.331Z"
generated_from: "best-practice/0.1.0/schema-creation/11-reference-data.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: best-practice/0.1.0/schema-creation/11-reference-data.md."
---

Maintain recurring lists and value formats **once**, and inherit them everywhere. Duplicated reference data drifts: one copy gets a new entry, the others quietly fall behind. A single canonical source cannot drift against itself.


## Shared lists

Say three tools in a schema all accept the same set of supported chains. Instead of repeating the enum in each tool, define the list once and reference it with an interpolation token. The loader expands the token at load time, so every tool always offers the current set:

```js
// Defined once (a shared list named "chains"):
// values: [ { id: 'eth', label: 'Ethereum' }, { id: 'base', label: 'Base' } ]

main = {
    sharedLists: [ 'chains' ],
    tools: {
        getBalance: {
            parameters: [ {
                position: { key: 'chain', value: '{{USER_PARAM}}', location: 'query' },
                z: { primitive: 'enum({{chains:id}})', options: [] }   // → enum(eth,base) at load
            } ]
        }
    }
}
```

Add a new chain in one place and all three tools gain it. (Directories like `_shared/` are just a tidy place to keep such lists — what makes a list shared is the `sharedLists` declaration, not the folder.)

## ISO-8601 as the canonical time format

A fictional API returns `{ "ts": 1717000000 }` — epoch seconds. Don't overwrite it; **add** a canonical ISO-8601 field next to it, so the response stays faithful *and* becomes usable:

```js
postRequest: async ( { response } ) => {
    return { response: {
        ...response,
        ts_ISO8601: new Date( response.ts * 1000 ).toISOString()   // keep ts, add "2024-05-29T18:13:20.000Z"
    } }
}
```

ISO-8601 sorts lexically, carries its own UTC offset, and parses without a format guess — keep time in it internally.

## Keyless-first ordering

When several providers can answer the same question, try the open ones first. A fictional geocoder should reach for a key-free service before a key-bound one, so a first-time user gets an answer before configuring anything:

```js
// order of attempts: open first, keyed as fallback
const providers = [ 'nominatim',          // no key
                    'acme-geo' ]           // needs ACME_GEO_KEY
```

Never force a key at the very start of a journey when a keyless path exists.

## Related

- [`10-readable-interface.md`](/best-practice/readable-interface/) — designing the surface for the calling model with readable enums, names, and handler phases.

