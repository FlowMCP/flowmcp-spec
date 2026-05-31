---
title: "Terms of Service"
description: "This chapter defines the **Terms-of-Service (ToS) handling** of the Grading-Spec. ToS handling is part of the **due-diligence** layer (`Sorgfaltspflicht`), not part of the eligibility gate. A missing..."
grading_version: "2.0.0"
spec_file: "03-tos.md"
order: 3
section: "Grading"
normative: true
source_commit: "7094662"
source_url: "https://github.com/FlowMCP/flowmcp-spec/blob/7094662/grading/2.0.0/03-tos.md"
generated_at: "2026-05-31T23:03:59.972Z"
generated_from: "grading/2.0.0/03-tos.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: grading/2.0.0/03-tos.md."
---

> Conformance language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119]/[RFC8174] as defined in [`00-overview.md`](/grading/overview/). The binding source is the FlowMCP Schemas Specification v4.2.0.

---

## Purpose

This chapter defines the **Terms-of-Service (ToS) handling** of the Grading-Spec. ToS handling is part of the **due-diligence** layer (`Sorgfaltspflicht`), not part of the eligibility gate. A missing ToS link does **not** disqualify a schema; it lowers the score.

The chapter anchors:

- the **base due-diligence rule** (`SHOULD`, not `MUST`),
- the **"ToS attached" definition**,
- the **Root-Domain-Match** algorithm,
- the central distinction **"we observe" vs. "we accept"**, and
- the **grader role and mandatory disclaimer** ("grader assessment, not legally binding").

---

## Due-Diligence Base (SHOULD)

The base position is: **public documentation + no unlawful content = due-diligence met.**

- A ToS link SHOULD be present and verifiable.
- A **missing ToS link** does **NOT** block grading; it lowers the score.
- ToS handling is `SHOULD`, not `MUST`.

This is deliberate: many public-sector APIs (per [`02-eligibility.md`](/grading/eligibility/), target audience) operate under general public-law frameworks rather than a dedicated ToS document. A hard MUST would exclude entire classes of legitimate sources.

---

## "ToS Attached" — Definition

A schema is considered to have a **ToS attached** when **both** of the following hold:

1. There is a link whose label or anchor text contains "Vertrag", "Nutzungsbedingungen", "Terms of Service", "Terms of Use", "AGB", or a comparable designation.
2. The link bears a **demonstrable relationship to the API** (linked from the API documentation, the developer portal, or the API root page).

Both conditions are required. A "Terms" link to an unrelated corporate document does not count as an attached ToS.

### HTTP-200 Sub-Check

The grader SHOULD verify that the ToS URL is reachable (HTTP 200) at grading time. A ToS link that resolves to 4xx/5xx MUST be flagged as `stale` in the grading entry. (The verification method is implementation-defined; details belong to the grader code, not this chapter.)

Per the determinism rules in [`06-determinism-and-tier.md`](/grading/determinism-and-tier/), HTTP 4xx MUST NOT be silently accepted as "link present".

---

## Root-Domain-Match (MUST)

The ToS link **MUST share the same root domain** as the API endpoints it covers.

**Positive example:**

- API: `api.flowmcp.org`
- ToS: `flowmcp.org/terms`
- Root domain `flowmcp.org` matches → **PASS**.

**Counter-example:**

- API: `api.flowmcp.org`
- ToS: `example.com/terms`
- Root domains `flowmcp.org` vs. `example.com` do not match → **FAIL**.

The match is computed on the **registrable root domain** (eTLD+1), not on arbitrary subdomain segments. A subdomain-level mismatch (e.g. `api.flowmcp.org` vs. `legal.flowmcp.org`) is a **PASS** as long as the registrable root agrees.

A ToS link that does not satisfy the Root-Domain-Match MUST be treated as **not attached** for grading purposes. The grader MAY still record the link for human review but MUST NOT count it toward the ToS score.

---

## "We Observe" vs. "We Accept" (binding statement)

This is the central separation of concerns. It is binding for all FlowMCP graders, scoring code, and documentation:

- **FlowMCP observes** that a ToS link is attached to the API, in the technical sense defined in ["ToS Attached" — Definition](#tos-attached--definition) and [Root-Domain-Match](#root-domain-match-must) above.
- **FlowMCP does NOT accept** the ToS in any legal sense. No FlowMCP component — grader, CLI, or spec — constitutes acceptance of the linked terms on behalf of any user.
- A **legal assessment of the ToS is NOT the task of FlowMCP**. FlowMCP does not classify licences, does not interpret restrictions, and does not declare a schema "legally usable".

Implementers MUST keep this separation visible in all user-facing outputs. The wording "FlowMCP observes" is preferred; the wording "FlowMCP accepts" MUST NOT appear in any grader output or schema metadata.

---

## Grader Role and Mandatory Disclaimer

The grader **MAY** form an opinion about the licence, restrictions, or usability implications stated in the ToS — for example, by extracting a one-sentence summary or flagging well-known restrictive clauses.

If the grader records such an opinion, it MUST:

1. write the opinion into the mandatory field `legalAssessment` of the grading entry (see Chapter 7 / `08-grading-model.md`), and
2. mark the opinion verbatim as **"grader assessment, not legally binding"**.

The disclaimer is **non-optional**. A grading entry that contains a `legalAssessment` without the disclaimer MUST be treated as malformed.

---

## Cross-References

- [`00-overview.md`](/grading/overview/) — Conformance language.
- [`02-eligibility.md`](/grading/eligibility/) — Due-diligence base sits on top of the eligibility rules.
- `08-grading-model.md` (Chapter 7) — Defines the `legalAssessment` field and its disclaimer requirement.
- [`06-determinism-and-tier.md`](/grading/determinism-and-tier/) — HTTP-status interpretation rule (4xx is not pass).

## Related

- **Depends on:** [`00-overview.md`](/grading/overview/)
- **Related:** [`02-eligibility.md`](/grading/eligibility/), `08-grading-model.md` (forthcoming)

