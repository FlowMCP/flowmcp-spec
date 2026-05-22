---
name: Bundle Refresh Needed (FlowMCP Guide Bot)
about: Trigger this when a source change requires re-generating the FlowMCP Guide bundle
title: "Bundle refresh: {brief description}"
labels: [ "guide-bot", "refresh" ]
assignees: []
---

## Trigger

Which source change requires the refresh?

- [ ] Spec change (`spec/v4.0.0/*`)
- [ ] Persona update (`personas/*`)
- [ ] CLI release (`flowmcp-cli/`)
- [ ] Core release (`flowmcp-core/`, `flowmcp-servers/`)
- [ ] Schemas catalog update (`flowmcp-schemas-public/`)
- [ ] x402 stack update (`x402-core`, `x402-mcp-middleware`, `x402-flowmcp-org`)
- [ ] Agent-server update (`mcp-agent-server`)
- [ ] FAQ entry update (`scripts/generators/data/faq.md`)
- [ ] Glossary terms update (`scripts/generators/data/glossary-terms.json`)
- [ ] Other: _____

## Refresh Steps

See Memo 053 REV-06 Chapter 13 (Refresh-Workflow). Summary:

1. `cd projects/flowmcp/repos/flowmcp-spec`
2. `node scripts/generators/regen-all.mjs`
3. `cd ../flowmcp-guide && git diff` — review outputs
4. Tone-Review the Bot-visible strings (description, conversation starters, instructions, FAQ)
5. `git add -A && git commit -m "Refresh bundle (source change YYYY-MM-DD)"`
6. `git remote -v` — MUST be empty
7. Re-upload to OpenAI Builder (manual, see `operator-deployment-guide.md` in the memo)

## Verification Checklist

- [ ] `regen-all` completed without errors
- [ ] `validate-metadata.mjs` PASS
- [ ] `validate-frontmatter.mjs` PASS
- [ ] `git remote -v` empty
- [ ] Tone-Review done
- [ ] Bot re-uploaded
- [ ] Smoke-Test: 4 conversation starters + 1 Don't-Know + 1 DE-question

## Notes

The `flowmcp-guide` repository is **local-only** (no GitHub remote) per Memo 053 design. Do not attempt to push.
