---
name: flowmcp-schema-tos
description: >
  Research the Terms-of-Service URL and run a plausibility check for a FlowMCP
  schema. Sets main.termsOfService + termsOfServiceCheckedAt + language +
  jurisdiction, and runs a robots.txt legal gate (green/amber/red). Stage 5
  (ToS / robots) of the schema lifecycle. Linked to schema-lifecycle + grading.
  Must be loaded when establishing the legal metadata for a provider.
---

# FlowMCP Schema ToS (Terms-of-Service + robots research)

Research the Terms-of-Service URL and run a plausibility check for a FlowMCP
schema. Sets `main.termsOfService` + `termsOfServiceCheckedAt` + language +
jurisdiction, runs a robots.txt legal gate, and links the result to the schema
lifecycle and grading. This is stage 5 (ToS / robots) of the lifecycle in
`spec/v4.3.0/21-schema-lifecycle.md` and `spec/v4.3.0/23-license-and-tos.md`.

## When to use

- During the schema Creation/Validation stage (before deploy)
- Manually: "ToS research for provider X"
- Optionally before grading (the about-namespace grading question reads the
  About page, not a schema field)

## Output fields (public, written to `main`)

Public fields live in `main.*` (not `meta.*`):

```javascript
export const main = {
    // ...
    docs: [ 'https://...' ],
    termsOfService: 'https://www.example.com/en/terms',  // URL or sentinel 'no-tos-found'
    termsOfServiceCheckedAt: '2026-05-18',
    termsOfServiceLanguage: 'en',
    dataLicense: null,
    dataLicenseName: null
}
```

The license assessment and any internal notes are **private** Island/Grading
artifacts (`licenses-internal.json`) and are NEVER written into the public
schema. See `23-license-and-tos.md` and the Grading-Spec.

## Three objective steps

| Step | Action | Output (public) | Output (private) |
|------|--------|-----------------|------------------|
| 1 | Find ToS URL | `main.termsOfService` | `tosUrl` in `licenses-internal.json` |
| 2 | Plausibility check | `main.termsOfServiceCheckedAt`, `main.termsOfServiceLanguage` | `jurisdiction` |
| 3 | Internal eval (OPTIONAL) | — | `internalNotes`, `llmTrainingClauseFound`, `reDistributionAllowed` |

**Important:** Steps 1+2 produce publicly shareable data. Step 3 is PRIVATE-only.

## robots.txt legal gate (7-step)

Before relying on a provider, run the robots.txt gate and record the verdict as a
metadatum:

1. `GET <host>/robots.txt`
2. Parse `User-agent` / `Disallow` / `Allow` groups
3. Check whether the API/data path is disallowed for a generic agent
4. Check for an explicit `Allow` of the relevant path
5. Check for a `Crawl-delay` directive (rate guidance)
6. Cross-check against the ToS clauses found in step 1/2
7. Emit a verdict:
   - **green** — path allowed, no conflicting ToS clause
   - **amber** — ambiguous (no robots.txt, or unclear scope) — proceed with care
   - **red** — path disallowed or ToS forbids automated access — do NOT deploy

The verdict is a private metadatum; the public schema only carries the ToS URL +
checked-at + language.

## Procedure

### Step 1: Find ToS URL

1. Visit the provider homepage (Playwright)
2. Search footer + header for links matching: `terms`, `legal`, `tos`, `AGB`
3. Multiple candidates? -> a sub-agent ranks them by relevance
4. Return the URL or the sentinel `no-tos-found`

### Step 2: Plausibility check

1. Fetch the ToS URL
2. A sub-agent reads the content and detects:
   - `language`: `en` | `de` | `multi` | `other`
   - `jurisdiction`: from the "Governing Law" clause
   - `isApiTos`: whether it covers the API or only the general website
   - `plausibility`: `high` | `medium` | `low`
3. Return the plausibility note

### Step 3: Internal eval (optional)

Only for providers of strategic importance (e.g. when the grading score is near
the production gate). A sub-agent reads the ToS and returns:

- `llmTrainingClauseFound`: bool
- `reDistributionAllowed`: bool | null
- free-tier vs commercial: notes
- `jurisdiction`: confirmed

**Write output to:** `flowmcp-schemas-private/licenses-internal.json` (NEVER into
the schema file).

## Internal format (`licenses-internal.json`)

```json
{
    "example": {
        "tosUrl": "https://www.example.com/en/terms",
        "tosCheckedAt": "2026-05-18",
        "tosLanguage": "en",
        "jurisdiction": "SG",
        "robotsVerdict": "green",
        "internalNotes": "Free tier is non-commercial per Section 4.",
        "researchedBy": "flowmcp-schema-tos",
        "llmTrainingClauseFound": false,
        "reDistributionAllowed": false
    }
}
```

## Grading link

The grading model treats ToS as **SHOULD, not MUST** (Public-Sector APIs often
lack a dedicated ToS). The production gate, however, requires
`main.termsOfService` to be set — either a URL or the explicit `no-tos-found`
sentinel. New schemas set this field via this skill.

## See also

- [`../flowmcp-schema/SKILL.md`](../flowmcp-schema/SKILL.md) — lifecycle entry point
- `spec/v4.3.0/23-license-and-tos.md` — ToS + license fields
- `flowmcp-schemas-private/docs/LICENSES-INTERNAL.md`
- `flowmcp-schemas-private/docs/DISCLAIMER-TEXTS.md`
