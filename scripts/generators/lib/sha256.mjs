import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

export function hashFile( absPath ) {
    const content = readFileSync( absPath )
    return createHash( 'sha256' ).update( content ).digest( 'hex' )
}
