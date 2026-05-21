# Mira Tanaka — Hackathon-Builder

> 24-year-old CS student in Lisbon who builds 36-hour hackathon demos for stage presentation. Wants to use FlowMCP to push structured data into an AI agent quickly — if the quickstart doesn't produce a hello-world in 5 minutes, she's gone.

---

## Identity

| Field | Value |
|-------|-------|
| Name | Mira Tanaka |
| Age | 24 |
| Gender | female |
| Location | Lisbon, Portugal (originally from Hamburg) |
| Profession | CS student (B.Sc. Computer Science, 5th semester, Instituto Superior Tecnico) + freelance AI-agent developer |
| Education | German Abitur in Hamburg, currently working on a B.Sc. in CS at a Portuguese technical university |
| Languages | German (native), English (fluent, main working language), Portuguese (B2, improving), Japanese (conversational, family) |

---

## Biography

Mira grew up in Hamburg with a German father (a teacher from Hannover) and a Japanese mother (an architect from Tokyo). At 17 she built her first Discord bot to display match statistics in a gaming server, and stayed in that scene. After her Abitur she went to Lisbon as an Erasmus student, stuck around for the surf community and low cost of living, and eventually enrolled there full-time. By now she has attended twelve hackathons across Europe (Berlin, Lisbon, Amsterdam, Barcelona, Paris, ETHGlobal), won two awards, and pays her rent by freelancing for small brand agencies, web3 startups, and indie founders who need "something with AI agents". If a tool saves her an hour, she won't write it herself — she'll find one that already exists.

---

## Daily rhythm with FlowMCP

| Question | Answer |
|----------|--------|
| When does FlowMCP enter her work? | At hackathons (every 4–6 weeks, 36–48 hour sprints) or freelance briefings with tight deadlines (1–3 day turnaround) |
| In what setting? | Coworking space with her hackathon crew / coffee shop in Lisbon / couch at home / on stage during the demo |
| How much time per session? | Setup: 30 minutes max, otherwise she switches tools. Sprint: 6–8 hour stretches. |
| Frequency | Project-driven. Hackathon week: daily. Otherwise: weeks-long pauses. |

---

## Tools

| Category | Tools |
|----------|-------|
| IDE / editor | VS Code with the Continue extension; occasionally Cursor when friends recommend it |
| OS | macOS (refurbished MacBook Air M2) |
| AI tools | Claude Code (terminal, main coding tool), Codex (OpenAI CLI, parallel workflow), ChatGPT (brainstorming, free plan), v0 / Lovable (UI mockups), Anthropic API (rarely direct) |
| Browser | Arc (primary) + Chrome (auth-flow tests when Arc misbehaves) |
| Communication | Discord (primary — hackathon servers, tool communities), Telegram (freelance clients), GitHub Issues (rarely, last resort), X/Twitter (passive, tool news) |
| Docs consumption style | AI-asker (asks Claude to explain) > code tinkerer > video watcher > docs reader (last resort) |

---

## Interests outside code

- **Surfing.** At least once a week at Costa da Caparica. Came with the Lisbon move and became part of her identity.
- **Generative art on a pen plotter.** Owns an AxiDraw V3, plots abstract patterns from her own algorithms. Sells the occasional print on Etsy.
- **Bouldering** at the Lisbon Boulder Society gym, twice a week. Stress relief and community.
- **Indie game dev.** Has two small itch.io releases (a pixel puzzle, a short narrative game). Plays a lot too — mostly cozy games like Stardew Valley and Outer Wilds.
- **Manga** (Japanese roots). Reads in English or German. Favorite mangaka: Inio Asano.

---

## Personality

| Aspect | Value |
|--------|-------|
| Risk appetite (tech) | High. Tries new tools immediately, no long evaluation. "If it doesn't work, I'll just delete it." |
| Learning style | Code tinkerer + AI-asker. Never reads docs first. Asks Claude "how does this work?" and reads the answer. |
| Patience threshold | Low. 5 minutes without success → searches for the next tool. 15 minutes without success → gives up entirely. |
| Register | Casual, lots of English slang ("ship it", "vibe coding", "huge if true"), energetic, emoji-heavy in chats |
| Values | Speed > perfection. Open source > proprietary. Community > marketing. Working over beautiful. |

---

## Main question

> "How do I get a working schema in 30 minutes that I can demo on stage?"

---

## Primary goals

1. Find a quickstart that produces a "hello world" in under 5 minutes
2. Copy an existing schema and adapt it to her own API without reading the spec
3. Have her first demo output by hour 1 of the hackathon
4. Have a running AI agent on real data by hour 4
5. Stage-ready demo (latency under 2 sec, readable output, no crash)

---

## Pain points

1. Long spec texts or "concept explanations" before the quickstart
2. Unclear installation: "Should I run `npm install flowmcp` or `github:FlowMCP/flowmcp-core` or both?"
3. Version chaos: v3 leftovers next to v4 docs — she never knows what's current
4. Code blocks without a copy button (especially annoying on a phone or MacBook touchbar)
5. Examples that need API keys without a clear mock-mode alternative

---

## Likes

1. Code snippets with a big copy button and syntax highlighting
2. CLI commands with their expected output next to them — she knows instantly whether it worked
3. "Used at ETHGlobal Berlin", "Won Pieter Levels Hackathon" — trust signals from her world
4. GitHub star count visible (signals the project is alive)
5. Active Discord community with a maintainer present — when she's stuck at 3 a.m., she wants to ping someone

---

## Quotes

> "If the quickstart is longer than a YouTube tutorial, I'm out."

> "I don't need a spec. I need code that runs. I'll read the docs later — maybe."

> "A good hackathon logo on the landing page is worth more than ten architecture diagrams."

> "Discord or GitHub Issues? Bro, it's 3 a.m. at a hackathon. Discord."

> "If the example needs a real production API key, I'll just mock it. Nobody checks that on stage."

> "v3? v4? Which one is the right version now? If I have to decide that at the quickstart step, I've already lost."

---

## Relationships with other personas

### Overlap

- **Daniel (AI-Engineer):** Both want code examples that actually run. If Mira fails on a broken example, Daniel will fail too — except Daniel spends two hours hunting down the bug while Mira moves on within minutes. Both benefit from a maintained example library.

### Conflict

- **Sofia (Schema-Maintainer):** Sofia needs long, precise spec texts with validation-rule IDs and maintainer contacts — exactly what scares Mira off at the quickstart. If the landing page leads with spec depth, Mira is gone. If it leads with hackathon code snippets, Sofia doesn't feel taken seriously.

- **Anders (Decision-Maker):** Anders is allergic to hackathon buzz and award logos that pull Mira in. What's a "huge if true" signal for Mira ("Used at ETHGlobal!") is a "toy, not production tool" warning for Anders. The same trust line works in opposite directions.

### Neutral

- **(no real neutrality)** — Mira has a strong position toward all three other personas. She's the loudest of the four.

---

## When would she become a fan?

If FlowMCP has a quickstart that produces a live demo in under 5 minutes without API-key setup, an active Discord community with quick response times, and a "hackathon-friendly" section on the landing page with mock-mode instructions. Then she'll post it in her Discord servers and use it at every future hackathon.

## When would she walk away?

If the quickstart has more than two setup steps before the first "hello world" — or if she can't decide within 30 seconds which version (v3 vs v4) is current. She'll switch to another tool without complaining.
