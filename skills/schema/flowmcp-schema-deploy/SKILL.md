---
name: flowmcp-schema-deploy
description: >
  Deploy a validated and graded FlowMCP schema to production. Moves the schema
  into schemas/v4.0.0/<PROVIDER>/ in flowmcp-schemas-private and triggers the
  public mirror (Grade A/B only) via mirror-from-private.mjs (manual run). Stage 9
  (Deploy / Mirror) of the schema lifecycle. Must be loaded when promoting a
  finished schema to production. Authoring happens in private; public is an
  auto-mirror, never an authoring area.
---

# FlowMCP Schema Deploy (production + mirror)

Promote a validated and graded schema into production. This is stage 9
(Deploy / Mirror) of the lifecycle in `spec/v4.3.0/21-schema-lifecycle.md`. The
schema moves into its production folder in **flowmcp-schemas-private**, and only
then does the public mirror pick it up — Grade A/B only.

> **Work only in `flowmcp-schemas-private`.** The public repo
> (`flowmcp-schemas-public`) is an **auto-mirror**, NOT an authoring area. Never
> edit, add, or move schemas there by hand — the mirror script is the only writer.

## When to use

- A schema has passed validation, live-testing, ToS/robots, and grading (B+)
- You are ready to move it from the working area into the production tree
- You need to refresh the public mirror after a production change

## Preconditions (all must hold)

- `flowmcp dev validate <path>` returns 0 errors
- `flowmcp dev test single <path>` is green (every tool, HTTP 200; 4xx is not a pass)
- ToS/robots metadata is set (`main.termsOfService` is a URL or the `no-tos-found` sentinel)
- Grade is **A or B** (only A/B schemas reach the public mirror)

If any precondition fails, return to the matching lifecycle stage — do not deploy.

## Procedure

### Step 1 — Move into the production tree (private)

Place the schema under its provider folder in the private repo:

```
flowmcp-schemas-private/schemas/v4.0.0/<PROVIDER>/<schema>.mjs
```

Keep the file unchanged on the way in — deploy is a promotion, not an edit.
Re-run `flowmcp dev validate` at the new path to confirm nothing moved out of place.

### Step 2 — Trigger the public mirror (manual)

Run the mirror script from the private repo. It copies **Grade A/B schemas only**
to `flowmcp-schemas-public`; lower grades are skipped automatically.

```bash
node scripts/mirror-from-private.mjs
```

The mirror is a **manual** step — it does not run on its own. The public repo is
written exclusively by this script; treat any manual change there as a mistake.

### Step 3 — Verify

- Confirm the schema is present at `schemas/v4.0.0/<PROVIDER>/` in private
- Confirm the mirror copied it to public only if Grade A/B (skipped otherwise)
- Spot-check the public file matches the private source (mirror, not a fork)

## Rules

- Private is the single source of truth; public is generated.
- Only Grade A/B schemas are mirrored — the script enforces this, do not override it.
- The mirror runs manually via `mirror-from-private.mjs`; never hand-copy files into public.
- A deploy never edits schema content — fix issues upstream, then re-deploy.

## See also

- [`../flowmcp-schema/SKILL.md`](../flowmcp-schema/SKILL.md) — lifecycle entry point
- [`../flowmcp-schema-test/SKILL.md`](../flowmcp-schema-test/SKILL.md) — preceding live-test stage
- [`../../grading/README.md`](../../grading/README.md) — grading stage (Grade A/B gate)
- `spec/v4.3.0/21-schema-lifecycle.md` — canonical lifecycle (§21)
