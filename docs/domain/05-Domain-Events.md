# Naqlk Domain Events

| Document field | Value                                                                          |
| -------------- | ------------------------------------------------------------------------------ |
| Suite          | Domain Model Suite v1                                                          |
| Status         | Approved business event contract; no event-bus implementation                  |
| Version        | 1.0.0                                                                          |
| Parent         | [Complete Business Domain Model](./01-Domain-Model.md)                         |
| Owners         | Producing Domain Owners, Data Architecture, Security, and Platform Engineering |

## 1. Purpose

This document defines the durable business events emitted by Naqlk aggregates. Events provide immutable facts for notifications, projections, integrations, mobile synchronization, workflow orchestration, analytics, and later service extraction without allowing consumers to mutate producer-owned data directly.

An event name in this document does not authorize a public API, webhook, queue, analytics pipeline, notification, or future feature. It defines business meaning and compatibility before those delivery mechanisms exist.

## 2. Event Naming and Versioning

Canonical names use:

```text
<domain>.<aggregate>.<past_tense_fact>.v<major>
```

Examples: `lead.lead.created.v1`, `quotation.quotation.sent.v1`, `order.order.completed.v1`.

Rules:

- Names describe completed facts, never commands or UI actions.
- Major version changes when a consumer cannot safely interpret the existing contract. Additive optional payload evolution retains the major version only after compatibility review.
- A name/version is never reused with a different meaning.
- Internal topic, queue, webhook, analytics, and notification names may map from the canonical name but cannot redefine it.
- Events use stable identifiers and machine keys; localized labels are resolved by consumers from captured version/context.

## 3. Canonical Event Envelope

Every persisted Domain Event includes:

| Field                      | Requirement                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| Event identity             | Globally unique stable event identifier                                                       |
| Event name and version     | Registered canonical contract                                                                 |
| Producer                   | Owning domain and aggregate kind                                                              |
| Aggregate identity/version | Stable aggregate identifier and version after the fact                                        |
| Organization context       | Immutable tenant owner; platform scope only for approved platform events                      |
| Business reference         | Safe Lead/Quotation/Order/case reference where useful and authorized                          |
| Occurred / recorded time   | UTC business occurrence and durable recording; both required                                  |
| Actor                      | Customer, Profile/Membership, service principal, system, or approved external actor reference |
| Correlation / causation    | End-to-end operation identity and triggering event/command where applicable                   |
| Source                     | Channel/client/device/integration class, without secret or raw fingerprint                    |
| Payload                    | Minimal versioned business facts required by approved consumers                               |
| Classification             | Highest field classification represented in the event                                         |
| Traceability               | Relevant reason/configuration/catalog/policy versions and idempotency identity where required |

Events MUST NOT contain passwords, tokens, challenge secrets, raw payment instrument data, unrestricted exact addresses, unnecessary mobile/email values, internal note bodies, raw provider payloads, or database implementation details.

## 4. Persistence, Publication, and Ordering

1. Aggregate mutation, domain status/history record, Domain Event, required Audit Event, and Outbox Event commit atomically when publication is required.
2. An event is immutable after recording. Correction is a new event that references the incorrect/superseded event and corrected business fact.
3. Aggregate version and sequence provide per-aggregate ordering. Global ordering is not promised.
4. Consumers are idempotent by event identity and tolerate duplicate delivery, delayed delivery, and events from unrelated aggregates in any order.
5. A consumer must not infer missing events solely from sequence across retention/archive boundaries; reconciliation uses the producer contract.
6. Failed publication does not roll back the committed business fact; Outbox retry/dead-letter/reconciliation restores delivery.
7. Replay reuses original event identity, occurrence time, version, and payload; it does not create a new business fact.

## 5. Event and Audit Separation

Domain Events answer **what business fact occurred**. Audit Events answer **who or what performed/accessed a governed action, why, from where, and under which authority**. A status event is an aggregate's immutable lifecycle history. The three records may be created together but are not interchangeable.

Examples:

- `quotation.quotation.sent.v1` is a Domain Event.
- Quotation Status Event records the exact state transition in the Quotation aggregate.
- Audit Event records the Sales actor, permission, review/approval context, before/after target, and result.

## 6. Tenancy, Identity, and Access Events

| Event                                 | Producer                | Business meaning                                                         | Primary consumers                                            | Future notification possibilities                                                    |
| ------------------------------------- | ----------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `tenancy.organization.provisioned.v1` | Organization            | A new tenant boundary was created but may not yet be active.             | IAM, Configuration, Audit, platform operations               | Platform onboarding work; no customer message until approved future SaaS onboarding. |
| `tenancy.organization.activated.v1`   | Organization            | Organization passed activation gates and may own active operations.      | IAM, Configuration, Reporting                                | Organization owner/admin activation notice in future multi-company stage.            |
| `tenancy.organization.suspended.v1`   | Organization            | New/continued activity is restricted under suspension policy.            | IAM, all command boundaries, Platform Operations             | Privileged owner/admin and incident/support notice; never public.                    |
| `tenancy.organization.closed.v1`      | Organization            | Offboarding reached governed closed state; retention continues.          | IAM, Retention, Reporting, Integration                       | Owner/legal operations notice under future SaaS policy.                              |
| `iam.membership.activated.v1`         | Organization Membership | A Profile may participate in an Organization under assigned permissions. | Authorization cache/projection, Audit, Reporting             | Workforce invitation/activation notice.                                              |
| `iam.membership.suspended.v1`         | Organization Membership | Membership access is temporarily unavailable.                            | Authorization/session revocation, Audit, Security monitoring | Affected workforce user and security owner.                                          |
| `iam.membership.revoked.v1`           | Organization Membership | Membership access ended permanently for current grant.                   | Session revocation, work assignment review, Audit            | User, manager, Security; reassign active work.                                       |
| `iam.role.assigned.v1`                | Membership Role         | A Role became effective for a Membership.                                | Authorization projection, access review, Audit               | Affected user/manager for privileged roles.                                          |
| `iam.role.revoked.v1`                 | Membership Role         | A Role assignment ended.                                                 | Authorization/session refresh, assignment checks, Audit      | Affected user/manager; privileged revocation alert.                                  |
| `iam.service_principal.rotated.v1`    | Service Principal       | Credential reference was rotated without changing principal identity.    | Integration/workload owners, Security monitoring             | Owner rotation result/failure; never include secret.                                 |
| `iam.platform_access.approved.v1`     | Platform Access Grant   | Time-bound privileged support/platform access was approved.              | Security monitoring, tenant support controls, Audit          | Approver/security and future Organization owner according to policy.                 |
| `iam.platform_access.used.v1`         | Platform Access Grant   | Approved privileged access was exercised.                                | Security monitoring, access review, Audit                    | Security/Organization owner notification under policy.                               |
| `iam.device.registered.v1`            | Device Registration     | A future mobile installation was bound to an actor.                      | Mobile sync/push, Security monitoring                        | Actor security notice.                                                               |
| `iam.device.revoked.v1`               | Device Registration     | Device may no longer authenticate/synchronize/receive push.              | Mobile gateways, push provider, Security monitoring          | Actor security notice.                                                               |

## 7. Configuration and Catalog Events

| Event                                          | Producer                | Business meaning                                                            | Primary consumers                                                 | Future notification possibilities                                                                |
| ---------------------------------------------- | ----------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `configuration.release.approved.v1`            | Configuration Release   | Release contents passed required review but are not yet active.             | Deployment/release operations, Audit                              | Named publishers/approvers only.                                                                 |
| `configuration.release.activated.v1`           | Configuration Release   | All included Configuration Versions became effective together.              | Configuration caches, Catalog, Pricing, Communications, Reporting | Affected internal domain owners; no customer notice unless a separate policy requires.           |
| `configuration.release.rolled_back.v1`         | Configuration Release   | A governed rollback activated the defined prior/replacement versions.       | Same consumers as activation, Incident response, Audit            | Platform/domain owners and incident channel.                                                     |
| `catalog.service.activated.v1`                 | Service Definition      | Cargo Service became available for Offering publication.                    | Catalog projection, Admin reporting                               | Product/Operations; customer marketing only by separate campaign.                                |
| `catalog.service.retired.v1`                   | Service Definition      | No new Offering may rely on this Service after effective retirement.        | Intake eligibility, Sales queues, Reporting                       | Internal Sales/Operations; affected active customer work handled separately.                     |
| `catalog.offering.activated.v1`                | Service Offering        | A complete Cargo Service + Route Class Offering became selectable in scope. | Public catalog, Intake, Pricing, Reporting                        | Internal launch notice; future customer discovery campaign.                                      |
| `catalog.offering.suspended.v1`                | Service Offering        | New selection/quotation is blocked while historical work remains.           | Public catalog, Intake, Sales, Operations                         | Internal urgent notice; customers with affected active work only through owned case/message.     |
| `catalog.lane.activated.v1`                    | Service Lane            | Origin/destination eligibility became active for an Offering.               | Intake eligibility, Sales, Pricing, Reporting                     | Internal coverage update; customer communication only through discovery content/campaign.        |
| `catalog.lane.suspended.v1`                    | Service Lane            | New requests for the lane are blocked.                                      | Intake, Sales, Operations, Reporting                              | Internal notice and case-by-case active-order communication.                                     |
| `catalog.restriction.activated.v1`             | Restriction Definition  | A reviewed restriction became applicable under its associations.            | Intake, Sales qualification, Operations readiness                 | Internal mandatory policy update; impacted active cases require separate governed communication. |
| `catalog.customer_status_mapping.activated.v1` | Customer Status Mapping | A new privacy-reviewed public status projection became effective.           | Public tracking, Communications, Support, Reporting               | Internal Customer Service/content notice.                                                        |

## 8. Customer and Consent Events

| Event                                | Producer                 | Business meaning                                                                       | Primary consumers                                                 | Future notification possibilities                                                    |
| ------------------------------------ | ------------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `customer.customer.created.v1`       | Customer                 | Tenant-local customer identity was created from valid intake/account/support context.  | Lead, Customer Service, Reporting                                 | No automatic message; Lead acknowledgement is a separate event-driven communication. |
| `customer.customer.merged.v1`        | Customer                 | Duplicate Customer was closed and linked to surviving Customer under verified process. | Lead/Order ownership projections, Support, Audit                  | Affected registered customer/security notice if account/history changes.             |
| `customer.contact_point.verified.v1` | Contact Point            | One contact point passed purpose-appropriate verification.                             | Quotation decision, tracking/support verification, Communications | Verification confirmation/security notice.                                           |
| `customer.contact_point.revoked.v1`  | Contact Point            | Contact point may no longer authorize or receive applicable communication.             | Communications, Support, tracking verification                    | Customer/account security notice through alternate verified channel when safe.       |
| `customer.account_link.verified.v1`  | Customer Account Link    | Profile may access the linked Customer context under customer permissions.             | Authorization, customer account views, Support, Audit             | Account-link confirmation/security notice.                                           |
| `customer.account_link.revoked.v1`   | Customer Account Link    | Profile access to Customer context ended.                                              | Authorization/session refresh, Support, Audit                     | Customer/Profile security notice.                                                    |
| `customer.consent.captured.v1`       | Consent Record           | Customer made an explicit purpose/notice-version decision.                             | Communications, Privacy reporting, Lead                           | Confirmation only when policy requires; never expose unrelated consent.              |
| `customer.consent.withdrawn.v1`      | Consent Record           | Previously active consent was withdrawn for its purpose.                               | Communications suppression, Privacy operations, Reporting         | Withdrawal confirmation and consequences where required.                             |
| `customer.preference.changed.v1`     | Communication Preference | Effective communication preference/suppression changed.                                | Communications, Customer Service                                  | Preference confirmation where channel remains permitted.                             |
| `customer.feedback.rated.v1`         | Customer Feedback        | Customer submitted a rating and optional feedback for a completed Order.               | Customer Experience, Operations quality, Reporting                | Thank-you acknowledgement; internal low-rating alert after future policy.            |
| `customer.feedback.moderated.v1`     | Customer Feedback        | Authorized moderation changed visibility/status without rewriting original evidence.   | Customer Experience, Reporting                                    | Customer notice only if future feedback policy promises it.                          |

## 9. Lead and Request Events

| Event                                  | Producer | Business meaning                                                              | Primary consumers                             | Future notification possibilities                                                           |
| -------------------------------------- | -------- | ----------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `lead.lead.created.v1`                 | Lead     | One valid, eligible-form submission created exactly one Lead in `new`.        | Sales queue, Communications, Reporting, Audit | Customer request acknowledgement; Sales new-work notification.                              |
| `lead.lead.assigned.v1`                | Lead     | Active primary Sales ownership/queue assignment changed.                      | Sales work queue, SLA reporting, Support      | Assigned Sales user/team alert; no customer message by default.                             |
| `lead.lead.review_started.v1`          | Lead     | Sales moved Lead to `under_review`.                                           | Sales reporting, Customer status projection   | Customer “request under review” message only if configured and truthful.                    |
| `lead.lead.clarification_requested.v1` | Lead     | Sales requires specified additional customer information.                     | Communications, Sales queue, Support          | Customer clarification request with verified response path.                                 |
| `lead.lead.qualified.v1`               | Lead     | Service, route, contact, cargo, and quotation inputs are sufficient/eligible. | Pricing, Quotation, Reporting                 | Internal Pricing/Sales work; customer message optional, without price/availability promise. |
| `lead.lead.unqualified.v1`             | Lead     | Approved reason makes request ineligible/unserviceable in current scope.      | Communications, Reporting, Support            | Customer-safe reason/next step where policy permits.                                        |
| `lead.lead.reopened.v1`                | Lead     | Authorized reason returned a closed/unqualified Lead to review.               | Sales queue, Reporting                        | Assigned Sales notice; customer update where engagement resumed.                            |
| `lead.lead.closed.v1`                  | Lead     | No further Sales action is expected under current engagement.                 | Sales queue, Reporting, Communications        | Customer closure outcome if configured/appropriate.                                         |
| `lead.lead.converted_to_quotation.v1`  | Lead     | First Quotation aggregate was created and Lead conversion recorded.           | Quotation, Sales reporting                    | No customer message until an issued Quotation exists.                                       |

## 10. Pricing and Quotation Events

| Event                               | Producer                               | Business meaning                                                                                                        | Primary consumers                                                         | Future notification possibilities                                                                    |
| ----------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `pricing.estimate.requested.v1`     | Price Estimate                         | Approved inputs/policy were submitted for internal evaluation.                                                          | Pricing worker/engine, Sales queue, Observability                         | Internal only; never customer-facing.                                                                |
| `pricing.estimate.calculated.v1`    | Price Estimate                         | Internal components reconciled to an Estimate under captured versions.                                                  | Quotation draft, Sales, Pricing analytics                                 | Internal Sales work-ready notice; never present as final price.                                      |
| `pricing.estimate.failed.v1`        | Price Estimate                         | Evaluation ended without valid result and requires correction/review.                                                   | Sales, Pricing operations, Observability                                  | Internal owner alert with safe error guidance.                                                       |
| `pricing.estimate.stale.v1`         | Price Estimate                         | A price-affecting input/configuration change invalidated prior guidance.                                                | Quotation draft, Sales, Approval invalidation                             | Internal requote alert.                                                                              |
| `quotation.quotation.created.v1`    | Quotation                              | Stable Quotation aggregate/number was created for a qualified Lead.                                                     | Sales queue, Reporting                                                    | No customer message before issue.                                                                    |
| `quotation.version.created.v1`      | Quotation Version                      | New editable Version was created from current commercial/service facts.                                                 | Sales, Pricing, Approval workflow                                         | Internal draft work item.                                                                            |
| `quotation.approval.requested.v1`   | Quotation Approval                     | Exact Version requires a named approval gate.                                                                           | Finance/configured approver, Sales queue, Reporting                       | Internal approver notification/escalation.                                                           |
| `quotation.approval.approved.v1`    | Quotation Approval                     | Authorized approver accepted the exact decision basis.                                                                  | Quotation readiness, Sales, Reporting                                     | Requester/Sales internal notice.                                                                     |
| `quotation.approval.rejected.v1`    | Quotation Approval                     | Approval gate rejected the exact Version basis.                                                                         | Sales, Pricing, Reporting                                                 | Requester/Sales internal notice with permitted reason.                                               |
| `quotation.approval.invalidated.v1` | Quotation Approval                     | A relevant input/version change made prior decision unusable.                                                           | Sales, approver queue, Reporting                                          | Internal reapproval notice.                                                                          |
| `quotation.review.completed.v1`     | Quotation Review                       | Named Sales representative completed mandatory final review of exact Version.                                           | Quotation send gate, Audit, Reporting                                     | Internal readiness notice; no customer message yet.                                                  |
| `quotation.review.invalidated.v1`   | Quotation Review                       | Content changed after review and requires a new Sales review.                                                           | Sales queue, send gate                                                    | Internal reviewer/preparer notice.                                                                   |
| `quotation.quotation.sent.v1`       | Quotation                              | Immutable Version was issued to customer after approvals and Sales review.                                              | Communications, Sales reporting, expiry scheduler, Support                | Customer Quotation delivery with version, validity, scope, total, decision path.                     |
| `quotation.quotation.superseded.v1` | Quotation                              | Issued Version is no longer current because a newer Version was issued.                                                 | Acceptance gate, Communications, Support, Reporting                       | Customer notice that old Version cannot be accepted and new review is required.                      |
| `quotation.quotation.accepted.v1`   | Quotation Decision                     | Verified Customer accepted exact current unexpired Version.                                                             | Approval/conversion orchestration, Sales, Operations readiness, Reporting | Customer acceptance acknowledgement; state next step must not claim Order until conversion succeeds. |
| `quotation.quotation.rejected.v1`   | Quotation Decision                     | Verified Customer declined exact Version.                                                                               | Sales, Reporting, Support                                                 | Customer confirmation and optional Sales follow-up under policy.                                     |
| `quotation.quotation.expired.v1`    | Quotation                              | Version validity ended before accepted conversion.                                                                      | Acceptance gate, Sales queue, Communications, Reporting                   | Customer expiry and contact/requotation guidance.                                                    |
| `quotation.quotation.cancelled.v1`  | Quotation                              | Authorized party withdrew Version/aggregate under policy.                                                               | Sales, Reporting, Communications                                          | Customer-safe cancellation outcome where customer had received it.                                   |
| `quotation.quotation.approved.v1`   | Quotation/Order conversion transaction | Accepted current Version, all current internal approvals, and successful Order creation reached the approved milestone. | Sales, Operations, Reporting, Communications                              | Customer Order confirmation, not a separate vague approval-only promise.                             |
| `quotation.quotation.converted.v1`  | Quotation                              | Exact Version is terminally linked to exactly one Order.                                                                | Sales, Reporting, Audit                                                   | Internal conversion confirmation; customer uses Order-created communication.                         |

## 11. Order, Scheduling, and Execution Events

| Event                                   | Producer              | Business meaning                                                                                | Primary consumers                                                  | Future notification possibilities                                                                                   |
| --------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `order.order.created.v1`                | Order                 | Exactly one Order and immutable accepted snapshot were created from approved Quotation Version. | Operations queue, Communications, Reporting, Support               | Customer Order confirmation with Order Number/tracking/support guidance; Operations new-order alert.                |
| `order.order.status_changed.v1`         | Order                 | Order moved through a valid nonterminal internal lifecycle transition.                          | Public status projection, Communications, Reporting, Support       | Customer status message only for configured customer-useful changes.                                                |
| `order.order.public_status_changed.v1`  | Order                 | Privacy-reviewed public status projection changed.                                              | Public tracking cache/projection, Communications, Support          | Customer status notification under preference/policy.                                                               |
| `order.order.amendment_requested.v1`    | Order Amendment       | Material post-conversion change entered assessment.                                             | Sales, Operations, Finance, Support                                | Customer acknowledgement/clarification; internal approval work.                                                     |
| `order.order.amended.v1`                | Order Amendment       | Approved/reaccepted amendment and replacement snapshot became effective.                        | Operations, Communications, Reporting, future Finance              | Customer revised scope confirmation; Operations handoff update.                                                     |
| `order.order.cancellation_requested.v1` | Order Cancellation    | A cancellation entered governed impact/approval assessment.                                     | Sales, Operations, Finance, Support                                | Customer acknowledgement; internal approver/owner alert.                                                            |
| `order.order.cancelled.v1`              | Order                 | Authorized cancellation became terminally effective.                                            | Operations, Communications, Reporting, future Finance              | Customer cancellation confirmation, safe reason, next/support steps.                                                |
| `operations.order.scheduled.v1`         | Schedule Revision     | First current service window was confirmed.                                                     | Order state, Operations queue, Communications, Reporting           | Customer schedule/preparation instructions; assigned Operations alert.                                              |
| `operations.order.schedule_changed.v1`  | Schedule Revision     | A later confirmed revision superseded the prior schedule.                                       | Order/public status, Communications, Reporting, Support            | Customer new window/change context; Operations assignee alert.                                                      |
| `operations.execution.created.v1`       | Execution             | Operational performance record was created for Order.                                           | Operations queue, Reporting                                        | Internal readiness/assignment work only.                                                                            |
| `operations.execution.ready.v1`         | Execution             | Schedule, assignment, and readiness gates permit start.                                         | Operations queue, Reporting                                        | Internal team/driver mobile notification in future.                                                                 |
| `operations.execution.started.v1`       | Execution             | Authorized Operations actor started service; Order entered execution.                           | Order state/public status, Communications, Reporting, Support      | Customer “in progress” notice; future driver/operations mobile updates.                                             |
| `operations.execution.blocked.v1`       | Execution             | A blocking condition interrupted normal progress.                                               | Operations escalation, Support, Communications decision, Reporting | Internal urgent alert; customer delay/update only through approved safe content.                                    |
| `operations.exception.opened.v1`        | Operational Exception | New operational issue with category/severity/blocking impact was recorded.                      | Operations queue, Support, Reporting, future Workflow              | Severity-based internal escalation; customer message only when decision says.                                       |
| `operations.exception.resolved.v1`      | Operational Exception | Resolution was recorded and blocking effect recalculated.                                       | Execution readiness/completion, Support, Reporting                 | Internal owner notice; customer resolution update where appropriate.                                                |
| `operations.completion.submitted.v1`    | Completion Record     | Operations submitted required completion checks/evidence for review.                            | Completion gate, Operations review, Documents, Reporting           | Internal reviewer alert; customer not yet told completed unless policy says submission is sufficient (MVP says no). |
| `operations.completion.accepted.v1`     | Completion Record     | Completion evidence/checks were accepted.                                                       | Execution/Order completion transaction, Reporting                  | Prepares customer completion message.                                                                               |
| `order.order.completed.v1`              | Order                 | Execution and Order reached terminal completed state with accepted completion evidence.         | Communications, Support, Reporting, future Feedback/Finance        | Customer completion confirmation; future feedback invitation/invoice/payment flows.                                 |

## 12. Communications, Support, Verification, and Document Events

| Event                                    | Producer                | Business meaning                                                                               | Primary consumers                                               | Future notification possibilities                                                            |
| ---------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `communications.request.created.v1`      | Communication Request   | A business event/purpose produced an authorized message request.                               | Template rendering, recipient resolution, delivery workers      | No separate message; this initiates governed delivery.                                       |
| `communications.recipient.suppressed.v1` | Communication Recipient | Preference, consent, invalid contact, policy, or safety blocked delivery to recipient/channel. | Producing domain work queue, Support, Reporting                 | Internal recovery alert if lifecycle communication is mandatory.                             |
| `communications.message.delivered.v1`    | Communication Attempt   | Provider/channel supplied approved delivery evidence.                                          | Producing domain, Support, Reporting                            | No recursive notification; may complete staff work item.                                     |
| `communications.message.failed.v1`       | Communication Attempt   | Bounded delivery ended in terminal/unknown failure requiring visibility.                       | Producing domain, Support/Operations queue, Reporting           | Internal recovery/fallback alert; alternate customer channel only if consent/policy permits. |
| `support.case.created.v1`                | Support Case            | Customer Service work root was opened with verified/appropriate context.                       | Customer Service queue, target domain, Reporting                | Customer case acknowledgement; owner/team alert.                                             |
| `support.case.escalated.v1`              | Support Case            | Case responsibility/priority moved to another domain/level.                                    | Sales/Operations/Finance/Security owner, Reporting              | Internal escalation and customer expectation update where appropriate.                       |
| `support.case.resolved.v1`               | Support Case            | Documented resolution was reached, before or with closure.                                     | Communications, Reporting, Customer Experience                  | Customer resolution summary and next step.                                                   |
| `support.verification.succeeded.v1`      | Verification Challenge  | Purpose-bound proof succeeded for exactly one target/action window.                            | Quotation decision, Support, account linking, tracking security | Customer/security confirmation only for high-risk actions under policy.                      |
| `support.verification.failed.v1`         | Verification Challenge  | Challenge reached failed/expired/blocked outcome.                                              | Security monitoring, Support, rate limiting                     | Generic customer guidance; security alert for suspicious patterns.                           |
| `support.tracking_access.blocked.v1`     | Tracking Access Attempt | Abuse/rate policy blocked public tracking attempts.                                            | Security monitoring, Support/incident response                  | No revealing response; internal security alert by threshold.                                 |
| `documents.document.created.v1`          | Document                | Document metadata root was created for an approved purpose.                                    | Upload/scanning, target domain, Audit                           | Internal upload progress only unless customer journey includes documents later.              |
| `documents.version.accepted.v1`          | Document Version        | Stored object passed required validation/scanning and is usable under authorization.           | Target domain, Completion/Support, Reporting                    | Uploader/owner confirmation; future mobile upload success.                                   |
| `documents.version.quarantined.v1`       | Document Version        | Security/validation prevents use/download.                                                     | Security, uploader workflow, target domain                      | Safe uploader failure guidance; Security alert.                                              |
| `documents.association.created.v1`       | Document Association    | Accepted Document was linked to one approved business target/purpose.                          | Target domain, Support, Audit                                   | Internal work completion; customer notice only if journey requires.                          |

## 13. Future Resource and Mobile Events

| Event                                        | Producer                   | Business meaning                                                                    | Primary consumers                                             | Future notification possibilities                                       |
| -------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `resources.driver.activated.v1`              | Driver                     | Driver became eligible subject to current availability/compliance.                  | Assignment/dispatch, mobile access, Reporting                 | Driver/manager activation notice.                                       |
| `resources.resource.availability_changed.v1` | Resource Availability      | Driver/Vehicle/Equipment availability interval became effective/ended.              | Assignment planning, Operations, Reporting                    | Dispatcher/assigned staff conflict alert.                               |
| `resources.resource.compliance_expiring.v1`  | Resource Compliance Record | Compliance will expire within configured operational window.                        | Fleet Compliance, assignment gate, Reporting                  | Driver/fleet manager reminder/escalation.                               |
| `resources.resource.compliance_expired.v1`   | Resource Compliance Record | Resource no longer satisfies requirement.                                           | Assignment gate, active Execution review, Security/Compliance | Urgent Fleet/Operations alert; customer impact handled separately.      |
| `resources.maintenance.started.v1`           | Maintenance Record         | Vehicle/Equipment entered maintenance and may be unavailable.                       | Availability, assignment planning, Reporting                  | Fleet/Operations notice.                                                |
| `resources.maintenance.completed.v1`         | Maintenance Record         | Approved maintenance completion was recorded.                                       | Availability/compliance, Fleet reporting                      | Fleet owner notice.                                                     |
| `mobile.execution_update.recorded.v1`        | Execution Status Event     | Future mobile/offline update was accepted with occurrence/recording/device context. | Execution, mobile sync acknowledgement, Reporting             | Actor sync confirmation; customer status only through Order projection. |

## 14. Future Integration, Workflow, Finance, and Analytics Events

| Event                                     | Producer               | Business meaning                                                                        | Primary consumers                                           | Future notification possibilities                                            |
| ----------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `integration.connection.activated.v1`     | Integration Connection | Approved provider/partner connection passed verification and became usable.             | Integration workers, Security monitoring, Reporting         | Connection owner/admin notice.                                               |
| `integration.inbound_message.rejected.v1` | Inbound Message        | Message failed contract/security/idempotency validation and produced no domain command. | Integration operations, Security, partner support           | Internal/partner technical notice without sensitive payload.                 |
| `integration.webhook.delivery_failed.v1`  | Webhook Delivery       | Subscription delivery exhausted configured retry or dead-lettered.                      | Integration operations, subscription owner, Reporting       | Partner/admin delivery alert.                                                |
| `workflow.instance.started.v1`            | Workflow Instance      | Approved Workflow Version began orchestration for one subject.                          | Workflow workers, participating domain, Reporting           | Assigned users only; not customer-facing by default.                         |
| `workflow.task.assigned.v1`               | Workflow Task          | Human/system task gained an effective assignee.                                         | Work queues, reminders, Reporting                           | Assignee notification/escalation.                                            |
| `workflow.task.completed.v1`              | Workflow Task          | Task outcome was recorded; any domain command remains independently validated.          | Workflow Instance, participating domain, Reporting          | Requester/next assignee notice.                                              |
| `workflow.instance.completed.v1`          | Workflow Instance      | Orchestration reached terminal success; domain state remains authoritative.             | Participating domain, Reporting                             | Internal completion notice; customer messages come from domain events.       |
| `finance.invoice.issued.v1`               | Invoice                | Immutable Invoice was issued under approved financial policy.                           | Customer account, Payments, Reporting, Communications       | Customer invoice delivery.                                                   |
| `payments.intent.created.v1`              | Payment Intent         | Customer payment request was established with amount/currency/provider context.         | Payment gateway, Customer journey, Reporting                | Customer payment action request.                                             |
| `payments.transaction.succeeded.v1`       | Payment Transaction    | Gateway transaction reached approved captured/settled success state.                    | Allocation, Invoice, Reporting, Communications              | Customer payment confirmation; Finance reconciliation.                       |
| `payments.transaction.failed.v1`          | Payment Transaction    | Payment attempt failed without changing settled balance.                                | Customer journey, Finance support, Reporting                | Safe customer retry/support guidance; fraud/security signal if relevant.     |
| `payments.refund.completed.v1`            | Refund                 | Approved refund completed at gateway.                                                   | Invoice/Finance reporting, Customer Service, Communications | Customer refund confirmation.                                                |
| `reporting.report.completed.v1`           | Report Run             | Governed report result completed with definition/freshness/authorization context.       | Requester UI, Export, Monitoring                            | Requester completion notice for long runs.                                   |
| `reporting.export.ready.v1`               | Export Request         | Purpose-bound artifact is ready until expiry and requires reauthorization.              | Requester, Audit, expiry worker                             | Authorized requester notice with no attachment or sensitive data in message. |
| `reporting.export.expired.v1`             | Export Request         | Artifact access ended and artifact deletion was requested/completed.                    | Requester UI, Retention, Audit                              | Optional requester notice.                                                   |
| `analytics.metric_snapshot.published.v1`  | Metric Snapshot        | Validated metric value became available for its scope/window/version.                   | Dashboards, monitoring, future warehouse consumers          | Internal threshold alert only under approved Metric policy.                  |

## 15. Event-to-Notification Rules

An event is never itself permission to contact a person. Before creating a Communication Request, the notification policy MUST evaluate:

- event name/version and customer-useful purpose;
- customer/account/recipient identity and verified destination;
- required versus optional communication and applicable lawful basis/consent;
- Communication Preference, suppression, quiet-hours, locale, and accessibility/content needs;
- Message Template version and variable minimization;
- lifecycle concurrency so a stale event cannot send misleading current status;
- deduplication, priority, fallback, retry, and escalation; and
- visibility/classification so no internal state, note, staff identity, exact address, approval threshold, or security detail leaks.

Customer-facing notifications SHOULD be generated from the current authorized projection at send time while retaining the causal event and template/version. This prevents delayed delivery from presenting stale state as current.

## 16. Consumer Contract

Every consumer MUST document:

- subscribed event names/versions and business purpose;
- required payload fields and classification;
- authorization/tenant handling;
- idempotency key and duplicate behavior;
- ordering and stale-event behavior;
- retry, dead-letter, reconciliation, lag objective, and owner;
- schema compatibility and deployment sequencing;
- retention and privacy behavior;
- monitoring and safe failure semantics; and
- replay/backfill procedure.

Consumers MUST NOT synchronously write producer internals, treat event delivery as proof of public authorization, infer omitted sensitive facts, or make audit data their operational source of truth.

## 17. Event Implementation Gate

Before an event is physically implemented, the team MUST approve its payload contract, classification, exact producer transaction, aggregate sequence/version rule, outbox requirement, permitted consumers, retention, RLS/service access, monitoring, replay, schema compatibility, test fixtures, and redaction. Public webhook/API exposure requires a separate external contract and security review.
