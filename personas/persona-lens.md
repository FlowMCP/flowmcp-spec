# Persona-Lens (5 Validierungs-Fragen pro Persona)

> **Internes Kalibrierungs-Dokument.** Lens für jeden PRD-Reviewer und Content-Entscheider.
> Verwendung: jede Sektion einer Seite, jeder Blog-Draft, jedes Doku-Update gegen die 4 Lenses prüfen.
> Stand: 2026-05-24 — basierend auf Memo 058 REV-04 Kap. 3.

---

## Mira-Lens (Hackathon-Builder)

> Patience: sehr niedrig (5–15min). Key Friction: Spec vor Quickstart, v3/v4-Verwirrung, API-Key-Pflicht.

1. [ ] Erreicht Mira **ein funktionierendes Beispiel in <5 Minuten** ab Landing?
2. [ ] Ist **Mock-Mode** dokumentiert (kein API-Key für Demo)?
3. [ ] Sind **Copy-Buttons** an Code-Snippets sichtbar?
4. [ ] Findet sie das **Hackathon-Kit** in maximal 2 Klicks von Landing?
5. [ ] Vermeidet die Seite **v3/v4-Verwirrung** (eine aktive Spec)?

**Misserfolg:** Mira springt nach <5min ab. Setup-Friction = tot.

---

## Daniel-Lens (AI-Engineer / LLM-Integrator)

> Patience: hoch für gute Docs. Key Friction: Marketing-Sprache, fehlende API-Reference, unklare Version-Lifecycle.

1. [ ] Gibt es eine vollständige **API-Reference** ohne Marketing-Sprech?
2. [ ] Ist die **Programmatic-API** (`reference/core-methods.md`) klar von der CLI-Reference getrennt?
3. [ ] Gibt es ein **MCP-Compliance-Statement** (was wird unterstützt, was nicht)?
4. [ ] Ist die **Version-Lifecycle** dokumentiert (was passiert mit v3 bei v5)?
5. [ ] Findet er einen **Agent-Creation-Guide** in `guides/` (Daniel-Friction)?

**Misserfolg:** Daniel wechselt zu einer anderen Library mit besserer Doku.

---

## Sofia-Lens (Schema-Maintainer / OSS-Contributor)

> Patience: hoch für präzise Specs. Key Friction: v3-Reste neben v4, fehlende Validation-Rule-IDs, kein Maintainer-Kontakt.

1. [ ] Ist die **v4-Spec eindeutig** (v3 nur in Archive, nicht in Active Docs)?
2. [ ] Haben **Validation-Rules eindeutige IDs** (z.B. RES001, RES002)?
3. [ ] Ist ein **Maintainer-Kontakt** (GitHub Discussions, Discord, E-Mail) sichtbar?
4. [ ] Ist der **PR-Prozess** dokumentiert (wie reiche ich ein Schema ein)?
5. [ ] Gibt es **Quality-Standards** für Schemas (Test-Coverage, Lifecycle, Lizenz-Header)?

**Misserfolg:** Sofia stellt eine Frage, die schon in der Doku stand → schlechte Maintainer-Erfahrung.

---

## Anders-Lens (Decision-Maker / CTO)

> Patience: **90 Sekunden** für erste Entscheidung. Key Friction: Buzzwords, kein Team sichtbar, keine Roadmap, Lizenz-Unklarheit.

1. [ ] Findet Anders **MIT-Lizenz + Team + Roadmap** in <90 Sek. ab Landing?
2. [ ] Sind **Trust-Signals** sichtbar (CI-Status, Coverage, Last-Release)?
3. [ ] Vermeidet die Seite **Buzzwords** ("revolutionary", "next-gen")?
4. [ ] Ist die **Production-Posture** dokumentiert (wer nutzt es, wer maintained es)?
5. [ ] Ist die **Roadmap mit Datum** (Now/Next/Later mit Quartalen)?

**Misserfolg:** Anders schließt den Tab nach 90 Sek. ohne Entscheidung — verloren.

---

## Konflikt-Auflösung im Review

Wenn ein Vorschlag eine Persona-Lens passt, eine andere bricht:

| Konflikt | Auflösung |
|----------|-----------|
| Mira ✓, Anders ✗ | **Ablehnen** oder anders lösen (Mira-Friction in Sub-Seite "below the fold", Anders-Trust-Signal "above the fold"). Quelle: `entry-points.md` Konflikt-Regel. |
| Daniel ✓, Mira ✗ | Daniel gewinnt — Production-Use schlägt Hackathon-Demo, ausser saisonaler Push. |
| Sofia ✓, alle anderen neutral | Geht durch (Sofia-Targeting macht keine Persona schwächer). |

## Verwendung

Bei jedem PRD-Review oder Content-Update:

1. Inhalt skizziert.
2. **4 Lenses durchgehen.** Jeweils 5 Fragen.
3. Bei "Nein" zu einer Frage: ist das Akzeptable? Mit Begründung (z.B. "Mira-Friction OK, weil dies eine Sofia-Sektion ist").
4. Bei "Nein" zu 2+ Fragen einer Persona ohne Begründung: → überarbeiten.

## Audit-Spur

Quelle: Memo 058 REV-04 Kap. 3.3.
Verwandt: `entry-points.md`, `overview.md`, einzelne Persona-Dokumente.
