# FlowMCP Personas

This is **not** a spec. Personas are the people we build for.

---

## Why publish them?

We publish personas for three reasons:

1. **Tone becomes accountable.** Docs, website, README — all texts are calibrated against the personas. _"Would Anders understand this?"_ is a testable question; _"does this sound good?"_ is not.
2. **Priorities become traceable.** When we ship a feature because it gives Mira a better quickstart, that reasoning is in the open.
3. **AI-native tooling needs AI-readable context.** Personas written in Markdown are usable for humans and AI agents (auditors, reviewers) alike. FlowMCP positions itself as AI-native tooling — publishing the personas is consistent with that story.

The personas are **synthetic**. Names, ages, locations, jobs are constructed. They represent usage patterns, not real individuals.

---

## The four personas

| File | Persona | Role |
|------|---------|------|
| [hackathon-builder.md](./hackathon-builder.md) | Mira Tanaka (24, Lisbon) | First contact under time pressure |
| [ai-engineer.md](./ai-engineer.md) | Daniel Wong (34, Amsterdam) | Production integration |
| [schema-maintainer.md](./schema-maintainer.md) | Sofia Castano (41, Barcelona) | Open-source contribution |
| [decision-maker.md](./decision-maker.md) | Anders Petersen (48, Stockholm) | Adoption decision |

An overview of overlaps, conflicts and trade-offs between the personas lives in [overview.md](./overview.md).

---

## How we use personas

| Use case | How |
|----------|-----|
| **Doc review** | Walk a docs page against 1–4 personas — _"Would Sofia understand this? Would Mira give up here?"_ |
| **Landing-page tone** | Test a hero line: _"Does this read as buzz for Anders or as substance?"_ |
| **Feature prioritization** | For each feature, name which persona benefits — prevents maintainer bias |
| **Audit subagents** | Use a persona file as a prompt for an LLM subagent that audits website / repo / docs without bias |

---

## Maintenance

| Rule | Why |
|------|-----|
| Changes go directly in this folder, via PR | Spec-repo convention |
| Identities (name, age, profession) stay stable | Persona consistency over time; references from other documents need to remain valid |
| Goals, pains, likes can be iterated | When market understanding shifts (e.g. a new hackathon scene), sharpen accordingly |
| Add a new persona only when clearly needed | More than 4–5 personas becomes unwieldy; first check whether an existing persona covers the need |
| Quotes must stay sharp | Generic quotes ("I need good docs") are worthless. They have to be concrete and persona-typical. |

---

## Format

All persona files follow [_template.md](./_template.md). Key sections:

- **Identity** — name, age, gender, location, profession, education, languages
- **Biography** — 3–5 sentences of background
- **Daily rhythm with FlowMCP** — when, where, for how long
- **Tools** — IDE, OS, AI tools, communication
- **Interests outside code** — relevant for tone-of-voice decisions
- **Personality** — risk, learning style, patience threshold, register
- **Main question, goals, pains, likes** — behavior
- **Quotes** — at least 3 persona-typical lines
- **Relationships with other personas** — overlap / conflict / neutral
- **Fan / walk-away conditions** — what wins them over, what loses them

---

## Origin

The personas were developed in Memo 048 of the FlowMCP project workspace. The original role sketches come from Memo 045 REV-07 Ch. 2. Memo 048 fleshed those roles into people and moved the result into this folder.

After the move, this folder is the **single source of truth**. The memo remains as the development history, but changes happen here — not in the memo.

---

## Language

This folder is in **English**. FlowMCP's documentation and spec are English; the personas are part of the public docs and need to match. The original drafting happened in German in the memo, then was translated before publication.
