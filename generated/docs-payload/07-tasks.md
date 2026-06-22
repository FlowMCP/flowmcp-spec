---
title: "MCP Tasks"
description: "MCP Tasks describe long-running asynchronous operations — a query that takes thirty seconds to finish, a job that is submitted now and collected later. The underlying MCP protocol gives such..."
spec_version: "4.3.0"
spec_file: "07-tasks.md"
order: 7
section: "Specification"
normative: true
source_commit: "95ebb83"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/95ebb83/spec/v4.3.0/07-tasks.md"
generated_at: "2026-06-22T15:23:11.485Z"
generated_from: "spec/v4.3.0/07-tasks.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v4.3.0/07-tasks.md."
---

MCP Tasks describe long-running asynchronous operations — a query that takes thirty seconds to finish, a job that is submitted now and collected later. The underlying MCP protocol gives such operations a lifecycle of creation, polling, completion, and cancellation. FlowMCP does not yet model this lifecycle: task support is a reserved, forward-looking area of the specification, and this page documents what is held back and why.


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

## Related

- [00-overview.md](/specification/overview/) — mission, the two-channel catalog, and the knowledge framing.
- [01-schema-format.md](/specification/schema-format/) — how a schema declares its tools through main and handlers.
- [04-output-schema.md](/specification/output-schema/) — how a route declares its expected response shape.
- [10-tests.md](/specification/tests/) — executable examples that document tools and capture real responses.

