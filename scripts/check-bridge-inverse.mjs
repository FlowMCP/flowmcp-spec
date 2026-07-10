#!/usr/bin/env node
// check-bridge-inverse.mjs — inverse skill->spec coverage gate (ported from memo-init repos/spec,
// Memo 060 P5). Proves the rendered Bridge artifacts agree, edge for edge, with the skill-to-spec
// map. For every non-bridge chapter across all families it asserts that
//   (1) the source carries ONLY the placeholder (never a full "## Implemented by" block),
//   (1b) <family>/<version>/dist/bridge/<stem>.backlink.md lists EXACTLY the map's implementer set,
//   (2) <family>/<version>/dist/bridge/<stem>.md exists (the per-page projection is materialized),
//   (3) the root-level inverted-map.json lists EXACTLY the map's implementer set for it.
// Any divergence is a hard violation. The gate regenerates nothing; it only reads.
// Exit 0 when the projection is consistent, 1 on any drift.

import { readdir, readFile } from 'node:fs/promises'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { discoverSpecs } from './lib/discover-specs.mjs'
import { loadSkillMap, sentinelMapPath } from './lib/load-skill-map.mjs'
import { distBridgeDir, distSpecDir, aggregatePath } from './lib/layout.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
const SENTINEL_MAP = sentinelMapPath( { repoRoot: REPO } )
// Workshop flat layout (Memo 064 FM-S5): inverted-map aggregate at the container root; per-family
// bridge/spec payloads namespace-first under <ns>/<version>/dist.
const INVERTED_PATH = aggregatePath( { repoRoot: REPO, file: 'inverted-map.json' } )
const bridgeDirFor = ( { name, version } ) => distBridgeDir( { repoRoot: REPO, name, version } )

const NN_RE = /^\d{2}-.*\.md$/
const BACKLINK_START = '<!-- BRIDGE:IMPLEMENTED-BY START — generated, do not edit -->'
const BACKLINK_END = '<!-- BRIDGE:IMPLEMENTED-BY END -->'
const PLACEHOLDER = '<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->'

const FAMILIES = discoverSpecs( { repoRoot: REPO } ).map( ( f ) => ( {
    key: f.name,
    prefix: f.prefix,
    specDir: f.specDir,
    version: f.version
} ) )


const numberFromName = ( { name } ) => {
    const match = name.match( /^(\d{2})-/ )

    return match ? parseInt( match[ 1 ], 10 ) : -1
}


const expectedImplementers = ( { skills, id } ) => {
    return skills
        .filter( ( skill ) => Array.isArray( skill.all ) === true && skill.all.includes( id ) === true )
        .filter( ( skill ) => skill.visibility !== 'internal' )
        .map( ( skill ) => skill.skill )
        .sort( ( a, b ) => a.localeCompare( b ) )
}


const backlinkImplementers = ( { content } ) => {
    const startIdx = content.indexOf( BACKLINK_START )
    if( startIdx === -1 ) return null
    const endIdx = content.indexOf( BACKLINK_END, startIdx )
    if( endIdx === -1 ) return null
    const block = content.slice( startIdx, endIdx )

    return [ ...block.matchAll( /^-\s+`([^`]+)`/gm ) ]
        .map( ( m ) => m[ 1 ] )
        .sort( ( a, b ) => a.localeCompare( b ) )
}


const sameList = ( { a, b } ) => a.length === b.length && a.every( ( v, i ) => v === b[ i ] )


const collectStems = async ( { specDirAbs } ) => {
    return ( await readdir( specDirAbs ) )
        .filter( ( name ) => NN_RE.test( name ) === true && /-bridge\.md$/.test( name ) === false )
        .map( ( name ) => name.replace( /\.md$/, '' ) )
        .sort( ( a, b ) => numberFromName( { name: `${ a }.md` } ) - numberFromName( { name: `${ b }.md` } ) )
}


const checkRequiresEdges = ( { skills } ) => {
    const known = new Set( skills.map( ( s ) => s.skill ) )
    const dangling = []
    skills.forEach( ( skill ) => {
        if( Array.isArray( skill.requires ) === false || skill.requires.length === 0 ) return
        skill.requires.forEach( ( target ) => {
            if( known.has( target ) === false ) {
                dangling.push( `${ skill.skill }.requires: "${ target }" is not a known skill in the merged map (dangling edge)` )
            }
        } )
    } )

    return dangling
}


const assertNoInternalLeak = async ( { families, inverted } ) => {
    const leaks = []

    ;( inverted.pages ?? [] ).forEach( ( page ) => {
        if( 'provenance' in page ) leaks.push( `inverted-map.json: page ${ page.id } carries a provenance field (internal — MUST NOT publish)` )
        if( 'gaps' in page ) leaks.push( `inverted-map.json: page ${ page.id } carries a gaps field (internal — MUST NOT publish)` )
    } )

    await Promise.all( families.map( async ( family ) => {
        const bridgeDir = bridgeDirFor( { name: family.key, version: family.version } )
        const specDir = distSpecDir( { repoRoot: REPO, name: family.key, version: family.version } )
        const bridgeFiles = ( await readdir( bridgeDir ).catch( () => [] ) )
            .filter( ( name ) => name.endsWith( '.md' ) )
            .map( ( name ) => join( bridgeDir, name ) )
        const hubFiles = ( await readdir( specDir ).catch( () => [] ) )
            .filter( ( name ) => /-bridge\.md$/.test( name ) === true )
            .map( ( name ) => join( specDir, name ) )

        await Promise.all( [ ...bridgeFiles, ...hubFiles ].map( async ( path ) => {
            const text = await readFile( path, 'utf-8' )
            if( /provenance/i.test( text ) === true ) leaks.push( `${ path }: rendered bridge artifact leaks the word "provenance" (internal hash)` )
            if( /^#{2,4}\s.*\bgaps\b/im.test( text ) === true || /gaps roll-?up/i.test( text ) === true ) leaks.push( `${ path }: rendered bridge artifact leaks a gaps roll-up (internal)` )
        } ) )
    } ) )

    return leaks
}


const main = async () => {
    if( existsSync( SENTINEL_MAP ) === false ) {
        console.warn( `check-bridge-inverse: skipped — per-family skill-spec-map.json not found at ${ SENTINEL_MAP }.` )

        return
    }
    const map = await loadSkillMap( { repoRoot: REPO } )
    const skills = Array.isArray( map.skills ) === true ? map.skills : []
    const violations = []

    const requiresViolations = checkRequiresEdges( { skills } )
    if( requiresViolations.length > 0 ) {
        console.error( `check-bridge-inverse: ${ requiresViolations.length } dangling requires-edge(s)` )
        requiresViolations.forEach( ( v ) => console.error( `  ✗ ${ v }` ) )
        process.exit( 1 )
    }

    if( existsSync( INVERTED_PATH ) === false ) {
        console.error( 'check-bridge-inverse: inverted-map.json missing — run the spec build first.' )
        process.exit( 1 )
    }
    const inverted = JSON.parse( await readFile( INVERTED_PATH, 'utf-8' ) )
    const invertedById = new Map( ( inverted.pages ?? [] ).map( ( p ) => [ p.id, p.implementers.map( ( i ) => i.skill ).sort( ( a, b ) => a.localeCompare( b ) ) ] ) )

    const perFamily = await Promise.all( FAMILIES.map( async ( family ) => {
        const specDirAbs = join( REPO, family.specDir )
        const stems = await collectStems( { specDirAbs } )

        await Promise.all( stems.map( async ( stem ) => {
            const id = `${ family.prefix }${ stem }`
            const expected = expectedImplementers( { skills, id } )

            const content = await readFile( join( specDirAbs, `${ stem }.md` ), 'utf-8' )
            if( content.indexOf( PLACEHOLDER ) === -1 ) {
                violations.push( `${ family.key }/${ stem }: source missing the <!-- IMPLEMENTED-BY --> placeholder (F2 Dist-Split)` )
            }
            if( content.indexOf( BACKLINK_START ) !== -1 ) {
                violations.push( `${ family.key }/${ stem }: full "## Implemented by" block present in source — it must live only in the dist (F2 Dist-Split)` )
            }

            const familyBridgeDir = bridgeDirFor( { name: family.key, version: family.version } )
            const backlinkPath = join( familyBridgeDir, `${ stem }.backlink.md` )
            const backlink = existsSync( backlinkPath ) === true
                ? backlinkImplementers( { content: readFileSync( backlinkPath, 'utf-8' ) } )
                : null
            if( backlink === null ) {
                violations.push( `${ family.key }/${ stem }: dist backlink dist/${ family.key }/${ family.version }/bridge/${ stem }.backlink.md missing` )
            } else if( sameList( { a: backlink, b: expected } ) === false ) {
                violations.push( `${ family.key }/${ stem }: dist backlink [${ backlink.join( ', ' ) }] != map [${ expected.join( ', ' ) }]` )
            }

            const bridgePath = join( familyBridgeDir, `${ stem }.md` )
            if( existsSync( bridgePath ) === false ) {
                violations.push( `${ family.key }/${ stem }: per-page bridge dist/${ family.key }/${ family.version }/bridge/${ stem }.md missing` )
            }

            const fromInverted = invertedById.get( id )
            if( fromInverted === undefined ) {
                violations.push( `${ family.key }/${ stem }: id "${ id }" absent from inverted-map.json` )
            } else if( sameList( { a: fromInverted, b: expected } ) === false ) {
                violations.push( `${ family.key }/${ stem }: inverted-map [${ fromInverted.join( ', ' ) }] != map [${ expected.join( ', ' ) }]` )
            }
        } ) )

        return stems.length
    } ) )

    const leaks = await assertNoInternalLeak( { families: FAMILIES, inverted } )
    leaks.forEach( ( leak ) => violations.push( leak ) )

    const totalPages = perFamily.reduce( ( sum, n ) => sum + n, 0 )

    if( violations.length > 0 ) {
        console.error( `check-bridge-inverse: ${ violations.length } inverse-projection violation(s) over ${ totalPages } chapters` )
        violations.forEach( ( v ) => console.error( `  ✗ ${ v }` ) )
        process.exit( 1 )
    }
    console.log( `check-bridge-inverse: 0 violations — backlinks, per-page bridges, and inverted-map agree with the map over ${ totalPages } chapters.` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
