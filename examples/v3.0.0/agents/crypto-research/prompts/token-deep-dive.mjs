// FlowMCP v3.0.0 — Agent-Prompt Example
// An Agent-Prompt spans multiple providers and is tested against a specific LLM.
// Key differences from Provider-Prompts:
//   - `agent` field instead of `namespace`
//   - `testedWith` is required
//   - `dependsOn` uses full ID format (namespace/type/name)
//   - `references` can compose Provider-Prompts

const content = `
Perform a deep analysis of [[token]] on [[chain]].

Step 1 — Contract verification:
Use [[etherscan-io/tool/getContractAbi]] with the token's contract address.
If the contract is verified, parse the ABI to identify the token standard
(ERC-20, ERC-721, ERC-1155) and extract key function signatures.
If the contract is NOT verified, note this as a risk factor but continue
with the price analysis. Unverified contracts are not necessarily malicious
but warrant caution.

Step 2 — Price and market data:
Fetch current pricing using [[coingecko-com/tool/simplePrice]] with the
token's CoinGecko ID. If the exact ID is unknown, try matching by contract
address or symbol.

For price comparison context, follow the approach described in
[[coingecko-com/prompt/price-comparison]]. Compare the target token against
the top 3 tokens in the same category by market cap.

Step 3 — DeFi protocol context (if applicable):
If [[token]] is the governance or utility token of a DeFi protocol, use
[[defillama-com/tool/getProtocolTvl]] to retrieve TVL data. Compare the
protocol's TVL across chains to identify where most liquidity is deployed.

Step 4 — Synthesize findings:
Produce a Markdown report with these sections:

## Contract Overview
- Verification status, token standard, key functions
- Deployer address and deployment date (if available)

## Price Analysis
- Current price, 24h change, 7d change
- Market cap ranking within category
- Trading volume relative to market cap (high ratio = high activity)

## DeFi Position (if applicable)
- Total TVL and chain distribution
- TVL trend (growing, stable, declining)

## Risk Assessment
- Contract verification status
- Liquidity depth
- Concentration risks (single-chain dominance, whale holdings)
`


export const prompt = {
    name: 'token-deep-dive',
    version: 'flowmcp-prompt/1.0.0',
    agent: 'crypto-research',
    description: 'Deep analysis of a token across multiple data sources combining on-chain verification, market data, and DeFi protocol metrics',
    testedWith: 'anthropic/claude-sonnet-4-5-20250929',
    dependsOn: [
        'coingecko-com/tool/simplePrice',
        'etherscan-io/tool/getContractAbi',
        'defillama-com/tool/getProtocolTvl'
    ],
    references: [
        'coingecko-com/prompt/price-comparison'
    ],
    content
}
