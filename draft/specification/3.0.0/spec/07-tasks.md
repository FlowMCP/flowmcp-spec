# FlowMCP Specification v2.0.0 — MCP Tasks

## Status

**Deferred to v2.1.0.** This section is a placeholder.

MCP Tasks enable long-running asynchronous operations (e.g. executing a Dune Analytics query that takes 30+ seconds). The MCP protocol defines a task lifecycle with creation, polling, completion, and cancellation.

---

## Why Deferred

FlowMCP schemas describe how to interact with **external API async patterns** (job submission, status polling, result retrieval). The MCP Tasks protocol defines how the **MCP server itself** exposes async operations to AI clients. These are two complementary layers that need careful alignment.

v2.1.0 will define:
- Schema-level fields for declaring async routes
- Mapping between external API status values and MCP Task states
- Integration with the MCP Tasks protocol (`tasks/get`, `tasks/result`, `tasks/cancel`)

---

## Reference

- [MCP Tasks Specification (2025-11-25)](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/tasks)
- [SEP-1686: Tasks — GitHub Discussion](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1686)

---

## Reserved Fields

Schema authors may include an `async` field in route definitions for forward compatibility. In v2.0.0, this field is **ignored** by the runtime but preserved for future use.
