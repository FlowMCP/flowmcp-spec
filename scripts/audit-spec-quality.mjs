#!/usr/bin/env node
// audit-spec-quality.mjs — idempotent spec-quality gate over ALL FlowMCP spec families
// (specification, grading, best-practice), ported from memo-init repos/spec (Memo 060 P5).
//
// BLOCKING (exit 1) — machine-checkable structural invariants that hold across all families:
//   (H1)          a single `# NN. Title` heading on the first line
//   (META/STATUS) a header metadata table with a `Status` row directly under the H1
//   (PLACEHOLDER) a non-bridge chapter carries the implemented-by placeholder and NOT a
//                 hand-written "## Implemented by" backlink (authored-vs-derived split)
//   (CATEGORY)    one category per chapter — no stem appears in two of the manifest's groups
//   (TOKEN)       a family's spec.json namespaceToken matches its spec-manifest.json token
//   (MARKER)      a top-of-page `Informative` marker uses the exact `**Informative.**` lead
//   (LINK-FORM)   cross-family links are absolute routes, never relative `../…` (SPEC-REQ-002)
//   (INTRO/REL)   intro prose before the first `##` and a bottom `## Related` — BLOCKING for every
//                 family under full adoption (F8=A)
//   (LEAK)        no internal references in outward-facing text — over the numbered pages AND the
//                 chapter-index README of every family
//
// README (repo-level) is exempt from the structural rules; the chapter-index README is leak-scanned.
// Read-only. Exit 0 when everything passes.

import { readdir, readFile } from 'node:fs/promises'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { discoverSpecs } from './lib/discover-specs.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )

const FAMILIES = discoverSpecs( { repoRoot: REPO } )

const NN_RE = /^\d{2}-.*\.md$/
const BRIDGE_RE = /^\d{2}-bridge\.md$/
// F2 Dist-Split placeholder — byte-identical to generate-bridge.mjs / check-bridge-inverse.mjs.
const PLACEHOLDER = '<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->'
const BACKLINK_START = '<!-- BRIDGE:IMPLEMENTED-BY START — generated, do not edit -->'


// Internal-reference catalog: outward-facing pages MUST NOT leak an inward memo/goal instance.
// The ID FORMAT itself (regex tokens, curly placeholders) is documented public vocabulary and is
// exempt (isSchemaLine).
const INTERNAL_REF_PATTERNS = [
    { id: 'memo-gate-code', re: /MEMO-\d+/ },
    { id: 'goal-id', re: /\bG\d{3}\b/ },
    { id: 'memo-ref', re: /\bMemo \d+/ }
]


const isSchemaLine = ( { line } ) => {
    return /\\d|\{[A-Z]+\}/.test( line )
}


const findInternalRefs = ( { content } ) => {
    const lines = content.split( '\n' )
    const hits = []
    lines.forEach( ( line, index ) => {
        if( isSchemaLine( { line } ) === true ) return
        INTERNAL_REF_PATTERNS.forEach( ( { id, re } ) => {
            const match = line.match( re )
            if( match !== null ) hits.push( { line: index + 1, pattern: id, match: match[ 0 ] } )
        } )
    } )

    return hits
}


const isMetaTableLine = ( { line } ) => line.trim().startsWith( '|' )


const headOf = ( { content } ) => content.split( /\n##\s/ )[ 0 ]


const hasH1 = ( { content } ) => {
    const first = content.split( '\n' ).find( ( line ) => line.trim() !== '' ) ?? ''

    return /^#\s+\d{2}\.\s+\S/.test( first )
}


const hasMetaStatusTable = ( { content } ) => {
    return /^\|\s*Status\s*\|/m.test( headOf( { content } ) )
}


const hasIntroProse = ( { content } ) => {
    const lines = content.split( '\n' )
    const firstTableIndex = lines.findIndex( ( line ) => isMetaTableLine( { line } ) )
    if( firstTableIndex === -1 ) return false
    const afterTable = lines
        .slice( firstTableIndex )
        .findIndex( ( line, i ) => i > 0 && !isMetaTableLine( { line } ) )
    const bodyStart = afterTable === -1 ? lines.length : firstTableIndex + afterTable
    const firstHeadingOffset = lines
        .slice( bodyStart )
        .findIndex( ( line ) => /^##\s/.test( line ) )
    const headingIndex = firstHeadingOffset === -1 ? lines.length : bodyStart + firstHeadingOffset
    const between = lines.slice( bodyStart, headingIndex )
    const prose = between
        .map( ( line ) => line.trim() )
        .filter( ( line ) => line !== '' )
        .filter( ( line ) => !line.startsWith( '|' ) )
        .filter( ( line ) => !line.startsWith( '#' ) )
        .filter( ( line ) => !line.startsWith( '---' ) )
        .filter( ( line ) => !line.startsWith( '```' ) )
        .filter( ( line ) => !line.startsWith( '>' ) )

    return prose.length > 0
}


const hasRelatedSection = ( { content } ) => /^##\s+Related\s*$/m.test( content )


const placeholderViolations = ( { content, isBridge } ) => {
    const out = []
    if( isBridge === false && content.indexOf( PLACEHOLDER ) === -1 ) out.push( 'MISSING_PLACEHOLDER' )
    if( content.indexOf( BACKLINK_START ) !== -1 ) out.push( 'HANDWRITTEN_BACKLINK' )

    return out
}


const markerFormViolation = ( { content } ) => {
    const headMarker = headOf( { content } ).match( /^>\s*\*\*Informative[^\n]*/m )
    if( headMarker === null ) return null

    return /^>\s*\*\*Informative\.\*\*/.test( headMarker[ 0 ] ) ? null : 'MARKER_MALFORMED'
}


const crossFamilyRelativeLinks = ( { content } ) => {
    return [ ...content.matchAll( /\]\(\.\.\/[^)]+\.md[^)]*\)/g ) ].length
}


const tokenConsistency = ( { familyName, specDirAbs } ) => {
    const specJsonPath = join( REPO, 'draft', familyName, 'spec.json' )
    const manifestPath = join( specDirAbs, 'spec-manifest.json' )
    if( existsSync( specJsonPath ) === false || existsSync( manifestPath ) === false ) return []
    const specToken = JSON.parse( readFileSync( specJsonPath, 'utf-8' ) ).namespaceToken
    const manifestToken = JSON.parse( readFileSync( manifestPath, 'utf-8' ) ).namespaceToken
    if( specToken === undefined || manifestToken === undefined ) return []
    if( specToken !== manifestToken ) return [ `TOKEN_MISMATCH:spec.json=${ specToken } manifest=${ manifestToken }` ]

    return []
}


const categoryConflicts = ( { specDirAbs } ) => {
    const manifestPath = join( specDirAbs, 'spec-manifest.json' )
    if( existsSync( manifestPath ) === false ) return []
    const manifest = JSON.parse( readFileSync( manifestPath, 'utf-8' ) )
    const groups = Array.isArray( manifest.groups ) === true ? manifest.groups : []
    const counts = new Map()
    groups.forEach( ( group ) => {
        const stems = Array.isArray( group.pages ) === true ? group.pages : []
        stems.forEach( ( stem ) => {
            counts.set( stem, ( counts.get( stem ) ?? 0 ) + 1 )
        } )
    } )

    return [ ...counts.entries() ]
        .filter( ( pair ) => pair[ 1 ] > 1 )
        .map( ( pair ) => `CATEGORY_CONFLICT:${ pair[ 0 ] }` )
}


const auditPage = async ( { specDirAbs, filename, family, leakOnly = false } ) => {
    const content = await readFile( join( specDirAbs, filename ), 'utf-8' )
    const blocking = []

    if( leakOnly === false ) {
        const isBridge = BRIDGE_RE.test( filename )

        if( !hasH1( { content } ) ) blocking.push( 'MISSING_H1' )
        if( !hasMetaStatusTable( { content } ) ) blocking.push( 'MISSING_META_STATUS' )
        placeholderViolations( { content, isBridge } ).forEach( ( v ) => blocking.push( v ) )
        const marker = markerFormViolation( { content } )
        if( marker !== null ) blocking.push( marker )

        // Full adoption (F8=A): intro + Related are BLOCKING for every family.
        if( !hasIntroProse( { content } ) ) blocking.push( 'MISSING_INTRO' )
        if( !hasRelatedSection( { content } ) ) blocking.push( 'MISSING_RELATED' )

        const crossRel = crossFamilyRelativeLinks( { content } )
        if( crossRel > 0 ) blocking.push( `LINK_FORM:${ crossRel } cross-family relative link(s)` )
    }

    const internalRefs = findInternalRefs( { content } )
    internalRefs.forEach( ( ref ) => {
        blocking.push( `INTERNAL_REF:${ ref.pattern }@L${ ref.line }(${ ref.match })` )
    } )

    return { family, filename, blocking, internalRefs }
}


const auditFamily = async ( { family } ) => {
    const specDirAbs = join( REPO, family.specDir )
    const all = await readdir( specDirAbs )
    const pages = all
        .filter( ( f ) => NN_RE.test( f ) === true )
        .sort()
    const numbered = await Promise.all( pages.map( ( filename ) => auditPage( { specDirAbs, filename, family: family.name } ) ) )
    const readmeResult = existsSync( join( specDirAbs, 'README.md' ) ) === true
        ? [ await auditPage( { specDirAbs, filename: 'README.md', family: family.name, leakOnly: true } ) ]
        : []
    const catViolations = categoryConflicts( { specDirAbs } )
    const headViolations = tokenConsistency( { familyName: family.name, specDirAbs } )

    return { family: family.name, results: [ ...numbered, ...readmeResult ], catViolations, headViolations, pageCount: pages.length }
}


const main = async () => {
    const families = await Promise.all( FAMILIES.map( ( family ) => auditFamily( { family } ) ) )

    const allResults = families.flatMap( ( f ) => f.results )
    const blockingCount = families.reduce( ( sum, f ) => {
        const pageBlockers = f.results.reduce( ( n, r ) => n + r.blocking.length, 0 )

        return sum + pageBlockers + f.catViolations.length + f.headViolations.length
    }, 0 )
    const leakCount = allResults.reduce( ( sum, r ) => sum + r.internalRefs.length, 0 )

    families.forEach( ( f ) => {
        console.log( `\n== ${ f.family } (${ f.pageCount } pages) ==` )
        f.catViolations.forEach( ( v ) => console.log( `  ✗ [manifest] ${ v }` ) )
        f.headViolations.forEach( ( v ) => console.log( `  ✗ [head] ${ v }` ) )
        f.results.forEach( ( r ) => {
            const status = r.blocking.length === 0 ? 'ok' : r.blocking.join( ', ' )
            console.log( `  ${ r.blocking.length === 0 ? '✓' : '✗' } ${ r.filename } — ${ status }` )
        } )
    } )

    if( blockingCount > 0 ) {
        console.error( `\nSpec-quality gate FAILED: ${ blockingCount } blocking violation(s) across ${ FAMILIES.length } families (${ leakCount } internal-reference leak(s)).` )
        process.exit( 1 )
    }
    console.log( `\nSpec-quality gate PASSED: ${ FAMILIES.length } families, 0 blocking violations, 0 internal-reference leaks.` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
