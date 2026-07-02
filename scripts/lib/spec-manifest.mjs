// spec-manifest reader (build side) — Memo 052 Kap 4/8.
//
// The spec-manifest is the SINGLE source of the left-nav sub-categories, declared on the
// spec level PER VERSION at <namespace>/<version>/spec-manifest.json. This tiny parse rule
// is DUPLICATED (not cross-repo imported) in three places that share no dependency: the
// Spec Viewer (cli/spec-view), this build (repos/spec), and the public site (sidebar.mjs).
// The schema is small and stable; one parse rule per manifest, never a hardcoded grouping
// table again.

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'


const MANIFEST_FILENAME = 'spec-manifest.json'
const DEFAULT_FALLBACK = 'append-by-NN'


// Read <specDir>/spec-manifest.json. Never throws — a missing/malformed manifest degrades
// to { found:false } so the caller can fall back to a hardcoded/flat grouping.
const readSpecManifest = ( { specDir } ) => {
    const path = join( specDir, MANIFEST_FILENAME )

    if( !existsSync( path ) ) {
        return { found: false, path, groups: [], fallback: DEFAULT_FALLBACK, messages: [ `no ${ MANIFEST_FILENAME } at ${ path }` ] }
    }

    let parsed
    try {
        parsed = JSON.parse( readFileSync( path, 'utf-8' ) )
    } catch( error ) {
        return { found: false, path, groups: [], fallback: DEFAULT_FALLBACK, messages: [ `${ path } is not valid JSON: ${ error.message }` ] }
    }

    if( !Array.isArray( parsed.groups ) ) {
        return { found: false, path, groups: [], fallback: DEFAULT_FALLBACK, messages: [ `${ path }: groups must be an array` ] }
    }

    const fallback = typeof parsed.fallback === 'string' ? parsed.fallback : DEFAULT_FALLBACK
    const groups = [ ...parsed.groups ].sort( ( a, b ) => ( a.order || 0 ) - ( b.order || 0 ) )

    return { found: true, path, namespace: parsed.namespace, version: parsed.version, groups, fallback, messages: [] }
}


// Look up a payload filename's group id via the manifest pages[] (page identifier = the
// NN-slug filename stem, no .md). Returns null when unlisted (caller applies the fallback).
const groupForFile = ( { groups, filename } ) => {
    const stem = filename.replace( /\.md$/, '' )
    const hit = groups
        .find( ( group ) => Array.isArray( group.pages ) && group.pages.includes( stem ) )

    return hit ? hit.id : null
}


// Label/order lookup maps for sidebar.mjs (the site reads group display metadata from the
// synced manifest instead of hardcoded constants).
const groupMeta = ( { groups } ) => {
    const labels = {}
    const order = []
    groups
        .forEach( ( group ) => {
            labels[ group.id ] = group.label
            order.push( group.id )
        } )

    return { labels, order }
}


export { readSpecManifest, groupForFile, groupMeta, MANIFEST_FILENAME, DEFAULT_FALLBACK }
