export const selection = {
    namespace: 'evm-research',
    name: 'contract-analysis',
    version: 'flowmcp/4.0.0',
    description: 'Tools and Skills for Smart Contract analysis on EVM chains',
    whenToUse: 'Activate this Selection when the user wants to analyze, debug, or inspect a smart contract.',
    tools: [
        'etherscan-io/tool/getSmartContractAbi',
        'etherscan-io/tool/getContractCreation'
    ],
    skills: [ 'etherscan-io/skill/contract-deep-dive' ],
    resources: [],
    prompts: []
}
