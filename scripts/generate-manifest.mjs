#!/usr/bin/env node
// generate-manifest.mjs — FlowMCP docs-payload cross-family manifest (Memo 060 P5 adoption).
//
// Ported from memo-init repos/spec and generalized: reads <name>/<version>/dist/spec/**/*.md,
// parses each frontmatter, and writes the root-level manifest.json summarizing every family
// discovered under <name>/spec.json (specification, grading, best-practice).
//
// Each family's sidebar sub-category grouping is NOT hardcoded here (the three former per-order
// maps are dissolved). The single source is the per-version spec-manifest.json on the spec level
// (<specDir>/spec-manifest.json), read by this build AND the public site AND the Spec Viewer. A
// chapter's sidebar_group is the id of the manifest group whose pages[] lists it; an unlisted
// chapter falls back to the manifest's first group.
//
// Output format documented in README.md (Layout section).

import { readdir, readFile, writeFile, copyFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { discoverSpecs } from './lib/discover-specs.mjs'
import { readSpecManifest, groupForFile } from './lib/spec-manifest.mjs'
import { buildStamp } from './lib/build-stamp.mjs'
import { distSpecDir, distDataDir, aggregatePath } from './lib/layout.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
// Workshop flat layout (Memo 064 FM-S5): the cross-namespace docs-payload manifest is an aggregate,
// so it lives at the container root, not under a top-level dist/ dir.
const MANIFEST_PATH = aggregatePath( { repoRoot: REPO, file: 'manifest.json' } )
const GENERATOR = 'scripts/generate-manifest.mjs'
// Schema-registry stats (Memo 061 P4 restore of #45/Memo 059 Phase 4): flowmcp-schemas-public is
// the source of truth for schema/tool/datasource counts — never the docs-payload manifest's own
// file-count stats block below. Consumed by flowmcp.github.io/scripts/fetch-refs.mjs via
// manifest.meta.stats (Single-Source-of-Truth, Memo 059 Phase 4 PRD-017).
const STATS_URL = 'https://raw.githubusercontent.com/FlowMCP/flowmcp-schemas-public/main/stats.json'
const STATS_FETCH_TIMEOUT_MS = 10000
const STATS_NULL_BLOCK = {
    count_schemas: null,
    count_unique_datasources: null,
    count_tools: null,
    count_resources: null,
    count_skills: null,
    timestamp: null,
    schema_version: null,
    build_hash: null
}

const FAMILIES = discoverSpecs( { repoRoot: REPO } )


const fetchStats = async () => {
    const controller = new AbortController()
    const timer = setTimeout( () => controller.abort(), STATS_FETCH_TIMEOUT_MS )
    try {
        const response = await fetch( STATS_URL, { signal: controller.signal } )
        if( !response.ok ) {
            throw new Error( `HTTP ${ response.status }` )
        }
        const stats = await response.json()
        return { stats, source: 'fetch' }
    } catch( error ) {
        console.warn( `Stats fetch failed: ${ error.message }` )
        return { stats: null, source: 'fetch-failed' }
    } finally {
        clearTimeout( timer )
    }
}


const readPreviousStats = async ( { manifestPath } ) => {
    try {
        const previous = JSON.parse( await readFile( manifestPath, 'utf-8' ) )
        if( previous?.meta?.stats ) {
            return previous.meta.stats
        }
        return null
    } catch( error ) {
        console.warn( `No previous manifest available: ${ error.message }` )
        return null
    }
}


const getStats = async ( { manifestPath } ) => {
    const { stats: fetched } = await fetchStats()
    if( fetched ) {
        return fetched
    }
    const previous = await readPreviousStats( { manifestPath } )
    if( previous ) {
        console.warn( 'Stats fetch failed, using fallback from previous payload' )
        return previous
    }
    console.warn( 'No stats available — using null placeholders' )
    return STATS_NULL_BLOCK
}


const parseFrontmatter = ( { content } ) => {
    const match = content.match( /^---\n([\s\S]*?)\n---/ )
    if( !match ) return null
    const frontmatter = {}
    const lines = match[ 1 ].split( '\n' )
    lines.forEach( ( line ) => {
        const kv = line.match( /^([a-zA-Z_]+):\s*(.*)$/ )
        if( !kv ) return
        const key = kv[ 1 ]
        let value = kv[ 2 ].trim()
        if( /^".*"$/.test( value ) ) {
            value = value.slice( 1, -1 ).replace( /\\"/g, '"' )
        } else if( value === 'true' ) {
            value = true
        } else if( value === 'false' ) {
            value = false
        } else if( /^\d+$/.test( value ) ) {
            value = parseInt( value, 10 )
        }
        frontmatter[ key ] = value
    } )

    return frontmatter
}


const slugFromFilename = ( { filename } ) => filename.replace( /^\d+-/, '' ).replace( /\.md$/, '' )


const loadFamilyManifest = ( { specDir, label } ) => {
    const result = readSpecManifest( { specDir: join( REPO, specDir ) } )
    if( !result.found ) {
        console.warn( `  ! ${ label }: spec-manifest not found (${ result.messages.join( '; ' ) }) — grouping degrades to first group` )
    }

    return result
}


const makeGroupFn = ( { manifest } ) => {
    const fallback = manifest.groups.length > 0 ? manifest.groups[ 0 ].id : 'introduction'

    return ( { filename } ) => groupForFile( { groups: manifest.groups, filename } ) ?? fallback
}


const collectEntries = async ( { dir, groupFn, label } ) => {
    let names
    try {
        const all = await readdir( dir )
        names = all
            .filter( ( f ) => /^\d{2}-/.test( f ) && f.endsWith( '.md' ) )
            .sort()
    } catch( error ) {
        console.warn( `No payload found in ${ dir } (${ error.message })` )

        return []
    }

    const collected = await Promise.all( names.map( async ( filename ) => {
        const payloadContent = await readFile( join( dir, filename ), 'utf-8' )
        const fm = parseFrontmatter( { content: payloadContent } )
        if( !fm ) {
            console.warn( `  ! ${ label }/${ filename } — could not parse frontmatter, skipping` )

            return null
        }
        console.log( `  ✓ ${ label }/${ filename } — ${ fm.title }` )

        return {
            filename,
            slug: slugFromFilename( { filename } ),
            title: fm.title,
            description: fm.description,
            order: fm.order,
            section: fm.section,
            normative: fm.normative,
            sidebar_group: groupFn( { filename } )
        }
    } ) )

    return collected.filter( ( entry ) => entry !== null )
}


const buildFamilyBlock = async ( { family } ) => {
    const manifest = loadFamilyManifest( { specDir: family.specDir, label: family.name } )
    const groupFn = makeGroupFn( { manifest } )
    const dir = distSpecDir( { repoRoot: REPO, name: family.name, version: family.version } )
    const files = await collectEntries( { dir, groupFn, label: family.name } )

    return {
        name: family.name,
        title: family.namespace,
        namespaceToken: manifest.namespaceToken ?? null,
        version: family.version,
        docEntry: family.docEntry,
        sidebar: family.manifestMeta,
        files
    }
}


const copySpecManifestsToPayload = async () => {
    await Promise.all( FAMILIES.map( async ( family ) => {
        const src = join( REPO, family.specDir, 'spec-manifest.json' )
        if( !existsSync( src ) ) {
            console.warn( `  ! ${ family.name }: no spec-manifest.json at ${ src } — site sidebar will fall back` )

            return
        }
        const dataDir = distDataDir( { repoRoot: REPO, name: family.name, version: family.version } )
        await mkdir( dataDir, { recursive: true } )
        await copyFile( src, join( dataDir, 'spec-manifest.json' ) )
        console.log( `  ✓ spec-manifest → ${ join( dataDir, 'spec-manifest.json' ).replace( REPO + '/', '' ) }` )
    } ) )
}


const main = async () => {
    const specFamily = FAMILIES.find( ( family ) => family.name === 'specification' )
    const stamp = buildStamp( { version: specFamily?.version ?? null, cwd: REPO } )

    console.log( 'Building manifest from docs-payload...' )
    const families = await Promise.all( FAMILIES.map( ( family ) => buildFamilyBlock( { family } ) ) )
    const allFiles = families.flatMap( ( f ) => f.files )
    const schemaStats = await getStats( { manifestPath: MANIFEST_PATH } )

    const manifest = {
        version: stamp.version,
        sha: stamp.sha,
        generated_at: stamp.generated_at,
        generator: GENERATOR,
        families,
        stats: {
            total_files: allFiles.length,
            family_count: families.length,
            per_family: Object.fromEntries( families.map( ( f ) => [ f.name, f.files.length ] ) ),
            normative_files: allFiles.filter( ( f ) => f.normative ).length,
            informative_files: allFiles.filter( ( f ) => !f.normative ).length
        },
        meta: {
            stats: schemaStats
        }
    }

    await mkdir( dirname( MANIFEST_PATH ), { recursive: true } )
    await writeFile( MANIFEST_PATH, JSON.stringify( manifest, null, 4 ) + '\n', 'utf-8' )
    console.log( `\nManifest written to ${ MANIFEST_PATH.replace( REPO + '/', '' ) }` )
    console.log( `Total: ${ manifest.stats.total_files } across ${ manifest.stats.family_count } families; Normative: ${ manifest.stats.normative_files }, Informative: ${ manifest.stats.informative_files }` )

    await copySpecManifestsToPayload()
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
