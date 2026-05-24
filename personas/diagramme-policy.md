# Diagramme-Policy

> **Internes Kalibrierungs-Dokument.** Stand: 2026-05-24, basierend auf Memo 058 REV-04 Kap. 7.

## Grundsatz

> *"Die PNG-Diagramme, die ich eingefügt habe, müssen weiterhin berücksichtigt werden."* (User-Anweisung)

PNG-Diagramme vom User vorbereitet bleiben **erhalten und referenziert**. Sie werden nicht durch Mermaid ersetzt, nicht gelöscht, nicht durch automatisierte Workflows überschrieben.

## Style-Tabelle (Kontext-Mapping)

| Kontext | Style | Begruendung |
|---------|-------|-------------|
| Memos (intern) | Mermaid TD | schnell, inline editierbar |
| Doku-Seiten | Mermaid TD + PNG-Reuse | Pflege niedrig, Konsistenz hoch |
| Blogposts (Hero-Bild) | Excalidraw-Stil via Nano Banana | macht "Spass zu lesen", visueller Hook |
| Blogposts (interne Diagramme) | Mermaid TD | exakte Strukturen praezise |
| Marketing / Conference | Architektur-Kunst | Wow-Faktor, austauschbar |

**Pflicht-Regel:** Jeder Blog-Post bekommt mindestens 1 Diagramm. Hero-Diagramm (Excalidraw-Stil) ist Default, interne Diagramme (Mermaid TD) optional zusaetzlich.

**Skill-Mapping:**
- Excalidraw-Stil generieren: `image-diagram-excalidraw` Skill (S/W → Farbe-Pipeline ueber Nano Banana)
- Architektur-Kunst generieren: `image-art-architecture` Skill (9 Art Styles, Conference/Marketing)
- Mermaid TD: kein Skill noetig, inline im Markdown

**Quelle:** Memo 059 REV-04 Cluster H.1 (User-Entscheidung).

## Diagramm-Typen und Verwendung

> Die folgende Tabelle ist die **Detail-Sicht** je Diagramm-Typ. Fuer die **Kontext-Sicht** (welcher Style in welchem Kontext) siehe die "Style-Tabelle (Kontext-Mapping)" oben.

| Typ | Wann | Wie |
|-----|------|-----|
| **Mermaid** (`flowchart TD`, Top-Down) | Strukturelle Übersichten in Docs/Blogs/Memos | Inline-Code im Markdown, immer **TD**, nicht LR |
| **PNG-Diagramme** (User-vorbereitet) | Vision-/Architektur-Übersichten, Hero-Bilder | Bleiben erhalten und referenziert. Werden nicht durch Mermaid ersetzt. |
| **Excalidraw-Stil** (via `image-diagram-excalidraw` Skill) | Conference-Vorträge, Blog-Hero-Bilder, Marketing | Default fuer Blog-Hero-Bilder (siehe Style-Tabelle), optional in anderen Kontexten |
| **Architektur-Kunst** (via `image-art-architecture` Skill) | Blog-Cover, Social-Media-Kacheln, Conference | Default fuer Marketing/Conference (siehe Style-Tabelle), optional sonst |

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
- **Bei jedem Blogpost**: Pflicht-Regel "mindestens 1 Diagramm" (siehe Style-Tabelle). Hero-Diagramm im Excalidraw-Stil ist Default, interne Diagramme als Mermaid TD optional zusaetzlich.
- **Memo 058 Beispiel**: Kap. 13 Content-Flow-Diagramm ist Mermaid TD ✓
- **Blogpost 1 v4** verwendet Mermaid TD im Pipes-Diagramm.
- **Blogpost 3 v4.1** verwendet Mermaid TD im Add-on-Architektur-Block.

## Audit-Spur

Memo 058 REV-04 Kap. 7.
