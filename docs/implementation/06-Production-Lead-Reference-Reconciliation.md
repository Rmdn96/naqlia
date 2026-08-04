# Production Lead Reference Reconciliation

Status: applied and verified in the production Supabase project on 2026-08-04.

## 1. Incident summary

Production continued assigning legacy `LD-YYYYMMDD-XXXXXXXXXX` references after the repository approved `NQ-YYYYMM-000001`. The UUID Lead primary key, public uniqueness constraint, and Guest-First request boundary remained intact, but the environment did not match the repository migration sequence.

This maintenance change contains no product feature, UI redesign, API expansion, RLS change, or business-table redesign.

## 2. Exact root cause

The production migration ledger jumped from `20260803170500_public_request_repair_arabic_catalog` to `20260804090000_sales_workspace`. `20260803171000_standardize_lead_references` was neither recorded nor executed. The migration had been applied to the feature environment only; the production apply was a manual operational step and had no repository-to-production checksum gate. No later migration restored the legacy behavior: production simply retained the original Lead default, validation trigger path, and `LD` check constraint from Sprint 2A.

Replaying the immutable missing migration transactionally succeeded and deterministically converted existing Leads. Its first live allocation then exposed a latent defect that could not have appeared while the migration was absent: `private.next_lead_reference()` used `reference_month` as both a PL/pgSQL variable and the `ON CONFLICT` column target. PostgreSQL rejected the request with `42702` because that identifier was ambiguous.

The response was therefore two-stage and forward-only:

1. apply and accurately record the previously skipped immutable migration; and
2. apply a new corrective migration for the allocator defect.

## 3. Corrective migration

`20260804113000_reconcile_lead_reference_generation.sql` is the authoritative correction. Its canonical SHA-256 checksum is:

`e8f566ed2ce4cc65b720b3c5d2e57c684cfc6f8956703468529b0fb61d01fa97`

The migration:

- requires the standardization migration and rejects any remaining non-`NQ` reference;
- retains UUID primary keys and `uq_leads__reference_number` as the unique indexed public reference;
- retains the strict `NQ-[0-9]{6}-[0-9]{6}` check;
- removes any Lead reference default so inserts cannot bypass the database trigger;
- reconciles each monthly counter to the highest stored suffix;
- uses the unambiguous local variable `current_reference_month`;
- performs one atomic upsert against `pk_lead_reference_counters`, incrementing the row under PostgreSQL concurrency control;
- derives the month from `clock_timestamp()` in `Asia/Riyadh`;
- recreates the single authoritative before-insert trigger; and
- revokes direct allocator execution from `public`, `anon`, `authenticated`, and `service_role`.

The accompanying rollback deliberately aborts. Restoring the known-ambiguous allocator or a legacy generator is unsafe; recovery must be another reviewed forward migration.

## 4. Production verification

Production history now records both migrations:

| Version          | Name                                  | Canonical history SHA-256                                          |
| ---------------- | ------------------------------------- | ------------------------------------------------------------------ |
| `20260803171000` | `standardize_lead_references`         | `905944d049d37930e4c0fe78cdf2fa46b0283c19a2a129629dae36efd73e997e` |
| `20260804113000` | `reconcile_lead_reference_generation` | `e8f566ed2ce4cc65b720b3c5d2e57c684cfc6f8956703468529b0fb61d01fa97` |

The active database state was verified after the corrective apply:

- `private.next_lead_reference()` uses the fixed empty `search_path` and the named counter constraint;
- `trg_leads__before_insert__assign_public_reference` is the only Lead reference allocation trigger;
- no database function definition contains an `LD-` generator;
- the Lead reference column has no default;
- the NQ check and unique indexed constraint are present;
- RLS remains enabled on `leads` and `lead_reference_counters`;
- the Lead/counter policy fingerprint is unchanged from the pre-migration snapshot; and
- no stored Lead retains an `LD-` reference.

Transactional dry runs were performed before each production apply. The corrective dry run also allocated a reference and rolled back, proving that the function compiles and executes without consuming a sequence value.

## 5. End-to-end acceptance and cleanup

Two real Guest requests were submitted through the deployed public wizard:

- Arabic: `NQ-202608-000004`;
- English: `NQ-202608-000005`.

Both success routes accepted the new format and displayed it. The contact and tracking WhatsApp links contained the matching reference. An authenticated Super Admin search through the Sales Workspace RPC returned `NQ-202608-000004` as the sole match.

Idempotency was verified by submitting the same opaque submission key concurrently: both calls returned the same Lead and `NQ-202608-000006`, with exactly one database row. Distinct concurrent submissions returned unique sequential references `NQ-202608-000007` and `NQ-202608-000008` (completion order was intentionally nondeterministic).

All seven clearly labelled maintenance or Sprint 4 acceptance Leads were retained for audit traceability and moved to `cancelled` with an internal archival note. The legitimate Lead `NQ-202608-000001` was not modified. No legitimate business record was deleted.

## 6. Migration-drift prevention

`supabase/migration-checksums.json` is the approved dual baseline:

- `repository_sha256` protects each immutable repository migration; and
- `production_history_sha256` protects the exact canonical SQL stored in the production migration ledger.

The dual baseline is intentional. Five migrations applied before checksum enforcement have reviewed historical statement text that differs from the current repository file. Their history is not rewritten. Any future change on either side, a missing migration, an unexpected migration, or a name mismatch fails the check clearly.

Run the read-only operator check with a secret direct database URL:

```bash
npm run supabase:migrations:verify
```

The same-repository pull-request, scheduled, and manual `Production Migration Drift` GitHub workflow uses the encrypted `SUPABASE_PRODUCTION_DB_URL` repository secret and maps it to `SUPABASE_DB_URL`. Pull requests from forks are explicitly excluded from the secret-backed job. The verifier never prints the URL or database credentials.

For every future migration:

1. review and merge the immutable migration file;
2. apply it to the target environment;
3. add its repository and target-history checksums to the manifest in the same release change;
4. run the verifier; and
5. treat any drift result as a release blocker.

## 7. Leaked-password protection

The production project is on the Supabase Free plan. The dashboard exposes the leaked-password status but does not provide an enable control on this plan, so no workaround was attempted. Enabling the native protection after a plan upgrade remains tracked in [Leaked-Password Protection](../backlog/02-Leaked-Password-Protection.md). Existing passwordless staff authentication continues to operate normally.

## 8. Release validation

The maintenance branch passed formatting, ESLint with zero warnings, strict TypeScript, 63 tests across 16 files, and the Next.js production build. The corrective migration passed transactional dry-run execution before production apply. Dependency audit retains the previously accepted moderate transitive `hono` advisory tracked in GitHub issue #12; no broad dependency upgrade was performed.

Post-apply Supabase Advisor results:

- Security Advisor: zero errors and six warnings. Five are the previously reviewed, internally authorized Sales `SECURITY DEFINER` RPC boundaries; the sixth is the plan-limited leaked-password setting.
- Performance Advisor: zero errors, zero warnings, and 60 informational suggestions.

The GitHub workflow requires one operator action after merge: configure the encrypted `SUPABASE_PRODUCTION_DB_URL` Actions secret, then run `Production Migration Drift` once manually to establish the scheduled check.
