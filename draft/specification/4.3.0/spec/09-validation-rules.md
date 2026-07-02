# 09. Validation Rules

| Field | Value |
|---|---|
| Status | Normative |
| Depends on | [00-overview.md](./00-overview.md), [01-schema-format.md](./01-schema-format.md) |
| Related | [05-security.md](./05-security.md), [02-parameters.md](./02-parameters.md), [06-agents.md](./06-agents.md), [13-resources.md](./13-resources.md), [14-skills.md](./14-skills.md), [16-id-schema.md](./16-id-schema.md), [17-selections.md](./17-selections.md), [20-validation-strategy.md](./20-validation-strategy.md) |

Every validation rule that `flowmcp schema-check` enforces carries a code, a severity, and a one-line description. Rather than collect those rules into a single distant list, the specification keeps each family of rules next to the feature it governs — resource rules live with the resource spec, skill rules with the skill spec, and so on. This page is the wayfinder for that arrangement: it names each rule family, explains its code prefix, and links straight to the section where the rules are defined and explained.

A rule is defined in exactly one place. The page below it in the table is the authoritative home for that code prefix; nothing on this page duplicates those tables. What remains here is the cross-cutting material that belongs to the validation system as a whole — the meaning of each severity level and the shape of the CLI output.

---

## Rule Families

Each rule family is owned by one topic page. Follow the link to read the rules, their severities, and the rationale behind them.

| Rule family | Code prefix | Defined in |
|-------------|-------------|------------|
| Schema structure, `main` block, tools, parameters, output | `VAL` | [Schema Format → Constraints](./01-schema-format.md#constraints) |
| Parameters, `z` validation, placeholders | `VAL`, `PH` | [Parameters → Z Block (Validation)](./02-parameters.md#z-block-validation) |
| Output schema | `VAL` | [Output Schema → Validation Rules](./04-output-schema.md#validation-rules) |
| Static security scan, library allowlist | `SEC` | [Security → Static Security Scan](./05-security.md#static-security-scan) |
| Agents | `AGT` | [Agents → Validation Rules](./06-agents.md#validation-rules) |
| Tests | `TST` | [Tests → Validation Rules](./10-tests.md#validation-rules) |
| Caching / preload | `VAL` | [Preload & Caching → Validation Rules](./11-preload.md#validation-rules) |
| Prompts | `PRM` | [Prompt Architecture → Validation Rules](./12-prompt-architecture.md#validation-rules) |
| Resources | `RES` | [Resources → Validation Rules](./13-resources.md#validation-rules) |
| Skills, dependency cross-checks | `SKL`, `DEP` | [Skills → Validation Rules](./14-skills.md#validation-rules) |
| Catalog / registry | `CAT` | [Catalog → Validation Rules](./15-catalog.md#validation-rules) |
| IDs and namespaces | `ID` | [ID Schema → Validation Rules](./16-id-schema.md#validation-rules) |
| Selections | `SEL` | [Selections → Validation Rules](./17-selections.md#validation-rules) |
| Shared lists | `LST` | [Validation Strategy](./20-validation-strategy.md) |

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


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./00-overview.md](./00-overview.md) — see chapter 00.
- [./01-schema-format.md](./01-schema-format.md) — see chapter 01.
- [./02-parameters.md](./02-parameters.md) — see chapter 02.
- [./05-security.md](./05-security.md) — see chapter 05.
- [./06-agents.md](./06-agents.md) — see chapter 06.
- [./13-resources.md](./13-resources.md) — see chapter 13.
- [./14-skills.md](./14-skills.md) — see chapter 14.
- [./16-id-schema.md](./16-id-schema.md) — see chapter 16.
- [./17-selections.md](./17-selections.md) — see chapter 17.
- [./20-validation-strategy.md](./20-validation-strategy.md) — see chapter 20.
