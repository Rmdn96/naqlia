# Naqlk Identity Foundation

| Document field | Value                                              |
| -------------- | -------------------------------------------------- |
| Sprint         | 1B — Identity Foundation                           |
| Status         | Implemented and verified                           |
| Version        | 1.0.0                                              |
| Effective date | 2026-08-03                                         |
| Branch         | `feature/sprint-1b-identity-foundation`            |
| Owners         | Engineering, Platform, Security, and Product       |
| Parent         | [Supabase Foundation](./01-Supabase-Foundation.md) |

## 1. Purpose

Sprint 1B establishes Naqlk's production identity, access-control, and storage foundation. It deliberately creates no Customer, Lead, Quotation, Order, business API, business page, or business permission.

The implementation has four boundaries:

1. Supabase Auth owns authentication identities, credentials, provider links, verification, and sessions.
2. Naqlk profiles exist only for authenticated users.
3. PostgreSQL owns authoritative staff roles, identity permissions, assignments, and permission checks.
4. Guest business journeys remain unauthenticated and independent from the identity model.

## 2. Guest-First Invariants

Guest is an application access state, not a Supabase anonymous Auth user.

- A visitor does not sign in, receive an Auth identity, or receive a Profile.
- Guest requests, attachments, quotations, and tracking remain future business capabilities.
- The `anon` role has no access to identity tables or identity RPCs.
- Supabase anonymous sign-ins are disabled.
- The private `attachments` bucket has no public upload or read policy in this sprint.
- A future guest-upload flow must be server-mediated, short-lived, subject-bound, rate-limited, validated, and audited after the Attachment business model exists.
- Order tracking will use Order Number plus normalized Mobile Number and return only a minimized public projection. It must never depend on a Profile.

These rules prevent an identity table from becoming an accidental prerequisite for conversion.

## 3. Authentication Architecture

| Method         | Project state      | Sprint 1B boundary                                                                                                                                                   |
| -------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guest          | Ready without Auth | No Supabase user or Profile is created.                                                                                                                              |
| Email          | Enabled            | New users may sign up; email confirmation is required. No login UI is included.                                                                                      |
| Google OAuth   | Prepared, disabled | Application PKCE support exists. Enable only after approved Google client credentials and consent configuration are available.                                       |
| Apple Sign-In  | Prepared, disabled | Application PKCE support exists. Enable only after approved Apple identifiers, key material, private-email relay setup, and secret-rotation ownership are available. |
| Phone          | Disabled           | Not part of the approved Sprint 1B identity scope.                                                                                                                   |
| Anonymous Auth | Disabled           | Guest-first does not use anonymous Supabase identities.                                                                                                              |

The technical OAuth callback remains `{NEXT_PUBLIC_APP_URL}/auth/callback`. Provider flags fail closed: application code refuses to initiate Google or Apple OAuth while the corresponding public flag is `false`.

Authentication does not imply business authorization. Internal staff must have a verified Auth session, an active staff Profile, one active approved role, and the requested active permission. Returning-customer authentication remains optional and customer-account linking is deferred.

## 4. Profile Model

`profiles` is an authenticated-identity extension, not a Customer table.

| Concern          | Decision                                                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Identity link    | One optional, unique `auth_user_id` references `auth.users.id`. It is immutable except governed detachment during Auth deletion. |
| Profile kinds    | `customer` and `staff`.                                                                                                          |
| Lifecycle        | `pending`, `active`, `suspended`, and terminal `closed`.                                                                         |
| Locale           | Arabic (`ar`) by default; English (`en`) is supported.                                                                           |
| Display identity | Optional localized-safe display name; no credential or provider token is stored.                                                 |
| Concurrency      | Positive `version` plus `updated_at` supports later optimistic-control decisions.                                                |
| Guest rule       | A guest never receives a Profile.                                                                                                |
| Deletion         | Auth deletion closes and detaches the Profile; it does not hard-delete application evidence.                                     |

An `auth.users` insert trigger creates a pending customer Profile using only the Auth identifier and an allowed locale. Existing Auth users are backfilled idempotently by the migration. A deletion trigger closes the Profile before the foreign key detaches it. The trigger performs no business work and is intentionally small because Auth-trigger failures can block identity lifecycle operations.

Active staff Profiles must have exactly one active role. Customer Profiles cannot hold staff roles. The database enforces both invariants.

## 5. RBAC Architecture

### 5.1 Identity tables

| Table              | Responsibility                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| `roles`            | Five fixed, bilingual MVP staff-role definitions.                                                |
| `permissions`      | Stable, locale-neutral permission keys and bilingual descriptions.                               |
| `role_permissions` | Retained grant/revocation facts connecting roles to permissions.                                 |
| `profile_roles`    | Retained grant/revocation facts assigning exactly one effective role to an active staff Profile. |

The five fixed roles are:

- `super_admin`;
- `sales`;
- `operations`;
- `finance`; and
- `customer_service`.

Custom tenant roles, multiple simultaneous staff roles, business-unit scope, and an Admin permission editor remain out of scope.

### 5.2 Permission vocabulary

Sprint 1B seeds identity permissions only:

- `identity.profile.read`;
- `identity.profile.manage`;
- `identity.role.read`;
- `identity.permission.read`; and
- `identity.assignment.manage`.

Only Super Admin receives these initial permissions. Sales, Operations, Finance, and Customer Service receive no business or identity-management permissions in this sprint. Business permissions must arrive with their owning feature migration, tests, RLS review, and documentation.

Role and permission keys are immutable. Grants and assignments are revoked rather than overwritten or hard-deleted, preserving actor, reason, and time where an authenticated actor exists.

## 6. Authorization and RLS

Authorization is database-authoritative. User-editable Auth metadata is never an authorization source.

The server helper follows this sequence:

1. verify that a signed session exists using `auth.getClaims()`;
2. call the `has_permission` database function;
3. fail closed on missing identity, inactive Profile, inactive role, inactive grant, inactive permission, RPC failure, or denial; and
4. throw only a stable `FORBIDDEN` application error to callers.

| Resource         | Authenticated read boundary                    | Direct mutation boundary                                  | Anonymous boundary |
| ---------------- | ---------------------------------------------- | --------------------------------------------------------- | ------------------ |
| Profiles         | Own Profile or `identity.profile.read`         | Trusted service role; interactive Admin workflow deferred | None               |
| Roles            | Assigned role or `identity.role.read`          | Migration/trusted service role only                       | None               |
| Permissions      | `identity.permission.read`                     | Migration/trusted service role only                       | None               |
| Role permissions | Own assigned role or `identity.role.read`      | Migration/trusted service role only                       | None               |
| Profile roles    | Own assignment or `identity.assignment.manage` | Trusted service role; interactive Admin workflow deferred | None               |

All five identity tables have RLS enabled. Public and anonymous grants are revoked. Authenticated users receive select capability only, with RLS deciding visible rows. Mutation is not granted directly to authenticated users.

### 6.1 Approved functions

| Function                         | Caller                     | Purpose                                                                         |
| -------------------------------- | -------------------------- | ------------------------------------------------------------------------------- |
| `current_profile_id()`           | Authenticated/service role | Security-invoker wrapper over the private authoritative identity evaluator.     |
| `has_permission(permission_key)` | Authenticated/service role | Security-invoker wrapper over the private authoritative permission evaluator.   |
| `assign_staff_role(...)`         | Service role only          | Retained for a future audited Admin command boundary; not interactive-callable. |
| `revoke_staff_role(...)`         | Service role only          | Retained for a future audited Admin command boundary; not interactive-callable. |
| `set_profile_status(...)`        | Service role only          | Retained for a future audited Admin command boundary; not interactive-callable. |
| `provision_staff_identity(...)`  | Service role only          | Bootstrap or reconcile a staff Profile from an existing Auth user.              |

The authoritative identity and permission evaluators are private security-definer functions with an empty fixed search path, fully qualified object names, and narrowly scoped execute grants. Public authenticated helpers are security-invoker wrappers. Identity mutation functions retain their internal authorization checks but are not granted to authenticated users until an audited Admin command workflow exists. The last active Super Admin cannot be deactivated or revoked.

## 7. Staff Provisioning

Internal staff must first exist as Supabase Auth users. The operator then runs:

```bash
npm run supabase:staff:provision -- \
  --email staff@example.com \
  --display-name "Approved Name" \
  --role super_admin \
  --reason "Initial approved workforce bootstrap"
```

The script:

- requires the project URL and a server-only Supabase secret key;
- locates an existing Auth user by exact normalized email;
- calls only the service-role provisioning function;
- validates the role against the five approved keys;
- requires a meaningful change reason; and
- never prints the email address, Auth identifier, or secret.

The initial Super Admin must be created through this controlled bootstrap path. There is no self-promotion, default-admin-by-email, or dashboard bypass.

## 8. Storage Foundation

| Bucket          | Visibility  | Maximum object size | Allowed media types   |
| --------------- | ----------- | ------------------- | --------------------- |
| `attachments`   | Private     | 10 MiB              | PDF, JPEG, PNG, WebP  |
| `public-assets` | Public read | 5 MiB               | AVIF, JPEG, PNG, WebP |

Bucket definitions are reconciled in two idempotent forms:

1. `20260803142000_storage_create_foundation_buckets.sql` uses an idempotent database upsert for environment provisioning.
2. `scripts/supabase/initialize-storage.mjs` provides read-only drift checking and explicit operator-approved reconciliation through the official Storage API.

```bash
npm run supabase:storage:check
npm run supabase:storage:init
```

No object upload, download, signed-URL, ownership, quarantine, scanning, or retention behavior is implemented. No Storage object policy grants guest or authenticated uploads. `public-assets` means that approved objects are publicly readable; it does not make object mutation public.

## 9. Migrations and Database Decisions

| Migration                                              | Scope                                                                                    |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `20260803140500_identity_create_foundation.sql`        | Profiles, fixed RBAC, Auth lifecycle triggers, authorization functions, grants, and RLS. |
| `20260803142000_storage_create_foundation_buckets.sql` | Exact bucket access, size, and media-type configuration.                                 |

Both migrations are transactional and were validated in rollback-only transactions before being applied. The remote Supabase migration ledger records both versions and the checksums were verified against the repository files.

The target Supabase project runs PostgreSQL 17.6 and does not expose a native or approved extension-provided UUIDv7 generator. Sprint 1B therefore uses PostgreSQL's cryptographically strong UUIDv4 `gen_random_uuid()` as a documented platform exception. No custom UUID generator or extension was introduced. A future change requires an additive reviewed migration; existing identifiers remain valid.

## 10. Environment Variables

| Variable                               | Exposure           | Required                     | Purpose                                                                                                               |
| -------------------------------------- | ------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`                  | Public             | Application runtime          | Active application origin for OAuth callback construction. SEO canonicals use `BRAND.domains.activeProductionOrigin`. |
| `NEXT_PUBLIC_SUPABASE_URL`             | Public             | Supabase clients and scripts | Project URL.                                                                                                          |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public             | Application runtime          | Public project key; all data protection still depends on RLS.                                                         |
| `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED`      | Public             | Application runtime          | `true` only after Google is fully configured and verified.                                                            |
| `NEXT_PUBLIC_AUTH_APPLE_ENABLED`       | Public             | Application runtime          | `true` only after Apple is fully configured and verified.                                                             |
| `SUPABASE_SECRET_KEY`                  | Secret/server-only | Operator scripts only        | Storage reconciliation and controlled staff provisioning. Never used by browser application code.                     |

No new secret is committed. Secret values belong only in an approved local secret store or encrypted CI/operator environment. The elevated key must be short-lived or purpose-controlled where the platform supports that model.

## 11. Security Review

The implementation addresses the following launch risks:

- **Guest privilege escalation:** guests have no identity row, identity grant, or identity RPC access.
- **JWT metadata tampering:** permissions come from active database records, not mutable user metadata.
- **Horizontal profile access:** self-read is keyed to verified `auth.uid()`; broader reads require explicit permission.
- **Direct table mutation:** authenticated direct writes are revoked.
- **Privilege persistence:** role/profile suspension, role/grant status, and permission status all participate in authorization.
- **Last-admin lockout:** the last active Super Admin cannot be deactivated or revoked.
- **Unsafe deletion:** Auth deletion closes/detaches rather than cascading through application records.
- **Open redirect:** the Sprint 1A callback accepts only validated local redirect paths.
- **Secret exposure:** elevated scripts are server-only and do not print secret or identity data.
- **Upload abuse:** private attachment access, strict bucket limits, and zero upload policies remain the default until the business upload contract exists.

An application Super Admin is not equivalent to the Supabase service role. Service-role credentials must never enter a user session or browser bundle.

Sprint 2A hardens this boundary through `20260803154500_identity_harden_authorization_boundary.sql`. Authoritative identity evaluation now lives in the private schema, public authenticated helpers are security-invoker wrappers, and authenticated execution of identity mutation functions is revoked until the audited Admin workflow exists. The service-only provisioning function remains unavailable to authenticated users. The live Supabase Security Advisor consequently reports zero errors, zero warnings, and zero informational findings. The Performance Advisor reports zero errors and zero warnings; informational unused-index suggestions are expected on a newly provisioned schema and must be reevaluated with production query data.

## 12. Future Customer Account Linking

Future returning-customer support must preserve guest-first history and avoid contact-based account takeover:

1. Auth creates a pending customer Profile.
2. A separate future verification flow proves control of the customer contact.
3. The application links the Profile to the Customer using a unique governed relationship.
4. Existing Lead, Quotation, Order, and attachment evidence stays owned by business records.
5. Matching email or mobile text alone never links history.
6. Linking, conflict resolution, unlinking, and recovery are audited.

No Customer table or linking column is created in Sprint 1B.

## 13. Provider Activation Checklist

### 13.1 Google

1. Approve the Google Cloud project, consent screen, branding, support contacts, and authorized domains.
2. Create approved web client credentials and store the secret outside source control.
3. Add the Supabase provider callback URL in Google.
4. Enable Google in Supabase and save the client ID/secret.
5. Verify the application Site URL and redirect allowlist for production and previews.
6. Complete a PKCE login/callback/session/logout test.
7. Set `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true` only in verified environments.

### 13.2 Apple

1. Approve the Apple Services ID, domain, return URL, team ID, key ID, and signing key.
2. Configure private-email relay sources and operational ownership.
3. Generate/store the provider secret and assign a rotation owner before its expiry.
4. Enable Apple in Supabase and verify production callback behavior.
5. Set `NEXT_PUBLIC_AUTH_APPLE_ENABLED=true` only after the end-to-end test passes.

Until those checklists are complete, both providers must remain disabled in Supabase and application environment flags.

## 14. Verification Evidence

- remote preflight: zero existing Auth users and zero public application tables;
- identity migration: rollback-only validation succeeded before commit;
- live catalog: exactly five identity tables, all with RLS enabled;
- live policies: five select policies and no anonymous table/RPC access;
- live advisors after Sprint 2A hardening: zero Security Advisor errors/warnings/informational findings and zero Performance Advisor errors/warnings;
- seed data: five roles, five identity permissions, and five Super Admin permission grants;
- lifecycle: two Auth-user triggers installed;
- storage migration: rollback-only validation succeeded before commit;
- live buckets: exact visibility, size limits, and media allowlists verified;
- migration history: both remote versions and normalized file checksums verified;
- local quality gate: formatting, ESLint, strict TypeScript, tests, dependency audit, and production build are required before merge.

## 15. Deferred Scope

- customer login, registration, recovery, onboarding, and account pages;
- Customer, Lead, Quotation, Order, Attachment metadata, Notification, and Audit Log business tables;
- guest submission, upload, quotation receipt, and tracking APIs or pages;
- business permissions and feature RLS policies;
- customer-account verification and history linking;
- object upload/download/signing/scanning/retention flows;
- multi-company roles, business-unit scope, access reviews, and custom role administration; and
- Google/Apple activation until approved external credentials exist.

## 16. References

- [Supabase: User management](https://supabase.com/docs/guides/auth/managing-user-data)
- [Supabase: Role-based access control](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase: Google login](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase: Apple login](https://supabase.com/docs/guides/auth/social-login/auth-apple)
- [Supabase: Storage buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Supabase: Database migrations](https://supabase.com/docs/guides/deployment/database-migrations)
