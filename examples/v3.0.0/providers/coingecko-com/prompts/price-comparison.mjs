// FlowMCP v3.0.0 — Provider-Prompt Example
// A Provider-Prompt is scoped to a single namespace and is model-neutral.
// Key differences from Agent-Prompts:
//   - `namespace` field instead of `agent`
//   - No `testedWith` field (works with any LLM)
//   - `dependsOn` uses bare tool names (same namespace is implied)
//   - Cannot reference Agent-Prompts

const content = `
Use [[coingecko-com/tool/simplePrice]] to fetch current prices for the
requested coins. Pass the coin IDs as a comma-separated string in the "ids"
parameter and the target currency in the "vs_currencies" parameter.

Then use [[coingecko-com/tool/coinMarkets]] to get detailed market data.
Pass the same currency as "vs_currency" and set "order" to "market_cap_desc"
for ranked results.

Compare the following metrics for [[coins]] in [[currency]]:
- Current price
- 24h price change percentage
- 7d price change percentage
- Market cap ranking
- 24h trading volume

Present the comparison as a Markdown table with one row per coin. Sort by
market cap descending. Example format:

| Coin | Price | 24h Change | 7d Change | Market Cap Rank | Volume (24h) |
|------|-------|------------|-----------|-----------------|--------------|
| ...  | ...   | ...        | ...       | ...             | ...          |

Include a summary paragraph highlighting:
- The top performer by 24h price change
- Any coins with unusual volume relative to market cap (volume/mcap > 0.1)
- Notable divergences between 24h and 7d trends

If simplePrice returns a coin ID that coinMarkets does not recognize, skip
that coin in the comparison table and note it at the bottom of the report.
`


export const prompt = {
    name: 'price-comparison',
    version: 'flowmcp-prompt/1.0.0',
    namespace: 'coingecko-com',
    description: 'Compare prices, market caps, and volumes across multiple coins using CoinGecko data',
    dependsOn: [
        'simplePrice',
        'coinMarkets'
    ],
    content
}
