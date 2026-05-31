---
title: "22 — Workbench Island"
description: "The grading data directory (`grading-data/`) is a **workbench island**: an internal working area where schemas and selections are hammered on day after day. It is deliberately separate from the..."
grading_version: "2.0.0"
spec_file: "22-workbench-island.md"
order: 22
section: "Grading"
normative: true
source_commit: "6152b7e"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/6152b7e/grading/2.0.0/22-workbench-island.md"
generated_at: "2026-05-31T16:18:50.290Z"
generated_from: "grading/2.0.0/22-workbench-island.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/2.0.0/22-workbench-island.md."
---

| Field | Value |
|-------|-------|
| Status | Normative |
| Version | `gradingSpec/2.0.0` |
| Depends on | [`00-overview.md`](./00-overview.md), [`19-folder-layout.md`](./19-folder-layout.md) |
| Related | [`15-versioning-axes.md`](./15-versioning-axes.md), [`23-index-json.md`](./23-index-json.md), [`18-flywheel-loop.md`](./18-flywheel-loop.md) |

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](./00-overview.md).

---

## 1. The Island Principle

The grading data directory (`grading-data/`) is a **workbench island**: an internal working area where schemas and selections are hammered on day after day. It is deliberately separate from the public, shipped repositories. Treating it as an island is what makes the verbose internal naming scheme defensible — it is not over-engineering, it is the price of predictability.

Two properties define the island:

1. **Internally verbose.** Inside the island, file names carry a logical name **plus a timestamp plus a content hash** (`‹logical-name›--‹YYYY-MM-DDTHH-MM-SSZ›--‹hash8›.‹ext›`; see [`15-versioning-axes.md`](./15-versioning-axes.md)). Each primitive gets its own folder. This verbosity guarantees predictability, linkability, and version tracking: every snapshot is addressable, every grading binds to a concrete hash, and a naive `sort().at(-1)` always yields the newest version.

2. **Stripped on the way out.** When data leaves the island toward the real repositories (the mirror-out step), names are **stripped to clean spec names**. The outside world never sees the internal timestamps and hashes; it sees the resolved, current artifact under its plain logical name.

The island argument beats the "isn't this overkill?" argument: the verbosity lives only on the workbench, never in the shipped product.

---

## 2. Outside View is the Namespace

From the outside, the unit of interest is the **namespace** — does it work, what can it do. Individual schemas are an internal complexity split inside a namespace (one namespace, several schemas; see the namespace special case in [`19-folder-layout.md`](./19-folder-layout.md)). The outside consumer asks "is this namespace operational and what grade does it carry", not "which timestamped snapshot of which schema produced it". The island keeps the fine-grained internal structure; the outside view collapses it to the namespace (and, for Task B, to the selection).

The source files that travel — the schema `.mjs` and the `selection.json` — are kept **neutral**: they carry only logical names, no inner hashes or snapshot-version keys (see [`06-determinism-and-tier.md`](./06-determinism-and-tier.md) and [`19-folder-layout.md`](./19-folder-layout.md)). Versioning lives in the file name; the hash bindings live in the derived [`index.json`](./23-index-json.md). The source stays clean, yet every binding remains traceable.

---

## 3. The IN/OUT Round-Trip

The island is connected to the real repositories by a two-way round-trip. Both directions are non-destructive: the island never overwrites a source, and an export never overwrites the destination.

### 3.1 IN — `grading import <provider-path>`

Source (a provider folder or a selection) flows into the workbench:

1. Scan the `.mjs` files.
2. Run `flowmcp validate` as a gate.
3. Assert a **single namespace** (one folder = one namespace; several namespaces MUST abort).
4. Existence check: missing → create; changed (new hash) → write a **new snapshot alongside** the old one; identical hash → skip. The import **never overwrites** an existing snapshot.
5. Convert into the island structure (resources to `resources/about/`, skills to `skills/`, inline skills normalised into files).
6. Rebuild `index.json`.

### 3.2 OUT — `grading export <namespace|selection>`

Workbench flows back toward the source:

- The **primary hand-off is the `index.json`** — the complete graded state (status, grade, member resolution, lock snapshot).
- Optionally, the clean schema `.mjs` files (resolved via `resolveLatest`, names stripped) MAY accompany the export.
- The export **MUST NOT overwrite the source**; it writes into a fresh export folder.

The round-trip is the concrete shape of the flywheel loop described in [`18-flywheel-loop.md`](./18-flywheel-loop.md): import → grade → improve → export, then around again.

---

## Cross-References

- Folder layout and the namespace special case: [`19-folder-layout.md`](./19-folder-layout.md)
- Naming grammar (date-before-hash, `resolveLatest`): [`15-versioning-axes.md`](./15-versioning-axes.md)
- The derived rollup that the round-trip hands off: [`23-index-json.md`](./23-index-json.md)
