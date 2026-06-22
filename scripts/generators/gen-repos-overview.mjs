import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildFrontmatter } from './lib/frontmatter.mjs'
import { getGuideRepoPath } from './lib/config.mjs'
import { getSpecVersionTag } from './lib/refs-loader.mjs'
import { ghFetchReadme } from './lib/gh-fetch.mjs'

const guideRepo = getGuideRepoPath()

const repoGroups = [
    { group: 'Core', repos: [ 'flowmcp-cli', 'flowmcp-core', 'flowmcp-schemas-public', 'flowmcp-servers', 'flowmcp-spec' ] },
    { group: 'Payment', repos: [ 'x402-core', 'x402-mcp-middleware', 'x402-flowmcp-org' ] },
    { group: 'Agent Server', repos: [ 'mcp-agent-server' ] },
    { group: 'Add-ons', repos: [ 'geo-gtfs-toolkit' ] }
]

const personaMap = {
    'flowmcp-cli': 'Mira primary, Sofia secondary',
    'flowmcp-core': 'Daniel primary',
    'flowmcp-schemas-public': 'Sofia primary, Daniel secondary',
    'flowmcp-servers': 'Daniel primary',
    'flowmcp-spec': 'Sofia primary, Daniel and Anders secondary',
    'x402-core': 'Daniel + Anders',
    'x402-mcp-middleware': 'Daniel',
    'x402-flowmcp-org': 'Anders + Daniel',
    'mcp-agent-server': 'Daniel',
    'geo-gtfs-toolkit': 'Domain-specific (Mobility)'
}

const sections = []
let totalCount = 0
for( const { group, repos } of repoGroups ) {
    sections.push( `## ${group}\n` )
    for( const repo of repos ) {
        totalCount += 1
        let readmeSnippet
        try {
            const readme = ghFetchReadme( 'FlowMCP', repo )
            readmeSnippet = readme.split( '\n' ).slice( 0, 30 ).join( '\n' )
        } catch( error ) {
            readmeSnippet = `(README unavailable: ${error.message})`
        }
        const persona = personaMap[ repo ] || '—'
        sections.push( `### ${repo}\n\n- GitHub: https://github.com/FlowMCP/${repo}\n- Persona: ${persona}\n\n${readmeSnippet}\n` )
    }
}

const sources = repoGroups.flatMap( ( g ) => g.repos.map( ( r ) => `gh:FlowMCP/${r}/README.md` ) )

const frontmatter = buildFrontmatter( {
    generator: 'gen-repos-overview.mjs',
    sources,
    specVersion: getSpecVersionTag()
} )

const body = `# FlowMCP Repository Overview (${totalCount} Repos)\n\nThe canonical org-startpage is https://github.com/FlowMCP/.github/blob/main/profile/README.md\n\n` + sections.join( '\n' )

writeFileSync( join( guideRepo, 'knowledge', '03-repos-overview.md' ), frontmatter + body, 'utf8' )
console.log( `Wrote knowledge/03-repos-overview.md (${totalCount} repos)` )
