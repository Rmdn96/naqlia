# Naqlia Core Business Database

| Document field | Value                                                        |
| -------------- | ------------------------------------------------------------ |
| Sprint         | 2A — Core Business Database                                  |
| Status         | Implemented and verified in Supabase Production              |
| Version        | 1.0.0                                                        |
| Effective date | 2026-08-03                                                   |
| Project        | Supabase project `bxyplqllksnvqddsipzz`                      |
| Scope          | Database foundation only; no UI, application API, or pricing |

## 1. Purpose

Sprint 2A implements the smallest production database slice that supports Naqlia's guest-first intake and the Lead → Quotation → Order lifecycle. It creates eight business tables, fixed staff permissions, RLS policies, reference seeds, lifecycle guards, and rollback support. It does not create frontend pages, dashboard behavior, business API routes, a pricing engine, payment integration, or customer-facing tracking logic.

This document is the implementation source of truth for the deployed Sprint 2A schema. The broader domain and MVP documents remain the source for future scope.

## 2. Implemented tables

| Table              | Responsibility                                                                                                  | Deletion policy                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `cities`           | Bilingual Saudi city reference catalog used by addresses and launch coverage decisions.                         | Soft delete with actor and reason.                      |
| `addresses`        | Precise address, Google Maps place identity, coordinates, and future route-access context.                      | Soft delete while unreferenced; immutable once on Lead. |
| `services`         | Bilingual configurable catalog of the four approved core services.                                              | Soft delete with actor and reason.                      |
| `service_options`  | Bilingual Packing and Loading & Unloading options; supports global or service-specific eligibility.             | Soft delete with actor and reason.                      |
| `leads`            | Guest or authenticated service request, customer contact, route, service selection, snapshots, and Sales state. | Lifecycle status; no ordinary hard/soft delete.         |
| `lead_attachments` | Metadata for Lead-owned objects in the private `attachments` Storage bucket.                                    | Soft removal preserves object provenance.               |
| `quotations`       | Versioned staff-authored commercial offer with totals, validity, review notes, and approval state.              | Lifecycle status; issued terms are immutable.           |
| `orders`           | Operational commitment created once from an approved, unexpired Quotation.                                      | Lifecycle status; source and totals are immutable.      |

Every table has a UUID primary key and UTC creation/update timestamps. Mutable records use `created_by_profile_id` and `updated_by_profile_id`; guest and service-role writes may retain null actor references. Catalog, address, and attachment records add attributable soft-delete fields where restoration is meaningful.

The deployed PostgreSQL version does not provide the previously preferred native UUIDv7 generator. Sprint 2A therefore continues the approved Sprint 1B `gen_random_uuid()` UUIDv4 strategy instead of introducing an extension or a second identifier generator.

## 3. Relationship rules

- One City has many Addresses; every Address references exactly one City.
- A Service may have many Service Options. A null `service_options.service_id` means the option applies globally.
- A Lead references one Service, one pickup Address, and one delivery Address.
- A Lead may reference zero or one authenticated Profile. Guest Leads keep `profile_id` null.
- Requested Service Options are held in a validated UUID array because a new join table is outside the approved eight-table Sprint 2A scope. The trigger rejects missing, inactive, duplicate, or service-ineligible options and writes bilingual snapshots.
- One Lead has many attachment metadata rows and may have many Quotation revisions.
- A Lead may have at most one approved Quotation at a time.
- One approved Quotation may produce exactly one Order; `orders.quotation_id` is unique.
- Foreign keys use `ON DELETE RESTRICT` so reference, commercial, and operational history cannot disappear through a parent deletion.

## 4. Guest-first intake

Guests never require Auth or Profile records. The `anon` role can:

- read only active, non-deleted Cities, Services, and Service Options;
- insert guest-owned Addresses; and
- insert a new web Lead with null Profile and staff-only fields cleared.

The database trigger overrides guest-controlled Lead reference, source, status, staff notes, and lifecycle dates. Guest contact mobile numbers must use normalized Saudi E.164 format. Pickup and delivery Addresses must be distinct, undeleted, and guest-owned.

The `anon` role receives no direct `SELECT` privilege on Addresses, Leads, attachments, Quotations, or Orders. Consequently, possession of a UUID, Lead reference, Quotation number, or Order number cannot expose a row. The future tracking application must implement the approved purpose-bound Order Number + Mobile Number flow through a trusted server boundary, rate limiting, generic denials, and audit evidence. Sprint 2A intentionally does not add a tracking RPC or business API.

Until that server workflow exists, low-level guest inserts must request a minimal response. Returning the generated Lead reference belongs to the future intake orchestration layer; broadening anonymous table reads is prohibited.

## 5. Authenticated customers

Profiles remain optional and exist only for authenticated users. An active customer Profile may create and read its own Addresses and Leads. Customer ownership is recorded by `profile_id`; text equality on mobile or email never establishes ownership or links guest history.

An active customer Profile may read related attachment metadata, Quotations, and Orders through the owning Lead relationship. Customers cannot update Lead workflow, create commercial records, create Orders, or access staff-only records. Future guest-to-account linking requires verified proof and a separate audited workflow.

## 6. Staff authorization

Sprint 2A adds 15 stable business permissions to the existing fixed RBAC model.

| Capability        | Super Admin | Sales | Operations | Finance | Customer Service |
| ----------------- | :---------: | :---: | :--------: | :-----: | :--------------: |
| Catalog read      |      ✓      |   ✓   |     ✓      |    ✓    |        ✓         |
| Catalog manage    |      ✓      |   —   |     —      |    —    |        —         |
| Address read      |      ✓      |   ✓   |     ✓      |    ✓    |        ✓         |
| Address manage    |      ✓      |   —   |     —      |    —    |        —         |
| Lead read         |      ✓      |   ✓   |     ✓      |    ✓    |        ✓         |
| Lead manage       |      ✓      |   ✓   |     —      |    —    |        —         |
| Attachment read   |      ✓      |   ✓   |     ✓      |    ✓    |        ✓         |
| Attachment manage |      ✓      |   ✓   |     ✓      |    —    |        —         |
| Quotation read    |      ✓      |   ✓   |     ✓      |    ✓    |        ✓         |
| Quotation manage  |      ✓      |   ✓   |     —      |    ✓    |        —         |
| Quotation approve |      ✓      |   ✓   |     —      |    ✓    |        —         |
| Order read        |      ✓      |   ✓   |     ✓      |    ✓    |        ✓         |
| Order manage      |      ✓      |   —   |     ✓      |    —    |        —         |

`Super Admin` grants permit emergency administration but do not bypass lifecycle constraints or create a business approval by themselves. The application must still present only actions consistent with the Product Documentation Suite responsibility matrix.

The public `has_permission` and `current_profile_id` functions are security-invoker wrappers. Their authoritative security-definer evaluators live in the non-exposed `private` schema. Interactive identity mutation RPC execution was revoked from authenticated callers because no Admin workflow, recent-authentication control, or Audit Log exists yet. Service-role staff provisioning remains the approved bootstrap path.

## 7. RLS and grants

All eight tables have RLS enabled. Twenty-nine policies cover public catalog reads, guest intake inserts, Profile ownership, and fixed staff permissions.

| Actor            | Catalogs                         | Addresses and Leads                        | Attachments / Quotations / Orders              |
| ---------------- | -------------------------------- | ------------------------------------------ | ---------------------------------------------- |
| Anonymous        | Active rows only                 | Insert-only guest intake                   | No direct access                               |
| Customer Profile | Active rows                      | Own rows; referenced Address becomes fixed | Read own relationship graph only               |
| Staff Profile    | Permission-controlled full scope | Permission-controlled duty scope           | Permission-controlled duty scope and mutations |
| `service_role`   | Infrastructure access            | Infrastructure access                      | Infrastructure access                          |

There are no anonymous write policies for attachments, Quotations, or Orders. File upload authorization and business orchestration remain deferred.

## 8. Lifecycle and integrity guards

### 8.1 Lead

Allowed transitions are:

`new → qualified → quoted → converted`

`new|qualified|quoted → cancelled|closed`

The trigger generates the Lead reference for guests, validates service/option availability, snapshots bilingual catalog values, validates address ownership, and derives qualification/closure timestamps.

### 8.2 Quotation

Allowed transitions are:

`draft → sent → approved|rejected|expired|superseded`

`draft → cancelled`

Only staff with `quotation.record.approve` may approve. Expired Quotations cannot be approved. Commercial amounts must reconcile exactly, one approved Quotation per Lead is enforced, and issued commercial terms cannot be edited.

### 8.3 Order

Allowed transitions are:

`created → scheduled → in_progress → completed`

`created|scheduled|in_progress → cancelled`

An Order insert locks and reads its source Quotation. The insert fails unless the Quotation is approved and unexpired. Currency, subtotal, tax, total, and tracking mobile are copied from the approved commercial/request snapshots and become immutable. One Quotation can create one Order only.

## 9. Address and mapping strategy

Addresses support manual entry, Google Maps, and future geocoding through:

- `formatted_address`;
- `provider_place_id`;
- latitude and longitude stored together or both absent;
- exact, approximate, or city-center precision;
- Saudi postal code, district, street, building, unit, and landmark; and
- route-access notes for later dispatch/routing use.

Coordinates are validated but no PostGIS, routing extension, polygon coverage, distance calculation, or Google API call is introduced. A referenced Lead Address is immutable so later edits cannot rewrite request history.

## 10. Storage references

File bytes remain in Supabase Storage. `lead_attachments` stores only:

- owner type and Lead identifier;
- bucket and canonical object path;
- original filename and allowed MIME type;
- byte size and optional SHA-256 digest;
- upload time and inspection status; and
- actor and soft-removal provenance.

The bucket is constrained to `attachments`, matching the existing private 10 MiB bucket and its PDF/JPEG/PNG/WebP allowlist. No foreign key to `storage.objects` is created. The existing `public-assets` bucket is unchanged.

## 11. Reference seeds

The reference migration idempotently seeds:

- 22 major Saudi cities, including Riyadh, Jeddah, Makkah, Madinah, Dammam, Al Khobar, Dhahran, Al Ahsa, Jubail, Taif, Tabuk, Abha, Khamis Mushait, Buraidah, Hail, Yanbu, Jazan, Najran, Al Kharj, Arar, Sakaka, and Al Bahah;
- Furniture Moving;
- General Cargo Transport;
- Local Transport;
- Intercity Transport;
- Packing; and
- Loading & Unloading.

Arabic and English labels and descriptions are stored together. Seeds contain no customer or personal data.

## 12. Migrations and rollback

Apply in filename order:

1. `20260803153000_core_business_create_schema.sql`
2. `20260803154000_core_business_apply_security.sql`
3. `20260803154500_identity_harden_authorization_boundary.sql`
4. `20260803155000_core_business_seed_reference_data.sql`

All four files are transactional and are recorded in `supabase_migrations.schema_migrations` with their exact source in the `statements` array.

The explicit rollback is `supabase/rollbacks/20260803155000_core_business_database.rollback.sql`. It removes Sprint 2A role grants and permissions, drops the eight business tables in reverse dependency order, removes the private evaluators, and restores the preceding Sprint 1B authorization function behavior. The rollback was executed successfully in a transaction whose final action was `ROLLBACK`; production data and schema therefore remained intact.

Before an intentional rollback in a shared environment:

1. stop all writers;
2. create and verify a database backup;
3. confirm the exact target project and environment;
4. review whether transaction data must be exported or retained;
5. run the rollback through the approved change window; and
6. reconcile the migration ledger only through the approved Supabase migration workflow.

## 13. Verification evidence

The production project passed:

- schema, security, hardening, seed, and rollback-only transactional execution;
- eight expected business tables with RLS enabled;
- 70 indexes, including constraint-owned indexes;
- 32 foreign keys;
- 75 named check constraints;
- 29 RLS policies;
- exact reference counts of 22 Cities, four Services, and two Service Options;
- 15 business permissions with fixed-role grants;
- anonymous Address/Lead insert privileges and denied direct Lead/Quotation/Order reads;
- zero existing Lead, Quotation, and Order rows after foundation deployment;
- both required Storage buckets present; and
- Supabase Security Advisor: 0 errors, 0 warnings;
- Supabase Performance Advisor: 0 errors, 0 warnings.

Performance Advisor informational suggestions about currently unused indexes are expected for a new schema with no production traffic. They are not errors or warnings and must be evaluated from real query plans before any index is removed.

## 14. Deferred work

The following remain outside Sprint 2A:

- guest intake orchestration and idempotency API;
- customer-facing reference delivery;
- approved public tracking flow and abuse controls;
- upload URL issuance, object-path authorization, antivirus/content inspection, and orphan cleanup;
- Quotation itemization and pricing engine;
- notifications;
- Admin dashboard and staff workflows;
- Audit Log persistence;
- payments, invoices, and refunds;
- route eligibility and distance calculation; and
- database-generated API exposure beyond the RLS-controlled table surface.
