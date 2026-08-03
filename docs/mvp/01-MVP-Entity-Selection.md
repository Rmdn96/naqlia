# Naqlia MVP Entity Selection

| Document field | Value                                                         |
| -------------- | ------------------------------------------------------------- |
| Suite          | Production MVP Scope                                          |
| Status         | Approved implementation-planning baseline; documentation only |
| Version        | 1.0.0                                                         |
| Effective date | 2026-08-03                                                    |
| Timebox        | Four weeks                                                    |
| Source model   | [Domain Model Suite v1](../domain/01-Domain-Model.md)         |
| Physical scope | [MVP Database Scope](./02-MVP-Database-Scope.md)              |
| Owners         | Product, Engineering, Data, Security, and Operations          |

## 1. Purpose

This document reduces the 121-entity enterprise domain model to the smallest production-capable model that can launch Naqlia safely in four weeks. It classifies every existing domain, logical entity, relationship, and business capability as `MVP`, `PHASE 2`, or `PHASE 3` and explains the effect of every deferral.

This plan changes implementation priority, not business meaning. The Constitution, approved business rules, Arabic/English parity, mandatory Sales review, authorization, lifecycle integrity, privacy, and audit remain binding. Where several logical entities are consolidated into one MVP table, their business facts remain distinguishable fields or immutable records.

## 2. Classification Contract

| Classification | Delivery meaning                                                                                                                        |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `MVP`          | Required for the four-week production launch. The entity may have a dedicated table or an explicitly named consolidated representation. |
| `PHASE 2`      | Post-launch operational maturity. Defer until real usage proves the need or the named limitation becomes material.                      |
| `PHASE 3`      | Enterprise, ecosystem, or SaaS expansion. Defer until the corresponding product strategy is approved.                                   |

Rules:

1. Every entity has exactly one delivery classification in this document.
2. `MVP — consolidated` authorizes the business fact but not a dedicated table.
3. A deferred entity MUST NOT appear as a dormant table, speculative join table, or generic framework in the MVP schema.
4. Deferral MUST NOT remove a launch invariant. The MVP representation stated here is the approved simpler control.
5. Moving an item earlier requires scope, security, data, test, and four-week delivery impact review.

## 3. Selection Principles

- Prefer one clear record per customer, Lead, Quotation revision, Order, attachment, notification, content page, and audit event.
- Store immutable customer-facing and commercial snapshots on the record that owns them.
- Keep lifecycle history separate only where it is essential to customer service, operations, or dispute evidence.
- Use Supabase Auth as the credential, provider, session, and account-verification authority; do not reproduce it in application tables.
- Use one fixed, reviewed staff role per active staff Profile. Compact role, permission, grant, and assignment records are MVP security infrastructure; custom roles, multi-role staff, tenant scope, and Admin editing remain deferred.
- Keep the hybrid Quotation human-authored. A pricing engine, estimate aggregate, and rule graph are not launch dependencies.
- Model scheduling, execution, assignment snapshots, exceptions, completion, amendment, and cancellation on the Order aggregate for MVP.
- Keep one current configuration row per governed key with version metadata; release orchestration is deferred.
- Keep content and SEO on one bilingual Content Page record.
- Use explicit closed subject kinds only where consolidation is intentional: attachments and audit records.

## 4. Domain Classification

| Domain                                      | Classification | MVP decision and deferred impact                                                                                                                                               |
| ------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DOM-TEN` Tenancy and Organization          | `PHASE 3`      | MVP operates one Naqlia company. Tenant onboarding, organization boundaries, connections, and sharing are excluded; no customer impact for the launch operating model.         |
| `DOM-IAM` Identity and Access               | `MVP`          | Profiles plus fixed database RBAC support customer and workforce access. Tenant-custom roles, access campaigns, machine identities, and devices follow later.                  |
| `DOM-CFG` Configuration Governance          | `MVP`          | A versioned `app_settings` record per key provides auditable bilingual configuration. Release bundles and schema-driven configuration governance move to Phase 2.              |
| `DOM-CAT` Service Catalog and Eligibility   | `MVP`          | Offerings, add-ons, and coverage are explicit tables. Dynamic questionnaires and independently versioned restriction libraries move to Phase 2.                                |
| `DOM-CUS` Customer and Consent              | `MVP`          | Guest/registered continuity, contact, address, language, transactional preference, and consent evidence are retained in a compact customer model.                              |
| `DOM-LED` Request Intake and Lead           | `MVP`          | The complete guest request and Sales Lead workflow is retained, with child facts consolidated where bounded.                                                                   |
| `DOM-PRC` Pricing and Approval Policy       | `PHASE 2`      | MVP uses human-authored Quotation lines plus configured approval thresholds. Automated estimates and a rule engine are excluded; Sales performs more manual work.              |
| `DOM-QUO` Quotation                         | `MVP`          | Every revision is an immutable Quotation row with its own items, review, approval, decision, and history.                                                                      |
| `DOM-ORD` Order                             | `MVP`          | Order conversion, accepted snapshot, lifecycle, cancellation, and amendment evidence are retained in a compact aggregate.                                                      |
| `DOM-OPS` Scheduling and Execution          | `MVP`          | Scheduling, execution, assignments, exceptions, and completion are fields and history on Order. Separate Execution aggregates move to Phase 2.                                 |
| `DOM-RES` Fleet Resources and Mobile        | `PHASE 2`      | Driver/vehicle masters and availability follow after launch; MVP captures the assigned resource snapshot on Order. Mobile, equipment, compliance, and maintenance are Phase 3. |
| `DOM-COM` Communications                    | `MVP`          | Bilingual templates and append-only notification sends are retained. Rich recipient/attempt graphs and preference orchestration move to Phase 2.                               |
| `DOM-SUP` Customer Support and Verification | `MVP`          | Support cases and tracking telemetry are retained. Challenge-based verification and a dedicated support event stream move to Phase 2.                                          |
| `DOM-DOC` Documents and Evidence            | `MVP`          | One attachment table owns storage metadata and one closed business association. Version graphs are deferred.                                                                   |
| `DOM-EVT` Events and Integration            | `PHASE 2`      | Idempotency is MVP. A durable domain-event/outbox platform follows when multiple asynchronous consumers justify it.                                                            |
| `DOM-WFL` Workflow Orchestration            | `PHASE 3`      | Explicit application services enforce the fixed MVP lifecycle; a configurable workflow engine is unnecessary for launch.                                                       |
| `DOM-FIN` Billing and Payment               | `PHASE 3`      | Quotations preserve commercial facts, but invoicing, gateway payments, allocation, and refunds remain out of scope.                                                            |
| `DOM-GOV` Audit, Reporting, and Analytics   | `MVP`          | Immutable application audit is retained. Configurable reports, exports, legal-hold records, and metric projections follow in Phase 2/3.                                        |
| `DOM-CMS` Content and SEO                   | `MVP`          | New compact domain required by the launch brief: bilingual public pages and their SEO metadata share one record.                                                               |

## 5. Complete Entity Classification

### 5.1 Tenancy and Organization

| ID / entity                           | Class     | MVP representation or exclusion reason                       | Business impact                                                                         |
| ------------------------------------- | --------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `ENT-TEN-001` Organization            | `PHASE 3` | Single Naqlia operator makes a tenant root unnecessary.      | No self-service company workspaces or tenant isolation until enterprise SaaS expansion. |
| `ENT-TEN-002` Organization Setting    | `MVP`     | Consolidated into `app_settings`; no organization dimension. | Launch settings remain editable and audited for the single operator.                    |
| `ENT-TEN-003` Business Unit           | `PHASE 2` | Riyadh launch does not need branch hierarchy.                | Work queues are company-wide; branch-level ownership/reporting waits.                   |
| `ENT-TEN-004` Organization Connection | `PHASE 3` | Cross-company collaboration is outside the launch model.     | No partner-company sharing or federation.                                               |
| `ENT-TEN-005` Resource Share          | `PHASE 3` | Depends on multiple organizations and connections.           | Resources cannot be shared between tenants until SaaS expansion.                        |

### 5.2 Identity and Access

| ID / entity                                  | Class     | MVP representation or exclusion reason                                                                 | Business impact                                                                                |
| -------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `ENT-IAM-001` Profile                        | `MVP`     | Dedicated `profiles` table mapped to Supabase Auth.                                                    | Supports customer accounts and named staff access.                                             |
| `ENT-IAM-002` Organization Membership        | `PHASE 2` | Single company and one role per staff profile remove membership indirection.                           | A person cannot belong to multiple operating units or companies.                               |
| `ENT-IAM-003` Permission Definition          | `MVP`     | Compact `permissions` records define reviewed machine keys; Sprint 1B seeds identity permissions only. | Admins cannot create new capabilities at runtime.                                              |
| `ENT-IAM-004` Role Definition                | `MVP`     | Compact `roles` records hold the five approved platform roles.                                         | No custom roles; changes require a reviewed release.                                           |
| `ENT-IAM-005` Role Permission                | `MVP`     | `role_permissions` retains approved fixed grants and revocations.                                      | Permission bundles cannot be edited from Admin.                                                |
| `ENT-IAM-006` Membership Role                | `MVP`     | Compact `profile_roles` adapts the enterprise membership concept directly to Profile.                  | Exactly one active role is allowed; multi-company membership remains deferred.                 |
| `ENT-IAM-007` Membership Business Unit Scope | `PHASE 2` | Business units are deferred.                                                                           | No branch-scoped access.                                                                       |
| `ENT-IAM-008` Service Principal              | `PHASE 3` | No public API, partner integration, or separate machine client in MVP.                                 | Background work uses tightly controlled server identity rather than customer-managed machines. |
| `ENT-IAM-009` Service Principal Grant        | `PHASE 3` | Service principals are excluded.                                                                       | No configurable machine permissions.                                                           |
| `ENT-IAM-010` Platform Access Grant          | `PHASE 3` | Cross-tenant support and break-glass tenancy are not needed for one operator.                          | Privileged production support remains an infrastructure procedure.                             |
| `ENT-IAM-011` Access Review                  | `PHASE 2` | Small launch team uses a documented manual review with audit evidence.                                 | No in-product certification campaigns.                                                         |
| `ENT-IAM-012` Device Registration            | `PHASE 3` | Native/offline mobile applications are excluded.                                                       | No registered device, push token, or offline-sync identity.                                    |

### 5.3 Configuration Governance

| ID / entity                              | Class     | MVP representation or exclusion reason                                   | Business impact                                                                                |
| ---------------------------------------- | --------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `ENT-CFG-001` Configuration Definition   | `PHASE 2` | MVP allows only a reviewed key allowlist in the application contract.    | New key schemas require a release rather than runtime definition.                              |
| `ENT-CFG-002` Configuration Version      | `MVP`     | Consolidated into version metadata and value snapshot on `app_settings`. | Values remain attributable and historical changes auditable.                                   |
| `ENT-CFG-003` Configuration Release      | `PHASE 2` | Atomic multi-key release orchestration is too large for four weeks.      | Related settings publish individually; operators coordinate changes using a release checklist. |
| `ENT-CFG-004` Configuration Release Item | `PHASE 2` | Depends on Configuration Release.                                        | No stored release bundle or ordered activation plan.                                           |

### 5.4 Service Catalog and Eligibility

| ID / entity                                  | Class     | MVP representation or exclusion reason                                                                                 | Business impact                                                                 |
| -------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `ENT-CAT-001` Service Definition             | `MVP`     | Consolidated into `service_offerings`.                                                                                 | Cargo service remains configurable and bilingual.                               |
| `ENT-CAT-002` Route Class Definition         | `MVP`     | Consolidated into `service_offerings`.                                                                                 | Local and intercity behavior remain explicit.                                   |
| `ENT-CAT-003` Add-on Definition              | `MVP`     | Dedicated `service_add_ons` table.                                                                                     | Packing and loading/unloading are configurable.                                 |
| `ENT-CAT-004` Service Offering               | `MVP`     | Dedicated `service_offerings` table; one row per enabled cargo-service/route-class combination.                        | Supports the four approved service combinations.                                |
| `ENT-CAT-005` Offering Add-on                | `MVP`     | Eligibility is stored on each add-on as an explicit offering allowlist.                                                | No join-table administration; the same eligibility can still be enforced.       |
| `ENT-CAT-006` Coverage Area                  | `MVP`     | Dedicated `coverage_areas` table.                                                                                      | Riyadh and enabled Saudi destinations remain configurable.                      |
| `ENT-CAT-007` Service Lane                   | `MVP`     | Direction, origin eligibility, destination eligibility, and offering allowlist are consolidated into `coverage_areas`. | Supports Riyadh-local and Riyadh-outbound routes; arbitrary lane networks wait. |
| `ENT-CAT-008` Qualification Field Definition | `PHASE 2` | MVP uses one approved intake contract plus offering-specific requirement metadata.                                     | Admin cannot design new form fields without a release.                          |
| `ENT-CAT-009` Offering Qualification Field   | `PHASE 2` | Dynamic qualification fields are deferred.                                                                             | Form layout is stable for launch, reducing implementation and QA risk.          |
| `ENT-CAT-010` Restriction Definition         | `MVP`     | Consolidated into offering eligibility/restriction metadata and `app_settings`.                                        | Launch restrictions remain configurable without a separate library.             |
| `ENT-CAT-011` Offering Restriction           | `MVP`     | Consolidated into `service_offerings`.                                                                                 | Eligibility checks remain available; reusable rule composition waits.           |
| `ENT-CAT-012` Customer Status Mapping        | `MVP`     | Stored as bilingual status configuration in `app_settings`.                                                            | Tracking remains privacy-safe and localized.                                    |
| `ENT-CAT-013` Reason Definition              | `MVP`     | Stored as governed reason lists in `app_settings`.                                                                     | Required reasons remain configurable; independent version graphs wait.          |

### 5.5 Customer and Consent

| ID / entity                            | Class     | MVP representation or exclusion reason                                            | Business impact                                                                               |
| -------------------------------------- | --------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `ENT-CUS-001` Customer                 | `MVP`     | Dedicated `customers` table.                                                      | Guest and registered customer continuity is supported.                                        |
| `ENT-CUS-002` Contact Point            | `MVP`     | Normalized mobile and optional email are consolidated into Customer.              | MVP supports one primary mobile/email; multiple contact points wait.                          |
| `ENT-CUS-003` Customer Address         | `MVP`     | Dedicated `customer_addresses` table for account convenience.                     | Registered customers may reuse addresses; guest route snapshots remain on Lead.               |
| `ENT-CUS-004` Customer Account Link    | `MVP`     | A verified optional Customer reference is stored on Profile.                      | One account links to one customer; historical many-to-many linking waits.                     |
| `ENT-CUS-005` Consent Record           | `MVP`     | Consent/policy version and acceptance evidence are captured on Customer and Lead. | Launch consent is provable; a multi-purpose consent ledger waits.                             |
| `ENT-CUS-006` Communication Preference | `MVP`     | Preferred locale and transactional channel are consolidated into Customer.        | One simple preference set is supported; effective-dated channel rules wait.                   |
| `ENT-CUS-007` Customer Feedback        | `PHASE 2` | Not required to complete the paid service lifecycle.                              | Ratings and structured feedback are unavailable at launch; support still captures complaints. |

### 5.6 Lead and Request

| ID / entity                     | Class | MVP representation or exclusion reason                                | Business impact                                                              |
| ------------------------------- | ----- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `ENT-LED-001` Lead              | `MVP` | Dedicated `leads` table.                                              | Core guest request and Sales queue are supported.                            |
| `ENT-LED-002` Lead Location     | `MVP` | Origin/destination snapshots are consolidated into Lead.              | Exactly two route points are supported; multi-stop routes wait.              |
| `ENT-LED-003` Lead Cargo Item   | `MVP` | Cargo summary/items are stored as bounded structured Lead data.       | Launch cargo details are retained; reusable cargo inventory waits.           |
| `ENT-LED-004` Lead Add-on       | `MVP` | Selected add-on identifiers and snapshots are consolidated into Lead. | Requested optional services remain visible without a join table.             |
| `ENT-LED-005` Lead Assignment   | `MVP` | Current assignee and assignment timestamps are stored on Lead.        | Assignment history is available through audit rather than a dedicated table. |
| `ENT-LED-006` Lead Status Event | `MVP` | Dedicated `lead_status_history` table.                                | Sales lifecycle history remains immutable and queryable.                     |
| `ENT-LED-007` Lead Note         | `MVP` | Dedicated `lead_notes` table with internal classification.            | Sales and support collaboration is retained.                                 |

### 5.7 Pricing and Approval Policy

| ID / entity                      | Class     | MVP representation or exclusion reason                                                                | Business impact                                                         |
| -------------------------------- | --------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `ENT-PRC-001` Pricing Policy     | `PHASE 2` | Human-reviewed manual quotation is sufficient for launch.                                             | Pricing is less automated and requires trained Sales/Finance staff.     |
| `ENT-PRC-002` Pricing Rule       | `PHASE 2` | No pricing engine in the four-week scope.                                                             | No automatic formula evaluation or rule simulation.                     |
| `ENT-PRC-003` Approval Policy    | `MVP`     | Thresholds and approval requirements are stored in `app_settings`; evidence is captured on Quotation. | Required commercial control remains enforceable without a policy table. |
| `ENT-PRC-004` Price Estimate     | `PHASE 2` | Draft Quotation is the single working commercial record.                                              | Internal estimate-versus-offer analysis is unavailable.                 |
| `ENT-PRC-005` Estimate Component | `PHASE 2` | Depends on Price Estimate and pricing rules.                                                          | No automated factor/component explainability at launch.                 |

### 5.8 Quotation

| ID / entity                          | Class | MVP representation or exclusion reason                                          | Business impact                                                                       |
| ------------------------------------ | ----- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `ENT-QUO-001` Quotation              | `MVP` | Dedicated `quotations` table; each row is one immutable revision after send.    | Commercial offer lifecycle is supported.                                              |
| `ENT-QUO-002` Quotation Version      | `MVP` | Consolidated into Quotation using series, revision, and supersession fields.    | Exact issued revisions remain distinguishable without a second table.                 |
| `ENT-QUO-003` Quotation Line Item    | `MVP` | Dedicated `quotation_items` table.                                              | Itemized bilingual commercial scope is retained.                                      |
| `ENT-QUO-004` Quotation Adjustment   | `MVP` | Represented as a typed Quotation Item with reason and approval metadata.        | Discounts/surcharges remain explicit; a separate adjustment workflow waits.           |
| `ENT-QUO-005` Quotation Approval     | `MVP` | Approval outcome, approver, reason, and time are captured on Quotation.         | MVP supports the configured approval gate; multiple-step approval waits.              |
| `ENT-QUO-006` Quotation Review       | `MVP` | Mandatory Sales reviewer, result, and time are captured on Quotation.           | Final human review remains non-bypassable.                                            |
| `ENT-QUO-007` Quotation Decision     | `MVP` | Verified decision, channel, actor evidence, and time are captured on Quotation. | Customer acceptance/rejection is provable.                                            |
| `ENT-QUO-008` Quotation Status Event | `MVP` | Dedicated `quotation_status_history` table.                                     | Sent, revised, accepted, rejected, expired, and superseded history remains queryable. |

### 5.9 Order

| ID / entity                          | Class | MVP representation or exclusion reason                                                                | Business impact                                                                 |
| ------------------------------------ | ----- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `ENT-ORD-001` Order                  | `MVP` | Dedicated `orders` table.                                                                             | Conversion, tracking, operations, and completion are supported.                 |
| `ENT-ORD-002` Order Service Snapshot | `MVP` | Accepted commercial/service snapshot is stored immutably on Order.                                    | Later catalog or customer changes cannot alter the commitment.                  |
| `ENT-ORD-003` Order Location         | `MVP` | Origin/destination snapshots are consolidated into Order.                                             | Exactly two service locations are supported.                                    |
| `ENT-ORD-004` Order Cargo Item       | `MVP` | Accepted cargo detail is consolidated into the Order snapshot.                                        | Operational scope remains clear; independent item operations wait.              |
| `ENT-ORD-005` Order Add-on           | `MVP` | Accepted add-ons are consolidated into the Order snapshot.                                            | Optional-service commitment remains preserved.                                  |
| `ENT-ORD-006` Order Status Event     | `MVP` | Dedicated `order_status_history` table.                                                               | Customer-safe and internal lifecycle evidence remains available.                |
| `ENT-ORD-007` Order Amendment        | `MVP` | Amendment reason, before/after snapshot, approver, and time are recorded on Order and status history. | One controlled amendment trail is supported; complex amendment aggregates wait. |
| `ENT-ORD-008` Order Cancellation     | `MVP` | Cancellation fields and status event are recorded on Order.                                           | Authorized cancellation is supported without a separate table.                  |

### 5.10 Scheduling and Execution

| ID / entity                          | Class | MVP representation or exclusion reason                                                      | Business impact                                                                      |
| ------------------------------------ | ----- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `ENT-OPS-001` Schedule Revision      | `MVP` | Current schedule plus prior schedule values/reason in Order status history.                 | Schedule changes remain attributable; advanced planning history waits.               |
| `ENT-OPS-002` Execution              | `MVP` | Execution state, actual times, resource snapshots, and operational fields live on Order.    | One execution per order is supported; split/multi-leg execution waits.               |
| `ENT-OPS-003` Execution Assignment   | `MVP` | Assigned staff and resource contact/vehicle snapshots live on Order.                        | No reusable dispatch board or assignment history table.                              |
| `ENT-OPS-004` Execution Status Event | `MVP` | Consolidated into `order_status_history` with event category.                               | Operational progression remains immutable.                                           |
| `ENT-OPS-005` Operational Exception  | `MVP` | Current blocking exception fields and all changes are captured through Order history/audit. | One active exception context is supported; parallel exception case management waits. |
| `ENT-OPS-006` Completion Record      | `MVP` | Completion checks, evidence references, actor, notes, and time are stored on Order.         | Production completion is supported; multiple completion attempts wait.               |

### 5.11 Fleet Resources and Mobile

| ID / entity                              | Class     | Exclusion reason                                                         | Business impact and future phase                                      |
| ---------------------------------------- | --------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `ENT-RES-001` Driver                     | `PHASE 2` | Four-week operations can capture an assigned-driver snapshot on Order.   | No reusable driver master, workload, or history until Phase 2.        |
| `ENT-RES-002` Vehicle                    | `PHASE 2` | Vehicle details can be captured on the Order.                            | No fleet inventory or reuse analytics until Phase 2.                  |
| `ENT-RES-003` Equipment                  | `PHASE 3` | Equipment planning is not required for the approved services at launch.  | Dedicated equipment inventory waits for fleet expansion.              |
| `ENT-RES-004` Resource Availability      | `PHASE 2` | Operations assigns resources manually.                                   | No automated availability or conflict detection until Phase 2.        |
| `ENT-RES-005` Resource Compliance Record | `PHASE 3` | Formal fleet/compliance module requires legal and operational discovery. | Compliance evidence remains an external launch procedure.             |
| `ENT-RES-006` Maintenance Record         | `PHASE 3` | Maintenance management is outside customer-order delivery.               | Fleet maintenance is managed externally until enterprise fleet scope. |

### 5.12 Communications

| ID / entity                           | Class | MVP representation or exclusion reason                                                                                                | Business impact                                                                   |
| ------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `ENT-COM-001` Message Template        | `MVP` | Dedicated `notification_templates` table.                                                                                             | Bilingual transactional content remains governed.                                 |
| `ENT-COM-002` Communication Request   | `MVP` | Dedicated `notifications` row represents one requested send.                                                                          | Business events can enqueue transactional delivery.                               |
| `ENT-COM-003` Communication Recipient | `MVP` | One resolved destination snapshot is stored on Notification.                                                                          | Multi-recipient fan-out uses separate notification rows.                          |
| `ENT-COM-004` Communication Attempt   | `MVP` | Attempt count, latest outcome, provider reference, error, and timestamps are stored on Notification; each manual resend is a new row. | Basic retries and evidence are supported; full attempt ledger follows in Phase 2. |

### 5.13 Customer Support and Verification

| ID / entity                           | Class     | MVP representation or exclusion reason                                                             | Business impact                                                                              |
| ------------------------------------- | --------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `ENT-SUP-001` Support Case            | `MVP`     | Dedicated `support_cases` table.                                                                   | Customer Service can own, resolve, and escalate enquiries.                                   |
| `ENT-SUP-002` Support Case Event      | `PHASE 2` | MVP stores current case state and uses immutable audit evidence for material changes.              | Rich conversation/timeline analytics and multiple case events wait.                          |
| `ENT-SUP-003` Verification Challenge  | `PHASE 2` | MVP uses purpose-bound direct verification, Auth verification, and Order Number + Mobile matching. | No reusable OTP/challenge workflow; sensitive corrections require manual approved procedure. |
| `ENT-SUP-004` Tracking Access Attempt | `MVP`     | Consolidated into `audit_logs` using a privacy-minimized event.                                    | Abuse monitoring and generic denial evidence remain available.                               |

### 5.14 Documents and Evidence

| ID / entity                        | Class | MVP representation or exclusion reason                                            | Business impact                                                                                 |
| ---------------------------------- | ----- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `ENT-DOC-001` Document             | `MVP` | Consolidated into `attachments`.                                                  | File metadata, ownership, status, and access classification are retained.                       |
| `ENT-DOC-002` Document Version     | `MVP` | Each replacement is a new Attachment linked by an optional predecessor reference. | Accepted bytes remain immutable without a version table.                                        |
| `ENT-DOC-003` Document Association | `MVP` | Attachment carries exactly one closed subject kind and subject identity.          | Lead, Quotation, Order, and Support attachments are supported; arbitrary linking is prohibited. |

### 5.15 Events and Integration

| ID / entity                          | Class     | Exclusion reason or MVP representation                                          | Business impact                                                                        |
| ------------------------------------ | --------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `ENT-EVT-001` Domain Event           | `PHASE 2` | A separate canonical event store has no second consumer at launch.              | Integrations and replayable analytics wait; status history/audit remain authoritative. |
| `ENT-EVT-002` Outbox Event           | `PHASE 2` | Notifications are persisted directly in the owning transaction.                 | Generic event publication/replay is unavailable.                                       |
| `ENT-INT-001` Idempotency Record     | `MVP`     | Dedicated `idempotency_keys` table for request submission and Order conversion. | Duplicate retries are safe.                                                            |
| `ENT-INT-002` Integration Connection | `PHASE 3` | No partner/provider integration product scope.                                  | No customer-managed external connections.                                              |
| `ENT-INT-003` External Reference     | `PHASE 3` | Depends on integrations.                                                        | No generic provider identity mapping.                                                  |
| `ENT-INT-004` Inbound Message        | `PHASE 3` | Public/partner inbound APIs and EDI are excluded.                               | External systems cannot command Naqlia directly.                                       |
| `ENT-INT-005` Webhook Subscription   | `PHASE 3` | Public webhook product is excluded.                                             | Partners cannot subscribe to events.                                                   |
| `ENT-INT-006` Webhook Delivery       | `PHASE 3` | Depends on subscriptions and event contracts.                                   | No partner delivery ledger.                                                            |

### 5.16 Workflow Orchestration

| ID / entity                             | Class     | Exclusion reason                                                     | Business impact and future phase                                  |
| --------------------------------------- | --------- | -------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `ENT-WFL-001` Workflow Definition       | `PHASE 3` | Fixed launch workflows are clearer and safer.                        | Admin cannot create new workflows until enterprise orchestration. |
| `ENT-WFL-002` Workflow Version          | `PHASE 3` | Depends on a workflow engine.                                        | Workflow behavior changes require a software release.             |
| `ENT-WFL-003` Workflow Instance         | `PHASE 3` | Lead, Quotation, Order, and Support records already own their state. | No generic orchestration runtime.                                 |
| `ENT-WFL-004` Workflow Task             | `PHASE 3` | Work is assigned directly on domain records.                         | No cross-domain task inbox.                                       |
| `ENT-WFL-005` Workflow Transition Event | `PHASE 3` | Domain status history is sufficient for launch.                      | No separate workflow execution telemetry.                         |

### 5.17 Billing and Payment

| ID / entity                       | Class     | Exclusion reason                                                        | Business impact and future phase                                                  |
| --------------------------------- | --------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `ENT-FIN-001` Billing Account     | `PHASE 3` | Launch is quotation/order management, not accounts receivable.          | No customer credit or billing profile.                                            |
| `ENT-FIN-002` Invoice             | `PHASE 3` | Invoicing and tax evidence require a separately approved finance scope. | Finance works from Quotation/Order commercial snapshots outside Naqlia invoicing. |
| `ENT-FIN-003` Invoice Line        | `PHASE 3` | Depends on Invoice.                                                     | No posted charge ledger.                                                          |
| `ENT-PAY-001` Payment Intent      | `PHASE 3` | Online payment gateway is excluded.                                     | Customers cannot pay online in Naqlia.                                            |
| `ENT-PAY-002` Payment Transaction | `PHASE 3` | Depends on a payment provider.                                          | No authorization/capture/settlement history.                                      |
| `ENT-PAY-003` Payment Allocation  | `PHASE 3` | Invoices and transactions are excluded.                                 | No automated reconciliation.                                                      |
| `ENT-PAY-004` Refund              | `PHASE 3` | Payments are excluded and refund policy is unapproved.                  | Refunds remain outside the platform.                                              |

### 5.18 Audit, Retention, Reporting, and Analytics

| ID / entity                      | Class     | MVP representation or exclusion reason                                                  | Business impact                                                                    |
| -------------------------------- | --------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `ENT-AUD-001` Audit Event        | `MVP`     | Dedicated append-only `audit_logs` table.                                               | Accountable actions, denials, sensitive reads, and tracking abuse are evidenced.   |
| `ENT-AUD-002` Audit Event Detail | `MVP`     | Minimized structured detail is stored on Audit Log with stricter access.                | One table preserves necessary before/after evidence.                               |
| `ENT-AUD-003` Legal Hold         | `PHASE 2` | Launch uses an approved external legal-hold procedure and blocks automated destruction. | No self-service in-product hold administration.                                    |
| `ENT-AUD-004` Legal Hold Target  | `PHASE 2` | Depends on Legal Hold.                                                                  | Hold scope is recorded operationally until Phase 2.                                |
| `ENT-REP-001` Report Definition  | `PHASE 2` | MVP dashboards use reviewed fixed queries.                                              | Admin cannot create/version report definitions.                                    |
| `ENT-REP-002` Report Run         | `PHASE 2` | No asynchronous report engine at launch.                                                | Reporting is on-screen and bounded.                                                |
| `ENT-REP-003` Export Request     | `PHASE 2` | Bulk export adds privacy and delivery risk to the four-week launch.                     | Authorized users cannot generate downloadable bulk exports.                        |
| `ENT-REP-004` Metric Definition  | `PHASE 2` | Launch metrics are documented and calculated from operational records.                  | Metric definitions are not runtime-configurable.                                   |
| `ENT-REP-005` Metric Snapshot    | `PHASE 3` | No warehouse or scheduled analytical projection is justified.                           | Historical analytics rely on operational queries until scale requires projections. |

### 5.19 New Launch Entity

| ID / entity                    | Class | MVP representation                                                                                                    | Business impact                                                                                                                                        |
| ------------------------------ | ----- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ENT-CMS-MVP-001` Content Page | `MVP` | Dedicated `content_pages` table with Arabic/English content, publication state, canonical identity, and SEO metadata. | Resolves the prior domain-model gap for public content and SEO. This ID MUST be promoted into the main Entity Catalog before physical schema approval. |

## 6. Relationship Classification

The following inventory classifies every relationship in Domain Model Suite v1. An MVP relationship may be enforced inside one consolidated record rather than through a separate foreign key. Phase 2 and Phase 3 relationships are excluded with their entities; therefore their joins, cascades, and reference columns MUST NOT be pre-created.

### 6.1 MVP Relationships

| Relationship IDs                                         | MVP realization                                                                                                                                            |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REL-IAM-001`                                            | Supabase Auth user maps to one Profile.                                                                                                                    |
| Sprint 1B compact IAM amendment                          | Profile maps directly to one active fixed Role; Role maps to fixed Permissions through retained grant/assignment records, without Organization Membership. |
| `REL-CUS-001`, `REL-CUS-004`                             | Profile carries one verified Customer link.                                                                                                                |
| `REL-ORD-001`                                            | An accepted Quotation revision converts to at most one Order.                                                                                              |
| `REL-ORD-002`, `REL-ORD-004`–`REL-ORD-010`               | Service snapshot, locations, cargo, add-ons, amendment, cancellation, and operational history are owned by Order.                                          |
| `REL-OPS-001`–`REL-OPS-009`                              | One Order owns its single MVP execution, schedule, assignment snapshots, exception context, completion, status history, and evidence links.                |
| `REL-AUD-001`, `REL-AUD-003`                             | Audit detail and durable target identity are consolidated into Audit Log.                                                                                  |
| `REL-TEN-001`, `REL-CFG-003`                             | Single-company settings resolve directly through `app_settings`.                                                                                           |
| `REL-CAT-001`–`REL-CAT-005`, `REL-CAT-007`–`REL-CAT-009` | Offering, route, add-on, coverage, restriction, customer status, and reason relationships use the three catalog tables plus settings.                      |
| `REL-CUS-002`–`REL-CUS-007`                              | Primary contacts/preferences/consent are Customer or Lead fields; saved addresses remain children.                                                         |
| `REL-LED-001`–`REL-LED-009`                              | Lead references Customer/Offering and owns request snapshots, assignment, status history, notes, and duplicate lineage.                                    |
| `REL-PRC-002`                                            | Configured approval threshold governs approval evidence on Quotation.                                                                                      |
| `REL-QUO-001`–`REL-QUO-003`, `REL-QUO-005`–`REL-QUO-012` | Quotation revision, items, adjustments, approvals, review, decision, history, and source snapshot are retained in the compact Quotation aggregate.         |
| `REL-ORD-003`                                            | Customer has many Orders.                                                                                                                                  |
| `REL-COM-001`, `REL-COM-003`–`REL-COM-005`               | Template-to-send, one recipient snapshot, bounded attempts, and customer destination use templates and notifications.                                      |
| `REL-SUP-001`, `REL-SUP-002`, `REL-SUP-005`              | Support Case references Customer and one business context; tracking telemetry uses audit.                                                                  |
| `REL-DOC-001`–`REL-DOC-003`                              | Each Attachment is one immutable object associated to one closed subject.                                                                                  |
| `REL-INT-001`                                            | Retryable command scope owns Idempotency Keys.                                                                                                             |

### 6.2 Phase 2 Relationships

| Relationship IDs                            | Exclusion reason and impact                                                                                                                                                                                                                     |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REL-TEN-002`, `REL-TEN-003`                | Business-unit hierarchy is deferred; no branch-scoped operations.                                                                                                                                                                               |
| `REL-IAM-002`–`REL-IAM-007`, `REL-IAM-011`  | The original organization-scoped membership, tenant-role, business-unit, and access-review graphs remain deferred. Sprint 1B uses a smaller Profile-level fixed-RBAC adaptation and does not implement these enterprise relationship semantics. |
| `REL-CFG-001`, `REL-CFG-002`                | Definition/version/release graph is deferred; settings publish individually.                                                                                                                                                                    |
| `REL-CAT-006`                               | Dynamic offering qualification-field composition is deferred; intake schema is release-controlled.                                                                                                                                              |
| `REL-CUS-008`, `REL-CUS-009`                | Feedback is deferred; no rating relationship at launch.                                                                                                                                                                                         |
| `REL-PRC-001`, `REL-PRC-003`–`REL-PRC-006`  | Pricing policy, estimate, component, and policy graph are deferred; Quotation is human-authored.                                                                                                                                                |
| `REL-QUO-004`                               | No separate Price Estimate provenance at launch.                                                                                                                                                                                                |
| `REL-RES-002`, `REL-RES-003`                | Driver/Profile linking and resource availability wait for fleet master data.                                                                                                                                                                    |
| `REL-COM-002`                               | Domain Event-triggered communication waits for event/outbox infrastructure; the service writes Notification directly.                                                                                                                           |
| `REL-SUP-003`, `REL-SUP-004`, `REL-SUP-006` | Dedicated Support Case history and reusable verification challenge/target models are deferred; material case changes use audit and approved direct checks are used.                                                                             |
| `REL-EVT-001`, `REL-EVT-002`                | Canonical event/outbox publication is deferred; no replay or generic consumers.                                                                                                                                                                 |
| `REL-AUD-002`                               | Legal-hold graph is deferred; a controlled external procedure protects records.                                                                                                                                                                 |
| `REL-REP-001`–`REL-REP-003`                 | Versioned report/run/export graph is deferred; only fixed bounded dashboards launch.                                                                                                                                                            |

### 6.3 Phase 3 Relationships

| Relationship IDs                            | Exclusion reason and impact                                                                                      |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `REL-TEN-004`, `REL-TEN-005`                | Multi-company connections and shares are enterprise SaaS scope.                                                  |
| `REL-IAM-008`–`REL-IAM-010`, `REL-IAM-012`  | Machine, privileged cross-tenant, and device identity graphs require APIs/mobile/multi-tenancy.                  |
| `REL-RES-001`, `REL-RES-004`, `REL-RES-005` | Organization-owned fleet, compliance, and maintenance graphs wait for enterprise fleet scope.                    |
| `REL-DOC-004`                               | Resource compliance/maintenance evidence links depend on Phase 3 resource entities.                              |
| `REL-INT-002`–`REL-INT-008`                 | Provider connections, mappings, inbound envelopes, webhooks, service principals, and replay are ecosystem scope. |
| `REL-WFL-001`–`REL-WFL-005`                 | Generic workflow version, instance, task, and assignment graphs are excluded.                                    |
| `REL-FIN-001`–`REL-FIN-004`                 | Billing and invoice relationships are excluded with digital finance.                                             |
| `REL-PAY-001`–`REL-PAY-005`                 | Payment, allocation, refund, and target relationships are excluded.                                              |
| `REL-REP-004`                               | Metric snapshots/warehouse projections are advanced analytics scope.                                             |

### 6.4 Exact Relationship Traceability Index

This index is the authoritative item-by-item classification; the preceding tables explain the grouped decision.

| Class     | Count | Exact relationship IDs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MVP`     |    71 | `REL-IAM-001`, `REL-CUS-001`, `REL-ORD-001`, `REL-ORD-002`, `REL-OPS-001`, `REL-OPS-002`, `REL-AUD-001`, `REL-TEN-001`, `REL-CAT-001`, `REL-CAT-002`, `REL-CAT-003`, `REL-CAT-004`, `REL-CAT-005`, `REL-CAT-007`, `REL-CAT-008`, `REL-CAT-009`, `REL-CFG-003`, `REL-CUS-002`, `REL-CUS-003`, `REL-CUS-004`, `REL-CUS-005`, `REL-CUS-006`, `REL-CUS-007`, `REL-LED-001`, `REL-LED-002`, `REL-LED-003`, `REL-LED-004`, `REL-LED-005`, `REL-LED-006`, `REL-LED-007`, `REL-LED-008`, `REL-LED-009`, `REL-PRC-002`, `REL-QUO-001`, `REL-QUO-002`, `REL-QUO-003`, `REL-QUO-005`, `REL-QUO-006`, `REL-QUO-007`, `REL-QUO-008`, `REL-QUO-009`, `REL-QUO-010`, `REL-QUO-011`, `REL-QUO-012`, `REL-ORD-003`, `REL-ORD-004`, `REL-ORD-005`, `REL-ORD-006`, `REL-ORD-007`, `REL-ORD-008`, `REL-ORD-009`, `REL-ORD-010`, `REL-OPS-003`, `REL-OPS-004`, `REL-OPS-005`, `REL-OPS-006`, `REL-OPS-007`, `REL-OPS-008`, `REL-OPS-009`, `REL-COM-001`, `REL-COM-003`, `REL-COM-004`, `REL-COM-005`, `REL-SUP-001`, `REL-SUP-002`, `REL-SUP-005`, `REL-DOC-001`, `REL-DOC-002`, `REL-DOC-003`, `REL-INT-001`, `REL-AUD-003` |
| `PHASE 2` |    32 | `REL-TEN-002`, `REL-TEN-003`, `REL-IAM-002`, `REL-IAM-003`, `REL-IAM-004`, `REL-IAM-005`, `REL-IAM-006`, `REL-IAM-007`, `REL-IAM-011`, `REL-CFG-001`, `REL-CFG-002`, `REL-CAT-006`, `REL-CUS-008`, `REL-CUS-009`, `REL-PRC-001`, `REL-PRC-003`, `REL-PRC-004`, `REL-PRC-005`, `REL-PRC-006`, `REL-QUO-004`, `REL-RES-002`, `REL-RES-003`, `REL-COM-002`, `REL-SUP-003`, `REL-SUP-004`, `REL-SUP-006`, `REL-EVT-001`, `REL-EVT-002`, `REL-AUD-002`, `REL-REP-001`, `REL-REP-002`, `REL-REP-003`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `PHASE 3` |    32 | `REL-TEN-004`, `REL-TEN-005`, `REL-IAM-008`, `REL-IAM-009`, `REL-IAM-010`, `REL-IAM-012`, `REL-RES-001`, `REL-RES-004`, `REL-RES-005`, `REL-DOC-004`, `REL-INT-002`, `REL-INT-003`, `REL-INT-004`, `REL-INT-005`, `REL-INT-006`, `REL-INT-007`, `REL-INT-008`, `REL-WFL-001`, `REL-WFL-002`, `REL-WFL-003`, `REL-WFL-004`, `REL-WFL-005`, `REL-FIN-001`, `REL-FIN-002`, `REL-FIN-003`, `REL-FIN-004`, `REL-PAY-001`, `REL-PAY-002`, `REL-PAY-003`, `REL-PAY-004`, `REL-PAY-005`, `REL-REP-004`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

All 135 `REL-*` identifiers from the approved Relationship Matrix are present exactly once in this index. `Content Page` has no required business foreign key in MVP; creator/updater Profiles are accountable references.

## 7. Business Capability Classification

| Capability                                                          | Class     | Launch boundary or deferral impact                                                                       |
| ------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| Bilingual public service discovery                                  | `MVP`     | Published Content Pages, Offerings, Add-ons, and Coverage drive Arabic-first discovery.                  |
| Guest Request                                                       | `MVP`     | Creates Customer + Lead without requiring Auth.                                                          |
| Customer Account                                                    | `MVP`     | Email, Google, and Apple are handled by Supabase Auth; Profile links to one verified Customer.           |
| Lead qualification and assignment                                   | `MVP`     | Sales owns status, assignee, notes, and qualification result.                                            |
| Human-authored hybrid Quotation                                     | `MVP`     | Sales composes items; Finance approval is captured when required; mandatory Sales review remains.        |
| Automated pricing/estimate engine                                   | `PHASE 2` | Manual effort remains; no instant or autonomous final price.                                             |
| Quotation revision and decision                                     | `MVP`     | Immutable revision rows, status history, verified accept/reject.                                         |
| Order conversion                                                    | `MVP`     | Idempotent one-to-one conversion with immutable accepted snapshot.                                       |
| Scheduling and execution                                            | `MVP`     | One execution per Order, manual resource snapshots, exceptions, and completion.                          |
| Fleet/resource master and dispatch board                            | `PHASE 2` | Assignments are manually captured on Orders.                                                             |
| Fleet compliance, maintenance, and field mobile                     | `PHASE 3` | Managed externally; no native/offline field workflow.                                                    |
| Attachments and completion evidence                                 | `MVP`     | One immutable attachment record per stored object and subject.                                           |
| Transactional Notifications                                         | `MVP`     | Bilingual templates, persisted sends, provider status, bounded retry.                                    |
| Marketing, rich preferences, push, and multi-provider orchestration | `PHASE 2` | Launch supports transactional email/SMS only.                                                            |
| Public Order tracking                                               | `MVP`     | Order Number + normalized Mobile Number, generic denial, minimized result, rate limit, audit.            |
| Customer support cases                                              | `MVP`     | Case ownership, context, escalation, resolution, and audit.                                              |
| Reusable verification challenges                                    | `PHASE 2` | Direct purpose-bound checks and Auth verification are used.                                              |
| Content Pages                                                       | `MVP`     | Draft/published bilingual page lifecycle.                                                                |
| SEO                                                                 | `MVP`     | Per-locale title/description, canonical path, indexing controls, sitemap eligibility, social metadata.   |
| Admin Management                                                    | `MVP`     | Manage staff status/role, settings, catalog, templates, content, Leads, Quotations, Orders, and support. |
| Custom RBAC and business-unit scope                                 | `PHASE 2` | Five fixed roles only.                                                                                   |
| Configuration release bundles and workflow                          | `PHASE 2` | Settings are individually versioned and audited.                                                         |
| Fixed operational dashboards                                        | `MVP`     | Bounded queries over launch tables; no report-builder or exports.                                        |
| Report builder, exports, metric definitions                         | `PHASE 2` | Operators use fixed dashboards.                                                                          |
| Event/outbox platform                                               | `PHASE 2` | Notification jobs are persisted directly; no generic integration stream.                                 |
| Public APIs, webhooks, partner integrations                         | `PHASE 3` | Browser product and internal services only.                                                              |
| Multi-company SaaS                                                  | `PHASE 3` | One Naqlia company; no tenant onboarding/white-labeling.                                                 |
| Workflow engine                                                     | `PHASE 3` | Fixed aggregate transitions only.                                                                        |
| Invoicing, payments, refunds, accounting                            | `PHASE 3` | Commercial records stop at Quotation/Order.                                                              |
| Advanced analytics/warehouse/AI optimization                        | `PHASE 3` | Operational records and audit provide future source data.                                                |

## 8. Selection Summary

| Inventory                 | MVP | Phase 2 | Phase 3 | Total |
| ------------------------- | --: | ------: | ------: | ----: |
| Existing logical entities |  62 |      31 |      28 |   121 |
| New launch entities       |   1 |       0 |       0 |     1 |
| Existing relationships    |  71 |      32 |      32 |   135 |

The 63 MVP logical entities are implemented through **22 application tables** plus managed Supabase Auth. They are either dedicated or deliberately consolidated into those tables. Phase 2 improves operational efficiency and configurability after launch evidence exists. Phase 3 introduces enterprise SaaS, ecosystem, finance, workflow, mobile, and advanced data capabilities.

The principal launch trade-off is increased manual work for Sales and Operations in exchange for a smaller, more testable schema. No trade-off permits bypassing authorization, mandatory Sales review, accepted-quotation immutability, idempotent conversion, tracking privacy, bilingual publication, or audit evidence.

## 9. Promotion Rule

Before any Phase 2 or Phase 3 entity is implemented, Product MUST approve the business outcome and update this selection, the main Domain Model Suite, the physical database design, RLS matrix, audit/retention model, test plan, migration plan, and rollback plan. Empty speculative tables are prohibited.
