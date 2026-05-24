# Persona-Entry-Points (Website-Mapping)

> **Internes Kalibrierungs-Dokument.** Persona-Namen tauchen **nie** auf der Website auf — sichtbar sind nur Navigation-Bezeichnungen.
> Stand: 2026-05-24 — basierend auf Memo 058 REV-04 Kap. 3 + 6.2.

## Die vier Personas

| Persona | Rolle (intern) | Haupt-Frage | Patience | Key Friction |
|---------|----------------|-------------|----------|--------------|
| **Mira** (24, Lisbon) | Hackathon-Builder | "Schema in 30min, demo-ready" | sehr niedrig (5–15min) | Spec vor Quickstart, v3/v4-Verwirrung, API-Key-Pflicht |
| **Daniel** (34, Amsterdam) | AI-Engineer / LLM Integrator | "Production-ready, ohne in-house-Loader" | hoch für gute Docs | Marketing-Sprache, fehlende API-Reference, unklare Version-Lifecycle |
| **Sofia** (41, Barcelona) | Schema-Maintainer / OSS-Contributor | "PR-fähiges Schema bauen" | hoch für präzise Specs | v3-Reste neben v4, fehlende Validation-Rule-IDs, kein Maintainer-Kontakt |
| **Anders** (48, Stockholm) | Decision-Maker / CTO | "Was ist es, wer steht dahinter, production-ready?" | 90 Sek. erste Entscheidung | Buzzwords, kein Team sichtbar, keine Roadmap, Lizenz-Unklarheit |

## Entry-Points auf der Website (Ziel-Zustand)

| Persona | Entry Point | Was sie dort findet | Erfolgskriterium |
|---------|-------------|---------------------|------------------|
| Mira | `/quickstart/` | Funktionierendes Hello-World <5min, Copy-Buttons, Mock-Mode | Erstes Beispiel läuft ohne Setup |
| Daniel | `/concepts/` + `/reference/` | Architektur, API-Reference, MCP-Compliance-Statement, Version-Lifecycle | Versteht den Stack in <30min |
| Sofia | `/specification/` + Contributing-Pfad | Spec v4 (eindeutig), Validation-Rule-IDs, PR-Prozess, Maintainer-Kontakt | Kann Schema einreichen ohne Maintainer-Frage |
| Anders | `/about/`, `/roadmap/`, `/team/` (autonome Pfade) | "Was ist FlowMCP" in 60 Sek., MIT-Lizenz, Team, Roadmap | Versteht in 90 Sek. was es ist und wer dahintersteht |

**WICHTIG:** Die Personas-Bezeichnungen tauchen in der Navigation nicht auf. Sichtbar sind nur "Quickstart", "Concepts", "Specification", "Reference", "Guides", "About", "Roadmap", "Team", "Blog" — die Personas-Logik liegt darunter.

## Konflikt-Regel

| Konflikt | Auflösung |
|----------|-----------|
| **Mira ↔ Anders** | **Anders gewinnt.** Anders entscheidet Production-Adoption (langfristig). Mira erzeugt Visibility, selten direkte Adoption. |
| Ausnahme | Explizite Hackathon-Pushes (saisonal) — dann Mira-First für Zeitraum X. |
| Sofia ↔ Daniel | Beide profitieren oft gleichzeitig — selten echter Konflikt. Bei Konflikt: Daniel (Production-Use). |
| Daniel ↔ Anders | Daniel ist Anders' "Hands" — Daniels Anforderungen erfüllt → Anders zufrieden. |

## Persona-getriebene Suchphrasen (Input für Memo 057 Sitemap)

| Persona | Beispiel-Suchanfrage | Zielseite |
|---------|---------------------|-----------|
| Mira | "open source MCP server hackathon" / "AI agent schema library" | `/quickstart/` + `/guides/hackathon-kit/` |
| Daniel | "MCP-compatible tool registry" / "normalize data sources for AI" | `/about/` + `/concepts/` |
| Sofia | "schema registry contributing" / "FlowMCP schema format" | `/specification/` |
| Anders | "production AI tools framework" / "FlowMCP roadmap" | `/about/` + `/roadmap/` + `/team/` |

## Wichtige Regeln (aus `personas/overview.md`)

| Regel | Begründung |
|-------|------------|
| **Persona-Namen niemals auf der Website** | Personas sind interne Kalibrierungs-Vorbilder, nicht User-facing Labels. |
| **Kein "For Decision Makers"-Header** im Frontend | Direkt-Targeting wirkt aufdringlich. Lieber: Headings wie "What is FlowMCP" + Trust-Signals (Lizenz, Team, Roadmap) — Anders findet das von selbst. |
| **Tone per Section** | Hero darf knapp/energisch sein, About/Architecture/Roadmap muss faktisch sein. |
| **Substanz > Momentum** | Production-Logos und Lizenz dominieren, Hackathon-Awards ergänzen (nicht Hero-Trust-Signal). |

## Verwendung

- **Phase-2-PRDs (Website-Restruktur)** prüfen jeden P-Punkt gegen die Entry-Points-Tabelle.
- **Phase-4-PRDs (Blog-Drafts)** prüfen Tone-pro-Persona via `persona-lens.md`.
- **Memo 057** verwendet Suchphrasen-Tabelle als Input für Sitemap.

## Audit-Spur

Quelle: `personas/overview.md`, `personas/{ai-engineer,decision-maker,hackathon-builder,schema-maintainer}.md`, Memo 058 REV-04 Kap. 3 + 6.2.
