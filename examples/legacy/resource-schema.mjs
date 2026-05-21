// FlowMCP v3.0.0 — Resource Schema Example
// Demonstrates a schema with a SQLite resource containing two queries.
// Uses the `resources` key in `main` alongside `tools`.

export const main = {
    namespace: 'evm',
    name: 'ChainRegistry',
    description: 'EVM chain metadata from local database plus live gas data from API',
    version: '3.0.0',
    docs: [ 'https://chainlist.org' ],
    tags: [ 'evm', 'chains', 'metadata' ],
    root: 'https://api.etherscan.io',
    requiredServerParams: [ 'ETHERSCAN_API_KEY' ],
    requiredLibraries: [],
    headers: {},
    tools: {
        getGasPrice: {
            method: 'GET',
            path: '/api',
            description: 'Get current gas price from Etherscan',
            parameters: [
                {
                    position: { key: 'module', value: 'gastracker', location: 'query' },
                    z: { primitive: 'string()', options: [] }
                },
                {
                    position: { key: 'action', value: 'gasoracle', location: 'query' },
                    z: { primitive: 'string()', options: [] }
                },
                {
                    position: { key: 'apikey', value: '{{SERVER_PARAM:ETHERSCAN_API_KEY}}', location: 'query' },
                    z: { primitive: 'string()', options: [] }
                }
            ],
            tests: [
                { _description: 'Fetch current Ethereum gas prices' }
            ],
            output: {
                mimeType: 'application/json',
                schema: {
                    type: 'object',
                    properties: {
                        SafeGasPrice: { type: 'string', description: 'Safe gas price in Gwei' },
                        ProposeGasPrice: { type: 'string', description: 'Proposed gas price in Gwei' },
                        FastGasPrice: { type: 'string', description: 'Fast gas price in Gwei' }
                    }
                }
            }
        }
    },
    resources: {
        chainLookup: {
            source: 'sqlite',
            description: 'EVM chain metadata lookup by chain ID or name.',
            database: './data/evm-chains.db',
            queries: {
                byChainId: {
                    sql: 'SELECT chain_id, name, currency_symbol, rpc_url, explorer_url FROM chains WHERE chain_id = ?',
                    description: 'Find chain configuration by chain ID',
                    parameters: [
                        {
                            position: { key: 'chainId', value: '{{USER_PARAM}}' },
                            z: { primitive: 'number()', options: [ 'min(1)' ] }
                        }
                    ],
                    output: {
                        mimeType: 'application/json',
                        schema: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    chainId: { type: 'number', description: 'EIP-155 chain identifier' },
                                    name: { type: 'string', description: 'Human-readable chain name' },
                                    currencySymbol: { type: 'string', description: 'Native currency symbol (e.g. ETH)' },
                                    rpcUrl: { type: 'string', description: 'Default RPC endpoint' },
                                    explorerUrl: { type: 'string', description: 'Block explorer base URL' }
                                }
                            }
                        }
                    },
                    tests: [
                        { _description: 'Ethereum Mainnet', chainId: 1 },
                        { _description: 'Polygon PoS', chainId: 137 },
                        { _description: 'Arbitrum One', chainId: 42161 }
                    ]
                },
                byName: {
                    sql: 'SELECT chain_id, name, currency_symbol, rpc_url, explorer_url FROM chains WHERE name LIKE ? COLLATE NOCASE',
                    description: 'Search chains by name (case-insensitive, partial match)',
                    parameters: [
                        {
                            position: { key: 'name', value: '{{USER_PARAM}}' },
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
                                    chainId: { type: 'number', description: 'EIP-155 chain identifier' },
                                    name: { type: 'string', description: 'Human-readable chain name' },
                                    currencySymbol: { type: 'string', description: 'Native currency symbol' },
                                    rpcUrl: { type: 'string', description: 'Default RPC endpoint' },
                                    explorerUrl: { type: 'string', description: 'Block explorer base URL' }
                                }
                            }
                        }
                    },
                    tests: [
                        { _description: 'Search for Ethereum chains', name: '%ethereum%' },
                        { _description: 'Search for Polygon chains', name: '%polygon%' }
                    ]
                }
            }
        }
    }
}
