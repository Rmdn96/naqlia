# Naqlk Customer Journey

| Document field | Value                                                                              |
| -------------- | ---------------------------------------------------------------------------------- |
| Suite          | Product Documentation Suite (PDS) v1                                               |
| Status         | Approved journey baseline                                                          |
| Version        | 1.0.0                                                                              |
| Parent         | [Business Requirements Specification](./01-Business-Requirements-Specification.md) |
| Owners         | Product, Customer Experience, Sales, and Operations                                |

## 1. Purpose

This document translates the approved workshop journey into an end-to-end, channel-independent customer experience. It specifies customer goals, touchpoints, information, internal ownership, handoffs, controls, and measurable outcomes. It does not prescribe page layouts or implementation technology.

## 2. Experience Principles

The journey MUST be:

- Arabic-first and fully usable in right-to-left presentation, with complete English parity;
- mobile-first, keyboard-operable, screen-reader understandable, and WCAG 2.2 AA conformant;
- guest-first, with account creation offered as a benefit and never required to request a quotation;
- transparent that a Sales representative reviews every request before a final quotation;
- progressive, collecting information when needed and explaining why sensitive data is requested;
- resilient to interruption, retries, validation errors, and communication failure;
- consistent across customer, Sales, Operations, Finance, and Customer Service touchpoints; and
- privacy-minimized, especially in public Order tracking.

## 3. Journey Participants

| Participant         | Journey responsibility                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------- |
| Visitor             | Discovers services and decides whether Naqlk fits the need                                   |
| Guest Customer      | Submits and manages a request through verified contact paths without an account              |
| Registered Customer | Uses the same service journey with account-linked history and profile conveniences           |
| Sales               | Owns Lead qualification, clarification, final Quotation review, and commercial communication |
| Operations          | Owns scheduling readiness, execution, operational exceptions, and completion                 |
| Finance             | Owns configured financial approvals, pricing governance, and finance-safe reporting          |
| Customer Service    | Supports identity-safe enquiries, corrections, communications, and issue triage              |
| Super Admin         | Governs configuration, access, localization, and controlled administrative operations        |

## 4. End-to-End Journey Map

| Stage                 | Customer goal and action                                           | Required experience and information                                                                                            | Internal owner / handoff                | Success evidence                                       |
| --------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- | ------------------------------------------------------ |
| 1. Discover           | Understand what Naqlk transports and where                         | Clear core services, route classes, add-ons, coverage concept, exclusions, Arabic default, no misleading instant-price promise | Product / Admin configuration           | Eligible visitors can identify a relevant service      |
| 2. Configure need     | Select cargo service, route, and optional services                 | Service guidance; origin/destination eligibility; accessible explanations; no hardcoded values                                 | Platform → Sales rules                  | Valid service combination or clear unsupported outcome |
| 3. Describe request   | Provide contact, route, cargo, timing, access, and service details | Progressive disclosure, localized validation, purpose notice, consent, review summary                                          | Platform                                | Complete and valid submission payload                  |
| 4. Submit             | Request Sales review                                               | One deliberate action, duplicate protection, safe retry, no account gate                                                       | Platform → Sales                        | Exactly one Lead and acknowledgement                   |
| 5. Await review       | Know the request is being handled                                  | Reference, expectation wording from configuration, preferred contact path, correction/support route                            | Sales                                   | Ownership and first-response measurement begins        |
| 6. Clarify            | Answer Sales questions                                             | Identity-safe communication, visible scope of requested clarification, preserved decisions                                     | Sales ↔ Customer                        | Qualification information complete                     |
| 7. Review Quotation   | Understand scope, price, add-ons, terms, validity, and exclusions  | Exact version, itemized totals, currency/tax treatment, human-reviewed statement, accessible bilingual content                 | Sales; Finance if threshold approval    | Sent version and delivery result                       |
| 8. Decide             | Accept or reject the exact current Quotation                       | Explicit decision, expiry/supersession protection, acknowledgement, no accidental acceptance                                   | Customer → Sales / Finance gate         | Verified acceptance/rejection evidence                 |
| 9. Order confirmation | Know an Order exists and what happens next                         | Order Number, service snapshot summary, status, support route, no exposure of secrets                                          | Sales → Operations                      | Exactly one Order from accepted version                |
| 10. Schedule          | Agree on configured service window                                 | Schedule or revision, preparation instructions, accessible notification, change policy                                         | Operations ↔ Customer                   | Confirmed schedule revision and delivery result        |
| 11. Execute           | Receive the agreed transport service                               | Appropriate progress messages; issue route; no false precision or unavailable live tracking                                    | Operations                              | Start, exception, and progress evidence                |
| 12. Track             | Check current Order status                                         | Order Number + matching Mobile Number; generic denial; minimal localized status and update time                                | Platform / Customer Service             | Authorized status result without disclosure            |
| 13. Complete          | Confirm service completion and understand next steps               | Completion status, summary, configured support/feedback path                                                                   | Operations → Customer Service / Finance | Completion evidence and notification result            |
| 14. Support           | Resolve questions, corrections, or complaints                      | Verified identity, case ownership, status visibility, escalation, preserved history                                            | Customer Service → domain owner         | Resolution and communication evidence                  |

## 5. Request Intake Experience

### 5.1 Information Sequence

The preferred sequence is intent before identity:

1. language and service explanation;
2. Cargo Service;
3. Route Class, origin, and destination;
4. optional services;
5. cargo and access details relevant to the selection;
6. preferred timing and special instructions;
7. customer name, Saudi mobile number, and other enabled contact method;
8. privacy notice, consent/acknowledgement, and submission review; and
9. confirmation and reference.

The UI MAY adapt question order after usability testing, but MUST preserve required data, clear context, keyboard focus, error recovery, and rules. It MUST NOT request account creation before guest submission.

### 5.2 Validation

- Validate as early as helpful without interrupting input or exposing internal rules.
- Preserve valid answers after any recoverable error.
- Associate each error with its field and provide a summary when multiple errors exist.
- Explain an unsupported route/service combination and provide configured support guidance without creating false availability.
- On uncertain submission outcome, allow safe retry and show one final Lead reference.

## 6. Guest and Account Paths

Guest and registered customers receive the same catalog, qualification, Quotation review, lifecycle integrity, and support standards.

| Capability              | Guest                                      | Registered customer                                            |
| ----------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| Request service         | Required in MVP                            | Required in MVP                                                |
| Receive Quotation       | Through verified contact path              | Through verified contact path and account context when enabled |
| Accept/reject Quotation | Verified exact-version flow                | Authenticated and reverified when risk requires                |
| Track Order             | Order Number + Mobile Number               | Same public method; account view MAY add convenient history    |
| View history            | Not promised beyond verified links/support | Account-linked history where identity matching is approved     |
| Save preferences        | Not required                               | MAY be offered with explicit controls                          |

Email, Google, and Apple authentication methods MUST converge on one account identity policy. Authentication method parity MUST NOT change commercial eligibility or service priority.

## 7. Communication Journey

| Event                               | Customer communication requirement                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Lead created                        | Acknowledge receipt, provide safe reference, and set configurable expectation without promising acceptance or price |
| Clarification needed                | Explain requested information and a verified response path                                                          |
| Request unqualified/closed          | Provide customer-safe reason and permitted next step where policy allows                                            |
| Quotation sent                      | Identify version, validity, scope, total, currency/tax treatment, decision path, and support route                  |
| Quotation changed                   | State that the previous version is no longer current and require review of the new version                          |
| Quotation accepted/rejected/expired | Confirm outcome and next step; acceptance must not imply Order if internal approval remains                         |
| Order confirmed                     | Provide Order Number, current status, service summary, tracking/support instructions                                |
| Schedule created/changed            | Provide the current window, revision context, preparation guidance, and change/support path                         |
| Execution status materially changes | Send only configured, truthful, customer-useful information                                                         |
| Order completed/cancelled           | Confirm status, effective time, customer-safe reason where applicable, and support path                             |

Delivery success, failure, retry, channel, template version, language, and related business event MUST be recorded. Failed delivery creates staff-visible recovery work and does not reverse the committed lifecycle state.

## 8. Public Tracking Journey

1. The customer enters the Order Number and the same Mobile Number associated with the Order.
2. Both values are normalized and verified together.
3. Invalid, mismatched, unknown, rate-limited, and restricted requests receive the same generic outcome.
4. A valid request returns only configured public status, localized description, last public update time, and safe support guidance.
5. Repeated or suspicious attempts trigger protective controls and auditable security signals without confirming which value was correct.

Order Number is a reference, not an authentication secret. Public tracking MUST NOT expose exact addresses, staff, cargo detail, customer identity, financial detail, internal notes, approval history, exception detail, or other Orders.

## 9. Exception Journeys

| Scenario                      | Customer experience                                                   | Internal response                                                      |
| ----------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Unsupported route/service     | Clear eligibility outcome and configured alternative/support guidance | No false quote; optional consented lead handling only if approved      |
| Missing/ambiguous details     | Preserve request and ask focused questions                            | Sales owns clarification queue and due-time measurement                |
| Duplicate submission          | Show/recover the original result where safe                           | Link attempt to original Lead; no duplicate Sales work                 |
| Quotation expired/superseded  | Prevent acceptance and point to current Sales path                    | Sales prepares a new reviewed version if appropriate                   |
| Concurrent acceptance/change  | One deterministic outcome with clear refresh/review guidance          | Stale operation rejected and audited                                   |
| Schedule change               | Notify affected customer with current revision and support route      | Operations records reason, impact, and communication                   |
| Operational delay/issue       | Truthful, non-technical update and support access                     | Operations opens an exception; Customer Service receives safe context  |
| Tracking verification failure | Generic response; no hint which credential failed                     | Rate limit, observe, and escalate suspicious patterns                  |
| Communication failure         | Alternative/retry according to consent and policy                     | Visible delivery work item; lifecycle state remains accurate           |
| Cancellation                  | Explain effective outcome, next steps, and applicable policy          | Authorized reasoned cancellation with operational/financial assessment |

## 10. Internal Service Blueprint and Handoffs

| Handoff                         | Minimum transfer contract                                                                                                                  | Acceptance owner             |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| Platform → Sales                | Lead reference, consent, normalized contact, service/route selection, details, language, intake/config versions, risk/duplicate indicators | Sales                        |
| Sales → Finance                 | Quotation version, calculation inputs, adjustments, threshold reason, supporting evidence                                                  | Finance                      |
| Sales → Operations              | Approved Order snapshot, customer contact, route, service/add-ons, schedule constraints, access/cargo information, customer obligations    | Operations                   |
| Operations → Customer Service   | Current customer-safe status, communication history, exception summary safe for support, owner/escalation route                            | Customer Service             |
| Operations → Finance            | Completion/cancellation and approved commercial-impact evidence when required                                                              | Finance                      |
| Customer Service → Domain owner | Verified identity, case category, customer statement, evidence, urgency, requested outcome                                                 | Sales / Operations / Finance |

The receiving owner MUST explicitly accept or reject an incomplete handoff. Ownership cannot disappear between queues.

## 11. Content, Localization, and Accessibility

- Arabic is the initial locale and RTL direction; English is a complete LTR alternative.
- Locale switching preserves journey context and never changes data or business outcome.
- Customer-visible service names, statuses, instructions, validation, templates, terms references, dates, numbers, currency, and support content require governed Arabic and English values.
- Translation fallback MUST be intentional and observable; placeholder keys or silent mixed-language content are release blockers.
- Plain language MUST distinguish request, estimate, Quotation, approval, Order, schedule, execution, and completion.
- Color, animation, icons, and spatial direction MUST NOT be the sole means of conveying status or action.
- Focus order, announcements, labels, target size, error recovery, reduced motion, zoom/reflow, and contrast MUST meet the NFR baseline.

## 12. Journey Measurement

Product MUST define owner, formula, source event, exclusions, locale/service/route segmentation, privacy controls, and target before using a metric for release decisions.

Journey measures SHOULD include:

- service discovery-to-start and start-to-valid-submission conversion;
- validation, unsupported-route, abandonment, duplicate, and retry rates;
- Sales first response and clarification cycle time;
- Quotation preparation, delivery, acceptance, rejection, expiry, and revision;
- accepted-to-Order conversion reliability;
- scheduling cycle time and schedule changes;
- tracking success/failure and suspicious-attempt rate;
- operational exception, cancellation, completion, and support-resolution outcomes;
- notification delivery and fallback success; and
- Arabic/English and accessibility parity indicators.

## 13. Journey Readiness and Done

A journey increment is Ready only when customer goal, actor, entry/exit, content, fields, rules, lifecycle, permissions, handoffs, empty/loading/error/offline/retry states, bilingual content, accessibility behavior, audit events, analytics, privacy, support, and test evidence are specified.

It is Done only when the complete thin slice works for guest and applicable account paths; Arabic/RTL and English/LTR; mobile and supported desktop; keyboard and assistive technology; success and failure paths; duplicate/retry/concurrency cases; authorized handoffs; communications; and privacy-safe observability.
