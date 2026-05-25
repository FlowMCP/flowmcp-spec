---
title: "License & Terms of Services"
description: "FlowMCP operates in a three-layer license model. **Schema authors and users MUST understand all three layers.**"
spec_version: "4.1.0"
spec_file: "23-license-and-tos.md"
order: 23
section: "Specification"
normative: true
source_commit: "07d4071"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/07d4071/spec/v4.1.0/23-license-and-tos.md"
generated_at: "2026-05-25T03:02:46.785Z"
generated_from: "spec/v4.1.0/23-license-and-tos.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v4.1.0/23-license-and-tos.md."
---

> Normative language (MUST/SHOULD/MAY) follows the conventions defined in [Conformance Language](/specification/overview/#conformance-language).

> Defines how FlowMCP handles third-party API Terms of Services (ToS) and data licensing.

## Three-Layer License Model

FlowMCP operates in a three-layer license model. **Schema authors and users MUST understand all three layers.**

| Layer | What | Who Decides | What FlowMCP Does |
|-------|------|-------------|---------------------|
| **1. FlowMCP Schema Code** | The schema definition (`.mjs` files), core library, CLI | FlowMCP (we) | MIT-licensed |
| **2. API Provider ToS** | Terms of Services for using the third-party API | API Provider | **Link only — no classification** |
| **3. Data License** | License of returned data (e.g. CC-BY, Public Domain) | Data publisher | **Link only — no classification** |

## What FlowMCP Does NOT Do

We **do not** classify or interpret Terms of Services. This is intentional:

- ToS are living documents — they change without notice
- ToS interpretation requires legal expertise
- We have no jurisdiction to make compliance statements
- Users are solely responsible for compliance

## Schema-Level Optional Fields

Schemas MAY include optional ToS-related fields in the `main` block:

```javascript
export const schema = {
    main: {
        namespace: 'coingecko',
        version: '4.0.0',
        // ... required fields ...

        // Optional ToS Fields (informational only)
        docs: ['https://docs.coingecko.com'],
        termsOfService: 'https://www.coingecko.com/en/terms',
        termsOfServiceCheckedAt: '2026-05-18',
        termsOfServiceLanguage: 'en',
        dataLicense: null,
        dataLicenseName: null
    },
    tools: { ... }
}
```

### Field Semantics

| Field | Set when | Null when |
|-------|----------|-----------|
| `termsOfService` | ToS URL is known and verified | No ToS found, or not yet researched |
| `termsOfServiceCheckedAt` | URL was verified to be live and applicable to the API | URL not yet checked |
| `termsOfServiceLanguage` | Primary language of ToS document detected | URL not yet checked |
| `dataLicense` | Provider explicitly publishes a separate data license URL | No explicit data license |
| `dataLicenseName` | Common name of the data license (e.g. CC-BY) | No explicit data license |

## Implementation in flowmcp-cli

Schema authors are encouraged to use the `tos-research` skill to populate these fields semi-automatically.

The CLI exposes an opt-in disclaimer flag:

```bash
# In flowmcp.config.json
{
    "licenseDisclaimer": true
}

# Then:
flowmcp call coingecko_market_chart
# [License Info] Provider: coingecko
# [License Info] ToS: https://www.coingecko.com/en/terms (last checked: 2026-05-18)
# [License Info] We do not interpret ToS. Please review before commercial use.
```

Default: `licenseDisclaimer: false` (off).

## User Responsibility

Users are solely responsible for:

- Reviewing each API provider's ToS before use
- Complying with rate limits, attribution, and re-distribution rules
- Determining commercial vs non-commercial fit
- Adhering to LLM-training restrictions where present

FlowMCP makes **no warranty** about ToS compliance, data licensing, or fitness for any purpose.

## Update Strategy

ToS change. FlowMCP recommends:

- **6-month re-check cadence** for all schemas with `termsOfService`
- Reactive update when known provider ToS changes occur (e.g. Twitter 2023)
- Audit script `audit-tos-freshness.mjs` flags schemas with stale `termsOfServiceCheckedAt`

## See Also

- [`01-schema-format.md`](./01-schema-format.md) — Schema field reference
- [`19-mcp-integration.md`](./19-mcp-integration.md) — Meta block (per-tool metadata)
