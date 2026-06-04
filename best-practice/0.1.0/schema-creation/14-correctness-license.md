# 14 — Correctness, License & Provenance

| Field | Value |
|-------|-------|
| Status | Recommendation |
| Version | `bestPracticeSpec/0.1.0` |
| Depends on | [`01-overview.md`](../01-overview.md) |
| Related | [`10-readable-interface.md`](./10-readable-interface.md) |

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
