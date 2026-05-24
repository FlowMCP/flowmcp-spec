const IMPORT_REGEX = /^github:FlowMCP\/[\w-]+(#[\w./-]+)?$/

const positives = [
    'github:FlowMCP/flowmcp-cli#v4.1.0',
    'github:FlowMCP/flowmcp-core#v4.1.0',
    'github:FlowMCP/flowmcp-schemas-public#main',
    'github:FlowMCP/gtfs-sqlite-toolkit#v1.0.0',
    'github:FlowMCP/flowmcp-cli'
]

const negatives = [
    'flowmcp-cli',
    'npm install flowmcp-cli',
    'github:flowmcp/flowmcp-cli',
    'github:other-org/flowmcp-cli#v4.1.0',
    'https://github.com/FlowMCP/flowmcp-cli'
]

const positiveFailures = positives.filter( ( p ) => !IMPORT_REGEX.test( p ) )
const negativeFailures = negatives.filter( ( n ) => IMPORT_REGEX.test( n ) )

if( positiveFailures.length > 0 || negativeFailures.length > 0 ) {
    console.error( '[FAIL] Regex check failed' )
    console.error( 'Positives that should match but did not:', positiveFailures )
    console.error( 'Negatives that should NOT match but did:', negativeFailures )
    process.exit( 1 )
}

console.log( `[OK] Regex check passed — ${ positives.length } positives, ${ negatives.length } negatives` )
