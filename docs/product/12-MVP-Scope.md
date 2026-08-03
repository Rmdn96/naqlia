# Naqlia MVP Scope

| Document field | Value                                                                              |
| -------------- | ---------------------------------------------------------------------------------- |
| Suite          | Product Documentation Suite (PDS) v1                                               |
| Status         | Approved product scope baseline                                                    |
| Version        | 1.0.0                                                                              |
| Parent         | [Business Requirements Specification](./01-Business-Requirements-Specification.md) |
| Owners         | Product and Engineering leadership                                                 |

## 1. Purpose

This document defines the minimum complete product outcome for Naqlia MVP, including boundaries, release slices, dependencies, readiness gates, evidence, and explicit exclusions. It is a scope contract, not authorization to begin implementation without the Constitution's Definition of Ready.

## 2. MVP Outcome

The MVP proves that a customer in the approved geography can request an eligible transport service in Arabic or English without being forced to create an account; Naqlia can qualify the Lead, prepare and human-review a hybrid Quotation, receive a verified decision, convert approval into an Order, schedule and execute it, and expose privacy-safe status tracking through Order Number + Mobile Number.

The operating model is one Naqlia-managed service workspace with internal Sales, Operations, Finance, Customer Service, and Super Admin roles. The architecture remains tenant-capable, but self-service SaaS tenant onboarding and logistics-company workspaces are not MVP product capabilities.

## 3. Approved MVP Boundaries

| Boundary            | MVP definition                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------ |
| Market              | Kingdom of Saudi Arabia                                                                    |
| Local geography     | Both endpoints within enabled Riyadh coverage                                              |
| Intercity geography | Origin within enabled Riyadh coverage; destination in an enabled Saudi city outside Riyadh |
| Cargo Services      | Furniture Moving; General Cargo Transport                                                  |
| Route Classes       | Local Transport; Intercity Transport                                                       |
| Optional services   | Packing; Loading & Unloading as non-standalone add-ons                                     |
| Quotation           | Hybrid calculation/guidance with mandatory Sales review of every final version             |
| Customer identity   | Guest request supported; account optional through Email, Google, Apple                     |
| Internal roles      | Super Admin, Sales, Operations, Finance, Customer Service                                  |
| Lifecycle           | Visitor → Lead → Quotation → Approved → Order → Execution → Completed                      |
| Tracking            | Exact Order Number + matching Mobile Number; privacy-minimized status                      |
| Languages           | Arabic default/RTL; English secondary/LTR; functional parity                               |
| Business values     | Governed Admin Panel configuration; no hardcoded commercial/operating values               |

## 4. In-Scope Capabilities

### 4.1 Customer and Guest

- discover enabled Core Services, route coverage guidance, and add-ons;
- select exactly one Cargo Service and Route Class plus eligible add-ons;
- submit a valid request as a guest without account creation;
- optionally register/sign in using Email, Google, or Apple under one identity policy;
- receive Lead acknowledgement and respond through verified configured channels;
- receive, understand, accept, or reject the exact current Quotation version;
- receive an Order Number and customer-safe lifecycle communications;
- track own Order with Order Number + Mobile Number; and
- contact support through configured, identity-safe paths.

### 4.2 Sales

- receive, assign, review, clarify, qualify, unqualify, and close Leads;
- prepare hybrid price guidance and complete customer Quotation line items;
- request and observe configured commercial approvals;
- perform the mandatory final Sales review;
- issue, supersede, expire/cancel under policy, and record customer decision for Quotations;
- convert an approved current Quotation into exactly one Order; and
- view commercial funnel and work-queue reporting within permissions.

### 4.3 Operations

- receive an unambiguous accepted Order snapshot;
- verify operational readiness, schedule/revise schedule, and assign enabled resources/context;
- start and update Execution;
- open, own, resolve, and communicate operational exceptions through approved paths;
- record completion evidence and complete or cancel under policy; and
- view operational work queues and service outcomes within permissions.

### 4.4 Finance

- review commercial facts required for configured approval;
- approve/reject/return price exceptions within delegated authority;
- govern price, tax, currency, adjustment, and approval configuration through separated permissions; and
- view/export approved financial/commercial reports within field and purpose limits.

Online payment, invoicing, refunds, settlement, and accounting integration are excluded.

### 4.5 Customer Service

- verify a customer using the approved method;
- view customer-safe request, Quotation, Order, communication, and status context;
- create, own, resolve, and escalate support cases;
- retry/resend an unchanged approved communication where policy permits; and
- request/perform only explicitly permitted corrections with evidence.

### 4.6 Super Admin

- govern users, roles, permission scope, localized catalog/content, coverage, price configuration, reason codes, lifecycle projection, templates, release settings, and reporting definitions through approved workflows;
- preview, approve/publish where authorized, schedule, retire, and roll back configuration;
- inspect system health/audit within purpose-bound permissions; and
- perform approved recovery actions without bypassing lifecycle, RLS, review, approval, or audit.

## 5. Required Platform Qualities

MVP scope includes, not defers:

- strict authorization and tenant/workspace isolation;
- immutable/auditable lifecycle, approval, Quotation, configuration, and sensitive-access evidence;
- privacy, consent, retention, and data-subject procedures approved for launch;
- secure public tracking with enumeration resistance and generic denial;
- idempotent submission/conversion and concurrency-safe transitions;
- Arabic/RTL and English/LTR parity, localized content/configuration, and timezone/currency handling;
- WCAG 2.2 AA and supported mobile/desktop browser behavior;
- SEO controls for public discovery surfaces and noindex/private controls for protected journeys;
- defined performance, availability, recovery, monitoring, alerting, support, and incident runbooks;
- CI quality/security gates and production release/rollback evidence; and
- traceability from BRS → FR/NFR → stories → acceptance criteria → tests → release.

## 6. End-to-End MVP Thin Slices

Implementation SHOULD deliver independently demonstrable vertical outcomes rather than disconnected technical layers.

| Slice                                     | Demonstrable outcome                                                                                              | Entry dependencies                                                          | Exit evidence                                                                     |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1. Governed catalog and access foundation | Authorized staff can safely configure and preview bilingual MVP catalog/coverage; actors are denied outside scope | Approved physical architecture/data/security design; identity configuration | Permission negatives, audit, localization, rollback, configuration validation     |
| 2. Guest request to qualified Lead        | Arabic/English guest submits an eligible request exactly once and Sales qualifies it                              | Slice 1; privacy/consent/content decisions                                  | Mobile/a11y paths, validation, duplicate/retry, queue/communication, traceability |
| 3. Human-reviewed Quotation               | Sales creates, gains approvals, reviews, sends, versions, and receives a decision                                 | Pricing release decisions; Lead slice                                       | Reconciliation, approval/SoD, expiry/concurrency, bilingual evidence              |
| 4. Approved Order and Operations          | Accepted/current approved Quotation converts once; Operations schedules, executes, handles exceptions, completes  | Lifecycle/amendment/cancellation policy; Quotation slice                    | Snapshot lineage, transitions, handoffs, communications, audit                    |
| 5. Customer status and support            | Customer tracks safely; Customer Service handles verified enquiries without data leakage                          | Order lifecycle; tracking/privacy controls                                  | Enumeration/rate-limit/field minimization, journey/support tests                  |
| 6. Production hardening and pilot         | Whole journey operates safely under realistic scale/failure/support conditions                                    | All prior slices; runbooks/legal/operations readiness                       | Performance, security, accessibility, recovery, observability, pilot acceptance   |

Slice numbering indicates dependency, not a mandate for one large release. Risky assumptions SHOULD be validated early with non-production prototypes and tests.

## 7. Required Product Artifacts Before Build

Before the relevant implementation slice becomes Ready, the responsible team MUST approve:

- UI/UX flows and content for Arabic/RTL, English/LTR, mobile, desktop, accessibility, and all states;
- physical data model, migrations, RLS policies, retention, audit event catalog, and restore design;
- service/API contracts, error taxonomy, idempotency/concurrency, versioning, and integration boundaries;
- permission mapping and field classification;
- pricing, tax, currency, validity, adjustment, approval, amendment, and cancellation decisions;
- coverage/city/zone, catalog, restriction, reason code, timing, and support configuration;
- authentication provider setup and account/guest identity-linking rules;
- communications channels, consent, templates, retry/fallback, and service ownership;
- analytics definitions and privacy controls;
- threat model, abuse cases, security/privacy/legal review; and
- test strategy, observability, runbooks, release plan, pilot plan, rollback, and owners.

PDS documents are requirements inputs; they are not substitutes for these implementation artifacts.

## 8. Explicit MVP Exclusions

Unless an approved PDS change says otherwise, MVP excludes:

- inbound intercity routes to Riyadh, routes between non-Riyadh cities, and international transport;
- cargo/add-on types beyond the approved Service Catalog;
- instant public price, fully automated final Quotation, bidding, surge pricing, coupons, subscriptions, or marketplace pricing;
- online payments, invoicing, refunds, wallets, credit, settlement, or accounting integrations;
- live GPS/map tracking, customer location streaming, telematics, driver or fleet mobile application;
- carrier/driver marketplace, partner portal, dispatch optimization, route optimization, proof-of-delivery hardware integration;
- native iOS/Android applications and offline-first field operation;
- public/partner APIs, webhooks, EDI, ERP/CRM integrations, or event marketplace;
- customer self-service rescheduling, scope amendment, cancellation, refund, or commercial negotiation unless explicitly specified later;
- self-service logistics-company tenant creation, subscription billing, white-labeling, tenant-specific domains, or SaaS plan administration;
- AI-produced autonomous price, approval, eligibility, dispatch, or customer-impact decision;
- advanced loyalty, referrals, promotions, dynamic experimentation, and personalization; and
- unapproved analytics that collect additional personal or sensitive data.

An exclusion cannot be introduced indirectly through an Admin Panel setting.

## 9. Launch Configuration Checklist

The first production service remains disabled until named owners approve and publish:

- enabled Riyadh coverage and enabled intercity destinations;
- service/add-on catalog, qualification fields, units, restrictions, and customer guidance;
- operating hours/windows, blackout behavior, capacity/availability guidance, and support escalation;
- currency, tax treatment, price values/factors, rounding, adjustments, approvals, and Quotation validity;
- terms, privacy/consent, retention, cancellation, amendment, communications, and complaint policy;
- Arabic and English content/templates, customer status mapping, reason codes, and support contact details;
- role grants, delegated authority, access reviews, emergency access, and service identities;
- monitoring thresholds, alert routes, service objectives, recovery targets, backups/restore, and incident runbooks; and
- pilot scope, success thresholds, stop/go authority, rollback conditions, and customer support staffing.

There MUST be no silent technical defaults for an unapproved business value.

## 10. MVP Success Framework

Before pilot, Product MUST replace each `[target required]` with an approved target, owner, source, window, and decision rule:

| Outcome                  | Measure                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| Demand completion        | Eligible request submission completion and abandonment `[target required]`                  |
| Sales operability        | First response, qualification, and Quotation preparation time `[target required]`           |
| Commercial effectiveness | Quotation delivery, acceptance, revision, and conversion `[target required]`                |
| Operational delivery     | Scheduling, completion, exception, and cancellation outcomes `[target required]`            |
| Customer self-service    | Tracking success without Customer Service contact `[target required]`                       |
| Journey quality          | Support contacts, complaints, task success, accessibility findings `[target required]`      |
| Reliability              | Lifecycle failure/duplicate rate, availability, and recovery objectives `[target required]` |
| Security/privacy         | No unresolved critical/high release findings; monitored abuse and access-review outcomes    |
| Language parity          | Arabic/English functional/content defect and completion parity `[target required]`          |
| Performance              | Meets approved NFR and Core Web Vitals targets at agreed percentile/load                    |

Targets are release configuration/governance decisions, not hardcoded product values.

## 11. Release Gates

### 11.1 Definition of Ready

An MVP slice is Ready only when scope, owner, linked requirements/stories/criteria/rules, journey/design/content, physical architecture/contracts, data/RLS/audit, security/privacy/threat model, configuration decisions, dependency owners, observability, tests, rollout/rollback, and acceptance authority are complete and unambiguous.

### 11.2 Definition of Done

An MVP slice is Done only when implementation and documentation are reviewed; automated and manual evidence passes; forbidden paths and failure/retry/concurrency are tested; Arabic/English, RTL/LTR, accessibility, mobile, performance, SEO where public, security, privacy, audit, observability, and rollback requirements pass; configuration/runbooks/support are ready; and Product plus required domain owners accept the evidence.

### 11.3 Pilot Go/No-Go

The pilot requires:

- no open release-blocking defect, security/privacy issue, or unresolved legal/operational dependency;
- successful production-like end-to-end rehearsal for all four service combinations and both add-ons;
- realistic failure, duplicate, expiry, concurrent acceptance, cancellation, tracking abuse, communication failure, and recovery exercises;
- restore/rollback proof and on-call/support readiness;
- approved live business configuration and dual-language content; and
- a named authority empowered to pause intake, quotation sending, conversion, or execution safely.

## 12. Scope Change Control

Every proposed scope change MUST state the customer/business outcome, affected requirement IDs, lifecycle/journey impact, security/privacy/accessibility/SEO/performance impact, data/API/design changes, operational/legal/commercial readiness, migration/backward compatibility, test evidence, delivery impact, and new exclusions or risks.

Adding an item requires an explicit tradeoff or a versioned scope expansion; it MUST NOT silently displace mandatory quality. The PDS owner records acceptance, rejection, or deferral and updates all affected documents in one governed change.

## 13. MVP Completion Statement

MVP is complete only when the full approved journey operates safely in production for the enabled configuration and pilot population, evidence meets the approved success/quality gates, responsible domain owners accept operational ownership, and no manual workaround bypasses a mandatory lifecycle, authorization, review, audit, privacy, localization, or accessibility requirement.
