#!/usr/bin/env node
// generate-best-practices-txt.mjs — local, reproducible best-practices.txt generator (Memo 064 FM-S6).
//
// Pulls the best-practices bundle generation from the site (flowmcp.github.io) onto the spec side, so
// the spec repo is the single generation point (F14=B: docs sites do not generate content, they only
// serve). It concatenates the generated best-practice family payload
// (dist/best-practice/<version>/spec/NN-*.md, bridge hub excluded) — frontmatter stripped — in file
// order into generated/best-practices.txt. The site step (FM-T6) then only copies this artifact
// through. Deterministic: readdir -> sort -> concat -> write, no timestamps or hashes in the output.

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
const REFS = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf-8' ) )

const BP_VERSION = REFS.bestPractice.currentVersion
const PAYLOAD_DIR = join( REPO, 'dist', 'best-practice', BP_VERSION, 'spec' )
const OUTPUT_DIR = join( REPO, 'generated' )
const OUTPUT = join( OUTPUT_DIR, 'best-practices.txt' )


const stripFrontmatter = ( { content } ) => {
    const match = content.match( /^---\n[\s\S]*?\n---\n?/ )
    if( !match ) return content.trim()

    return content.slice( match[ 0 ].length ).trim()
}


const titleOf = ( { content, filename } ) => {
    const match = content.match( /^title:\s*"(.+?)"\s*$/m )
    if( match ) return match[ 1 ]

    return filename.replace( /^\d+-/, '' ).replace( /\.md$/, '' )
}


const slugOf = ( { filename } ) => filename.replace( /^\d+-/, '' ).replace( /\.md$/, '' )


const buildHeader = ( { version } ) => {
    return [
        `# FlowMCP — Schema Best Practices (bestPracticeSpec/${ version })`,
        '',
        '> Advisory, not normative ("you should, not you must"). Read this BEFORE building a',
        '> schema. Every recommendation is backed by a real code reference (file:line) or a',
        '> memo. The normative rules live in the Schemas Specification and the Grading-Spec.',
        '',
        'Source: https://flowmcp.github.io/best-practice/overview/'
    ].join( '\n' )
}


const main = async () => {
    const all = await readdir( PAYLOAD_DIR )
    const files = all
        .filter( ( f ) => /^\d{2}-.*\.md$/.test( f ) && /-bridge\.md$/.test( f ) === false )
        .sort()

    if( files.length === 0 ) {
        console.error( `FAIL: no best-practice payload chapters in ${ PAYLOAD_DIR } — run "npm run build" first` )
        process.exit( 1 )
    }

    const sections = await Promise.all( files.map( async ( filename ) => {
        const raw = await readFile( join( PAYLOAD_DIR, filename ), 'utf-8' )
        const title = titleOf( { content: raw, filename } )
        const slug = slugOf( { filename } )
        const body = stripFrontmatter( { content: raw } )

        return `---\n\n# ${ title }\n/best-practice/${ slug }/\n\n${ body }`
    } ) )

    const output = `${ buildHeader( { version: BP_VERSION } ) }\n\n${ sections.join( '\n\n' ) }\n`

    await mkdir( OUTPUT_DIR, { recursive: true } )
    await writeFile( OUTPUT, output, 'utf-8' )

    console.log( `[OK] Concatenated ${ files.length } best-practice pages from dist/best-practice/${ BP_VERSION }/spec into generated/best-practices.txt.` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
