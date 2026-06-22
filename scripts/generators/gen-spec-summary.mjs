import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { buildFrontmatter } from './lib/frontmatter.mjs'
import { getSpecRepoRoot, getGuideRepoPath } from './lib/config.mjs'
import { getSpecVersionTag, getSpecDir, getSpecDirRel } from './lib/refs-loader.mjs'

const specRoot = getSpecRepoRoot()
const guideRepo = getGuideRepoPath()
const specVersionTag = getSpecVersionTag()
const specDirRel = getSpecDirRel()
const specDir = getSpecDir()

const summarySections = [
    '00-overview.md',
    '01-schema-format.md',
    '09-validation-rules.md',
    '19-mcp-integration.md',
    '21-schema-lifecycle.md',
    '22-scoring-protocol.md'
]

const blocks = summarySections.map( ( file ) => {
    const path = join( specDir, file )
    if( !existsSync( path ) ) {
        return { file, content: `(File not found: ${specDirRel}/${file})` }
    }
    return { file, content: readFileSync( path, 'utf8' ) }
} )

const sources = summarySections.map( ( f ) => `${specDirRel}/${f}` )

const frontmatter = buildFrontmatter( {
    generator: 'gen-spec-summary.mjs',
    sources,
    specVersion: specVersionTag
} )

const body = [
    `# FlowMCP Spec ${specVersionTag} — Summary`,
    '',
    `Curated lead-in for the Spec. For the full canonical text, see knowledge/07-spec-v4-llms.txt or the GitHub URL https://github.com/FlowMCP/flowmcp-spec/tree/main/${specDirRel}/`,
    '',
    blocks.map( ( { file, content } ) => `## ${file}\n\n${content}` ).join( '\n\n---\n\n' )
].join( '\n' )

writeFileSync( join( guideRepo, 'knowledge', '06-spec-v4-summary.md' ), frontmatter + body, 'utf8' )
console.log( 'Wrote knowledge/06-spec-v4-summary.md' )
