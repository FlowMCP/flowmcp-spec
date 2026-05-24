# Diagramme-Policy

> **Internes Kalibrierungs-Dokument.** Stand: 2026-05-24, basierend auf Memo 058 REV-04 Kap. 7.

## Grundsatz

> *"Die PNG-Diagramme, die ich eingefügt habe, müssen weiterhin berücksichtigt werden."* (User-Anweisung)

PNG-Diagramme vom User vorbereitet bleiben **erhalten und referenziert**. Sie werden nicht durch Mermaid ersetzt, nicht gelöscht, nicht durch automatisierte Workflows überschrieben.

## Diagramm-Typen und Verwendung

| Typ | Wann | Wie |
|-----|------|-----|
| **Mermaid** (`flowchart TD`, Top-Down) | Strukturelle Übersichten in Docs/Blogs/Memos | Inline-Code im Markdown, immer **TD**, nicht LR |
| **PNG-Diagramme** (User-vorbereitet) | Vision-/Architektur-Übersichten, Hero-Bilder | Bleiben erhalten und referenziert. Werden nicht durch Mermaid ersetzt. |
| **Excalidraw-Stil** (optional, via `image-diagram-excalidraw` Skill) | Conference-Vorträge, Blog-Cover, Marketing-Bilder | Optional — nicht Pflicht |
| **Architektur-Kunst** (optional, via `image-art-architecture` Skill) | Blog-Cover, Social-Media-Kacheln | Optional |

## Regeln

| Regel | Begründung |
|-------|------------|
| Mermaid IMMER `flowchart TD` (Top-Down) | TD ist auf allen Bildschirmgrößen lesbar, LR schneidet auf engen Viewports ab |
| PNGs aus `public/images/` nicht löschen ohne User-Freigabe | User-vorbereitete Inhalte sind keine Build-Artefakte |
| Mermaid und PNG ergänzen sich | Mermaid für simple Strukturen, PNG für narrative Architektur-Story |
| Excalidraw + Architektur-Kunst sind optional | Use sparingly, nur wenn die Mermaid/PNG nicht reicht (Conference, Marketing) |

## PNG-Inventar (Stand 2026-05-24)

Siehe separate Datei `.memo/058-content-strecke/rollout/png-inventory.md` (im Memo-Ordner, weil Inventar zeitlich an Memo 058 gebunden).

## Anwendung

- **Bei jeder neuen Doku-Seite**: erst Inventar prüfen, ob ein passendes PNG existiert.
- **Bei jedem Blogpost**: zumindest ein Mermaid TD (für die Struktur) + optional ein PNG.
- **Memo 058 Beispiel**: Kap. 13 Content-Flow-Diagramm ist Mermaid TD ✓
- **Blogpost 1 v4** verwendet Mermaid TD im Pipes-Diagramm.
- **Blogpost 3 v4.1** verwendet Mermaid TD im Add-on-Architektur-Block.

## Audit-Spur

Memo 058 REV-04 Kap. 7.
