// FlowMCP v2.0.0 — Shared List Definition Example
// Demonstrates a shared list with field definitions and entries

export const list = {
    meta: {
        name: 'evmChains',
        version: '1.0.0',
        description: 'Unified EVM chain registry with provider-specific aliases',
        fields: [
            { key: 'alias', type: 'string', description: 'Canonical chain alias (UPPER_SNAKE_CASE)' },
            { key: 'chainId', type: 'number', description: 'EVM chain ID' },
            { key: 'name', type: 'string', description: 'Human-readable chain name' },
            { key: 'etherscanAlias', type: 'string', optional: true, description: 'Etherscan API chain parameter' },
            { key: 'moralisChainSlug', type: 'string', optional: true, description: 'Moralis chain slug' },
            { key: 'defillamaSlug', type: 'string', optional: true, description: 'DeFi Llama chain identifier' },
            { key: 'coingeckoPlatformId', type: 'string', optional: true, description: 'CoinGecko asset platform ID' }
        ],
        dependsOn: []
    },
    entries: [
        {
            alias: 'ETHEREUM_MAINNET',
            chainId: 1,
            name: 'Ethereum Mainnet',
            etherscanAlias: 'ETH',
            moralisChainSlug: 'eth',
            defillamaSlug: 'Ethereum',
            coingeckoPlatformId: 'ethereum'
        },
        {
            alias: 'POLYGON_MAINNET',
            chainId: 137,
            name: 'Polygon Mainnet',
            etherscanAlias: 'POLYGON',
            moralisChainSlug: 'polygon',
            defillamaSlug: 'Polygon',
            coingeckoPlatformId: 'polygon-pos'
        },
        {
            alias: 'ARBITRUM_ONE',
            chainId: 42161,
            name: 'Arbitrum One',
            etherscanAlias: 'ARBITRUM',
            moralisChainSlug: 'arbitrum',
            defillamaSlug: 'Arbitrum',
            coingeckoPlatformId: 'arbitrum-one'
        },
        {
            alias: 'OPTIMISM_MAINNET',
            chainId: 10,
            name: 'Optimism Mainnet',
            etherscanAlias: 'OPTIMISM',
            moralisChainSlug: 'optimism',
            defillamaSlug: 'Optimism',
            coingeckoPlatformId: 'optimistic-ethereum'
        },
        {
            alias: 'BASE_MAINNET',
            chainId: 8453,
            name: 'Base Mainnet',
            etherscanAlias: 'BASE',
            moralisChainSlug: 'base',
            defillamaSlug: 'Base',
            coingeckoPlatformId: 'base'
        },
        {
            alias: 'AVALANCHE_C_CHAIN',
            chainId: 43114,
            name: 'Avalanche C-Chain',
            etherscanAlias: null,
            moralisChainSlug: 'avalanche',
            defillamaSlug: 'Avalanche',
            coingeckoPlatformId: 'avalanche'
        },
        {
            alias: 'BSC_MAINNET',
            chainId: 56,
            name: 'BNB Smart Chain',
            etherscanAlias: 'BSC',
            moralisChainSlug: 'bsc',
            defillamaSlug: 'BSC',
            coingeckoPlatformId: 'binance-smart-chain'
        }
    ]
}
