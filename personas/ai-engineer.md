# Daniel Wong — AI-Engineer / LLM Integrator

> 34-year-old Senior ML engineer in Amsterdam, has been running Anthropic Claude in production at a 200-employee SaaS company for 18 months. Looking for a stable schema solution to replace his hand-rolled loaders — production readiness, version clarity and MCP compliance are non-negotiable.

---

## Identity

| Field | Value |
|-------|-------|
| Name | Daniel Wong |
| Age | 34 |
| Gender | male |
| Location | Amsterdam, Netherlands (originally from Vancouver, Canada) |
| Profession | Senior Machine Learning Engineer at a mid-size B2B SaaS company (200 employees, Series B) — owns the entire AI pipeline |
| Education | M.Sc. Computer Science (University of British Columbia), NLP specialization |
| Languages | English (native), Cantonese (family), Dutch (B1, everyday), German (basic) |

---

## Biography

Daniel grew up in Vancouver as the child of Hong Kong parents, studied CS at UBC, and after his master's worked four years at a cloud provider — classic backend roles, search infrastructure, data pipelines. In 2022 he moved to an Amsterdam SaaS startup that had 60 employees at the time and had just closed Series A. He joined as the sixth engineer on the AI team and is now tech lead for the entire LLM pipeline. His company has been running Anthropic Claude in production for 18 months, powering a customer-support assistant that handles over 200,000 tickets a month. He's written two in-house schema loaders in the last 12 months, hated both, maintained both — and is now actively shopping for an externally maintained alternative so he stops spending his time on schema upkeep.

---

## Daily rhythm with FlowMCP

| Question | Answer |
|----------|--------|
| When does FlowMCP enter his work? | During evaluation sprints (1–2 weeks at a stretch), later in production operations daily (passively) |
| In what setting? | Office in Amsterdam centrum (3 days), home office in an apartment (2 days). Focused blocks in the morning. |
| How much time per session? | Evaluation sessions 2–4 hours. Schema integration: 1–3 full sprint days. |
| Frequency | Active evaluation once per quarter. Production operation only during incidents or major updates. |

---

## Tools

| Category | Tools |
|----------|-------|
| IDE / editor | JetBrains IntelliJ Ultimate (with AI Assistant), occasional VS Code for quick edits |
| OS | Linux (Ubuntu 24.04 LTS, ThinkPad X1 Carbon) — company standard |
| AI tools | Anthropic Claude API (production), Anthropic Console for prompt tuning, Claude Code (CLI for code reviews), internal eval pipeline with OpenAI as comparison |
| Browser | Firefox (privacy-hardened) + Chrome (test browser for auth flows) |
| Communication | Slack (internal, primary), GitHub Issues + PRs (external, tool evaluation), LinkedIn (passive), Hacker News (daily) |
| Docs consumption style | Docs reader (thorough, before any production adoption) + mentor-asker (senior colleagues internally). Uses AI only for code snippets. |

---

## Interests outside code

- **Cycling.** Commutes daily by bike, longer rides through Amstelland on weekends.
- **Reads a lot** — tech (Sutton & Barto, Anthropic research, Stratechery) and fiction (recently Liu Cixin's "Three-Body Problem", Le Guin).
- **Specialty coffee.** Owns a La Marzocco Mini at home, knows the good roasters in Amsterdam by first name.
- **Board games.** Monthly game night with other engineers — heavy euros, Terraforming Mars, Brass: Birmingham.
- **Mentoring.** Volunteers with a "Code for Newcomers" program in Amsterdam, helping migrants pivot into tech.

---

## Personality

| Aspect | Value |
|--------|-------|
| Risk appetite (tech) | Medium-low. Tries new things only when clearly documented. Production adoption only after a pilot phase with metrics. |
| Learning style | Docs reader first (spec, architecture, version history), then code tinkerer in an isolated sandbox |
| Patience threshold | High for good docs. Very low for marketing language and vague promises. |
| Register | Matter-of-fact, precise, no hype. Uses English tech terms even in Dutch/German. |
| Values | Production quality > speed. Reproducibility > magic. Version clarity > feature richness. Prefers open source for auditability. |

---

## Main question

> "How do I integrate FlowMCP into my LLM pipeline production-ready, without writing the next in-house loader six months from now?"

---

## Primary goals

1. Understand the architecture — what is FlowMCP, where does it sit in the stack, what does it replace?
2. Find API reference with complete request/response examples (including auth, rate limits, error shapes)
3. Verify MCP compliance — does FlowMCP fit the Model Context Protocol, or is it its own model?
4. Find migration docs — what was v3, what is v4, what's coming next year?
5. See production stories — who uses it, at what scale, with what stability?

---

## Pain points

1. Marketing language instead of clear technical content ("revolutionary", "AI-native" without substance)
2. Missing or incomplete API reference (quickstart only, no reference section)
3. Vague architecture diagrams without data flow, component boundaries, failure modes
4. Unclear production readiness ("works on my machine" hackathon code as the only example)
5. Missing version-lifecycle docs ("which version is current, deprecated, supported?")

---

## Likes

1. Clear architecture diagrams (mermaid in the repo) with components + data flow
2. API reference with copy-pasteable curl examples plus expected responses
3. Production stories and customer logos (even small ones — "Used by X to handle Y req/day")
4. Explicit MCP compliance statement ("FlowMCP implements MCP spec v2024-11-XX")
5. Spec versioning with migration guides (v3 → v4 diff in one document)

---

## Quotes

> "Marketing language is my first warning sign. If the landing shouts 'AI-native' without showing how, it's not production-ready."

> "I need production code, not demo code. If examples have hardcoded API keys, that's a red flag."

> "Give me a complete API reference and I'll integrate it in a week. Give me a pretty quickstart and I'll spend six weeks reverse-engineering."

> "Which version is current? Which is deprecated? When does v3 support end? If I can't see that in 30 seconds on the docs landing, I can't sell it to my team."

> "MCP compliance lives and dies with the spec version. If the tool says 'compatible with MCP', I want to know — which spec version, which methods, which limitations."

---

## Relationships with other personas

### Overlap

- **Mira (Hackathon-Builder):** Both want code examples that run. If examples fail for Mira, they'll fail for Daniel — Daniel just debugs longer. Both benefit from maintained, tested examples.

- **Sofia (Schema-Maintainer):** Both need version clarity. Daniel for production adoption, Sofia for contributor trust. v3 leftovers next to v4 are a killer for both. If Sofia notices v3 still in examples, she suspects Daniel as a production adopter must be put off too.

- **Anders (Decision-Maker):** Both want visible production readiness. Anders decides the budget, Daniel the integration — both need "production-ready" as a substantiated claim, not a slogan.

### Conflict

- **Mira:** Mira wants a 5-minute quickstart and hackathon buzz, Daniel wants API reference and an MCP compliance statement. The same landing page can't please both — Mira wants code-first, Daniel wants architecture-first.

### Neutral

- **(no real neutrality)** — Daniel has a clear position toward all three other personas because he's evaluating production adoption.

---

## When would he become a fan?

If FlowMCP has a complete API reference with tested curl examples, an explicit MCP compliance statement with spec version, clear version-lifecycle docs (what's current / deprecated / supported), and at least three production logos. Then he integrates it in a sprint and recommends it internally.

## When would he walk away?

If the docs use marketing language instead of architecture, if API reference is missing or incomplete, or if he sees v3 and v4 side by side without clear migration guidance. Then he writes the next in-house loader — even though it frustrates him.
