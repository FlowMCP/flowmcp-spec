import { execFileSync } from 'node:child_process'

export function ghFetchReadme( owner, repo ) {
    try {
        const output = execFileSync(
            'gh',
            [ 'api', `repos/${owner}/${repo}/contents/README.md`, '--jq', '.content' ],
            { encoding: 'utf8' }
        )
        return Buffer.from( output.trim(), 'base64' ).toString( 'utf8' )
    } catch( error ) {
        throw new Error( `gh api failed for ${owner}/${repo}: ${error.message}` )
    }
}
