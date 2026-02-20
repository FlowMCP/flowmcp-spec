// FlowMCP v2.0.0 — Multi-Step API Workflow Schema Example
// Demonstrates multi-step API workflow with execute, poll status, and retrieve results

export const main = {
    namespace: 'dune',
    name: 'QueryEngine',
    description: 'Execute and retrieve Dune Analytics SQL queries',
    version: '2.0.0',
    docs: [ 'https://docs.dune.com/api-reference/executions' ],
    tags: [ 'analytics', 'sql', 'blockchain' ],
    root: 'https://api.dune.com',
    requiredServerParams: [ 'DUNE_API_KEY' ],
    requiredLibraries: [],
    headers: {},
    routes: {
        executeQuery: {
            method: 'POST',
            path: '/api/v1/query/{{queryId}}/execute',
            description: 'Execute a saved Dune query',
            parameters: [
                {
                    position: { key: 'queryId', value: '{{USER_PARAM}}', location: 'insert' },
                    z: { primitive: 'number()', options: [ 'min(1)' ] }
                },
                {
                    position: { key: 'x-dune-api-key', value: '{{SERVER_PARAM:DUNE_API_KEY}}', location: 'body' },
                    z: { primitive: 'string()', options: [] }
                }
            ],
            output: {
                mimeType: 'application/json',
                schema: {
                    type: 'object',
                    properties: {
                        execution_id: { type: 'string', description: 'Unique execution identifier' },
                        state: { type: 'string', description: 'Current execution state' }
                    }
                }
            }
        },
        getExecutionStatus: {
            method: 'GET',
            path: '/api/v1/execution/{{executionId}}/status',
            description: 'Check the status of a query execution',
            parameters: [
                {
                    position: { key: 'executionId', value: '{{USER_PARAM}}', location: 'insert' },
                    z: { primitive: 'string()', options: [] }
                },
                {
                    position: { key: 'x-dune-api-key', value: '{{SERVER_PARAM:DUNE_API_KEY}}', location: 'body' },
                    z: { primitive: 'string()', options: [] }
                }
            ],
            output: {
                mimeType: 'application/json',
                schema: {
                    type: 'object',
                    properties: {
                        execution_id: { type: 'string', description: 'Execution identifier' },
                        state: { type: 'string', description: 'Current state' },
                        queue_position: { type: 'number', description: 'Position in execution queue', nullable: true }
                    }
                }
            }
        },
        getExecutionResults: {
            method: 'GET',
            path: '/api/v1/execution/{{executionId}}/results',
            description: 'Get the results of a completed query execution',
            parameters: [
                {
                    position: { key: 'executionId', value: '{{USER_PARAM}}', location: 'insert' },
                    z: { primitive: 'string()', options: [] }
                },
                {
                    position: { key: 'x-dune-api-key', value: '{{SERVER_PARAM:DUNE_API_KEY}}', location: 'body' },
                    z: { primitive: 'string()', options: [] }
                }
            ],
            output: {
                mimeType: 'application/json',
                schema: {
                    type: 'object',
                    properties: {
                        execution_id: { type: 'string' },
                        state: { type: 'string' },
                        result: {
                            type: 'object',
                            properties: {
                                rows: { type: 'array', items: { type: 'object' } },
                                metadata: {
                                    type: 'object',
                                    properties: {
                                        column_names: { type: 'array', items: { type: 'string' } },
                                        result_set_bytes: { type: 'number' },
                                        total_row_count: { type: 'number' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
