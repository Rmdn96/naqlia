# Naqlk Acceptance Criteria

| Document field | Value                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------ |
| Suite          | Product Documentation Suite (PDS) v1                                                             |
| Status         | Approved acceptance baseline                                                                     |
| Version        | 1.0.0                                                                                            |
| Parents        | [Functional Requirements](./02-Functional-Requirements.md), [User Stories](./04-User-Stories.md) |
| Owners         | Product and QA leadership                                                                        |

## 1. Purpose

These criteria define observable evidence required to accept PDS v1 behavior. They do not prescribe UI, API, database, or test implementation.

The Given/When/Then language describes business conditions:

- **Given:** required starting state and authorization.
- **When:** one actor action or system event.
- **Then:** externally observable result and protected invariants.

Every applicable Non-Functional Requirement remains part of acceptance even when not repeated in a criterion.

## 2. Global Acceptance Rules

| ID           | Given                                               | When                                               | Then                                                                                                          |
| ------------ | --------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `AC-GEN-001` | No valid locale preference exists                   | A public journey begins                            | Arabic is active, document direction is RTL, and Arabic content is complete.                                  |
| `AC-GEN-002` | A user is in a supported journey with valid context | The user changes between Arabic and English        | The equivalent context remains, direction changes correctly, and safe valid input is preserved.               |
| `AC-GEN-003` | A business value is needed                          | The platform displays or validates that value      | The value comes from active published configuration, not an embedded business constant.                       |
| `AC-GEN-004` | A protected action is attempted                     | The actor lacks required current permission        | The action is denied at trusted boundaries, no state changes, and the response exposes no protected detail.   |
| `AC-GEN-005` | A mutable record has a newer version                | An actor submits an operation based on stale state | The operation is rejected as conflict, current data is preserved, and recovery guidance is provided.          |
| `AC-GEN-006` | A required external delivery fails                  | The owned retry policy is eligible                 | Business truth remains durable, retries are bounded/idempotent, and terminal failure is visible to operators. |

## 3. Catalog and Geography

| ID           | Given                                                                                            | When                         | Then                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------ | ---------------------------- | --------------------------------------------------------------------------------- |
| `AC-CAT-001` | A cargo service, route class, and add-on are published and effective                             | A visitor reviews services   | The entries appear with reviewed Arabic/English content and current availability. |
| `AC-CAT-002` | A catalog value is draft, retired, disabled, or outside its effective period                     | A visitor reviews or submits | The value cannot be newly selected or submitted.                                  |
| `AC-CAT-003` | Origin and destination are inside enabled Riyadh coverage                                        | Eligibility is evaluated     | Route class is Local Transport.                                                   |
| `AC-CAT-004` | Origin is inside enabled Riyadh coverage and destination is an enabled Saudi city outside Riyadh | Eligibility is evaluated     | Route class is Intercity Transport.                                               |
| `AC-CAT-005` | Origin is outside enabled Riyadh coverage                                                        | Eligibility is evaluated     | The MVP route is unavailable and no quotation/order promise is made.              |
| `AC-CAT-006` | A Packing or Loading & Unloading add-on is selected without an eligible cargo/route combination  | Submission is attempted      | Submission is blocked with localized guidance.                                    |
| `AC-CAT-007` | A catalog label/configuration changes after a quotation/order exists                             | Historical record is viewed  | The retained historical label/version is shown for the historical fact.           |

## 4. Guest Request Intake

| ID           | Given                                                                           | When                                      | Then                                                                                               |
| ------------ | ------------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `AC-REQ-001` | The visitor is unauthenticated and has an eligible service combination          | A complete valid request is submitted     | Exactly one Lead and submission snapshot are created without requiring account creation.           |
| `AC-REQ-002` | The customer has a registered account                                           | The same valid request is submitted       | It follows the same eligibility and required-data rules as a guest and records account provenance. |
| `AC-REQ-003` | Common required data is missing                                                 | Submission is attempted                   | No Lead is created; field and summary errors identify required corrections in the active language. |
| `AC-REQ-004` | The route/service-specific configuration requires questions                     | The selected service changes              | Only applicable questions/choices/limits are presented and enforced.                               |
| `AC-REQ-005` | A Furniture Moving request lacks a configured required access/inventory answer  | Submission is attempted                   | No Lead is created and the exact missing business input is identified.                             |
| `AC-REQ-006` | A General Cargo request violates a configured cargo category/size/handling rule | Submission is attempted                   | No Lead is created and safe eligibility guidance is provided.                                      |
| `AC-REQ-007` | A valid request is submitted twice with the same idempotency identity           | The second submission arrives             | At most one Lead is created and the same safe outcome/reference is returned.                       |
| `AC-REQ-008` | A submitted request resembles another request under duplicate rules             | Lead creation succeeds                    | The new/existing record is flagged for Sales review; neither record is silently deleted or merged. |
| `AC-REQ-009` | Submission succeeds                                                             | Acknowledgement is displayed/sent         | It includes safe reference, expected next step, and states that final price requires Sales review. |
| `AC-REQ-010` | Submission fails before durable Lead creation                                   | The customer receives the outcome         | The outcome does not claim success and valid input is preserved when safe.                         |
| `AC-REQ-011` | Consent text/version is required                                                | A valid request is submitted              | Consent version, result, time, locale, and source are retained with the snapshot.                  |
| `AC-REQ-012` | A disabled value was loaded in an older draft                                   | Submission occurs after value disablement | Current eligibility is revalidated and invalid submission is blocked without corrupting the draft. |

## 5. Optional Account

| ID            | Given                                                                      | When                                       | Then                                                                                           |
| ------------- | -------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `AC-AUTH-001` | Account authentication is available                                        | A customer chooses Email, Google, or Apple | The approved provider flow is offered with equivalent account capability.                      |
| `AC-AUTH-002` | Authentication is unavailable or declined                                  | A customer requests or tracks a service    | Guest request and Order Number + Mobile Number tracking remain available.                      |
| `AC-AUTH-003` | A signed-in customer proves control of an eligible guest record            | Linking is confirmed                       | The record becomes available to that account without changing commercial/history/mobile facts. |
| `AC-AUTH-004` | A signed-in customer cannot prove control or record is already conflicting | Linking is attempted                       | Linking is denied safely, no record is exposed, and support escalation is available.           |
| `AC-AUTH-005` | A customer session expires                                                 | A protected account action is attempted    | Reauthentication is required; no protected data is exposed and safe unsaved input is handled.  |
| `AC-AUTH-006` | A customer account is disabled                                             | Internal history retention is evaluated    | Required Lead/Quotation/Order history remains; new account access is denied.                   |

## 6. Lead Management

| ID            | Given                                                    | When                                    | Then                                                                                                         |
| ------------- | -------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `AC-LEAD-001` | A valid request is accepted                              | Lead is created                         | Lead state is `new`, Sales queue is assigned, and source/configuration provenance exists.                    |
| `AC-LEAD-002` | An unassigned new Lead exists                            | Authorized Sales claims it              | Owner and first-action time are recorded and state becomes `under_review`.                                   |
| `AC-LEAD-003` | An unauthorized role views the Lead queue                | Search is performed                     | Only permitted minimized records/actions appear; pricing/qualification actions remain unavailable.           |
| `AC-LEAD-004` | Sales changes a customer-provided fact                   | The correction is saved                 | Original value, revised value, actor, time, source, and reason/provenance remain available.                  |
| `AC-LEAD-005` | Required qualification data and eligibility are complete | Sales qualifies the Lead                | State becomes `qualified`, actor/time are recorded, and quotation drafting becomes allowed.                  |
| `AC-LEAD-006` | A required qualification rule fails                      | Sales marks the Lead unqualified        | A configured reason is required, no Order can be created, and customer contact need is recorded.             |
| `AC-LEAD-007` | A closed/unqualified Lead exists                         | Authorized Sales reopens it with reason | Current service/configuration is revalidated, history is appended, and state becomes appropriate for review. |
| `AC-LEAD-008` | A Lead is converted successfully                         | Current Lead is inspected               | State is `converted` and the Order reference is present; conversion cannot be repeated.                      |

## 7. Quotation and Pricing

| ID           | Given                                                                                             | When                                                | Then                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `AC-QUO-001` | A qualified Lead and active pricing configuration exist                                           | Sales starts a quotation                            | A draft uses the accepted Lead snapshot and records pricing input/configuration versions.           |
| `AC-QUO-002` | A system estimate is produced                                                                     | Sales reviews the draft                             | It is visibly internal/non-final and cannot be sent without Sales review.                           |
| `AC-QUO-003` | Sales makes an allowed adjustment                                                                 | Draft is saved                                      | Adjustment amount and configured reason are recorded and totals recalculate deterministically.      |
| `AC-QUO-004` | An adjustment exceeds Sales threshold                                                             | Sales attempts to send                              | Sending is blocked until required Finance/Super Admin approval is recorded.                         |
| `AC-QUO-005` | Required localized terms, validity, line items, tax/currency presentation, or approval is missing | Sales attempts to send                              | Sending is blocked with exact internal validation; no customer delivery occurs.                     |
| `AC-QUO-006` | A complete approved draft exists                                                                  | Named Sales reviewer sends it                       | An immutable version is created, marked `sent`, and delivery/reviewer/version evidence is recorded. |
| `AC-QUO-007` | A sent quotation exists                                                                           | Sales changes any customer-visible/commercial value | A new draft/version is required; the sent version remains unchanged.                                |
| `AC-QUO-008` | A new version is sent                                                                             | A previous version was active                       | Previous version becomes `superseded` and cannot be accepted.                                       |
| `AC-QUO-009` | The current quotation is sent and unexpired                                                       | Authorized customer accepts it                      | Exact version, terms, identity evidence, time, and channel are recorded.                            |
| `AC-QUO-010` | The current quotation is sent and unexpired                                                       | Customer rejects it                                 | State becomes `rejected`, reason may be captured safely, and no Order is created.                   |
| `AC-QUO-011` | Quotation is expired/superseded/rejected/cancelled                                                | Acceptance is attempted                             | Acceptance is denied, no Approved milestone or Order occurs, and safe next steps are shown.         |
| `AC-QUO-012` | Sales received verified offline customer acceptance                                               | Authorized Sales records it                         | Source/evidence, actor, time, and accepted version are mandatory; approval rules still apply.       |
| `AC-QUO-013` | Customer acceptance exists but internal approval is pending                                       | Approval state is evaluated                         | Business stage is not Approved and conversion remains blocked.                                      |
| `AC-QUO-014` | Customer acceptance and all internal approvals exist                                              | Approval state is evaluated                         | Approved milestone is recorded once and conversion becomes eligible.                                |

## 8. Order Conversion

| ID           | Given                                           | When                             | Then                                                                                                                                                          |
| ------------ | ----------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AC-ORD-001` | One approved active quotation version exists    | Authorized conversion succeeds   | Exactly one Order with one immutable Order Number is created from that version.                                                                               |
| `AC-ORD-002` | The same conversion is retried                  | Idempotency is evaluated         | The existing Order is returned/recognized and no duplicate Order is created.                                                                                  |
| `AC-ORD-003` | Quotation lacks acceptance or required approval | Conversion is attempted          | Conversion is denied and Lead/Quotation remain unchanged except safe audit/diagnostic evidence.                                                               |
| `AC-ORD-004` | Conversion transaction fails                    | Outcome is returned              | No false Order Number is communicated; quotation remains recoverable for retry/reconciliation.                                                                |
| `AC-ORD-005` | Order is created                                | Commercial snapshot is inspected | It matches the accepted quotation version, including customer, service, route, schedule assumptions, line items, totals, terms, and configuration references. |
| `AC-ORD-006` | Customer/catalog/pricing changes after creation | Existing Order is viewed         | The original Order snapshot remains unchanged.                                                                                                                |
| `AC-ORD-007` | Order creation completes                        | Workflow states are inspected    | Order is `confirmed`, Lead is `converted`, quotation is `converted`, and Operations queue receives the Order atomically.                                      |
| `AC-ORD-008` | Order is created                                | Customer acknowledgement occurs  | Customer receives Order Number, tracking instructions, and next step in preferred language.                                                                   |

## 9. Scheduling, Execution, and Completion

| ID           | Given                                                     | When                                                  | Then                                                                                                              |
| ------------ | --------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `AC-EXE-001` | A confirmed Order lacks readiness fields                  | Operations tries to schedule                          | Scheduling is blocked and missing readiness requirements are shown.                                               |
| `AC-EXE-002` | A ready confirmed Order and valid window exist            | Operations schedules                                  | State becomes `scheduled`; owner, window, actor, and time are recorded.                                           |
| `AC-EXE-003` | A schedule conflicts with active operational availability | Scheduling is attempted                               | The action is blocked or requires an approved exception path; accepted commercial terms are not silently changed. |
| `AC-EXE-004` | A scheduled Order exists                                  | Authorized Operations starts execution                | State becomes `in_execution`, actual start is recorded, and customer-facing status updates.                       |
| `AC-EXE-005` | Order is not in an allowed source state                   | Start/completion/cancellation transition is attempted | Transition is denied and current state/history remain consistent.                                                 |
| `AC-EXE-006` | An operational issue occurs                               | Operations opens an exception                         | Category, severity, owner, visibility, time, and description are retained.                                        |
| `AC-EXE-007` | A blocking exception is open                              | Completion is attempted                               | Completion is blocked unless an authorized audited override meets configured rules.                               |
| `AC-EXE-008` | An exception is resolved                                  | Operations records resolution                         | Resolution actor/time/action and customer communication need are appended; prior events remain.                   |
| `AC-EXE-009` | Required completion checks are incomplete                 | Completion is attempted                               | Completion is blocked with exact missing checks.                                                                  |
| `AC-EXE-010` | Order is in execution and completion checks pass          | Authorized Operations completes                       | State becomes `completed`, actual completion and evidence are recorded, and customer notification is requested.   |
| `AC-EXE-011` | An Order is completed                                     | Ordinary edit/transition is attempted                 | Terminal state is preserved; only an authorized correction process can add a superseding fact.                    |
| `AC-EXE-012` | Cancellation is allowed in current state                  | Authorized actor cancels with reason                  | State becomes `cancelled`, operational/financial/customer effects are recorded, and history is preserved.         |

## 10. Public Tracking

| ID           | Given                                                  | When                                                                     | Then                                                                                                                                                |
| ------------ | ------------------------------------------------------ | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AC-TRK-001` | A current Order exists                                 | Customer enters exact Order Number and matching normalized Mobile Number | Customer-safe tracking information is returned without requiring an account.                                                                        |
| `AC-TRK-002` | Order Number is valid but Mobile Number does not match | Tracking is requested                                                    | Generic denial is returned with no confirmation that the Order exists.                                                                              |
| `AC-TRK-003` | Order Number is nonexistent or malformed               | Tracking is requested                                                    | The same generic denial semantics as a mismatch apply.                                                                                              |
| `AC-TRK-004` | Rate/abuse threshold is exceeded                       | Tracking is requested                                                    | Safe throttling occurs without revealing record existence and monitoring evidence is generated.                                                     |
| `AC-TRK-005` | Matching tracking succeeds                             | Response is inspected                                                    | It contains only Order Number, service, route class, city-level route, schedule window, mapped status, last update, next step, and support contact. |
| `AC-TRK-006` | Matching tracking succeeds                             | Protected fields are inspected                                           | Precise address, internal note, staff identity, internal exception, price rule, attachment, and other-order data are absent.                        |
| `AC-TRK-007` | Internal state has a published customer mapping        | Tracking is displayed in Arabic/English                                  | Correct localized public label/description appears without altering internal state.                                                                 |
| `AC-TRK-008` | Mobile correction is requested                         | Customer Service processes it                                            | Identity is verified, permission/reason/audit are present, prior value history remains, and future matching uses the approved current value.        |
| `AC-TRK-009` | Historical tracking window has expired                 | Correct pair is submitted                                                | The same generic unavailable response is returned without exposing retention status.                                                                |

## 11. Communication and Customer Service

| ID           | Given                                                                    | When                                        | Then                                                                                                                       |
| ------------ | ------------------------------------------------------------------------ | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `AC-COM-001` | A required business event occurs and a published template/channel exists | Communication is requested                  | Correct locale/template/version/event context is recorded and delivery begins independently of business transaction truth. |
| `AC-COM-002` | A template lacks Arabic or English content                               | Publication is attempted                    | Publication is blocked.                                                                                                    |
| `AC-COM-003` | Provider delivery fails transiently                                      | Retry is eligible                           | Attempts are bounded/idempotent and final outcome is visible without duplicating the business event.                       |
| `AC-COM-004` | Delivery succeeds                                                        | Business acceptance/completion is evaluated | Delivery alone does not mark quotation accepted or order completed.                                                        |
| `AC-COM-005` | Customer Service has authorized search criteria                          | A record is found                           | Only permitted customer/status/communication context appears.                                                              |
| `AC-COM-006` | Customer Service tries to change price or execution state                | Action is attempted                         | Action is unavailable/denied and no state changes.                                                                         |
| `AC-COM-007` | Customer Service records contact/escalation                              | Save succeeds                               | Reason, outcome, actor, time, destination team, and ownership are recorded.                                                |

## 12. Admin Configuration

| ID           | Given                                                                                                                 | When                                    | Then                                                                                                    |
| ------------ | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `AC-ADM-001` | Authorized editor creates a configuration draft                                                                       | Draft is saved                          | It has stable key, type, scope, owner, version, localized description, and no production effect.        |
| `AC-ADM-002` | Draft is incomplete, contradictory, overlapping, missing localization, or references disabled values                  | Validation/publication is attempted     | Validation fails with actionable internal detail and production remains unchanged.                      |
| `AC-ADM-003` | Draft is valid and actor has publication permission                                                                   | Publication is confirmed                | New version becomes effective as configured and actor/reason/approval/before-after evidence is audited. |
| `AC-ADM-004` | A published configuration changes                                                                                     | New customer selection occurs           | New effective behavior applies; historical records retain prior snapshots.                              |
| `AC-ADM-005` | A published version causes an issue                                                                                   | Authorized rollback/supersession occurs | A new audited effective version is published; prior history is not rewritten.                           |
| `AC-ADM-006` | Disabling a value affects active drafts/quotes/orders                                                                 | Publication is prepared                 | Impact preview and explicit treatment are required before publication.                                  |
| `AC-ADM-007` | An actor lacks category permission                                                                                    | Configuration action is attempted       | Read/write/publish action is denied according to the permission matrix.                                 |
| `AC-ADM-008` | An administrator attempts to disable mandatory Sales review, audit, security, lifecycle integrity, or language parity | Change is submitted                     | Change is impossible/denied because these are constitutional invariants.                                |

## 13. Roles and Permissions

| ID           | Given                                                                 | When                                         | Then                                                                                                                |
| ------------ | --------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `AC-IAM-001` | An internal user has no active role                                   | Protected internal access is attempted       | Access is denied.                                                                                                   |
| `AC-IAM-002` | Sales is active                                                       | Sales handles Leads/Quotations               | Sales can perform assigned sales actions but cannot perform Operations/Finance/Super Admin restricted actions.      |
| `AC-IAM-003` | Operations is active                                                  | Operations handles Orders                    | Operations can schedule/execute but cannot change quotation price or publish pricing configuration.                 |
| `AC-IAM-004` | Finance is active                                                     | Finance handles pricing approval             | Finance can review thresholds/configuration/reports but cannot execute orders or manage internal identities.        |
| `AC-IAM-005` | Customer Service is active                                            | Support work occurs                          | Support can search/record/escalate but cannot price, approve, execute, or publish protected configuration.          |
| `AC-IAM-006` | Super Admin is active                                                 | Product administration occurs                | Approved application administration is permitted, but database/service-role/secrets/RLS bypass remains unavailable. |
| `AC-IAM-007` | A role is revoked/suspended                                           | Existing session attempts a protected action | Current authoritative access denies the action and an audit event records the relevant access change.               |
| `AC-IAM-008` | A high-risk action requires additional approval/recent authentication | Actor lacks it                               | Action is blocked without partial state change.                                                                     |

## 14. Reporting, Audit, and Export

| ID           | Given                                                                                    | When                  | Then                                                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `AC-REP-001` | Authorized role selects filters                                                          | A report is generated | Definition version, filters, timezone, currency, generation time, freshness, count, and deterministic pagination/sort are clear. |
| `AC-REP-002` | Finance views commercial reporting                                                       | Values are grouped    | Estimates, sent, accepted, and Order snapshot amounts are distinct.                                                              |
| `AC-REP-003` | A material business/privileged/configuration action succeeds or fails as policy requires | Audit is reviewed     | Actor, target, action, outcome, organization/scope, time, reason/correlation, and retained change evidence are available.        |
| `AC-REP-004` | User lacks export permission or purpose                                                  | Export is requested   | Export is denied and no file/data is produced.                                                                                   |
| `AC-REP-005` | Authorized user requests a minimized export with purpose                                 | Export completes      | Scope/fields are reauthorized, output expires/is protected, and creation/download are audited.                                   |

## 15. Experience and Quality Acceptance

| ID           | Given                                              | When                                     | Then                                                                                                              |
| ------------ | -------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `AC-QLT-001` | A critical journey is reviewed                     | Keyboard-only completion is tested       | Every action is operable with visible logical focus and no trap.                                                  |
| `AC-QLT-002` | Critical Arabic/English journeys exist             | Screen reader and semantic review occurs | Names, roles, headings, errors, status, reading order, and language are understandable.                           |
| `AC-QLT-003` | Supported mobile viewport and zoom/reflow are used | Critical journey is completed            | No task/information loss or page-level horizontal scrolling occurs.                                               |
| `AC-QLT-004` | Representative field/performance profile is used   | Quality tests run                        | Applicable targets in `NFR-PERF-*` pass or an approved exception exists.                                          |
| `AC-QLT-005` | A recoverable server/provider failure occurs       | Customer/internal user sees result       | Safe localized error, preserved valid input, correlation, and permitted next action are provided.                 |
| `AC-QLT-006` | Production release is deployed                     | Smoke/monitoring verification runs       | Intended commit, configuration, locales, critical states, security signals, and rollback readiness are confirmed. |

## 16. Acceptance Evidence Rules

- Each criterion MUST map to automated and/or manual test cases with owner.
- Authorization criteria require both allowed and denied actors.
- Customer criteria require Arabic RTL and English LTR evidence.
- UI criteria require supported mobile and desktop evidence and all material states.
- Configuration criteria require draft, invalid, publish, effective-date, supersede, historical, and permission cases.
- Lifecycle criteria require allowed, invalid, duplicate, stale, failure, and recovery cases.
- Test fixtures MUST be synthetic and contain at least two organization/security contexts where tenant boundaries apply.
- Passing criteria on a local build does not replace deployed release verification.
