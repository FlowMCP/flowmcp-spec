import { readFile, writeFile, copyFile, unlink } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO_ROOT = resolve( __dirname, '..' )
const REFS_PATH = resolve( REPO_ROOT, 'data/refs.manual.json' )
const BACKUP_PATH = resolve( REPO_ROOT, 'data/refs.manual.json.bak' )
// Workshop flat layout (Memo 064 FM-S5): the resolved refs aggregate lives at the container root.
const RESOLVED_PATH = resolve( REPO_ROOT, 'refs.resolved.json' )


const main = async () => {
    console.log( '[1/5] Backup refs.manual.json' )
    await copyFile( REFS_PATH, BACKUP_PATH )

    try {
        console.log( '[2/5] Aendere spec.currentVersion auf 4.1.1' )
        const refs = JSON.parse( await readFile( REFS_PATH, 'utf-8' ) )
        const original = refs.spec.currentVersion
        refs.spec.currentVersion = '4.1.1'
        await writeFile( REFS_PATH, JSON.stringify( refs, null, 4 ) + '\n', 'utf-8' )

        console.log( '[3/5] Lasse generate-refs.mjs laufen' )
        execSync( 'node scripts/generate-refs.mjs', { cwd: REPO_ROOT, stdio: 'inherit' } )

        console.log( '[4/5] Verifiziere refs.resolved.json' )
        const resolved = JSON.parse( await readFile( RESOLVED_PATH, 'utf-8' ) )
        if( resolved.spec.currentVersion !== '4.1.1' ) {
            throw new Error( `Erwartet currentVersion=4.1.1, ist ${ resolved.spec.currentVersion }` )
        }
        if( resolved.validation.passed !== true ) {
            throw new Error( `validation.passed ist nicht true: ${ JSON.stringify( resolved.validation ) }` )
        }
        console.log( '   OK: refs.resolved.json valide mit 4.1.1' )
        console.log( `   Original-Version war: ${ original }` )

        console.log( '[5/5] Manuelle Schritte (CI-Beobachtung):' )
        console.log( '   - notify-docs-site.yml triggert sync-spec.yml im Docs-Repo' )
        console.log( '   - notify-org-profile.yml triggert sync-refs.yml im FlowMCP/.github-Repo' )
        console.log( '   - Playwright auf https://flowmcp.github.io/specification/overview/ verifiziert "v4.1.1"' )
    } finally {
        console.log( 'Restore refs.manual.json aus Backup' )
        await copyFile( BACKUP_PATH, REFS_PATH )
        await unlink( BACKUP_PATH )
        execSync( 'node scripts/generate-refs.mjs', { cwd: REPO_ROOT, stdio: 'inherit' } )
    }
}


main()
    .catch( ( error ) => {
        console.error( error )
        process.exit( 1 )
    } )
