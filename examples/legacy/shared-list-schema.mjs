// FlowMCP v2.0.0 — Shared List Schema Example
// Demonstrates shared list reference and {{listName:fieldName}} interpolation

export const main = {
    namespace: 'etherscan',
    name: 'GasTracker',
    description: 'EVM gas price tracking via Etherscan API',
    version: '2.0.0',
    docs: [ 'https://docs.etherscan.io/api-endpoints/gas-tracker' ],
    tags: [ 'evm', 'gas', 'transactions' ],
    root: 'https://api.etherscan.io/v2/api',
    requiredServerParams: [ 'ETHERSCAN_API_KEY' ],
    requiredLibraries: [],
    headers: {},
    sharedLists: [
        {
            ref: 'evmChains',
            version: '1.0.0',
            filter: { key: 'etherscanAlias', exists: true }
        }
    ],
    routes: {
        getGasOracle: {
            method: 'GET',
            path: '/api',
            description: 'Get current gas prices for an EVM chain',
            parameters: [
                {
                    position: { key: 'chainName', value: '{{USER_PARAM}}', location: 'query' },
                    z: { primitive: 'enum({{evmChains:etherscanAlias}})', options: [] }
                },
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
            output: {
                mimeType: 'application/json',
                schema: {
                    type: 'object',
                    properties: {
                        LastBlock: { type: 'string', description: 'Latest block number' },
                        SafeGasPrice: { type: 'string', description: 'Safe gas price in Gwei' },
                        ProposeGasPrice: { type: 'string', description: 'Proposed gas price in Gwei' },
                        FastGasPrice: { type: 'string', description: 'Fast gas price in Gwei' },
                        suggestBaseFee: { type: 'string', description: 'Suggested base fee' },
                        gasUsedRatio: { type: 'string', description: 'Gas used ratio for recent blocks' }
                    }
                }
            }
        }
    }
}
