# Sofia Castano — Schema Maintainer / Open-Source Contributor

> 41-year-old backend engineer on the data-integration team at Barcelona Open Data. Long-time contributor to OpenAPI, GTFS and EU data standards. Wants to submit a new FlowMCP schema for a city API — needs one clean spec version, clear validation-rule IDs and a reachable maintainer.

---

## Identity

| Field | Value |
|-------|-------|
| Name | Sofia Castano |
| Age | 41 |
| Gender | female |
| Location | Barcelona, Spain (originally from Seville) |
| Profession | Senior backend engineer on the data-integration team at the City of Barcelona's open-data portal (Ajuntament de Barcelona, Direccio d'Innovacio Digital) |
| Education | Telecommunications Engineer (UPC Barcelona, Universitat Politecnica de Catalunya) |
| Languages | Spanish (native), Catalan (fluent, working language), English (fluent), French (basic) |

---

## Biography

Sofia was born in Seville and moved to Barcelona with her family at the age of ten. After her telecoms degree at UPC she joined Telefonica in a backend role (five years), then switched to the public sector for purpose reasons — she wanted to build software that directly helps people. For the last ten years she has worked on the data-integration team of Barcelona's open-data portal, owning the schemas for all published city datasets. On the side she's a visible open-source contributor: dozens of PRs to OpenAPI, GTFS-Realtime, and the CKAN ecosystem. She knows FlowMCP loosely from the v3 era, when a colleague evaluated it for an internal experiment. Now she wants to submit an official schema for the city's air-quality API.

---

## Daily rhythm with FlowMCP

| Question | Answer |
|----------|--------|
| When does FlowMCP enter her work? | During a specific schema project (sprint-driven), later for maintenance of existing schemas (quarterly reviews) |
| In what setting? | Office at the Ajuntament de Barcelona (city center), rarely home office. Focused morning blocks. |
| How much time per session? | 1–3 hours of concentrated schema work per day, spread over 1–2 weeks per schema. |
| Frequency | 2–4 schemas per year at work. Plus open-source contributions on weekends. |

---

## Tools

| Category | Tools |
|----------|-------|
| IDE / editor | VS Code with Python + JSON Schema extensions; Vim for server edits |
| OS | macOS (company MacBook Pro 14" M3) |
| AI tools | Anthropic Claude (privately, browser — compliance restrictions in the office), GitHub Copilot for weekend open-source work, no AI in production office code |
| Browser | Firefox (privacy-hardened) + Chromium for test browser |
| Communication | GitHub Issues + PRs (main channel to tools/maintainers), internal Mattermost (Ajuntament's Slack equivalent), OASIS/W3C mailing lists, X/Twitter (rarely) |
| Docs consumption style | Docs reader — thorough, front to back. Spec pages are her natural reading material. |

---

## Interests outside code

- **Open-government activism.** Active in a Catalan NGO for transparency and open data; occasionally gives talks at "Govlab BCN".
- **Cooking.** Mixes Catalan and Andalusian cuisine; large family lunches on Saturdays.
- **Reading.** Political non-fiction (recently "Privacy is Power" by Carissa Veliz), fiction by Jose Saramago and Ursula K. Le Guin.
- **Catalan folk music.** Listens to traditional sardanes and newer bands like Manel; goes to La Merce every year.
- **Train travel.** Started replacing all flights under 6 hours with trains in 2024 — climate statement and lifestyle choice.

---

## Personality

| Aspect | Value |
|--------|-------|
| Risk appetite (tech) | Low. Public-sector mindset: reproducibility, compliance, audit trail. Tries new things only in a sandbox. |
| Learning style | Docs reader (thorough, front to back), then code tinkerer in an isolated test repo |
| Patience threshold | High when the spec is precise. Very low for version chaos or unclear PR processes. |
| Register | Precise, formal but warm, polite. Prefers written communication over calls. |
| Values | Open data, reproducibility, citizen service, transparency, long-term maintainability > short-term shine |

---

## Main question

> "How do I build a schema that passes the validation rules and gets merged — without spending hours hunting for the current spec version?"

---

## Primary goals

1. Find the current spec version unambiguously (v4) — no v3 leftovers in the docs navigation
2. Get a complete list of validation rules with IDs (e.g. RES001, RES002) to check off
3. PR process step by step: where to push, which tests, which reviewer
4. Existing high-quality schemas as reference examples (not just hello-world)
5. Reachable maintainer contact (name, GitHub handle, estimated response time)

---

## Pain points

1. v3 and v4 leftovers presented as both current — she can't tell which spec applies
2. Unclear PR processes (or no CONTRIBUTING guide at all)
3. Missing validation-rule IDs — she can't tick off what her schema passes
4. Maintainer contact hidden or non-existent — where does she ask?
5. Inconsistent schema examples between docs sections (example in chapter 3 contradicts example in chapter 7)

---

## Likes

1. Clean version-lifecycle docs: what's current, deprecated, retired
2. Schema catalog with real, maintained examples (not just "TodoMVC for schemas")
3. CONTRIBUTING.md with concrete steps, reviewer list, estimated review time
4. Locally runnable validation runner (`npm run validate path/to/schema`)
5. Active maintainers with GitHub response time under a week

---

## Quotes

> "If I see v3 and v4 both presented as current, that's a no-go. I need one source of truth."

> "Which validation rules does my schema need to pass? Which command checks that locally? Without those two answers I can't start."

> "In the public sector we work with spec versions. If the spec changes without migration docs, I have a compliance problem — and my PR gets stuck."

> "I don't need a quickstart. I need complete schema-format docs — ideally with a diff against v3, so I know what changed."

> "Who is the maintainer? When do they respond? On a project with dead maintainers my PR ends up in limbo — and my work time is also public money."

---

## Relationships with other personas

### Overlap

- **Daniel (AI-Engineer):** Both need version clarity. Daniel for production adoption, Sofia for contributor trust. v3 leftovers are doubly damaging. If Sofia notices v3 still lurking in examples, she assumes Daniel as a production adopter must be put off too.

### Conflict

- **Mira (Hackathon-Builder):** Mira hates long spec texts that are Sofia's primary medium. If the landing page is optimized primarily for Mira (code snippets, hackathon buzz), Sofia doesn't feel taken seriously. If the spec section is prominent, Mira scrolls past it.

### Neutral

- **Anders (Decision-Maker):** Sofia is a contributor, Anders is an adoption decider — they rarely cross paths. Anders checks what Sofia actually produces (activity in the spec repo), but they don't communicate directly. Sofia is a trust signal for Anders ("active contributor community"), not a conversation partner.

---

## When would she become a fan?

If FlowMCP has one unambiguous current spec version (v4, no v3 leftovers in navigation), a complete validation-rule list with IDs, a CONTRIBUTING.md with a step-by-step PR process and a reviewer list, and a maintainer who responds to PRs within a week. Then she becomes a regular contributor and recommends FlowMCP within her OpenAPI network.

## When would she walk away?

If after 30 minutes of reading the spec she still isn't sure which version is current, or if she can't find a maintainer contact, or if her first PR sits without response. Then she writes a public X thread about dead open-source projects — and FlowMCP loses an important voice in the open-data network.
