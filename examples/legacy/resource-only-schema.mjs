// FlowMCP v3.0.0 — Resource-Only Schema Example
// Demonstrates E1 decision: 0 tools is valid. A schema can provide only resources.
// No `root` is needed because there are no HTTP tools.
// No `requiredServerParams` because SQLite resources do not use API keys.

export const main = {
    namespace: 'iso',
    name: 'CountryCodes',
    description: 'ISO 3166 country code lookup from local SQLite database',
    version: '3.0.0',
    docs: [ 'https://www.iso.org/iso-3166-country-codes.html' ],
    tags: [ 'reference', 'iso', 'countries' ],
    requiredServerParams: [],
    requiredLibraries: [],
    headers: {},
    resources: {
        countries: {
            source: 'sqlite',
            description: 'ISO 3166-1 country code lookups by alpha-2, alpha-3, or name.',
            database: './data/countries.db',
            queries: {
                byAlpha2: {
                    sql: 'SELECT alpha2, alpha3, numeric_code, name, region FROM countries WHERE alpha2 = ? COLLATE NOCASE',
                    description: 'Find country by ISO 3166-1 alpha-2 code (e.g. US, DE, JP)',
                    parameters: [
                        {
                            position: { key: 'code', value: '{{USER_PARAM}}' },
                            z: { primitive: 'string()', options: [ 'length(2)' ] }
                        }
                    ],
                    output: {
                        mimeType: 'application/json',
                        schema: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    alpha2: { type: 'string', description: 'ISO 3166-1 alpha-2 code' },
                                    alpha3: { type: 'string', description: 'ISO 3166-1 alpha-3 code' },
                                    numericCode: { type: 'string', description: 'ISO 3166-1 numeric code' },
                                    name: { type: 'string', description: 'Country name in English' },
                                    region: { type: 'string', description: 'Geographic region' }
                                }
                            }
                        }
                    },
                    tests: [
                        { _description: 'United States', code: 'US' },
                        { _description: 'Germany (lowercase)', code: 'de' },
                        { _description: 'Japan', code: 'JP' }
                    ]
                },
                byName: {
                    sql: 'SELECT alpha2, alpha3, numeric_code, name, region FROM countries WHERE name LIKE ? COLLATE NOCASE ORDER BY name',
                    description: 'Search countries by name (partial match, case-insensitive)',
                    parameters: [
                        {
                            position: { key: 'name', value: '{{USER_PARAM}}' },
                            z: { primitive: 'string()', options: [ 'min(1)' ] }
                        }
                    ],
                    output: {
                        mimeType: 'application/json',
                        schema: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    alpha2: { type: 'string', description: 'ISO 3166-1 alpha-2 code' },
                                    alpha3: { type: 'string', description: 'ISO 3166-1 alpha-3 code' },
                                    numericCode: { type: 'string', description: 'ISO 3166-1 numeric code' },
                                    name: { type: 'string', description: 'Country name in English' },
                                    region: { type: 'string', description: 'Geographic region' }
                                }
                            }
                        }
                    },
                    tests: [
                        { _description: 'Search for United', name: '%United%' },
                        { _description: 'Search for land suffix', name: '%land' }
                    ]
                },
                byRegion: {
                    sql: 'SELECT alpha2, alpha3, name, region FROM countries WHERE region = ? COLLATE NOCASE ORDER BY name',
                    description: 'List all countries in a geographic region',
                    parameters: [
                        {
                            position: { key: 'region', value: '{{USER_PARAM}}' },
                            z: { primitive: 'enum(Africa,Americas,Asia,Europe,Oceania)', options: [] }
                        }
                    ],
                    output: {
                        mimeType: 'application/json',
                        schema: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    alpha2: { type: 'string', description: 'ISO 3166-1 alpha-2 code' },
                                    alpha3: { type: 'string', description: 'ISO 3166-1 alpha-3 code' },
                                    name: { type: 'string', description: 'Country name in English' },
                                    region: { type: 'string', description: 'Geographic region' }
                                }
                            }
                        }
                    },
                    tests: [
                        { _description: 'European countries', region: 'Europe' },
                        { _description: 'Asian countries', region: 'Asia' }
                    ]
                }
            }
        }
    }
}
