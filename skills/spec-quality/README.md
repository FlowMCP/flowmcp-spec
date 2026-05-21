# Spec-Quality Skills

This directory contains evaluator skills that verify the FlowMCP specification itself against domain-specific quality criteria. Each skill answers a precise question and returns a structured grade with actionable issues.

## Evaluator-Skill Pattern

All skills here follow the same pattern. See [`SKILL.md`](#) examples in sub-folders for concrete implementations.

### Input

A target file to evaluate (typically a spec file under `spec/v{X.Y.Z}/*.md`).

### Output (JSON)

```json
{
    "grade": 4,
    "issues": [
        { "severity": "error",   "code": "RFC-001", "line": 42, "message": "Missing reference to Conformance Language" },
        { "severity": "warning", "code": "RFC-002", "line": 17, "message": "Lowercase 'must' in normative context" },
        { "severity": "hint",    "code": "RFC-007", "line":  8, "message": "Phrase 'we must remember' is not normative" }
    ],
    "summary": "1 error, 1 warning, 1 hint — RFC2119 conformance is partial"
}
```

## Grading-Skala 1-5

```
grade = 5
for each error in issues:   grade -= 1.0
for each warning in issues: grade -= 0.25
for each hint in issues:    grade -= 0.0      (hints are informational only)
grade = max(1, round(grade))
```

| Grade | Bedeutung | Bedingung |
|-------|-----------|-----------|
| **5** | Bestens — Spec-konform | 0 Errors, 0-2 Warnings |
| **4** | Sehr gut | 0 Errors, 3-4 Warnings ODER 1 Error |
| **3** | Akzeptabel mit Verbesserungspotenzial | 1 Error + Warnings ODER 2 Errors |
| **2** | Maengelhaft | 3 Errors |
| **1** | Nicht akzeptabel | 4+ Errors |

## Severity-Stufen

| Severity | Bedeutung | Effekt auf Grade |
|----------|-----------|------------------|
| **error** | Spec-Verstoss. MUST fixen. | −1.0 |
| **warning** | Empfehlung verletzt. SHOULD fixen. | −0.25 |
| **hint** | Stil-Hinweis. MAY fixen. | 0 (rein informativ) |

## Aktive Evaluator-Skills

| Skill | Prueft | Status |
|-------|--------|--------|
| [`evaluator-spec-rfc2119/`](./evaluator-spec-rfc2119/) | RFC2119/BCP14 conformance (uppercase keywords, conformance block, granularity, cross-refs) | active (V1, Memo 049 Phase 2) |

## Geplante Evaluator-Skills (Folge-Memos)

| Skill | Prueft |
|-------|--------|
| `evaluator-spec-coderefs` | `VAL/AGT/RES/SKL/SEL`-Codes eindeutig + auffindbar |
| `evaluator-spec-cross-refs` | Cross-Refs (`see N-file.md`) aufloesbar |
| `evaluator-spec-mermaid-style` | Mermaid-Diagramm-Konsistenz |
| `evaluator-spec-tables` | Markdown-Tabellen-Struktur |
| `evaluator-spec-memo-refs` | findet versehentliche Memo/PRD-Verweise (Audit-Regression) |
| `evaluator-schema-v4-conformance` | FlowMCP-Schemas (`flowmcp-schemas-public`) gegen Spec v4 |
| `evaluator-readme-completeness` | README gegen Konventionen |
| `evaluator-docs-payload` | `generated/docs-payload/*.md` gegen Frontmatter-Spec (siehe `generated/docs-payload/README.md`) |

Jeder neue Skill folgt dem Pattern oben. Inkrementeller Aufbau in Folge-Memos.

## Wie aufrufen

### Via Claude Code (primaer)

Claude Code findet `SKILL.md` automatisch beim Arbeiten im `flowmcp-spec` Repo. Aufruf per natuerlicher Sprache:

> Evaluate `spec/v4.0.0/13-resources.md` against RFC2119.

Der Skill liefert das JSON-Output zurueck.

### Via deterministisches Helper-Skript (optional, fuer CI)

Falls ein Skill ein `check.mjs` Helper-Skript hat:

```bash
node skills/spec-quality/evaluator-spec-rfc2119/check.mjs --json spec/v4.0.0/13-resources.md
```

### Via CLI-Wrapper (optional, Roadmap)

`flowmcp dev spec evaluate` ist ein moeglicher Folge-Memo-Output, aktuell nicht implementiert.

## Wieso „nicht generisch, sondern spezifisch"?

Ein Evaluator-Skill MUSS eine konkrete, regel-getriebene Frage beantworten. Generische Fragen wie „ist das gut geschrieben?" sind wertlos — sie sind nicht deterministisch, nicht reproduzierbar und nicht handlungsleitend.

Stattdessen: domaenen-spezifische Pruefung mit Rule-Codes, Line-Numbers und klaren Severity-Stufen. So bleibt die Pruefung skalierbar — neue Evaluatoren werden inkrementell hinzugefuegt, jeder fuer einen klaren Bereich.

## Siehe auch

- [`../README.md`](../README.md) — Skills-Uebersicht (spec-quality + external)
- [`../external/README.md`](../external/README.md) — Wegweiser auf externe Skills
- [`../../README.md`](../../README.md) — Repo-README mit Quality-Standards-Sektion
