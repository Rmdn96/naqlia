# Naqlia User Stories

| Document field | Value                                                      |
| -------------- | ---------------------------------------------------------- |
| Suite          | Product Documentation Suite (PDS) v1                       |
| Status         | Approved story baseline                                    |
| Version        | 1.0.0                                                      |
| Parent         | [Functional Requirements](./02-Functional-Requirements.md) |
| Owners         | Product leadership and domain owners                       |

## 1. Purpose

These stories describe user outcomes, not UI layouts or technical tasks. Each story remains subject to its linked Functional Requirements, Acceptance Criteria, Business Rules, permissions, and non-functional requirements.

Priority meanings:

- **MVP:** required for PDS v1 MVP completion.
- **Should:** expected when the related MVP journey is implemented unless explicitly descoped.
- **Future:** not authorized for MVP.

## 2. Visitor and Guest Customer Stories

| ID           | Priority | User story                                                                                                                                                 | Requirement references                   |
| ------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `US-VIS-001` | MVP      | As a visitor, I want Arabic selected by default so that I can understand the service without first changing language.                                      | `FR-I18N-001`, `FR-CAT-002`              |
| `US-VIS-002` | MVP      | As a visitor, I want to switch to English without losing my journey so that I can use my preferred language.                                               | `FR-I18N-002`–`007`                      |
| `US-VIS-003` | MVP      | As a visitor, I want to see currently available moving, cargo, local, intercity, packing, and loading/unloading options so that I request a valid service. | `FR-CAT-001`–`010`                       |
| `US-VIS-004` | MVP      | As a visitor, I want route eligibility explained before submission so that I do not expect service outside coverage.                                       | `FR-CAT-004`–`008`                       |
| `US-GST-001` | MVP      | As a guest, I want to submit a service request without creating an account so that registration does not block me.                                         | `FR-REQ-001`, `FR-AUTH-002`              |
| `US-GST-002` | MVP      | As a guest, I want the form to ask only questions relevant to my selected service so that I can complete it efficiently.                                   | `FR-REQ-006`–`012`                       |
| `US-GST-003` | MVP      | As a furniture-moving customer, I want to describe items and property access so that Sales can quote accurately.                                           | `FR-REQ-010`                             |
| `US-GST-004` | MVP      | As a cargo customer, I want to describe cargo quantity and handling needs so that Sales can assess the job.                                                | `FR-REQ-011`                             |
| `US-GST-005` | MVP      | As a guest, I want clear validation that preserves correct input so that I can fix mistakes without restarting.                                            | `FR-REQ-013`, `FR-REQ-014`, `FR-REQ-020` |
| `US-GST-006` | MVP      | As a guest, I want one acknowledgement and reference after submission so that I know my request reached Sales.                                             | `FR-REQ-015`–`019`                       |
| `US-GST-007` | MVP      | As a guest, I want acknowledgement that price is not final until Sales reviews it so that expectations are accurate.                                       | `FR-REQ-017`, `FR-QUO-008`               |
| `US-GST-008` | Should   | As a guest, I want my in-progress form preserved briefly on my device so that a recoverable interruption does not lose work.                               | `FR-REQ-004`, `FR-REQ-005`               |

## 3. Customer Quotation and Order Stories

| ID           | Priority | User story                                                                                                                                                 | Requirement references     |
| ------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `US-CUS-001` | MVP      | As a customer, I want a clear localized quotation showing services, price lines, assumptions, validity, and terms so that I can make an informed decision. | `FR-QUO-014`, `FR-QUO-015` |
| `US-CUS-002` | MVP      | As a customer, I want to accept or reject only the current valid quotation so that an old offer cannot be used accidentally.                               | `FR-QUO-016`, `FR-QUO-020` |
| `US-CUS-003` | MVP      | As a customer, I want acceptance recorded with the exact version and terms so that agreement is unambiguous.                                               | `FR-QUO-017`–`019`         |
| `US-CUS-004` | MVP      | As a customer, I want an Order Number after approval so that I can refer to and track my service.                                                          | `FR-ORD-001`–`008`         |
| `US-CUS-005` | MVP      | As a customer, I want material scheduling, execution, cancellation, and completion updates in my language so that I know what happens next.                | `FR-COM-001`–`005`         |
| `US-CUS-006` | MVP      | As a customer, I want to track with Order Number and Mobile Number without an account so that status remains accessible.                                   | `FR-TRK-001`–`010`         |
| `US-CUS-007` | MVP      | As a customer, I want tracking to show only useful safe status information so that my private details are protected.                                       | `FR-TRK-003`–`007`         |
| `US-CUS-008` | MVP      | As a customer, I want a clear support contact and next step when tracking succeeds so that I can resolve questions.                                        | `FR-TRK-004`, `FR-COM-006` |
| `US-CUS-009` | Should   | As a customer, I want a corrected mobile number to require verification so that another person cannot take over tracking.                                  | `FR-TRK-009`, `FR-COM-008` |
| `US-CUS-010` | MVP      | As a customer, I want cancellation or commercial amendments explained and preserved so that the original agreement is not hidden.                          | `FR-ORD-010`, `FR-EXE-012` |

## 4. Registered Customer Stories

| ID           | Priority | User story                                                                                                                              | Requirement references      |
| ------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `US-ACC-001` | MVP      | As a customer, I want to use Email, Google, or Apple to create/sign in to an optional account.                                          | `FR-AUTH-001`               |
| `US-ACC-002` | MVP      | As a registered customer, I want to submit the same service request without duplicate account barriers.                                 | `FR-AUTH-002`, `FR-REQ-002` |
| `US-ACC-003` | Should   | As a registered customer, I want eligible guest records linked after verification so that I can see prior activity.                     | `FR-AUTH-003`–`005`         |
| `US-ACC-004` | Should   | As a registered customer, I want an authorized history of requests, quotations, and orders so that I need not reenter tracking details. | `FR-AUTH-006`, `FR-TRK-010` |
| `US-ACC-005` | MVP      | As a registered customer, I want safe behavior when a provider fails or my session expires so that my information is protected.         | `FR-AUTH-007`–`009`         |

## 5. Sales Stories

| ID           | Priority | User story                                                                                                                            | Requirement references       |
| ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `US-SAL-001` | MVP      | As Sales, I want every valid request routed as a new Lead so that no supported request is lost.                                       | `FR-LEAD-001`                |
| `US-SAL-002` | MVP      | As Sales, I want to search, filter, claim, and assign Leads so that response ownership is clear.                                      | `FR-LEAD-002`–`004`          |
| `US-SAL-003` | MVP      | As Sales, I want to record clarification and corrections without erasing the original submission so that provenance remains clear.    | `FR-LEAD-005`, `FR-LEAD-006` |
| `US-SAL-004` | MVP      | As Sales, I want configured qualification checks and reasons so that Lead outcomes are consistent.                                    | `FR-LEAD-007`, `FR-LEAD-008` |
| `US-SAL-005` | MVP      | As Sales, I want a structured internal estimate from approved inputs so that quotation preparation is consistent.                     | `FR-QUO-001`–`004`           |
| `US-SAL-006` | MVP      | As Sales, I want to adjust allowed line items with reasons so that human judgment remains accountable.                                | `FR-QUO-005`–`007`           |
| `US-SAL-007` | MVP      | As Sales, I want the platform to block sending until review and approvals are complete so that no draft becomes a final offer.        | `FR-QUO-008`, `FR-QUO-009`   |
| `US-SAL-008` | MVP      | As Sales, I want sent quotation versions frozen and revisions to supersede old versions so that customers cannot accept stale offers. | `FR-QUO-010`–`013`           |
| `US-SAL-009` | MVP      | As Sales, I want to record verified offline customer acceptance so that approved phone/offline agreements remain attributable.        | `FR-QUO-018`, `FR-QUO-019`   |
| `US-SAL-010` | MVP      | As Sales, I want accepted quotations converted once into an Order so that Operations receives the correct commitment.                 | `FR-ORD-001`–`008`           |
| `US-SAL-011` | MVP      | As Sales, I want to reopen a Lead only with permission and current revalidation so that old assumptions are not reused silently.      | `FR-LEAD-011`                |

## 6. Operations Stories

| ID           | Priority | User story                                                                                                                  | Requirement references                   |
| ------------ | -------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `US-OPS-001` | MVP      | As Operations, I want new confirmed Orders in an intake queue so that I can review readiness.                               | `FR-ORD-008`, `FR-ORD-009`               |
| `US-OPS-002` | MVP      | As Operations, I want to schedule only ready Orders in valid windows so that the service commitment is executable.          | `FR-EXE-001`–`004`                       |
| `US-OPS-003` | MVP      | As Operations, I want to record accountable start and progress milestones so that internal and customer status are current. | `FR-EXE-005`, `FR-EXE-006`               |
| `US-OPS-004` | MVP      | As Operations, I want to open, own, resolve, and communicate exceptions so that service problems are controlled.            | `FR-EXE-007`–`009`                       |
| `US-OPS-005` | MVP      | As Operations, I want blocking exceptions to prevent completion so that records do not show false success.                  | `FR-EXE-008`                             |
| `US-OPS-006` | MVP      | As Operations, I want configured completion checks so that Completed has consistent meaning.                                | `FR-EXE-010`, `FR-EXE-011`               |
| `US-OPS-007` | MVP      | As Operations, I want controlled cancellation and correction so that consequence and history remain clear.                  | `FR-EXE-012`–`014`                       |
| `US-OPS-008` | Should   | As Operations, I want governed coverage and scheduling configuration so that availability can change without code.          | `FR-ADM-009`, `FR-ADM-014`, `FR-ADM-015` |

## 7. Finance Stories

| ID           | Priority | User story                                                                                                                                 | Requirement references                   |
| ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| `US-FIN-001` | MVP      | As Finance, I want pricing components, currency/tax presentation, minimums, and thresholds governed through published configuration.       | `FR-ADM-010`                             |
| `US-FIN-002` | MVP      | As Finance, I want to approve or reject adjustments beyond configured Sales authority so that commercial risk is controlled.               | `FR-QUO-006`, `FR-QUO-019`               |
| `US-FIN-003` | MVP      | As Finance, I want estimate, sent, accepted, and order-snapshot values separated in reporting so that financial meaning is clear.          | `FR-REP-004`                             |
| `US-FIN-004` | MVP      | As Finance, I want every pricing version, adjustment, approval, and commercial snapshot attributable so that disputes can be investigated. | `FR-QUO-003`, `FR-QUO-013`, `FR-REP-006` |
| `US-FIN-005` | MVP      | As Finance, I want historical quotations unaffected by new price configuration so that prior offers remain trustworthy.                    | `FR-ADM-006`, `FR-ORD-003`, `FR-ORD-004` |

## 8. Customer Service Stories

| ID          | Priority | User story                                                                                                                                | Requirement references     |
| ----------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `US-CS-001` | MVP      | As Customer Service, I want to find a customer record through authorized search so that I can answer a support request.                   | `FR-COM-006`, `FR-REP-001` |
| `US-CS-002` | MVP      | As Customer Service, I want to see safe current status and communication history so that my response is accurate.                         | `FR-COM-006`, `FR-REP-007` |
| `US-CS-003` | MVP      | As Customer Service, I want to record contact reason, outcome, and escalation so that follow-up ownership is clear.                       | `FR-COM-006`               |
| `US-CS-004` | MVP      | As Customer Service, I want protected correction workflows for customer contact values so that tracking identity is not changed casually. | `FR-COM-008`, `FR-TRK-009` |
| `US-CS-005` | MVP      | As Customer Service, I want the system to prevent me from changing prices or operational states so that duty separation is preserved.     | `FR-COM-007`               |

## 9. Super Admin Stories

| ID           | Priority | User story                                                                                                                                               | Requirement references                   |
| ------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `US-ADM-001` | MVP      | As Super Admin, I want to manage draft and published business configuration so that values change without code deployment.                               | `FR-ADM-001`–`007`                       |
| `US-ADM-002` | MVP      | As Super Admin, I want publication validation and impact preview so that invalid combinations do not reach customers.                                    | `FR-ADM-004`, `FR-ADM-014`, `FR-ADM-015` |
| `US-ADM-003` | MVP      | As Super Admin, I want to govern catalog, coverage, schedule, content, status labels, communication, and references within my permissions.               | `FR-ADM-008`–`012`                       |
| `US-ADM-004` | MVP      | As Super Admin, I want configuration versions and rollback by supersession so that production changes remain accountable and recoverable.                | `FR-ADM-005`–`007`                       |
| `US-ADM-005` | MVP      | As Super Admin, I want to invite, suspend, and revoke named internal users and roles so that access remains current.                                     | `FR-IAM-001`–`009`                       |
| `US-ADM-006` | MVP      | As Super Admin, I want my application role explicitly separated from database/service-role access so that product administration cannot bypass security. | `FR-IAM-007`                             |

## 10. Cross-Role Reporting and Audit Stories

| ID           | Priority | User story                                                                                                                            | Requirement references     |
| ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `US-REP-001` | MVP      | As an authorized manager, I want funnel and operations metrics with clear definitions so that I can identify bottlenecks.             | `FR-REP-003`, `FR-REP-008` |
| `US-REP-002` | MVP      | As an authorized user, I want filters, counts, sorting, and pagination to have deterministic scope so that reports are interpretable. | `FR-REP-002`               |
| `US-REP-003` | MVP      | As an authorized reviewer, I want material actions and configuration changes attributable so that governance can be verified.         | `FR-REP-006`, `FR-REP-007` |
| `US-REP-004` | Should   | As an authorized role, I want a minimized purpose-bound export so that approved analysis can occur safely.                            | `FR-REP-005`               |

## 11. Future Stories

| ID           | Priority | User story                                                                                          |
| ------------ | -------- | --------------------------------------------------------------------------------------------------- |
| `US-FUT-001` | Future   | As a customer, I want live vehicle location and ETA when an approved tracking model exists.         |
| `US-FUT-002` | Future   | As a driver, I want a mobile/offline workflow for assigned work and proof capture.                  |
| `US-FUT-003` | Future   | As a customer, I want to pay online and receive governed invoices/refunds.                          |
| `US-FUT-004` | Future   | As a logistics organization, I want self-service tenant onboarding and organization administration. |
| `US-FUT-005` | Future   | As Operations, I want carrier/subcontractor collaboration and capacity optimization.                |
| `US-FUT-006` | Future   | As Sales, I want approved assistive recommendations while retaining mandatory human final review.   |
| `US-FUT-007` | Future   | As a customer outside the Riyadh-origin model, I want additional domestic coverage.                 |

## 12. Story Readiness Rules

A story is not ready until it has:

- a named actor and measurable outcome;
- linked `BRS`, `FR`, `NFR`, `AC`, and `RULE` identifiers;
- Arabic/English terminology and all user states;
- permission, data, privacy, and audit requirements;
- configuration dependencies and default behavior;
- implementation owner and test layers; and
- explicit non-goals and release/rollback implications.
