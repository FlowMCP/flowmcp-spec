import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildFrontmatter } from './lib/frontmatter.mjs'
import { getReposRoot, getGuideRepoPath } from './lib/config.mjs'
import { getSpecVersionTag } from './lib/refs-loader.mjs'
import { ghFetchReadme } from './lib/gh-fetch.mjs'

const reposRoot = getReposRoot()
const guideRepo = getGuideRepoPath()

const coreReadme = readFileSync( join( reposRoot, 'flowmcp-core', 'README.md' ), 'utf8' )

let serversReadme
try {
    serversReadme = ghFetchReadme( 'FlowMCP', 'flowmcp-servers' )
} catch( error ) {
    console.warn( `WARN: ${error.message}` )
    serversReadme = `(flowmcp-servers README unavailable — fetch via 'gh auth login' and rerun. See https://github.com/FlowMCP/flowmcp-servers)`
}

const sources = [
    '../flowmcp-core/README.md',
    'gh:FlowMCP/flowmcp-servers/README.md'
]

const frontmatter = buildFrontmatter( {
    generator: 'gen-core-arch.mjs',
    sources,
    specVersion: getSpecVersionTag()
} )

const body = [
    '# FlowMCP Core Architecture',
    '',
    '## flowmcp-core',
    '',
    coreReadme,
    '',
    '---',
    '',
    '## flowmcp-servers',
    '',
    serversReadme
].join( '\n' )

writeFileSync( join( guideRepo, 'knowledge', '05-core-architecture.md' ), frontmatter + body, 'utf8' )
console.log( 'Wrote knowledge/05-core-architecture.md' )
