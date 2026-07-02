# FlowMCP Specification v4.0.0 — Index

This directory contains the active FlowMCP specification (version 4.0.0). All files are hand-pflege — generated artifacts live in [`../../generated/`](../../generated/).

## Lese-Reihenfolge fuer Neueinsteiger

| Schritt | Datei | Zweck |
|---------|-------|-------|
| 1 | [`00-overview.md`](./00-overview.md) | Vision, Conformance Language, Terminology, Document Index |
| 2 | [`09-validation-rules.md`](./09-validation-rules.md) | Binding rules registry (VAL/AGT/RES/SKL/SEL codes) |
| 3 | [`13-resources.md`](./13-resources.md) | Resource format (SQLite, Markdown, HTTP) |
| 4 | [`17-selections.md`](./17-selections.md) | Cross-provider composition |
| 5 | [`22-scoring-protocol.md`](./22-scoring-protocol.md) | Quality scoring protocol |

After these five files, the remaining documents fill in details — read them as you need them.

## Datei-Index

| # | Datei | Kurzbeschreibung | Normativ? |
|---|-------|------------------|-----------|
| 00 | [`00-overview.md`](./00-overview.md) | Vision, three-level architecture, Conformance Language | nein (prosaisch) |
| 01 | [`01-schema-format.md`](./01-schema-format.md) | `main` + five primitives, optional `meta` block, naming | ja, hoch |
| 02 | [`02-parameters.md`](./02-parameters.md) | Position/z blocks, shared list interpolation | ja, hoch |
| 03 | [`03-shared-lists.md`](./03-shared-lists.md) | Reusable value lists, dependencies, filtering | ja, mittel |
| 04 | [`04-output-schema.md`](./04-output-schema.md) | Output definitions, MIME-Types, response envelope | ja, hoch |
| 05 | [`05-security.md`](./05-security.md) | Zero-import policy, library allowlist, static scan | ja, hoch |
| 06 | [`06-agents.md`](./06-agents.md) | Agent manifests, model binding, system prompts | ja, hoch |
| 07 | [`07-tasks.md`](./07-tasks.md) | MCP Tasks async fields (reserved) | ja, mittel |
| 08 | [`08-migration.md`](./08-migration.md) | v1.2.0 → v2.0.0 → v3.0.0 → v4.0.0 migration guides | nein (prosaisch + examples) |
| 09 | [`09-validation-rules.md`](./09-validation-rules.md) | Complete validation checklist (central code registry) | ja, sehr hoch |
| 10 | [`10-tests.md`](./10-tests.md) | Tool tests, resource tests, agent tests | ja, mittel |
| 11 | [`11-preload.md`](./11-preload.md) | Schema initialization with startup data | ja, mittel |
| 12 | [`12-prompt-architecture.md`](./12-prompt-architecture.md) | Provider-Prompts, Agent-Prompts, composable references | ja, mittel |
| 13 | [`13-resources.md`](./13-resources.md) | SQLite resources, Markdown, HTTP sources, runSql | ja, hoch |
| 14 | [`14-skills.md`](./14-skills.md) | Skill `.mjs` format, placeholders, versioning | ja, hoch |
| 15 | [`15-catalog.md`](./15-catalog.md) | Catalog manifest, registry.json, import flow | ja, mittel |
| 16 | [`16-id-schema.md`](./16-id-schema.md) | Unified `namespace/type/name` format | ja, hoch |
| 17 | [`17-selections.md`](./17-selections.md) | Cross-provider compositions with prefill | ja, hoch |
| 18 | [`18-prefill.md`](./18-prefill.md) | Schema-side parameter pre-population | ja, hoch |
| 19 | [`19-mcp-integration.md`](./19-mcp-integration.md) | MCP server bindings, primitive mapping | ja, hoch |
| 20 | [`20-validation-strategy.md`](./20-validation-strategy.md) | Multi-layer validation strategy | ja, mittel |
| 21 | [`21-schema-lifecycle.md`](./21-schema-lifecycle.md) | Stages, gates, hold/blocked states | nein (prosaisch + stages) |
| 22 | [`22-scoring-protocol.md`](./22-scoring-protocol.md) | GradeReporter scoring v1 | ja, hoch |
| 23 | [`23-license-and-tos.md`](./23-license-and-tos.md) | Three-layer license model, ToS handling | ja, mittel |

**Total:** 24 specification documents (00..23). 21 normative, 3 prosaisch.

## Source vs Derived

| Pfad | Hand-pflege? |
|------|--------------|
| `spec/v4.0.0/*.md` | yes — source of truth |
| `spec/v4.0.0/README.md` (this file) | yes — index |
| `../../generated/llms.txt` | no — auto-generated bundle |
| `../../generated/docs-payload/*.md` | no — auto-generated docs-payload |
| `../../generated/docs-payload/manifest.json` | no — auto-generated index |

## Granularitaets-Tabelle (welche Files sind normativ)

Files mit normativem Inhalt verwenden RFC2119-Sprache (MUST/SHOULD/MAY etc.) und tragen die Conformance-Notiz am Anfang. Prosaisch markierte Files beschreiben Hintergrund, Lifecycle oder Migration ohne bindende Regeln.

| Klasse | Files | Sprache |
|--------|-------|---------|
| Normativ, sehr hoch | `09-validation-rules.md` | RFC2119 strict |
| Normativ, hoch | `01`, `02`, `04`, `05`, `06`, `13`, `14`, `16`, `17`, `18`, `19`, `22` | RFC2119 |
| Normativ, mittel | `03`, `07`, `10`, `11`, `12`, `15`, `20`, `23` | RFC2119 |
| Prosaisch | `00-overview.md`, `08-migration.md`, `21-schema-lifecycle.md` | natuerliche Sprache |

## Last-Reviewed

Stand der letzten formalen Pflege-Pruefung:

| Datei | Last-Reviewed |
|-------|---------------|
| Alle Spec-Files | 2026-05-21 (Spec-Quality-Rollout) |

(Diese Tabelle wird in Folge-Memos pro File aktualisiert, sobald `evaluator-spec-rfc2119` produktiv laeuft.)

## Historik

Aeltere Spec-Versionen sind frozen und liegen in:

- [`../v3.0.0/`](../v3.0.0/) — 17 Dokumente (frozen, 2026-03-12)
- [`../v2.0.0/`](../v2.0.0/) — 13 Dokumente (frozen, 2026-02-20)

## Werkzeuge

| Werkzeug | Pfad | Zweck |
|----------|------|-------|
| Auto-Generation | [`../../.github/workflows/generate-llms-txt.yml`](../../.github/workflows/generate-llms-txt.yml) | erzeugt `generated/llms.txt` |
| Doku-Site-Notify | [`../../.github/workflows/notify-docs-site.yml`](../../.github/workflows/notify-docs-site.yml) | triggert `flowmcp.github.io` Sync |
| Quality-Evaluator | [`../../skills/spec-quality/evaluator-spec-rfc2119/`](../../skills/spec-quality/evaluator-spec-rfc2119/) | RFC2119-Konformitaets-Check |
