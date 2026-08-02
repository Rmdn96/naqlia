# Naqlia Audit Strategy

| Document field    | Value                                                                                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status            | Audit architecture standard                                                                                                                                          |
| Version           | 1.0                                                                                                                                                                  |
| Applies to        | Application activity, authorization changes, operational workflows, privileged access, integrations, database administration, authentication, and evidence retention |
| Related documents | [Database Architecture](./01-Database-Architecture.md), [ERD](./02-ERD.md), [Naming Conventions](./03-Naming-Conventions.md), [RLS Strategy](./04-RLS-Strategy.md)   |

## 1. Purpose

This document defines the audit evidence Naqlia must produce, protect, retain, and review. It is an architecture specification only. It creates no database objects, SQL, triggers, logging configuration, storage resources, or compliance certification.

The strategy is designed to answer five questions reliably:

1. Who or what acted?
2. What was attempted and what changed?
3. Which organization and resource were affected?
4. When, where, and through which request did it occur?
5. Was the action authorized, successful, and preserved without tampering?

## 2. Objectives and Non-Objectives

### 2.1 Objectives

The audit system must provide:

- attributable security and business-change evidence;
- organization isolation and purpose-limited visibility;
- append-only, tamper-evident records;
- correlation across application, authentication, integration, and infrastructure activity;
- deterministic retention and legal-hold handling;
- useful evidence for incident response, disputes, internal control, and future compliance; and
- sufficient context without copying unnecessary sensitive payloads.

### 2.2 Non-objectives

Audit events are not:

- a replacement for domain event history;
- a general application debug log;
- an analytics warehouse;
- a full snapshot of every record after every change;
- a place to store secrets, access tokens, or raw request bodies; or
- proof of compliance by themselves.

## 3. Audit Planes

Naqlia preserves separate evidence planes because no single log source can establish every fact.

| Plane                        | Purpose                                                    | Examples                                                         | Authority                                                  |
| ---------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| Domain history               | Explain business lifecycle and reconstruct aggregate state | Shipment status, assignment, tracking milestone, invoice posting | Domain-owned event records                                 |
| Application audit            | Record accountable access and change actions               | Membership grant, export, document approval, soft deletion       | Naqlia `audit_events`                                      |
| Authentication audit         | Record identity and session activity                       | Sign-in, password reset, token refresh, logout                   | Supabase Auth audit logs                                   |
| Database activity audit      | Observe database-level access and privileged statements    | DDL, role changes, direct administrative activity                | PostgreSQL audit facilities such as pgAudit                |
| Platform control-plane audit | Record project and infrastructure administration           | Project settings, secrets, team actions                          | Supabase, Vercel, GitHub, and cloud provider audit sources |
| Operational telemetry        | Diagnose availability and performance                      | Traces, errors, job duration, resource metrics                   | Observability systems                                      |

Telemetry may be sampled and mutable under its own retention policy. It must not be treated as the authoritative audit ledger.

## 4. Audit Scope

### 4.1 Always audited

The following actions always create an application audit event or an authoritative equivalent:

- membership invitation, acceptance, suspension, revocation, and deletion;
- role, permission, business-unit scope, and organization-owner changes;
- platform access grant, approval, use, expiry, and revocation;
- support impersonation and break-glass activity;
- credential, integration connection, webhook, and service-principal lifecycle actions;
- sensitive document upload, versioning, approval, rejection, download, share, and deletion request;
- bulk view, search, export, print, or download of customer or personal data;
- create, material update, soft deletion, restoration, anonymization, and hard deletion of protected master data;
- security policy, retention, legal hold, and organization-status changes;
- financial rate, charge, invoice, credit, adjustment, subscription, and posting actions;
- integration replays, overrides, dead-letter resolution, and idempotency conflicts;
- failed privileged or high-risk authorization attempts; and
- audit configuration or pipeline health changes.

### 4.2 Domain history instead of duplicate snapshots

Operational transitions are recorded in their domain event stream, including shipment status, dispatch assignment, trip progress, tracking milestones, exceptions, and notification attempts. A separate application audit event is additionally required when the transition is privileged, manual, disputed, security-sensitive, or changes access.

The audit record may reference the domain event rather than copy its full payload.

### 4.3 Read access

Routine low-risk reads are not individually copied into the application audit ledger. Read audit is required for:

- security and access-control data;
- personal or sensitive driver/customer information;
- precise historical location data;
- billing exports and financial evidence;
- document download or signed-URL issuance;
- bulk listing, search, report, or export;
- privileged cross-organization support access; and
- any data class later designated by law, contract, or risk assessment.

Database activity logs may provide broader read visibility for privileged database access without making the application ledger excessively noisy.

## 5. Canonical Audit Event

Every application audit event must carry the following conceptual fields. The future physical design may separate sensitive details from the searchable event envelope, but it must preserve these semantics.

### 5.1 Identity and tenancy

- globally unique UUIDv7 event identifier;
- owning or affected `organization_id`, nullable only for genuine platform-wide activity;
- affected business unit when relevant;
- actor type: user, service principal, platform administrator, system process, or external party;
- application profile, service principal, or platform grant reference;
- impersonated subject and original platform actor when applicable; and
- authentication assurance or session reference appropriate to the risk.

### 5.2 Time and correlation

- `occurred_at`, representing when the action occurred;
- `recorded_at`, representing durable ledger ingestion;
- request identifier;
- correlation identifier spanning services;
- causation identifier referencing the command or preceding event; and
- source channel such as web, mobile, scheduled job, webhook, support tooling, or database administration.

### 5.3 Action and target

- stable event name following `<domain>.<aggregate>.<past_tense_event>`;
- normalized action and outcome;
- target domain, entity type, and entity identifier;
- parent aggregate reference when the target is a child;
- reason code and human-entered justification for privileged actions;
- failure category without leaking secret data; and
- event schema version.

### 5.4 Change evidence

- sorted list of changed field names;
- approved redacted before and after values for low-sensitivity attributes when necessary;
- cryptographic digests of larger or sensitive evidence;
- reference to an encrypted detail object when additional evidence is justified;
- policy or permission decision identifier when relevant; and
- non-sensitive metadata governed by an event-specific contract.

### 5.5 Governance

- data classification;
- retention class;
- legal-hold reference when applicable;
- ingestion source;
- hash-chain predecessor or signed-batch reference; and
- archive state and verification status.

`created_at`, `updated_at`, or mutable audit timestamps do not replace `occurred_at` and `recorded_at`. An audit event is never updated to rewrite history.

## 6. Event Taxonomy

The initial event families are:

| Family                      | Required examples                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------ |
| Authentication and security | Sign-in risk, MFA change, credential rotation, session revocation, repeated authorization denial       |
| Identity and access         | Membership, role, permission, scope, owner, service-principal, and invite changes                      |
| Platform privilege          | Support grant, impersonation, cross-tenant query, break-glass use, export, emergency change            |
| Organization lifecycle      | Activation, suspension, configuration change, retention choice, closure request                        |
| Master data                 | Create, material change, merge, soft delete, restore, anonymize                                        |
| Transport operations        | Manual override, cancellation, exception resolution, proof acceptance, disputed transition             |
| Documents                   | Upload, version, scan result, classification, share, signed URL, download, approval, rejection         |
| Integrations                | Connection change, secret rotation, mapping change, replay, override, webhook failure resolution       |
| Billing                     | Rate change, charge creation, adjustment, invoice finalization, credit, write-off, subscription change |
| Data governance             | Bulk access, export, retention execution, legal hold, privacy request, hard deletion evidence          |
| Audit system                | Writer failure, sequence gap, hash mismatch, export, archival, retention action, configuration change  |

Each event has a versioned contract defining required actors, targets, reason codes, metadata, classification, and retention class.

## 7. Capture Model

### 7.1 Atomic capture

For accountable in-database mutations, the business change and its required audit event must commit or fail together. A critical mutation must not succeed if its audit evidence cannot be written.

For external or asynchronous effects, the originating transaction records an outbox or intent event. Completion, failure, retry, and final disposition are correlated later without rewriting the original evidence.

### 7.2 Trusted attribution

Audit actor, organization, request, and privilege context are populated by trusted server or database context. The client may supply a business reason, but cannot assert its own actor identity, organization, success outcome, timestamp, or platform privilege.

System-generated activity must identify the initiating actor when one exists and the executing service separately.

### 7.3 Failure capture

Database transaction rollback can remove in-transaction failure evidence. High-risk authorization denials and failed commands therefore require a trusted out-of-transaction security channel with request correlation and careful data minimization.

## 8. Sensitive Data and Data Minimization

Audit records must never contain:

- passwords or password hashes;
- access, refresh, session, or API tokens;
- private keys, signing keys, secrets, or complete credentials;
- raw payment credentials;
- full inbound or outbound integration payloads by default;
- full document contents;
- unnecessary free-form personal information; or
- precise location trails when an event identifier and governed evidence reference are sufficient.

Prefer changed-field names, reason codes, stable identifiers, classification-safe values, digests, and references to separately encrypted evidence. Metadata contracts use an allowlist; arbitrary object dumps are prohibited.

Redaction happens before durable write. Removing a secret after it reaches an immutable ledger is not an acceptable control.

## 9. Immutability and Tamper Evidence

The application audit ledger is append-only.

Implementation controls must ensure:

- end users and organization administrators cannot insert, update, or delete audit events directly;
- only narrowly trusted writers can append events;
- corrections are new events that reference and supersede prior interpretations;
- sequence gaps, ingestion lag, and writer failures are monitored;
- events are hash-chained per stable partition or included in signed batches;
- verification results are retained independently;
- finalized batches are exported to encrypted, access-controlled immutable or write-once storage;
- database backups and off-platform evidence exports are both tested; and
- retention destruction produces a separate destruction certificate or audit event.

A database owner can technically alter database state; tamper evidence therefore requires independently controlled off-platform copies or signed manifests, not database permissions alone.

## 10. Retention Model

Retention begins at `recorded_at` unless legal or contractual policy requires a different trigger. The following values are initial architecture defaults and must receive Saudi legal, privacy, tax, employment, insurance, and customer-contract review before production.

| Class                       | Default | Typical evidence                                                                                                 |
| --------------------------- | ------: | ---------------------------------------------------------------------------------------------------------------- |
| Critical governance         | 7 years | Privilege grants, break-glass, owner and access changes, legal holds, hard deletion, finalized financial actions |
| Standard accountable change | 3 years | Master-data changes, workflow overrides, document approvals, integration configuration, exports                  |
| Security activity           | 2 years | Authentication and authorization activity, session and credential lifecycle, support sessions                    |
| Sensitive access            |  1 year | Document download, precise-location access, sensitive searches, bulk views                                       |
| Diagnostic telemetry        | 90 days | Debug logs, traces, performance data; not authoritative audit evidence                                           |

Domain business records have their own retention schedules. For example, transport, delivery proof, and financial evidence may require seven years or longer even when a related application audit event has a shorter class.

Retention must be configuration-driven by evidence class and jurisdiction, not scattered through application code. A legal hold suspends archival destruction for all linked evidence and produces its own immutable audit trail.

## 11. Archive and Destruction

The audit lifecycle is:

1. active searchable storage;
2. verified immutable archive;
3. restricted legal-hold preservation when applicable;
4. approved retention expiry;
5. cryptographically and operationally verified destruction; and
6. retained destruction evidence containing counts, ranges, policy, approver, and verification result without preserving deleted content.

Archive retrieval must preserve organization isolation, event ordering, integrity verification, classification, and audit-of-audit access. Restore exercises must validate both searchable records and immutable exports.

Supabase database backups do not by themselves preserve the bytes of Storage objects. Document evidence and off-platform audit archives require an explicit object-backup and restoration design.

## 12. Access to Audit Evidence

Access follows least privilege:

- organization auditors may read approved events for their organization;
- organization administrators see operational access changes but not platform security internals or secrets;
- security and compliance roles receive purpose-bound cross-organization access;
- support personnel see only evidence needed for an active approved case;
- service principals append or process only the event classes assigned to them; and
- no customer role can mutate audit evidence.

Sensitive detail is separated from the searchable envelope and requires a stronger permission. Audit searches and exports are themselves audited. Exports are minimized, encrypted, watermarked when appropriate, time-limited, and bound to a case or purpose.

## 13. Source-Specific Strategy

### 13.1 Supabase Auth audit logs

Supabase Auth audit logs provide authentication activity such as sign-ins, sign-outs, account and token events. They complement but do not replace Naqlia's membership, authorization, impersonation, and business audit events.

Auth audit identifiers and timestamps should be correlated to Naqlia requests where supported. Export and retention must be designed before relying on the managed retention window.

### 13.2 PostgreSQL activity audit

Database activity auditing, such as pgAudit, is used for privileged database access, DDL, role and grant changes, and direct operational statements. It is selectively configured to avoid secret or high-volume payload leakage and uncontrolled cost.

Database activity audit is not a substitute for semantic application events because a statement alone may not explain the business purpose or initiating user.

### 13.3 Platform providers

Supabase, Vercel, GitHub, and other infrastructure audit sources must be retained according to privileged-access policy and correlated through incident, deployment, actor, and change identifiers where possible.

### 13.4 Integrations

Inbound and outbound messages retain message identifiers, organization, connection, direction, event type, digest, attempts, result, and correlation. Payload bodies follow domain retention and encryption rules and are not duplicated into the audit ledger.

## 14. Reconciliation and Monitoring

The audit service must monitor:

- required-event write failures;
- event sequence gaps;
- unexpected clock skew between `occurred_at` and `recorded_at`;
- missing organization or actor attribution;
- invalid event schema versions;
- hash-chain or signed-batch verification failure;
- immutable archive export lag;
- retention jobs that fail, over-delete, or under-delete;
- legal-hold conflicts;
- anomalous platform access, bulk export, or repeated denial; and
- audit query or export activity outside an approved purpose.

Critical integrity alarms go to an independently controlled security channel. Monitoring configuration changes are themselves audited.

Periodic reconciliation compares accountable business operations with expected audit events. Counts alone are insufficient; reconciliation must sample identifiers, organization ownership, chronology, and integrity proofs.

## 15. Availability and Failure Semantics

- Critical access, financial, deletion, privilege, and legal actions fail closed if required audit capture is unavailable.
- Low-risk telemetry may buffer with a bounded retry window, but must never be mislabeled as committed audit evidence before durable ingestion.
- Offline mobile actions carry original occurrence time and device/request correlation, then receive authoritative recorded time on ingestion.
- Duplicate delivery is handled with idempotent event identifiers; deduplication never silently discards conflicting payloads.
- Disaster recovery must restore event data, integrity metadata, legal holds, and archive pointers to a consistent recovery point.

## 16. Future Compliance Readiness

This architecture prepares for, but does not claim, compliance with future obligations such as Saudi privacy and cybersecurity requirements, customer security controls, ISO 27001, SOC 2, or sector-specific rules.

Before a compliance commitment, Naqlia must establish:

- an approved data-classification and retention schedule;
- control owners and segregation of duties;
- evidence mapping from requirements to event sources;
- periodic access and privileged-grant review;
- documented incident, legal hold, privacy request, and destruction procedures;
- regional storage and cross-border data-transfer decisions;
- time synchronization and evidence integrity monitoring;
- SIEM export and detection ownership;
- recovery and archive-restore exercises; and
- independent control testing.

## 17. Implementation Acceptance Criteria

The future audit implementation is not production-ready until:

- every high-risk command maps to an approved event contract;
- event capture is atomic where required;
- clients cannot forge actor, organization, outcome, or time;
- end users cannot mutate ledger records;
- sensitive metadata allowlists and redaction tests pass;
- cross-organization audit access tests pass;
- hash or signed-batch verification is automated;
- immutable export and restore are exercised;
- retention and legal-hold conflict tests pass;
- Auth, database, application, and platform evidence can be correlated;
- audit pipeline failures page an accountable owner; and
- legal and security owners approve the production retention schedule.

## 18. Open Governance Decisions

The following must be resolved before production:

1. Final statutory and contractual retention periods by evidence class.
2. Approved immutable archive provider, region, encryption owner, and key lifecycle.
3. Events requiring two-person approval or recent MFA.
4. Exact sensitive-read audit scope for driver location and customer data.
5. Customer access to audit evidence and export formats.
6. SIEM provider, alert ownership, and response service levels.
7. Privacy-erasure treatment for actor identifiers in retained legal evidence.
8. Permitted support impersonation use cases and customer notification policy.

## 19. References

- [Supabase: Auth Audit Logs](https://supabase.com/docs/guides/auth/audit-logs)
- [Supabase: pgAudit](https://supabase.com/docs/guides/database/extensions/pgaudit)
- [Supabase: Database Backups](https://supabase.com/docs/guides/platform/backups)
- [PostgreSQL: Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
