import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname( fileURLToPath( import.meta.url ) )
const SPEC_REPO_ROOT = resolve( __dirname, '..', '..', '..' )

export function getSpecRepoRoot() {
    return SPEC_REPO_ROOT
}

export function getReposRoot() {
    return resolve( SPEC_REPO_ROOT, '..' )
}

export function getGuideRepoPath() {
    const fromEnv = process.env.GUIDE_REPO_PATH
    if( fromEnv ) {
        return resolve( fromEnv )
    }
    return resolve( SPEC_REPO_ROOT, '..', 'flowmcp-guide' )
}
