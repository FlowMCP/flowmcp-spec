import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getGuideRepoPath } from './lib/config.mjs'

const __dirname = dirname( fileURLToPath( import.meta.url ) )
const guideRepo = getGuideRepoPath()

const template = readFileSync( join( __dirname, 'templates', 'instructions.template.md' ), 'utf8' )

const bundleVersion = '0.1.0'
const generatedAt = new Date().toISOString()

const output = template
    .replace( '{{BUNDLE_VERSION}}', bundleVersion )
    .replace( '{{GENERATED_AT}}', generatedAt )

const charCount = output.length
if( charCount > 8000 ) {
    console.error( `FAIL: instructions.md is ${charCount} chars, limit 8000` )
    process.exit( 1 )
}

writeFileSync( join( guideRepo, 'instructions.md' ), output, 'utf8' )
console.log( `Wrote instructions.md (${charCount} chars, ${8000 - charCount} chars headroom)` )
