# Generated Spec Outputs

All files in this directory are **auto-generated**. Do NOT edit by hand — changes are overwritten on the next build.

## Files

| Path | Purpose | Generator |
|------|---------|-----------|
| [`llms.txt`](./llms.txt) | Concatenated spec bundle for LLM consumption | `.github/workflows/generate-llms-txt.yml` |
| [`llms-schema-spec.txt`](./llms-schema-spec.txt) | Alias of `llms.txt` for docs-site convention | same workflow |
| [`docs-payload/`](./docs-payload/) | Astro-ready Markdown files with frontmatter | `.github/workflows/generate-docs-payload.yml` |
| [`custom-gpt/`](./custom-gpt/) | Planned — Custom-GPT-bot bundle (roadmap) | (not yet implemented) |

## Metadata Header

Every file in `generated/` MUST carry a frontmatter header documenting its provenance:

```yaml
---
generated_at: <ISO timestamp>
generated_from: <source path or URL>
generator: <script path or workflow>
spec_version: <e.g. 4.0.0>
edit_warning: <human-readable warning>
---
```

For Markdown files (in `docs-payload/`) this is a YAML frontmatter block at the top. For text bundles (`llms.txt`, `llms-schema-spec.txt`) the header is a Markdown block at the top of the file.

## Consumers

| Consumer | Pulls | Method |
|----------|-------|--------|
| [`flowmcp.github.io`](https://github.com/FlowMCP/flowmcp.github.io) | `docs-payload/` + `llms.txt` | `sync-spec.mjs` via GitHub-API |
| `flowmcp-cli` | `llms.txt` (planned) | future self-update mechanism |
| Custom-GPT-bot | `custom-gpt/` (roadmap) | future bundle loading |

## Interface Contract

The Doku-Payload interface (Markdown files with frontmatter + `manifest.json` index) is the **stable contract** between this repo and downstream consumers. Schema, field semantics, and abruf-pattern are defined in Memo 049 REV-06 Chapter 6.

Consumers MUST:

- respect frontmatter fields (title, description, slug)
- propagate the `edit_warning` to readers
- check `spec_version` for breaking-change handling
- not rewrite cross-links (they are relative on purpose)

Consumers MUST NOT:

- add frontmatter fields not present in the source payload (would be a parallel source)
- modify body content (source is `spec/v{X.Y.Z}/`)
- generate `manifest.json` themselves (lives only here)

## Generation Trigger

| Source change | Trigger |
|---------------|---------|
| Push to `draft/specification/**.md` | `generate-llms-txt.yml` regenerates `generated/llms.txt` and `generated/llms-schema-spec.txt` |
| Push to `draft/**.md` | `generate-docs-payload.yml` rebuilds the per-family payload + bridge + manifest under `dist/` |
| Push to `generated/**` or `dist/**` | `notify-docs-site.yml` dispatches a `spec-generated-updated` event to `flowmcp.github.io` |

## See Also

- [`../README.md`](../README.md) — Repository overview with Conventions & Quality Standards
- [`../draft/specification/4.3.0/spec/`](../draft/specification/4.3.0/spec/) — Specification source (hand-authored)
- [`../dist/`](../dist/) — Generated per-family docs payload, bridge, and manifest
- Memo 049 REV-06 (`.memo/049-spec-internal-refs-cleanup/revisions/REV-06.md`) — Interface contract specification
