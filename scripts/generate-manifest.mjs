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
// Spec content version is the curated value in data/refs.manual.json
// (spec.currentVersion); package.json#version tracks the npm package and may
// diverge from the published spec content directory (#79).
const SPEC_VERSION = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf8' ) ).spec.currentVersion
const SPEC_DIR = join( REPO, `spec/v${ SPEC_VERSION }` )
const PAYLOAD_DIR = join( REPO, 'generated/docs-payload' )
const GRADING_PAYLOAD_DIR = join( PAYLOAD_DIR, 'grading' )
const BEST_PRACTICE_PAYLOAD_DIR = join( PAYLOAD_DIR, 'best-practice' )
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


// Memo 144 K5 (T4): the six FlowMCP primitives get their own sidebar group,
// pulled out of the flat "Core Specification" bucket. Orders map to:
//   02 Parameters · 06 Agents · 13 Resources · 14 Skills · 17 Selections · 18 Prompt Placeholders (Prefill)
const PRIMITIVE_ORDERS = new Set( [ 2, 6, 13, 14, 17, 18 ] )

// Sidebar mapping (PRD-06): groups filenames into UI-Sidebar buckets
// 00         -> introduction (overview + philosophy)
// primitives -> the six primitive chapters (Memo 144 T4)
// 01-19      -> specification (remaining core normative chapters)
// 20-23      -> guides (validation strategy, lifecycle, scoring, license)
const sidebarGroupFromFilename = ( { filename } ) => {
    // Memo 144 K10 (T12): the philosophy chapter is an informative worldview page;
    // it sits in Introduction right after the overview.
    if( filename === '24-philosophy.md' ) return 'introduction'
    const match = filename.match( /^(\d{2})-/ )
    if( !match ) return 'specification'
    const order = parseInt( match[ 1 ], 10 )
    if( order === 0 ) return 'introduction'
    if( PRIMITIVE_ORDERS.has( order ) ) return 'primitives'
    if( order >= 20 ) return 'guides'
    return 'specification'
}


// Per-group default collapsed-state
const COLLAPSED_DEFAULT = {
    introduction: false,
    primitives: false,
    specification: false,
    guides: true
}


// Explicit version_added overrides for files that did not exist in 4.0.0.
// Default is 4.0.0 (hardcopy from v4.0.0). Add entries here when new files
// land in 4.1.0 or later.
const VERSION_ADDED_OVERRIDES = {
    '24-philosophy.md': '4.3.0'
}


const versionAddedFromFilename = ( { filename } ) => {
    if( VERSION_ADDED_OVERRIDES[ filename ] ) return VERSION_ADDED_OVERRIDES[ filename ]
    return '4.0.0'
}


// Memo 087 PRD-P2-C (F4=A): grading sidebar groups. The grading spec rendered as
// a flat list; group it like the spec does. Mapping by chapter order:
//   00-01 introduction · 02-08 core-model · 09-14,18,25 process-contracts
//   15-17,19-24 reference
const GRADING_PROCESS_CONTRACTS = new Set( [ 9, 10, 11, 12, 13, 14, 18, 25 ] )

const gradingSidebarGroupFromFilename = ( { filename } ) => {
    const match = filename.match( /^(\d{2})-/ )
    if( !match ) return 'reference'
    const order = parseInt( match[ 1 ], 10 )
    if( order <= 1 ) return 'introduction'
    if( order <= 8 ) return 'core-model'
    if( GRADING_PROCESS_CONTRACTS.has( order ) ) return 'process-contracts'
    return 'reference'
}


const GRADING_COLLAPSED_DEFAULT = {
    introduction: false,
    'core-model': false,
    'process-contracts': true,
    reference: true
}


// Memo 108: best-practice sidebar groups. The overview lives under Introduction;
// the five areas (10+) under Schema Creation.
//   <10 introduction · 10+ schema-creation
const bestPracticeSidebarGroupFromFilename = ( { filename } ) => {
    const match = filename.match( /^(\d{2})-/ )
    if( !match ) return 'schema-creation'
    const order = parseInt( match[ 1 ], 10 )
    if( order < 10 ) return 'introduction'
    return 'schema-creation'
}


const BEST_PRACTICE_COLLAPSED_DEFAULT = {
    introduction: false,
    'schema-creation': false
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
        const sidebarGroup = gradingSidebarGroupFromFilename( { filename } )
        entries.push( {
            filename,
            slug: slugFromFilename( { filename } ),
            title: fm.title,
            description: fm.description,
            order: fm.order,
            section: fm.section,
            normative: fm.normative,
            sidebar_group: sidebarGroup,
            collapsed: GRADING_COLLAPSED_DEFAULT[ sidebarGroup ] ?? false
        } )
    }

    console.log( `Grading block: ${ entries.length } files (grading_version=${ version })` )
    return { version, files: entries }
}


// Memo 108: additive best-practice block. Scans the best-practice payload subdir
// (a THIRD input) and returns { version, files[] }. Returns null if absent —
// manifest.files stays spec-only and byte-compatible. Mirrors buildGradingBlock.
const buildBestPracticeBlock = async () => {
    let bpFiles
    try {
        const allFiles = await readdir( BEST_PRACTICE_PAYLOAD_DIR )
        bpFiles = allFiles
            .filter( ( f ) => /^\d{2}-/.test( f ) && f.endsWith( '.md' ) )
            .sort()
    } catch( error ) {
        console.warn( `No best-practice payload found — manifest.bestPractice omitted (${ error.message })` )
        return null
    }

    if( bpFiles.length === 0 ) return null

    const entries = []
    let version = null
    for( const filename of bpFiles ) {
        const payloadPath = join( BEST_PRACTICE_PAYLOAD_DIR, filename )
        const payloadContent = await readFile( payloadPath, 'utf-8' )
        const fm = parseFrontmatter( { content: payloadContent } )
        if( !fm ) {
            console.warn( `  ! best-practice/${ filename } — could not parse frontmatter, skipping` )
            continue
        }
        if( !version && typeof fm.best_practice_version === 'string' ) version = fm.best_practice_version
        const sidebarGroup = bestPracticeSidebarGroupFromFilename( { filename } )
        entries.push( {
            filename,
            slug: slugFromFilename( { filename } ),
            title: fm.title,
            description: fm.description,
            order: fm.order,
            section: fm.section,
            normative: fm.normative,
            sidebar_group: sidebarGroup,
            collapsed: BEST_PRACTICE_COLLAPSED_DEFAULT[ sidebarGroup ] ?? false
        } )
    }

    console.log( `Best-practice block: ${ entries.length } files (best_practice_version=${ version })` )
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
    const bestPracticeBlock = await buildBestPracticeBlock()

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

    // Memo 108: additive best-practice block (manifest.files above stays spec-only)
    if( bestPracticeBlock ) {
        manifest.bestPractice = bestPracticeBlock
        manifest.sections.push( { name: 'Best Practice', file_count: bestPracticeBlock.files.length, order: 3 } )
    }

    await writeFile( MANIFEST_PATH, JSON.stringify( manifest, null, 4 ) + '\n', 'utf-8' )
    console.log( `\nManifest written to ${ MANIFEST_PATH }` )
    console.log( `Total: ${ manifest.stats.total_files }, Normative: ${ manifest.stats.normative_files }, Prose: ${ manifest.stats.prose_files }, Average grade: ${ manifest.stats.average_grade }` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
