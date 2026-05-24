#!/usr/bin/env node
// generate-docs-payload.mjs — Memo 049 Phase 5 PRD-18
//
// Reads spec/v4.1.0/*.md, adds YAML frontmatter with discovery metadata,
// rewrites cross-references to relative links, and writes the result to
// generated/docs-payload/{NN}-{slug}.md.
//
// Output format documented in:
//   generated/docs-payload/README.md
//   Memo 049 REV-06 Chapter 6


import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )

// Memo 059 PRD-008: spec version is read from package.json (single source of
// truth) — no hardcoded value. Strict mode: fail loudly if missing.
const PKG_PATH = join( REPO, 'package.json' )
const { readFileSync } = await import( 'node:fs' )
const PKG = JSON.parse( readFileSync( PKG_PATH, 'utf-8' ) )
if( typeof PKG.version !== 'string' || PKG.version.length === 0 ) {
    throw new Error( '[generate-docs-payload] package.json#version missing or empty' )
}
const SPEC_VERSION = PKG.version
const SPEC_DIR = join( REPO, `spec/v${ SPEC_VERSION }` )
const PAYLOAD_DIR = join( REPO, 'generated/docs-payload' )
const GENERATOR = 'scripts/generate-docs-payload.mjs'


// Prosaic files (from granularity table — Memo 049 REV-06 Kap. 4.3)
const PROSAIC_FILES = new Set( [
    '00-overview.md',
    '08-migration.md',
    '21-schema-lifecycle.md'
] )


const escapeYamlString = ( { value } ) => {
    // Escape backslash and double-quote for YAML double-quoted strings
    return value
        .replace( /\\/g, '\\\\' )
        .replace( /"/g, '\\"' )
        .replace( /\n/g, ' ' )
}


const extractTitle = ( { content } ) => {
    const match = content.match( /^#\s+(.+?)\s*$/m )
    if( !match ) return null
    // Strip "FlowMCP Specification v4.1.0 — " prefix
    return match[ 1 ].replace( /^FlowMCP Specification v[\d.]+\s*[—-]\s*/, '' ).trim()
}


const extractDescription = ( { content } ) => {
    // Strip frontmatter if any, and strip the conformance note quote
    const lines = content.split( '\n' )
    const candidates = []
    for( let i = 0; i < lines.length; i++ ) {
        const line = lines[ i ].trim()
        if( line === '' ) continue
        if( line.startsWith( '#' ) ) continue
        if( line.startsWith( '>' ) ) continue
        if( line.startsWith( '---' ) ) continue
        if( line.startsWith( '|' ) ) continue
        if( line.startsWith( '```' ) ) continue
        // First substantive paragraph
        candidates.push( line )
        break
    }
    if( candidates.length === 0 ) return ''
    let desc = candidates[ 0 ]
    // Truncate to 200 chars at word boundary
    if( desc.length > 200 ) {
        desc = desc.slice( 0, 200 ).replace( /\s+\S*$/, '' ) + '...'
    }
    return desc
}


const rewriteCrossRefs = ( { content } ) => {
    // Rewrite "see N-name.md" → "[N-name](./N-name.md)"
    // Skip code blocks and existing markdown links
    let result = content
    // Match "see `NN-name.md`" or "see NN-name.md" — consume both backticks if present
    result = result.replace(
        /\bsee\s+(`)?(\d{2}-[a-z][a-z0-9-]*)\.md\1/g,
        ( match, _backtick, slug ) => `see [${ slug }](./${ slug }.md)`
    )
    // Also catch bare "see NN-name.md" without backticks
    result = result.replace(
        /\bsee\s+(\d{2}-[a-z][a-z0-9-]*)\.md\b/g,
        ( match, slug ) => `see [${ slug }](./${ slug }.md)`
    )
    // Memo 059 PRD-008 (D3 + D4): the docs site renders Starlight slugs
    // (e.g. /specification/overview/) — a literal "./00-overview.md" relative
    // link in the markdown would 404 in the browser. Rewrite the
    // conformance-blockquote link to the actual rendered route AND deep-link
    // to the Conformance Language heading so the user lands directly on the
    // relevant section.
    result = result.replace(
        /\[00-overview\.md\]\(\.\/00-overview\.md\)\s+\(Conformance Language\)/g,
        '[Conformance Language](/specification/overview/#conformance-language)'
    )
    // Plain mentions like "13-resources.md" without context — leave as is
    // (the file resolves locally in docs-payload/)
    return result
}


const slugFromFilename = ( { filename } ) => {
    // "13-resources.md" → "resources"
    return filename.replace( /^\d+-/, '' ).replace( /\.md$/, '' )
}


const orderFromFilename = ( { filename } ) => {
    const match = filename.match( /^(\d+)-/ )
    return match ? parseInt( match[ 1 ], 10 ) : 999
}


const buildFrontmatter = ( { filename, title, description, normative, now, sourceCommit } ) => {
    const relativeSourcePath = `spec/v${ SPEC_VERSION }/${ filename }`
    const sourceUrl = `https://github.com/FlowMCP/flowmcp-spec/blob/${ sourceCommit }/${ relativeSourcePath }`
    const lines = []
    lines.push( '---' )
    lines.push( `title: "${ escapeYamlString( { value: title } ) }"` )
    lines.push( `description: "${ escapeYamlString( { value: description } ) }"` )
    lines.push( `spec_version: "${ SPEC_VERSION }"` )
    lines.push( `spec_file: "${ filename }"` )
    lines.push( `order: ${ orderFromFilename( { filename } ) }` )
    lines.push( 'section: "Specification"' )
    lines.push( `normative: ${ normative }` )
    lines.push( `source_commit: "${ sourceCommit }"` )
    lines.push( `source_url: "${ sourceUrl }"` )
    lines.push( `generated_at: "${ now }"` )
    lines.push( `generated_from: "${ relativeSourcePath }"` )
    lines.push( `generator: "${ GENERATOR }"` )
    lines.push( `edit_warning: "This file is auto-generated. Source: ${ relativeSourcePath }."` )
    lines.push( '---' )
    return lines.join( '\n' ) + '\n'
}


const generateFile = async ( { filename, now, sourceCommit } ) => {
    const sourcePath = join( SPEC_DIR, filename )
    const content = await readFile( sourcePath, 'utf-8' )

    const title = extractTitle( { content } ) || filename
    const description = extractDescription( { content } )
    const normative = !PROSAIC_FILES.has( filename )

    const frontmatter = buildFrontmatter( { filename, title, description, normative, now, sourceCommit } )
    const bodyRewritten = rewriteCrossRefs( { content } )

    // Memo 059 PRD-008 (D1 + D2 + D5): Strip the leading H1 — Starlight
    // renders the page title from the frontmatter, so the body H1 was a
    // duplicate that also carried a stale "v4.0.0" version string (D2).
    // Removing it eliminates both the duplicated heading and the version
    // inconsistency, and trims the "extra paragraph" feel under the header.
    const body = bodyRewritten.replace( /^#\s+.+?\n+/, '' )

    const output = frontmatter + '\n' + body

    const targetPath = join( PAYLOAD_DIR, filename )
    await writeFile( targetPath, output, 'utf-8' )
    return { filename, title, normative, descLength: description.length }
}


const main = async () => {
    await mkdir( PAYLOAD_DIR, { recursive: true } )

    let sourceCommit
    try {
        sourceCommit = execSync( 'git rev-parse HEAD', { cwd: REPO } )
            .toString()
            .trim()
            .slice( 0, 7 )
    } catch( err ) {
        console.error( '[ERROR] Failed to determine source_commit via git rev-parse HEAD.' )
        console.error( '[ERROR] Aborting docs-payload generation. Run inside a git repository.' )
        process.exit( 1 )
    }

    const allFiles = await readdir( SPEC_DIR )
    const specFiles = allFiles
        .filter( ( f ) => /^\d{2}-/.test( f ) && f.endsWith( '.md' ) )
        .sort()

    const now = new Date().toISOString()
    const results = []

    console.log( `Generating docs-payload from ${ specFiles.length } spec files (source_commit=${ sourceCommit })...` )
    for( const filename of specFiles ) {
        const result = await generateFile( { filename, now, sourceCommit } )
        results.push( result )
        console.log( `  ✓ ${ filename } → ${ result.title }` )
    }

    console.log( `\nGenerated ${ results.length } files in ${ PAYLOAD_DIR }` )
    console.log( `Normative: ${ results.filter( ( r ) => r.normative ).length }, Prosaic: ${ results.filter( ( r ) => !r.normative ).length }` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
