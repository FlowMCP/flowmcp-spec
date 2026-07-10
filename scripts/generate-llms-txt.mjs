#!/usr/bin/env node
// generate-llms-txt.mjs — local, reproducible llms.txt generator (Memo 060 P5, WI-200).
//
// The llms.txt build used to live only inline in .github/workflows/generate-llms-txt.yml, so the
// chain could not be reproduced locally. This script extracts that logic: it reads the CURRENT
// specification family (draft path + version from data/refs.manual.json), concatenates every
// numbered chapter (bridge hub excluded) in order into specification/<version>/dist/generated/llms.txt
// plus the llms-schema-spec.txt alias. The CI now just calls `npm run generate-llms-txt`.

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildStamp } from './lib/build-stamp.mjs'
import { draftSpecDirRel, distGeneratedDir, familyHeadPath } from './lib/layout.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
const REFS = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf-8' ) )

// Workshop flat layout (Memo 064 FM-S5): the specification family lives namespace-first at
// specification/<version>/draft/spec, and its llms bundle is emitted INSIDE dist
// (specification/<version>/dist/generated/) — the atomic copy unit (Kap 15). The version still comes
// from data/refs.manual.json so the current family version stays the single source.
const SPEC_NAME = 'specification'
const SPEC_VERSION = REFS.spec.currentVersion
const SPEC_DIR = join( REPO, draftSpecDirRel( { name: SPEC_NAME, version: SPEC_VERSION } ) )
const OUTPUT_DIR = distGeneratedDir( { repoRoot: REPO, name: SPEC_NAME, version: SPEC_VERSION } )
const OUTPUT = join( OUTPUT_DIR, 'llms.txt' )
const OUTPUT_ALIAS = join( OUTPUT_DIR, 'llms-schema-spec.txt' )

// FM-S3 (Memo 064, Kap 17 — Provenance-Threading): the header carries the provenance stamp
// `Source: <namespaceToken>@<version>:<shortSha>` at the source, so the docs site only reaches it
// through. <namespaceToken> is the family's lowercase slug (the same lowercase namespace name the
// reference-ID up front uses — NOT the uppercase spec-manifest token), read from the family-head
// spec.json so it is never hardcoded and stays one token, front and back.
const FAMILY_HEAD = familyHeadPath( { repoRoot: REPO, name: SPEC_NAME } )
const SPEC_TOKEN = JSON.parse( readFileSync( FAMILY_HEAD, 'utf-8' ) ).slug

if( typeof SPEC_TOKEN !== 'string' || SPEC_TOKEN.length === 0 ) {
    console.error( `FAIL: family-head spec.json at ${ FAMILY_HEAD } has no string slug — cannot compose the Source: stamp` )
    process.exit( 1 )
}


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
    // Provenance stamp (Kap 17): shortSha is the 7-char prefix of the same short HEAD SHA the
    // freshness triplet carries (buildStamp -> git rev-parse --short HEAD); the `unknown` sentinel
    // is already 7 chars, so slice( 0, 7 ) passes it through visibly.
    const shortSha = stamp.sha.slice( 0, 7 )
    const specId = `${ SPEC_TOKEN }@${ SPEC_VERSION }:${ shortSha }`
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
        `Source: ${ specId }`,
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

    console.log( `[OK] Concatenated ${ chapters.length } chapters from ${ SPEC_NAME }/${ SPEC_VERSION }/draft/spec into ${ SPEC_NAME }/${ SPEC_VERSION }/dist/generated/llms.txt (+ alias).` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
