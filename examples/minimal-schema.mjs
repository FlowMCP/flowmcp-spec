// FlowMCP v2.0.0 — Minimal Schema Example
// Simplest possible schema: single route, no handlers, no shared lists

export const main = {
    namespace: 'coingecko',
    name: 'Ping',
    description: 'Check CoinGecko API server status',
    version: '2.0.0',
    docs: [ 'https://docs.coingecko.com/reference/simple-ping' ],
    tags: [ 'utility', 'health' ],
    root: 'https://api.coingecko.com/api/v3',
    requiredServerParams: [],
    requiredLibraries: [],
    headers: {},
    routes: {
        ping: {
            method: 'GET',
            path: '/ping',
            description: 'Check if CoinGecko API is online',
            parameters: [],
            output: {
                mimeType: 'application/json',
                schema: {
                    type: 'object',
                    properties: {
                        gecko_says: { type: 'string', description: 'Response message from CoinGecko' }
                    }
                }
            }
        }
    }
}
