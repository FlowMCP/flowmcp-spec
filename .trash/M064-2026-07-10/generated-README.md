# Generated Spec Outputs

All files in this directory are **auto-generated** by the spec build (`npm run build`). Do NOT edit by
hand — changes are overwritten on the next build.

## Files

| Path | Purpose | Generator |
|------|---------|-----------|
| [`llms.txt`](./llms.txt) | Concatenated specification bundle for LLM consumption | `scripts/generate-llms-txt.mjs` |
| [`llms-schema-spec.txt`](./llms-schema-spec.txt) | Byte-identical alias of `llms.txt` for docs-site convention | `scripts/generate-llms-txt.mjs` |
| [`best-practices.txt`](./best-practices.txt) | Concatenated best-practice bundle (advisory, non-normative) | `scripts/generate-best-practices-txt.mjs` |
| [`refs.resolved.json`](./refs.resolved.json) | Resolved cross-reference table | `scripts/generate-refs.mjs` |
| [`custom-gpt/`](./custom-gpt/) | Planned — Custom-GPT-bot bundle (roadmap) | (not yet implemented) |

The per-family Astro docs payload (Markdown with frontmatter + `manifest.json`) is **not** in this
directory — it lives under [`../dist/`](../dist/) and is documented in [`../dist/README.md`](../dist/README.md).

## Generation

Every artifact here is produced by the one build chain (`npm run build`), which is locally
reproducible — no GitHub workflow is needed to (re)generate them. There is no auto-commit bot; the
build runs read-only in CI (`lint-spec-quality.yml`) and the committed outputs are whatever a
`npm run build` writes on the authoring machine.

## Consumers

| Consumer | Pulls | Method |
|----------|-------|--------|
| [`flowmcp.github.io`](https://github.com/FlowMCP/flowmcp.github.io) | `llms.txt` + `best-practices.txt` + `../dist/` payload | `sync-spec.mjs` via GitHub-API |
| `flowmcp-cli` | `llms.txt` (planned) | future self-update mechanism |
| Custom-GPT-bot | `custom-gpt/` (roadmap) | future bundle loading |

The site only serves these artifacts through — it does not regenerate them (F14: docs sites do not
generate content). `best-practices.txt` in particular is generated here and copied through by the site.

## See Also

- [`../README.md`](../README.md) — Repository overview with Conventions & Quality Standards
- [`../draft/specification/`](../draft/specification/) — Specification source (hand-authored)
- [`../dist/`](../dist/) — Generated per-family docs payload, bridge, and manifest
