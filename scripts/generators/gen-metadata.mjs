import { writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { hashFile } from './lib/sha256.mjs'
import { getGuideRepoPath } from './lib/config.mjs'

const guideRepo = getGuideRepoPath()

const expectedFiles = [
    'instructions.md',
    'profile-image.png',
    'knowledge/01-overview.md',
    'knowledge/02-personas.md',
    'knowledge/03-repos-overview.md',
    'knowledge/04-cli-handbook.md',
    'knowledge/05-core-architecture.md',
    'knowledge/06-spec-v4-summary.md',
    'knowledge/07-spec-v4-llms.txt',
    'knowledge/08-schemas-public-catalog.md',
    'knowledge/09-mcp-agent-server.md',
    'knowledge/10-payments-x402.md',
    'knowledge/11-faq.md',
    'knowledge/12-glossary.md'
]

const missing = []
for( const rel of expectedFiles ) {
    const abs = join( guideRepo, rel )
    if( !existsSync( abs ) ) {
        missing.push( rel )
    }
}

if( missing.length > 0 ) {
    console.error( 'FAIL: missing expected files:' )
    missing.forEach( ( m ) => console.error( `  - ${m}` ) )
    process.exit( 1 )
}

const files = expectedFiles.map( ( rel ) => ( {
    path: rel,
    sha256: hashFile( join( guideRepo, rel ) )
} ) )

const metadata = {
    bundle_version: '0.1.0',
    generated_at: new Date().toISOString(),
    spec_version: 'v4.0.0',
    name: 'FlowMCP Guide',
    description: 'Your conversational guide to the FlowMCP ecosystem — CLI usage, schema authoring, agent deployment, and x402 payments. English and German supported.',
    recommended_model: 'GPT-5',
    capabilities: {
        web_search: true,
        canvas: false,
        image_generation: false,
        code_interpreter_and_data_analysis: false
    },
    categories: [ 'Developer Tools', 'API Integration', 'MCP' ],
    conversation_starters: [
        'Show me a 5-minute hello-world CLI walkthrough with flowmcp-cli.',
        'What is FlowMCP and is it production-ready? Give me a 90-second pitch.',
        'How do flowmcp-core and flowmcp-servers fit into an MCP architecture?',
        'How do I write a valid v4 schema and which validation codes apply?'
    ],
    files
}

writeFileSync(
    join( guideRepo, 'metadata.json' ),
    JSON.stringify( metadata, null, 2 ) + '\n',
    'utf8'
)
console.log( `Wrote metadata.json (${files.length} file entries, 4 starters)` )
