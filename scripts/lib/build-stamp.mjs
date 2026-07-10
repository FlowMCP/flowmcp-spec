// build-stamp.mjs — shared build-provenance helper for the generate-* scripts (Memo 064 FM-S4).
//
// The source commit used to be resolved inline in generate-refs.mjs and was absent from
// generate-manifest.mjs / generate-llms-txt.mjs, so each generator carried (or lacked) its own
// provenance. This is the single source: resolveCommit() reads the short HEAD SHA (or 'unknown'
// when there is no git), and buildStamp() wraps it into the uniform freshness triplet
// { version, sha, generated_at } that refs.resolved.json, manifest.json and the llms.txt header
// all carry. A missing git never throws — it degrades to 'unknown' (parity with the personal-brand
// workshop resolveCommit).
//
// No external dependencies — runnable with plain `node`.

import { execSync } from 'node:child_process'


const resolveCommit = ( { cwd } ) => {
    try {
        return execSync( 'git rev-parse --short HEAD', { cwd, stdio: [ 'ignore', 'pipe', 'ignore' ] } )
            .toString()
            .trim()
    } catch( err ) {
        return 'unknown'
    }
}


const buildStamp = ( { version, cwd } ) => {
    return {
        version,
        sha: resolveCommit( { cwd } ),
        generated_at: new Date().toISOString()
    }
}


export { resolveCommit, buildStamp }
