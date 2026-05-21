# FlowMCP Specification v4.0.0 — Sample Perfect File

> Normative language (MUST/SHOULD/MAY) follows the conventions defined in [00-overview.md](./00-overview.md) (Conformance Language).

This document is a test fixture for `evaluator-spec-rfc2119`. It demonstrates a file that fully conforms to RFC2119/BCP14 conventions and is expected to receive grade 5.

---

## Schema Format

A schema MUST export a `main` constant. A schema MUST NOT use `main.skills`. A schema SHOULD include at least three deterministic test cases. A schema MAY declare a `meta.alwaysLoad` flag.

The `main` block MUST contain at least one of `tools`, `resources`, `prompts`, or `selections`. Tools MUST have a unique `namespace/tool/name` identifier.

## Examples

For more details, see [14-skills.md](./14-skills.md) and [09-validation-rules.md](./09-validation-rules.md).

## References

This file follows the RFC2119/BCP14/RFC8174 conventions for normative language. External references:

- [RFC2119](https://www.rfc-editor.org/rfc/rfc2119)
- [RFC8174](https://www.rfc-editor.org/rfc/rfc8174)
