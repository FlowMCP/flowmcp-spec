#!/usr/bin/env node
// generate-docs-payload.mjs — FlowMCP spec -> docs payload (Memo 060 P5 meta-spec adoption).
//
// Ported from memo-init repos/spec and generalized: it iterates EVERY family discovered under
// draft/*/spec.json (specification, grading, best-practice), prepends YAML frontmatter with
// discovery metadata, rewrites same-family links ./NN-name.md -> the family's OWN published route
// (derived from its head docEntry), strips the body H1 and the top metadata table, and writes the
// result to dist/<name>/<version>/spec/<NN-name>.md.
//
// Each family carries its own version line (from draft/<name>/spec.json currentVersion) and stamps
// a `family` + `spec_version` frontmatter field. The layout is draft/<family>/<version>/spec for
// every family, so one build path serves all families and a new family drops into the same tree.
//
// Output format documented in README.md (Layout section).

import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import { discoverSpecs } from './lib/discover-specs.mjs'
import { distSpecDir } from './lib/layout.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
const GENERATOR = 'scripts/generate-docs-payload.mjs'

const FAMILIES = discoverSpecs( { repoRoot: REPO } )


// Derive a family's own published route base from its head docEntry — never a route hardcoded to
// another family (SPEC-REQ-002). docEntry is an absolute path (/specification/overview/) or a full
// URL; in both cases the FIRST path segment is the family's route (/specification/, /grading/,
// /best-practice/).
const routeBaseFromDocEntry = ( { docEntry } ) => {
    const pathPart = ( docEntry ?? '' ).replace( /^https?:\/\/[^/]+/, '' )
    const first = pathPart.split( '/' ).filter( ( seg ) => seg.length > 0 )[ 0 ] ?? ''

    return `/${ first }/`
}


// Strip the top metadata table (Status / Depends on / Related) that each source chapter carries
// directly under its H1. Reading order should be content-first; the same metadata is preserved in
// the chapter's bottom "## Related" footer. The leading table can use "| Field | Value |" or a
// borderless "| | |" header — both handled, and the block is removed ONLY when it contains a
// "Status" row (guard against stripping a leading content table).
const stripTopMetadataTable = ( { content } ) => {
    return content.replace(
        /^\s*\|[^\n]*\|[ \t]*\n\|[ \t:\-|]+\|[ \t]*\n(?:\|[^\n]*\|[ \t]*\n)+/,
        ( match ) => /\|\s*Status\s*\|/.test( match ) ? '' : match
    )
}


const resolveCommit = ( { cwd } ) => {
    try {
        return execSync( 'git rev-parse HEAD', { cwd } ).toString().trim().slice( 0, 7 )
    } catch( err ) {
        return 'unknown'
    }
}


const escapeYamlString = ( { value } ) => {
    return value.replace( /\\/g, '\\\\' ).replace( /"/g, '\\"' ).replace( /\n/g, ' ' )
}


const extractTitle = ( { content } ) => {
    const match = content.match( /^#\s+(.+?)\s*$/m )
    if( !match ) return null

    return match[ 1 ]
        .replace( /^\d+\.\s*/, '' )
        .replace( /^\d+\s*[—–-]\s*/, '' )
        .trim()
}


const extractDescription = ( { content } ) => {
    const lines = content.split( '\n' )
    const candidates = lines
        .map( ( line ) => line.trim() )
        .filter( ( line ) => line !== '' )
        .filter( ( line ) => !line.startsWith( '#' ) )
        .filter( ( line ) => !line.startsWith( '>' ) )
        .filter( ( line ) => !line.startsWith( '---' ) )
        .filter( ( line ) => !line.startsWith( '|' ) )
        .filter( ( line ) => !line.startsWith( '```' ) )
        .filter( ( line ) => !/^this document uses the key words/i.test( line ) )
        .filter( ( line ) => !/\bBCP ?14\b/i.test( line ) && !/\bRFC ?2119\b/i.test( line ) )

    if( candidates.length === 0 ) return ''
    let desc = candidates[ 0 ]
    if( desc.length > 200 ) {
        desc = desc.slice( 0, 200 ).replace( /\s+\S*$/, '' ) + '...'
    }

    return desc
}


const slugFromFilename = ( { filename } ) => filename.replace( /^\d+-/, '' ).replace( /\.md$/, '' )


const orderFromFilename = ( { filename } ) => {
    const match = filename.match( /^(\d+)-/ )

    return match ? parseInt( match[ 1 ], 10 ) : 999
}


// Normative detection — POSITION-AWARE, not a full-text match:
//   1. Hybrid override — a chapter hosting an inline ```requirement block is normative regardless
//      of any Informative. lead.
//   2. Page marker — ONLY a `> **Informative.**` blockquote NEAR THE TOP (before the first `## `)
//      marks the WHOLE chapter non-normative.
//   3. Sectional marker deeper in the body opens a single section and does NOT flip the chapter.
const detectNormative = ( { content } ) => {
    if( /```requirement/.test( content ) === true ) return true
    const head = content.split( /\n##\s/ )[ 0 ]
    const pageMarker = /^>\s*\*\*Informative\.\*\*/m.test( head )

    return pageMarker === false
}


// Rewrite spec links to published routes; an optional #anchor is preserved. Same-family
// ./NN-name.md -> <routeBase><slug>/ where routeBase is the AUTHORING family's own route. A relative
// cross-family link (../…/NN.md) is a defect and fails the build loudly.
const rewriteSpecLinks = ( { content, routeBase, filename } ) => {
    const crossFamily = content.match( /\]\(\.\.\/[^)]+\.md[^)]*\)/ )
    if( crossFamily !== null ) {
        throw new Error( `${ filename ?? 'spec page' }: forbidden relative cross-family link "${ crossFamily[ 0 ] }" — author it as the target family's absolute route.` )
    }

    return content.replace(
        /\]\(\.\/(\d{2}-[a-z0-9-]+)\.md(#[^)]*)?\)/g,
        ( match, fname, anchor ) => `](${ routeBase }${ fname.replace( /^\d+-/, '' ) }/${ anchor ?? '' })`
    )
}


const buildFrontmatter = ( { filename, family, title, description, order, section, normative, versionValue, sourceRelBase, now } ) => {
    const relativeSourcePath = `${ sourceRelBase }/${ filename }`

    return [
        '---',
        `title: "${ escapeYamlString( { value: title } ) }"`,
        `description: "${ escapeYamlString( { value: description } ) }"`,
        `family: "${ family }"`,
        `spec_version: "${ versionValue }"`,
        `spec_file: "${ filename }"`,
        `order: ${ order }`,
        `section: "${ section }"`,
        `normative: ${ normative }`,
        `generated_at: "${ now }"`,
        `generated_from: "${ relativeSourcePath }"`,
        `generator: "${ GENERATOR }"`,
        `edit_warning: "This file is auto-generated. Source: ${ relativeSourcePath }."`,
        '---'
    ].join( '\n' ) + '\n'
}


const generateFile = async ( { filename, sourceDir, targetDir, family, section, routeBase, versionValue, sourceRelBase, now } ) => {
    const content = await readFile( join( sourceDir, filename ), 'utf-8' )

    const title = extractTitle( { content } ) || filename
    const description = extractDescription( { content } )
    const order = orderFromFilename( { filename } )
    const normative = detectNormative( { content } )

    const frontmatter = buildFrontmatter( { filename, family, title, description, order, section, normative, versionValue, sourceRelBase, now } )

    const bodyRewritten = rewriteSpecLinks( { content, routeBase, filename } )
    const bodyNoH1 = bodyRewritten.replace( /^#\s+.+?\n+/, '' )
    const body = stripTopMetadataTable( { content: bodyNoH1 } )

    await writeFile( join( targetDir, filename ), frontmatter + '\n' + body, 'utf-8' )

    return { filename, slug: slugFromFilename( { filename } ), title, normative, descLength: description.length }
}


const collectChapters = async ( { sourceDir } ) => {
    const entries = await readdir( sourceDir, { withFileTypes: true } )

    return entries
        .filter( ( dirent ) => dirent.isFile() && /^\d{2}-/.test( dirent.name ) && dirent.name.endsWith( '.md' ) )
        .map( ( dirent ) => dirent.name )
        .sort( ( a, b ) => a.localeCompare( b ) )
}


// Remove stale generated chapter files (NN-*.md) before regenerating, so a renamed/removed source
// chapter never lingers. Only NN-prefixed .md files are touched.
const cleanTargetDir = async ( { targetDir } ) => {
    let names
    try {
        names = await readdir( targetDir )
    } catch( error ) {
        return
    }
    const stale = names.filter( ( name ) => /^\d{2}-.*\.md$/.test( name ) )
    await Promise.all( stale.map( ( name ) => rm( join( targetDir, name ), { force: true } ) ) )
}


const generatePass = async ( { family, sourceDir, targetDir, section, routeBase, versionValue, sourceRelBase, now } ) => {
    await mkdir( targetDir, { recursive: true } )
    await cleanTargetDir( { targetDir } )
    const chapters = await collectChapters( { sourceDir } )

    console.log( `Generating ${ family } payload from ${ chapters.length } files (spec_version=${ versionValue }, route=${ routeBase })...` )
    const results = await Promise.all( chapters.map( async ( filename ) => {
        const result = await generateFile( { filename, sourceDir, targetDir, family, section, routeBase, versionValue, sourceRelBase, now } )
        console.log( `  ✓ ${ filename } → ${ result.title }` )

        return result
    } ) )

    return results
}


// Route gate (SPEC-REQ-002): after generation, VERIFY that every same-family link resolved to the
// AUTHORING family's own route. Re-reads the source, mirrors the generator transform, and asserts
// each surviving same-family link publishes under the family's own route.
const assertSameFamilyRoutes = async ( { families } ) => {
    const failures = []
    await Promise.all( families.map( async ( family ) => {
        const routeBase = routeBaseFromDocEntry( { docEntry: family.docEntry } )
        const chapters = await collectChapters( { sourceDir: family.sourceDir } )
        await Promise.all( chapters.map( async ( filename ) => {
            const source = await readFile( join( family.sourceDir, filename ), 'utf-8' )
            const output = await readFile( join( family.targetDir, filename ), 'utf-8' )
            const survivingBody = stripTopMetadataTable( { content: source.replace( /^#\s+.+?\n+/, '' ) } )
            const sameFamily = [ ...survivingBody.matchAll( /\]\(\.\/(\d{2}-[a-z0-9-]+)\.md(?:#[^)]*)?\)/g ) ]
            sameFamily.forEach( ( m ) => {
                const slug = m[ 1 ].replace( /^\d+-/, '' )
                const expected = `${ routeBase }${ slug }/`
                if( output.includes( expected ) === false ) {
                    failures.push( `${ family.name }/${ filename }: same-family link ./${ m[ 1 ] }.md did not publish under own route ${ expected }` )
                }
            } )
        } ) )
    } ) )

    if( failures.length > 0 ) {
        throw new Error( `[generate-docs-payload] route gate FAILED:\n  ${ failures.join( '\n  ' ) }` )
    }
    console.log( `\nRoute gate PASSED: every same-family link publishes under its own family route.` )
}


const main = async () => {
    resolveCommit( { cwd: REPO } )
    const now = new Date().toISOString()

    const passInputs = FAMILIES.map( ( family ) => ( {
        name: family.name,
        sourceDir: join( REPO, family.specDir ),
        targetDir: distSpecDir( { repoRoot: REPO, name: family.name, version: family.version } ),
        section: family.name,
        routeBase: routeBaseFromDocEntry( { docEntry: family.docEntry } ),
        versionValue: family.version,
        sourceRelBase: family.specDir,
        docEntry: family.docEntry
    } ) )

    for( const input of passInputs ) {
        const results = await generatePass( { family: input.name, sourceDir: input.sourceDir, targetDir: input.targetDir, section: input.section, routeBase: input.routeBase, versionValue: input.versionValue, sourceRelBase: input.sourceRelBase, now } )
        console.log( `\nGenerated ${ results.length } ${ input.name } files in ${ input.targetDir.replace( REPO + '/', '' ) }` )
        console.log( `Normative: ${ results.filter( ( r ) => r.normative ).length }, Informative: ${ results.filter( ( r ) => !r.normative ).length }` )
    }

    await assertSameFamilyRoutes( { families: passInputs } )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
