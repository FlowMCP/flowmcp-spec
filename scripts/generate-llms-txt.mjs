#!/usr/bin/env node
// generate-llms-txt.mjs — local, reproducible llms.txt generator (Memo 060 P5, WI-200).
//
// The llms.txt build used to live only inline in .github/workflows/generate-llms-txt.yml, so the
// chain could not be reproduced locally. This script extracts that logic: it reads the CURRENT
// specification family (draft path + version from data/refs.manual.json), concatenates every
// numbered chapter (bridge hub excluded) in order into generated/llms.txt plus the
// generated/llms-schema-spec.txt alias. The CI now just calls `npm run generate-llms-txt`.

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildStamp } from './lib/build-stamp.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
const REFS = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf-8' ) )

const SPEC_VERSION = REFS.spec.currentVersion
const SPEC_DIR = join( REPO, REFS.spec.specDir )
const OUTPUT_DIR = join( REPO, 'generated' )
const OUTPUT = join( OUTPUT_DIR, 'llms.txt' )
const OUTPUT_ALIAS = join( OUTPUT_DIR, 'llms-schema-spec.txt' )


const titleOf = ( { content, filename } ) => {
    const match = content.match( /^#\s+(.+?)\s*$/m )
    if( !match ) return filename.replace( /^\d+-/, '' ).replace( /\.md$/, '' )

    return match[ 1 ].replace( /^\d+\.\s*/, '' ).replace( /^\d+\s*[—–-]\s*/, '' ).trim()
}


const main = async () => {
    const all = await readdir( SPEC_DIR )
    const files = all
        .filter( ( f ) => /^\d{2}-.*\.md$/.test( f ) && /-bridge\.md$/.test( f ) === false )
        .sort()

    if( files.length === 0 ) {
        console.error( `FAIL: no numbered chapters found in ${ SPEC_DIR } — refusing to write a header-only llms.txt` )
        process.exit( 1 )
    }

    const chapters = await Promise.all( files.map( async ( filename ) => {
        const content = await readFile( join( SPEC_DIR, filename ), 'utf-8' )

        return { filename, title: titleOf( { content, filename } ), content }
    } ) )

    const stamp = buildStamp( { version: SPEC_VERSION, cwd: REPO } )
    const toc = chapters.map( ( c, i ) => `${ i + 1 }. ${ c.title }` ).join( '\n' )
    const header = [
        `# FlowMCP Specification v${ SPEC_VERSION }`,
        '> Complete specification for FlowMCP — a schema-driven normalization layer that transforms REST APIs, local databases, and workflows into MCP-compatible tools for AI agents.',
        '>',
        `> This file concatenates all ${ chapters.length } specification documents into a single file for LLM consumption.`,
        '> Source: https://github.com/FlowMCP/flowmcp-spec',
        `> version: ${ stamp.version }`,
        `> sha: ${ stamp.sha }`,
        `> generated_at: ${ stamp.generated_at }`,
        '',
        '## Table of Contents',
        '',
        toc,
        '',
        '---'
    ].join( '\n' )

    const body = chapters.map( ( c ) => `\n${ c.content }\n\n---` ).join( '' )
    const output = `${ header }${ body }\n`

    await mkdir( OUTPUT_DIR, { recursive: true } )
    await writeFile( OUTPUT, output, 'utf-8' )
    await writeFile( OUTPUT_ALIAS, output, 'utf-8' )

    console.log( `[OK] Concatenated ${ chapters.length } chapters from ${ REFS.spec.specDir } into generated/llms.txt (+ alias).` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
