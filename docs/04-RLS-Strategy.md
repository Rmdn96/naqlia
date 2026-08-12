# Naqlk Row-Level Security Strategy

| Document field    | Value                                                                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status            | Security architecture standard                                                                                                                                         |
| Version           | 1.0                                                                                                                                                                    |
| Applies to        | All future database access through Supabase Data APIs, authenticated server operations, Storage metadata, database views, and privileged operational tooling           |
| Related documents | [Database Architecture](./01-Database-Architecture.md), [ERD](./02-ERD.md), [Naming Conventions](./03-Naming-Conventions.md), [Audit Strategy](./05-Audit-Strategy.md) |

## 1. Purpose

This document defines how Naqlk will isolate organizations and authorize database access. It is a design specification only. It creates no RLS policies, SQL functions, roles, grants, schemas, or Supabase configuration.

RLS is one layer of defense, not the sole authorization system. Every request must pass application authorization, database grants, row-level policy, validation, and audit requirements appropriate to its risk.

## 2. Security Objectives

The implementation must guarantee that:

1. A user cannot discover or mutate another organization's data without an explicit, revocable cross-organization relationship.
2. Organization administrators cannot gain platform-level access.
3. A user's access ends when the relevant membership, scope, or assignment becomes inactive, even if an older token still exists.
4. Client-supplied organization, actor, ownership, and audit attributes are never trusted.
5. Privileged services receive only the access needed for their bounded workload.
6. Every exposed relation is default-deny until an approved policy matrix and tests exist.
7. Authorization decisions are explainable from memberships, permissions, scope, resource relationships, and privileged grants.

## 3. Trust Model

Naqlk assumes:

- browser and mobile clients are untrusted;
- request payloads, URL identifiers, object paths, and client metadata are untrusted;
- authenticated users may be malicious or compromised;
- JWTs can be valid but stale;
- external integration payloads may be replayed, malformed, or associated with the wrong organization;
- platform administrators and service credentials are high-value targets; and
- database owners, superusers, and roles with `BYPASSRLS` can bypass normal row policies and therefore require separate operational controls.

The `public` schema must not expose application entities by default. Every relation reachable through a client-facing API must have RLS enabled and tested. Objects that cannot be secured safely through RLS remain in a non-exposed schema and are accessed only through narrowly authorized server operations.

## 4. Authentication Model

### 4.1 Human identities

Supabase Auth is the authentication authority for human sessions. Its managed user identifier is mapped one-to-one to an application profile through `auth_user_id`. Business data must reference the application profile, not the managed authentication relation directly.

Authentication establishes who presented the session; it does not establish which organization, permission, or resource they may access.

Anonymous sign-in is disabled unless a future, separately reviewed use case requires it. A newly authenticated person has no business-data access until an active organization membership exists.

### 4.2 Token claims

Authorization must not rely on user-editable metadata. Stable, trusted custom claims may be used as performance hints or for coarse routing, but the database remains authoritative for:

- active membership;
- organization status;
- role assignment;
- permission grants;
- business-unit scope;
- resource assignment;
- platform access grants; and
- revocation.

Large membership or permission lists must not be embedded in JWTs. Tokens are cached credentials and may not reflect a recent membership or role change until refreshed.

An active-organization claim or request header may select context, but access is granted only after the database verifies an active matching membership.

### 4.3 Non-human identities

Scheduled work, integrations, webhooks, and background processors use dedicated service principals. A service principal belongs to one organization unless explicitly designated as a platform service, has narrow capabilities, and has independently revocable credentials.

Shared human accounts and shared integration credentials are prohibited.

## 5. Authorization Model

Naqlk combines role-based access control with contextual attributes.

### 5.1 Role-based permissions

The authorization chain is:

`profile -> active organization membership -> assigned role -> permission definition`

Roles are organization-scoped. Permission definitions are stable platform vocabulary. An organization may configure approved role bundles, but it cannot invent permissions or grant platform capabilities.

Permissions use the naming standard `<domain>.<resource>.<action>`. Policies test capabilities, not UI role labels.

### 5.2 Contextual scope

A permission is necessary but may not be sufficient. The request may also require:

- membership in the row's organization;
- inclusion in the permitted business-unit subtree;
- ownership or responsibility for the resource;
- assignment to a shipment, trip, vehicle, or task;
- an active organization connection and resource share;
- an allowed workflow state;
- an unexpired platform access grant; or
- a specific service-principal capability.

### 5.3 Conceptual authorization helpers

The future implementation may expose hardened helpers in a non-exposed private schema for concepts such as:

- resolving the current application profile;
- checking active organization membership;
- checking a permission within an organization;
- checking business-unit scope;
- checking resource assignment;
- checking an active resource share; and
- checking a time-bound platform access grant.

Helpers must be stable, side-effect free, explicitly granted, search-path hardened, and covered by policy tests. This document does not prescribe their SQL implementation.

## 6. Row Classification

Every future entity must be assigned one of these access classes before implementation:

| Class               | Ownership and access rule                                                                |
| ------------------- | ---------------------------------------------------------------------------------------- |
| Global reference    | Platform-maintained, read-only to eligible authenticated users; never customer-writable. |
| Organization-owned  | Direct `organization_id`; active membership, capability, and scope required.             |
| User-private        | Visible only to the subject and narrowly authorized support or security personnel.       |
| Assignment-scoped   | Organization access plus an active operational assignment or responsibility.             |
| Connected or shared | Owning organization plus an explicit active connection and resource-specific share.      |
| Platform-restricted | Only a time-bound platform grant with an approved purpose.                               |
| Service-only        | No direct end-user access; dedicated trusted service principal only.                     |
| Immutable or audit  | Append-only trusted writes; tightly limited reads; no customer update or delete.         |

An entity must not combine incompatible classes implicitly. When visibility differs, use an explicit association or read model.

## 7. Operation Rules

### 7.1 Select

A row is selectable only when all applicable conditions are true:

- the actor is authenticated or is an approved service principal;
- the owning organization is active;
- the actor has an active membership or explicit platform/service grant;
- the actor has the required read permission;
- business-unit, assignment, party, or share scope permits the row;
- the row is not soft-deleted unless restore or audit access is granted; and
- sensitive fields are allowed for the actor's purpose.

RLS determines row visibility. Column grants, safe views, or purpose-built server responses must additionally protect sensitive attributes.

### 7.2 Insert

An insert is allowed only when:

- the actor has the create capability;
- the target organization is derived from verified context or independently revalidated;
- every referenced organization-owned entity belongs to the same organization unless an approved sharing rule applies;
- protected values such as creator, audit actor, lifecycle state, and timestamps are assigned by trusted code; and
- required domain validation succeeds.

Client-supplied actor identifiers, privileged status values, organization ownership, version numbers, and audit metadata must be ignored or rejected.

### 7.3 Update

An update requires authorization against both the existing row and the proposed row. Policies and trusted commands must prevent changes to:

- `id`;
- `organization_id`;
- immutable provenance;
- creator and creation time;
- finalized or append-only facts; and
- fields controlled by a separate approval or state-transition workflow.

Updates must respect optimistic concurrency where defined. Moving an entity across organizations is prohibited; authorized transfer is modeled as a new domain workflow and auditable relationships.

### 7.4 Delete

Direct client hard deletion is denied. Eligible master data uses an authorized soft-delete operation. Immutable, financial, audit, security, event, message, and document-version records cannot be deleted through ordinary customer access.

Hard deletion is available only through an approved retention, privacy, or test-data process using a trusted operational identity and a corresponding audit record.

## 8. Customer Permission Model

The following labels describe default role templates, not hardcoded policy branches:

| Role template              | Intended scope                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Organization owner         | Organization governance, owner succession, and high-risk configuration; cannot grant platform access.         |
| Organization administrator | Memberships, roles, business units, and organization configuration within delegated bounds.                   |
| Operations manager         | Broad transport and dispatch operations within assigned business-unit scope.                                  |
| Dispatcher                 | Shipment, trip, stop, assignment, and exception activity within operational scope.                            |
| Fleet manager              | Drivers, vehicles, equipment, availability, compliance, and maintenance within scope.                         |
| Driver                     | Own profile plus currently assigned trips, tasks, stops, documents, and permitted tracking actions.           |
| Customer service           | Read and approved update access to customer-facing transport records; restricted financial and security data. |
| Finance                    | Rates, charges, invoices, subscriptions, and approved operational references.                                 |
| Auditor                    | Read-only access to permitted operational history and audit evidence; no mutation.                            |
| Analyst                    | Approved, minimized reporting read models; not unrestricted operational relations.                            |
| External customer          | Explicitly shared shipments, milestones, documents, and proofs only.                                          |

Organizations may assign multiple roles. Effective access is the union of granted permissions constrained by membership, business-unit, assignment, resource-share, and separation-of-duty rules. A denial imposed by organization suspension, legal restriction, or platform security control takes precedence.

## 9. Administrative Access

### 9.1 Organization administrators

Organization administrators remain ordinary tenant actors. They can operate only inside their organizations and cannot:

- access another organization without a separate membership;
- create platform grants;
- modify global permission definitions;
- bypass RLS;
- inspect credentials or secrets; or
- alter immutable audit evidence.

High-risk actions such as owner change, bulk export, integration-secret rotation, and permission escalation require recent authentication and additional audit context.

### 9.2 Platform administrators

Platform support access is represented by explicit `platform_access_grants` with:

- named individual identity;
- approved purpose and ticket or incident reference;
- target organization or platform scope;
- narrowly defined capability;
- start and expiry time;
- approver identity; and
- complete audit coverage, including impersonation context.

Standing cross-organization access is prohibited for routine support. Customer impersonation must never conceal the platform actor.

### 9.3 Super administrator and break-glass access

Super-administrator access is an emergency operational capability, not an application role. It must be:

- unavailable to routine browser sessions;
- protected by strong MFA and independently controlled credentials;
- time-bound and purpose-bound;
- approved under the incident or emergency-access procedure;
- visible to security monitoring;
- fully audited outside the mutable application path; and
- reviewed after every use.

Two-person approval should be required when operationally feasible. Break-glass access must not be granted by placing a durable `super_admin` flag on a customer profile.

## 10. Service Roles and Trusted Workloads

### 10.1 Client roles

The anonymous or publishable client credential identifies the application, not a trusted actor. It receives only the grants and RLS behavior intended for public or signed-in clients.

Authenticated requests remain bound to the end user's claims and database authorization state.

### 10.2 User-scoped server work

Server-rendered and server-action workloads should preserve the end-user session whenever the operation is performed on the user's behalf. Moving code to a server does not justify bypassing RLS.

### 10.3 Dedicated services

Background and integration workloads use dedicated identities, separate secrets, narrow domain capabilities, bounded organization scope, credential rotation, and workload-specific audit attribution.

### 10.4 Supabase service role

The Supabase service-role credential can bypass RLS and must therefore:

- never be exposed to a browser, mobile bundle, log, repository, preview comment, or untrusted runtime;
- be used only when a user-scoped or dedicated restricted identity cannot perform the required operation;
- be isolated in a separately constructed server client;
- never be forwarded from a request or selected by user input;
- be rotated after suspected exposure; and
- be paired with explicit application authorization, validation, scoping, and audit.

Possession of a service-role credential is not equivalent to business authorization or super-administrator approval.

## 11. Multi-Tenant Enforcement

Every organization-owned root entity carries immutable `organization_id`. Descendants also carry `organization_id` where required for direct policy evaluation, tenant-safe constraints, partitioning, and query locality.

Implementation must enforce:

1. A child and parent share the same organization.
2. Membership is active for the selected organization.
3. Business-unit scope is evaluated within that organization.
4. Cross-organization access exists only through `organization_connections` and resource-specific `resource_shares`.
5. A share is directional, revocable, scoped to a specific resource and capability, and never implies database ownership transfer.
6. Users with memberships in multiple organizations must select and authorize each context independently.

The logical model must remain compatible with future organization placement on dedicated databases. Global identifiers, explicit ownership, no cross-organization transactions, and an external routing directory are prerequisites for that evolution.

## 12. Business-Unit Scope

Business units form an organization-local hierarchy. A role assignment may apply to:

- the whole organization;
- one business unit only; or
- one business unit and its descendants.

The selected scope semantics must be stored explicitly. Hierarchy traversal must not accept a business-unit identifier from another organization. Re-parenting a business unit is a high-risk operation because it changes inherited visibility and requires pre-change impact analysis and audit.

## 13. Cross-Organization Sharing

No data becomes visible merely because two organizations refer to the same party, shipment number, driver, or vehicle.

Cross-organization visibility requires:

- an active connection between the organizations;
- an explicit resource share from the owner to the recipient;
- a defined resource type and resource identifier;
- allowed actions and fields;
- an effective period; and
- revocation behavior.

Recipient access is read-only unless a documented collaboration workflow grants specific mutations. Shared views must minimize fields and must not expose internal notes, costs, access-control data, credentials, or unrelated linked records.

## 14. Views, Functions, Storage, and Realtime

### 14.1 Views

Client-reachable views must preserve invoker security semantics on the supported PostgreSQL version or be exposed only through a separately reviewed safe interface. A view must not accidentally restore visibility hidden by base-relation RLS.

Materialized read models are treated as independently protected data stores and require their own ownership, refresh, RLS, and staleness design.

### 14.2 Functions

Invoker-rights behavior is preferred. Any elevated function must have a narrow purpose, explicit input validation, fixed search path, minimal grants, qualified object references, and auditable use. Generic arbitrary-query or arbitrary-identifier helper functions are prohibited.

### 14.3 Storage

Private buckets are the default. Storage-object policies must mirror authoritative document ownership, membership, share, lifecycle, and classification rules. An object path is not proof of access.

Signed URLs are short-lived capabilities and must be issued only after authorization. Issuance and sensitive downloads are auditable events.

### 14.4 Realtime

Realtime subscriptions require the same tenant and resource authorization as reads. Publication membership, event payload minimization, soft-deletion behavior, and revoked-session behavior must be tested before enabling a relation.

## 15. Policy Performance Rules

Security takes priority over optimization, but avoidable policy cost is a reliability risk. Future implementation must:

- index `organization_id`, membership status, role joins, scope joins, assignment joins, and share predicates;
- include explicit organization filters in application queries even though RLS remains mandatory;
- keep policy helpers stable and side-effect free;
- avoid unbounded hierarchy walks or recursive policy cycles;
- avoid embedding large authorization sets in JWTs;
- measure representative plans with realistic organization sizes;
- partition high-volume relations without changing authorization semantics; and
- test policy behavior after every index, view, or planner-related change.

Caching authorization decisions is allowed only with bounded lifetime, organization context, and reliable invalidation on membership, role, scope, or organization-status change.

## 16. Required Policy Inventory

Before implementing an entity, its design record must identify:

- domain and entity;
- row classification;
- owning organization path;
- subject and actor type;
- required permission for select, insert, update, and delete;
- business-unit or assignment scope;
- soft-delete visibility;
- shared-resource behavior;
- platform and service exceptions;
- protected columns;
- indexes used by the policy;
- audit events; and
- positive and negative test cases.

An entity without a completed inventory cannot be exposed.

## 17. Verification Matrix

Automated database tests must cover at least:

- unauthenticated default denial;
- active and inactive memberships;
- cross-organization identifier substitution;
- a user with multiple organization memberships;
- organization suspension;
- role grant and revocation;
- stale-token behavior after revocation;
- whole-organization, business-unit, and descendant scopes;
- own, assigned, unassigned, and re-assigned resources;
- active, expired, and revoked cross-organization shares;
- soft-deleted entities and restoration privileges;
- immutable row update and delete denial;
- organization administrator boundaries;
- platform-grant creation, expiry, and impersonation;
- each dedicated service principal;
- views, elevated functions, Storage objects, and Realtime;
- client attempts to set protected actor or organization fields; and
- service-role paths at the application authorization boundary.

Tests must assert both allowed access and absence of rows or mutations where access is denied. UI behavior is not security evidence.

## 18. Change and Incident Process

Every RLS change requires:

1. updated policy inventory;
2. threat and cross-tenant impact review;
3. positive and negative test updates;
4. representative performance analysis;
5. rollback or containment procedure;
6. security approval for privileged exceptions; and
7. deployment observation for denial spikes or unexpected access.

If cross-tenant exposure is suspected, responders must revoke affected credentials, disable the relevant path where safe, preserve audit evidence, determine the exact policy and time window, identify impacted organizations, and follow the incident-notification procedure.

## 19. Implementation Gate

RLS implementation may begin only after:

- the physical entity design is approved;
- every exposed entity has a completed policy inventory;
- role and permission vocabulary is versioned;
- business-unit and sharing semantics are finalized;
- privileged-access ownership is assigned;
- audit event requirements are mapped; and
- the automated database-test harness can execute as multiple actors.

## 20. References

- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase: Custom Claims and Role-Based Access Control](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [Supabase: Managing User Data](https://supabase.com/docs/guides/auth/managing-user-data)
- [PostgreSQL: Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
