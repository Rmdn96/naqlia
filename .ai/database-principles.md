# Naqlia Database Principles

| Document field   | Value                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| Status           | Mandatory database policy                                                                                    |
| Version          | 1.0.0                                                                                                        |
| Parent authority | [Naqlia Constitution](./constitution.md)                                                                     |
| Owner            | Database and Engineering leadership                                                                          |
| Applies to       | Data modeling, PostgreSQL, Supabase access, migrations, RLS, audit, retention, recovery, and data operations |

## 1. Authority and Scope

This document governs all future data work. It adds principles to the approved conceptual design:

- [Database Architecture](../docs/01-Database-Architecture.md)
- [Conceptual ERD](../docs/02-ERD.md)
- [Database Naming Conventions](../docs/03-Naming-Conventions.md)
- [RLS Strategy](../docs/04-RLS-Strategy.md)
- [Audit Strategy](../docs/05-Audit-Strategy.md)

These documents describe architecture only. They do not authorize schema creation. A database implementation requires an approved feature or platform requirement and a reviewed physical design.

## 2. Database Philosophy

The database protects durable business truth, tenant boundaries, relational integrity, accountable history, and recoverability.

Principles:

1. **Ownership before structure.** Every entity and mutation belongs to one domain.
2. **Integrity in the database.** Rules that can protect durable relational truth SHOULD be enforced at the final data boundary.
3. **Tenant isolation by construction.** Organization ownership is explicit, immutable, and enforced in relationships and policies.
4. **History is evidence.** Immutable facts are corrected with new facts, not rewritten.
5. **Lifecycle before collection.** Purpose, classification, retention, deletion, archive, and legal hold are known before data is stored.
6. **Safe evolution.** Migrations preserve compatibility, data, and recovery.
7. **Measured scale.** Indexing, partitioning, replicas, and extraction follow workload evidence.

## 3. Source of Truth

- PostgreSQL is the authoritative transactional store for approved operational entities.
- Supabase Auth owns managed authentication records; Naqlia owns application profiles and authorization state.
- Object storage owns file bytes; PostgreSQL owns governed document metadata, integrity identifiers, versions, ownership, and access relationships.
- External provider state is not trusted as Naqlia state until validated and accepted by the owning domain.
- Analytics and reporting are projections and MUST NOT become the mutation source for operational facts.
- Caches are disposable derived state and MUST define authoritative fallback and invalidation.

## 4. Domain and Schema Ownership

- Every relation belongs to one logical domain schema.
- Only the owning domain writes an entity's internal state.
- Cross-domain consumers use approved queries, commands, events, or read models.
- Direct cross-domain writes and undocumented joins are prohibited.
- Shared entities are minimal and governed by the architecture's reuse rules.
- The `public` schema MUST NOT become a default namespace for application entities.
- Private helpers and elevated functions remain in non-exposed schemas with narrow grants.

Domain extraction is allowed only after ownership, contracts, data, events, and operational responsibility are already stable.

## 5. Tenant Model

An organization is the hard tenant and ownership boundary.

- Every organization-owned root has non-null immutable `organization_id`.
- Descendants carry organization ownership when needed for direct authorization, integrity, indexing, partitioning, and operations.
- Tenant-safe relationships MUST prove that parent and child belong to the same organization.
- Tenant-sensitive unique rules and indexes include organization scope.
- Business units are internal authorization scopes, not separate tenants.
- A user with several memberships authorizes each organization context independently.
- Cross-organization visibility requires a governed connection and resource-specific share; matching business identity never grants access.
- Transfer between organizations is a domain workflow, not an ownership-column update.

## 6. Identity and Keys

- Application-owned persistent entities use a single `id` primary key with the approved UUIDv7 strategy.
- Externally managed identifiers remain alternate references and MUST NOT replace Naqlia identity.
- Identifiers are opaque and contain no authorization or business meaning.
- Primary keys are never reused.
- Natural identifiers receive explicit normalization, provenance, and scoped uniqueness.
- Associations with lifecycle, audit, scope, or future attributes receive their own identity plus a relationship uniqueness rule.
- Polymorphic identifiers are prohibited for integrity-critical relationships except approved closed registries documented in the architecture.

## 7. Data Modeling

### 7.1 Entity design

Before physical implementation, every entity requires:

- definition and owner;
- organization path;
- attributes, types, units, nullability, defaults, and classification;
- primary, natural, and external identity;
- relationships and cardinality;
- unique, check, exclusion, and foreign-key invariants;
- lifecycle and state-transition model;
- mutable versus immutable behavior;
- authorization and audit matrix;
- retention, deletion, archive, and legal-hold disposition;
- access patterns and expected volume; and
- migration, backfill, verification, and recovery plan.

### 7.2 Data types

- Use the narrowest type that preserves the business meaning and range.
- Monetary values use fixed precision and explicit ISO currency.
- Quantities require unit semantics; floating point MUST NOT represent money.
- Instants are timezone-aware and stored in UTC; civil dates remain date values.
- Organization and user timezones use approved IANA identifiers.
- Enumerations are used only for stable closed sets; configurable vocabulary uses governed references.
- Free-form JSON is not a substitute for relational modeling, constraints, versioning, or data ownership.
- Arrays and delimited text MUST NOT hide relationships that require integrity or queries.
- Localized display text is separate from stable machine keys.

### 7.3 Nullability and defaults

- Null means one documented business condition, not empty, unknown, not loaded, hidden, and not applicable simultaneously.
- Required business values are non-null once their lifecycle state requires them.
- Database defaults are used only when the database can assign the correct meaning independent of caller context.
- Actor, organization, privilege, audit, and security-sensitive values MUST be derived from trusted context, not accepted from clients.

## 8. Time, Version, and History

- `created_at` is immutable; `updated_at` reflects durable business change.
- Events preserve `occurred_at` and `recorded_at` when late arrival is possible.
- Effective intervals use explicit start and end semantics.
- Mutable aggregate roots use an approved concurrency version.
- Current status is a controlled projection of accepted transitions.
- Status, audit, tracking, document version, notification attempt, integration message, and finalized financial history is append-only.
- Correction creates a compensating, superseding, or reversal fact with provenance.
- UUID order MUST NOT replace authoritative time.

## 9. Integrity and Transactions

- Referential, uniqueness, range, exclusivity, sequence, and tenant invariants MUST be enforced through named constraints where possible.
- Application validation improves errors but does not replace durable constraints.
- One business command and its required audit/outbox evidence commit atomically within one ownership boundary.
- External effects occur after durable intent and use idempotent processing.
- Transactions MUST be as short as correctness permits and MUST NOT include uncontrolled network calls.
- Concurrent updates require explicit locking, optimistic version, exclusion, or conflict behavior.
- Deadlock and serialization failures are treated as bounded retryable outcomes only when the complete command is idempotent.
- Cascades MUST be reviewed for tenant, history, retention, and operational effect; cascade deletion of completed facts is prohibited.

## 10. Row-Level Security and Authorization

- RLS is mandatory on every client-reachable protected relation.
- Policies default deny and evaluate authoritative active membership, permission, organization, scope, assignment, share, and privileged grant.
- Both existing and proposed rows are authorized for update.
- Client inserts MUST NOT choose trusted ownership, actor, time, audit, or privileged state.
- Direct client hard delete is denied.
- Organization administrators remain tenant actors and cannot grant platform privilege.
- Platform support access is named, approved, purpose-bound, time-bound, and audited.
- Service-role credentials remain server-only, exceptional, and paired with explicit application authorization and audit.
- JWT claims MUST NOT carry user-editable authorization data or large stale permission sets.
- Views, functions, Storage, Realtime, and reporting projections receive their own security review.

The complete operation and test matrix is defined in [RLS Strategy](../docs/04-RLS-Strategy.md).

## 11. Audit and Provenance

- Accountable actions record who or what acted, organization, resource, action, outcome, occurrence, recording, request, correlation, reason, and approved change evidence.
- Required audit evidence commits atomically with critical mutation.
- Audit writers are trusted and narrow; customers cannot mutate ledger evidence.
- Application audit, domain history, Auth audit, database activity audit, control-plane audit, and telemetry remain distinct evidence planes.
- Secrets and unrestricted payloads are prohibited in audit records.
- Audit correction is a new event.
- Tamper evidence requires independently controlled signed or immutable exports in addition to database permissions.

Detailed events, retention, immutability, and access rules are in [Audit Strategy](../docs/05-Audit-Strategy.md).

## 12. Data Classification and Privacy

Every attribute is classified as public, internal, confidential, or restricted before production use.

Classification determines:

- collection purpose and minimization;
- authorization and masking;
- encryption and key ownership;
- log and audit representation;
- provider and regional transfer eligibility;
- test and support access;
- retention, deletion, archive, and legal hold; and
- export and incident handling.

Restricted data MUST NOT appear in identifiers, paths, logs, metrics labels, analytics, ordinary audit snapshots, fixtures, screenshots, or prompts. Production data MUST NOT be copied to lower environments.

## 13. Soft Delete, Retention, and Erasure

- Soft delete applies only to approved mutable master or configuration entities.
- Eligible entities use the documented deletion timestamp, actor, and reason.
- Active uniqueness and default visibility MUST account for soft deletion.
- Restoration is authorized, audited, and revalidates invariants.
- Immutable facts are expired, voided, reversed, anonymized, archived, or retained—not soft-deleted to imply they never occurred.
- Hard deletion is restricted to approved retention, privacy, or test-data processes.
- Privacy erasure MUST preserve legally required evidence through approved minimization or anonymization.
- Legal hold overrides scheduled destruction and is itself auditable.
- Destruction produces verifiable evidence without retaining the destroyed content.

## 14. Naming

The [Database Naming Conventions](../docs/03-Naming-Conventions.md) are mandatory.

In summary:

- identifiers use lowercase ASCII `snake_case` without quoting;
- domain schemas use approved singular names;
- persistent entities use plural nouns and attributes use singular terms;
- primary keys are `id`; foreign references are `<entity>_id`;
- instants use `_at`, civil dates use `_on`, fixed-unit values include units;
- constraints, indexes, policies, triggers, views, functions, and migrations use deterministic patterns;
- permission and event keys use approved stable taxonomies; and
- identifiers MUST remain below PostgreSQL's limit without relying on silent truncation.

Naming exceptions require architecture review because names become retained contracts.

## 15. Query and Index Policy

- Every query has an owner, expected cardinality, tenant scope, ordering, and maximum work.
- Result sets that can grow require pagination with deterministic ordering.
- Avoid unrestricted selection and select only required fields.
- Foreign keys, RLS predicates, uniqueness, frequent filters, and joins require index review.
- Tenant access paths normally begin with `organization_id`.
- Duplicate, unused, low-selectivity, and write-expensive indexes require evidence.
- Query plans MUST be tested with representative organization sizes and distributions.
- Application filters improve performance but never replace RLS.
- Search, reporting, and analytics workloads MUST NOT degrade critical transactions without isolation.

## 16. Performance and Scale

- Establish data-volume and growth assumptions per high-volume entity.
- Partition only for measured size, maintenance, retention, or query needs.
- Partition design MUST preserve organization pruning, uniqueness semantics, policy behavior, and recovery.
- Connection pooling mode and transaction behavior MUST be compatible.
- Read replicas and reporting stores define consistency and freshness explicitly.
- Archive retains schema version, organization ownership, classification, encryption, integrity, and restoration path.
- Separate-database tenancy requires explicit routing and no hidden cross-tenant transaction dependency.

## 17. Migration Policy

Every migration is forward-only, immutable after shared use, reviewable, and associated with an approved design.

A migration plan MUST define:

- purpose, owner, affected domains, and compatibility window;
- exact object and data changes;
- lock, duration, volume, and resource risk;
- expand, backfill, verify, switch, and contract sequence;
- old/new application compatibility;
- RLS, grants, audit, generated types, and documentation changes;
- backup or recovery checkpoint;
- failure detection, containment, forward-fix, and rollback limits; and
- production verification queries or metrics, documented without leaking data.

Rules:

- Destructive change MUST NOT be combined with the first release that stops using the old contract.
- Backfills are bounded, restartable, idempotent, observable, and fair across organizations.
- New required attributes use staged population and validation rather than unsafe immediate assumptions.
- Migration files MUST NOT be edited after reaching a shared environment.
- Manual production changes are prohibited except controlled emergency procedures followed by a reconciliatory migration.

## 18. Seeds, Fixtures, and Test Data

- Seeds contain stable approved reference data only.
- Fixtures are synthetic and organization-explicit.
- Production identifiers, payloads, documents, secrets, and personal data are prohibited.
- Tests create and clean up only their owned scope.
- Security tests use at least two organizations and multiple permission states.
- Migration tests cover empty, representative populated, invalid legacy, retry, and compatibility conditions as applicable.

## 19. Backup and Recovery

- Backup scope covers PostgreSQL, object storage, configuration/secret dependencies, audit archive, and required provider state.
- RPO, RTO, retention, encryption, region, access, and deletion are approved before production reliance.
- Backup success is monitored independently from the primary database.
- Restore exercises verify relational integrity, tenant isolation, RLS, object links, audit chain, and application compatibility.
- Supabase database backup MUST NOT be assumed to include Storage object bytes.
- Recovery credentials and runbooks are protected, tested, and accessible during provider outage.
- Restoration to production requires named approval and post-restore reconciliation.

## 20. Production Data Operations

- Routine support uses product and audited administrative capabilities, not direct data editing.
- Direct production access is least-privilege, time-bound, purpose-bound, and audited.
- High-risk reads, exports, changes, and repairs require peer approval and a verified target scope.
- Every repair preserves prior evidence and provides reconciliation.
- Ad hoc destructive statements, unrestricted exports, and local copies are prohibited.
- Incident containment MAY use emergency access under the Constitution's exception and break-glass rules.

## 21. Database Definition of Ready

Data work is ready only when:

- conceptual and physical designs agree;
- entity ownership, organization path, lifecycle, classification, and volume are explicit;
- constraints, indexes, RLS operation matrix, audit events, and retention are reviewed;
- compatibility, migration, backfill, generated types, and application rollout are planned;
- test data and multi-actor security tests are defined;
- backup, failure, recovery, and monitoring are understood; and
- database, domain, security, and operations owners approve material risk.

## 22. Database Definition of Done

Data work is done only when:

- migrations and application changes are compatible and immutable;
- constraints, tenant-safe references, RLS, grants, and audit behavior are verified;
- generated types and documentation match production;
- query plans and indexes meet representative workloads;
- backfill and reconciliation are complete;
- backup/recovery and rollback or forward-fix remain viable;
- monitoring shows expected migration and query behavior; and
- no manual drift, orphaned data, policy gap, or unowned cleanup remains.

## 23. Database Review Questions

1. Who owns this data and every allowed mutation?
2. How is organization integrity enforced in relationships and RLS?
3. Which facts are mutable, versioned, append-only, soft-deleted, or retained?
4. What purpose, classification, retention, erasure, and legal hold apply?
5. Which constraints make invalid durable state impossible?
6. What are the real access patterns, volumes, plans, and indexes?
7. How does the migration preserve old/new compatibility and recover from failure?
8. Can audit, backup, restore, and reconciliation prove the intended result?
