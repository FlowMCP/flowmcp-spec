// discover-specs.mjs — central family discovery helper (ported from memo-init repos/spec,
// Memo 060 P5 FlowMCP meta-spec adoption).
//
// Real directory scanner: reads draft/*/spec.json (glob the draft dir), derives a full family
// record for each family found. The spec.json is the single source of family identity; specDir
// and dataDir are structurally derived from the slug and currentVersion so the record shape never
// drifts from the on-disk layout.
//
// Record shape:
//   { name, namespace, prefix, version, specDir, dataDir, sopAnchor, docEntry, relatedRefs, manifestMeta }
// where:
//   specDir  = 'draft/<name>/<version>/spec'
//   dataDir  = 'draft/<name>/<version>/data'
//   manifestMeta = { order:[...], labels:{...} } (sidebar group meta from sidebarMeta)
//
// Family ORDER is canonical: specification -> grading -> best-practice. Unknown families are
// appended after the known ones (alphabetically), so a new parallel spec slots in deterministically.
// Callers MUST NOT re-implement the family list — add a spec.json under draft/<name>/ and
// discoverSpecs picks it up automatically.

import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'


// Canonical family order for sorting. Unknown families sort after the known ones.
const FAMILY_ORDER = [ 'specification', 'grading', 'best-practice' ]


// Read a spec.json from a draft family directory. Returns null when absent or unreadable.
const readSpecJson = ( { familyDirAbs } ) => {
    const path = join( familyDirAbs, 'spec.json' )
    if( existsSync( path ) === false ) return null
    try {
        return JSON.parse( readFileSync( path, 'utf-8' ) )
    } catch {
        return null
    }
}


// Build a full family record from a spec.json manifest at draft/<name>/spec.json.
// specDir and dataDir are structurally derived (never read verbatim from spec.json) so the layout
// is always consistent: draft/<name>/<version>/spec and draft/<name>/<version>/data.
const buildFamilyRecord = ( { name, specJson } ) => {
    const version = specJson.currentVersion
    const specDir = `draft/${ name }/${ version }/spec`
    const dataDir = `draft/${ name }/${ version }/data`

    return {
        name,
        namespace: specJson.namespace ?? specJson.slug ?? name,
        prefix: specJson.prefix ?? `${ name }/`,
        version,
        specDir,
        dataDir,
        sopAnchor: specJson.sopAnchor ?? '',
        docEntry: specJson.docEntry ?? `/${ name }/overview/`,
        relatedRefs: specJson.relatedRefs ?? [],
        manifestMeta: specJson.sidebarMeta ?? { order: [], labels: {} }
    }
}


// Discover all spec families from draft/*/spec.json in canonical order:
// specification -> grading -> best-practice, then any additional families alphabetically.
// Falls back gracefully (returns empty array) when the draft dir does not exist yet.
export const discoverSpecs = ( { repoRoot } ) => {
    const draftDir = join( repoRoot, 'draft' )
    if( existsSync( draftDir ) === false ) return []

    const entries = readdirSync( draftDir, { withFileTypes: true } )
    const records = entries
        .filter( ( e ) => e.isDirectory() === true )
        .map( ( e ) => {
            const name = e.name
            const specJson = readSpecJson( { familyDirAbs: join( draftDir, name ) } )
            if( specJson === null ) return null

            return buildFamilyRecord( { name, specJson } )
        } )
        .filter( ( r ) => r !== null )

    return records.sort( ( a, b ) => {
        const ia = FAMILY_ORDER.indexOf( a.name )
        const ib = FAMILY_ORDER.indexOf( b.name )
        if( ia !== -1 && ib !== -1 ) return ia - ib
        if( ia !== -1 ) return -1
        if( ib !== -1 ) return 1

        return a.name.localeCompare( b.name )
    } )
}
