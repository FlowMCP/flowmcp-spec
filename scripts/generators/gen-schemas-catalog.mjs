import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { buildFrontmatter } from './lib/frontmatter.mjs'
import { getReposRoot, getGuideRepoPath } from './lib/config.mjs'

const reposRoot = getReposRoot()
const guideRepo = getGuideRepoPath()

const schemasRepo = join( reposRoot, 'flowmcp-schemas-public' )
const readme = existsSync( join( schemasRepo, 'README.md' ) )
    ? readFileSync( join( schemasRepo, 'README.md' ), 'utf8' )
    : '(README not found)'

const schemasDir = join( schemasRepo, 'schemas' )
const providers = existsSync( schemasDir )
    ? readdirSync( schemasDir, { withFileTypes: true } )
        .filter( ( e ) => e.isDirectory() )
        .map( ( e ) => e.name )
        .sort()
    : []

const sources = [
    '../flowmcp-schemas-public/README.md',
    '../flowmcp-schemas-public/schemas/ (directory scan)'
]

const frontmatter = buildFrontmatter( {
    generator: 'gen-schemas-catalog.mjs',
    sources,
    specVersion: 'v4.0.0'
} )

const body = [
    '# FlowMCP Public Schemas Catalog',
    '',
    '## Overview',
    '',
    readme,
    '',
    `## Top-Level Providers (${providers.length})`,
    '',
    providers.map( ( p ) => `- \`${p}\`` ).join( '\n' ),
    '',
    '## Companion Toolkit',
    '',
    'For GTFS transit data, see the `gtfs-sqlite-toolkit` repository: https://github.com/FlowMCP/gtfs-sqlite-toolkit'
].join( '\n' )

writeFileSync( join( guideRepo, 'knowledge', '08-schemas-public-catalog.md' ), frontmatter + body, 'utf8' )
console.log( `Wrote knowledge/08-schemas-public-catalog.md (${providers.length} providers)` )
