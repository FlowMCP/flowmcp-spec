# FlowMCP Specification v4.3.0 — MCP Tasks

| Field | Value |
|-------|-------|
| Depends on | [00-overview.md](./00-overview.md), [01-schema-format.md](./01-schema-format.md) |
| Related | [04-output-schema.md](./04-output-schema.md), [10-tests.md](./10-tests.md) |

> Normative language (MUST/SHOULD/MAY) follows the conventions defined in [00-overview.md](./00-overview.md) (Conformance Language).

MCP Tasks describe long-running asynchronous operations — a query that takes thirty seconds to finish, a job that is submitted now and collected later. The underlying MCP protocol gives such operations a lifecycle of creation, polling, completion, and cancellation. FlowMCP does not yet model this lifecycle: task support is a reserved, forward-looking area of the specification, and this page documents what is held back and why.

---

## Why It Is Held Back

A schema describes how to talk to an **external API's** asynchronous pattern — submitting a job, polling its status, retrieving the result once it is ready. The MCP Tasks protocol describes something different: how the **MCP server itself** surfaces its own asynchronous operations to AI clients. These are two distinct layers, and binding them together cleanly is what task support depends on. A future revision will define:

- Schema-level fields for declaring asynchronous tools
- A mapping between an external API's own status values and MCP Task states
- Integration with the MCP Tasks protocol operations (`tasks/get`, `tasks/result`, `tasks/cancel`)

---

## Reserved Fields

Schema authors MAY include an `async` field in tool definitions for forward compatibility. The runtime currently **ignores** this field but preserves it untouched, so schemas written today remain valid once task support lands.

---

## Reference

- [MCP Tasks Specification](https://modelcontextprotocol.io/specification/basic/utilities/tasks)
- [SEP-1686: Tasks — protocol discussion](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1686)
