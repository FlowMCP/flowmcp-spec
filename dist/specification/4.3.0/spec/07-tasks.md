---
title: "MCP Tasks"
description: "MCP Tasks describe long-running asynchronous operations — a query that takes thirty seconds to finish, a job that is submitted now and collected later. The underlying MCP protocol gives such..."
family: "specification"
spec_version: "4.3.0"
spec_file: "07-tasks.md"
order: 7
section: "specification"
normative: true
generated_at: "2026-07-10T04:03:59.458Z"
generated_from: "draft/specification/4.3.0/spec/07-tasks.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/specification/4.3.0/spec/07-tasks.md."
---


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


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./00-overview.md](/specification/overview/) — see chapter 00.
- [./01-schema-format.md](/specification/schema-format/) — see chapter 01.
- [./04-output-schema.md](/specification/output-schema/) — see chapter 04.
- [./10-tests.md](/specification/tests/) — see chapter 10.
