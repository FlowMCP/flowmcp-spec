import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { buildFrontmatter } from './lib/frontmatter.mjs'
import { getReposRoot, getGuideRepoPath } from './lib/config.mjs'
import { getSpecVersionTag } from './lib/refs-loader.mjs'

const reposRoot = getReposRoot()
const guideRepo = getGuideRepoPath()

const cliRepo = join( reposRoot, 'flowmcp-cli' )
const readme = readFileSync( join( cliRepo, 'README.md' ), 'utf8' )

const docsDir = join( cliRepo, 'docs' )
const docFiles = existsSync( docsDir )
    ? readdirSync( docsDir ).filter( ( f ) => f.endsWith( '.md' ) ).sort()
    : []

const docBlocks = docFiles.map( ( file ) => ( {
    file,
    content: readFileSync( join( docsDir, file ), 'utf8' )
} ) )

const sources = [
    '../flowmcp-cli/README.md',
    ...docFiles.map( ( f ) => `../flowmcp-cli/docs/${f}` )
]

const frontmatter = buildFrontmatter( {
    generator: 'gen-cli-handbook.mjs',
    sources,
    specVersion: getSpecVersionTag()
} )

const body = [
    '# FlowMCP CLI Handbook',
    '',
    '## README (canonical)',
    '',
    readme,
    docBlocks.length > 0 ? '\n## Additional Docs\n' : '',
    docBlocks.map( ( { file, content } ) => `### docs/${file}\n\n${content}` ).join( '\n\n---\n\n' )
].join( '\n' )

writeFileSync( join( guideRepo, 'knowledge', '04-cli-handbook.md' ), frontmatter + body, 'utf8' )
console.log( `Wrote knowledge/04-cli-handbook.md (${docFiles.length} docs aggregated)` )
