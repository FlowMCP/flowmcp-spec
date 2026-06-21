---
title: "Readable Interface: Enums, Parameter Names & Handler Phases"
description: "Design the schema for the **model that calls it**, not for the API behind it. An upstream API often speaks in terse codes; the language model should not have to decode them. Translate at the edge so..."
best_practice_version: "0.1.0"
spec_file: "10-readable-interface.md"
order: 10
section: "Best Practice"
normative: false
source_commit: "236dbb3"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/236dbb3/best-practice/0.1.0/schema-creation/10-readable-interface.md"
generated_at: "2026-06-21T11:44:44.465Z"
generated_from: "best-practice/0.1.0/schema-creation/10-readable-interface.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: best-practice/0.1.0/schema-creation/10-readable-interface.md."
---

Design the schema for the **model that calls it**, not for the API behind it. An upstream API often speaks in terse codes; the language model should not have to decode them. Translate at the edge so the surface the model sees is self-explaining.

---

## Human-readable enums

Say a fictional `AcmeWeather` API takes `?step=h1|d1|w1`. Those codes mean nothing to a model. Expose readable values and map them to the wire format in `preRequest`:

```js
// What the model sees — clear, guessable values:
parameters: [ {
    position: { key: 'interval', value: '{{USER_PARAM}}', location: 'query' },
    z: { primitive: 'enum(1-hour,1-day,1-week)', options: [] }
} ]

// preRequest translates to the API's codes (flat payload access):
preRequest: async ( { struct, payload } ) => {
    const wire = { '1-hour': 'h1', '1-day': 'd1', '1-week': 'w1' }
    struct.url = struct.url.replace( `interval=${ payload.interval }`, `step=${ wire[ payload.interval ] }` )
    return { struct }
}
```

The caller picks a value it understands; the handler does the translation. The API contract is unchanged — only the surface improves.

## Speaking parameter names

The same idea applies to opaque keys in a **response**. A fictional `AcmeMarkets` candles endpoint returns `{ o, h, l, c, v, t }`. Rename them to descriptive fields in `postRequest` so downstream tools get a stable, obvious shape:

```js
postRequest: async ( { response } ) => {
    const candles = response.data.map( ( { o, h, l, c, v, t } ) => ( {
        open: o, high: h, low: l, close: c, volume: v, time: t
    } ) )
    return { response: { candles } }
}
```

A model can chart `candles[].close`; it cannot reliably guess what `c` means.

## The handler-phase contract

The two snippets above read the payload differently on purpose. Handlers run in three phases, and each sees the payload in one shape only:

| Phase | When | Reads the payload as |
|-------|------|----------------------|
| `preRequest` | before the call | **flat** — `payload.interval` |
| `executeRequest` | the call itself | **nested** — `payload.userParams.interval` |
| `postRequest` | after the call | **flat** — `payload.interval` |

Reading the wrong shape raises no error — the handler just never fires. So when a `preRequest` rewrite seems to do nothing, first check it reads `payload.interval` (flat), not `payload.userParams.interval`. `preRequest` is the canonical place for enum and key rewrites because it runs before the call with flat access to every parameter.

## Related

- [`14-correctness-license.md`](/best-practice/correctness-license/)

