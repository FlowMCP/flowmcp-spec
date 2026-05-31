#!/usr/bin/env node
// generate-docs-payload.mjs — Memo 049 Phase 5 PRD-18; Memo 086 PRD-06 (grading second source)
//
// Reads spec/v<version>/*.md AND grading/<version>/*.md, adds YAML frontmatter with
// discovery metadata, rewrites cross-references to relative links, and writes the
// result to generated/docs-payload/{NN}-{slug}.md (spec) and
// generated/docs-payload/grading/{NN}-{slug}.md (grading).
//
// Single-Payload (Memo 081/086): the grading spec is a SECOND INPUT, not a second
// output. Spec output is unchanged; grading is emitted additively into a subdir.
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
const GRADING_ROOT = join( REPO, 'grading' )
const GRADING_PAYLOAD_DIR = join( PAYLOAD_DIR, 'grading' )
const GENERATOR = 'scripts/generate-docs-payload.mjs'


// Prosaic files (from granularity table — Memo 049 REV-06 Kap. 4.3)
const PROSAIC_FILES = new Set( [
    '00-overview.md',
    '08-migration.md',
    '21-schema-lifecycle.md'
] )


// Grading prosaic files — the grading overview is conceptual prose.
const GRADING_PROSAIC_FILES = new Set( [
    '00-overview.md'
] )


// Memo 086 PRD-06: grading version is the highest semver folder under grading/
// (no hardcode — follows whatever the released grading spec is).
const pickMaxSemverDir = ( { names } ) => {
    const semverDirs = names
        .filter( ( name ) => /^\d+\.\d+\.\d+$/.test( name ) )
        .sort( ( a, b ) => a.localeCompare( b, undefined, { numeric: true } ) )
    return semverDirs.length > 0 ? semverDirs.at( -1 ) : null
}


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


const buildFrontmatter = ( { filename, title, description, normative, now, sourceCommit, section, versionField, version, sourceRelBase } ) => {
    const relativeSourcePath = `${ sourceRelBase }/${ filename }`
    const sourceUrl = `https://github.com/FlowMCP/flowmcp-spec/blob/${ sourceCommit }/${ relativeSourcePath }`
    const lines = []
    lines.push( '---' )
    lines.push( `title: "${ escapeYamlString( { value: title } ) }"` )
    lines.push( `description: "${ escapeYamlString( { value: description } ) }"` )
    lines.push( `${ versionField }: "${ version }"` )
    lines.push( `spec_file: "${ filename }"` )
    lines.push( `order: ${ orderFromFilename( { filename } ) }` )
    lines.push( `section: "${ section }"` )
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


const generateFile = async ( { filename, now, sourceCommit, sourceDir, targetDir, prosaicFiles, section, versionField, version, sourceRelBase } ) => {
    const sourcePath = join( sourceDir, filename )
    const content = await readFile( sourcePath, 'utf-8' )

    const title = extractTitle( { content } ) || filename
    const description = extractDescription( { content } )
    const normative = !prosaicFiles.has( filename )

    const frontmatter = buildFrontmatter( { filename, title, description, normative, now, sourceCommit, section, versionField, version, sourceRelBase } )
    const bodyRewritten = rewriteCrossRefs( { content } )

    // Memo 059 PRD-008 (D1 + D2 + D5): Strip the leading H1 — Starlight
    // renders the page title from the frontmatter, so the body H1 was a
    // duplicate that also carried a stale "v4.0.0" version string (D2).
    // Removing it eliminates both the duplicated heading and the version
    // inconsistency, and trims the "extra paragraph" feel under the header.
    const body = bodyRewritten.replace( /^#\s+.+?\n+/, '' )

    const output = frontmatter + '\n' + body

    const targetPath = join( targetDir, filename )
    await writeFile( targetPath, output, 'utf-8' )
    return { filename, title, normative, descLength: description.length }
}


const generatePass = async ( { label, sourceDir, targetDir, prosaicFiles, section, versionField, version, sourceRelBase, now, sourceCommit } ) => {
    await mkdir( targetDir, { recursive: true } )
    const allFiles = await readdir( sourceDir )
    const docFiles = allFiles
        .filter( ( f ) => /^\d{2}-/.test( f ) && f.endsWith( '.md' ) )
        .sort()

    console.log( `Generating ${ label } payload from ${ docFiles.length } files (version=${ version }, source_commit=${ sourceCommit })...` )
    const results = []
    for( const filename of docFiles ) {
        const result = await generateFile( { filename, now, sourceCommit, sourceDir, targetDir, prosaicFiles, section, versionField, version, sourceRelBase } )
        results.push( result )
        console.log( `  ✓ ${ filename } → ${ result.title }` )
    }
    return results
}


const main = async () => {
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

    const now = new Date().toISOString()

    // --- Spec pass (unchanged output) ---
    const specResults = await generatePass( {
        label: 'spec',
        sourceDir: SPEC_DIR,
        targetDir: PAYLOAD_DIR,
        prosaicFiles: PROSAIC_FILES,
        section: 'Specification',
        versionField: 'spec_version',
        version: SPEC_VERSION,
        sourceRelBase: `spec/v${ SPEC_VERSION }`,
        now,
        sourceCommit
    } )

    console.log( `\nGenerated ${ specResults.length } spec files in ${ PAYLOAD_DIR }` )
    console.log( `Normative: ${ specResults.filter( ( r ) => r.normative ).length }, Prosaic: ${ specResults.filter( ( r ) => !r.normative ).length }` )

    // --- Grading pass (Memo 086 PRD-06 — additive second source) ---
    let gradingResults = []
    let gradingVersion = null
    try {
        const gradingDirs = await readdir( GRADING_ROOT )
        gradingVersion = pickMaxSemverDir( { names: gradingDirs } )
    } catch( err ) {
        console.warn( `\nNo grading/ folder found — skipping grading pass (${ err.message })` )
    }

    if( gradingVersion ) {
        gradingResults = await generatePass( {
            label: 'grading',
            sourceDir: join( GRADING_ROOT, gradingVersion ),
            targetDir: GRADING_PAYLOAD_DIR,
            prosaicFiles: GRADING_PROSAIC_FILES,
            section: 'Grading',
            versionField: 'grading_version',
            version: gradingVersion,
            sourceRelBase: `grading/${ gradingVersion }`,
            now,
            sourceCommit
        } )
        console.log( `\nGenerated ${ gradingResults.length } grading files in ${ GRADING_PAYLOAD_DIR } (grading_version=${ gradingVersion })` )
    } else {
        console.warn( '\nNo semver grading folder — grading pass skipped.' )
    }
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
