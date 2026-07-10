import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildFrontmatter } from './lib/frontmatter.mjs'
import { getGuideRepoPath } from './lib/config.mjs'
import { getSpecVersionTag } from './lib/refs-loader.mjs'

const __dirname = dirname( fileURLToPath( import.meta.url ) )
const guideRepo = getGuideRepoPath()

const source = join( __dirname, 'data', 'glossary-terms.json' )
const terms = JSON.parse( readFileSync( source, 'utf8' ) )

const frontmatter = buildFrontmatter( {
    generator: 'gen-glossary.mjs',
    sources: [ 'scripts/generators/data/glossary-terms.json (hand-maintained)' ],
    specVersion: getSpecVersionTag()
} )

const body = [
    `# FlowMCP Glossary (${terms.length} terms)`,
    '',
    '> This glossary follows the org anchor-term convention (memo-init upstream, meta-spec `06-conventions-writing`): each term has one canonical label owned by one chapter. FlowMCP terms are namespace-qualified via the family `namespaceToken` so they stay distinct from other families in the org anchor-term register. Grounding by consistent use, not declaration alone.',
    '',
    '| Term | Definition |',
    '|------|------------|',
    ...terms.map( ( { term, definition } ) => `| **${term}** | ${definition} |` )
].join( '\n' )

writeFileSync( join( guideRepo, 'knowledge', '12-glossary.md' ), frontmatter + body, 'utf8' )
console.log( `Wrote knowledge/12-glossary.md (${terms.length} terms)` )
