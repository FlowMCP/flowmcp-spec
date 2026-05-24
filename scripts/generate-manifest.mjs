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
import { spawn } from 'node:child_process'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
const SPEC_DIR = join( REPO, 'spec/v4.1.0' )
const PAYLOAD_DIR = join( REPO, 'generated/docs-payload' )
const MANIFEST_PATH = join( PAYLOAD_DIR, 'manifest.json' )
const CHECKER = join( REPO, 'skills/spec-quality/evaluator-spec-rfc2119/check.mjs' )
const SPEC_VERSION = '4.1.0'
const GENERATOR = 'scripts/generate-manifest.mjs'


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
        }
    }

    await writeFile( MANIFEST_PATH, JSON.stringify( manifest, null, 4 ) + '\n', 'utf-8' )
    console.log( `\nManifest written to ${ MANIFEST_PATH }` )
    console.log( `Total: ${ manifest.stats.total_files }, Normative: ${ manifest.stats.normative_files }, Prose: ${ manifest.stats.prose_files }, Average grade: ${ manifest.stats.average_grade }` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
