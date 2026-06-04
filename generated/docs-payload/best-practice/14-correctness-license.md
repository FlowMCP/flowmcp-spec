---
title: "Correctness, License & Provenance"
description: "Assume nothing silently, fake nothing, and document where the data comes from and under which rights. Correctness and provenance are what separate a schema that *passes* from a schema that can be..."
best_practice_version: "0.1.0"
spec_file: "14-correctness-license.md"
order: 14
section: "Best Practice"
normative: false
source_commit: "3979b97"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/3979b97/best-practice/0.1.0/schema-creation/14-correctness-license.md"
generated_at: "2026-06-04T20:12:27.959Z"
generated_from: "best-practice/0.1.0/schema-creation/14-correctness-license.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: best-practice/0.1.0/schema-creation/14-correctness-license.md."
---

Assume nothing silently, fake nothing, and document where the data comes from and under which rights. Correctness and provenance are what separate a schema that *passes* from a schema that can be *trusted*.

---

## No silent defaults / 4xx ≠ PASS

Every parameter is explicit. "Working" means `status === true` ∧ `hasData` ∧ `!duplicate`. A 4xx or an empty body is a **FAIL**, never a pass.

- Beleg: `flowmcp-grading/src/DataPretest.mjs:334` (comment `:36-41`).

## Mandatory parse config

Data add-ons require an **explicit** configuration: separator, date format, column mapping, type rules. Never silently coerce — `0/1` becomes an integer, not a boolean by guesswork.

- Beleg: `CsvUrlStore.mjs:198` (`CSV-URL-005`).

## Synthetic CC0 test data

Never put real provider data into a public repo (license). Use synthetic CC0 mini-data for CI; keep production data separate. (Memo 047/051)

## Maximalism

Cover all documented endpoints; justify any omission. An unjustified reduction lowers interoperability — the grading default journey penalises it.

## Lay down the Terms of Service

Put the ToS URL **into the schema** — field `main.termsOfService` (plus `termsOfServiceCheckedAt`, `termsOfServiceLanguage`). It is set by the **`tos-research`** skill, which runs a robots.txt legal gate (🟢 / 🟡 / 🔴) and is audited by `scripts/audit-tos-freshness.mjs`. The sentinel `'no-tos-found'` is allowed. This saves the second search for the URL — nobody has to look it up again.

## Related

- **Depends on:** [`01-overview.md`](/best-practice/overview/)
- **Related:** [`10-readable-interface.md`](/best-practice/readable-interface/)

