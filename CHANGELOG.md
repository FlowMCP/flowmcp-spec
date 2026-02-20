# Changelog

## v2.0.0 — 2026-02-16

Initial release of the FlowMCP Specification v2.0.0.

### Added

- **Schema Format**: `main` + `handlers` split for hashable declarations and executable code
- **Shared Lists**: Reusable value lists with dependencies and version pinning
- **Output Schema**: Per-route output definitions with MIME-Type support
- **Security Model**: Static scan, trust boundary, restricted handler zone
- **Cherry-Pick Groups**: Tool-level grouping with SHA-256 integrity hashes
- **MCP Tasks**: Reserved fields for async operations (implementation in v2.1.0)
- **Migration Guide**: Step-by-step migration from v1.2.0 to v2.0.0
- **Validation Rules**: Complete validation checklist for schemas, lists, and groups
- **Route Tests**: Declarative test format for schema routes
- **Preload**: Schema initialization with startup data before first request
- **Group Prompts**: LLM prompt workflows that guide agents through multi-step tool usage within groups
- **Example Schemas**: Minimal, shared-list, multi-route, async, and list definition examples
