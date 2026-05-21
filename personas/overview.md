# Personas Overview — Matrix, Conflicts, Trade-Offs

This document consolidates the four FlowMCP personas, shows their relationships at a glance, and makes the key trade-off decisions explicit. It serves as a decision tool when a concrete question (landing hero text, docs structure, trust signals) has to be weighed between persona needs.

---

## 1. The four personas — at a glance

| Persona | Name | Age | Location | Profession | Main question |
|---------|------|-----|----------|------------|----------------|
| [Hackathon-Builder](./hackathon-builder.md) | Mira Tanaka | 24 | Lisbon | CS student + freelance AI-agent dev | "How do I get a working schema in 30 minutes for the stage?" |
| [AI-Engineer](./ai-engineer.md) | Daniel Wong | 34 | Amsterdam | Senior ML engineer (SaaS, 200 employees) | "How do I integrate FlowMCP production-ready, without writing the next in-house loader?" |
| [Schema-Maintainer](./schema-maintainer.md) | Sofia Castano | 41 | Barcelona | Backend engineer (open-data portal) | "How do I build a schema that passes the validation rules and gets merged?" |
| [Decision-Maker](./decision-maker.md) | Anders Petersen | 48 | Stockholm | CTO (B2B SaaS, 180 employees) | "What is FlowMCP, who's behind it, is it production-ready?" |

---

## 2. Persona matrix (4×4)

How do the personas behave toward each other? Each cell shows the relationship **from row to column**.

|                  | **Mira**         | **Daniel**       | **Sofia**       | **Anders**     |
|------------------|------------------|------------------|-----------------|----------------|
| **Mira**         | ━                | Overlap          | Conflict        | Conflict       |
| **Daniel**       | Overlap          | ━                | Overlap         | Overlap        |
| **Sofia**        | Conflict         | Overlap          | ━               | Neutral        |
| **Anders**       | Conflict         | Overlap          | Neutral         | ━              |

**How to read this:**
- **Overlap** = share substantial needs, benefit from the same improvements
- **Conflict** = have opposing needs, one solution can't serve both at once
- **Neutral** = little direct contact, indifferent to each other

**Observations:**
- Daniel is the **consensus node** — overlap with all three others. He sits close to Mira's code need, Sofia's spec need and Anders's production need at the same time.
- Mira is the **most polarizing persona** — conflict with Sofia AND Anders. What attracts her repels two of the four.
- Sofia and Anders are **neutral to each other** — both are "serious", but operate on different planes (contribution vs adoption).

---

## 3. Conflicts (trade-off decisions)

These tensions require deliberate decisions. A solution can't serve both sides at once — we have to choose or balance carefully.

### Conflict 1: Trust signals on the landing

| Position | Persona | Argument |
|----------|---------|----------|
| **Pro hackathon trust** | Mira | "Used at ETHGlobal Berlin" gives her courage to try it at the next hackathon |
| **Against hackathon trust** | Anders | Hackathon awards signal "toy, not production tool" |
| **Trade-off** | — | **Separate them.** Hackathon mention above the fold (short), production logos and case studies dominant below. Hierarchy: substance first, momentum below. |

### Conflict 2: Landing first contact

| Position | Persona | Argument |
|----------|---------|----------|
| **Pro code-first** | Mira | Wants to see immediately what it looks like — "show me, don't tell me" |
| **Pro definition-first** | Anders | Wants to know WHAT it is in 60 seconds before evaluating HOW |
| **Trade-off** | — | **Hybrid hero.** One-sentence jargon-light definition at the top + an immediate short code block underneath. Anders reads the sentence, Mira scrolls to the code, both are satisfied after 10 seconds. |

### Conflict 3: Docs depth

| Position | Persona | Argument |
|----------|---------|----------|
| **Pro depth** | Daniel, Sofia | Complete API reference, validation rules, migration docs |
| **Pro quickstart focus** | Mira | Wants quickstart in 5 minutes, not a 30-minute spec read |
| **Trade-off** | — | **Pyramid instead of mush.** Clear navigation separation: quickstart (Mira) → tutorials (Mira/Daniel) → API reference (Daniel) → schema-format spec (Sofia) → architecture (Daniel/Anders). Each layer findable on its own. |

### Conflict 4: Tone / marketing language

| Position | Persona | Argument |
|----------|---------|----------|
| **Pro energetic** | Mira | Casual, "ship it", awards, Discord community |
| **Against energetic** | Anders, Daniel | Buzzwords are warning signs for a hobby project |
| **Trade-off** | — | **Tone per section.** Hero can be energetic (short, emotional). About / architecture / roadmap must be matter-of-fact and precise. Discord link as CTA for Mira, team page with faces for Anders. Both worlds exist in parallel. |

### Conflict 5: Version management

| Position | Persona | Argument |
|----------|---------|----------|
| **Pro one source of truth** | Sofia | Hates v3 leftovers — one active spec, everything else archived |
| **Pro migration bridge** | Daniel | Needs a v3-to-v4 migration as a visible document, because he has v3 in production |
| **Trade-off** | — | **Active vs archived clearly separated.** v4 is the only active spec (Sofia happy). v3 lives in an explicit archive area with a "deprecated" banner and a link to migration docs (Daniel happy). Migration docs are their own maintained document. |

---

## 4. Overlaps (double priorities)

Where multiple personas share needs, the value of a solution doubles. These items should be **prioritized**.

| Shared need | Who shares it | Implication |
|-------------|---------------|-------------|
| **Clear versioning** | Sofia + Daniel | v3 leftovers are doubly damaging. Version-lifecycle docs are high priority. |
| **Visible production readiness** | Daniel + Anders | "Production-ready" statement belongs in hero + about + README — not hidden in FAQ. |
| **Code examples that run** | Mira + Daniel | Examples must be automatically tested (CI). If Mira fails on a broken example, Daniel will too — except Daniel spends two hours hunting the bug while Mira switches tools immediately. |
| **Clear navigation** | All 4 | Sidebar hierarchy is universally critical. Every persona finds her entry point through the nav. |
| **Active maintainer contact** | Sofia + Mira | Sofia needs it for PR reviews, Mira for quickstart questions at 3 a.m. Discord + GitHub Issues with response time under a week. |

---

## 5. Persona-specific entry points

These sections should exist in the website navigation and be persona-optimized. One frictionless path per persona that leads to success.

| Persona | Entry point | Core need | Success criterion |
|---------|-------------|-----------|--------------------|
| Mira | `/docs/getting-started/quickstart/` | Working hello-world in <5 min | First code example runs without configuration |
| Daniel | `/docs/specification/overview/` + `/docs/reference/` | Architecture + complete API reference | Understands stack position in <30 min |
| Sofia | `/docs/specification/schema-format/` + `/docs/contributing/` | Spec + validation rules + PR process | Can submit a schema without a maintainer question |
| Anders | `/about/` + `/roadmap/` + `/team/` | "What, who, roadmap, trust" | Understands in 90 seconds what it is and who's behind it |

---

## 6. Friction map

When a feature, docs change, or marketing asset is being discussed: which persona does it rub against, and where?

### Mira friction points
- Spec depth above the code block → Mira scrolls away
- v3/v4 ambiguity → Mira takes a different tool
- API-key setup before hello-world → Mira takes a different tool
- No Discord link → Mira can't ask quickly

### Daniel friction points
- Marketing language instead of architecture → Daniel grows skeptical
- Missing API reference → Daniel writes in-house
- Unclear MCP compliance → Daniel can't sell it internally
- Examples with hardcoded keys → red flag for production readiness

### Sofia friction points
- v3 leftovers in navigation → no-go
- Missing validation-rule IDs → can't start
- No maintainer contact → PR risk too high
- Inconsistent schema examples between docs sections → trust loss

### Anders friction points
- Buzzwords in the hero → 90-second decision goes negative
- No visible team → bus factor too high
- Missing roadmap → can't explain it internally
- License unclear/GPL → legal blocks it

---

## 7. Recommendations for trade-off decisions

When a question has to be weighed between persona needs, these rules of thumb apply:

1. **For tone conflicts:** separate per section. Hero may be energetic, About must be matter-of-fact. Both worlds in parallel.
2. **For docs-depth conflicts:** clear navigation pyramid (quickstart → tutorials → reference → spec). Don't try to pack everything into one document.
3. **For trust-signal conflicts:** substance dominates, momentum complements. Production logos > hackathon awards (but both can exist, in that hierarchy).
4. **For version conflicts:** one active spec, everything else in a clearly marked archive with a migration bridge.
5. **For direct conflicts between Mira and Anders:** by default, lean toward Anders's need. Reason: Anders's decision means production adoption (longer impact, more leverage). Mira's stage success means visibility, but rarely direct adoption.

**Exception to rule 5:** if it's an explicit hackathon push (e.g. sponsoring an event), lean toward Mira's need — temporarily, section-specific.

---

## 8. What these personas do NOT cover

The four personas cover the main needs, but not everything. Conscious gaps:

- **End users of FlowMCP-based applications** — the end user of an AI agent doesn't see FlowMCP. Not part of the persona list, because FlowMCP docs don't reach them.
- **Enterprise procurement / security officer** — could become a fifth persona if enterprise adoption is explicitly targeted. Currently partially covered by Anders (he watches legal/license).
- **Academic research** — no own persona. Probably the rarest use case, partially covered by Sofia.
- **Localization needs outside English/German** — no specific persona. Add one if a need recurs.

For new recurring needs from the community, a fifth persona can be added — the README in the personas/ folder defines the process.
