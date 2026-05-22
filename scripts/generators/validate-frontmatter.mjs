import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { getGuideRepoPath } from './lib/config.mjs'

const knowledge = join( getGuideRepoPath(), 'knowledge' )
const requiredFields = [ 'generated_at', 'generator', 'edit_warning' ]
const skipFiles = [ '07-spec-v4-llms.txt' ]

let failed = false
const files = readdirSync( knowledge ).filter( ( f ) => !f.startsWith( '.' ) ).sort()
for( const file of files ) {
    if( skipFiles.includes( file ) ) {
        console.log( `SKIP ${file} (verbatim copy)` )
        continue
    }
    const content = readFileSync( join( knowledge, file ), 'utf8' )
    const fmMatch = content.match( /^---\n([\s\S]*?)\n---\n/ )
    if( !fmMatch ) {
        console.error( `FAIL ${file}: no frontmatter` )
        failed = true
        continue
    }
    const fm = fmMatch[ 1 ]
    const missing = requiredFields.filter( ( field ) => !fm.includes( `${field}:` ) )
    if( missing.length > 0 ) {
        console.error( `FAIL ${file}: missing fields: ${missing.join( ', ' )}` )
        failed = true
    } else {
        console.log( `PASS ${file}` )
    }
}
if( failed ) {
    console.error( '\nfrontmatter validation FAIL' )
    process.exit( 1 )
}
console.log( '\nfrontmatter validation PASS' )
