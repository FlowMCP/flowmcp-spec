import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildFrontmatter } from './lib/frontmatter.mjs'
import { getGuideRepoPath } from './lib/config.mjs'

const __dirname = dirname( fileURLToPath( import.meta.url ) )
const guideRepo = getGuideRepoPath()

const source = join( __dirname, 'data', 'faq.md' )
const faqBody = readFileSync( source, 'utf8' )

const frontmatter = buildFrontmatter( {
    generator: 'gen-faq.mjs',
    sources: [ 'scripts/generators/data/faq.md (hand-maintained)' ],
    specVersion: 'v4.0.0'
} )

writeFileSync( join( guideRepo, 'knowledge', '11-faq.md' ), frontmatter + faqBody, 'utf8' )
console.log( 'Wrote knowledge/11-faq.md' )
