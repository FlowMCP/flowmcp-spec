// load-skill-map.mjs — canonical per-family skill-spec-map loader (ported from memo-init
// repos/spec, Memo 060 P5). Generalized to discover families + their versions from
// draft/*/spec.json rather than a hardcoded family/version list.
//
// The skill-to-spec map is split into per-family files living alongside the spec:
//   draft/<family>/<version>/data/skill-spec-map.json
// This module merges them into a single { note, totals, skills: [] } object, preserving the
// discovery order (specification -> grading -> best-practice). Every FlowMCP family carries an
// intentionally EMPTY map (implementer skills are PRIVATE, F9=A); the files are present for
// symmetry, so every family has a map and the merge stays uniform.

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { discoverSpecs } from './discover-specs.mjs'


const computeTotals = ( { skills } ) => ( {
    skills: skills.length,
    register: skills.filter( ( s ) => s.roleHint !== undefined ).length,
    withGaps: skills.filter( ( s ) => Array.isArray( s.gaps ) && s.gaps.length > 0 ).length,
    withPrimary: skills.filter( ( s ) => s.primary !== null && s.primary !== undefined ).length
} )


// loadSkillMap — read every family's per-version map and return a merged object.
// `repoRoot` must be the absolute path to the spec repo root (where `draft/` lives).
export const loadSkillMap = async ( { repoRoot } ) => {
    const families = discoverSpecs( { repoRoot } )
    const parts = await Promise.all(
        families.map( async ( family ) => {
            const path = join( repoRoot, family.dataDir, 'skill-spec-map.json' )
            const raw = await readFile( path, 'utf-8' ).catch( () => null )
            if( raw === null ) return { skills: [] }

            return JSON.parse( raw )
        } )
    )
    const skills = parts.flatMap( ( p ) => Array.isArray( p.skills ) === true ? p.skills : [] )
    const note = typeof parts[ 0 ]?.note === 'string' ? parts[ 0 ].note : ''

    return { note, totals: computeTotals( { skills } ), skills }
}


// The first family's data dir — used as a presence sentinel by the bridge scripts.
export const sentinelMapPath = ( { repoRoot } ) => {
    const families = discoverSpecs( { repoRoot } )
    if( families.length === 0 ) return join( repoRoot, 'draft' )

    return join( repoRoot, families[ 0 ].dataDir, 'skill-spec-map.json' )
}
