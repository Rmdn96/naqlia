# Naqlia Four-Week MVP Implementation Roadmap

| Document field    | Value                                                      |
| ----------------- | ---------------------------------------------------------- |
| Suite             | Production MVP Scope                                       |
| Status            | Approved implementation plan; documentation only           |
| Version           | 1.0.0                                                      |
| Effective date    | 2026-08-03                                                 |
| Delivery window   | Four weeks / 20 working days                               |
| Database boundary | [MVP Database Scope](./02-MVP-Database-Scope.md)           |
| Owners            | Product, Engineering, Security, QA, Design, and Operations |

## 1. Objective

Launch the smallest safe, maintainable Naqlia product that allows a real customer in the approved geography to discover a bilingual service, submit a guest or account request, receive a human-reviewed Quotation, approve it, receive an Order, receive transactional updates, and track completion—while internal staff operate the journey through fixed, least-privilege roles.

The four-week target is achievable only through strict scope control, early vertical integration, daily acceptance, and no speculative enterprise infrastructure. This roadmap authorizes planning; it does not create SQL, migrations, Supabase resources, APIs, pages, components, or backend code.

## 2. Launch Scope Contract

The release includes:

- Arabic-first and English-equivalent public discovery and transactional content;
- guest request and optional Email/Google/Apple customer account;
- one company, one operating workspace, and five fixed staff roles;
- the four approved Cargo Service/Route Class combinations and two add-ons;
- Lead qualification, notes, assignment, and lifecycle;
- human-authored Quotation revisions, configured approval, mandatory Sales review, and verified decision;
- idempotent Order conversion, accepted snapshot, scheduling, one execution, exception context, cancellation, and completion;
- secure Order Number + Mobile Number tracking;
- attachments, transactional notifications, support cases, settings, Content Pages, SEO, and immutable Audit Logs; and
- production security, accessibility, performance, recovery, monitoring, and release evidence.

The release excludes configurable RBAC, organization tenancy, pricing engine, fleet master, native mobile, general workflow/event platforms, payments/invoices, public APIs/integrations, report builder/exports, and advanced analytics.

## 3. Delivery Principles

1. Build one end-to-end journey in deployable slices; do not complete isolated layers that cannot be accepted.
2. The 22-table boundary is frozen. A new table requires removal/consolidation of another table or formal scope escalation.
3. Every slice includes Arabic/English, authorization denials, audit, errors, retries, observability, and tests from the start.
4. Use managed platform capabilities for Auth, storage, delivery providers, deployment, logs, and backups where approved.
5. Manual business operations are acceptable only when they use an explicit authorized workflow and do not bypass lifecycle, audit, or privacy controls.
6. Feature flags may pause intake, Quotation sending, conversion, or notifications, but cannot weaken security or alter recorded facts.
7. Daily integration to a production-like environment is mandatory from Week 1.

## 4. Preconditions Before Day 1

The delivery clock begins only when the following are named, approved, and available:

- Product owner and launch decision authority;
- Engineering lead, frontend/backend ownership, QA ownership, and production on-call owner;
- UI/UX flows and bilingual content for all launch states;
- physical design derived from the 22 domain-table scope plus the four approved Sprint 1B identity control tables, including migrations and rollback order;
- Supabase environments, Auth provider credentials, redirect allowlists, email/SMS provider, and storage policy;
- RLS/authorization matrix for guest, customer, five staff roles, and trusted server work;
- field classification, privacy purpose, retention, anonymization, and incident contacts;
- approved catalog, coverage, terms, consent/privacy versions, notification templates, status labels, reason lists, pricing/approval values, support details, and SEO metadata;
- target SLOs, performance/load profile, backup/restore objectives, and pilot success thresholds; and
- a prioritized defect policy and daily acceptance availability from Sales, Operations, Finance, Customer Service, and Super Admin representatives.

If a prerequisite is missing, it is a launch blocker rather than a silent technical default.

## 5. Table Delivery Batches

| Batch                         | Tables                                                                                                          | Why this batch is atomic                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| A — Trust foundation          | `profiles`, `app_settings`, `audit_logs`, `idempotency_keys`                                                    | Identity, configuration, accountability, and retry safety must exist before business mutations. |
| B — Discovery foundation      | `service_offerings`, `service_add_ons`, `coverage_areas`, `content_pages`, `notification_templates`             | Public discovery and launch values must be bilingual, publishable, and testable before intake.  |
| C — Intake and customer       | `customers`, `customer_addresses`, `leads`, `lead_notes`, `lead_status_history`, `attachments`, `notifications` | Produces one complete guest/account Lead slice with evidence and acknowledgement.               |
| D — Commercial and operations | `quotations`, `quotation_items`, `quotation_status_history`, `orders`, `order_status_history`, `support_cases`  | Completes the reviewed commercial offer, Order lifecycle, tracking, and support outcome.        |

No batch is considered done merely because storage exists. Each exits through its vertical acceptance evidence.

## 6. Four-Week Plan

### Week 1 — Trust, Physical Design, Discovery, and Administration

**Outcome:** a deployable bilingual foundation where approved staff can manage launch catalog/content/settings through fixed roles and all privileged actions are audited.

| Day | Primary outcomes                                                                                                                                                               | Required evidence                                                                                                            |
| --: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
|   1 | Freeze 22-table physical model; approve lifecycle/status lists, field classification, retention, RLS matrix, migration order, rollback, seed ownership, and test traceability. | Signed physical-design review; no unresolved business field or ownership question.                                           |
|   2 | Establish isolated development/preview/production configuration; implement Batch A migrations and generated contracts; connect managed Auth without duplicating credentials.   | Migration up/down rehearsal; environment isolation; secret scan; Profile/Auth mapping tests.                                 |
|   3 | Implement fixed-role authorization and negative tests; append-only Audit Log contract; Idempotency contract; protected Admin shell/permissions.                                | Cross-role denial suite, customer/staff separation, privileged change audit, retry-conflict tests.                           |
|   4 | Implement Offerings, Add-ons, Coverage, Settings, and bilingual publication validation.                                                                                        | All four service combinations, two add-ons, Riyadh-local and Riyadh-outbound eligibility tests; no hardcoded business value. |
|   5 | Implement Content Page/SEO and Notification Template administration; deploy the first production-like vertical slice.                                                          | Arabic/RTL and English/LTR review, accessibility smoke, metadata/indexing checks, audit and rollback demonstration.          |

**Week 1 gate:** Super Admin can activate/suspend staff, govern the approved allowlisted settings/catalog/templates/content, preview both locales, publish valid values, and roll back through an audited operation. Unauthorized roles and customers are denied.

### Week 2 — Guest Request, Customer Account, Lead, Files, and Acknowledgement

**Outcome:** a real customer can submit exactly one eligible bilingual request as a guest or through an optional account, and Sales can qualify it.

| Day | Primary outcomes                                                                                                                                  | Required evidence                                                                                                          |
| --: | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
|   6 | Implement Customer and Profile linking flow; Email/Google/Apple account paths; conflict-safe verified linking; saved addresses.                   | Guest remains supported; provider-link conflict, account closure, and unauthorized-history tests.                          |
|   7 | Implement eligibility and complete guest request capture with normalized Mobile, route/cargo/add-on snapshots, consent evidence, and Idempotency. | Duplicate/retry/concurrent submission tests; invalid/out-of-scope route tests; bilingual validation.                       |
|   8 | Implement Sales Lead queue, assignment, qualification, status history, notes, search/filter/pagination, and fixed-role boundaries.                | Allowed transition suite; stale update rejection; Sales/Customer Service/other-role field-denial tests.                    |
|   9 | Implement Attachment metadata/upload/scan/access lifecycle and restricted association rules.                                                      | Unauthorized subject/file tests, quarantine tests, integrity/size/media limits, retention evidence.                        |
|  10 | Implement persisted transactional Notification send/retry for request acknowledgement; run the complete discovery-to-qualified-Lead slice.        | Provider failure/retry/idempotency, Arabic/English template snapshots, no sensitive leakage, mobile/a11y journey evidence. |

**Week 2 gate:** an anonymous Arabic or English customer can submit an eligible request exactly once, optionally create/link an account safely, receive an acknowledgement, and Sales can qualify or close the resulting Lead with full history and audit.

### Week 3 — Quotation, Order, Operations, Tracking, and Support

**Outcome:** the full commercial and operational lifecycle works with human accountability and privacy-safe tracking.

| Day | Primary outcomes                                                                                                                                   | Required evidence                                                                                                        |
| --: | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
|  11 | Implement Quotation revisions/items/totals/validity and bilingual terms snapshots.                                                                 | Reconciliation/rounding/tax-context tests; issued-revision immutability; revision sequencing.                            |
|  12 | Implement configured Finance approval, mandatory Sales review, issue, expiry/supersession, verified accept/reject, and Notifications.              | Approval threshold, separation-of-duties, stale/concurrent decision, delivery-failure, and expiry tests.                 |
|  13 | Implement idempotent accepted-Quotation-to-Order conversion and immutable accepted service/commercial snapshot.                                    | Exactly-one conversion under retry/concurrency; lineage and snapshot immutability; invalid-source denial.                |
|  14 | Implement scheduling, assignment snapshots, execution start/progress, one blocking exception context, cancellation, completion, and Order history. | Allowed-transition matrix; schedule revision; blocking exception; authorized override; cancellation/completion evidence. |
|  15 | Implement public tracking and Support Cases; exercise the full Visitor-to-Completed journey.                                                       | Order Number + Mobile exact match, generic denial, rate limit/abuse audit, minimized fields, support role boundaries.    |

**Week 3 gate:** an approved current Quotation converts once to an Order; Operations schedules, executes, handles an exception, and completes it; the customer receives updates and sees only approved tracking fields; Customer Service resolves an enquiry without commercial or operational privilege escalation.

### Week 4 — Hardening, Pilot Readiness, Release, and Observation

**Outcome:** the complete MVP is production-ready and can be safely enabled for a controlled real-customer pilot.

| Day | Primary outcomes                                                                                                                                         | Required evidence                                                                                   |
| --: | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
|  16 | End-to-end regression for all four service combinations, both add-ons, guest/account, both locales, and all five staff roles.                            | Requirements traceability; no untested critical path or role boundary.                              |
|  17 | Security/privacy hardening: threat cases, RLS/authorization, enumeration, upload abuse, CSRF/session, input/output safety, secret and dependency review. | No open critical/high release issue; denial and incident signals verified.                          |
|  18 | Performance, accessibility, SEO, resilience, failure/retry/concurrency, backup/restore, migration/rollback, and observability exercises.                 | Approved targets met; WCAG 2.2 AA evidence; Core Web Vitals/SEO checks; restore and rollback proof. |
|  19 | Production data/configuration review, staff training, operational rehearsal, support/on-call runbooks, legal/content approval, and pilot UAT.            | Named owner acceptance; seeded values reconciled; emergency pause/recovery demonstrated.            |
|  20 | Go/no-go review, controlled production enablement, smoke tests, monitoring, and defined observation window.                                              | Signed release record; production journey proof; alerts/on-call active; rollback authority present. |

**Week 4 gate:** all launch criteria pass in production-like conditions, production configuration is explicitly approved, responsible business owners accept the workflow, and the go/no-go authority authorizes the controlled release.

## 7. Parallel Workstreams

| Workstream          | Continuous responsibility                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| Product/Operations  | Fast decisions, scope freeze, catalog/pricing/coverage/status/reason values, acceptance, pilot readiness.    |
| UX/Content          | Arabic-first flows, English parity, RTL/LTR, error/empty/loading/success states, accessible content, SEO.    |
| Data/Backend        | Physical model, migrations, constraints, service boundaries, idempotency, concurrency, audit, notifications. |
| Frontend            | Public, customer, and Admin journeys; role-safe presentation; responsive/accessibility behavior.             |
| Security/Privacy    | Threat model, Auth/RLS, field minimization, abuse controls, storage, audit, retention, incident gates.       |
| QA                  | Traceability, automated pyramid, role/negative tests, locale/browser/device matrix, end-to-end evidence.     |
| Platform/Operations | CI/CD, environments, secrets, monitoring, backups, restore, rollback, runbooks, release observation.         |

Each workstream integrates daily. Handoffs that postpone security, localization, accessibility, or testing to Week 4 violate this plan.

## 8. Mandatory Test Portfolio

### 8.1 Business journey

- all four Cargo Service/Route Class combinations and both add-ons;
- eligible Riyadh-local and Riyadh-outbound routes plus every excluded direction class;
- guest and linked-account request paths;
- Lead qualification/unqualification/duplicate/closure;
- Quotation draft/revision/approval/review/send/expire/supersede/accept/reject;
- one successful Order conversion under concurrent/repeated requests;
- schedule/revision/start/progress/exception/override/cancel/complete;
- transactional Notification success/failure/retry/resend; and
- tracking success/denial and Support Case escalation/resolution.

### 8.2 Authorization and privacy

- customer, guest, each staff role, suspended/revoked profile, and trusted-server boundaries;
- horizontal record access and field-level leakage attempts;
- customer-account conflict and unauthorized guest-history claim;
- public tracking enumeration, normalized-mobile mismatch, rate limit, and indistinguishable denial;
- Attachment subject spoofing, unsafe file, quarantine, and direct-object access;
- configuration/content/template publication and role escalation denial; and
- proof that sensitive successes and denials create minimized Audit Logs.

### 8.3 Integrity and resilience

- lifecycle transition validity and stale revision rejection;
- Quotation/line reconciliation and issued immutability;
- accepted snapshot stability after catalog/customer/settings changes;
- state plus status-history atomicity;
- duplicate/retry/idempotency fingerprint conflict;
- provider timeouts, delayed callbacks, notification retry exhaustion;
- deployment migration/rollback, backup/restore, and partial-failure recovery; and
- no orphaned Attachment, history, Notification, or Support Case reference.

### 8.4 Product quality

- Arabic default, RTL, English LTR, locale switching, bidi identifiers, and content parity;
- keyboard, screen-reader, focus, contrast, zoom/reflow, target size, and error association against WCAG 2.2 AA;
- supported mobile and desktop browsers under realistic network conditions;
- approved latency/load targets and Core Web Vitals;
- canonical, metadata, robots, sitemap, structured data, and noindex protection; and
- logs/metrics/traces/alerts contain correlation but no unnecessary personal data or secrets.

## 9. Definition of Ready Per Slice

A slice may enter implementation only when it has:

- named outcome, owner, actors, records, lifecycle, and acceptance authority;
- approved fields, classification, retention, relationships, and migration/rollback design;
- linked requirements, business rules, stories, and test cases;
- Arabic/English journey/content and accessibility states;
- permission/RLS and abuse-case matrix;
- errors, idempotency, concurrency, notification, and observability behavior;
- dependencies and external-provider ownership; and
- no unresolved business question that would change the data model or customer outcome.

## 10. Definition of Done Per Slice

A slice is Done only when:

- implementation, migration, rollback, and operational documentation are reviewed;
- automated unit/integration/authorization/end-to-end tests and required manual evidence pass;
- Arabic/English, RTL/LTR, accessibility, responsive, SEO where public, performance, security, privacy, audit, and observability requirements pass;
- invalid, unauthorized, duplicate, stale, concurrent, timeout, failure, and recovery paths pass;
- production configuration contains no unapproved default or hardcoded business value;
- dashboards, alerts, runbooks, support ownership, and rollback are operational; and
- Product and the responsible business owner accept the evidence.

## 11. Go/No-Go Criteria

Release is `GO` only when:

- no critical/high security, privacy, integrity, accessibility, or reliability defect is open;
- the end-to-end journey passes for both locales and the complete service matrix;
- Auth, role denials, tracking privacy, upload safety, audit, and idempotency have explicit evidence;
- approved configuration/content/templates are present and reconciled in production;
- backups, restore, rollback, emergency intake/notification pause, monitoring, alerting, and on-call are proven;
- Sales, Operations, Finance, Customer Service, Super Admin, Product, Engineering, Security, and QA owners accept readiness; and
- the pilot population, observation window, success/stop thresholds, and rollback authority are named.

Any unmet mandatory criterion produces `NO-GO`; schedule pressure is not an exception.

## 12. Four-Week Scope Controls

The following requests are automatically deferred unless required to fix a launch blocker:

- a 23rd–25th table that is not already in the approved contingency budget;
- custom roles, permissions, organizations, branches, workflow builder, event bus, or general-purpose configuration framework;
- dynamic forms, pricing automation, multi-step approvals, multi-execution Orders, dispatch optimization, or resource availability;
- marketing automation, push, chat, multi-provider orchestration, or report exports;
- payment, invoice, partner API, webhook, native mobile, AI decisioning, or advanced analytics; and
- cosmetic customization that displaces accessibility, security, bilingual parity, testing, monitoring, or recovery.

A change request states customer outcome, urgency, removed work, table/field impact, security/privacy impact, test impact, owner, and go/no-go consequence. Additions without an equal trade-off are rejected for MVP.

## 13. Risk Register

| Risk                                  | Early signal                                                                  | Mitigation and decision                                                                                                                 |
| ------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Four-week scope exceeds team capacity | Week 1 foundation or daily vertical integration slips                         | Remove convenience, reporting, or admin polish; never remove lifecycle/security/audit gates.                                            |
| Business values arrive late           | Placeholder catalog, pricing, terms, or bilingual content remains after Day 3 | Product owner resolves or delays launch; do not seed silent defaults.                                                                   |
| OAuth/provider approval delay         | Email/Google/Apple production credentials unavailable by Day 2                | Guest remains primary; any unavailable provider is excluded transparently from release unless the approved account requirement changes. |
| Manual pricing causes errors          | Reconciliation defects or approval ambiguity                                  | Quotation line validation, totals reconciliation, Finance threshold gate, mandatory Sales review, training.                             |
| Consolidated Order becomes ambiguous  | Competing execution/exception/amendment requirements appear                   | Enforce one execution and one active exception; defer multi-leg or parallel workflows to Phase 2.                                       |
| Notification provider instability     | Delivery failures/retries exceed threshold                                    | Persist every send, bounded retry, operational alert, approved fallback/manual contact without changing business state.                 |
| Tracking enumeration/privacy leak     | High denied lookup volume or inconsistent error paths                         | Generic response, dual exact match, rate limit, minimized fields, audit/alert, security review.                                         |
| Bilingual/content defects             | Missing English/Arabic or RTL issues at publication                           | Block publication; daily locale review and automated completeness checks.                                                               |
| Production migration/rollback fails   | Rehearsal exceeds recovery target                                             | Stop release, correct migration/backup/rollback, repeat restore proof.                                                                  |
| Enterprise model leaks into MVP       | New generic tables/interfaces appear                                          | Architecture review rejects speculative abstractions and enforces the 22-table registry.                                                |

## 14. Phase 2 Roadmap — Operational Maturity

Phase 2 begins only after launch data and operational owners identify a measurable bottleneck. Candidate outcomes, in priority order:

1. configurable roles/permissions, business units, and in-product access reviews;
2. configuration definitions, atomic releases, and richer rollback;
3. dynamic qualification fields and reusable restriction models;
4. pricing policies/rules, internal estimates, components, and explainable approval policy;
5. driver/vehicle masters, availability, assignment history, and normalized Execution/exception/completion records;
6. customer feedback, richer communication preferences, attempt history, reusable verification challenges, and Support Case event timeline;
7. canonical domain events/outbox where multiple consumers exist; and
8. report definitions/runs, controlled exports, metric definitions, and in-product legal holds.

Promotion requires measured need, revised domain/database/RLS/audit documents, data migration, backward compatibility, tests, and rollback. Phase 2 is not an automatic schema normalization exercise.

## 15. Phase 3 Roadmap — Enterprise Platform

Phase 3 requires a separately approved product/business case and includes:

- Organization tenancy, tenant onboarding, connections/shares, platform access, and cross-tenant controls;
- service principals, public APIs, integrations, inbound messages, external references, webhooks, and partner ecosystem;
- native/offline mobile identity and workflows;
- configurable workflow definitions, versions, instances, tasks, and transition history;
- equipment, compliance, maintenance, advanced fleet/dispatch, route optimization, and telematics;
- billing accounts, invoices, payment gateway, transactions, allocations, refunds, and accounting integration;
- analytics projections/warehouse, optimization, and governed AI assistance; and
- subscriptions, white-labeling, tenant domains, and SaaS administration where approved.

Before the second company is onboarded, every applicable record must be assigned to a verified Organization, referential tenant integrity and RLS must be proven, and cross-tenant negative tests must pass.

## 16. Completion Statement

The four-week MVP is complete only when the full approved journey operates safely for real pilot customers in production, the 22-table data model preserves required business and audit evidence, every mandatory quality gate passes, business owners accept ongoing operation, and a named authority can pause or roll back the service without data loss or security bypass.
