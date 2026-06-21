---
title: "Workbench Island"
description: "The grading workbench keeps its working files in a directory that is deliberately walled off from the shipped repositories. This chapter explains why that separation exists, how the internal naming..."
grading_version: "3.0.0"
spec_file: "22-workbench-island.md"
order: 22
section: "Grading"
normative: true
source_commit: "55474a9"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/55474a9/grading/3.0.0/22-workbench-island.md"
generated_at: "2026-06-21T18:24:22.826Z"
generated_from: "grading/3.0.0/22-workbench-island.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/3.0.0/22-workbench-island.md."
---

The grading workbench keeps its working files in a directory that is deliberately walled off from the shipped repositories. This chapter explains why that separation exists, how the internal naming scheme earns its verbosity, and how data crosses the boundary in both directions without ever overwriting a source. The result is a non-destructive round-trip — import, grade, improve, export — whose internal complexity never reaches the public artifacts.


## The Island Principle

The grading data directory (`grading-data/`) is a **workbench island**: an internal working area where schemas and selections are hammered on day after day. It is deliberately separate from the public, shipped repositories. Treating it as an island is what makes the verbose internal naming scheme defensible — it is not over-engineering, it is the price of predictability.

Two properties define the island:

1. **Internally verbose.** Inside the island, file names carry a logical name **plus a timestamp plus a content hash** (`‹logical-name›--‹YYYY-MM-DDTHH-MM-SSZ›--‹hash8›.‹ext›`; see [`15-versioning-axes.md`](/grading/versioning-axes/)). Each primitive gets its own folder. This verbosity guarantees predictability, linkability, and version tracking: every snapshot is addressable, every grading binds to a concrete hash, and a naive `sort().at(-1)` always yields the newest version.

2. **Stripped on the way out.** When data leaves the island toward the real repositories (the mirror-out step), names are **stripped to clean spec names**. The outside world never sees the internal timestamps and hashes; it sees the resolved, current artifact under its plain logical name.

The island argument beats the "isn't this overkill?" argument: the verbosity lives only on the workbench, never in the shipped product.

---

## Outside View is the Namespace

From the outside, the unit of interest is the **namespace** — does it work, what can it do. Individual schemas are an internal complexity split inside a namespace (one namespace, several schemas; see the namespace special case in [`19-folder-layout.md`](/grading/folder-layout/)). The outside consumer asks "is this namespace operational and what grade does it carry", not "which timestamped snapshot of which schema produced it". The island keeps the fine-grained internal structure; the outside view collapses it to the namespace (and, for Task B, to the selection).

The source files that travel — the schema `.mjs` and the `selection.json` — are kept **neutral**: they carry only logical names, no inner hashes or snapshot-version keys (see [`06-determinism-and-tier.md`](/grading/determinism-and-tier/) and [`19-folder-layout.md`](/grading/folder-layout/)). Versioning lives in the file name; the hash bindings live in the derived [`index.json`](/grading/index-json/). The source stays clean, yet every binding remains traceable.

---

## The IN/OUT Round-Trip

The island is connected to the real repositories by a two-way round-trip. Both directions are non-destructive: the island never overwrites a source, and an export never overwrites the destination.

### IN — `grading import <provider-path>`

Source (a provider folder or a selection) flows into the workbench:

1. Scan the `.mjs` files.
2. Run `flowmcp schema-check`. **On failure, do NOT abort the run** — emit a `blocked` node with `reason: "validation-failed"` into `index.json`, snapshot the unparseable source if it is readable, and CONTINUE with the remaining files in the folder. This is the **emit-on-failure** contract (the `3.0.0` break, see [Emit-on-Failure Import Contract](#emit-on-failure-import-contract)).
3. The **single-namespace expectation is retained as a normative invariant** (one folder = one namespace), but its violation is now an **emitted record, not an abort**: a folder whose schemas cannot be parsed to a single namespace emits a `blocked` node rather than aborting. (A genuine *disagreement* between two declared namespaces remains a hard configuration error — see the emit-on-failure section below.)
4. Existence check: missing → create; changed (new hash) → write a **new snapshot alongside** the old one; identical hash → skip. The import **never overwrites** an existing snapshot.
5. Convert into the island structure (resources to `resources/about/`, skills to `skills/`, inline skills normalised into files).
6. Rebuild `index.json`.

#### Emit-on-Failure Import Contract

Up to and including `gradingSpec/2.0.x`, the import gate was a **hard gate**: a `flowmcp schema-check` failure or a folder that resolved to anything other than a single namespace **aborted** the whole import. `3.0.0` flips this to **emit-a-`blocked`-node-and-continue**:

- **Validate failure → `blocked` node.** When a schema fails the validate gate, the import does NOT abort. It emits a `blocked` node with `reason: "validation-failed"` (the pinned reason, matching the closed `blockedReason` set in the grading module — see [`23-index-json.md`](/grading/index-json/)), snapshots the unparseable source if readable, and continues with the remaining files.
- **All-unparseable folder → namespace-folder fallback.** When **all** schemas in a folder are unparseable (no readable `main.namespace`), the **folder name** is the fallback namespace identifier for the emitted `blocked` rollup. The fallback name MUST itself be a valid namespace (`/^[a-z][a-z0-9-]*$/`); a folder name that is not a valid namespace is a hard error (no silent normalisation). See [`19-folder-layout.md`](/grading/folder-layout/) for the folder↔namespace consistency rule and the rename-on-parse lifecycle.
- **Single-namespace invariant retained, violation emitted.** The one-folder-one-namespace expectation is still normative. A folder that simply could not be parsed to a namespace emits a `blocked` node (it does not abort). A folder whose parsed schemas **disagree** on a declared namespace (≥2 distinct usable namespaces) is a genuine misconfiguration, not a fallback case, and is reported as a hard error.

> **Non-destructive guarantee restated.** Emit-on-failure changes only the *control flow* (continue instead of abort); it does **not** weaken the non-destructive guarantees. The island still **never overwrites** a source snapshot (Step 4), the export **never overwrites** the destination (OUT), and `index.json` remains the **only** overwritable artifact. No source snapshot is written for an unparseable/blocked schema — only the `index.json` status record is emitted.

### OUT — `grading export <namespace|selection>`

Workbench flows back toward the source:

- The **primary hand-off is the `index.json`** — the complete graded state (status, grade, member resolution, lock snapshot).
- The export lands the per-namespace rollup as the committed, CI-visible **provider-proof** `providers/<ns>/grade.json` inside the provider folder of the source repo (`flowmcp-schemas-private`); CI reads that **repo-resident** copy, never the island-local `index.json`. The data flow is specified in [`26-monitoring-track.md`](/grading/monitoring-track/).
- Optionally, the clean schema `.mjs` files (resolved via `resolveLatest`, names stripped) MAY accompany the export.
- The export **MUST NOT overwrite the source**; it writes into a fresh export folder.

The round-trip is the concrete shape of the flywheel loop described in [`18-flywheel-loop.md`](/grading/flywheel-loop/): import → grade → improve → export, then around again.

## Related

- [`00-overview.md`](/grading/overview/) — how FlowMCP schemas and selections are evaluated and graded.
- [`19-folder-layout.md`](/grading/folder-layout/) — the three top-level folders and timestamp-first naming grammar of the grading island.
- [`15-versioning-axes.md`](/grading/versioning-axes/) — how primitives are versioned by filename timestamp and bound by a canonical hash.
- [`23-index-json.md`](/grading/index-json/) — the one rollup file per namespace and selection carrying status and grade.
- [`18-flywheel-loop.md`](/grading/flywheel-loop/) — the self-reinforcing import, grade, improve, export round-trip.
- [`26-monitoring-track.md`](/grading/monitoring-track/) — the deterministic GitHub board projecting each namespace's grading state.

