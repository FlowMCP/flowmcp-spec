import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { discoverSpecs } from './lib/discover-specs.mjs'

// lint:versions — structural version-drift gate (Memo 060 P5: updated to the draft/head layout).
//
// Two guarantees, both blocking:
//   1. Every family's HEAD (draft/<name>/spec.json) is in step with the on-disk directory reality:
//      its currentVersion + specDir directory exists, and every historicalVersions entry has a
//      draft/<name>/<version>/spec directory (a frozen version present in the head must be carried
//      on disk, and vice versa). data/refs.manual.json mirror fields must match the head.
//   2. No generator script (scripts/generators/gen-*.mjs) hardcodes a version literal — generators
//      read the version through scripts/generators/lib/refs-loader.mjs.

const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = join( __dirname, '..' )

const errors = []


const readRefs = () => JSON.parse( readFileSync( join( REPO, 'data', 'refs.manual.json' ), 'utf8' ) )


const semverDirsUnder = ( relBase ) => {
    const baseDir = join( REPO, relBase )
    if( !existsSync( baseDir ) ) return []

    return readdirSync( baseDir )
        .filter( ( name ) => existsSync( join( baseDir, name ) ) && statSync( join( baseDir, name ) ).isDirectory() )
        .filter( ( name ) => /^\d+\.\d+\.\d+$/.test( name ) )
        .sort()
}


// --- Check 1: family heads consistent with on-disk versions + refs mirror ---

const families = discoverSpecs( { repoRoot: REPO } )
const refs = readRefs()
const refsBySpecDir = [ refs.spec, refs.grading, refs.bestPractice ]
    .filter( ( block ) => block !== undefined )

families.forEach( ( family ) => {
    const headPath = join( REPO, 'draft', family.name, 'spec.json' )
    const head = JSON.parse( readFileSync( headPath, 'utf8' ) )

    // currentVersion dir exists
    if( !existsSync( join( REPO, family.specDir ) ) ) {
        errors.push( `${ family.name }: currentVersion "${ family.version }" specDir "${ family.specDir }" does not exist on disk` )
    }

    // every historicalVersions entry is carried on disk
    const historical = Array.isArray( head.historicalVersions ) ? head.historicalVersions : []
    historical.forEach( ( v ) => {
        const dir = `draft/${ family.name }/${ v }/spec`
        if( !existsSync( join( REPO, dir ) ) ) {
            errors.push( `${ family.name }: historicalVersions entry "${ v }" has no directory "${ dir }"` )
        }
    } )

    // every on-disk version is declared in historicalVersions (no orphan frozen dir)
    const onDisk = semverDirsUnder( join( 'draft', family.name ) )
    onDisk.forEach( ( v ) => {
        if( !historical.includes( v ) ) {
            errors.push( `${ family.name }: on-disk version "${ v }" is not listed in spec.json historicalVersions` )
        }
    } )

    // currentVersion must be among historicalVersions
    if( !historical.includes( family.version ) ) {
        errors.push( `${ family.name }: currentVersion "${ family.version }" is not listed in spec.json historicalVersions` )
    }

    // refs.manual.json mirror (if a matching block exists) must point at the head specDir
    const mirror = refsBySpecDir.find( ( block ) => typeof block.specDir === 'string' && block.specDir.startsWith( `draft/${ family.name }/` ) )
    if( mirror !== undefined && mirror.specDir !== family.specDir ) {
        errors.push( `${ family.name }: refs.manual.json specDir "${ mirror.specDir }" != head specDir "${ family.specDir }"` )
    }
    if( mirror !== undefined && mirror.currentVersion !== family.version ) {
        errors.push( `${ family.name }: refs.manual.json currentVersion "${ mirror.currentVersion }" != head currentVersion "${ family.version }"` )
    }
} )

// --- Check 2: no generator script hardcodes a version literal ---

const generatorsDir = join( REPO, 'scripts', 'generators' )
const generatorFiles = existsSync( generatorsDir )
    ? readdirSync( generatorsDir ).filter( ( name ) => name.startsWith( 'gen-' ) && name.endsWith( '.mjs' ) )
    : []

const versionLiteral = /v\d+\.\d+\.\d+/

generatorFiles.forEach( ( name ) => {
    const content = readFileSync( join( generatorsDir, name ), 'utf8' )
    content
        .split( '\n' )
        .map( ( line, index ) => ( { line, number: index + 1 } ) )
        .filter( ( { line } ) => versionLiteral.test( line ) )
        .forEach( ( { line, number } ) => {
            errors.push( `${ name }:${ number } hardcodes a version literal — read it via lib/refs-loader.mjs instead: ${ line.trim() }` )
        } )
} )

// --- Report ---

if( errors.length > 0 ) {
    console.error( '::error::lint:versions failed — version drift or hardcoded version literal detected.' )
    errors.forEach( ( e ) => console.error( `  - ${ e }` ) )
    process.exit( 1 )
}

console.log( `lint:versions OK — ${ families.length } family heads consistent with on-disk versions; ${ generatorFiles.length } generators free of hardcoded version literals.` )
