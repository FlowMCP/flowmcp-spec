---
title: "Selection Definition + `index.json.lockSnapshot`"
description: "In 1.1.0 the member pins lived in a standalone `selection.lock.json` and the provider unit was described by an authored `namespace.json`. Both files are removed in 2.0.0. The pins are folded into the..."
grading_version: "3.0.0"
spec_file: "16-selection-lockfile.md"
order: 16
section: "Grading"
normative: true
source_commit: "2e9a898"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/2e9a898/grading/3.0.0/16-selection-lockfile.md"
generated_at: "2026-06-04T21:10:58.055Z"
generated_from: "grading/3.0.0/16-selection-lockfile.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/3.0.0/16-selection-lockfile.md."
---

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](/grading/overview/). The binding source is the FlowMCP Schemas Specification v4.3.0.

---

## Selection Definition + Lock Snapshot

In 1.1.0 the member pins lived in a standalone `selection.lock.json` and the provider unit was described by an authored `namespace.json`. Both files are removed in 2.0.0. The pins are folded into the derived `index.json.lockSnapshot`, and the namespace rollup is part of `index.json` (see [`19-folder-layout.md`](/grading/folder-layout/)). This section now describes the neutral `selection.json` definition and the frozen `lockSnapshot`.

### `selection.json` (Neutral Definition)

A Selection binds N schemas into a domain coverage. The definition lives in `selection/<sel>--<ts>--<hash8>.json` and contains only the *intentional* definition — no pinned hashes and no snapshot version keys.

```json
{
  "selectionId": "crypto-domain-full",
  "namespace": "crypto-domain-full",
  "name": "Crypto Domain (full coverage)",
  "version": "flowmcp/4.0.0",
  "description": "Full-coverage crypto domain.",
  "whenToUse": "Use when an agent must cover crypto pricing, balances, and swaps across providers.",
  "personaIds": ["crypto-trader-2026", "crypto-analyst-2026"],
  "members": [{ "schemaId": "binance.ticker" }],
  "skills": [
    { "file": "skills/welcome/welcome--<ts>--<hash8>.mjs" },
    { "file": "skills/chain-selection/chain-selection--<ts>--<hash8>.mjs" }
  ],
  "resources": [],
  "prompts": []
}
```

**Mandatory fields:** `selectionId`, `namespace`, `name`, `version` (FlowMCP format `flowmcp/4.0.0`), `description`, `whenToUse`, `personaIds[]` (min 1), `members[]` (min 1, only `{schemaId}`), `skills[]` (max 4, map form). `resources[]` and `prompts[]` hold only **unique** primitives (import layer).

| Field | Format | Meaning |
|-------|--------|---------|
| `selectionId` | `[a-z0-9-]+` | unique selection id |
| `namespace` | `[a-z0-9_-]+` | selection namespace |
| `name` | string | human-readable name |
| `version` | `flowmcp/4.\d+.\d+` | FlowMCP spec version (mandatory FlowMCP-Spec field) |
| `description` | string (min 10 chars) | what the selection covers |
| `whenToUse` | string | mandatory trigger sentence — graded as its own field, never collapsed into `description` |
| `personaIds[]` | array (min 1) | mandatory personas — see [`20-entry-point-prompt.md`](/grading/entry-point-prompt/) |
| `members[]` | array (min 1) | contained schemas (only `schemaId`) |
| `skills[]` | array (max 4) | bound skills (map / `file` form, see FlowMCP-Spec v4.3.0 SKL018) |

**Removed from the source definition:** `selectionHash`, `aboutHash`, `selectionVersion`. The snapshot identity lives in the filename timestamp and (frozen) in `index.json.lockSnapshot`. `version` (the FlowMCP-format field) stays. See [`15-versioning-axes.md`](/grading/versioning-axes/).

### `index.json.lockSnapshot` (Frozen Pins, replaces `selection.lock.json`)

The pins that used to live in `selection.lock.json` now live in `index.json.lockSnapshot`. The `index.json` has two natures (see [`19-folder-layout.md`](/grading/folder-layout/)): a **live rollup** that is recomputed on every rebuild, and a **frozen `lockSnapshot`** that is written **once at grading start** and then **preserved** by the rebuild (not recomputed live). The pre-condition gate reads **only** the frozen part — a point in time — otherwise it would aggregate over unstable members.

```json
{
  "lockSnapshot": {
    "selectionId": "crypto-domain-full",
    "selectionVersion": "2026-05-30T09-00-00Z",
    "selectionHash": "ef67ab12",
    "generatedAt": "2026-05-30T09-00-00Z",
    "members": [
      {
        "schemaId": "binance.ticker",
        "schemaVersion": "2026-05-30T08-12-44Z",
        "schemaHash": "a1b2c3d4",
        "gradingStatus": "stable",
        "override": null
      }
    ]
  }
}
```

**`lockSnapshot` fields:** `selectionId`, `selectionVersion`, `selectionHash`, `generatedAt`; per member `{ schemaId, schemaVersion, schemaHash, gradingStatus, override }`. The `selectionVersion` / `schemaVersion` snapshot values are the filename timestamps frozen at grading start — they do **not** live in the source. `override` salvages the old override mechanism (whitelist `['name', 'description']`).

#### `gradingStatus` field

`gradingStatus` carries the 5-status value of the member node (see [`19-folder-layout.md`](/grading/folder-layout/) and the rollup in `index.json`):

| Value | Meaning |
|-------|---------|
| `pending` | not yet graded |
| `blocked` | cannot be graded yet (carries a `reason`: `validation-failed`, fewer than 3 tests, no About, API down — repairable) |
| `graded` | a grade is present |
| `stable` | fully graded and over threshold — ready for use |
| `rejected` | veto raised (terminal, irreversible) |

`gradingStatus` is the cheap lock lookup consumed by the pre-condition check (see [`21-pre-conditions.md`](/grading/pre-conditions/)). A content change to a member (new file → new `schemaHash`) invalidates `stable`; the next rebuild reflects the new status, but the **frozen** `lockSnapshot` is preserved until a new grading run regenerates it.

A member that fails to validate is `blocked` with `reason: validation-failed` (the same pinned reason set used in [`06-determinism-and-tier.md`](/grading/determinism-and-tier/) and [`23-index-json.md`](/grading/index-json/)); it is **not** `stable` and therefore correctly fails the `stable`-only selection pre-condition. All three status definitions (`06`/`16`/`23`) agree on the `validation-failed`-as-`blocked` reason.

### Selection-Grading Workflow

The Selection-grading workflow starts with a pre-condition check as step 0. Without it, the grading would aggregate over unstable member evaluations — which makes the result worthless.

```
Step 0 — Pre-condition check (mandatory):
  Read index.json.lockSnapshot; check whether every member has gradingStatus: stable.
  If no: BLOCK + list the blocking members (see [21-pre-conditions](/grading/pre-conditions/) §20 and the
         dependency-resolver decision tree).
  If yes: continue.

Step 1: Selection areas run (about-selection, selection-skills per skill, selection-aggregate).
Step 2: Grading results written to the respective _gradings/ folders.
Step 3: rebuild*Index recomputes the live rollup, preserves the frozen lockSnapshot.
```

> *"You can only grade a Selection over full, stable member gradings — otherwise it simply makes no sense."*

Cross-reference: [`21-pre-conditions.md`](/grading/pre-conditions/) (universal pre-condition obligation).

### Member Resolution Manifest

The member resolution manifest (recorded in `index.json`) maps each member `schemaId` to the resolved provider artefact plus its grade and status. Without this manifest the selection aggregate cannot reproduce "M of N members PASS". This is the heart of selection grading. See the `index.json` rollup in [`19-folder-layout.md`](/grading/folder-layout/).

### Removed in 2.0.0

| Removed | Replacement |
|---------|-------------|
| `selection.lock.json` (standalone file) | `index.json.lockSnapshot` ([`index.json.lockSnapshot` (Frozen Pins, replaces `selection.lock.json`)](#indexjsonlocksnapshot-frozen-pins-replaces-selectionlockjson)) |
| `namespace.json` (authored payload) | `index.json` rollup (see [`19-folder-layout.md`](/grading/folder-layout/)) |
| in-source `selectionHash`, `aboutHash`, `selectionVersion` | filename timestamp + `index.json` (see [`15-versioning-axes.md`](/grading/versioning-axes/)) |

The annex schemas `selection.lock.schema.json` and `namespace.schema.json` are **deprecated** — they describe removed files and are retained only for historical reference. New tooling MUST NOT validate against them.

### Cross-Refs

- Folder paths (`selections/<id>/selection/…`, `index.json`) → [`19-folder-layout.md`](/grading/folder-layout/)
- Pre-condition as a universal rule → [`21-pre-conditions.md`](/grading/pre-conditions/)
- About-Pages file layout (schema-level resource) → [`11-about-convention.md`](/grading/about-convention/)
- Versioning + canonical hash → [`15-versioning-axes.md`](/grading/versioning-axes/)
- Entry-point prompt (Selection mandatory persona) → [`20-entry-point-prompt.md`](/grading/entry-point-prompt/)

## Related

- **Depends on:** [`00-overview.md`](/grading/overview/), [`08-grading-model.md`](/grading/grading-model/), [`15-versioning-axes.md`](/grading/versioning-axes/)
- **Related:** [`19-folder-layout.md`](/grading/folder-layout/), [`21-pre-conditions.md`](/grading/pre-conditions/), [`18-flywheel-loop.md`](/grading/flywheel-loop/), [`11-about-convention.md`](/grading/about-convention/)
- **Annex:** [`selection.schema.json`](./selection.schema.json) — neutral selection definition

