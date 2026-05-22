import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildFrontmatter } from './lib/frontmatter.mjs'
import { getGuideRepoPath } from './lib/config.mjs'
import { ghFetchReadme } from './lib/gh-fetch.mjs'

const guideRepo = getGuideRepoPath()

const repos = [ 'x402-core', 'x402-mcp-middleware', 'x402-flowmcp-org' ]

const sections = repos.map( ( name ) => {
    try {
        const readme = ghFetchReadme( 'FlowMCP', name )
        return `## ${name}\n\nGitHub: https://github.com/FlowMCP/${name}\n\n${readme}`
    } catch( error ) {
        return `## ${name}\n\nGitHub: https://github.com/FlowMCP/${name}\n\n(README unavailable: ${error.message})`
    }
} )

const sources = repos.map( ( r ) => `gh:FlowMCP/${r}/README.md` )

const frontmatter = buildFrontmatter( {
    generator: 'gen-payments.mjs',
    sources,
    specVersion: 'v4.0.0'
} )

const body = '# FlowMCP x402 Payment Stack\n\n' +
    'x402 is a multi-chain ERC20 payment layer. Use it to monetize MCP servers.\n\n' +
    sections.join( '\n\n---\n\n' )

writeFileSync( join( guideRepo, 'knowledge', '10-payments-x402.md' ), frontmatter + body, 'utf8' )
console.log( 'Wrote knowledge/10-payments-x402.md' )
