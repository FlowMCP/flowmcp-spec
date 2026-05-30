# 16 — Selection Lockfile + Namespace Payload (§11)

| Field | Value |
|-------|-------|
| Status | Normative — NEW in 1.1.0 |
| Version | `gradingSpec/1.1.0` |
| Depends on | [`00-overview.md`](./00-overview.md), [`08-grading-model.md`](./08-grading-model.md), [`15-versioning-axes.md`](./15-versioning-axes.md) |
| Related | [`19-folder-layout.md`](./19-folder-layout.md), [`21-pre-conditions.md`](./21-pre-conditions.md), [`18-flywheel-loop.md`](./18-flywheel-loop.md), [`11-about-convention.md`](./11-about-convention.md) |
| Annex | [`16-selection-lockfile.schema.json`](./16-selection-lockfile.schema.json) — container for selection.schema.json, selection.lock.schema.json, namespace.schema.json |

> **Spec:** `gradingSpec/1.1.0`
> **Status:** stable (additive extension of 1.0.0)
> **Changes vs. 1.0.0:** entirely new section §11 (selection lockfile, namespace payload, workflow with pre-condition).

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](./00-overview.md). The binding source is the FlowMCP Schemas Specification v4.1.0.

---

## §11 Lockfile + Namespace Payload

### §11.1 `selection.json` (Definition)

A Selection binds N schemas into a domain coverage. The definition lives in `selection.json` and contains only the *intentional* definition (without pinned hashes).

```json
{
  "selectionId": "crypto-domain-full",
  "version": "4.0.0",
  "selectionVersion": "1.0.0",
  "selectionHash": "ef67ab12",
  "description": "Voll-Coverage Krypto.",
  "personaIds": ["crypto-trader-2026", "crypto-analyst-2026"],
  "aboutHash": "abcd1234",
  "members": [{ "schemaId": "binance.ticker" }],
  "skills": [
    "crypto-trader/skill/welcome",
    "crypto-trader/skill/chain-selection",
    "crypto-trader/skill/swap-flow",
    "crypto-trader/skill/portfolio-summary"
  ]
}
```

**Mandatory fields:** `selectionId`, `version`, `selectionVersion`, `selectionHash`, `description`, `personaIds[]`, `aboutHash`, `members[]`, `skills[]` (max 4, see FlowMCP-Spec v4.1.0 SKL018).

| Field | Format | Meaning |
|-------|--------|---------|
| `selectionId` | `[a-z0-9-]+` | Unique selection ID |
| `version` | `4.\d+.\d+` | FlowMCP spec version |
| `selectionVersion` | semver | Selection content version (see [`15-versioning-axes.md`](./15-versioning-axes.md) §10.3) |
| `selectionHash` | sha256, 8 chars | Hash of the selection definition |
| `description` | string (min 10 chars) | What the selection covers |
| `personaIds[]` | array (min 1) | Mandatory personas — see [`20-entry-point-prompt.md`](./20-entry-point-prompt.md) §18.3 |
| `aboutHash` | sha256, 8 chars | Reference to the About file (see [`11-about-convention.md`](./11-about-convention.md) §19) |
| `members[]` | array (min 1) | List of contained schemas (only `schemaId`) |
| `skills[]` | array (max 4) | Bound skills, max 4 |

### §11.2 `selection.lock.json` (Snapshot)

The lockfile pins the member schemas to a concrete snapshot. It is generated at the start of a Selection grading and makes reproducibility explicit.

```json
{
  "selectionId": "crypto-domain-full",
  "selectionVersion": "1.0.0",
  "selectionHash": "ef67ab12",
  "generatedAt": "2026-05-30T09:00:00Z",
  "members": [
    {
      "schemaId": "binance.ticker",
      "schemaVersion": "1.0.0",
      "schemaHash": "a1b2c3d4",
      "gradingStatus": "stable"
    }
  ]
}
```

**Mandatory fields per member:** `schemaId`, `schemaVersion`, `schemaHash`, `gradingStatus`.

#### `gradingStatus` field

| Value | Meaning |
|-------|---------|
| `"stable"` | The last grading was `mode: "full"` with grade A/B (see [`06-determinism-and-tier.md`](./06-determinism-and-tier.md) §8) |
| `"pending"` | No stable grading present OR invalidated by a schema bump |

`gradingStatus` is the cheap lockfile-lookup check consumed by the pre-condition check (see [`21-pre-conditions.md`](./21-pre-conditions.md) §20). A schema bump (`schemaHash` changes, see [`15-versioning-axes.md`](./15-versioning-axes.md) §10) invalidates `stable` — the status falls back to `"pending"`.

### §11.3 Selection-Grading Workflow

The Selection-grading workflow starts with a pre-condition check as step 0. Without this check, the grading would aggregate over unstable member evaluations — which makes the result worthless.

```
Step 0 — Pre-condition check (mandatory):
  Load lockfile, check whether all members have gradingStatus: stable.
  If no: BLOCK + list missing Single-Gradings.
  If yes: continue.

Step 1: Selection-Validator (S1-S4) runs.
Step 2: Grading result written to gradings/<sel-hash>--<timestamp>.json.
Step 3: Re-grading on change — new lockfile, diff against the previous one.
```

> *"You can only test a Selection with full gradings, because otherwise it simply makes no sense."*

Cross-reference: [`21-pre-conditions.md`](./21-pre-conditions.md) §20 (universal pre-condition obligation).

### §11.4 Namespace Payload (`namespace.json`)

A namespace binds N schemas into a provider unit. Unlike a Selection, a namespace has **no version of its own** by design — the `namespaceHash` is sufficient as an identity marker.

```json
{
  "namespace": "etherscan",
  "namespaceHash": "ab12cd34",
  "aboutHash": "ef56gh78",
  "members": [
    {
      "schemaId": "etherscan.getContractEthereum",
      "schemaVersion": "1.0.0",
      "schemaHash": "..."
    }
  ]
}
```

**Mandatory fields:** `namespace`, `namespaceHash`, `aboutHash`, `members[]`.

`namespaceHash` is computed deterministically from the sorted `members[]` array plus `aboutHash` (sha256, 8 chars, see [`15-versioning-axes.md`](./15-versioning-axes.md) §10.5). There is no separate `namespaceVersion` field — the hash is sufficient by design.

### §11.5 Relationship of Lockfile ↔ L1/L2/L3 Skill Hierarchy

Selection-Gradings are linked to the skill hierarchy through the L1/L2/L3 score fields (see [`13-skills.md`](./13-skills.md)). The lockfile pins the *schemas* — the L scores arise only in grading step 1 (Selection-Validator). Lockfile and L scores are complementary.

### §11.6 Cross-Refs

- Folder paths (`selection/<id>/selection.json`, `selection/<id>/selection.lock.json`, `schemas/<ns>/namespace.json`) → [`19-folder-layout.md`](./19-folder-layout.md) §17
- Pre-condition as a universal rule → [`21-pre-conditions.md`](./21-pre-conditions.md) §20
- About-Pages file layout → [`11-about-convention.md`](./11-about-convention.md) §19
- Version axes + bump tables → [`15-versioning-axes.md`](./15-versioning-axes.md) §10
- Entry-point prompt (Selection mandatory persona) → [`20-entry-point-prompt.md`](./20-entry-point-prompt.md) §18
