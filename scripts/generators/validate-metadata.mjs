import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getGuideRepoPath } from './lib/config.mjs'

const __dirname = dirname( fileURLToPath( import.meta.url ) )

const schemaPath = join( __dirname, 'schemas', 'metadata-schema.json' )
const schema = JSON.parse( readFileSync( schemaPath, 'utf8' ) )

const guideRepo = getGuideRepoPath()
const metadataPath = join( guideRepo, 'metadata.json' )

if( !existsSync( metadataPath ) ) {
    console.error( `FAIL: metadata.json not found at ${metadataPath}` )
    process.exit( 1 )
}

const metadata = JSON.parse( readFileSync( metadataPath, 'utf8' ) )

const errors = []

for( const required of schema.required ) {
    if( !( required in metadata ) ) errors.push( `Missing required field: ${required}` )
}
if( metadata.description?.length > 300 ) errors.push( `description too long: ${metadata.description.length} > 300` )
if( metadata.name?.length > 50 ) errors.push( `name too long: ${metadata.name.length} > 50` )
if( metadata.conversation_starters?.length !== 4 ) errors.push( `conversation_starters must be 4, got ${metadata.conversation_starters?.length}` )
if( !/^\d+\.\d+\.\d+$/.test( metadata.bundle_version || '' ) ) errors.push( 'bundle_version not semver' )
for( const f of metadata.files || [] ) {
    if( !/^[a-f0-9]{64}$/.test( f.sha256 || '' ) ) errors.push( `Invalid sha256 for ${f.path}` )
}
const requiredCaps = [ 'web_search', 'canvas', 'image_generation', 'code_interpreter_and_data_analysis' ]
for( const cap of requiredCaps ) {
    if( typeof metadata.capabilities?.[ cap ] !== 'boolean' ) errors.push( `capabilities.${cap} must be boolean` )
}

if( errors.length > 0 ) {
    console.error( 'metadata.json validation FAIL:' )
    errors.forEach( ( e ) => console.error( `  - ${e}` ) )
    process.exit( 1 )
}
console.log( `metadata.json validation PASS (${metadata.files.length} files, ${metadata.conversation_starters.length} starters)` )
