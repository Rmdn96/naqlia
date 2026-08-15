# Unified Authentication, Customer Account, and Staff Dashboard v1

## 1. Purpose and status

This document defines the implemented v1 identity and portal architecture for Naqlk. It extends the accepted Guest, Sales, Operations, Tracking, Reviews, and Quality systems without replacing their business logic.

The implementation uses one Supabase Auth identity and resolves two independent contexts after authentication:

- an optional Customer Account context for owned customer journeys; and
- an invite-only Staff context governed by database roles and permissions.

An identity may hold both contexts. Guest use remains fully supported.

## 2. Repository audit

The pre-implementation audit found:

- Supabase Auth already provided email magic-link authentication, PKCE callback exchange, and optional Google/Apple provider flags.
- `profiles`, `roles`, `permissions`, `profile_roles`, and `role_permissions` formed a database-authoritative RBAC model. Active staff had one active role.
- Staff provisioning was service-role-only. The accepted workspaces performed server-side permission checks and their RPCs repeated authorization internally.
- Sales, Operations, and Quality used separate route shells but reusable feature services and components.
- Guest quotation and Tracking access already used 256-bit random capabilities stored only as SHA-256 hashes. NQ plus normalized mobile was an Operations recovery boundary, not general ownership proof.
- Leads already supported an optional `profile_id`, while Guest submission deliberately left it null.
- `lead_activity_logs` was the shared audit stream but required a platform-event scope for non-Lead administration events.
- WhatsApp, Google Review, and quotation validity used centralized environment/configuration fallbacks.
- Existing migrations, RLS, reference generation, Sales/Operations state machines, quotation immutability, and Review workflows were suitable for extension and were not redesigned.

The principal mismatch was the prior exclusive customer/staff profile classification. v1 retains the existing staff profile rule for RBAC compatibility and introduces `customer_accounts` as an independent context, allowing one Auth identity to be both Staff and Customer without duplicate Auth users.

## 3. Identity resolution

The localized entry point is `/ar/login` or `/en/login`. It never asks the user to choose a role.

1. Email magic link is always available.
2. Google or Apple is rendered only when its corresponding approved provider flag is enabled.
3. `/auth/callback` exchanges the PKCE code server-side. It also accepts allowlisted one-time `token_hash` callbacks for invite, magic-link, and recovery flows, verifies them server-side, and immediately redirects to a clean URL.
4. `resolve_identity_context()` activates/loads the profile, creates the optional Customer Account context idempotently, updates last login, and reads active Staff role/permissions from PostgreSQL.
5. Active Staff defaults to `/{locale}/dashboard`; a non-Staff identity defaults to `/{locale}/account`.
6. A Staff identity with Customer context can explicitly switch between Work Dashboard and Personal Account.

Auth user metadata is used only for non-authoritative locale initialization. It cannot grant a role or permission. Public self-registration creates no Staff role.

Inactive staff retain Auth history but cannot satisfy authoritative permission checks. Direct protected-route access consequently redirects or returns not found, while protected RPCs return authorization errors.

## 4. Guest, Customer, and Staff modes

### Guest

No authentication is required for request submission, quotation response, Tracking, receipt confirmation, cancellation request, or eligible Review submission. Existing hashed capability boundaries remain authoritative.

### Customer

`customer_accounts` is a one-to-one context attached to a profile. The localized account provides:

- verified email state, optional normalized Saudi mobile, display name, and locale;
- My Requests and non-draft Quotations;
- active and completed Orders;
- secure access back into Tracking and Review; and
- explicit secure claiming of an eligible historical Guest request.

Opening owned Tracking rotates and returns a new high-entropy Tracking capability through a server action. Plaintext exists only for the one-time redirect into the existing secure Tracking URL and is never stored by the application.

### Staff

Staff remains invite-only. Current roles are Super Admin, Sales, Operations, Finance, and Customer Service. `staff_access_status` separates active, inactive, and non-Staff access while preserving audit history.

## 5. Secure ownership claiming

Historical data is never linked from matching name, email, mobile, NQ reference, Lead UUID, Order UUID, or Job UUID.

The customer supplies an existing secure quotation or Tracking URL. The account RPC:

- validates the 64-character capability shape;
- hashes the supplied token with SHA-256;
- resolves only an active/responded eligible quotation capability or an active unexpired Tracking capability;
- scopes the resolved Lead to the current authenticated Customer Account;
- serializes competing claims with a transaction advisory lock; and
- enforces a unique Lead ownership link.

The ownership link is authoritative in `customer_account_leads`. A verified claim does not rewrite
the Guest Lead or address profile fields: those fields are immutable submission provenance. Preview
acceptance exposed that the initial implementation attempted that prohibited rewrite. The
forward-only `20260815113000_customer_account_claim_ownership_fix.sql` migration removed the
rewrite, retained the advisory lock and unique ownership rule, and made same-account retries return
success without creating duplicate links or Activity events.

An authenticated request submitted in the same session links through its random submission idempotency key. Guest submission behavior is unchanged if account linking fails.

Threats mitigated include identifier substitution, contact-data collision, arbitrary NQ claiming, cross-account linking, duplicate claims, and simultaneous first claims. The generic invalid response intentionally avoids disclosing whether a capability or record exists.

## 6. Staff Portal

The unified shell wraps the accepted Sales, Operations, and Quality routes. It adds:

- permission-aware sidebar navigation;
- responsive mobile drawer;
- top-bar exact-NQ Global Search;
- event-derived notification center;
- Light/Dark preference stored locally; and
- Personal Account and sign-out actions.

Hiding navigation is convenience only. Each layout and RPC enforces authorization independently.

The Finance surface contains only accepted Order counts/value/average derived from current immutable Order totals. It is explicitly not accounting, payment, VAT filing, reconciliation, AR, AP, or a ledger.

## 7. Role-aware Dashboard and Action Center

`portal_get_dashboard()` returns a role-specific projection:

- Sales: new Leads, drafts, sent/awaiting response, accepted Orders, and approved commercial totals.
- Operations: unscheduled/today/in-progress Jobs/Trips, delays, issues, cancellations, and awaiting confirmation.
- Customer Service: open Quality Alerts, low ratings, recent Reviews, and cancellation requests.
- Finance: limited accepted Order volume/value only.
- Super Admin: Sales overview plus active Trips, delays, issues, cancellations, Quality Alerts, and completed Jobs.

Action Center entries link to an authorized filtered workspace where a suitable existing filter exists. Quick actions are generated from the same role-aware response rather than from client role assumptions.

## 8. Global Search

Global Search accepts only the exact `NQ-YYYYMM-000001` shape. Each Lead, Job, Review, or Order branch is independently gated by its feature read permission. It returns only a safe label, NQ reference, type, and authorized route. It is not a fuzzy customer, mobile, email, UUID, or unrestricted database search.

## 9. Notifications

The MVP uses a hybrid model:

- the immutable Activity Log is the event source;
- permission rules derive the currently visible 30-day notification projection; and
- `staff_notification_reads` materializes only per-profile read state.

This avoids duplicating every event, makes permission revocation effective on the next request, and makes mark-read concurrency-safe through a composite primary key and conflict-safe insert. No capability, contact detail, internal note, or secret is copied into notification state.

## 10. Business Settings and runtime fallback

`business_settings` contains an allowlisted set of non-secret textual values. Super Admin has read/manage permissions; public callers receive only rows explicitly marked public through a narrow RPC.

Implemented groups are Contact, Social, Customer, Quotation, and Business Identity. Canonical origin, Supabase/Vercel credentials, OAuth secrets, capability tokens, session secrets, and database credentials are excluded.

Runtime public resolution is:

1. public Business Setting;
2. existing environment/central configuration fallback; and
3. safe product fallback where defined.

This keeps `966547349947` operational during migration/outage, hides Google Review CTA when no valid HTTPS URL exists, and uses configured quotation validity without scattering values through components. Google CTA remains independent of rating.

Cities remain the Service Area source. The settings UI manages active/inactive state and ordering; no duplicate geography model or SEO city pages were created.

## 11. Invitations and Staff lifecycle

Super Admin can search/filter users, invite Staff, resend/cancel pending invitations, change role, deactivate, and reactivate.

- New identities use Supabase invitation email.
- Existing Customer identities receive the normal passwordless email flow and gain Staff context on the same Auth user.
- No plaintext magic link is generated, displayed, logged, or persisted by application code.
- Role assignment and lifecycle changes are completed by permission-checked database functions.
- Deactivation is preferred to deletion.

Last-Super-Admin safety is enforced by an advisory transaction lock, function checks, and a table trigger. Concurrent role changes or deactivations cannot remove the final active Super Admin.

The Roles & Permissions page is read-only. Custom roles and arbitrary permission editing remain out of scope.

## 12. Activity Log

The existing Activity Log now supports Lead-scoped and platform-scoped subjects. Meaningful account, settings, invitation, role, and access events use the same table. The administration projection removes internal reasons, notes, comments, and other sensitive detail keys.

The platform writer rejects metadata keys containing token, password, secret, session, or magic-link terminology. Ordinary Staff has no update/delete route for audit history.

## 13. RBAC, RLS, and function security

- New tables have RLS enabled.
- Anonymous roles have zero direct table access.
- Customer RLS selects only the current Customer Account and its links.
- Staff read policies call database-authoritative permission checks.
- Mutations use narrowly granted RPCs with internal authorization and validation.
- Every new security-definer function has an empty fixed `search_path` and schema-qualified object references.
- The only anonymous function introduced is the public non-secret settings projection.
- Service-role access is confined to existing server/operator boundaries.

## 14. Concurrency and idempotency

- Customer Account creation uses a unique profile constraint and conflict handling.
- Lead claiming uses a per-Lead advisory lock plus unique ownership constraint.
- Notification read state uses a composite primary key and `ON CONFLICT DO NOTHING`.
- Business Setting updates lock the target row and increment a version.
- Staff role/access changes serialize on the last-Super-Admin lock.
- Pending invitation email uniqueness prevents duplicate active invitations.
- Tracking capability issue uses the accepted serialized rotation function.

Role changes and deactivation take effect at the next server permission check even if an Auth cookie is still present.

## 15. Privacy, localization, and responsive behavior

Login, account, quotation, Tracking, and all Staff areas emit private/no-store, no-referrer, and noindex headers. Capabilities do not enter metadata or generic audit payloads.

Arabic is default and RTL; English is LTR. The Portal drawer preserves all actions on small screens, tables scroll safely, and account cards collapse responsively. Theme is a non-security local preference.

## 16. Performance review

Indexes are present for Customer Account ownership traversal, per-profile notification reads, Activity Log area/actor/event filtering, settings category lookup, pending-invitation queues, invitation-by-Auth-user lookup, and role/status lookup. The Auth-user invitation index directly supports the user-management lateral lookup.

Foreign keys used only for low-volume audit attribution (`business_settings.updated_by_profile_id`, invitation actor fields) are intentionally not indexed in v1 because no current query filters or joins through them. They should be reconsidered after representative production query statistics exist. Existing indexes reported as unused were not removed because pre-launch traffic is not representative.

## 17. Future boundaries

Future work may add verified mobile enrollment, governed settings drafts/publishing/rollback, cache invalidation, richer Customer notification delivery, more Staff workspace list routes, custom role design through a separately approved model, and the commercial-domain cutover. None should weaken Guest capability security or make client metadata authoritative.
