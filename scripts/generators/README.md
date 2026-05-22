# FlowMCP Guide Bot — Generator Scripts

These scripts generate the FlowMCP Guide Custom GPT bundle into a local-only sibling repository at `repos/flowmcp-guide/`.

> Bundle hosting is intentional: **local only, no GitHub remote**. See Memo 053 REV-06 for the rationale.

## Prerequisites

- Node.js 22+
- `gh` CLI authenticated (`gh auth status`) — used to fetch READMEs from public Org-Repos that are not cloned locally (`flowmcp-servers`, `x402-*`)
- The local sibling `repos/flowmcp-guide/` exists with `git init` (see Memo 053 PRD-01)
- `repos/flowmcp-guide/profile-image.png` exists (1024x1024, generated out-of-band — see Memo 053 PRD-11)

## Usage

Run the full bundle refresh:

```bash
cd repos/flowmcp-spec
node scripts/generators/regen-all.mjs
```

Or run individual generators:

```bash
node scripts/generators/gen-overview.mjs
node scripts/generators/gen-personas.mjs
# ...
node scripts/generators/gen-instructions.mjs
node scripts/generators/gen-metadata.mjs   # MUST be last (depends on SHA-256 of other outputs)
```

## Configuration

Override the target path via env var:

```bash
GUIDE_REPO_PATH=/some/other/path node scripts/generators/regen-all.mjs
```

Default: `../flowmcp-guide` relative to the spec repo root.

## Generators

| Generator | Output (in flowmcp-guide/) | Source |
|-----------|----------------------------|--------|
| `gen-overview.mjs` | `knowledge/01-overview.md` | spec README + personas/overview.md |
| `gen-personas.mjs` | `knowledge/02-personas.md` | personas/*.md |
| `gen-repos-overview.mjs` | `knowledge/03-repos-overview.md` | gh api for 10 Org-Repos |
| `gen-cli-handbook.mjs` | `knowledge/04-cli-handbook.md` | ../flowmcp-cli |
| `gen-core-arch.mjs` | `knowledge/05-core-architecture.md` | ../flowmcp-core + gh api flowmcp-servers |
| `gen-spec-summary.mjs` | `knowledge/06-spec-v4-summary.md` | spec/v4.0.0/ sections |
| `gen-llms-copy.mjs` | `knowledge/07-spec-v4-llms.txt` | spec/v4.0.0/llms.txt (1:1 copy) |
| `gen-schemas-catalog.mjs` | `knowledge/08-schemas-public-catalog.md` | ../flowmcp-schemas-public |
| `gen-agent-server.mjs` | `knowledge/09-mcp-agent-server.md` | ../mcp-agent-server |
| `gen-payments.mjs` | `knowledge/10-payments-x402.md` | gh api for 3 x402-* repos |
| `gen-faq.mjs` | `knowledge/11-faq.md` | data/faq.md (hand-maintained) |
| `gen-glossary.mjs` | `knowledge/12-glossary.md` | data/glossary-terms.json |
| `gen-instructions.mjs` | `instructions.md` | templates/instructions.template.md |
| `gen-metadata.mjs` | `metadata.json` | SHA-256 of all bundle files |

## Validators

| Validator | Purpose |
|-----------|---------|
| `validate-metadata.mjs` | Validates `metadata.json` against `schemas/metadata-schema.json` |
| `validate-frontmatter.mjs` | Verifies Knowledge files have required frontmatter fields |

## Refresh Workflow

When a source changes, file a "Bundle Refresh Needed" issue using the template at `.github/ISSUE_TEMPLATE/bundle-refresh-needed.md` and follow the steps from Memo 053 Chapter 13.
