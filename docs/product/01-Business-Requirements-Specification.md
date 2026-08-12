# Naqlk Business Requirements Specification

| Document field | Value                                                  |
| -------------- | ------------------------------------------------------ |
| Suite          | Product Documentation Suite (PDS) v1                   |
| Status         | Approved product baseline                              |
| Version        | 1.0.0                                                  |
| Effective date | 2026-08-03                                             |
| Owners         | Product and Business leadership                        |
| Market         | Kingdom of Saudi Arabia                                |
| MVP geography  | Riyadh local routes and Riyadh-origin intercity routes |

## 1. Purpose

This Business Requirements Specification defines the approved business model, scope, actors, outcomes, capabilities, constraints, and success measures for Naqlk PDS v1. It is the business-level source for the detailed requirements in this directory.

This document does not authorize implementation by itself. Every implementation increment MUST also satisfy the [Naqlk Constitution](../../.ai/constitution.md), [Product Principles](../../.ai/product-principles.md), applicable architecture, and the Definition of Ready.

## 2. Normative Language and Traceability

The terms **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** have the meanings defined by the Constitution.

Identifiers are permanent traceability contracts:

| Prefix  | Source                                                             |
| ------- | ------------------------------------------------------------------ |
| `BRS-`  | Business requirement in this document                              |
| `FR-`   | [Functional Requirements](./02-Functional-Requirements.md)         |
| `NFR-`  | [Non-Functional Requirements](./03-Non-Functional-Requirements.md) |
| `US-`   | [User Stories](./04-User-Stories.md)                               |
| `AC-`   | [Acceptance Criteria](./05-Acceptance-Criteria.md)                 |
| `RULE-` | [Business Rules](./06-Business-Rules.md)                           |

An identifier MUST NOT be reused after retirement. Changed meaning requires a new identifier and migration note.

## 3. Executive Summary

Naqlk PDS v1 defines an Arabic-first service-request and transport-order platform for customers in Saudi Arabia. The MVP accepts guest or registered customer requests for furniture moving and general cargo transport within Riyadh or from Riyadh to supported Saudi cities.

Every valid request becomes a lead. A Sales representative reviews the request and prepares a final quotation using a hybrid pricing model: configurable pricing rules may produce an internal estimate, but no customer quotation becomes final without human Sales review. Customer acceptance and any required internal approval convert the quotation into an order. Operations schedules and executes the order. Customers track an order using its Order Number and the matching Mobile Number.

Naqlk internal work is separated among Super Admin, Sales, Operations, Finance, and Customer Service roles. Business values are managed through a governed Admin Panel rather than hardcoded application logic.

## 4. Approved Business Decisions

| Area                    | Approved decision                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------- |
| Business market         | Saudi Arabia                                                                        |
| Local MVP coverage      | Origin and destination are both inside Riyadh                                       |
| Intercity MVP coverage  | Origin is inside Riyadh and destination is an enabled Saudi city outside Riyadh     |
| Cargo services          | Furniture Moving and General Cargo Transport                                        |
| Route services          | Local Transport and Intercity Transport                                             |
| Add-on services         | Packing and Loading & Unloading                                                     |
| Quotation model         | Hybrid; system-assisted estimate with mandatory Sales review before final quotation |
| Guest access            | A visitor can submit a service request without an account                           |
| Account policy          | Account is optional for request and tracking                                        |
| Account sign-in options | Email, Google, and Apple                                                            |
| Internal roles          | Super Admin, Sales, Operations, Finance, Customer Service                           |
| Business flow           | Visitor → Lead → Quotation → Approved → Order → Execution → Completed               |
| Public tracking         | Exact Order Number plus matching Mobile Number                                      |
| Administration          | Business values are configurable through the Admin Panel                            |
| Default language        | Arabic (`ar`, RTL)                                                                  |
| Secondary language      | English (`en`, LTR) with release parity                                             |

## 5. Operating Model

PDS v1 defines one Naqlk-operated service workspace. External customers request transport services; Naqlk staff qualify, quote, schedule, execute, support, and financially govern those requests.

The approved system and database architecture remain organization-aware and capable of future multi-tenant evolution. PDS v1 does not include self-service onboarding of logistics companies, organization administrators, subcontractor portals, driver applications, or customer-configured workspaces.

The internal role named **Super Admin** is a governed application role. It is not a database superuser, Supabase service role, RLS bypass, shared account, or unmonitored break-glass credential.

## 6. Business Problem

Customers need a clear, Arabic-first way to request moving or cargo transport without first creating an account. Naqlk needs a controlled process that turns incomplete customer intent into a reviewed quotation, an executable order, and a traceable completion record.

The platform addresses these problems:

- fragmented request intake through calls and messages;
- inconsistent collection of route, cargo, timing, and optional-service details;
- pricing decisions without a governed estimate, review, revision, and approval trail;
- weak handoff between Sales and Operations;
- unclear order state and customer status communication;
- business values embedded in code or maintained outside the system; and
- limited accountability for who changed a quotation, order, or configuration.

## 7. Business Objectives

| ID        | Objective                                                                           | Expected evidence                                                                        |
| --------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `BRS-001` | Provide a low-friction Arabic-first request journey without mandatory registration. | Valid guest-request completion and reduced manual intake.                                |
| `BRS-002` | Convert every supported request into a structured, attributable lead.               | Lead creation, source, consent, and required service data are complete.                  |
| `BRS-003` | Ensure every customer quotation receives human Sales review.                        | No sent quotation lacks reviewer identity and review time.                               |
| `BRS-004` | Produce consistent quotations through configurable pricing inputs and line items.   | Quotation versions, rule provenance, adjustment reasons, and totals are traceable.       |
| `BRS-005` | Create an executable order only from an approved quotation.                         | Every order references one accepted quotation version and immutable commercial snapshot. |
| `BRS-006` | Give Operations a controlled order execution workflow.                              | Ownership, schedule, state transitions, exceptions, and completion are attributable.     |
| `BRS-007` | Let customers retrieve safe current order status without an account.                | Successful authorized tracking with no protected-data leakage.                           |
| `BRS-008` | Separate internal duties by least-privilege role.                                   | Permission tests and audit evidence match the role matrix.                               |
| `BRS-009` | Eliminate hardcoded business values.                                                | Admin-managed, versioned, validated business configuration controls runtime choices.     |
| `BRS-010` | Deliver Arabic-default and English-parity experiences.                              | Both locales and directions pass release criteria.                                       |
| `BRS-011` | Provide accountable customer communication and support.                             | Messages, contact events, reasons, and outcomes are traceable.                           |
| `BRS-012` | Establish measurable sales and operations performance.                              | Approved funnel, response, conversion, execution, and quality metrics are available.     |

## 8. Stakeholders

| Stakeholder               | Interest                                       | Decision responsibility                                                    |
| ------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------- |
| Business leadership       | Market fit, revenue, service quality, risk     | Product direction and commercial policy                                    |
| Product leadership        | Customer outcome, scope, requirements          | PDS ownership and prioritization                                           |
| Sales                     | Lead qualification and quotation               | Sales workflow and final quotation review                                  |
| Operations                | Scheduling and service execution               | Operational readiness, assignment, exceptions, completion                  |
| Finance                   | Pricing governance and financial review        | Price rules, discounts/adjustments, tax/currency policy, reporting         |
| Customer Service          | Customer communication and issue handling      | Support workflow, communication content, escalation                        |
| Super Admin               | Platform-controlled configuration and access   | Published configuration, internal users, privileged product administration |
| Customers                 | Request, approve, receive, and track service   | Accurate request data and quotation acceptance                             |
| Engineering/Data/Security | Safe implementation and operation              | Architecture, data, controls, reliability, evidence                        |
| UI/UX/Localization/QA     | Usable, accessible, testable bilingual product | Experience design and quality verification                                 |

## 9. Actors

### 9.1 External actors

| Actor               | Definition                                                         | Account requirement              |
| ------------------- | ------------------------------------------------------------------ | -------------------------------- |
| Visitor             | Unauthenticated person discovering services or beginning a request | None                             |
| Guest Customer      | Person who submitted a request without an account                  | None                             |
| Registered Customer | Customer with an optional Naqlk account                            | Email, Google, or Apple identity |

Guest and registered customers have the same right to request a supported service and track an order. An account MAY provide convenience and history, but MUST NOT be required to obtain a quotation or execute an approved order.

### 9.2 Internal roles

Internal role definitions and permissions are authoritative in [Roles and Permissions](./09-Roles-And-Permissions.md).

| Role             | Primary responsibility                                                           |
| ---------------- | -------------------------------------------------------------------------------- |
| Super Admin      | Govern configuration, internal access, and platform-level product administration |
| Sales            | Qualify leads, prepare/revise/review quotations, and record customer acceptance  |
| Operations       | Schedule orders, coordinate execution, manage operational status and exceptions  |
| Finance          | Govern pricing controls, review threshold exceptions, and financial reporting    |
| Customer Service | Find customer records, communicate status, record issues, and escalate           |

## 10. Product Vocabulary

| Term                   | Canonical meaning                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Service Request        | Customer-submitted transport intent and supporting information before qualification                                     |
| Lead                   | Internal business record created from a valid request and owned by Sales                                                |
| Quotation              | Versioned commercial offer prepared from a lead and reviewed by Sales                                                   |
| Approved               | Business milestone reached when the customer accepts the active quotation and required internal approvals are satisfied |
| Order                  | Executable service commitment created from exactly one approved quotation version                                       |
| Execution              | Operational stage from scheduling/readiness through performance of the service                                          |
| Completed              | Terminal successful order state recorded after required completion checks                                               |
| Cargo Service          | Furniture Moving or General Cargo Transport                                                                             |
| Route Class            | Local Transport or Intercity Transport                                                                                  |
| Add-on Service         | Packing or Loading & Unloading attached to a supported transport request                                                |
| Order Number           | Public, immutable reference used with Mobile Number for tracking                                                        |
| Mobile Number          | Normalized customer contact value bound to request/order access and communication                                       |
| Business Configuration | Versioned, validated, permission-controlled value published from the Admin Panel                                        |

Visitor is a journey actor, not a persisted lifecycle state. Submitting a valid request creates the Lead stage.

## 11. Service Model

Naqlk's catalog has three composable dimensions:

1. **Cargo service:** Furniture Moving or General Cargo Transport.
2. **Route class:** Local Transport or Intercity Transport.
3. **Optional add-ons:** Packing and/or Loading & Unloading.

Local Transport means both route endpoints are inside enabled Riyadh coverage. Intercity Transport means the origin is inside enabled Riyadh coverage and the destination is an enabled Saudi city outside Riyadh.

Packing and Loading & Unloading are add-ons in MVP and MUST NOT be sold as standalone orders without a separately approved catalog change.

The complete catalog and qualification data are defined in [Service Catalog](./11-Service-Catalog.md).

## 12. End-to-End Business Process

1. A visitor selects language and reviews available services.
2. The visitor provides requester, service, route, schedule, cargo, add-on, and consent information.
3. The platform validates eligibility and creates one Lead with a reference.
4. Sales reviews and qualifies the Lead, resolves missing information, and prepares a Quotation.
5. Configurable pricing rules may produce an internal estimate; Sales reviews every final line and total.
6. Required internal approval is completed according to the configured approval matrix.
7. Sales sends the active quotation to the customer in the preferred language.
8. The customer accepts or rejects the active quotation; Sales may record verified offline acceptance.
9. Acceptance plus required internal approval creates the Approved milestone.
10. Exactly one Order is created from the approved quotation snapshot and receives an Order Number.
11. Operations reviews readiness, schedules, assigns, and moves the Order into Execution.
12. Operations records progress, exceptions, resolution, and completion evidence required by configuration.
13. The Order becomes Completed only after completion checks pass.
14. The customer may track the Order with Order Number and matching Mobile Number throughout the permitted tracking window.

Detailed state and transition rules are in [Order Lifecycle](./07-Order-Lifecycle.md).

## 13. Business Capability Scope

### 13.1 Public service discovery

The product MUST present enabled services, route coverage, add-ons, service expectations, and request entry points in Arabic and English. Displayed availability MUST derive from published configuration.

### 13.2 Request intake and lead management

The product MUST accept eligible guest and account requests, validate required data, capture consent and source, create a lead, detect likely duplicates without silently discarding them, and support Sales qualification.

### 13.3 Hybrid quotation

The product MUST support configurable estimate inputs, human Sales review, versioned line-item quotations, internal threshold approval, customer delivery, expiry, revision, acceptance, rejection, and cancellation.

### 13.4 Order and execution

The product MUST convert one approved quotation version into one immutable commercial Order snapshot, give Operations controlled scheduling and execution states, record exceptions, and prevent invalid transitions.

### 13.5 Customer tracking and communication

The product MUST expose a minimal customer-safe status view after matching Order Number and Mobile Number. It MUST support approved localized communication events without exposing internal notes or unrelated customer data.

### 13.6 Administration

The product MUST provide governed configuration for business values. Configuration changes require validation, permission, version, publication, effective time, audit, and rollback or supersession behavior.

### 13.7 Reporting and audit

The product MUST produce attributable operational and configuration history plus defined funnel, response, quotation, conversion, execution, completion, and support metrics.

## 14. Core Business Objects

| Object                  | Owner                          | Required business identity                           | Lifecycle summary                                                                        |
| ----------------------- | ------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Customer/Requester      | Customer domain                | Internal ID plus normalized mobile; account optional | Active, merged/reconciled, retained per policy                                           |
| Service Request         | Sales intake                   | Request reference                                    | Submitted, accepted/rejected by validation, converted to lead                            |
| Lead                    | Sales                          | Lead number/reference                                | New, under review, qualified/unqualified, converted, closed                              |
| Quotation               | Sales/Finance governance       | Quotation number plus version                        | Draft, review, approved internally, sent, accepted/rejected/expired/superseded/cancelled |
| Order                   | Operations                     | Order Number                                         | Confirmed, scheduled, in execution, completed/cancelled                                  |
| Execution Record        | Operations                     | Order-linked internal ID                             | Readiness, progress, exception, completion evidence                                      |
| Tracking Access Attempt | Security/Operations            | Request correlation                                  | Allowed or denied with minimized evidence                                                |
| Business Configuration  | Super Admin/domain owner       | Stable configuration key plus version                | Draft, validated, published, superseded/retired                                          |
| Communication           | Owning domain/Customer Service | Message or contact reference                         | Requested, attempted, delivered/failed, acknowledged where applicable                    |

Physical database entities and APIs require separate approved design. These business objects define meaning and ownership.

## 15. Admin-Configurable Business Values

The following categories MUST be configurable rather than embedded in application code:

- enabled cargo services, route classes, add-ons, localized names, descriptions, and instructions;
- Riyadh coverage zones and supported intercity destination cities;
- service-specific questions, choices, required fields, limits, and evidence requests;
- scheduling windows, blackout dates, operating hours, lead response targets, and quote-validity periods;
- pricing components, ranges, formulas, minimums, surcharges, discounts, approval thresholds, currency, and tax presentation;
- internal assignment queues and role-scoped workflow settings;
- customer-facing status labels and descriptions mapped to fixed lifecycle states;
- communication templates, channels, sender identity, contact details, and event triggers;
- public content, support details, policy links, consent text, and localized terminology;
- order/lead/quotation reference formatting within security and uniqueness constraints; and
- report definitions and operational target thresholds.

Security invariants, mandatory Sales review, audit immutability, tenant isolation, least privilege, and lifecycle integrity MUST NOT be disabled through business configuration.

## 16. Business Constraints

- No quotation may be sent without a named Sales reviewer.
- No order may be created without one active accepted quotation version and required internal approvals.
- No guest is required to create an account to submit or track.
- Tracking requires both Order Number and matching normalized Mobile Number.
- Public tracking returns minimal customer-safe information and generic denial behavior.
- Intercity MVP origin must be in enabled Riyadh coverage.
- Add-ons cannot exist without an eligible core transport request in MVP.
- Arabic is the default experience; English parity is a release requirement.
- All changing business values originate from published Admin configuration.
- Internal users use named accounts; shared staff accounts are prohibited.
- Material actions and configuration changes are attributable and audited.

## 17. MVP Boundaries

Included MVP outcomes are defined in [MVP Scope](./12-MVP-Scope.md).

The following are explicitly outside PDS v1 MVP:

- routes that neither start nor end according to the approved Riyadh-origin model;
- international, air, maritime, customs, dangerous-goods, or regulated-specialty transport;
- standalone packing or labor orders;
- instant automated final pricing or quotation without Sales review;
- online payment, tax invoice issuance, accounting ledger, subscription billing, or automated refunds;
- live GPS maps, telematics, ETA prediction, or driver mobile application;
- marketplace bidding, carrier/subcontractor portal, or cross-tenant collaboration;
- native mobile applications and promised offline execution;
- public customer reviews, loyalty, referral, promotion engine, or AI decision-making; and
- self-service logistics-company SaaS onboarding.

## 18. Business Success Measures

Targets MUST be approved before launch; the measures below define what will be monitored.

| Measure                    | Definition                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| Request completion rate    | Valid submitted requests divided by eligible request starts                                 |
| Lead response time         | Time from valid request receipt to first attributable Sales action                          |
| Qualification rate         | Qualified leads divided by reviewed leads                                                   |
| Quotation turnaround       | Time from qualified lead to first sent quotation                                            |
| Quotation acceptance rate  | Accepted quotations divided by sent eligible quotations                                     |
| Order conversion integrity | Orders with exactly one valid accepted quotation snapshot                                   |
| Schedule readiness         | Orders scheduled before the configured service cutoff                                       |
| Completion rate            | Completed orders divided by orders that entered execution, excluding approved cancellations |
| On-time milestone rate     | Orders meeting configured schedule milestone definitions                                    |
| Exception resolution time  | Time from operational exception opening to resolution                                       |
| Tracking success rate      | Authorized successful tracking attempts without support assistance                          |
| Support contact rate       | Customer contacts per order by reason                                                       |
| Arabic journey success     | Task completion and error rate for Arabic users                                             |
| Configuration integrity    | Published configurations passing validation and producing no invalid combinations           |

Metrics MUST be segmented safely and MUST NOT expose one customer's data to another.

## 19. Risks and Controls

| Risk                             | Impact                                   | Required control                                                                   |
| -------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------- |
| Incomplete request data          | Slow or inaccurate quotation             | Service-specific validation and Sales clarification workflow                       |
| Hardcoded business values        | Slow change and inconsistent behavior    | Governed Admin configuration and publication                                       |
| Automated price treated as final | Commercial loss or customer dispute      | Mandatory Sales review and quote version history                                   |
| Ambiguous approval               | Order created without valid agreement    | Explicit internal approval plus customer acceptance evidence                       |
| Weak tracking credential         | Information disclosure or enumeration    | Exact two-factor lookup, rate limits, generic errors, minimal response, monitoring |
| Role overlap                     | Unauthorized changes or weak segregation | Permission matrix, named accounts, threshold approvals, audit                      |
| Unsupported route accepted       | Failed service delivery                  | Published geographic eligibility and request validation                            |
| Arabic terminology inconsistency | User error and trust loss                | Owned glossary, reviewed translations, bidirectional QA                            |
| Configuration combination error  | Invalid price or unavailable service     | Typed validation, preview, effective publication, rollback                         |
| Operations update missing        | Incorrect customer status                | Required transition ownership and stale-status monitoring                          |

## 20. Assumptions and Release Configuration Decisions

The business decisions in Section 4 are approved. The following values are intentionally not invented by PDS v1 and MUST be supplied through approved configuration before the dependent capability is released:

- exact Riyadh districts/zones and supported destination cities;
- service availability by cargo service, route class, date, and zone;
- currency, tax registration and presentation policy;
- price amounts, coefficients, minimums, surcharges, discount limits, and approval thresholds;
- quote validity, operating hours, scheduling cutoff, and blackout dates;
- service-specific form questions and evidence requirements;
- customer communication channels beyond on-screen status and required transactional delivery;
- retention periods and legal/privacy notices;
- order/lead/quotation reference formats; and
- support contact values and operational target thresholds.

These are configuration values, not product ambiguity. Their data types, validation, owner, permission, and effective behavior are specified throughout the suite.

## 21. Requirement Governance

- PDS v1 changes require Product ownership and affected domain review.
- Any change to approved business decisions requires a versioned product decision and updates to every affected requirement, story, criterion, rule, lifecycle, permission, catalog, scope, and roadmap reference.
- Implementations MUST trace each change to requirement IDs and acceptance criteria.
- A lower-level design MAY add detail but MUST NOT weaken mandatory Sales review, guest access, tracking protection, Arabic default, role separation, lifecycle integrity, or configuration governance.
- Open implementation questions MUST be resolved before the applicable item meets Definition of Ready.

## 22. Related Product Documents

- [Functional Requirements](./02-Functional-Requirements.md)
- [Non-Functional Requirements](./03-Non-Functional-Requirements.md)
- [User Stories](./04-User-Stories.md)
- [Acceptance Criteria](./05-Acceptance-Criteria.md)
- [Business Rules](./06-Business-Rules.md)
- [Order Lifecycle](./07-Order-Lifecycle.md)
- [Customer Journey](./08-Customer-Journey.md)
- [Roles and Permissions](./09-Roles-And-Permissions.md)
- [Pricing Strategy](./10-Pricing-Strategy.md)
- [Service Catalog](./11-Service-Catalog.md)
- [MVP Scope](./12-MVP-Scope.md)
- [Future Roadmap](./13-Future-Roadmap.md)
