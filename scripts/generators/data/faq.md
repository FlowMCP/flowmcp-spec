# FlowMCP FAQ

## Q: Which Node.js version do I need?
A: Node.js 22 (LTS). FlowMCP scripts use .mjs ES modules.

## Q: Is FlowMCP production-ready?
A: Yes, v4.0.0 is stable. Coverage and lifecycle stages are documented per schema in the catalog.

## Q: What is the difference between Hard Fact and Soft Fact?
A: Hard Facts are normative spec content (RFC2119 keywords). Soft Facts are personas, examples, skills, the bot bundle — tonality without normativity.

## Q: How do I monetize a FlowMCP server?
A: Use the x402 stack (x402-core + x402-mcp-middleware). See knowledge/10-payments-x402.md.

## Q: Can the bot deploy a FlowMCP server for me?
A: No. The bot is an explainer, not an executor. For deployment, see flowmcp-servers or the Claude Code skill `flowmcp-create-agent`.

## Q: Where is the spec in full?
A: https://github.com/FlowMCP/flowmcp-spec/tree/main/spec/v4.0.0/ — or the LLM-friendly llms.txt at https://raw.githubusercontent.com/FlowMCP/flowmcp-spec/refs/heads/main/spec/v4.0.0/llms.txt

## Q: What if the bot does not know the answer?
A: The bot says "I don't know" explicitly and points you to the right source (spec, README, FAQ). Use that source directly.

## Q: Which personas exist?
A: Four — Mira (Hackathon Builder), Daniel (AI Engineer), Sofia (Schema Maintainer), Anders (Decision Maker). See knowledge/02-personas.md.

## Q: Can I ask in German?
A: Yes. The bot answers in the language of the question. Primary language is English, German is fully supported.

## Q: Where do I find CLI commands?
A: knowledge/04-cli-handbook.md or directly https://github.com/FlowMCP/flowmcp-cli/blob/main/README.md
