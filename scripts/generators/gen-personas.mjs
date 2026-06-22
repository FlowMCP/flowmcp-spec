import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildFrontmatter } from './lib/frontmatter.mjs'
import { getSpecRepoRoot, getGuideRepoPath } from './lib/config.mjs'
import { getSpecVersionTag } from './lib/refs-loader.mjs'

const specRoot = getSpecRepoRoot()
const guideRepo = getGuideRepoPath()

const sources = [
    'personas/overview.md',
    'personas/hackathon-builder.md',
    'personas/decision-maker.md',
    'personas/ai-engineer.md',
    'personas/schema-maintainer.md'
]

const blocks = sources.map( ( rel ) => ( {
    rel,
    content: readFileSync( join( specRoot, rel ), 'utf8' )
} ) )

const frontmatter = buildFrontmatter( {
    generator: 'gen-personas.mjs',
    sources,
    specVersion: getSpecVersionTag()
} )

const body = '# FlowMCP Personas\n\n' + blocks
    .map( ( { rel, content } ) => `## Source — ${rel}\n\n${content}\n` )
    .join( '\n---\n\n' )

writeFileSync( join( guideRepo, 'knowledge', '02-personas.md' ), frontmatter + body, 'utf8' )
console.log( 'Wrote knowledge/02-personas.md' )
