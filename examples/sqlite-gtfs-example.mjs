// FlowMCP Spec v4.1.0 — sqlite-gtfs Resource Example
// Demonstrates the sqlite-gtfs source type (Design C — top-level with inheritance).
// The database itself is NOT shipped with this example — the user provides it
// locally under ${FLOWMCP_RESOURCES}. Provider GTFS data must never be
// committed to public repositories.

export const schema = {
    namespace: 'gtfsde',
    name: 'gtfsde-transit-v2',
    version: '2.0.0',
    main: {
        resources: [
            {
                source: 'sqlite-gtfs',
                mode: 'file-based',
                path: '${FLOWMCP_RESOURCES}/gtfs-de.db',
                addon: 'geo-gtfs-toolkit',
                addonVersion: '>=0.1.0',
                addonSource: 'github:FlowMCP/gtfs-sqlite-toolkit'
            }
        ],
        tools: [
            // Standard-GTFS-Tools werden auto-injiziert (siehe gtfs-sqlite-toolkit).
            // Schema-spezifische Tools koennen hier ergaenzt werden.
        ]
    }
}
