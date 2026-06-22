import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { buildFrontmatter } from './lib/frontmatter.mjs'
import { getReposRoot, getGuideRepoPath } from './lib/config.mjs'
import { getSpecVersionTag } from './lib/refs-loader.mjs'
import { ghFetchReadme } from './lib/gh-fetch.mjs'

const reposRoot = getReposRoot()
const guideRepo = getGuideRepoPath()

const agentServerRepo = join( reposRoot, 'mcp-agent-server' )

let readme
let source
if( existsSync( join( agentServerRepo, 'README.md' ) ) ) {
    readme = readFileSync( join( agentServerRepo, 'README.md' ), 'utf8' )
    source = '../mcp-agent-server/README.md'
} else {
    try {
        readme = ghFetchReadme( 'FlowMCP', 'mcp-agent-server' )
        source = 'gh:FlowMCP/mcp-agent-server/README.md'
    } catch( error ) {
        readme = `(mcp-agent-server README unavailable: ${error.message})`
        source = 'unavailable'
    }
}

const frontmatter = buildFrontmatter( {
    generator: 'gen-agent-server.mjs',
    sources: [ source ],
    specVersion: getSpecVersionTag()
} )

const body = [
    '# mcp-agent-server',
    '',
    'MCP server with AI agent-powered tools built on FlowMCP schemas. See https://github.com/FlowMCP/mcp-agent-server for the live README.',
    '',
    '## README',
    '',
    readme
].join( '\n' )

writeFileSync( join( guideRepo, 'knowledge', '09-mcp-agent-server.md' ), frontmatter + body, 'utf8' )
console.log( 'Wrote knowledge/09-mcp-agent-server.md' )
