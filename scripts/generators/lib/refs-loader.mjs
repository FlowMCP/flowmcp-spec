import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { getSpecRepoRoot } from './config.mjs'

// Single source of truth for content versions across all generators.
//
// Before this loader, 13 generators hardcoded a literal spec version
// (e.g. "v4.0.0"), so every spec bump had to touch every generator and the
// generated bundle drifted to a stale version. This loader reads the version
// from one canonical place per axis:
//   - spec:          data/refs.manual.json -> spec.currentVersion (curated)
//   - grading:       highest semver directory under grading/  (directory = truth)
//   - best-practice: highest semver directory under best-practice/
//
// A version-drift lint (lint:versions) asserts that refs.manual.json stays in
// step with the directory reality, so the redundant mirror fields can never go
// silently stale.

const root = getSpecRepoRoot()

function readRefs() {
    const path = join( root, 'data', 'refs.manual.json' )
    const raw = readFileSync( path, 'utf8' )
    return JSON.parse( raw )
}

function isSemverDir( name ) {
    return /^v?\d+\.\d+\.\d+$/.test( name )
}

function compareSemver( a, b ) {
    const pa = a.replace( /^v/, '' ).split( '.' ).map( Number )
    const pb = b.replace( /^v/, '' ).split( '.' ).map( Number )
    const major = pa[ 0 ] - pb[ 0 ]
    if( major !== 0 ) { return major }
    const minor = pa[ 1 ] - pb[ 1 ]
    if( minor !== 0 ) { return minor }
    return pa[ 2 ] - pb[ 2 ]
}

function pickMaxSemverDir( baseDirName ) {
    const baseDir = join( root, baseDirName )
    if( !existsSync( baseDir ) ) {
        throw new Error( `[refs-loader] directory not found: ${ baseDirName }` )
    }
    const dirs = readdirSync( baseDir )
        .filter( ( name ) => statSync( join( baseDir, name ) ).isDirectory() )
        .filter( ( name ) => isSemverDir( name ) )
    if( dirs.length === 0 ) {
        throw new Error( `[refs-loader] no semver directory under ${ baseDirName }` )
    }
    const sorted = dirs.sort( compareSemver )
    return sorted[ sorted.length - 1 ]
}

// Spec version comes from the curated single source (refs.manual.json). The
// "4.3.0" form (no leading v); use getSpecVersionTag() for the "v4.3.0" form.
export function getSpecVersion() {
    const refs = readRefs()
    const version = refs?.spec?.currentVersion
    if( !version ) {
        throw new Error( '[refs-loader] data/refs.manual.json spec.currentVersion missing or empty' )
    }
    return version
}

export function getSpecVersionTag() {
    return `v${ getSpecVersion() }`
}

// Absolute path to the current spec directory. Falls back to the highest
// existing spec/v* directory when the curated version has no directory yet
// (mirrors the resilience of the generate-llms-txt workflow).
export function getSpecDir() {
    const tag = getSpecVersionTag()
    const dir = join( root, 'spec', tag )
    if( existsSync( dir ) ) {
        return dir
    }
    const fallback = pickMaxSemverDir( 'spec' )
    return join( root, 'spec', fallback )
}

// Relative form ("spec/v4.3.0"), useful for frontmatter source labels.
export function getSpecDirRel() {
    const tag = getSpecVersionTag()
    if( existsSync( join( root, 'spec', tag ) ) ) {
        return `spec/${ tag }`
    }
    return `spec/${ pickMaxSemverDir( 'spec' ) }`
}

// Grading version is the highest semver directory under grading/ (directory is
// the source of truth; refs.manual.json mirrors it, drift-guarded by lint).
export function getGradingVersion() {
    return pickMaxSemverDir( 'grading' )
}

export function getGradingDirRel() {
    return `grading/${ getGradingVersion() }`
}

export function getBestPracticeVersion() {
    return pickMaxSemverDir( 'best-practice' )
}

export function getBestPracticeDirRel() {
    return `best-practice/${ getBestPracticeVersion() }`
}
