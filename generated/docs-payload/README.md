# Docs-Payload

This folder contains **auto-generated** Markdown files derived from `spec/v4.0.0/`. Each file is a single spec document with a YAML frontmatter block added — ready to be consumed by Astro Content Collections (in `flowmcp.github.io`) or similar tooling.

**Do NOT edit by hand.** Files are regenerated on every spec push.

## Files

| Path | Purpose |
|------|---------|
| `manifest.json` | Index of all docs-payload files with title, description, order, normative flag, and quality grade |
| `00-overview.md`..`23-license-and-tos.md` | One file per spec document, with Astro-ready frontmatter |

## Frontmatter Schema

Every Markdown file in this folder has the following frontmatter:

```yaml
---
title: "Resources"
description: "SQLite-based read-only data access with prepared statements and SQL security enforcement"
spec_version: "4.0.0"
spec_file: "13-resources.md"
order: 13
section: "Specification"
normative: true
generated_at: "2026-05-21T23:00:00Z"
generated_from: "flowmcp-spec/spec/v4.0.0/13-resources.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: flowmcp-spec/spec/v4.0.0/13-resources.md."
---
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | yes | Display title (from H1) |
| `description` | string | yes | Short description (from lead paragraph) |
| `spec_version` | string | yes | Spec version (e.g. `4.0.0`) |
| `spec_file` | string | yes | Source file relative to `spec/v{X.Y.Z}/` |
| `order` | number | yes | Sidebar sort order (matches file number prefix) |
| `section` | string | yes | Category (always `Specification` for now) |
| `normative` | boolean | yes | `true` if RFC2119 normative, `false` if prosaic |
| `generated_at` | ISO timestamp | yes | When this file was generated |
| `generated_from` | string | yes | Full source path |
| `generator` | string | yes | Script that produced this file |
| `edit_warning` | string | yes | Human-readable warning against hand-editing |

## manifest.json

The `manifest.json` file is the **discovery index**. It lists all docs-payload files and aggregate statistics:

```json
{
    "spec_version": "4.0.0",
    "generated_at": "2026-05-21T23:00:00Z",
    "generator": "scripts/generate-manifest.mjs",
    "files": [
        {
            "filename": "13-resources.md",
            "slug": "resources",
            "title": "Resources",
            "description": "...",
            "order": 13,
            "section": "Specification",
            "normative": true,
            "spec_quality": { "grade": 5, "issues": 0 }
        }
    ],
    "stats": {
        "total_files": 24,
        "normative_files": 21,
        "prose_files": 3,
        "average_grade": 5.0
    }
}
```

Consumers (e.g. Astro Content Collection in `flowmcp.github.io`) load `manifest.json` once at build-time to enumerate available pages, then fetch the individual `.md` files.

## Cross-Link Format

Cross-references between docs-payload files use **relative links**:

```markdown
... see [skills](./14-skills.md) for skill definitions.
```

Astro resolves these to `/docs/specification/skills/` based on its routing. Other consumers can map them to their own URL structure — the docs-payload format is URL-structure-agnostic.

## See Also

- [`../README.md`](../README.md) — Overall `generated/` folder explanation
- Memo 049 REV-06 Chapter 6 — Doku-Payload Interface contract (specification)
