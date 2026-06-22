import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildFrontmatter } from './lib/frontmatter.mjs'
import { getSpecRepoRoot, getGuideRepoPath } from './lib/config.mjs'
import { getSpecVersionTag } from './lib/refs-loader.mjs'

const specRoot = getSpecRepoRoot()
const guideRepo = getGuideRepoPath()

const sources = [ 'README.md', 'personas/overview.md' ]
const blocks = sources.map( ( rel ) => ( {
    rel,
    content: readFileSync( join( specRoot, rel ), 'utf8' )
} ) )

const frontmatter = buildFrontmatter( {
    generator: 'gen-overview.mjs',
    sources,
    specVersion: getSpecVersionTag()
} )

const body = [
    '# FlowMCP — Overview',
    '',
    'FlowMCP is a framework for adapting REST APIs into a standardized Model Context Protocol (MCP) interface — testable, semantically consistent, AI-consumable.',
    '',
    '## Personas (Routing Targets)',
    '',
    '- Mira (Hackathon-Builder): CLI-first, wants Hello-World in 5 minutes.',
    '- Anders (Decision-Maker): 90-second pitch, trust signals, no code.',
    '- Daniel (AI-Engineer): MCP architecture integration, repo references.',
    '- Sofia (Schema-Maintainer): v4 schema authoring, validation codes.',
    '',
    '## Source Aggregation',
    '',
    blocks.map( ( { rel, content } ) => `### From ${rel}\n\n${content}` ).join( '\n\n---\n\n' )
].join( '\n' )

writeFileSync( join( guideRepo, 'knowledge', '01-overview.md' ), frontmatter + body, 'utf8' )
console.log( 'Wrote knowledge/01-overview.md' )
