# Naqlia Functional Requirements

| Document field | Value                                                                              |
| -------------- | ---------------------------------------------------------------------------------- |
| Suite          | Product Documentation Suite (PDS) v1                                               |
| Status         | Approved functional baseline                                                       |
| Version        | 1.0.0                                                                              |
| Parent         | [Business Requirements Specification](./01-Business-Requirements-Specification.md) |
| Owners         | Product and Engineering leadership                                                 |

## 1. Purpose

This document specifies externally observable and administrative behavior for PDS v1. It defines what the platform MUST do without prescribing pages, APIs, database schema, or implementation technology.

All requirements are MVP mandatory unless marked **Future**. Every requirement requires traceability to user stories, acceptance criteria, permissions, business rules, tests, and implementation artifacts before release.

## 2. Common Functional Conventions

- Every customer-visible function MUST support Arabic and English; Arabic is the default.
- Every business choice MUST come from active published configuration.
- Every state mutation MUST record actor, time, source, prior/current state, and correlation appropriate to its risk.
- The platform MUST use stable internal identifiers and separate public references.
- Dates, times, currency, units, phone numbers, and addresses MUST be normalized and displayed by approved locale rules.
- Disabled or unavailable configuration MUST prevent new selection while preserving historical records.
- Protected actions MUST enforce the [Roles and Permissions](./09-Roles-And-Permissions.md) matrix at trusted boundaries.

## 3. Service Catalog and Eligibility

| ID           | Requirement                                                                                                                                                                |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FR-CAT-001` | The platform MUST present only published and currently enabled cargo services, route classes, and add-ons.                                                                 |
| `FR-CAT-002` | Each catalog entry MUST provide reviewed Arabic and English name, description, eligibility, customer instructions, and availability state.                                 |
| `FR-CAT-003` | The platform MUST represent Furniture Moving and General Cargo Transport as cargo-service choices.                                                                         |
| `FR-CAT-004` | The platform MUST classify an eligible route as Local Transport when both endpoints are within enabled Riyadh coverage.                                                    |
| `FR-CAT-005` | The platform MUST classify an eligible route as Intercity Transport when origin is within enabled Riyadh coverage and destination is an enabled Saudi city outside Riyadh. |
| `FR-CAT-006` | The platform MUST offer Packing and Loading & Unloading only as add-ons to an eligible transport request.                                                                  |
| `FR-CAT-007` | The platform MUST prevent submission of disabled service/route/add-on combinations and provide a localized explanation without promising unavailable service.              |
| `FR-CAT-008` | Catalog availability MUST consider effective date, service, route, zone/city, scheduling constraints, and administrative status.                                           |
| `FR-CAT-009` | Historical leads, quotations, and orders MUST retain their original catalog labels/configuration references even after catalog changes.                                    |
| `FR-CAT-010` | Public catalog content MUST expose no unpublished pricing formulas, internal notes, or administrative controls.                                                            |

## 4. Guest and Account Request Intake

### 4.1 Entry and draft behavior

| ID           | Requirement                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `FR-REQ-001` | A visitor MUST be able to begin and submit an eligible service request without signing in or creating an account.                                      |
| `FR-REQ-002` | A registered customer MUST be able to submit the same request without receiving broader service eligibility than a guest.                              |
| `FR-REQ-003` | The request journey MUST show the selected language, service, route classification, and add-ons before final submission.                               |
| `FR-REQ-004` | The platform SHOULD preserve a guest's in-progress request on the same device for a bounded configured period without treating it as a submitted lead. |
| `FR-REQ-005` | A draft MUST NOT reserve capacity, calculate a final price, create an order, or notify Operations.                                                     |

### 4.2 Required common data

| ID           | Requirement                                                                                                                                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `FR-REQ-006` | Submission MUST collect requester full name, normalized mobile number, preferred language, customer type, cargo service, origin, destination, requested date/window, cargo description, selected add-ons, and required consent acknowledgements. |
| `FR-REQ-007` | Email MUST be optional for a guest unless an active communication choice explicitly requires it; account-linked verified email MAY be reused with user confirmation.                                                                             |
| `FR-REQ-008` | Origin and destination MUST collect configured city/zone/district values plus sufficient address or access description for Sales review.                                                                                                         |
| `FR-REQ-009` | Service-specific questions MUST be loaded from the active catalog configuration and enforce configured type, requiredness, choices, range, count, and size limits.                                                                               |
| `FR-REQ-010` | Furniture Moving MUST support configured inventory/access details such as property type, floors, elevator, parking/access, item summary, packing need, and handling notes.                                                                       |
| `FR-REQ-011` | General Cargo Transport MUST support configured cargo details such as cargo category, quantity, packaging/handling-unit description, estimated weight/dimensions when known, and special handling declaration.                                   |
| `FR-REQ-012` | Attachments MAY be requested by configuration; they MUST remain optional unless Product, Security, and Operations approve a mandatory evidence rule for that service.                                                                            |

### 4.3 Validation and submission

| ID           | Requirement                                                                                                                                              |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FR-REQ-013` | The platform MUST validate required fields, formats, lengths, route eligibility, service combinations, dates, and consent before creating a lead.        |
| `FR-REQ-014` | Unsupported, past, disabled, or inconsistent choices MUST produce localized field-level and summary errors without discarding valid input.               |
| `FR-REQ-015` | Submission MUST be idempotent so a retry cannot silently create duplicate leads.                                                                         |
| `FR-REQ-016` | A valid submission MUST create exactly one Lead and one immutable submission snapshot.                                                                   |
| `FR-REQ-017` | The platform MUST generate and display a safe request/lead reference and an acknowledgement that Sales review is required before pricing is final.       |
| `FR-REQ-018` | Likely duplicate requests MUST be flagged for Sales review using approved matching rules; they MUST NOT be silently deleted, merged, or rejected.        |
| `FR-REQ-019` | The platform MUST record request source, locale, consent version/time, submitted time, active configuration versions, and account identity when present. |
| `FR-REQ-020` | A failed submission MUST clearly state whether no lead was created; false success is prohibited.                                                         |

## 5. Optional Customer Accounts

| ID            | Requirement                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FR-AUTH-001` | The platform MUST support optional customer authentication by Email, Google, and Apple under the approved identity design.                                          |
| `FR-AUTH-002` | Account creation MUST NOT be required before request submission, quotation response, order creation, or public tracking.                                            |
| `FR-AUTH-003` | Account identity and customer records MUST be linked through a verified, auditable process and MUST NOT rely only on matching display names.                        |
| `FR-AUTH-004` | A customer MAY link an eligible prior guest request/order after proving control according to the approved identity-linking policy.                                  |
| `FR-AUTH-005` | Linking MUST NOT change quotation, order, mobile ownership, commercial snapshot, or audit history.                                                                  |
| `FR-AUTH-006` | A registered customer SHOULD be able to view authorized current and historical requests, quotations, and orders without reentering the tracking pair for each item. |
| `FR-AUTH-007` | Sign-out, session expiry, provider failure, account suspension, and identity conflict MUST have safe localized behavior.                                            |
| `FR-AUTH-008` | Removing or disabling an account MUST NOT remove legally or operationally required lead/order history.                                                              |
| `FR-AUTH-009` | Customer accounts MUST NOT receive internal-role permissions.                                                                                                       |

## 6. Lead Management

| ID            | Requirement                                                                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FR-LEAD-001` | Every valid request MUST create a Lead in `new` state and route it to the configured Sales queue.                                                           |
| `FR-LEAD-002` | Sales MUST be able to search/filter authorized Leads by reference, customer/mobile, service, route, date, status, assignee, and age.                        |
| `FR-LEAD-003` | Sales MUST be able to claim/assign a Lead and record first-action time.                                                                                     |
| `FR-LEAD-004` | Lead transition from `new` to `under_review` MUST identify the Sales owner.                                                                                 |
| `FR-LEAD-005` | Sales MUST be able to record structured clarification, customer contact attempts, safe internal notes, and updated customer-provided facts with provenance. |
| `FR-LEAD-006` | Original submitted values MUST remain historically available when Sales corrects or enriches the Lead.                                                      |
| `FR-LEAD-007` | Sales MUST qualify a Lead only after required configured information and service eligibility are satisfied.                                                 |
| `FR-LEAD-008` | An unqualified or closed Lead MUST require a configured reason and MUST NOT create an Order.                                                                |
| `FR-LEAD-009` | A qualified Lead MUST be eligible for one active quotation workstream; prior quotation versions remain retained.                                            |
| `FR-LEAD-010` | A Lead MUST become `converted` only after an Order is successfully created from its approved quotation.                                                     |
| `FR-LEAD-011` | Reopening a closed/unqualified Lead MUST require permission, reason, and audit and MUST revalidate current service configuration.                           |
| `FR-LEAD-012` | Customer Service MAY view and append communication records but MUST NOT qualify, price, or convert a Lead.                                                  |

## 7. Hybrid Pricing and Quotation

### 7.1 Estimate and draft

| ID           | Requirement                                                                                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FR-QUO-001` | A qualified Lead MUST provide Sales a structured quotation workspace using the accepted request facts and active pricing configuration.                                      |
| `FR-QUO-002` | The platform MAY calculate an internal estimate or range from configured pricing components; it MUST label the result as non-final.                                          |
| `FR-QUO-003` | The platform MUST preserve the pricing-configuration versions and input snapshot used for each estimate.                                                                     |
| `FR-QUO-004` | A Quotation MUST contain currency, line-item code, localized description, quantity/unit where applicable, unit amount, adjustment, tax presentation, subtotal, and total.    |
| `FR-QUO-005` | Sales MUST be able to add/remove allowed line items and adjust allowed amounts within configured boundaries.                                                                 |
| `FR-QUO-006` | Manual adjustment or discount MUST require a configured reason; threshold breaches MUST require Finance and/or Super Admin approval according to the active approval matrix. |
| `FR-QUO-007` | A Quotation MUST have a configurable validity end, service assumptions, exclusions, schedule assumptions, and customer terms in both languages.                              |

### 7.2 Mandatory review and versioning

| ID           | Requirement                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FR-QUO-008` | Every final Quotation MUST be reviewed by a named Sales representative before it can be sent.                                                           |
| `FR-QUO-009` | The platform MUST block sending when required customer data, line-item data, internal approval, localized content, or validity data is incomplete.      |
| `FR-QUO-010` | Sending MUST freeze an immutable quotation version; later changes create a new version.                                                                 |
| `FR-QUO-011` | At most one quotation version per Lead may be active for customer acceptance.                                                                           |
| `FR-QUO-012` | Sending a revision MUST mark the prior active version `superseded` and make it impossible to accept afterward.                                          |
| `FR-QUO-013` | The platform MUST record reviewer, approvers, adjustment reasons, version, sent time, channel, delivery outcome, and customer-visible content snapshot. |

### 7.3 Customer response and approval

| ID           | Requirement                                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `FR-QUO-014` | A guest or registered customer MUST be able to review the active quotation through an authorized, time-bounded mechanism without mandatory account creation.       |
| `FR-QUO-015` | Customer review MUST show service, route, add-ons, schedule assumptions, line items, subtotal/total, currency/tax presentation, validity, terms, and contact path. |
| `FR-QUO-016` | The customer MUST be able to accept or reject only the current sent, unexpired quotation version.                                                                  |
| `FR-QUO-017` | Customer acceptance MUST record quotation version, customer identity evidence, mobile/account context, time, channel, terms version, and consent/acknowledgement.  |
| `FR-QUO-018` | Sales MAY record verified offline acceptance; doing so MUST require source, evidence reference/notes, actor, time, and reason.                                     |
| `FR-QUO-019` | The Approved milestone MUST occur only when customer acceptance and every configured internal approval are satisfied.                                              |
| `FR-QUO-020` | Expired, rejected, superseded, or cancelled quotations MUST NOT create Orders.                                                                                     |
| `FR-QUO-021` | Reissuing after expiry/rejection MUST create a new version and revalidate current availability, pricing, and approval requirements.                                |

## 8. Order Creation and Commercial Snapshot

| ID           | Requirement                                                                                                                                                                                                                |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FR-ORD-001` | The platform MUST create exactly one Order from exactly one Approved quotation version through an idempotent conversion.                                                                                                   |
| `FR-ORD-002` | Order creation MUST generate an immutable unique Order Number according to published format/security configuration.                                                                                                        |
| `FR-ORD-003` | The Order MUST retain an immutable snapshot of customer, mobile, service, route, addresses, schedule assumptions, add-ons, quotation line items, totals, currency/tax presentation, terms, and accepted quotation version. |
| `FR-ORD-004` | Later customer/account/catalog/pricing changes MUST NOT silently rewrite the commercial Order snapshot.                                                                                                                    |
| `FR-ORD-005` | Order creation MUST mark the Lead `converted` and the accepted Quotation `converted` only in the same successful business operation.                                                                                       |
| `FR-ORD-006` | Conversion failure MUST leave the accepted quotation recoverable and MUST NOT report a created Order without durable Order identity.                                                                                       |
| `FR-ORD-007` | The customer MUST receive the Order Number and a localized explanation of tracking and next steps through the approved channel.                                                                                            |
| `FR-ORD-008` | A newly created Order MUST enter `confirmed` and the configured Operations intake queue.                                                                                                                                   |
| `FR-ORD-009` | Operations MUST be able to search/filter authorized Orders by Order Number, customer/mobile, service, route, date, status, assignee, and exception.                                                                        |
| `FR-ORD-010` | Commercial changes after Order creation MUST use an approved amendment/cancellation flow and preserve original and revised facts.                                                                                          |

## 9. Scheduling and Execution

| ID           | Requirement                                                                                                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FR-EXE-001` | Operations MUST review order readiness before scheduling and record the accountable owner.                                                                                                   |
| `FR-EXE-002` | Scheduling MUST select a permitted service date/window and MUST revalidate active operational availability without changing accepted commercial terms silently.                              |
| `FR-EXE-003` | Operations MUST be able to assign an internal team/resource reference supported by the approved execution model; detailed fleet/driver assignment is outside MVP unless separately approved. |
| `FR-EXE-004` | An Order MUST enter `scheduled` only when required readiness fields and ownership are complete.                                                                                              |
| `FR-EXE-005` | Operations MUST move an Order into `in_execution` only from an allowed state and record actual start time.                                                                                   |
| `FR-EXE-006` | Operations MUST record customer-safe progress milestones according to configured milestone definitions.                                                                                      |
| `FR-EXE-007` | Operations MUST be able to open an exception with category, severity, description, owner, customer visibility, and opened time.                                                              |
| `FR-EXE-008` | An unresolved blocking exception MUST prevent completion until resolved or explicitly overridden by an authorized role with reason.                                                          |
| `FR-EXE-009` | Operations MUST record exception actions, resolution, and customer communication need without deleting prior events.                                                                         |
| `FR-EXE-010` | Completion MUST require configured completion checks, actual completion time, responsible actor, and any required notes/evidence.                                                            |
| `FR-EXE-011` | An Order MUST become `completed` only after completion validation succeeds; completion is terminal except an authorized correction workflow.                                                 |
| `FR-EXE-012` | Cancellation MUST require allowed state, configured reason, actor, customer communication, and financial/operational review where applicable.                                                |
| `FR-EXE-013` | Every state transition MUST append history and update current state atomically.                                                                                                              |
| `FR-EXE-014` | Invalid, duplicate, stale, or unauthorized transitions MUST be rejected safely and logged/audited according to policy.                                                                       |

## 10. Customer Tracking

| ID           | Requirement                                                                                                                                                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FR-TRK-001` | A customer MUST be able to request tracking without an account by entering Order Number and Mobile Number.                                                                                                                        |
| `FR-TRK-002` | The platform MUST normalize the Mobile Number and require an exact match to the active tracking identity bound to the Order.                                                                                                      |
| `FR-TRK-003` | Invalid, nonmatching, unauthorized, rate-limited, and nonexistent combinations MUST return the same safe localized public outcome.                                                                                                |
| `FR-TRK-004` | Successful tracking MUST show Order Number, cargo service, route class, origin/destination city-level summary, scheduled window, current customer-facing status, last meaningful update, next-step guidance, and support contact. |
| `FR-TRK-005` | Public tracking MUST NOT show precise addresses, internal notes, staff identities, internal exceptions, pricing rules, attachments, other orders, or protected customer data.                                                     |
| `FR-TRK-006` | Internal states MUST map to configured Arabic/English customer-facing labels and descriptions without changing lifecycle meaning.                                                                                                 |
| `FR-TRK-007` | Tracking access MUST be rate-limited, abuse-monitored, enumeration-resistant, and auditable at the level defined by Security/Audit policy.                                                                                        |
| `FR-TRK-008` | Completed/cancelled tracking availability MUST follow configured retention; an unavailable historical order MUST return the same generic safe outcome as other denied lookups.                                                    |
| `FR-TRK-009` | A mobile-number correction MUST use an authorized support workflow and preserve prior identity/audit history.                                                                                                                     |
| `FR-TRK-010` | Account-based order history MAY provide the same or richer authorized view but MUST use authenticated authorization rather than bypassing it with public lookup.                                                                  |

## 11. Customer Communication and Support

| ID           | Requirement                                                                                                                                                                                                                         |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FR-COM-001` | The platform MUST record the customer's preferred language and available communication destinations.                                                                                                                                |
| `FR-COM-002` | Transactional communication templates MUST be versioned, enabled, and complete in Arabic and English before publication.                                                                                                            |
| `FR-COM-003` | Required events MUST include request acknowledgement, quotation sent/revised/expired, quotation accepted/rejected, order created, material schedule/status update, cancellation, and completion according to channel configuration. |
| `FR-COM-004` | Communication MUST use the content/version effective for the event and MUST avoid sensitive detail in unsafe channel surfaces.                                                                                                      |
| `FR-COM-005` | Delivery attempt, provider result, retry, final outcome, and correlation MUST be retained without treating delivery as customer acceptance.                                                                                         |
| `FR-COM-006` | Customer Service MUST be able to locate a record through authorized search, view safe context, record contact reason/outcome, and escalate to Sales, Operations, Finance, or Super Admin.                                           |
| `FR-COM-007` | Customer Service MUST NOT alter quotation totals, approve pricing, perform operational transitions, or change protected configuration.                                                                                              |
| `FR-COM-008` | Support correction of customer contact values MUST require verification, reason, permission, and audit.                                                                                                                             |
| `FR-COM-009` | Communication consent and transactional necessity MUST be distinguished; optional marketing is outside MVP.                                                                                                                         |

## 12. Admin Panel and Configuration

### 12.1 Configuration lifecycle

| ID           | Requirement                                                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FR-ADM-001` | Every business configuration MUST have stable key, type/schema, owner, scope, status, version, effective time, and Arabic/English description.       |
| `FR-ADM-002` | Configuration MUST use `draft`, `validated`, `published`, `superseded`, and `retired` lifecycle states as applicable.                                |
| `FR-ADM-003` | Draft configuration MUST have no production effect.                                                                                                  |
| `FR-ADM-004` | Publication MUST validate completeness, allowed values, references, dates, overlapping rules, localization, and unsafe combinations.                 |
| `FR-ADM-005` | Publication MUST record actor, reason, approver where required, before/after version, and effective time.                                            |
| `FR-ADM-006` | Historical business records MUST resolve against captured configuration/version snapshots rather than silently adopting new values.                  |
| `FR-ADM-007` | Rollback MUST publish a new superseding version or reactivate an approved prior version through an audited operation; history MUST NOT be rewritten. |

### 12.2 Configurable categories

| ID           | Requirement                                                                                                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FR-ADM-008` | Super Admin MUST be able to govern catalog services, route classes, add-ons, localized content, and availability.                                                                            |
| `FR-ADM-009` | Super Admin/Operations according to permission MUST be able to govern coverage zones, cities, operating hours, scheduling windows, cutoffs, and blackout dates.                              |
| `FR-ADM-010` | Super Admin/Finance according to permission MUST be able to govern pricing components, formulas/ranges, currency/tax presentation, minimums, surcharges, discounts, and approval thresholds. |
| `FR-ADM-011` | Super Admin/Sales according to permission MUST be able to govern quote validity, assumptions, terms, response targets, and allowed adjustment reasons.                                       |
| `FR-ADM-012` | Super Admin MUST be able to govern customer-facing state labels, communication templates/triggers, support contacts, consent/policy versions, and reference formats.                         |
| `FR-ADM-013` | Configuration access MUST follow least privilege; Finance cannot change security roles, Operations cannot change quotation amounts, and Sales cannot publish platform access grants.         |
| `FR-ADM-014` | The Admin Panel MUST display impacted services/routes and effective behavior before publication.                                                                                             |
| `FR-ADM-015` | Disabling a value MUST define treatment of drafts, active quotations, scheduled orders, and historical records before publication.                                                           |
| `FR-ADM-016` | Mandatory Sales review, security controls, audit immutability, lifecycle transition rules, and language parity MUST NOT be switchable business values.                                       |

## 13. Internal Users and Permissions

| ID           | Requirement                                                                                                                                               |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FR-IAM-001` | Every internal user MUST use a named account and receive one or more approved roles.                                                                      |
| `FR-IAM-002` | Shared staff accounts MUST be prohibited.                                                                                                                 |
| `FR-IAM-003` | Super Admin MUST be able to invite, activate, suspend, and revoke internal access within approved platform rules.                                         |
| `FR-IAM-004` | Role grant/revocation MUST be effective promptly, attributable, and audited.                                                                              |
| `FR-IAM-005` | High-risk actions MUST support recent authentication and configured dual approval where required.                                                         |
| `FR-IAM-006` | Internal users MUST see only functions and data permitted to their role, while authorization remains enforced at trusted boundaries.                      |
| `FR-IAM-007` | Super Admin application permissions MUST NOT provide database superuser, service-role, secret, or unlogged tenant-bypass access.                          |
| `FR-IAM-008` | Suspended or revoked users MUST be prevented from new protected actions even with a previously issued session according to the approved revocation model. |
| `FR-IAM-009` | Access changes and privileged actions MUST be available to authorized audit review.                                                                       |

## 14. Search, Reporting, and Audit

| ID           | Requirement                                                                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FR-REP-001` | Authorized internal users MUST be able to search/filter only data allowed by their role and purpose.                                                                                                          |
| `FR-REP-002` | Result counts, filters, sorting, pagination, and export scope MUST be deterministic and explicit.                                                                                                             |
| `FR-REP-003` | MVP reporting MUST provide request/lead volume, response time, qualification, quotation turnaround, acceptance, order conversion, execution status, completion, cancellation, exception, and support metrics. |
| `FR-REP-004` | Financial reporting MUST separate estimates, sent quotations, accepted quotations, and order commercial snapshots.                                                                                            |
| `FR-REP-005` | Exports MUST require specific permission, current authorization, purpose, expiry, audit, and minimized fields.                                                                                                |
| `FR-REP-006` | Material actions MUST produce audit events according to the approved Audit Strategy.                                                                                                                          |
| `FR-REP-007` | Business status history MUST remain distinct from security/audit evidence and ordinary diagnostic logs.                                                                                                       |
| `FR-REP-008` | Reports MUST identify definition version, applied filters, timezone, currency, generated time, and data-freshness boundary.                                                                                   |

## 15. Localization Behavior

| ID            | Requirement                                                                                                                                                                              |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FR-I18N-001` | Arabic MUST be selected by default when no valid locale preference exists.                                                                                                               |
| `FR-I18N-002` | Customers and internal users MUST be able to switch between Arabic and English without losing authorized context or valid unsaved input where safe.                                      |
| `FR-I18N-003` | The platform MUST set language and direction from locale at the document boundary.                                                                                                       |
| `FR-I18N-004` | Catalog, forms, validation, statuses, quotation content, terms, notifications, tracking, Admin descriptions, and support content MUST have Arabic and English values before publication. |
| `FR-I18N-005` | Dates, times, numbers, currency, units, lists, plurals, phone numbers, and mixed-direction identifiers MUST use approved locale formatting.                                              |
| `FR-I18N-006` | Machine keys, identifiers, lifecycle states, permissions, and pricing codes MUST remain stable and unlocalized.                                                                          |
| `FR-I18N-007` | Missing or invalid localized content MUST block publication of affected business configuration.                                                                                          |

## 16. Functional Invariants

The platform MUST enforce all of the following:

1. A valid submission creates at most one Lead for one idempotency identity.
2. A Quotation cannot be sent without Sales review.
3. A Lead has at most one customer-acceptable quotation version.
4. A superseded/expired/rejected/cancelled quotation cannot be accepted or converted.
5. An Order references exactly one accepted quotation version.
6. One quotation version creates at most one Order.
7. An Order Number is immutable and unique.
8. Customer tracking requires matching Order Number and normalized Mobile Number.
9. A business configuration affects runtime only after valid publication.
10. Historical records preserve the facts/configuration active at the accountable event.
11. Every lifecycle transition uses the allowed transition graph.
12. Completion cannot precede execution start.
13. An unresolved blocking exception prevents completion unless an authorized audited override exists.
14. Arabic/English content completeness is required before customer-visible publication.

## 17. Future Functional Requirements

The following are documented roadmap candidates, not MVP requirements:

- live GPS tracking, maps, telematics, ETA prediction, and driver mobile workflows;
- online payment, invoice, credit/refund, and accounting integrations;
- self-service organization onboarding and customer workspace administration;
- carrier marketplace, subcontractor portal, bidding, and cross-tenant sharing;
- inbound intercity and city-to-city routes not originating in Riyadh;
- standalone packing/labor services;
- promotions, coupons, loyalty, subscriptions, and referral programs;
- automated final quotation without mandatory human review;
- native mobile/offline synchronization;
- advanced capacity optimization and AI-assisted decisions; and
- public integration APIs.

## 18. Traceability Expectations

Before implementation begins, each functional requirement MUST map to:

- at least one Business Requirement;
- actor and permission;
- one or more User Stories;
- one or more Acceptance Criteria;
- applicable Business Rules and lifecycle transition;
- data classification, audit, and retention requirement;
- required test layers; and
- owning feature/domain.

Traceability gaps prevent Definition of Ready.
