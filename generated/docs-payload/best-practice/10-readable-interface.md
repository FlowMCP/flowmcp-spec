---
title: "Readable Interface: Enums, Parameter Names & Handler Phases"
description: "Make the schema readable for the **LLM**, not for the API. An API may speak in terse codes; the model should not have to. Three related levers turn a cryptic upstream into a self-explaining tool."
best_practice_version: "0.1.0"
spec_file: "10-readable-interface.md"
order: 10
section: "Best Practice"
normative: false
source_commit: "3979b97"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/3979b97/best-practice/0.1.0/schema-creation/10-readable-interface.md"
generated_at: "2026-06-04T20:12:27.959Z"
generated_from: "best-practice/0.1.0/schema-creation/10-readable-interface.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: best-practice/0.1.0/schema-creation/10-readable-interface.md."
---

Make the schema readable for the **LLM**, not for the API. An API may speak in terse codes; the model should not have to. Three related levers turn a cryptic upstream into a self-explaining tool.

---

## Human-readable enums

Expose enum *values* that read in plain language (`enum(1-hour,1-day)` instead of `h1,d1`) and map them to the API codes in the `preRequest` handler.

- Beleg: `create-flowmcp-schema/SKILL.md:205-220`
- Example: `schemas/v4.0.0/providers/blocknative/gasprice.mjs:28`

The model picks a value it understands; the handler translates it on the way out.

## Improve parameter names & keys

When an API uses cryptic keys — `o/h/l/c/v` for open/high/low/close/volume, a bare `Z`, and so on — invent **speaking parameter names**, let the values be passed under those names, and write a `preRequest` handler that maps the readable names/keys onto the real API. This removes the friction between the LLM and the data source, and it is worth the effort.

- Beleg-Mechanismus: `schemas/v4.0.0/providers/blocknative/gasprice.mjs:72-77` rewrites the readable `chainName`/alias in `preRequest` onto the real key `chainid` (`struct.url.replace('chainName=…','chainid=…')`).
- Header variant: `schemas/v4.0.0/providers/birdeye/birdeye.mjs:161-167`.

> **Honest classification:** the *mechanism* (a `preRequest` key rewrite) is proven in the code above. The concrete OHLCV application is a *new* recommendation built on that proven mechanism — not yet a shipped example.

## Handler-phase contract (the why + the gotcha)

`preRequest` is exactly the place for these rewrites — which is *why* the contract matters. The phases read the payload differently:

| Phase | Reads | Reference |
|-------|-------|-----------|
| `executeRequest` | **nested** `payload.userParams.X` | `flowmcp-core/src/v2/task/Fetch.mjs:65-68` |
| `preRequest` | **flat** `payload.X` | `Fetch.mjs:45-48` |
| `postRequest` | **flat** `payload.X` | `Fetch.mjs:93-97` |

Mixing them up means the handler **silently does not fire** — no error, just a rewrite that never happens. When a `preRequest` rewrite appears to do nothing, check that it reads `payload.X` (flat), not `payload.userParams.X`.

## Related

- **Depends on:** [`01-overview.md`](/best-practice/overview/)
- **Related:** [`14-correctness-license.md`](/best-practice/correctness-license/)

