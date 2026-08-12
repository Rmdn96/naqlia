# Naqlk Database Naming Conventions

| Document field    | Value                                                                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status            | Architecture standard                                                                                                                                      |
| Version           | 1.0                                                                                                                                                        |
| Applies to        | All future PostgreSQL, Supabase Storage, migration, seed, generated-type, and database-test artifacts                                                      |
| Related documents | [Database Architecture](./01-Database-Architecture.md), [ERD](./02-ERD.md), [RLS Strategy](./04-RLS-Strategy.md), [Audit Strategy](./05-Audit-Strategy.md) |

## 1. Purpose

This document is the authoritative naming and lifecycle standard for Naqlk's future database implementation. It converts the conceptual model into deterministic physical naming rules without creating SQL, tables, migrations, policies, or other database objects.

The words **must**, **must not**, **should**, and **may** are normative. Any exception must be documented in the implementing change and approved during database review.

## 2. General Identifier Rules

All PostgreSQL identifiers must:

- use lowercase ASCII `snake_case`;
- be descriptive nouns or noun phrases;
- remain within PostgreSQL's 63-byte identifier limit;
- avoid quoted identifiers, reserved words, vendor names, and type prefixes;
- avoid unexplained abbreviations and acronyms;
- use one term consistently across every domain; and
- describe business meaning rather than the current user interface.

Canonical vocabulary includes `organization`, `business_unit`, `membership`, `shipment`, `trip`, `document`, `integration`, and `audit_event`. Do not introduce synonyms such as `tenant`, `company`, `client`, or `job` as physical entity names when a canonical term already exists.

Names must be understandable without reading application code. For example, use `shipment_status_events`, not `shipment_logs`, and `organization_memberships`, not `org_users`.

## 3. Schema Names

Logical schemas use singular domain nouns:

- `core`
- `identity`
- `network`
- `fleet`
- `transport`
- `dispatch`
- `tracking`
- `documents`
- `communications`
- `integrations`
- `billing`
- `audit`
- `reporting`
- `platform`
- `private`

Supabase-managed schemas retain their managed names. The `public` schema must not become a miscellaneous default namespace. New application objects belong to an approved domain schema.

The `private` schema is reserved for non-exposed authorization helpers and trusted internal functions. It is not a business-domain shortcut.

## 4. Entity and Relation Names

### 4.1 Persistent entities

Persistent entity names use plural nouns, such as:

- `organizations`
- `organization_memberships`
- `shipment_stops`
- `document_versions`
- `audit_events`

An association name must identify both sides or express the business relationship, such as `membership_roles`, `shipment_parties`, or `resource_assignments`.

Append-only history uses a meaningful suffix:

- `_events` for business or audit events;
- `_versions` for immutable revisions;
- `_attempts` for individual delivery or execution attempts;
- `_snapshots` only for intentional point-in-time copies; and
- `_history` only when no more precise event or version term applies.

### 4.2 Columns and attributes

Column names use singular nouns. Foreign-reference columns use the singular referenced entity followed by `_id`, for example `organization_id`, `shipment_id`, and `created_by_profile_id`.

Use these semantic patterns consistently:

- boolean: `is_active`, `has_temperature_control`, `can_subcontract`;
- status: `shipment_status`, `invoice_status`;
- enumerated type: a descriptive noun such as `actor_type` or `resource_type`;
- quantity: semantic name plus unit when the unit is fixed, such as `distance_meters`;
- money: semantic amount plus `currency_code`, such as `subtotal_amount` and `currency_code`;
- percentage: `_percentage` when represented as a human percentage, or `_ratio` when represented from zero to one;
- count: `_count`;
- duration: semantic name plus unit, such as `grace_period_seconds`;
- date: `_on` only for a civil calendar date; and
- instant: `_at` for a precise point in time.

Do not use ambiguous names such as `type`, `status`, `date`, `value`, `data`, `info`, `flag`, or `name` where the entity context does not make the meaning self-evident.

### 4.3 Machine and display values

Machine-readable keys and localized labels are separate concepts:

- machine keys use stable lowercase values and are never translated;
- Arabic and English display text is stored in explicitly localized attributes or translation entities;
- user-facing labels must not be used as foreign keys, permission keys, event names, or workflow identifiers.

## 5. Primary Key Standard

Every application-owned persistent entity must have a single primary key named `id`.

The primary key must:

- use UUIDv7 unless the entity is managed externally;
- be generated by one approved trusted mechanism;
- never encode organization, business-unit, or other business meaning;
- never be reused after deletion; and
- remain stable across archival and restoration.

Association entities that can carry lifecycle state, scope, provenance, audit meaning, or future attributes must also receive their own `id`. The relevant relationship must additionally be protected by a named unique constraint.

External identifiers must not replace Naqlk primary keys. For example, a profile retains its Naqlk `id` and references the Supabase Auth identifier through `auth_user_id`.

## 6. UUID Strategy

Naqlk uses UUIDv7 for newly created application-owned identifiers because it preserves global uniqueness while improving time locality. Supabase Auth and other external systems may supply UUIDv4 or another opaque identifier; those values remain external references.

Implementation rules:

1. Select exactly one trusted UUIDv7 generator after confirming the deployed PostgreSQL version and supported runtime.
2. Do not mix application-generated and database-generated strategies within one entity.
3. Validate that supplied identifiers are well-formed and use the expected version where Naqlk owns generation.
4. Treat every UUID as opaque in business logic and public interfaces.
5. Do not use UUID ordering as the authoritative creation time. `created_at` remains authoritative.
6. Never derive organization membership, authorization, or data classification from an identifier.

If the deployed platform cannot natively generate UUIDv7 at implementation time, the architecture review must approve a cryptographically sound application or extension-based generator before any migration is written.

## 7. Timestamp Strategy

All instants must be timezone-aware and normalized to UTC. Display conversion belongs at the application boundary using the user's or organization's IANA timezone.

### 7.1 Standard lifecycle attributes

Mutable application-owned entities use:

- `created_at`: immutable creation instant;
- `updated_at`: instant of the last persisted business change;
- `deleted_at`: nullable soft-deletion instant when soft deletion applies.

Actor attributes use explicit names such as `created_by_profile_id`, `updated_by_profile_id`, and `deleted_by_profile_id`. System-created records may instead reference an applicable service principal or retain an explicit actor type according to the audit model.

### 7.2 Event and validity time

- `occurred_at`: when an event happened in the business or source system;
- `recorded_at`: when Naqlk durably recorded it;
- `effective_at`: when a decision or state becomes effective;
- `valid_from` and `valid_until`: an explicit validity interval;
- `starts_at` and `ends_at`: a scheduled or actual interval;
- `expires_at`: expiry instant;
- `*_on`: date-only civil value, such as `license_expires_on`.

When source systems can report events late, both `occurred_at` and `recorded_at` are required. Ordering rules must define which instant is authoritative for each workflow.

Naive local timestamps are prohibited. Organization timezone is separate metadata and must never change persisted historical instants.

## 8. Soft-Delete Strategy

Soft deletion is an explicit lifecycle capability, not a universal default.

### 8.1 Eligible entities

Soft deletion should be used for mutable master or configuration entities when restoration or historical references are valid, including organizations, business units, locations, parties, contacts, fleet resources, templates, and integration configurations.

Eligible entities use:

- `deleted_at`;
- `deleted_by_profile_id` or the equivalent trusted actor reference; and
- `deletion_reason` when deletion is an accountable business action.

An active record is one where `deleted_at` is absent. Future uniqueness rules for reusable business identifiers must explicitly define whether uniqueness applies only to active records.

### 8.2 Ineligible entities

Soft deletion must not be used to simulate removal of immutable facts. The following are append-only, superseded, voided, or retained according to policy:

- audit events;
- status and domain events;
- document versions;
- notification and delivery attempts;
- tracking observations;
- financial postings and finalized billing records;
- integration messages and idempotency records;
- legal-hold records; and
- security activity.

### 8.3 Deletion rules

- A soft-deleted parent must not cascade-delete historical facts.
- Restoration must be an authorized workflow that revalidates uniqueness and dependencies.
- Hard deletion is restricted to approved retention, privacy-erasure, or test-data procedures.
- Privacy erasure may anonymize or cryptographically erase personal data while retaining legally required operational facts.
- RLS and default application queries must exclude soft-deleted entities unless a specific restore, audit, or compliance permission applies.

## 9. Database Object Naming

### 9.1 Constraints

Constraint names follow these patterns:

| Object      | Pattern                                      | Conceptual example                             |
| ----------- | -------------------------------------------- | ---------------------------------------------- |
| Primary key | `pk_<entity>`                                | `pk_shipments`                                 |
| Foreign key | `fk_<entity>__<column>__<referenced_entity>` | `fk_shipments__organization_id__organizations` |
| Unique      | `uq_<entity>__<columns_or_rule>`             | `uq_membership_roles__membership_id_role_id`   |
| Check       | `ck_<entity>__<business_rule>`               | `ck_shipment_stops__sequence_positive`         |
| Exclusion   | `ex_<entity>__<business_rule>`               | `ex_resource_assignments__no_time_overlap`     |

Use double underscores to separate the object, local columns, and referenced object or rule. For composite columns, list them in declaration order.

If a generated name would exceed 63 bytes, shorten words using the approved domain glossary, preserve the prefix and entity, and append a stable eight-character digest. Never rely on silent PostgreSQL truncation.

### 9.2 Indexes

Index names follow these patterns:

| Purpose | Pattern                               |
| ------- | ------------------------------------- |
| General | `idx_<entity>__<columns_or_purpose>`  |
| Unique  | `uidx_<entity>__<columns_or_purpose>` |
| Partial | `pidx_<entity>__<columns_or_purpose>` |
| GIN     | `gin_<entity>__<columns_or_purpose>`  |
| GiST    | `gist_<entity>__<columns_or_purpose>` |
| BRIN    | `brin_<entity>__<columns_or_purpose>` |

Tenant-scoped access paths should normally begin with `organization_id`, followed by the filter or ordering attributes used by the query. Every foreign key and every attribute used in an RLS membership or scope predicate must receive an explicit index review. Do not create both a constraint-owned index and a duplicate manually named index.

Sort direction is omitted from the name unless it materially distinguishes two required indexes. Predicate intent may appear as a concise suffix, such as `active` or `unprocessed`.

### 9.3 Views, functions, triggers, and policies

- read-model views: `v_<purpose>`;
- materialized read models: `mv_<purpose>`;
- functions: verb-first names such as `resolve_current_profile` or `can_access_shipment`;
- trigger functions: `handle_<event_or_purpose>`;
- triggers: `trg_<entity>__<timing>_<event>__<purpose>`;
- RLS policies: `rls_<entity>__<operation>__<actor_or_rule>`.

Function names must disclose side effects. A name beginning with `get`, `resolve`, `is`, `has`, or `can` must not mutate data.

Policy names are operationally specific, for example `rls_shipments__select__scoped_member`. Broad names such as `tenant_policy` are prohibited.

### 9.4 Domain types and enumerations

Domain types use a singular semantic noun. Enumerated values use lowercase `snake_case` machine keys. Values are append-compatible and must not be renamed casually because they may appear in events, integrations, and retained records.

Database-native enumerations should be used only for genuinely stable closed sets. Configurable business vocabulary belongs in reference entities or validated machine keys.

## 10. Authorization and Event Names

Permission keys use:

`<domain>.<resource>.<action>`

Examples include `transport.shipment.read`, `dispatch.trip.assign`, `documents.proof.approve`, and `identity.membership.manage`.

Audit and domain event names use:

`<domain>.<aggregate>.<past_tense_event>`

Examples include `transport.shipment.created`, `dispatch.trip.assigned`, `identity.membership.revoked`, and `documents.proof.rejected`.

Names must express completed facts, not commands. Event versions are carried in event metadata, not hidden in ad hoc name variations.

External source identifiers use `<provider>_external_id` only when provider-specific. Generic integration mappings use `external_identifier` together with a connection or namespace reference.

## 11. File Naming

No files described in this section are created by this architecture task. These rules govern future implementation.

### 11.1 Migrations

Migration files use:

`YYYYMMDDHHMMSS_<domain>_<imperative_description>.sql`

Examples:

- `20260802143000_core_create_organizations.sql`
- `20260802144500_identity_add_membership_rls.sql`

One migration should represent one reviewable, forward-only change. Generic names such as `update.sql`, `fix.sql`, or `migration_2.sql` are prohibited. A migration filename must not be renamed after it has reached a shared environment.

### 11.2 Seeds, tests, and generated artifacts

- reference seed: `<domain>_<reference_set>.seed.sql`;
- database test: `<domain>_<subject>_<behavior>.test.sql`;
- generated database types: `database.types.ts`;
- database documentation: numbered title case, such as `01-Database-Architecture.md`.

Production customer or personal data must never appear in seeds or fixtures.

## 12. Supabase Storage Naming

Bucket names use lowercase kebab-case and describe data classification or purpose, such as `shipment-documents` or `delivery-proofs`. Bucket names are stable infrastructure identifiers and are not localized.

Object paths use this logical pattern:

`<organization_uuid>/<domain>/<aggregate_uuid>/<document_uuid>/v<version>/<sanitized_filename>`

Rules:

- organization and aggregate identifiers are opaque UUIDs;
- filenames are sanitized and must not be trusted for authorization;
- document version is explicit and immutable;
- object metadata is linked to an authoritative document record;
- authorization derives from database relationships and Storage policies, never path parsing alone; and
- personal data, secrets, and user display names must not be embedded in paths.

## 13. API and Type Mapping

Although this document does not define APIs, database names must map predictably into application types:

- database identifiers remain `snake_case` at the persistence boundary;
- TypeScript domain models may use `camelCase` through an explicit mapper;
- generated database types remain generated and must not be hand-edited;
- translation between database values and application types occurs in repositories or services, not UI components; and
- application aliases must never obscure the canonical database term in logs or audit events.

## 14. Prohibited Patterns

The following are prohibited:

- integer sequences as public or cross-system identifiers;
- composite primary keys;
- an unqualified `tenant_id` when the canonical entity is `organization`;
- polymorphic foreign keys that rely only on `entity_type` plus `entity_id` for integrity-critical relationships;
- storing multiple identifiers in delimited text or unvalidated arrays;
- localized physical identifiers;
- case-sensitive or quoted identifiers;
- silent timestamp timezone assumptions;
- ambiguous suffixes such as `_data`, `_info`, `_obj`, `_tmp`, or `_new`;
- version suffixes on canonical entities such as `shipments_v2`; and
- names tied to a temporary vendor or interface implementation.

## 15. Review Checklist

Before approving any future database change, reviewers must confirm:

- the object belongs to a documented domain schema;
- the canonical glossary term is used;
- the entity, key, timestamp, and lifecycle rules are followed;
- every organization-owned relationship preserves tenant integrity;
- constraints and indexes have deterministic names below 63 bytes;
- permission and event keys follow their taxonomies;
- soft deletion is justified and does not replace immutable history;
- external identifiers remain alternate identifiers;
- generated files and migrations follow file naming rules; and
- any exception is recorded as an architecture decision.

## 16. References

- [PostgreSQL: Lexical Structure](https://www.postgresql.org/docs/current/sql-syntax-lexical.html)
- [PostgreSQL: UUID Functions](https://www.postgresql.org/docs/current/functions-uuid.html)
- [Supabase: Managing User Data](https://supabase.com/docs/guides/auth/managing-user-data)
