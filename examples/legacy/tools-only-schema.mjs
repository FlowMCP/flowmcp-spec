// FlowMCP v3.0.0 — Tools-Only Schema Example
// Demonstrates what a migrated v2 schema looks like in v3.
// Key change: `routes` is now `tools`. Everything else stays the same.

export const main = {
    namespace: 'defillama',
    name: 'ProtocolTvl',
    description: 'DeFi Llama protocol TVL data via public API',
    version: '3.0.0',
    docs: [ 'https://defillama.com/docs/api' ],
    tags: [ 'defi', 'tvl', 'analytics' ],
    root: 'https://api.llama.fi',
    requiredServerParams: [],
    requiredLibraries: [],
    headers: {},
    tools: {
        getProtocols: {
            method: 'GET',
            path: '/protocols',
            description: 'List all DeFi protocols with their current TVL',
            parameters: [],
            tests: [
                { _description: 'Fetch all protocols (no parameters needed)' }
            ],
            output: {
                mimeType: 'application/json',
                schema: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string', description: 'Protocol name' },
                            slug: { type: 'string', description: 'URL-safe identifier' },
                            tvl: { type: 'number', description: 'Total value locked in USD' },
                            chain: { type: 'string', description: 'Primary chain' }
                        }
                    }
                }
            }
        },
        getTvl: {
            method: 'GET',
            path: '/tvl/{{protocolSlug}}',
            description: 'Get current TVL in USD for a specific protocol',
            parameters: [
                {
                    position: { key: 'protocolSlug', value: '{{USER_PARAM}}', location: 'insert' },
                    z: { primitive: 'string()', options: [ 'min(1)' ] }
                }
            ],
            tests: [
                { _description: 'Get TVL for Aave', protocolSlug: 'aave' },
                { _description: 'Get TVL for Uniswap', protocolSlug: 'uniswap' }
            ],
            output: {
                mimeType: 'application/json',
                schema: {
                    type: 'number'
                }
            }
        }
    }
}
