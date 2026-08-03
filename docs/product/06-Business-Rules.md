# Naqlia Business Rules

| Document field | Value                                                                              |
| -------------- | ---------------------------------------------------------------------------------- |
| Suite          | Product Documentation Suite (PDS) v1                                               |
| Status         | Approved rule baseline                                                             |
| Version        | 1.0.0                                                                              |
| Parent         | [Business Requirements Specification](./01-Business-Requirements-Specification.md) |
| Owners         | Product and domain owners                                                          |

## 1. Purpose

This document defines mandatory business invariants independent of UI, API, database, or workflow implementation. Business rules MUST be enforced consistently at every applicable boundary and tested through the [Acceptance Criteria](./05-Acceptance-Criteria.md).

Configurable values are referenced by semantic key/category. PDS v1 intentionally defines no price amount, zone list, city list, operating schedule, tax value, or deadline as source-code constants.

## 2. Rule Precedence

| ID             | Rule                                                                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `RULE-GOV-001` | Constitution and Blueprint authority prevail over PDS rules; PDS requirements prevail over implementation behavior.                      |
| `RULE-GOV-002` | Security, tenant isolation, audit immutability, lifecycle integrity, and mandatory Sales review are not business-configurable.           |
| `RULE-GOV-003` | A published effective configuration supplies business values; draft, future, superseded, retired, or invalid versions do not.            |
| `RULE-GOV-004` | Historical facts resolve from their captured version/snapshot, not the current configuration.                                            |
| `RULE-GOV-005` | When two active business rules conflict, the operation fails safely until configuration is corrected; implicit precedence is prohibited. |

## 3. Catalog and Service Rules

| ID             | Rule                                                                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `RULE-CAT-001` | MVP Cargo Service is exactly one of Furniture Moving or General Cargo Transport.                                                              |
| `RULE-CAT-002` | MVP Route Class is exactly one of Local Transport or Intercity Transport.                                                                     |
| `RULE-CAT-003` | Local Transport requires both origin and destination inside enabled Riyadh coverage.                                                          |
| `RULE-CAT-004` | Intercity Transport requires origin inside enabled Riyadh coverage and destination in an enabled Saudi city outside Riyadh.                   |
| `RULE-CAT-005` | A route that fails `RULE-CAT-003` and `RULE-CAT-004` is outside MVP eligibility.                                                              |
| `RULE-CAT-006` | Packing and Loading & Unloading are add-ons and require an eligible Cargo Service and Route Class.                                            |
| `RULE-CAT-007` | An add-on may be unavailable for a specific cargo service, route, zone, date, or capacity condition according to published configuration.     |
| `RULE-CAT-008` | Disabling a catalog value prevents new selection but does not rewrite existing Lead, Quotation, or Order facts.                               |
| `RULE-CAT-009` | Customer-facing catalog labels/descriptions require complete Arabic and English values.                                                       |
| `RULE-CAT-010` | Hazardous, prohibited, illegal, international, air, maritime, or customs-controlled cargo is outside MVP and MUST NOT be implicitly accepted. |

## 4. Request Rules

| ID             | Rule                                                                                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RULE-REQ-001` | Account creation is optional for service request submission.                                                                                                                              |
| `RULE-REQ-002` | A submitted request must have one normalized primary Mobile Number.                                                                                                                       |
| `RULE-REQ-003` | A submitted request must include requester name, preferred locale, customer type, cargo service, eligible route, requested date/window, cargo description, add-ons, and required consent. |
| `RULE-REQ-004` | Service-specific required values come from the configuration effective at submission validation.                                                                                          |
| `RULE-REQ-005` | A request cannot be submitted with a past requested date/window or an unavailable combination.                                                                                            |
| `RULE-REQ-006` | Submission is idempotent within the approved idempotency scope; retry cannot create another Lead silently.                                                                                |
| `RULE-REQ-007` | A valid submission creates exactly one immutable submission snapshot and exactly one Lead.                                                                                                |
| `RULE-REQ-008` | Draft request data is not a Lead, quotation, reservation, order, or service commitment.                                                                                                   |
| `RULE-REQ-009` | A request acknowledgement is not a quotation or acceptance promise.                                                                                                                       |
| `RULE-REQ-010` | Likely duplicates are flagged; automated destructive merge/rejection is prohibited.                                                                                                       |
| `RULE-REQ-011` | Original submitted values remain attributable after Sales clarification or correction.                                                                                                    |
| `RULE-REQ-012` | Invalid submission creates no Lead unless an explicitly approved recovery mechanism proves durable single creation.                                                                       |

## 5. Customer and Account Rules

| ID             | Rule                                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RULE-CUS-001` | A customer record may exist without an Auth account.                                                                                              |
| `RULE-CUS-002` | An Auth account does not grant internal staff permissions.                                                                                        |
| `RULE-CUS-003` | A guest record may link to an account only after approved proof of control and conflict checks.                                                   |
| `RULE-CUS-004` | Account linking adds an identity relationship; it does not alter historical customer, mobile, quotation, or Order snapshots.                      |
| `RULE-CUS-005` | Mobile-number correction requires verification, authorized actor, reason, and audit.                                                              |
| `RULE-CUS-006` | Account closure/suspension does not erase retained business facts or allow another account to claim them automatically.                           |
| `RULE-CUS-007` | Email is optional for guest request unless required by an explicitly selected communication method; Mobile Number remains mandatory for tracking. |

## 6. Lead Rules

| ID              | Rule                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| `RULE-LEAD-001` | Every Lead begins in `new`.                                                                               |
| `RULE-LEAD-002` | `under_review` requires an active Sales owner.                                                            |
| `RULE-LEAD-003` | `qualified` requires all configured qualification conditions and service eligibility.                     |
| `RULE-LEAD-004` | `unqualified` and `closed` require configured reason.                                                     |
| `RULE-LEAD-005` | An unqualified/closed Lead cannot create an Order.                                                        |
| `RULE-LEAD-006` | A reopened Lead must revalidate current catalog, geographic, scheduling, and qualification configuration. |
| `RULE-LEAD-007` | A Lead becomes `converted` only when an Order is durably created.                                         |
| `RULE-LEAD-008` | A converted Lead cannot convert again.                                                                    |
| `RULE-LEAD-009` | At most one quotation version for a Lead may be currently customer-acceptable.                            |

## 7. Pricing and Estimate Rules

| ID             | Rule                                                                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `RULE-PRC-001` | System-calculated price is an internal estimate or range until reviewed by Sales and issued as a quotation.                              |
| `RULE-PRC-002` | Every estimate records input and pricing-configuration versions.                                                                         |
| `RULE-PRC-003` | Every monetary amount uses fixed precision and explicit configured currency.                                                             |
| `RULE-PRC-004` | A quotation total equals deterministic line totals, allowed adjustments, and configured tax presentation; hidden amounts are prohibited. |
| `RULE-PRC-005` | Manual adjustments use an allowed type and configured reason.                                                                            |
| `RULE-PRC-006` | An adjustment beyond the active Sales threshold requires approval from roles in the active approval matrix.                              |
| `RULE-PRC-007` | Approval thresholds cannot be retroactively changed for a frozen sent quotation version.                                                 |
| `RULE-PRC-008` | No price, coefficient, minimum, surcharge, discount, tax value, currency, or approval threshold is hardcoded in feature logic.           |
| `RULE-PRC-009` | A quotation is a commercial offer, not a tax invoice, payment receipt, or accounting posting.                                            |
| `RULE-PRC-010` | Online payment, automated invoicing, and refund behavior are outside MVP.                                                                |

## 8. Quotation Rules

| ID             | Rule                                                                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `RULE-QUO-001` | Every quotation belongs to exactly one Lead.                                                                                                 |
| `RULE-QUO-002` | Every sent quotation has a unique quotation reference and immutable version number.                                                          |
| `RULE-QUO-003` | A quotation cannot be sent without a named Sales reviewer.                                                                                   |
| `RULE-QUO-004` | A quotation cannot be sent while required internal approval, line item, validity, schedule assumption, terms, or localization is incomplete. |
| `RULE-QUO-005` | Sending freezes all customer-visible and commercial values for that version.                                                                 |
| `RULE-QUO-006` | Changing a sent quotation creates a new version.                                                                                             |
| `RULE-QUO-007` | Sending a new version supersedes the prior active version.                                                                                   |
| `RULE-QUO-008` | Only a sent, active, unexpired, non-superseded, non-cancelled quotation may be accepted or rejected.                                         |
| `RULE-QUO-009` | Customer acceptance binds the exact quotation and terms version.                                                                             |
| `RULE-QUO-010` | Verified offline acceptance requires evidence source, Sales actor, time, and reason/notes.                                                   |
| `RULE-QUO-011` | Customer acceptance alone does not create Approved when required internal approval is missing.                                               |
| `RULE-QUO-012` | Approved requires both customer acceptance and all active required internal approvals.                                                       |
| `RULE-QUO-013` | Expired, rejected, superseded, or cancelled quotation cannot create an Order.                                                                |
| `RULE-QUO-014` | Reissue after expiry/rejection uses a new version and current availability/pricing/approval validation.                                      |
| `RULE-QUO-015` | At most one Order may be created from one quotation version.                                                                                 |

## 9. Order Rules

| ID             | Rule                                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------- |
| `RULE-ORD-001` | An Order is created only from one Approved quotation version.                                                         |
| `RULE-ORD-002` | Conversion is idempotent and atomic with Lead/Quotation conversion states.                                            |
| `RULE-ORD-003` | An Order has one immutable unique public Order Number.                                                                |
| `RULE-ORD-004` | Order Number format is configured within security, uniqueness, and non-reuse constraints.                             |
| `RULE-ORD-005` | Order commercial snapshot is immutable; amendments add explicit new facts.                                            |
| `RULE-ORD-006` | An Order begins in `confirmed`.                                                                                       |
| `RULE-ORD-007` | Order lifecycle transitions follow only the graph in [Order Lifecycle](./07-Order-Lifecycle.md).                      |
| `RULE-ORD-008` | Every transition records actor/system, occurred/recorded time, source, reason where applicable, and prior/next state. |
| `RULE-ORD-009` | Current state and transition history update atomically.                                                               |
| `RULE-ORD-010` | Duplicate, stale, unauthorized, or invalid transitions make no business-state change.                                 |

## 10. Scheduling and Execution Rules

| ID             | Rule                                                                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `RULE-EXE-001` | `scheduled` requires a confirmed ready Order, valid window, and Operations owner.                                                        |
| `RULE-EXE-002` | Operational scheduling cannot silently change accepted commercial terms.                                                                 |
| `RULE-EXE-003` | `in_execution` requires current `scheduled` state and actual start evidence.                                                             |
| `RULE-EXE-004` | Progress milestones append history; they do not rewrite earlier milestones.                                                              |
| `RULE-EXE-005` | Every exception has type, severity, owner, status, customer-visibility decision, and timeline.                                           |
| `RULE-EXE-006` | A blocking open exception prevents ordinary completion.                                                                                  |
| `RULE-EXE-007` | Exception override requires configured permission, reason, and audit and must preserve the exception.                                    |
| `RULE-EXE-008` | `completed` requires `in_execution` and every configured completion check.                                                               |
| `RULE-EXE-009` | Completion time cannot precede execution start time.                                                                                     |
| `RULE-EXE-010` | `completed` is terminal; correction creates an authorized superseding record/event.                                                      |
| `RULE-EXE-011` | Cancellation requires allowed source state, configured reason, customer communication decision, and financial/operational effect review. |
| `RULE-EXE-012` | Cancelled Orders cannot enter execution or completion without a separately approved reinstatement model; reinstatement is outside MVP.   |

## 11. Tracking Rules

| ID             | Rule                                                                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RULE-TRK-001` | Guest tracking requires both Order Number and normalized Mobile Number.                                                                             |
| `RULE-TRK-002` | Both values must match the active tracking identity for one Order.                                                                                  |
| `RULE-TRK-003` | Match failure, missing record, malformed input, retention expiry, and unauthorized access use indistinguishable public denial semantics.            |
| `RULE-TRK-004` | Tracking requests are rate-limited by approved signals without trusting one signal as identity.                                                     |
| `RULE-TRK-005` | Successful public tracking exposes only the fields approved in `FR-TRK-004`.                                                                        |
| `RULE-TRK-006` | Precise address, internal notes, staff identity, price rules, attachments, internal exceptions, and other records are never public tracking fields. |
| `RULE-TRK-007` | Customer-facing status is a localized mapping from immutable internal lifecycle states.                                                             |
| `RULE-TRK-008` | Changing a localized status label cannot change Order state.                                                                                        |
| `RULE-TRK-009` | Public tracking access remains available without an account during configured retention.                                                            |
| `RULE-TRK-010` | Tracking success/failure monitoring must not store unnecessary raw lookup credentials.                                                              |

## 12. Communication Rules

| ID             | Rule                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `RULE-COM-001` | Transactional communication is triggered by an owned business event, not arbitrary UI behavior.                           |
| `RULE-COM-002` | A published customer template has complete Arabic and English content.                                                    |
| `RULE-COM-003` | Communication uses the customer's preferred locale or a documented safe fallback.                                         |
| `RULE-COM-004` | Delivery success does not mean quotation acceptance, order execution, or customer acknowledgement.                        |
| `RULE-COM-005` | Retry is bounded and idempotent; repeated attempts do not duplicate the owning business event.                            |
| `RULE-COM-006` | Unsafe channel surfaces must not include sensitive addresses, documents, financial detail, or unrestricted personal data. |
| `RULE-COM-007` | Marketing communication is outside MVP and cannot reuse transactional necessity as consent.                               |
| `RULE-COM-008` | Customer Service records contact reason, outcome, and escalation but cannot mutate owned Sales/Operations/Finance state.  |

## 13. Role and Approval Rules

| ID             | Rule                                                                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `RULE-IAM-001` | Every internal user has a named identity; shared staff credentials are prohibited.                                                       |
| `RULE-IAM-002` | Permissions are granted through current active roles and contextual rules, not UI visibility.                                            |
| `RULE-IAM-003` | Sales owns Lead qualification and quotation preparation/review.                                                                          |
| `RULE-IAM-004` | Operations owns Order scheduling/execution states.                                                                                       |
| `RULE-IAM-005` | Finance owns commercial thresholds and required high-impact financial approval.                                                          |
| `RULE-IAM-006` | Customer Service owns support contact records and escalation, not pricing/execution.                                                     |
| `RULE-IAM-007` | Super Admin owns governed application configuration/internal access but has no inherent database/service-role/RLS-bypass/secrets access. |
| `RULE-IAM-008` | Revoked/suspended access is checked against authoritative current state.                                                                 |
| `RULE-IAM-009` | High-risk actions may require recent authentication and dual approval according to security/configuration.                               |
| `RULE-IAM-010` | An actor cannot approve their own threshold exception when the active separation-of-duties matrix prohibits it.                          |

## 14. Configuration Rules

| ID             | Rule                                                                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RULE-CFG-001` | Every configurable value has stable key, type, validation, owner, scope, version, status, effective time, and localized description where visible. |
| `RULE-CFG-002` | Draft configuration has no production effect.                                                                                                      |
| `RULE-CFG-003` | Publication is permission-controlled and audited.                                                                                                  |
| `RULE-CFG-004` | Publication fails on missing required localization, invalid reference, overlap, impossible combination, invalid range, or unsafe lifecycle effect. |
| `RULE-CFG-005` | At most one effective configuration version exists for the same exclusive key/scope/time unless the schema defines deterministic composition.      |
| `RULE-CFG-006` | Published values become effective only at their explicit effective time.                                                                           |
| `RULE-CFG-007` | Rollback uses a new superseding publication; prior versions remain immutable.                                                                      |
| `RULE-CFG-008` | Disabling a value requires explicit behavior for drafts, active quotations, scheduled Orders, and history.                                         |
| `RULE-CFG-009` | Business configuration cannot execute arbitrary code, SQL, or unvalidated expressions.                                                             |
| `RULE-CFG-010` | Configuration changes must be testable in a bounded supported combination matrix.                                                                  |

## 15. Data, Audit, and Retention Rules

| ID              | Rule                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `RULE-DATA-001` | Stable machine identifiers are unlocalized and never reused.                                                              |
| `RULE-DATA-002` | Instants use UTC storage and explicit display timezone; occurred/recorded time differ where late reporting is possible.   |
| `RULE-DATA-003` | Business identifiers and customer mobile values are normalized without losing required display/provenance.                |
| `RULE-DATA-004` | Immutable events, quotation versions, Order snapshots, audit events, and communication attempts are not edited in place.  |
| `RULE-DATA-005` | Required accountable mutation and audit evidence commit atomically where specified by Audit policy.                       |
| `RULE-DATA-006` | Ordinary logs are not business history or immutable audit evidence.                                                       |
| `RULE-DATA-007` | Retention, anonymization, deletion, archive, legal hold, and restore policy applies to guest and account records equally. |
| `RULE-DATA-008` | Production/customer data is prohibited in lower environments, fixtures, screenshots, and AI prompts.                      |
| `RULE-DATA-009` | Export is a privileged purpose-bound operation and does not change source records.                                        |
| `RULE-DATA-010` | Legal hold overrides scheduled destruction and is itself audited.                                                         |

## 16. Reporting Rules

| ID             | Rule                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `RULE-REP-001` | A report definition specifies metric meaning, owner, version, filters, timezone, currency, and freshness.                       |
| `RULE-REP-002` | Estimate, draft, sent, accepted, converted, cancelled, and completed values are not combined under one ambiguous revenue label. |
| `RULE-REP-003` | Funnel denominators and exclusions are explicit and stable for the report version.                                              |
| `RULE-REP-004` | Users see only report rows/fields permitted to their role and purpose.                                                          |
| `RULE-REP-005` | Export scope is reauthorized at generation and download.                                                                        |

## 17. Rule Change Process

- Rule changes require Product ownership and affected Sales, Operations, Finance, Customer Service, Security, Data, QA, and localization review.
- Changing a rule requires impact analysis across requirements, stories, criteria, lifecycle, permissions, pricing, catalog, data, reports, active quotations/orders, and configuration.
- A rule that changes historical meaning requires a versioned migration/interpretation plan.
- Temporary exceptions MUST use the Constitution's exception process and MUST NOT weaken mandatory Sales review, tracking privacy, role boundaries, lifecycle integrity, or audit evidence.
