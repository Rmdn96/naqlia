# Naqlia Roles and Permissions

| Document field | Value                                                                              |
| -------------- | ---------------------------------------------------------------------------------- |
| Suite          | Product Documentation Suite (PDS) v1                                               |
| Status         | Approved authorization baseline                                                    |
| Version        | 1.0.0                                                                              |
| Parent         | [Business Requirements Specification](./01-Business-Requirements-Specification.md) |
| Owners         | Product, Security, and domain owners                                               |

## 1. Purpose

This document defines the MVP actor model, permission boundaries, separation of duties, and authorization governance. It specifies business authorization independently of UI, API, database, identity provider, or Row Level Security implementation.

## 2. Authorization Principles

- Deny by default; grant the least privilege needed for an approved responsibility.
- Authenticate identity before authorization and reauthorize every protected operation at its execution boundary.
- Scope access by role, business purpose, record relationship, assignment, lifecycle state, field sensitivity, and operating context.
- Server-side and data-layer enforcement are mandatory; hidden UI is not a security control.
- High-risk actions require reason, recent authentication where appropriate, immutable audit evidence, and configured approval.
- No application role is a database superuser, Supabase service role, RLS bypass identity, or break-glass operator.
- A user acting in multiple roles receives the union only of explicitly granted permissions; conflicts and separation-of-duty rules still apply.
- Role and permission values MUST be centrally governed and MUST NOT be inferred from email domains, client claims without validation, or UI route names.

## 3. Actor Classes

| Class     | Actor                     | Authentication / verification                                     | Scope                                                        |
| --------- | ------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------ |
| External  | Visitor                   | Anonymous                                                         | Public catalog and start/request surfaces only               |
| External  | Guest Customer            | Verified context appropriate to action                            | Own submitted request/Quotation/Order interactions only      |
| External  | Registered Customer       | Email, Google, or Apple account plus action-specific verification | Own account-linked records only                              |
| Internal  | Sales                     | Workforce identity with Sales grant                               | Commercial workflow within assigned/permitted scope          |
| Internal  | Operations                | Workforce identity with Operations grant                          | Scheduling and execution within assigned/permitted scope     |
| Internal  | Finance                   | Workforce identity with Finance grant                             | Financial review/governance/reporting within permitted scope |
| Internal  | Customer Service          | Workforce identity with Customer Service grant                    | Verified support and approved corrective operations          |
| Internal  | Super Admin               | Workforce identity, strong authentication, privileged grant       | Application administration within explicit permissions       |
| Non-human | Approved service identity | Workload identity and narrowly scoped secret                      | One documented machine purpose; never interactive use        |

Workforce access MUST be distinct from customer accounts even when the same person controls both identities.

## 4. External Actor Permissions

| Capability                                              | Visitor                                       | Guest Customer                       | Registered Customer                          |
| ------------------------------------------------------- | --------------------------------------------- | ------------------------------------ | -------------------------------------------- |
| View enabled service catalog and coverage guidance      | Allow                                         | Allow                                | Allow                                        |
| Submit eligible request                                 | Allow                                         | Allow                                | Allow                                        |
| Create an account                                       | Allow                                         | Allow                                | Not applicable                               |
| Receive/respond to clarification                        | No standing access; verified channel required | Own request through verified channel | Own request through account/verified channel |
| View or accept a Quotation                              | No                                            | Own exact version after verification | Own exact version after authorization        |
| Track an Order                                          | Order Number + matching Mobile Number         | Same                                 | Same, plus account convenience if enabled    |
| View account history                                    | No                                            | No                                   | Own linked history only                      |
| Change another customer's data                          | Deny                                          | Deny                                 | Deny                                         |
| Access internal notes, approvals, assignments, or audit | Deny                                          | Deny                                 | Deny                                         |

Possession of a Lead, Quotation, or Order reference alone never authorizes access. Guest access MUST use purpose-bound, expiring verification appropriate to the sensitivity of the operation.

## 5. Permission Families

Permissions SHOULD use stable business capabilities rather than screen or route names:

| Family         | Examples of governed capabilities                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Catalog        | Read enabled catalog; draft/publish/retire service and coverage configuration                                                         |
| Lead           | Read, assign, qualify, unqualify, close, reopen, export                                                                               |
| Quotation      | Read, calculate estimate, draft, request approval, approve threshold, Sales-review, send, supersede, cancel, record customer decision |
| Order          | Read, convert from approved Quotation, amend, cancel, view customer projection                                                        |
| Operations     | Schedule, assign, start, update, open/resolve exception, submit/approve completion                                                    |
| Customer       | Read permitted profile/contact fields, request correction, perform approved correction, merge/link identities                         |
| Communication  | View, compose from approved templates, send, retry, suppress under policy                                                             |
| Finance        | View commercial fields, govern pricing, approve threshold, report/export permitted financial data                                     |
| Support        | Create/assign/resolve case, verify identity, escalate, view safe operational summary                                                  |
| Administration | Manage users/roles, configuration, localization, feature rollout, retention jobs, integrations                                        |
| Audit          | View/search/export audit evidence, verify integrity, administer retention/legal hold                                                  |
| Reporting      | View named report, configure definition, export permitted result                                                                      |

Each permission grant MUST document applicable object scope, field scope, lifecycle states, approval condition, and export rights.

## 6. Internal Responsibility Matrix

Legend: **O** owns/executes, **A** approves under configured authority, **R** read for duty, **L** limited support action, **D** denied by default. `O/A` never removes an independent approval requirement.

| Capability                   | Super Admin                                       | Sales                                 | Operations                            | Finance                               | Customer Service                                      |
| ---------------------------- | ------------------------------------------------- | ------------------------------------- | ------------------------------------- | ------------------------------------- | ----------------------------------------------------- |
| View Leads                   | R for administration/support only                 | O                                     | R after qualification/assignment need | R where financial need exists         | L after customer verification                         |
| Assign Sales owner           | L for recovery with reason                        | O within team scope                   | D                                     | D                                     | D                                                     |
| Qualify/unqualify Lead       | D                                                 | O                                     | Consult only                          | Consult only                          | D                                                     |
| Draft Quotation              | D                                                 | O                                     | Consult service feasibility           | Consult pricing                       | D                                                     |
| Sales final review           | D                                                 | O; mandatory named reviewer           | D                                     | D                                     | D                                                     |
| Approve financial threshold  | Only if separately granted as configured approver | A only when policy explicitly allows  | D                                     | A                                     | D                                                     |
| Send/supersede Quotation     | D                                                 | O                                     | D                                     | Read approval state                   | L resend unchanged issued version when policy permits |
| Record customer decision     | D                                                 | O with verified evidence              | D                                     | R                                     | L only through approved verified support path         |
| Convert approved Quotation   | Recovery only; no manual bypass                   | O/system-triggered                    | R                                     | R                                     | D                                                     |
| Read confirmed Order         | R for administration/support                      | R                                     | O                                     | R commercial fields                   | L after verification                                  |
| Schedule/assign service      | D                                                 | Consult                               | O                                     | D                                     | D                                                     |
| Start/update Execution       | D                                                 | R customer-safe state                 | O                                     | D                                     | R customer-safe state                                 |
| Manage operational exception | D                                                 | R if commercial impact                | O                                     | R/A if financial impact requires      | L triage/escalate                                     |
| Complete Order               | D                                                 | R                                     | O under completion controls           | R                                     | R customer-safe state                                 |
| Cancel Order                 | No bypass; recovery only                          | Request/A before execution per policy | O/A operationally per policy          | A for financial impact where required | Request only                                          |
| Modify pricing configuration | Govern access/publish workflow                    | Propose/consult                       | Consult feasibility                   | O/A                                   | D                                                     |
| Modify catalog/coverage      | O/A through governed publish flow                 | Propose/consult                       | Propose/consult                       | Consult price impact                  | Consult support impact                                |
| Manage internal users/roles  | O/A with strong controls                          | D                                     | D                                     | D                                     | D                                                     |
| View application audit       | O/R for authorized purpose                        | Own/relevant records only             | Own/relevant records only             | Relevant financial events             | Relevant support events                               |
| Export bulk data             | A per named export permission                     | Limited assigned commercial export    | Limited operational export            | Limited financial export              | Denied unless separately approved                     |
| Change audit evidence        | D                                                 | D                                     | D                                     | D                                     | D                                                     |

The physical authorization design MAY split an `O`, `A`, `R`, or `L` cell into narrower permissions. It MUST NOT broaden it without an approved PDS change.

## 7. Role Definitions

### 7.1 Sales

Sales owns request qualification and customer commercial engagement. Sales MAY access customer, cargo, route, and communication data necessary for assigned Leads and related Quotations. Sales MUST review every customer-bound final Quotation, even when calculation is fully configured. Sales MUST NOT execute transport, publish global configuration, modify issued versions, or approve an adjustment outside the user's delegated threshold.

### 7.2 Operations

Operations owns post-conversion readiness, scheduling, resource assignment, execution, exceptions, and completion. Operations receives the approved service/commercial snapshot needed for delivery but MUST NOT change accepted price or terms. A proposed material change returns to the governed Sales/Finance amendment process.

### 7.3 Finance

Finance governs pricing policy, threshold approvals, commercial-impact review, and finance-safe reporting. Finance MAY view only customer and operational fields necessary for those purposes. Finance MUST NOT qualify Leads, perform Sales final review, schedule transport, or change execution evidence.

### 7.4 Customer Service

Customer Service supports verified customers, explains customer-visible status, records cases, retries approved communications, requests corrections, and escalates to the responsible domain. It MUST NOT expose internal notes, alter prices, accept expired/superseded Quotations, execute operational transitions, or reset identity safeguards.

### 7.5 Super Admin

Super Admin governs application configuration, localization, access administration, and recovery operations. It is not a universal business operator. Super Admin MUST NOT:

- bypass mandatory Sales review, configured approval, lifecycle transition, RLS, or audit;
- impersonate a customer or workforce user except through a separately approved, visible, time-bound support control;
- edit immutable issued, accepted, converted, completed, or audited evidence;
- read business records merely because the role is privileged; a documented support/security purpose is required; or
- use or expose database owner/service-role credentials through the application.

Where Super Admin performs an exceptional recovery action, the platform requires reason, ticket/reference, recent authentication, before/after evidence, customer/business impact, and independent review when policy requires.

## 8. Separation of Duties

| Sensitive operation                          | Initiator                    | Required independent control                                                      |
| -------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------- |
| Publish pricing rules or approval thresholds | Finance or configured editor | Authorized publisher; initiator cannot self-approve when dual control is enabled  |
| Send final Quotation                         | Sales preparer               | Named Sales review; financial approval where thresholds require                   |
| Approve out-of-policy adjustment             | Sales requester              | Finance/configured approver within delegated authority                            |
| Convert Quotation to Order                   | Authorized workflow          | Current customer acceptance and all current approvals; exactly-once check         |
| Material post-acceptance amendment           | Sales / Operations request   | Customer reacceptance and required Sales/Finance approval                         |
| Cancel active Order with financial impact    | Sales or Operations          | Domain and Finance approvals required by policy                                   |
| Grant/revoke privileged role                 | Super Admin                  | Strong authentication, reason, audit, notification; second approver if configured |
| Bulk export sensitive data                   | Named role                   | Purpose, row/field scope, approval, expiry, watermark/logging where applicable    |
| Retention destruction or legal hold          | Authorized administrator     | Policy authority, preview/evidence, independent approval                          |
| Audit export or integrity administration     | Audit-authorized role        | Access logging and no ability to modify source evidence                           |

A single person MUST NOT satisfy two required independent approvals for the same action, even if assigned both roles.

## 9. Record and Field Scope

Authorization MUST be evaluated at least across:

- Naqlia operating workspace/tenant boundary;
- assigned team or record where assignment applies;
- related customer ownership or verified guest context;
- business object and current lifecycle state;
- field class: public, internal, confidential, restricted, secret, or audit;
- operation: read, create, propose, approve, update, transition, export, or administer;
- service/route geography and delegated authority where configured; and
- environment, session risk, recent authentication, and support/security purpose.

Examples of restricted fields include identity linkage, exact contact/address, internal notes, approval rationale, security indicators, audit metadata, and exported files. A role may read a record without reading every field.

## 10. Identity and Access Lifecycle

- Workforce access requires an approved request, manager/domain owner, named role(s), scope, purpose, and expiry for temporary access.
- Privileged roles require strong authentication, short-lived sessions, reauthentication for critical actions, and separate production authorization.
- Joiner, mover, and leaver changes MUST propagate within an approved service level and revoke stale sessions/credentials where risk requires.
- Access is reviewed periodically and on role change, incident, long inactivity, or contract end.
- Dormant, shared, generic, and orphaned interactive accounts are prohibited.
- Service identities have an owner, one purpose, minimal permissions, rotation, expiry/review, monitoring, and no interactive login.
- Emergency access is time-bound, separately controlled, highly visible, and reviewed after use.

## 11. Customer Identity and Linking

Email, Google, and Apple sign-in methods MAY link to one customer only after the approved identity-linking proof succeeds. Matching email text alone is insufficient where provider assurance or account state is ambiguous. Guest history MUST NOT automatically appear in an account solely because a mobile number or email text matches; a verified claim process is required and audited.

Customer Service cannot override identity linkage through ordinary support permissions. Disputes and duplicate accounts use a specialized, approved resolution process that preserves provenance.

## 12. Administration and Configuration Permissions

Each configuration category MUST declare viewer, editor, reviewer, publisher, emergency operator, and rollback authority. Drafting, approving, publishing, retiring, and rolling back are distinct permissions. The platform MUST prevent an unauthorized user from making a draft effective by manipulating time, state, import, or client behavior.

Security invariants, mandatory Sales review, audit immutability, and tenant isolation are not configurable permissions.

## 13. Audit and Monitoring

Authentication events, access changes, denials, sensitive reads, exports, approvals, impersonation/support access, configuration publication, lifecycle transitions, and service-identity use MUST produce the evidence required by the Audit Strategy. Repeated denial, unusual export, cross-scope attempts, privilege escalation, public-tracking abuse, and inactive-account use require monitored signals and incident routing.

Audit visibility itself is permissioned; viewing audit evidence creates audit evidence.

## 14. Authorization Test Contract

Every protected capability MUST include:

- allow tests for each authorized actor and valid scope;
- deny tests for every other role, cross-customer/cross-record/cross-workspace scope, invalid state, and restricted field;
- direct-boundary tests that bypass the UI;
- stale/revoked/expired session and changed-role tests;
- dual-control and delegated-threshold tests;
- export, bulk, search, report, and indirect relationship tests;
- customer/guest ownership and public tracking privacy tests; and
- proof that denials and sensitive successes create the required audit/monitoring evidence.

Authorization is not Done until negative tests demonstrate that no alternate boundary broadens access.
