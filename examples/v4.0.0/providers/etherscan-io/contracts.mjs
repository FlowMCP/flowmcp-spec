export const schema = {
    main: {
        namespace: 'etherscan-io',
        name: 'contracts',
        version: '4.0.0',
        root: 'https://api.etherscan.io/v2/api'
    },
    tools: {
        getSmartContractAbi: {
            description: 'Returns the contract ABI for a verified smart contract.',
            parameters: {
                chainId: { type: 'string', description: 'Chain ID (e.g., 1 for Ethereum mainnet)' },
                address: { type: 'string', description: 'Contract address (0x-prefixed, 42 chars)' }
            },
            meta: {
                isReadOnly: true,
                isConcurrencySafe: true,
                isDestructive: false,
                searchHint: 'contract ABI ethereum smart contract verified',
                aliases: [ 'getAbi', 'getContractAbi' ],
                alwaysLoad: false
            },
            test: [
                {
                    description: 'Get ABI for USDC on Ethereum',
                    params: { chainId: '1', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' }
                }
            ]
        }
    }
}
