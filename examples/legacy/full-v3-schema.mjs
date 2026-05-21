// FlowMCP v3.0.0 — Full Schema Example
// Demonstrates ALL three MCP primitives in one schema:
//   - tools    (routes renamed) — API calls exposed as MCP tools
//   - resources                 — SQLite database queries exposed as MCP resources
//   - skills                    — AI agent instructions exposed as MCP prompts
//
// This is the most comprehensive v3 example.

export const main = {
    namespace: 'etherscan',
    name: 'SmartContractSuite',
    description: 'Smart contract exploration with API tools, local metadata lookup, and guided audit skills',
    version: '3.0.0',
    docs: [ 'https://docs.etherscan.io' ],
    tags: [ 'ethereum', 'smart-contracts', 'audit' ],
    root: 'https://api.etherscan.io',
    requiredServerParams: [ 'ETHERSCAN_API_KEY' ],
    requiredLibraries: [],
    headers: {},

    // ─── Tools (MCP server.tool) ───────────────────────────────
    // HTTP API calls. Same as v2 `routes`, renamed to `tools`.

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
                    _description: 'Get ABI for USDC proxy',
                    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
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
                    _description: 'Get source for USDC proxy',
                    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
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
                                    CompilerVersion: { type: 'string', description: 'Solidity compiler version' },
                                    OptimizationUsed: { type: 'string', description: 'Whether optimization was used' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // ─── Resources (MCP server.resource) ───────────────────────
    // SQLite database queries. Local, deterministic, no API key needed.

    resources: {
        knownContracts: {
            source: 'sqlite',
            description: 'Well-known contract metadata lookup by address or category.',
            database: './data/known-contracts.db',
            queries: {
                byAddress: {
                    sql: 'SELECT address, name, category, deployer, deploy_date, is_proxy FROM contracts WHERE address = ? COLLATE NOCASE',
                    description: 'Look up a known contract by its address',
                    parameters: [
                        {
                            position: { key: 'address', value: '{{USER_PARAM}}' },
                            z: { primitive: 'string()', options: [ 'min(42)', 'max(42)' ] }
                        }
                    ],
                    output: {
                        mimeType: 'application/json',
                        schema: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    address: { type: 'string', description: 'Contract address' },
                                    name: { type: 'string', description: 'Human-readable contract name' },
                                    category: { type: 'string', description: 'Category (e.g. DEX, Lending, Bridge)' },
                                    deployer: { type: 'string', description: 'Deployer address' },
                                    deployDate: { type: 'string', description: 'Deployment date (ISO 8601)' },
                                    isProxy: { type: 'number', description: '1 if proxy contract, 0 otherwise' }
                                }
                            }
                        }
                    },
                    tests: [
                        {
                            _description: 'USDC proxy contract',
                            address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
                        },
                        {
                            _description: 'Uniswap V3 Router',
                            address: '0xE592427A0AEce92De3Edee1F18E0157C05861564'
                        }
                    ]
                },
                byCategory: {
                    sql: 'SELECT address, name, category, deploy_date FROM contracts WHERE category = ? COLLATE NOCASE ORDER BY deploy_date DESC',
                    description: 'List known contracts by category',
                    parameters: [
                        {
                            position: { key: 'category', value: '{{USER_PARAM}}' },
                            z: { primitive: 'enum(DEX,Lending,Bridge,Stablecoin,NFT,DAO)', options: [] }
                        }
                    ],
                    output: {
                        mimeType: 'application/json',
                        schema: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    address: { type: 'string', description: 'Contract address' },
                                    name: { type: 'string', description: 'Human-readable contract name' },
                                    category: { type: 'string', description: 'Contract category' },
                                    deployDate: { type: 'string', description: 'Deployment date (ISO 8601)' }
                                }
                            }
                        }
                    },
                    tests: [
                        { _description: 'DEX contracts', category: 'DEX' },
                        { _description: 'Lending contracts', category: 'Lending' }
                    ]
                }
            }
        }
    },

    // ─── Skills (MCP server.prompt) ────────────────────────────
    // AI agent instructions. Referenced as separate .mjs files.

    skills: {
        'full-audit': { file: './skills/full-audit.mjs' },
        'quick-check': { file: './skills/quick-check.mjs' }
    }
}


// ─── Handlers ──────────────────────────────────────────────────
// Post-processing for tools and resources.
// Tool handlers are keyed by tool name.
// Resource handlers are keyed by resource name, then query name (one level deeper).

export const handlers = ( { sharedLists, libraries } ) => ( {
    // Tool handler: simplify getSourceCode response
    getSourceCode: {
        postRequest: async ( { response } ) => {
            const { result } = response
            const simplified = result
                .map( ( item ) => {
                    const { SourceCode, ContractName, CompilerVersion, OptimizationUsed } = item

                    return {
                        sourceCode: SourceCode,
                        contractName: ContractName,
                        compilerVersion: CompilerVersion,
                        optimizationUsed: OptimizationUsed === '1'
                    }
                } )

            return { response: simplified }
        }
    },

    // Resource handler: enrich knownContracts.byAddress with explorer URL
    knownContracts: {
        byAddress: {
            postRequest: async ( { response } ) => {
                const enriched = response
                    .map( ( row ) => {
                        const { address } = row
                        const explorerUrl = `https://etherscan.io/address/${address}`

                        return { ...row, explorerUrl }
                    } )

                return { response: enriched }
            }
        }
    }
} )
