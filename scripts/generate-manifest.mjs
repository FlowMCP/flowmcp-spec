#!/usr/bin/env node
// generate-manifest.mjs — Memo 049 Phase 5 PRD-19
//
// Reads generated/docs-payload/*.md, parses each frontmatter, runs the
// evaluator-spec-rfc2119 to attach a quality grade, and writes a manifest.json
// summarizing all files.
//
// Output format documented in:
//   generated/docs-payload/README.md
//   Memo 049 REV-06 Chapter 6.4


import { readdir, readFile, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
// Memo 086 PRD-01: version is the single source of truth in package.json (no hardcode)
const SPEC_VERSION = JSON.parse( readFileSync( join( REPO, 'package.json' ), 'utf8' ) ).version
const SPEC_DIR = join( REPO, `spec/v${ SPEC_VERSION }` )
const PAYLOAD_DIR = join( REPO, 'generated/docs-payload' )
const GRADING_PAYLOAD_DIR = join( PAYLOAD_DIR, 'grading' )
const MANIFEST_PATH = join( PAYLOAD_DIR, 'manifest.json' )
const CHECKER = join( REPO, 'skills/spec-quality/evaluator-spec-rfc2119/check.mjs' )
const GENERATOR = 'scripts/generate-manifest.mjs'
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
    for( const line of lines ) {
        const kv = line.match( /^([a-zA-Z_]+):\s*(.*)$/ )
        if( !kv ) continue
        const key = kv[ 1 ]
        let value = kv[ 2 ].trim()
        // Strip quotes
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
    }
    return frontmatter
}


const runChecker = ( { filePath } ) => {
    return new Promise( ( resolve_ ) => {
        const child = spawn( 'node', [ CHECKER, '--json', filePath ] )
        let stdout = ''
        child.stdout.on( 'data', ( chunk ) => { stdout += chunk.toString() } )
        child.on( 'close', ( code ) => {
            if( code !== 0 ) {
                resolve_( { grade: null, issues: 0 } )
                return
            }
            try {
                const result = JSON.parse( stdout )
                const errors = result.issues.filter( ( i ) => i.severity === 'error' ).length
                const warnings = result.issues.filter( ( i ) => i.severity === 'warning' ).length
                resolve_( { grade: result.grade, issues: errors + warnings } )
            } catch{
                resolve_( { grade: null, issues: 0 } )
            }
        } )
    } )
}


const slugFromFilename = ( { filename } ) => {
    return filename.replace( /^\d+-/, '' ).replace( /\.md$/, '' )
}


// Sidebar mapping (PRD-06): groups filenames into UI-Sidebar buckets
// 00         -> introduction (single overview)
// 01-19      -> specification (core normative chapters)
// 20-23      -> guides (validation strategy, lifecycle, scoring, license)
const sidebarGroupFromFilename = ( { filename } ) => {
    const match = filename.match( /^(\d{2})-/ )
    if( !match ) return 'specification'
    const order = parseInt( match[ 1 ], 10 )
    if( order === 0 ) return 'introduction'
    if( order >= 20 ) return 'guides'
    return 'specification'
}


// Per-group default collapsed-state
const COLLAPSED_DEFAULT = {
    introduction: false,
    specification: false,
    guides: true
}


// Explicit version_added overrides for files that did not exist in 4.0.0.
// Default is 4.0.0 (hardcopy from v4.0.0). Add entries here when new files
// land in 4.1.0 or later.
const VERSION_ADDED_OVERRIDES = {}


const versionAddedFromFilename = ( { filename } ) => {
    if( VERSION_ADDED_OVERRIDES[ filename ] ) return VERSION_ADDED_OVERRIDES[ filename ]
    return '4.0.0'
}


// Memo 086 PRD-06: additive grading block. Scans the grading payload subdir
// (a SECOND input) and returns { version, files[] }. Returns null if absent —
// manifest.files stays spec-only and byte-compatible (081 F8=A).
const buildGradingBlock = async () => {
    let gradingFiles
    try {
        const allFiles = await readdir( GRADING_PAYLOAD_DIR )
        gradingFiles = allFiles
            .filter( ( f ) => /^\d{2}-/.test( f ) && f.endsWith( '.md' ) )
            .sort()
    } catch( error ) {
        console.warn( `No grading payload found — manifest.grading omitted (${ error.message })` )
        return null
    }

    if( gradingFiles.length === 0 ) return null

    const entries = []
    let version = null
    for( const filename of gradingFiles ) {
        const payloadPath = join( GRADING_PAYLOAD_DIR, filename )
        const payloadContent = await readFile( payloadPath, 'utf-8' )
        const fm = parseFrontmatter( { content: payloadContent } )
        if( !fm ) {
            console.warn( `  ! grading/${ filename } — could not parse frontmatter, skipping` )
            continue
        }
        if( !version && typeof fm.grading_version === 'string' ) version = fm.grading_version
        entries.push( {
            filename,
            slug: slugFromFilename( { filename } ),
            title: fm.title,
            description: fm.description,
            order: fm.order,
            section: fm.section,
            normative: fm.normative
        } )
    }

    console.log( `Grading block: ${ entries.length } files (grading_version=${ version })` )
    return { version, files: entries }
}


const main = async () => {
    const allFiles = await readdir( PAYLOAD_DIR )
    const docFiles = allFiles
        .filter( ( f ) => /^\d{2}-/.test( f ) && f.endsWith( '.md' ) )
        .sort()

    const now = new Date().toISOString()
    const fileEntries = []
    let totalGrade = 0
    let gradeCount = 0
    let normativeCount = 0
    let proseCount = 0

    console.log( `Building manifest from ${ docFiles.length } docs-payload files...` )
    for( const filename of docFiles ) {
        const payloadPath = join( PAYLOAD_DIR, filename )
        const payloadContent = await readFile( payloadPath, 'utf-8' )
        const fm = parseFrontmatter( { content: payloadContent } )
        if( !fm ) {
            console.warn( `  ! ${ filename } — could not parse frontmatter, skipping` )
            continue
        }

        // Grade the SOURCE spec file (not the payload — payload has frontmatter)
        const sourcePath = join( SPEC_DIR, filename )
        const { grade, issues } = await runChecker( { filePath: sourcePath } )

        const sidebarGroup = sidebarGroupFromFilename( { filename } )
        const entry = {
            filename,
            slug: slugFromFilename( { filename } ),
            title: fm.title,
            description: fm.description,
            order: fm.order,
            section: fm.section,
            normative: fm.normative,
            sidebar_group: sidebarGroup,
            version_added: versionAddedFromFilename( { filename } ),
            collapsed: COLLAPSED_DEFAULT[ sidebarGroup ] ?? false,
            spec_quality: { grade, issues }
        }
        fileEntries.push( entry )

        if( grade !== null ) {
            totalGrade += grade
            gradeCount++
        }
        if( fm.normative ) normativeCount++
        else proseCount++

        console.log( `  ✓ ${ filename } — grade ${ grade } (${ issues } issues)` )
    }

    const schemaStats = await getStats( { manifestPath: MANIFEST_PATH } )
    const gradingBlock = await buildGradingBlock()

    const manifest = {
        spec_version: SPEC_VERSION,
        generated_at: now,
        generator: GENERATOR,
        files: fileEntries,
        sections: [
            { name: 'Specification', file_count: fileEntries.length, order: 1 }
        ],
        stats: {
            total_files: fileEntries.length,
            normative_files: normativeCount,
            prose_files: proseCount,
            average_grade: gradeCount > 0 ? Number( ( totalGrade / gradeCount ).toFixed( 2 ) ) : null
        },
        meta: {
            stats: schemaStats
        }
    }

    // Memo 086 PRD-06: additive grading block (manifest.files above stays spec-only)
    if( gradingBlock ) {
        manifest.grading = gradingBlock
        manifest.sections.push( { name: 'Grading', file_count: gradingBlock.files.length, order: 2 } )
    }

    await writeFile( MANIFEST_PATH, JSON.stringify( manifest, null, 4 ) + '\n', 'utf-8' )
    console.log( `\nManifest written to ${ MANIFEST_PATH }` )
    console.log( `Total: ${ manifest.stats.total_files }, Normative: ${ manifest.stats.normative_files }, Prose: ${ manifest.stats.prose_files }, Average grade: ${ manifest.stats.average_grade }` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
