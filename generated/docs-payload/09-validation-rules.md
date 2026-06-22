---
title: "Validation Rules"
description: "Every validation rule that `flowmcp schema-check` enforces carries a code, a severity, and a one-line description. Rather than collect those rules into a single distant list, the specification keeps..."
spec_version: "4.3.0"
spec_file: "09-validation-rules.md"
order: 9
section: "Specification"
normative: true
source_commit: "95ebb83"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/95ebb83/spec/v4.3.0/09-validation-rules.md"
generated_at: "2026-06-22T15:23:11.485Z"
generated_from: "spec/v4.3.0/09-validation-rules.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v4.3.0/09-validation-rules.md."
---

Every validation rule that `flowmcp schema-check` enforces carries a code, a severity, and a one-line description. Rather than collect those rules into a single distant list, the specification keeps each family of rules next to the feature it governs — resource rules live with the resource spec, skill rules with the skill spec, and so on. This page is the wayfinder for that arrangement: it names each rule family, explains its code prefix, and links straight to the section where the rules are defined and explained.

A rule is defined in exactly one place. The page below it in the table is the authoritative home for that code prefix; nothing on this page duplicates those tables. What remains here is the cross-cutting material that belongs to the validation system as a whole — the meaning of each severity level and the shape of the CLI output.


## Rule Families

Each rule family is owned by one topic page. Follow the link to read the rules, their severities, and the rationale behind them.

| Rule family | Code prefix | Defined in |
|-------------|-------------|------------|
| Schema structure, `main` block, tools, parameters, output | `VAL` | [Schema Format → Constraints](/specification/schema-format/#constraints) |
| Parameters, `z` validation, placeholders | `VAL`, `PH` | [Parameters → Z Block (Validation)](/specification/parameters/#z-block-validation) |
| Output schema | `VAL` | [Output Schema → Validation Rules](/specification/output-schema/#validation-rules) |
| Static security scan, library allowlist | `SEC` | [Security → Static Security Scan](/specification/security/#static-security-scan) |
| Agents | `AGT` | [Agents → Validation Rules](/specification/agents/#validation-rules) |
| Tests | `TST` | [Tests → Validation Rules](/specification/tests/#validation-rules) |
| Caching / preload | `VAL` | [Preload & Caching → Validation Rules](/specification/preload/#validation-rules) |
| Prompts | `PRM` | [Prompt Architecture → Validation Rules](/specification/prompt-architecture/#validation-rules) |
| Resources | `RES` | [Resources → Validation Rules](/specification/resources/#validation-rules) |
| Skills, dependency cross-checks | `SKL`, `DEP` | [Skills → Validation Rules](/specification/skills/#validation-rules) |
| Catalog / registry | `CAT` | [Catalog → Validation Rules](/specification/catalog/#validation-rules) |
| IDs and namespaces | `ID` | [ID Schema → Validation Rules](/specification/id-schema/#validation-rules) |
| Selections | `SEL` | [Selections → Validation Rules](/specification/selections/#validation-rules) |
| Shared lists | `LST` | [Validation Strategy](/specification/validation-strategy/) |

---

## Severity Levels

| Severity | Description | Effect |
|----------|-------------|--------|
| `error` | Must fix before use | Schema cannot be loaded |
| `warning` | Should fix | Schema loads with warnings |
| `info` | Nice to have | Informational only |

---

## Validation Output Format

The CLI displays results grouped by severity with the rule code, severity, location, and description:

```
flowmcp schema-check etherscan/contracts.mjs

  VAL014 error   main.version: Must match ^4\.\d+\.\d+$ (found "1.2.0")
  VAL031 error   tools: Maximum 8 tools exceeded (found 10)
  VAL036 warning getContractAbi: output schema is recommended
  TST001 warning getContractAbi: No tests found

  2 errors, 2 warnings
  Schema cannot be loaded (has errors)
```

When all rules pass:

```
flowmcp schema-check etherscan/contracts.mjs

  0 errors, 0 warnings
  Schema is valid
```

With security flag:

```
flowmcp schema-check --security etherscan/contracts.mjs

  SEC001 error   Line 3: Forbidden pattern "import" detected
  SEC017 error   main.handlers.preRequest: Non-serializable value (function)

  2 errors, 0 warnings
  Schema cannot be loaded (has errors)
```

## Related

- [00-overview.md](/specification/overview/) — mission, the two-channel catalog, and the knowledge framing.
- [01-schema-format.md](/specification/schema-format/) — how a schema declares its tools through main and handlers.
- [05-security.md](/specification/security/) — the trust boundary that keeps schema handlers off the network and filesystem.
- [02-parameters.md](/specification/parameters/) — how a parameter places a value and validates it before the call.
- [06-agents.md](/specification/agents/) — how an agent bundles tools, a model, and a prompt into one composition.
- [13-resources.md](/specification/resources/) — local SQLite and Markdown data access alongside network tools.
- [14-skills.md](/specification/skills/) — reusable instruction sets an agent can load and follow.
- [16-id-schema.md](/specification/id-schema/) — the canonical namespace/type/name identifier for every primitive.
- [17-selections.md](/specification/selections/) — a named bundle of primitives an agent activates together.
- [20-validation-strategy.md](/specification/validation-strategy/) — the deterministic and probabilistic layers behind the A-F grade.

