// FlowMCP v3.0.0 — Skill File Example
// This is a SKILL file, not a schema. It is referenced from a schema via:
//   main.skills: { 'contract-audit': { file: './skills/contract-audit.mjs' } }
//
// The skill file has two parts:
//   1. `content` variable — Markdown instructions with placeholders
//   2. `export const skill` — structured metadata for validation and MCP registration
//
// Zero imports allowed. No fs, no require, no eval.

const content = `
## Step 1: Retrieve Contract ABI

Call {{tool:getContractAbi}} with the contract address {{input:address}}.
Parse the returned ABI JSON string into a structured object.
Count the number of functions, events, and errors declared.

## Step 2: Retrieve Source Code

Call {{tool:getSourceCode}} with the same address {{input:address}}.
Extract the contract name, compiler version, and optimization settings.

## Step 3: Get Deployment Info

Call {{tool:getContractCreation}} with {{input:address}} to retrieve:
- Deployer address
- Creation transaction hash
- Block number

## Step 4: Cross-Reference Analysis

Compare the ABI function signatures against the source code:
- Identify functions declared in ABI but missing from source
- Identify internal functions not exposed in ABI
- Flag any external calls (address.call, delegatecall)

## Step 5: Security Review

Review the source code for common patterns:
- Reentrancy guards (nonReentrant modifier)
- Access control (onlyOwner, role-based)
- Upgrade patterns (proxy, UUPS, transparent proxy)
- Token approvals and transfers

## Step 6: Generate Report

Produce a Markdown report with these sections:
- **Contract Overview**: name, compiler, optimization, address, deployer
- **Interface Summary**: function/event/error counts from ABI
- **Source Analysis**: external calls, modifiers, inheritance chain
- **Deployment Context**: deployer, age, creation transaction
- **Security Notes**: observations from Step 5
`


export const skill = {
    name: 'contract-audit',
    version: 'flowmcp-skill/1.0.0',
    description: 'Retrieve ABI, source code, and deployment info for a comprehensive smart contract audit report.',
    requires: {
        tools: [ 'getContractAbi', 'getSourceCode', 'getContractCreation' ],
        resources: [],
        external: []
    },
    input: [
        {
            key: 'address',
            type: 'string',
            description: 'Ethereum contract address (0x-prefixed, 42 characters)',
            required: true
        }
    ],
    output: 'Markdown report with contract overview, interface summary, source analysis, deployment context, and security observations.',
    content
}
