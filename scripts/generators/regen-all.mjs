import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname( fileURLToPath( import.meta.url ) )

const knowledgeGenerators = [
    'gen-overview.mjs',
    'gen-personas.mjs',
    'gen-repos-overview.mjs',
    'gen-cli-handbook.mjs',
    'gen-core-arch.mjs',
    'gen-spec-summary.mjs',
    'gen-llms-copy.mjs',
    'gen-schemas-catalog.mjs',
    'gen-agent-server.mjs',
    'gen-payments.mjs',
    'gen-faq.mjs',
    'gen-glossary.mjs'
]

const botGenerators = [
    'gen-instructions.mjs',
    'gen-metadata.mjs'   // MUST be last (depends on SHA-256 of all other files)
]

const validators = [
    'validate-metadata.mjs',
    'validate-frontmatter.mjs'
]

const allGenerators = [ ...knowledgeGenerators, ...botGenerators ]

console.log( `\n=== regen-all: ${allGenerators.length} generators + ${validators.length} validators ===\n` )

for( const gen of allGenerators ) {
    console.log( `--- ${gen} ---` )
    try {
        execFileSync( 'node', [ join( __dirname, gen ) ], { stdio: 'inherit' } )
    } catch( error ) {
        console.error( `\nFAIL: ${gen}` )
        console.error( `Exit code: ${error.status}` )
        process.exit( 1 )
    }
}

console.log( '\n=== Validators ===\n' )
for( const val of validators ) {
    console.log( `--- ${val} ---` )
    try {
        execFileSync( 'node', [ join( __dirname, val ) ], { stdio: 'inherit' } )
    } catch( error ) {
        console.error( `\nFAIL: ${val}` )
        process.exit( 1 )
    }
}

console.log( '\n=== Done. Bundle ready for OpenAI Builder upload. ===\n' )
