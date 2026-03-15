# Create FlowMCP Agent

Build a complete FlowMCP agent from scratch. Guides through a structured 7-step process: define purpose, find tools, write skills, create manifest, test, and deploy.

---

## Trigger

- "create a new agent"
- "build an agent for..."
- "I need an agent that..."
- "erstelle einen Agent"
- /create-flowmcp-agent

---

## Prerequisites

Before starting, load these documents into context:

| Document | Source | Purpose |
|----------|--------|---------|
| **FlowMCP Specification** | `flowmcp-spec/llms.txt` | What is allowed? Format rules, validation codes |
| **Schema Catalog** | `flowmcp-schemas/llms.txt` | What tools, resources, and prompts exist? |
| **Agent Server README** | `mcp-agent-server/README.md` | How to deploy the agent? |

Optional (load when needed):

| Document | Source | Purpose |
|----------|--------|---------|
| x402 Middleware | `x402-mcp-middleware` README | Monetization |
| A2A Adapter | `mcp-agent-server/README.md` (A2A section) | Agent-to-agent communication |

---

## Output

```
agents/{agent-name}/
├── agent.mjs                    # Manifest (export const agent)
├── prompts/
│   └── about.mjs                # Agent description prompt
├── skills/
│   └── {skill-name}.mjs         # Step-by-step workflows
└── resources/                   # Optional SQLite databases
```

---

## Process

```
1. Define Purpose
   - Ask: "What problem does this agent solve?"
   - Ask: "For whom?" (be specific: "travel expert for train connections in southern Germany", not "researcher")
   - Ask: "What data sources does it need?"
   - Output: 2-3 sentence agent description

2. Find Primitives
   - Load Schema Catalog (llms.txt)
   - Search for relevant:
     * Tools (REST API endpoints)
     * Resources (SQLite databases)
     * Prompts (provider explanations)
   - List candidate primitives with their full IDs: namespace/type/name
   - Ask user to confirm selection

3. Define Skills (CORE STEP)
   - Skills are the MAIN REASON the agent exists
   - Each skill is a step-by-step workflow:
     * Which tools to call in which order
     * How to combine data between tool calls
     * What the expected output looks like
   - Skill format:
     ```javascript
     export const skill = {
         name: 'skill-name',
         version: 'flowmcp-skill/1.0.0',
         description: '...',
         testedWith: 'anthropic/claude-sonnet-4-5-20250929',
         requires: {
             tools: [ 'namespace/tool/name', ... ],
             resources: [],
             external: []
         },
         input: [
             { key: 'param', type: 'string', description: '...', required: true }
         ],
         output: 'Description of what the skill produces',
         content: `
     ## Step 1: ...
     Use {{tool:toolName}} with {{input:param}}

     ## Step 2: ...
     Combine results from Step 1 with {{resource:dbName}}

     ## Step 3: Synthesize
     Format as structured report.
     `
     }
     ```
   - Each agent should have 1-3 skills
   - Skills define the agent's expertise

4. Write System Prompt
   - Define persona: who is the agent?
   - Reference skills: "You have the following skills..."
   - Set behavioral guidelines: tone, format, error handling
   - Do NOT list tool names (MCP handles that)
   - Do NOT include API details (tool descriptions handle that)
   - Example:
     ```
     You are a train travel expert specializing in connections
     across southern Germany. You combine real-time departure data
     with historical schedule databases to provide optimized
     travel recommendations.

     Always present alternatives when direct connections are not
     available. Include platform numbers and transfer times.
     When data is unavailable, state this explicitly.
     ```

5. Create agent.mjs
   - Assemble the manifest:
     ```javascript
     export const agent = {
         name: 'agent-name',
         version: 'flowmcp/3.0.0',
         description: '...',
         model: 'anthropic/claude-sonnet-4-5-20250929',
         systemPrompt: '...',
         tools: {
             // External tools (from providers)
             'namespace/tool/name': null,
             // Inline tools (agent-specific, optional)
             'customTool': { method: 'GET', path: '...', ... }
         },
         prompts: {
             'about': { file: './prompts/about.mjs' }
         },
         skills: {
             'skill-name': { file: './skills/skill-name.mjs' }
         },
         resources: {
             // Optional: agent-owned SQLite databases
         },
         tests: [
             {
                 _description: 'Basic query',
                 input: 'Natural language question',
                 expectedTools: [ 'namespace/tool/name' ],
                 expectedContent: [ 'keyword1', 'keyword2' ]
             },
             // Minimum 3 tests required
         ]
     }
     ```
   - Slash Rule:
     * Keys with `/` = external reference (value must be `null`)
     * Keys without `/` = inline definition (value is the object)
     * Skills: NO slash keys (model-specific, inline only)

6. Test and Validate
   - Structural validation:
     ```bash
     flowmcp validate-agent ./agents/agent-name/
     ```
   - Verify all AGT rules pass (AGT001-AGT020)
   - Check: all referenced prompt/skill files exist
   - Check: all external tool IDs are valid
   - Manual test: does the agent answer correctly?

7. Deploy as MCP Server
   - Create server entry point:
     ```javascript
     import express from 'express'
     import { AgentToolsServer } from 'mcp-agent-server'
     import { agent } from './agents/agent-name/agent.mjs'

     const app = express()
     app.use( express.json() )

     const { mcp } = await AgentToolsServer.fromManifest( {
         manifest: agent,
         llm: {
             baseURL: 'https://openrouter.ai/api',
             apiKey: process.env.OPENROUTER_API_KEY
         },
         schemas: [ /* loaded FlowMCP schemas */ ],
         serverParams: { /* API keys */ }
     } )

     app.use( mcp.middleware() )
     app.listen( 4100 )
     ```
   - Optional: Add A2A adapter (see mcp-agent-server README)
   - Optional: Add x402 payment gate (see x402-mcp-middleware README)
```

---

## Model Recommendation

Default model: `anthropic/claude-sonnet-4-5-20250929`

This is the recommended model for FlowMCP agents. It handles tool calling reliably and works well with the structured skill format. Change only if you have specific requirements.

---

## Key Concepts

### Skills vs Prompts vs Tools

| Primitive | Purpose | Agent Role |
|-----------|---------|------------|
| **Tools** | Execute actions (API calls) | Agent uses them |
| **Resources** | Read data (SQLite) | Agent queries them |
| **Prompts** | Explain how things work | Agent references them |
| **Skills** | Step-by-step workflows | Agent follows them |

Skills are the **main differentiator**. Two agents with the same tools but different skills will behave completely differently.

### Agent-Level SQLite Resources

Agents can bring their own databases (not from providers):

```javascript
resources: {
    'my-data': {
        source: { type: 'sqlite', path: 'data.db' },
        queries: {
            'search': {
                sql: 'SELECT * FROM items WHERE name LIKE ?',
                description: 'Search items by name',
                parameters: {
                    searchTerm: { type: 'string', required: true }
                }
            }
        }
    }
}
```

---

## Common Mistakes

1. **Too many tools** — An agent with 20 tools is confused. Pick 3-8 focused tools.
2. **No skills** — Without skills, the agent has tools but no strategy. Always define at least one skill.
3. **Tool names in system prompt** — Let MCP handle tool discovery. Describe capabilities, not tool names.
4. **Generic purpose** — "Research agent" is too broad. "DeFi yield comparison for EVM chains" is focused.
5. **Missing tests** — Minimum 3 tests. They verify the agent actually works.

---

## Example: Crypto Research Agent

```javascript
export const agent = {
    name: 'crypto-research',
    version: 'flowmcp/3.0.0',
    description: 'Cross-provider crypto analysis combining price data and on-chain metrics',
    model: 'anthropic/claude-sonnet-4-5-20250929',
    systemPrompt: 'You are a crypto research agent. Always cite data sources. Normalize to USD for comparisons.',
    tools: {
        'coingecko-com/tool/simplePrice': null,
        'etherscan-io/tool/getContractAbi': null,
        'defillama-com/tool/getProtocolTvl': null
    },
    skills: {
        'token-deep-dive': { file: './skills/token-deep-dive.mjs' }
    },
    prompts: {
        'about': { file: './prompts/about.mjs' }
    },
    tests: [
        {
            _description: 'Price lookup',
            input: 'What is the current price of Ethereum?',
            expectedTools: [ 'coingecko-com/tool/simplePrice' ],
            expectedContent: [ 'price', 'USD' ]
        },
        {
            _description: 'DeFi analysis',
            input: 'What is the TVL of Aave?',
            expectedTools: [ 'defillama-com/tool/getProtocolTvl' ],
            expectedContent: [ 'TVL', 'Aave' ]
        },
        {
            _description: 'On-chain query',
            input: 'Show the ABI of the USDC contract on Ethereum',
            expectedTools: [ 'etherscan-io/tool/getContractAbi' ],
            expectedContent: [ 'USDC', 'contract' ]
        }
    ]
}
```
