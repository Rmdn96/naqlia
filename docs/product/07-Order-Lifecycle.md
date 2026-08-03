# Naqlia Order Lifecycle

| Document field | Value                                                                              |
| -------------- | ---------------------------------------------------------------------------------- |
| Suite          | Product Documentation Suite (PDS) v1                                               |
| Status         | Approved lifecycle baseline                                                        |
| Version        | 1.0.0                                                                              |
| Parent         | [Business Requirements Specification](./01-Business-Requirements-Specification.md) |
| Owners         | Product, Sales, and Operations                                                     |

## 1. Purpose

This document defines the authoritative lifecycle from visitor intent through completed transport service. It separates customer-facing milestones from the state of each business object so implementation teams do not create one ambiguous status field.

The lifecycle is channel-independent. A UI, future API, administrative action, or approved import MUST invoke the same transition rules, permissions, audit evidence, and side effects.

## 2. Lifecycle Model

The approved business sequence is:

```mermaid
flowchart LR
  Visitor["Visitor"] -->|"submits eligible request"| Lead["Lead"]
  Lead -->|"qualified"| Quotation["Quotation"]
  Quotation -->|"customer accepts + approvals pass"| Approved["Approved milestone"]
  Approved -->|"atomic conversion"| Order["Order"]
  Order -->|"starts service"| Execution["Execution"]
  Execution -->|"completion recorded"| Completed["Completed"]
```

`Visitor` is an actor state. `Approved` is a business milestone. `Lead`, `Quotation`, `Order`, and `Execution` are governed records with independent lifecycle states. Implementations MUST NOT collapse these concepts into a single status.

## 3. Universal Transition Contract

Every state-changing operation MUST define and enforce:

- current state and requested next state;
- authorized actor and purpose;
- preconditions and blocking validation;
- transition timestamp in UTC and business timezone context where relevant;
- human-readable reason and structured reason code when required;
- responsible owner or assignee;
- immutable transition and audit evidence;
- customer or internal communication triggered by the transition;
- idempotency behavior and concurrency protection;
- downstream effects, including whether they commit atomically; and
- reversal, correction, or compensation path.

Direct state editing, skipped transitions, silent rollback, and history rewriting are prohibited. A retried request with the same idempotency identity MUST return the original outcome rather than create a duplicate transition.

## 4. Visitor and Request Intake

| Stage                 | Entry condition                                               | Valid outcome                                                      | Owner            |
| --------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------- |
| Visitor               | A person enters a Naqlia customer channel                     | Browse services or start a request                                 | Customer         |
| Request draft         | Required journey context has begun but has not been submitted | Continue, abandon, or submit                                       | Customer         |
| Submission validation | Customer attempts submission                                  | Reject with recoverable errors or create exactly one Lead          | Platform         |
| Acknowledged          | Lead creation commits                                         | Show a non-sensitive reference and send configured acknowledgement | Platform / Sales |

A draft is not a Lead. An abandoned draft MUST NOT enter the Sales queue unless a separately approved consent and lead-capture policy exists. Guest and authenticated submissions use the same qualification and lifecycle rules.

## 5. Lead Lifecycle

### 5.1 States

| State          | Meaning                                                     | Permitted next states                                                                 |
| -------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `new`          | Valid request created and awaiting ownership                | `under_review`, `closed`                                                              |
| `under_review` | Sales is validating service fit and details                 | `qualified`, `unqualified`, `closed`                                                  |
| `qualified`    | Request is eligible and sufficiently complete for quotation | `converted`, `under_review`, `closed`                                                 |
| `unqualified`  | Request is not eligible or cannot be served                 | `under_review`, `closed`                                                              |
| `converted`    | A first Quotation has been created from the Lead            | Terminal for conversion; administrative closure may follow without erasing conversion |
| `closed`       | Lead needs no further Sales action                          | Reopen to `under_review` only with reason and permission                              |

### 5.2 Transition Rules

| Transition                     | Actor                                      | Preconditions                                                   | Required effects                                                                    |
| ------------------------------ | ------------------------------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Request → `new`                | Platform                                   | Valid, eligible-form submission; deduplication check passed     | Lead number, intake snapshot, consent evidence, Sales queue item, acknowledgement   |
| `new` → `under_review`         | Sales                                      | Authorized assignment/claim                                     | Assignee and review timestamp                                                       |
| `under_review` → `qualified`   | Sales                                      | Service, route, contact, cargo, and quotation inputs sufficient | Qualification reason and resolved missing fields                                    |
| `under_review` → `unqualified` | Sales                                      | Approved reason applies                                         | Reason code, explanation safe for customer, next-step communication when configured |
| `qualified` → `converted`      | Sales                                      | A valid first Quotation version commits                         | Link to Quotation and conversion event                                              |
| Any nonterminal → `closed`     | Sales / Customer Service within permission | Closure reason exists; no prohibited active dependency          | Closure event and communication decision                                            |

Qualification does not guarantee a price, availability, or order. Reopening a Lead never changes historical Quotation versions.

## 6. Quotation Lifecycle

### 6.1 States

| State                       | Meaning                                                                 | Permitted next states                                                       |
| --------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `draft`                     | Commercial proposal is being prepared and is not customer-visible       | `pending_internal_approval`, `ready_for_sales_review`, `cancelled`          |
| `pending_internal_approval` | Configured approval thresholds require an authorized decision           | `ready_for_sales_review`, `draft`, `cancelled`                              |
| `ready_for_sales_review`    | Calculations and approvals are complete; Sales review is still required | `sent`, `draft`, `cancelled`                                                |
| `sent`                      | Immutable version has been issued to the customer                       | `accepted`, `rejected`, `expired`, `superseded`, `cancelled`                |
| `accepted`                  | Customer accepted this exact unexpired version                          | `converted`, `superseded` only through governed amendment before conversion |
| `rejected`                  | Customer declined this version                                          | Terminal; a new version may supersede it if engagement resumes              |
| `expired`                   | Acceptance window elapsed                                               | Terminal; a new reviewed version is required                                |
| `superseded`                | A newer version replaced this version                                   | Terminal                                                                    |
| `cancelled`                 | Authorized party withdrew the version                                   | Terminal                                                                    |
| `converted`                 | Acceptance and all approvals produced exactly one Order                 | Terminal                                                                    |

### 6.2 Mandatory Gates

Before `sent`, the version MUST have complete line items, pricing inputs, currency/tax treatment, validity period, service scope, exclusions, terms reference, required internal approvals, and an explicit Sales review event. Automated calculation alone can never move a version to `sent`.

Before `accepted`, the platform MUST verify the exact version identity, customer authority/contact verification, current validity, and absence of a superseding version. Acceptance of one version MUST NOT accept any other version.

Before `converted`, the platform MUST revalidate acceptance, approvals, eligibility, and non-conversion; create the Order and its commercial/service snapshot exactly once; and mark the Quotation `converted` in one consistent operation.

### 6.3 Versioning

Any change to price, service scope, route, add-ons, material terms, validity, currency/tax treatment, or customer obligations creates a new immutable Quotation version. Previously sent content remains retrievable for authorized evidence. A corrected display typo that does not alter meaning still requires an audited correction policy; it MUST NOT silently rewrite issued evidence.

## 7. Approved Milestone

The business milestone `Approved` is reached only when:

1. the customer has accepted the current, unexpired Quotation version;
2. every configured internal approval is approved and current;
3. no blocking compliance, eligibility, or operational validation remains; and
4. Order conversion succeeds.

The milestone timestamp is the successful conversion timestamp. Customer acceptance without internal approval is not `Approved`; internal approval without customer acceptance is not `Approved`.

## 8. Order Lifecycle

| State          | Meaning                                                     | Permitted next states                                                 |
| -------------- | ----------------------------------------------------------- | --------------------------------------------------------------------- |
| `confirmed`    | Order exists from an approved Quotation snapshot            | `scheduled`, `cancelled`                                              |
| `scheduled`    | Operations assigned a service window and required resources | `in_execution`, `confirmed`, `cancelled`                              |
| `in_execution` | Authorized Operations actor started service                 | `completed`, `cancelled` only through exceptional cancellation policy |
| `completed`    | Completion evidence and mandatory checks are recorded       | Terminal; correction uses a governed case, not state rewrite          |
| `cancelled`    | Order stopped under the applicable cancellation policy      | Terminal                                                              |

Order creation MUST generate a unique non-secret Order Number, copy the accepted commercial and service snapshot, associate the verified customer mobile, establish Operations ownership, and preserve the source Lead and Quotation lineage.

Scheduling changes do not create a new Order. They create schedule revisions with actor, reason, old/new value, communication outcome, and operational impact. A material service or commercial amendment follows the approved amendment and requotation policy before Operations proceeds.

## 9. Execution Lifecycle

Execution is an operational record linked one-to-one with the active execution of an Order in MVP. Its sub-state MAY be more detailed internally than the customer status.

| State               | Meaning                                                  | Permitted next states                                           |
| ------------------- | -------------------------------------------------------- | --------------------------------------------------------------- |
| `not_started`       | Order has not entered execution                          | `ready`, `cancelled`                                            |
| `ready`             | Required schedule, assignment, and readiness checks pass | `in_progress`, `not_started`, `cancelled`                       |
| `in_progress`       | Service has started                                      | `blocked`, `completion_review`, `cancelled` by exception policy |
| `blocked`           | An exception prevents normal progress                    | `in_progress`, `completion_review`, `cancelled`                 |
| `completion_review` | Work ended and evidence/checks are being verified        | `completed`, `in_progress`, `blocked`                           |
| `completed`         | Completion requirements pass and Order is completed      | Terminal                                                        |
| `cancelled`         | Execution will not continue                              | Terminal                                                        |

An operational exception is a separate case with severity, category, impact, owner, opened/resolved timestamps, resolution, customer communication decision, and blocking flag. Resolving an exception does not erase it.

## 10. Customer-Facing Status Projection

Public status is a privacy-minimized projection, not the internal state graph.

| Customer status concept  | Example internal sources                                                         |
| ------------------------ | -------------------------------------------------------------------------------- |
| Request received         | Lead `new` or `under_review`                                                     |
| Quotation in preparation | Lead `qualified`; Quotation pre-send states                                      |
| Quotation sent           | Quotation `sent`                                                                 |
| Awaiting approval        | Accepted Quotation awaiting a required internal gate                             |
| Order confirmed          | Order `confirmed`                                                                |
| Scheduled                | Order `scheduled`; Execution `ready`                                             |
| In progress              | Order `in_execution`; Execution `in_progress`, `blocked`, or `completion_review` |
| Completed                | Order and Execution `completed`                                                  |
| Cancelled                | Applicable terminal cancellation state                                           |

Labels and descriptions are localized configuration. Public tracking MUST NOT reveal internal review steps, exception details, staff identities, exact addresses, commercial approval notes, or security-sensitive timing.

## 11. Cancellation, Expiry, and Amendment

- Cancellation is never deletion. It requires authority, reason, effective time, applicable policy version, communication outcome, and financial/operational impact where relevant.
- Expiry is evaluated using the issued version's timezone-aware validity rule. Expired versions cannot be revived; a new version is required.
- Customer-requested changes are classified as non-material correction, schedule change, material service change, or cancellation.
- A material service or commercial change after conversion MUST use an approved amendment workflow that preserves the original Order and accepted Quotation evidence.
- The amendment workflow and any cancellation charges MUST be configured and approved before the affected capability is released.

## 12. Concurrency and Failure Handling

- Transitions MUST compare the expected current version/state and reject stale writes.
- Simultaneous customer acceptance, Sales change, expiry, cancellation, or conversion resolves deterministically; no two terminal outcomes may both succeed.
- A failed multi-record transition MUST leave no partial business outcome.
- External communication failure MUST NOT silently undo a committed business state; it creates a retryable communication result visible to authorized staff.
- Operational staff MUST see recoverable guidance and a correlation reference, not raw technical errors.

## 13. Lifecycle Evidence

For every transition, authorized users MUST be able to establish who or what acted, when, from which state, to which state, why, under which rule/configuration version, against which business record version, and whether required communications/effects succeeded. Evidence follows the [Audit Strategy](../05-Audit-Strategy.md) and MUST be queryable without relying on mutable application logs.

## 14. Lifecycle Metrics

At minimum, reporting definitions SHOULD distinguish:

- request-to-Lead success and duplicate suppression;
- time in each Lead, Quotation, Order, and Execution state;
- qualification and unqualification by reason;
- Quotation review, approval, send, acceptance, rejection, expiry, and revision rates;
- accepted-to-Order conversion success and failures;
- schedule changes and operational exceptions;
- completion and cancellation by reason; and
- communication delivery success by lifecycle event.

Metrics MUST use explicit denominators, exclusions, timezone, configuration/version boundaries, and role-safe data.

## 15. Implementation Readiness

A lifecycle increment is not Ready until its state vocabulary, permissions, preconditions, side effects, idempotency, concurrency behavior, notifications, audit evidence, customer projection, metrics, and exception path are approved. It is not Done until all permitted and forbidden transitions are tested at every exposed boundary.
