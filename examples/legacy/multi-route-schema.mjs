// FlowMCP v2.0.0 — Multi-Route Schema Example
// Demonstrates multiple routes with pre/post handlers

export const main = {
    namespace: 'defillama',
    name: 'ProtocolAnalytics',
    description: 'DeFi Llama protocol TVL and analytics data',
    version: '2.0.0',
    docs: [ 'https://defillama.com/docs/api' ],
    tags: [ 'defi', 'tvl', 'analytics' ],
    root: 'https://api.llama.fi',
    requiredServerParams: [],
    requiredLibraries: [],
    headers: {},
    routes: {
        getProtocols: {
            method: 'GET',
            path: '/protocols',
            description: 'List all DeFi protocols with TVL data',
            parameters: [],
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
                            chain: { type: 'string', description: 'Primary chain' },
                            category: { type: 'string', description: 'Protocol category' }
                        }
                    }
                }
            }
        },
        getTvl: {
            method: 'GET',
            path: '/tvl/{{protocolSlug}}',
            description: 'Get current TVL for a specific protocol',
            parameters: [
                {
                    position: { key: 'protocolSlug', value: '{{USER_PARAM}}', location: 'insert' },
                    z: { primitive: 'string()', options: [ 'min(1)' ] }
                }
            ],
            output: {
                mimeType: 'application/json',
                schema: {
                    type: 'number'
                }
            }
        },
        getProtocolTvl: {
            method: 'GET',
            path: '/protocol/{{protocolSlug}}',
            description: 'Get detailed TVL history for a protocol',
            parameters: [
                {
                    position: { key: 'protocolSlug', value: '{{USER_PARAM}}', location: 'insert' },
                    z: { primitive: 'string()', options: [ 'min(1)' ] }
                }
            ],
            output: {
                mimeType: 'application/json',
                schema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Protocol name' },
                        tvl: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    date: { type: 'number' },
                                    totalLiquidityUSD: { type: 'number' }
                                }
                            }
                        },
                        currentChainTvls: { type: 'object', description: 'TVL per chain' }
                    }
                }
            }
        },
        getChainTvl: {
            method: 'GET',
            path: '/v2/historicalChainTvl/{{chainName}}',
            description: 'Get historical TVL for a specific chain',
            parameters: [
                {
                    position: { key: 'chainName', value: '{{USER_PARAM}}', location: 'insert' },
                    z: { primitive: 'string()', options: [ 'min(1)' ] }
                }
            ],
            output: {
                mimeType: 'application/json',
                schema: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            date: { type: 'number', description: 'Unix timestamp' },
                            tvl: { type: 'number', description: 'TVL in USD' }
                        }
                    }
                }
            }
        }
    }
}

export const handlers = ( { sharedLists, libraries } ) => ( {
    getProtocols: {
        postRequest: async ( { response } ) => {
            const items = response
                .filter( ( item ) => item.tvl > 0 )
                .map( ( item ) => {
                    const { name, slug, tvl, chain, category } = item

                    return { name, slug, tvl, chain, category }
                } )

            return { response: items }
        }
    },
    getProtocolTvl: {
        postRequest: async ( { response } ) => {
            const { name, tvl, currentChainTvls } = response
            const simplified = {
                name,
                tvl: tvl || [],
                currentChainTvls: currentChainTvls || {}
            }

            return { response: simplified }
        }
    }
} )
