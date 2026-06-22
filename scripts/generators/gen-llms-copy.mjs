import { copyFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { getSpecRepoRoot, getGuideRepoPath } from './lib/config.mjs'
import { getSpecVersionTag } from './lib/refs-loader.mjs'

const specRoot = getSpecRepoRoot()
const guideRepo = getGuideRepoPath()
const specVersionTag = getSpecVersionTag()

const target = join( guideRepo, 'knowledge', '07-spec-v4-llms.txt' )
const preferredSource = join( specRoot, 'spec', specVersionTag, 'llms.txt' )

if( existsSync( preferredSource ) ) {
    copyFileSync( preferredSource, target )
    console.log( `Copied spec/${specVersionTag}/llms.txt -> ${target}` )
} else {
    const specDir = join( specRoot, 'spec' )
    const versions = readdirSync( specDir )
        .filter( ( v ) => v.startsWith( 'v' ) )
        .sort()
        .reverse()
    let fallback = null
    for( const v of versions ) {
        const candidate = join( specDir, v, 'llms.txt' )
        if( existsSync( candidate ) ) {
            fallback = { version: v, path: candidate }
            break
        }
    }
    if( !fallback ) {
        console.error( 'FAIL: no llms.txt found in any spec version' )
        process.exit( 1 )
    }
    copyFileSync( fallback.path, target )
    console.warn( `WARN: spec/${specVersionTag}/llms.txt not found, using fallback spec/${fallback.version}/llms.txt` )
    console.log( `Copied spec/${fallback.version}/llms.txt -> ${target}` )
}
