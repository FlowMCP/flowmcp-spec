# FlowMCP Specification v3.0.0 — Validation Rules

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
| VAL005 | warning | `handlers` function must return an object with keys matching tool names |

---

## Main Block — Required Fields

| Code | Severity | Rule |
|------|----------|------|
| VAL010 | error | `main.namespace` is required and must be a string |
| VAL011 | error | `main.namespace` must match `^[a-z]+$` |
| VAL012 | error | `main.name` is required and must be a string |
| VAL013 | error | `main.description` is required and must be a string |
| VAL014 | error | `main.version` is required and must match `^3\.\d+\.\d+$` (version `^2\.\d+\.\d+$` accepted with deprecation warning) |
| VAL015 | error | `main.root` is required when `main.tools` is non-empty. Optional for resource-only or skill-only schemas. |
| VAL016 | error | `main.tools` (or deprecated `main.routes`) must be an object. May be empty `{}` if `main.resources` or `main.skills` is defined. |
| VAL017 | error | Schema must not define both `main.tools` and `main.routes` simultaneously |
| VAL018 | warning | `main.routes` is deprecated. Use `main.tools` instead. |

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

## Tool Rules

| Code | Severity | Rule |
|------|----------|------|
| VAL030 | error | Tool name must match `^[a-z][a-zA-Z0-9]*$` |
| VAL031 | error | Maximum 8 tools per schema |
| VAL032 | error | `tool.method` is required and must be `GET`, `POST`, `PUT`, or `DELETE` |
| VAL033 | error | `tool.path` is required and must be a string starting with `/` |
| VAL034 | error | `tool.description` is required and must be a string |
| VAL035 | error | `tool.parameters` is required and must be an array |
| VAL036 | warning | `tool.output` is recommended for new schemas |
| VAL037 | info | `tool.async` is a reserved field (not executed in v3.0.0) |

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

## Resource Rules

| Code | Severity | Rule |
|------|----------|------|
| RES001 | error | `source` must be `'sqlite'`. No other values are accepted. |
| RES002 | error | `description` must be a non-empty string. |
| RES003 | error | `database` must be a relative path ending with `.db`. |
| RES004 | error | `database` path must not contain `..` segments. |
| RES005 | error | Maximum 2 resources per schema. |
| RES006 | error | Maximum 4 queries per resource. |
| RES007 | error | Each query must have a `sql` field of type string. |
| RES008 | error | Each query must have a `description` field of type string. |
| RES009 | error | Each query must have a `parameters` array. |
| RES010 | error | Each query must have an `output` object with `mimeType` and `schema`. |
| RES011 | error | Each query must have at least 1 test. |
| RES012 | error | SQL statement must begin with `SELECT` (case-insensitive, after whitespace trim). |
| RES013 | error | SQL statement must not contain blocked patterns: `ATTACH DATABASE`, `LOAD_EXTENSION`, `PRAGMA`, `CREATE`, `ALTER`, `DROP`, `INSERT`, `UPDATE`, `DELETE`, `REPLACE`, `TRUNCATE`. |
| RES014 | error | Number of parameters must match number of `?` placeholders in the SQL statement. |
| RES015 | error | Resource parameters must not have a `location` field in `position`. |
| RES016 | error | Resource parameters must not use `{{SERVER_PARAM:...}}` values. |
| RES017 | error | Resource name must match `^[a-z][a-zA-Z0-9]*$` (camelCase). |
| RES018 | error | Query name must match `^[a-z][a-zA-Z0-9]*$` (camelCase). |
| RES019 | error | Resource parameter primitives must be scalar: `string()`, `number()`, `boolean()`, or `enum()`. No `array()` or `object()`. |
| RES020 | warning | Database file should exist at validation time. Missing file produces a warning, not an error. |
| RES021 | error | `output.schema.type` must be `'array'` for resource queries. |
| RES022 | error | Test parameter values must pass the corresponding `z` validation. |
| RES023 | error | Test objects must be JSON-serializable. |

See `13-resources.md` for the complete resource specification.

---

## Skill Rules

### Structural Rules (Static Validation)

| Code | Severity | Rule |
|------|----------|------|
| SKL001 | error | Skill file must export `skill` as a named export |
| SKL002 | error | `skill.name` is required, must be a string, must match `^[a-z][a-z0-9-]{0,63}$` |
| SKL003 | error | `skill.name` must match the key in `main.skills` that references this file |
| SKL004 | error | `skill.version` is required and must be `'flowmcp-skill/1.0.0'` |
| SKL005 | error | Each entry in `requires.tools` must exist as a key in `main.tools` |
| SKL006 | error | Each entry in `requires.resources` must exist as a key in `main.resources` |
| SKL007 | error | `skill.description` is required, must be a string, maximum 1024 characters |
| SKL008 | error | Each `{{input:key}}` placeholder in `content` must have a matching entry in `skill.input` |
| SKL009 | error | `input[].values` is required when `type` is `'enum'` and forbidden otherwise |
| SKL010 | error | `skill.content` is required and must be a non-empty string |
| SKL011 | error | `skill.output` is required and must be a non-empty string |
| SKL012 | error | `input[].key` must match `^[a-z][a-zA-Z0-9]*$` (camelCase) |
| SKL013 | error | `input[].type` must be one of: `string`, `number`, `boolean`, `enum` |
| SKL014 | error | `input[].description` is required and must be a non-empty string |
| SKL015 | error | `input[].required` must be a boolean |
| SKL016 | error | `main.skills` entries: `file` must end with `.mjs` |
| SKL017 | error | `main.skills` entries: referenced file must exist |
| SKL018 | error | Maximum 4 skills per schema |

### Reference Rules (Cross-Validation)

| Code | Severity | Rule |
|------|----------|------|
| SKL020 | warning | `{{tool:name}}` placeholder in content references a tool not listed in `requires.tools` |
| SKL021 | warning | `{{resource:name}}` placeholder in content references a resource not listed in `requires.resources` |
| SKL022 | error | `{{skill:name}}` placeholder references a skill not in `main.skills` |
| SKL023 | error | `{{skill:name}}` target skill must not itself contain `{{skill:...}}` placeholders (1 level deep only) |
| SKL024 | warning | Entry in `requires.tools` is not referenced via `{{tool:...}}` in content |
| SKL025 | warning | Entry in `requires.resources` is not referenced via `{{resource:...}}` in content |

See `14-skills.md` for the complete skill specification.

---

## `dependsOn` / `requires` Cross-Checking Rules

| Code | Severity | Rule |
|------|----------|------|
| DEP001 | error | `requires.tools` entries in a skill must reference tools that exist in the same schema's `main.tools` |
| DEP002 | error | `requires.resources` entries in a skill must reference resources that exist in the same schema's `main.resources` |
| DEP003 | warning | Skill references a tool via `{{tool:name}}` in content but does not list it in `requires.tools` |
| DEP004 | warning | Skill references a resource via `{{resource:name}}` in content but does not list it in `requires.resources` |

---

## Async (Task) Rules

Async fields are reserved for future versions. If present, they are ignored by the runtime. No validation errors are raised for `async` fields in v3.0.0.

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

## Agent Validation Rules

| Code | Severity | Rule |
|------|----------|------|
| AGT001 | error | `name` is required, must match `^[a-z][a-z0-9-]*$` |
| AGT002 | error | `description` is required, must be a non-empty string |
| AGT003 | error | `model` is required, must contain `/` (OpenRouter syntax) |
| AGT004 | error | `version` must be `flowmcp/3.0.0` |
| AGT005 | error | `systemPrompt` is required, must be a non-empty string |
| AGT006 | error | `tools[]` is required, must be a non-empty array |
| AGT007 | error | Each tool reference must be a valid ID format (`namespace/type/name`) |
| AGT008 | error | `tests[]` is required, minimum 3 tests |
| AGT009 | error | Each test must have an `input` field of type string |
| AGT010 | error | Each test must have an `expectedTools` field as a non-empty array |
| AGT011 | error | Each `expectedTools` entry must be a valid ID (contains `/`) |
| AGT012 | warning | Tests should cover different tool combinations |
| AGT013 | error | `prompts` (if present) must be an Object (not Array) |
| AGT014 | error | `skills` (if present) must be an Object (not Array) |
| AGT015 | error | `resources` (if present) must be an Object (not Array) |
| AGT016 | error | Referenced prompt/skill files must exist and be `.mjs` files |
| AGT017 | error | Prompt files must have `export const prompt` (with `content` or `contentFile`) |
| AGT018 | error | Skill files must have `export const skill` (with `name`, `version`, `content`/`contentFile`, `requires`, `input`, `output`) |

See `06-agents.md` for the complete agent specification.

---

## Prompt Validation Rules

| Code | Severity | Rule |
|------|----------|------|
| PRM001 | error | `name` is required, must be a string, must match `^[a-z][a-z0-9-]*$` |
| PRM002 | error | `version` is required and must be `'flowmcp-prompt/1.0.0'` |
| PRM003 | error | Exactly one of `namespace` or `agent` must be set (not both, not neither) |
| PRM004 | error | `testedWith` is required when `agent` is set, forbidden when `namespace` is set |
| PRM005 | error | `testedWith` value must contain `/` (OpenRouter model ID format) |
| PRM006 | error | Each `dependsOn` entry must resolve to an existing tool in the catalog |
| PRM007 | error | Each `references[]` entry must resolve to an existing prompt in the catalog |
| PRM008 | error | Referenced prompts must not themselves have `references[]` (one level deep only) |
| PRM009 | error | `{{type:name}}` references in `content` must resolve to registered primitives (see PH002) |
| PRM010 | error | `content` OR `contentFile` must be present (XOR — exactly one must be set) |

See `12-prompt-architecture.md` for the complete prompt specification.

---

## Catalog Validation Rules

| Code | Severity | Rule |
|------|----------|------|
| CAT001 | error | `registry.json` must exist in the catalog root directory |
| CAT002 | error | `name` field must match the catalog directory name |
| CAT003 | error | All `shared[].file` paths must resolve to existing files |
| CAT004 | error | All `schemas[].file` paths must resolve to existing files |
| CAT005 | error | All `agents[].manifest` paths must resolve to existing files |
| CAT006 | warning | Orphaned files (exist in the catalog directory but are not listed in `registry.json`) should be reported |
| CAT007 | error | `schemaSpec` must be a valid FlowMCP specification version |

See `15-catalog.md` for the complete catalog specification.

---

## ID Validation Rules

| Code | Severity | Rule |
|------|----------|------|
| ID001 | error | ID must contain at least one `/` separator |
| ID002 | error | Namespace must match `^[a-z][a-z0-9-]*$` |
| ID003 | error | ResourceType (if present) must be one of: `tool`, `resource`, `prompt`, `list` |
| ID004 | error | Name must not be empty |
| ID005 | warning | Short form should only be used in unambiguous contexts |
| ID006 | error | Full form is required in `registry.json` and validation rules |

See `16-id-schema.md` for the complete ID schema specification.

---

## Placeholder Validation Rules

| Code | Severity | Rule |
|------|----------|------|
| PH001 | error | `{{type:name}}` content must not be empty |
| PH002 | error | References (content containing `/`) must resolve to a registered tool, resource, or prompt in the catalog |
| PH003 | error | Parameter names (content without `/`) must match `^[a-zA-Z][a-zA-Z0-9]*$` |
| PH004 | error | `{{type:name}}` placeholders are only valid in prompt/skill `content` fields, not in schema `main` blocks |

See `02-parameters.md` for the complete parameter and placeholder specification.

---

## Test Requirements

| Code | Severity | Rule |
|------|----------|------|
| TST001 | error | Each tool must have at least 3 tests. Each resource query must have at least 3 tests. Each agent must have at least 3 tests. |
| TST002 | error | Each test must have a `_description` field of type string |
| TST003 | error | Each test must provide values for all required `{{USER_PARAM}}` parameters |
| TST004 | error | Test parameter values must pass the corresponding `z` validation |
| TST005 | error | Test objects must be JSON-serializable (no functions, no Date, no undefined) |
| TST006 | error | Test objects must only contain keys that match `{{USER_PARAM}}` parameter keys or `_description` |
| TST007 | warning | Tools/queries with enum or chain parameters should have tests covering multiple enum values |
| TST008 | info | Consider adding tests that demonstrate optional parameter usage |
| TST009 | error | Each agent test must have an `input` field of type string |
| TST010 | error | Each agent test must have an `expectedTools` field as non-empty array |
| TST011 | error | Each expectedTools entry must be a valid ID (contains `/`) |
| TST012 | warning | Agent tests should cover different tool combinations |
| TST013 | info | Consider adding expectedContent assertions for richer validation |

See `10-tests.md` for the complete test specification including format, design principles, and the response capture lifecycle.

---

## Validation Output Format

The CLI displays results grouped by severity with the rule code, severity, location, and description:

```
flowmcp validate etherscan/contracts.mjs

  VAL014 error   main.version: Must match ^3\.\d+\.\d+$ (found "1.2.0")
  VAL031 error   tools: Maximum 8 tools exceeded (found 10)
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
