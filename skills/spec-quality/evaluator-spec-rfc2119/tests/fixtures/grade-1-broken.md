# FlowMCP Specification v4.0.0 — Sample Broken File

This file is intentionally broken. It is missing the Conformance Language reference (RFC-001 + RFC-006), has multiple negation errors (RFC-005), and several other violations.

---

## Schema Format

A schema must export a `main` constant. A schema MUSTNOT use `main.skills`. The schema SHALLNOT contain any handler imports. A tool mustn't reference itself recursively. Tools shouldn't have a leading underscore.

A schema must include tests. Tools must have a unique identifier. The `main` block must contain primitives. Resources must declare a source. Prompts must reference at least one tool.

We must remember that this is just a fixture.
