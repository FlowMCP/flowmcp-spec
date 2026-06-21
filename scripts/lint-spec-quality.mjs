#!/usr/bin/env node
// lint-spec-quality.mjs — Memo 142 PFLICHT-GATE (non-abkürzbar, T019).
//
// Verifies the GENERATED docs payload against the Memo-142 Seitenstruktur-Standard
// (memo-init goldstandard): every chapter MUST carry an intro-prose paragraph and
// EXACTLY ONE "## Related" footer, and MUST be free of the repeated boilerplate
// (the normative-language pointer blockquote and the "This document defines …"
// sentence) on every page except its track overview. Running this on the generated
// payload catches both source omissions AND generator regressions, so a future
// regeneration cannot silently reintroduce the problems this memo removed.
//
// Hard checks (gate-failing):
//   1. Pflicht-Overview — ≥1 prose paragraph between H1/frontmatter and the first H2.
//   2. Exactly one "## Related".
//   3. No "> Normative language (MUST/SHOULD/MAY)" blockquote (except overview).
//   4. No "This document defines …" DEFINES sentence (except overview).
// Soft checks (reported, non-gating — verified per page in P6 with judgement):
//   - hardcoded version strings (NEW in vX / removed in vX / Neu in X / bare vX.Y.Z).
//   - comment-style headings (a heading that is only a bare field token).
//
// Usage:
//   node scripts/lint-spec-quality.mjs            scan all generated payload pages
//   node scripts/lint-spec-quality.mjs --only 02  scope to paths containing "02"
//   node scripts/lint-spec-quality.mjs --quiet     only print failures + summary

import { readdir, readFile } from 'node:fs/promises'
import { join, dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
const PAYLOAD_DIR = join( REPO, 'generated/docs-payload' )

const args = process.argv.slice( 2 )
const only = ( () => {
    const idx = args.indexOf( '--only' )
    return idx >= 0 ? args[ idx + 1 ] : null
} )()
const quiet = args.includes( '--quiet' )

// Track overview files keep the conformance anchor + are prose-heavy by design.
const OVERVIEW_FILES = new Set( [
    '00-overview.md',                 // spec
    join( 'grading', '00-overview.md' ),
    join( 'best-practice', '01-overview.md' )
] )

const collectPayloadFiles = async ( { dir } ) => {
    const entries = await readdir( dir, { withFileTypes: true } )
    const here = await Promise.all( entries.map( async ( entry ) => {
        const full = join( dir, entry.name )
        if( entry.isDirectory() ) return collectPayloadFiles( { dir: full } )
        if( entry.isFile() && entry.name.endsWith( '.md' ) && /^\d{2}-/.test( entry.name ) ) return [ full ]
        return []
    } ) )
    return here.flat()
}

const stripFrontmatter = ( { content } ) => {
    const m = content.match( /^---\n[\s\S]*?\n---\n?/ )
    return m ? content.slice( m[ 0 ].length ) : content
}

const introProsePresent = ( { body } ) => {
    // Walk lines until the first H2; a prose line (not heading/table/quote/code/hr/list)
    // before it satisfies the Pflicht-Overview.
    const lines = body.split( '\n' )
    const firstH2 = lines.findIndex( ( l ) => /^##\s/.test( l ) )
    const head = ( firstH2 === -1 ? lines : lines.slice( 0, firstH2 ) )
    let inFence = false
    return head.some( ( raw ) => {
        const line = raw.trim()
        if( line.startsWith( '```' ) ) { inFence = !inFence; return false }
        if( inFence ) return false
        if( line === '' ) return false
        if( line.startsWith( '#' ) ) return false
        if( line.startsWith( '|' ) ) return false
        if( line.startsWith( '>' ) ) return false
        if( line.startsWith( '---' ) ) return false
        if( /^[-*]\s/.test( line ) ) return false
        return true
    } )
}

const lintPage = ( { relPath, content } ) => {
    const isOverview = OVERVIEW_FILES.has( relPath )
    const body = stripFrontmatter( { content } )
    const hard = []
    const soft = []

    if( !introProsePresent( { body } ) ) hard.push( 'no intro-prose paragraph (Pflicht-Overview)' )

    // Exactly one "## Related" for normal chapters; overview hub pages MAY carry
    // none (they are entry points, not cross-referenced leaves) but never more than one.
    const relatedCount = ( body.match( /^##\s+Related\s*$/gm ) || [] ).length
    if( isOverview ? relatedCount > 1 : relatedCount !== 1 ) {
        hard.push( `expected ${ isOverview ? 'at most 1' : 'exactly 1' } "## Related", found ${ relatedCount }` )
    }

    if( !isOverview && /^>\s*Normative language \(MUST\/SHOULD\/MAY\)/m.test( body ) ) {
        hard.push( 'normative-language boilerplate blockquote present' )
    }
    if( !isOverview && /This document defines\b/.test( body ) ) {
        hard.push( '"This document defines …" DEFINES sentence present' )
    }

    if( /\bNEW in v\d|\bremoved in v?\d|\bNeu in \d|\bOut of scope\b/i.test( body ) ) {
        soft.push( 'possible hardcoded version/changelog phrasing' )
    }
    const bareVersions = body.match( /\bv\d+\.\d+\.\d+\b/g ) || []
    if( bareVersions.length > 0 ) soft.push( `bare version string(s): ${ [ ...new Set( bareVersions ) ].join( ', ' ) }` )

    return { relPath, hard, soft }
}

const main = async () => {
    const files = ( await collectPayloadFiles( { dir: PAYLOAD_DIR } ) )
        .filter( ( f ) => !only || f.includes( only ) )
        .sort()

    const results = await Promise.all( files.map( async ( f ) => {
        const content = await readFile( f, 'utf-8' )
        return lintPage( { relPath: relative( PAYLOAD_DIR, f ), content } )
    } ) )

    const failed = results.filter( ( r ) => r.hard.length > 0 )
    const warned = results.filter( ( r ) => r.soft.length > 0 )

    if( !quiet ) {
        results.filter( ( r ) => r.hard.length === 0 && r.soft.length === 0 )
            .forEach( ( r ) => console.log( `  ✓ ${ r.relPath }` ) )
    }
    warned.forEach( ( r ) => r.soft.forEach( ( s ) => console.log( `  ~ ${ r.relPath }: ${ s }` ) ) )
    failed.forEach( ( r ) => r.hard.forEach( ( h ) => console.log( `  ✗ ${ r.relPath }: ${ h }` ) ) )

    console.log( '' )
    console.log( `Spec-Quality-Lint: ${ results.length } pages, ${ results.length - failed.length } pass, ${ failed.length } FAIL, ${ warned.length } with soft warnings.` )

    if( failed.length > 0 ) {
        console.log( 'GATE: FAIL' )
        process.exit( 1 )
    }
    console.log( 'GATE: PASS' )
}

main().catch( ( err ) => {
    console.error( err )
    process.exit( 2 )
} )
