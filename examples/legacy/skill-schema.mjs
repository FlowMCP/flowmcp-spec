// FlowMCP v3.0.0 — Skill Schema Example
// Demonstrates a schema with tools AND a skill reference.
// The skill file (./skills/contract-audit.mjs) is referenced via main.skills.

export const main = {
    namespace: 'etherscan',
    name: 'ContractExplorer',
    description: 'Explore verified smart contracts on Ethereum via Etherscan APIs',
    version: '3.0.0',
    docs: [ 'https://docs.etherscan.io' ],
    tags: [ 'ethereum', 'smart-contracts', 'verification' ],
    root: 'https://api.etherscan.io',
    requiredServerParams: [ 'ETHERSCAN_API_KEY' ],
    requiredLibraries: [],
    headers: {},
    tools: {
        getContractAbi: {
            method: 'GET',
            path: '/api',
            description: 'Returns the ABI of a verified smart contract',
            parameters: [
                {
                    position: { key: 'module', value: 'contract', location: 'query' },
                    z: { primitive: 'string()', options: [] }
                },
                {
                    position: { key: 'action', value: 'getabi', location: 'query' },
                    z: { primitive: 'string()', options: [] }
                },
                {
                    position: { key: 'address', value: '{{USER_PARAM}}', location: 'query' },
                    z: { primitive: 'string()', options: [ 'min(42)', 'max(42)' ] }
                },
                {
                    position: { key: 'apikey', value: '{{SERVER_PARAM:ETHERSCAN_API_KEY}}', location: 'query' },
                    z: { primitive: 'string()', options: [] }
                }
            ],
            tests: [
                {
                    _description: 'Get ABI for USDT contract',
                    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
                }
            ],
            output: {
                mimeType: 'application/json',
                schema: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', description: 'API response status' },
                        result: { type: 'string', description: 'ABI JSON string' }
                    }
                }
            }
        },
        getSourceCode: {
            method: 'GET',
            path: '/api',
            description: 'Returns the Solidity source code of a verified contract',
            parameters: [
                {
                    position: { key: 'module', value: 'contract', location: 'query' },
                    z: { primitive: 'string()', options: [] }
                },
                {
                    position: { key: 'action', value: 'getsourcecode', location: 'query' },
                    z: { primitive: 'string()', options: [] }
                },
                {
                    position: { key: 'address', value: '{{USER_PARAM}}', location: 'query' },
                    z: { primitive: 'string()', options: [ 'min(42)', 'max(42)' ] }
                },
                {
                    position: { key: 'apikey', value: '{{SERVER_PARAM:ETHERSCAN_API_KEY}}', location: 'query' },
                    z: { primitive: 'string()', options: [] }
                }
            ],
            tests: [
                {
                    _description: 'Get source code for USDT contract',
                    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
                }
            ],
            output: {
                mimeType: 'application/json',
                schema: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', description: 'API response status' },
                        result: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    SourceCode: { type: 'string', description: 'Contract source code' },
                                    ContractName: { type: 'string', description: 'Contract name' },
                                    CompilerVersion: { type: 'string', description: 'Solidity compiler version' }
                                }
                            }
                        }
                    }
                }
            }
        },
        getContractCreation: {
            method: 'GET',
            path: '/api',
            description: 'Returns the contract creator address and creation transaction hash',
            parameters: [
                {
                    position: { key: 'module', value: 'contract', location: 'query' },
                    z: { primitive: 'string()', options: [] }
                },
                {
                    position: { key: 'action', value: 'getcontractcreation', location: 'query' },
                    z: { primitive: 'string()', options: [] }
                },
                {
                    position: { key: 'contractaddresses', value: '{{USER_PARAM}}', location: 'query' },
                    z: { primitive: 'string()', options: [ 'min(42)' ] }
                },
                {
                    position: { key: 'apikey', value: '{{SERVER_PARAM:ETHERSCAN_API_KEY}}', location: 'query' },
                    z: { primitive: 'string()', options: [] }
                }
            ],
            tests: [
                {
                    _description: 'Get creation info for USDT',
                    contractaddresses: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
                }
            ],
            output: {
                mimeType: 'application/json',
                schema: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', description: 'API response status' },
                        result: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    contractAddress: { type: 'string', description: 'Contract address' },
                                    contractCreator: { type: 'string', description: 'Creator address' },
                                    txHash: { type: 'string', description: 'Creation transaction hash' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    skills: {
        'contract-audit': { file: './skills/contract-audit.mjs' }
    }
}
