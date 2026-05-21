# Legacy Schema Examples

This folder contains schema examples from earlier FlowMCP versions (v1.x, v2.x, v3.x). They are preserved for **migration reference only** — they do not represent current best practices for v4.0.0.

## What's here

| File | Source Spec Version |
|------|---------------------|
| `async-schema.mjs` | v2.0.0 |
| `example-skill.mjs` | (early skill format) |
| `example-skill-external.mjs` | (early skill format) |
| `full-v3-schema.mjs` | v3.0.0 |
| `minimal-schema.mjs` | v2.0.0 |
| `multi-route-schema.mjs` | v2.0.0 |
| `resource-only-schema.mjs` | v3.0.0 |
| `resource-schema.mjs` | v3.0.0 |
| `shared-list-definition.mjs` | v1.x |
| `shared-list-schema.mjs` | v2.0.0 |
| `skill-schema.mjs` | v3.0.0 |
| `tools-only-schema.mjs` | v3.0.0 |

## When to use these

Only when you are **migrating an existing schema** from an older version to v4.0.0. Look at the old shape, then read `spec/v4.0.0/08-migration.md` for the migration steps, then write the v4.0.0 version in your own repo.

## When NOT to use these

For new schemas in v4.0.0. Use `../v4.0.0/` examples and follow the current spec.

## Active examples

Current examples for v4.0.0 (and v4.1.0):

- [`../v4.0.0/`](../v4.0.0/) — reference schemas across the five primitives
- [`../sqlite-gtfs-example.mjs`](../sqlite-gtfs-example.mjs) — v4.1.0 sqlite-gtfs source type (Memo 051)

## See also

- [`../../spec/v4.0.0/`](../../spec/v4.0.0/) — Current specification
- [`../../spec/v3.0.0/`](../../spec/v3.0.0/) — Frozen v3 spec
- [`../../spec/v2.0.0/`](../../spec/v2.0.0/) — Frozen v2 spec
- [`../../spec/v4.0.0/08-migration.md`](../../spec/v4.0.0/08-migration.md) — Migration guide
