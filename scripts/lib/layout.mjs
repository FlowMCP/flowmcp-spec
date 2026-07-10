// layout.mjs — flat namespace-first path resolution (Memo 064 FM-S5 workshop).
//
// The workshop container IS the spec container: each family (namespace) lives directly at the
// container root as <namespace>/<version>/{draft,dist,skills}/, and the cross-namespace aggregates
// (manifest / inverted-map / refs.resolved) sit at the container root next to them. There is no
// intermediate top-level draft/ or dist/ tree — the public repo's medium-first layout is flattened
// here. These resolvers are the single site that knows the on-disk shape, so consumers derive their
// paths structurally and never drift from the tree.
//
// Ported from memo-init repos/spec/scripts/lib/layout.mjs — the canonical flat-layout reference.
// House style: 4-space, no semicolons, single quotes, object params, object returns.

import { existsSync } from 'node:fs'
import { join } from 'node:path'


// A family exists when its head lives at <repoRoot>/<name>/spec.json (the flat namespace-first
// layout). Kept as a real existence probe so consumers can skip a missing family gracefully.
const isNamespaceFirst = ( { repoRoot, name } ) => {
    return existsSync( join( repoRoot, name, 'spec.json' ) ) === true
}


// Relative specDir on the draft (authored) side.
const draftSpecDirRel = ( { name, version } ) => {
    return join( name, version, 'draft', 'spec' )
}


// Relative dataDir on the draft (authored) side.
const draftDataDirRel = ( { name, version } ) => {
    return join( name, version, 'draft', 'data' )
}


// Absolute dist (generated) spec directory.
const distSpecDir = ( { repoRoot, name, version } ) => {
    return join( repoRoot, name, version, 'dist', 'spec' )
}


// Absolute dist (generated) bridge directory.
const distBridgeDir = ( { repoRoot, name, version } ) => {
    return join( repoRoot, name, version, 'dist', 'bridge' )
}


// Absolute dist (generated) data directory.
const distDataDir = ( { repoRoot, name, version } ) => {
    return join( repoRoot, name, version, 'dist', 'data' )
}


// Absolute dist (generated) bundle directory — llms.txt / best-practices.txt live INSIDE dist
// (the atomic copy unit, Kap 15): <namespace>/<version>/dist/generated/.
const distGeneratedDir = ( { repoRoot, name, version } ) => {
    return join( repoRoot, name, version, 'dist', 'generated' )
}


// Absolute path to a family head (spec.json).
const familyHeadPath = ( { repoRoot, name } ) => {
    return join( repoRoot, name, 'spec.json' )
}


// Cross-namespace aggregates (manifest / inverted-map / refs.resolved) live at the container root.
const aggregatePath = ( { repoRoot, file } ) => {
    return join( repoRoot, file )
}


export {
    isNamespaceFirst,
    draftSpecDirRel,
    draftDataDirRel,
    distSpecDir,
    distBridgeDir,
    distDataDir,
    distGeneratedDir,
    familyHeadPath,
    aggregatePath
}
