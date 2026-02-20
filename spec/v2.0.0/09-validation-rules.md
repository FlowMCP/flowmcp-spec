# FlowMCP Specification v2.0.0 — Validation Rules

This document defines all validation rules enforced by `flowmcp validate`. Each rule has a code, severity, and description.

---

## Severity Levels

| Severity | Description | Effect |
|----------|-------------|--------|
| `error` | Must fix before use | Schema cannot be loaded |
| `warning` | Should fix | Schema loads with warnings |
| `info` | Nice to have | Informational only |

---

## Schema Structure Rules

| Code | Severity | Rule |
|------|----------|------|
| VAL001 | error | Schema must export `main` as named export |
| VAL002 | error | `main` must be an object |
| VAL003 | error | `main` must not contain unknown fields |
| VAL004 | error | `handlers` (if exported) must be a function |
| VAL005 | warning | `handlers` function must return an object with keys matching route names |

---

## Main Block — Required Fields

| Code | Severity | Rule |
|------|----------|------|
| VAL010 | error | `main.namespace` is required and must be a string |
| VAL011 | error | `main.namespace` must match `^[a-z]+$` |
| VAL012 | error | `main.name` is required and must be a string |
| VAL013 | error | `main.description` is required and must be a string |
| VAL014 | error | `main.version` is required and must match `^2\.\d+\.\d+$` |
| VAL015 | error | `main.root` is required and must be a valid URL |
| VAL016 | error | `main.routes` is required and must be a non-empty object |

---

## Main Block — Optional Fields

| Code | Severity | Rule |
|------|----------|------|
| VAL020 | error | `main.docs` (if present) must be an array of strings |
| VAL021 | error | `main.tags` (if present) must be an array of strings |
| VAL022 | error | `main.requiredServerParams` (if present) must be an array of strings |
| VAL023 | error | `main.headers` (if present) must be a plain object |
| VAL024 | error | `main.sharedLists` (if present) must be an array of objects |
| VAL025 | error | `main.requiredLibraries` (if present) must be an array of strings |
| VAL026 | error | Each entry in `requiredLibraries` must be on the runtime allowlist |

---

## Route Rules

| Code | Severity | Rule |
|------|----------|------|
| VAL030 | error | Route name must match `^[a-z][a-zA-Z0-9]*$` |
| VAL031 | error | Maximum 8 routes per schema |
| VAL032 | error | `route.method` is required and must be `GET`, `POST`, `PUT`, or `DELETE` |
| VAL033 | error | `route.path` is required and must be a string starting with `/` |
| VAL034 | error | `route.description` is required and must be a string |
| VAL035 | error | `route.parameters` is required and must be an array |
| VAL036 | warning | `route.output` is recommended for new schemas |
| VAL037 | info | `route.async` is a reserved field (not executed in v2.0.0) |

---

## Parameter Rules

| Code | Severity | Rule |
|------|----------|------|
| VAL040 | error | Each parameter must have `position` and `z` objects |
| VAL041 | error | `position.key` is required and must be a string |
| VAL042 | error | `position.value` is required and must be a string |
| VAL043 | error | `position.location` must be `insert`, `query`, or `body` |
| VAL044 | error | `z.primitive` is required and must be a valid primitive type |
| VAL045 | error | `z.options` must be an array of strings |
| VAL046 | error | `enum()` values must not be empty |
| VAL047 | error | Shared list interpolation `{{listName:fieldName}}` is only allowed in `enum()` |
| VAL048 | error | Referenced shared list must be declared in `main.sharedLists` |
| VAL049 | error | Referenced field must exist in the shared list's `meta.fields` |
| VAL050 | error | `insert` parameters must have a corresponding `{{key}}` in `route.path` |

---

## Output Schema Rules

| Code | Severity | Rule |
|------|----------|------|
| VAL060 | error | `output.mimeType` must be a supported MIME-Type |
| VAL061 | error | `output.schema` must be a valid schema definition |
| VAL062 | error | `output.schema.type` must match MIME-Type expectations |
| VAL063 | warning | Nested depth should not exceed 4 levels |
| VAL064 | error | `properties` is only valid when `type` is `object` |
| VAL065 | error | `items` is only valid when `type` is `array` |

---

## Shared List Reference Rules

| Code | Severity | Rule |
|------|----------|------|
| VAL070 | error | `sharedLists[].ref` is required and must be a string |
| VAL071 | error | `sharedLists[].version` is required and must be semver |
| VAL072 | error | Referenced list must exist in the list registry |
| VAL073 | error | Referenced list version must match or be compatible |
| VAL074 | error | `filter` (if present) must have valid `key` field |
| VAL075 | warning | Unused shared list reference (not used by any parameter or handler) |

---

## Async (Task) Rules

Async fields are reserved for v2.1.0. If present, they are ignored by the runtime. No validation errors are raised for `async` fields in v2.0.0.

---

## Security Rules

| Code | Severity | Rule |
|------|----------|------|
| SEC001 | error | Forbidden pattern found in schema file — no `import` statements allowed (see [05-security.md](./05-security.md)) |
| SEC002 | error | `main` block contains non-serializable value (function, symbol, etc.) |
| SEC003 | error | Shared list file contains forbidden pattern |
| SEC004 | error | Shared list file contains executable code |
| SEC005 | error | `requiredLibraries` contains unapproved package |

---

## Shared List Validation Rules

| Code | Severity | Rule |
|------|----------|------|
| LST001 | error | List must export `list` as named export |
| LST002 | error | `list.meta.name` is required and must be unique |
| LST003 | error | `list.meta.version` is required and must be semver |
| LST004 | error | `list.meta.fields` is required and must be a non-empty array |
| LST005 | error | Each field must have `key`, `type`, and `description` |
| LST006 | error | `list.entries` is required and must be a non-empty array |
| LST007 | error | Each entry must have all required fields |
| LST008 | error | Entry field types must match `meta.fields` type declarations |
| LST009 | error | `dependsOn` references must resolve to existing lists |
| LST010 | error | Circular dependencies are forbidden |
| LST011 | error | Maximum dependency depth: 3 levels |

---

## Group Validation Rules

| Code | Severity | Rule |
|------|----------|------|
| GRP001 | error | Group name must match `^[a-z][a-z0-9-]*$` |
| GRP002 | error | Maximum 50 tools per group |
| GRP003 | error | Tool reference must follow `namespace/file::route` format |
| GRP004 | error | All referenced tools must be resolvable |
| GRP005 | error | Duplicate tool references are forbidden |
| GRP006 | error | Group hash must match calculated hash |

---

## Test Requirements

| Code | Severity | Rule |
|------|----------|------|
| TST001 | error | Each route must have at least 1 test |
| TST002 | error | Each test must have a `_description` field of type string |
| TST003 | error | Each test must provide values for all required `{{USER_PARAM}}` parameters |
| TST004 | error | Test parameter values must pass the corresponding `z` validation |
| TST005 | error | Test objects must be JSON-serializable (no functions, no Date, no undefined) |
| TST006 | error | Test objects must only contain keys matching `{{USER_PARAM}}` parameter keys or `_description` |
| TST007 | warning | Routes with enum or chain parameters should have tests covering multiple enum values |
| TST008 | info | Consider adding tests that demonstrate optional parameter usage |

See `10-route-tests.md` for the complete test specification including format, design principles, and the response capture lifecycle.

---

## Validation Output Format

The CLI displays results grouped by severity with the rule code, severity, location, and description:

```
flowmcp validate etherscan/contracts.mjs

  VAL014 error   main.version: Must match ^2\.\d+\.\d+$ (found "1.2.0")
  VAL031 error   routes: Maximum 8 routes exceeded (found 10)
  VAL036 warning getContractAbi: output schema is recommended
  TST001 warning getContractAbi: No tests found

  2 errors, 2 warnings
  Schema cannot be loaded (has errors)
```

When all rules pass:

```
flowmcp validate etherscan/contracts.mjs

  0 errors, 0 warnings
  Schema is valid
```

With security flag:

```
flowmcp validate --security etherscan/contracts.mjs

  SEC001 error   Line 3: Forbidden pattern "import" detected
  SEC002 error   main.handlers.preRequest: Non-serializable value (function)

  2 errors, 0 warnings
  Schema cannot be loaded (has errors)
```
