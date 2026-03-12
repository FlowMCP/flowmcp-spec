// FlowMCP v3.0.0 — Skill with External Dependencies Example
// This skill requires Playwright for browser automation.
// The `requires.external` field declares external capabilities the skill needs.
// These are informational — the runtime does not validate them against available capabilities.
// They help consumers understand what environment the skill expects.
//
// Zero imports allowed. No fs, no require, no eval.

const content = `
## Prerequisites

This skill requires **Playwright** for browser automation.
The executing environment must have Playwright installed and configured.

## Step 1: Navigate to Explorer

Open the block explorer page at {{input:url}} using Playwright.
Wait for the page to fully load (wait for the main content container).

## Step 2: Extract Token Metadata

Scrape the following fields from the page:
- Token name
- Token symbol
- Decimals
- Total supply
- Contract address
- Holder count (if available)

## Step 3: Extract Contract Info

If the page shows contract verification status, also extract:
- Compiler version
- License type
- Verification date

## Step 4: Handle Pagination

If the token has a holders tab or transfers tab, extract the first page
of data only. Do not paginate further unless {{input:includeHolders}}
is explicitly set.

## Step 5: Format Output

Return a JSON object with all extracted fields.
Use camelCase keys. Omit fields that were not found on the page.
Include a \`scrapedAt\` timestamp in ISO 8601 format.
`


export const skill = {
    name: 'scrape-token-page',
    version: 'flowmcp-skill/1.0.0',
    description: 'Scrape token metadata from block explorer pages when no API endpoint is available. Requires Playwright.',
    requires: {
        tools: [],
        resources: [],
        external: [ 'playwright' ]
    },
    input: [
        {
            key: 'url',
            type: 'string',
            description: 'Full URL of the block explorer token page (e.g. https://etherscan.io/token/0x...)',
            required: true
        },
        {
            key: 'includeHolders',
            type: 'boolean',
            description: 'Whether to scrape the first page of token holders',
            required: false
        },
        {
            key: 'explorer',
            type: 'enum',
            description: 'Which block explorer the URL belongs to',
            required: true,
            values: [ 'etherscan', 'polygonscan', 'arbiscan', 'basescan', 'bscscan' ]
        }
    ],
    output: 'JSON object with token name, symbol, decimals, total supply, contract address, holder count, and optional contract verification info.',
    content
}
