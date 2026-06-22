import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

// lint:versions — structural version-drift gate.
//
// Two guarantees, both blocking:
//   1. data/refs.manual.json stays in step with the on-disk directory reality
//      (grading / best-practice versions are derived from their directories; a
//      mismatch means the curated mirror went stale).
//   2. No generator script hardcodes a spec version literal (vN.N.N). Generators
//      must read the version through scripts/generators/lib/refs-loader.mjs, so a
//      reintroduced literal is caught here instead of drifting silently.

const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = join( __dirname, '..' )

const errors = []

function readRefs() {
    const raw = readFileSync( join( REPO, 'data', 'refs.manual.json' ), 'utf8' )
    return JSON.parse( raw )
}

function isSemverDir( name ) {
    return /^v?\d+\.\d+\.\d+$/.test( name )
}

function compareSemver( a, b ) {
    const pa = a.replace( /^v/, '' ).split( '.' ).map( Number )
    const pb = b.replace( /^v/, '' ).split( '.' ).map( Number )
    return ( pa[ 0 ] - pb[ 0 ] ) || ( pa[ 1 ] - pb[ 1 ] ) || ( pa[ 2 ] - pb[ 2 ] )
}

function maxSemverDir( baseDirName ) {
    const baseDir = join( REPO, baseDirName )
    const dirs = readdirSync( baseDir )
        .filter( ( name ) => statSync( join( baseDir, name ) ).isDirectory() )
        .filter( ( name ) => isSemverDir( name ) )
        .sort( compareSemver )
    return dirs[ dirs.length - 1 ]
}

// --- Check 1: refs.manual.json mirror fields match the directory reality ---

const refs = readRefs()

// Spec: curated single source. Assert its declared directory actually exists and
// is consistent with currentVersion.
const specVersion = refs?.spec?.currentVersion
const specDir = refs?.spec?.specDir
if( !specVersion ) {
    errors.push( 'spec.currentVersion missing in refs.manual.json' )
} else if( specDir !== `spec/v${ specVersion }` ) {
    errors.push( `spec.specDir "${ specDir }" does not match spec.currentVersion "${ specVersion }" (expected "spec/v${ specVersion }")` )
} else if( !existsSync( join( REPO, specDir ) ) ) {
    errors.push( `spec.specDir "${ specDir }" does not exist on disk` )
}

// Grading + best-practice: the directory is the source of truth; the mirror
// fields in refs.manual.json must match.
const dirAxes = [
    { key: 'grading', baseDir: 'grading' },
    { key: 'bestPractice', baseDir: 'best-practice' }
]

dirAxes.forEach( ( { key, baseDir } ) => {
    const truth = maxSemverDir( baseDir )
    const declaredVersion = refs?.[ key ]?.currentVersion
    const declaredDir = refs?.[ key ]?.specDir
    if( declaredVersion !== truth ) {
        errors.push( `${ key }.currentVersion "${ declaredVersion }" != highest ${ baseDir }/ directory "${ truth }"` )
    }
    if( declaredDir !== `${ baseDir }/${ truth }` ) {
        errors.push( `${ key }.specDir "${ declaredDir }" != "${ baseDir }/${ truth }"` )
    }
} )

// --- Check 2: no generator script hardcodes a spec version literal ---

const generatorsDir = join( REPO, 'scripts', 'generators' )
const generatorFiles = readdirSync( generatorsDir )
    .filter( ( name ) => name.startsWith( 'gen-' ) )
    .filter( ( name ) => name.endsWith( '.mjs' ) )

const versionLiteral = /v\d+\.\d+\.\d+/

generatorFiles.forEach( ( name ) => {
    const content = readFileSync( join( generatorsDir, name ), 'utf8' )
    const offending = content
        .split( '\n' )
        .map( ( line, index ) => ( { line, number: index + 1 } ) )
        .filter( ( { line } ) => versionLiteral.test( line ) )
    offending.forEach( ( { line, number } ) => {
        errors.push( `${ name }:${ number } hardcodes a version literal — read it via lib/refs-loader.mjs instead: ${ line.trim() }` )
    } )
} )

// --- Report ---

if( errors.length > 0 ) {
    console.error( '::error::lint:versions failed — version drift or hardcoded version literal detected.' )
    errors.forEach( ( e ) => console.error( `  - ${ e }` ) )
    console.error( '' )
    console.error( 'Fix: keep data/refs.manual.json in step with the version directories, and read versions through scripts/generators/lib/refs-loader.mjs.' )
    process.exit( 1 )
}

console.log( `lint:versions OK — refs.manual.json consistent with directories; ${ generatorFiles.length } generators free of hardcoded version literals.` )
