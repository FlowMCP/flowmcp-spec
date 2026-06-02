---
name: flowmcp-schema-discover
description: >
  Research public data sources for a given topic using headless Playwright.
  Crawls open-data portals, evaluates API availability, and produces a structured
  report for FlowMCP schema creation. Stage 1 (Discovery / Research) of the schema
  lifecycle. Must be loaded when finding and feasibility-checking a public data
  source before authoring a schema.
---

# FlowMCP Schema Discover (open data sources)

Research public data sources for a given topic using headless Playwright. Crawl
data portals, evaluate API availability, and produce a structured report for
FlowMCP schema creation. This is stage 1 (Discovery / Research) of the lifecycle
described in `spec/v4.3.0/21-schema-lifecycle.md`.

---

## Trigger

- "discover open data for {TOPIC}"
- "discover opendata {TOPIC}"
- "research public data {TOPIC}"
- "find data sources for {TOPIC}"

---

## Output

### Temporary (deleted after user confirmation)

```
.tmp/opendata-{SLUG}/
├── TODO.md                    <- Crawl queue (portals + status)
└── pages/
    ├── 001_{PORTAL_SLUG}.txt  <- Extracted info per portal/page
    ├── 002_{PORTAL_SLUG}.txt
    └── ...
```

### Final (persists)

```
context/opendata-{SLUG}.md    <- Structured research report
```

---

## Config

```json
{
    "topic": "{TOPIC}",
    "slug": "{SLUG}",
    "country": "de",
    "maxPages": 20,
    "portals": ["govdata", "ckan", "custom"]
}
```

| Key | Description | Example |
|-----|-------------|---------|
| `topic` | Domain/theme to research | `land valuation` |
| `slug` | Filename slug | `land-valuation` |
| `country` | Country focus | `de` |
| `maxPages` | Max pages to crawl per portal | `20` |
| `portals` | Which portals to search | `["govdata", "ckan", "custom"]` |

---

## Process

```
1. Check Playwright MCP availability
   - If not available: inform user and stop

2. Gather config from user
   - Ask for: topic, slug, country
   - Set defaults: maxPages=20, portals=["govdata"]

3. Create work directory: .tmp/opendata-{SLUG}/pages/

4. Phase 1: Portal Search
   a. browser_navigate to https://www.govdata.de
   b. Search for {TOPIC}
   c. browser_snapshot -> Extract dataset listings
   d. For each relevant dataset:
      - Extract: name, provider, format, license, URL
      - Save to pages/{NR}_{DATASET_SLUG}.txt
   e. Identify datasets with API access (WFS, WMS, REST, CKAN, SPARQL)

5. Phase 2: API Evaluation (for each dataset with API)
   a. browser_navigate to dataset detail page
   b. browser_snapshot -> Extract:
      - API endpoint URLs
      - Authentication requirements (open, key, OAuth)
      - Available formats (JSON, GML, CSV, GeoJSON)
      - Documentation links
      - Rate limits / usage terms
      - License (open data, attribution, commercial use)
   c. If API endpoint found: Test with browser_navigate
      - Try GetCapabilities (WFS/WMS)
      - Try simple GET request (REST)
      - Document response structure
   d. Save findings to pages/{NR}_{DATASET_SLUG}.txt

6. Phase 3: Coverage Analysis
   a. Check geographic coverage:
      - Nationwide?
      - Per region/state? Which ones?
      - Per city/municipality?
   b. Check data freshness:
      - Last update date
      - Update frequency
   c. Check FlowMCP compatibility:
      - Is it a simple REST/JSON API? -> Easy schema
      - Is it WFS/WMS? -> Needs handler with XML parsing
      - Is it download-only (CSV/Shapefile)? -> Not suitable for live schema
      - Does it need authentication? -> requiredServerParams

7. Phase 4: Report Generation
   a. Read all pages from .tmp/opendata-{SLUG}/pages/
   b. Generate structured report (see Report Format below)
   c. Save to context/opendata-{SLUG}.md
   d. Print summary

8. Ask user: "Delete temporary files in .tmp/opendata-{SLUG}/?"
```

---

## Report Format

```markdown
# Open Data Research: {TOPIC}

**Date:** {TIMESTAMP}
**Query:** {TOPIC}
**Portals searched:** {PORTALS}

## Summary

| Metric | Value |
|--------|-------|
| Datasets found | {N} |
| With usable API | {N} |
| Schema-ready | {N} |
| Key required | {N} |

## Recommended Sources

### 1. {SOURCE_NAME}

| Property | Value |
|----------|-------|
| Provider | {PROVIDER} |
| Endpoint | {URL} |
| Type | REST / WFS / WMS / CKAN |
| Auth | Open / API Key / OAuth |
| Format | JSON / GML / CSV |
| Coverage | Nationwide / {REGION} |
| License | {LICENSE} |
| Update | {FREQUENCY} |
| FlowMCP | Easy / Medium / Complex |

**Endpoints:**
- `GET {URL}/endpoint1` - {DESCRIPTION}
- `GET {URL}/endpoint2` - {DESCRIPTION}

**Sample Response:**
```json
{ ... }
```

**Schema Recommendation:**
- Namespace: `{NAMESPACE}`
- Tools: {N} tools
- Handlers needed: Yes/No
- Shared Lists: {LISTS}

### 2. {NEXT_SOURCE}
...

## Not Suitable

| Source | Reason |
|--------|--------|
| {NAME} | Download-only, no API |
| {NAME} | Authentication wall |
| {NAME} | Unstable/undocumented |

## Next Steps

1. [ ] Create schema for {BEST_SOURCE}
2. [ ] Test API endpoints
3. [ ] Check rate limits in production
```

---

## Portal URLs

| Portal | URL | Coverage |
|--------|-----|----------|
| GovData | https://www.govdata.de | Nationwide (DE) |
| daten.berlin.de | https://daten.berlin.de | Berlin |
| open.nrw | https://open.nrw | North Rhine-Westphalia |
| opendata.bayern | https://opendata.bayern | Bavaria |
| transparenz.hamburg.de | https://transparenz.hamburg.de | Hamburg |
| datenadler.de | https://datenadler.de | Brandenburg |
| data.europa.eu | https://data.europa.eu | EU |

---

## FlowMCP Compatibility Matrix

| API Type | Difficulty | Handler | Notes |
|----------|-----------|---------|-------|
| REST + JSON | Easy | No | Direct schema mapping |
| REST + XML | Medium | postRequest | XML to JSON transform |
| WFS | Medium | executeRequest | OGC protocol, GML parsing |
| WMS | Hard | executeRequest | Image tiles, not ideal |
| SPARQL | Medium | executeRequest | Query construction |
| CKAN API | Easy | No | Standard REST pattern |
| GraphQL | Medium | executeRequest | Query in body |
| Download (CSV/ZIP) | Not suitable | - | No live queries |

---

## Usage

```
User: "discover open data for land valuation"
Claude: Asks for slug, checks Playwright
Claude: Crawls GovData, finds 304 datasets
Claude: Evaluates top 10 with APIs
Claude: Tests WFS endpoints
Claude: "Research complete: 5 usable APIs found"
Claude: Saves context/opendata-land-valuation.md
Claude: "Delete temporary files?"
```

---

## See also

- [`../flowmcp-schema/SKILL.md`](../flowmcp-schema/SKILL.md) — lifecycle entry point
- [`../flowmcp-schema-create/SKILL.md`](../flowmcp-schema-create/SKILL.md) — next stage (Creation)
- `spec/v4.3.0/21-schema-lifecycle.md` — canonical lifecycle (stage 1)
