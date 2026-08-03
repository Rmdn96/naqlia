# Naqlia MVP Database Scope

| Document field | Value                                                 |
| -------------- | ----------------------------------------------------- |
| Suite          | Production MVP Scope                                  |
| Status         | Final logical table scope; no schema implementation   |
| Version        | 1.0.0                                                 |
| Effective date | 2026-08-03                                            |
| Target         | 22 application tables, maximum 25                     |
| Parent         | [MVP Entity Selection](./01-MVP-Entity-Selection.md)  |
| Owners         | Engineering, Data Architecture, Security, and Product |

## 1. Purpose

This document is the final database boundary for the four-week Naqlia MVP. It identifies the exact application tables the physical PostgreSQL design may implement and the business facts each table must preserve. It contains no SQL, migrations, Supabase resources, or implementation instructions.

Only the 22 tables named here are authorized for MVP. Supabase Auth is an external managed dependency and is not counted as an application table. Storage buckets, database views, search indexes, scheduled jobs, and observability systems are also outside the table count and require their own later design approval.

## 2. Scope Decision

| Measure                       | Decision                                                         |
| ----------------------------- | ---------------------------------------------------------------- |
| Application tables            | **22**                                                           |
| Managed authentication tables | Supabase-owned; not duplicated or modified by this plan          |
| Tenant/company tables         | None in MVP; Naqlia is the sole operator                         |
| Custom role/permission tables | None; five reviewed staff roles are fixed for MVP                |
| Domain event/outbox tables    | None; persisted Notifications handle launch delivery work        |
| Pricing-engine tables         | None; Quotations are human-authored                              |
| Execution/fleet tables        | None; operational execution and resource snapshots live on Order |
| CMS/SEO tables                | One Content Page table                                           |
| Audit tables                  | One append-only Audit Log table                                  |

The physical designer MUST NOT add generic metadata, translation, address polymorphism, tagging, workflow, event, job, role, permission, organization, or lookup tables unless this document is first changed and the 25-table cap is re-approved.

## 3. Table Registry

|   # | Table                      | Owner               | Purpose                                                                                                                      | Primary launch capabilities                                  |
| --: | -------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
|   1 | `profiles`                 | Identity and Access | Application identity mapped to one Supabase Auth user; fixed customer/staff classification and staff role.                   | Authentication, Customer Account, Admin Management           |
|   2 | `customers`                | Customer            | One guest or registered customer with primary contact, locale, preference, consent, and lifecycle.                           | Guest Request, Customer Account, tracking ownership          |
|   3 | `customer_addresses`       | Customer            | Reusable saved addresses for registered-customer convenience.                                                                | Customer Account                                             |
|   4 | `app_settings`             | Configuration       | Approved single-company configuration values and bilingual descriptions.                                                     | Settings, Admin Management, tracking labels, policy values   |
|   5 | `service_offerings`        | Catalog             | The enabled Cargo Service and Route Class combinations.                                                                      | Guest Request, Lead, Quotation, Content discovery            |
|   6 | `service_add_ons`          | Catalog             | Optional services and their offering eligibility.                                                                            | Guest Request, Lead, Quotation, Order                        |
|   7 | `coverage_areas`           | Catalog/Operations  | Riyadh coverage and enabled outbound Saudi destinations.                                                                     | Guest Request, eligibility, scheduling                       |
|   8 | `leads`                    | Sales               | Guest/account request, qualification, current state, snapshots, and assignment.                                              | Guest Request, Lead                                          |
|   9 | `lead_notes`               | Sales               | Classified internal notes attached to a Lead.                                                                                | Lead, Customer Service, Admin Management                     |
|  10 | `lead_status_history`      | Sales               | Immutable Lead lifecycle transitions.                                                                                        | Lead, Audit support, reporting                               |
|  11 | `quotations`               | Sales/Finance       | One commercial revision, totals, approval, Sales review, issue, and customer decision.                                       | Quotation                                                    |
|  12 | `quotation_items`          | Sales/Finance       | Service, add-on, surcharge, discount, tax, and other explicit commercial lines.                                              | Quotation, Order snapshot source                             |
|  13 | `quotation_status_history` | Sales               | Immutable Quotation lifecycle transitions.                                                                                   | Quotation, dispute evidence                                  |
|  14 | `orders`                   | Operations          | Converted commitment, immutable accepted snapshot, scheduling, execution, tracking, exception, cancellation, and completion. | Order, tracking, Operations                                  |
|  15 | `order_status_history`     | Operations          | Immutable internal/customer-facing Order and execution history.                                                              | Order, tracking, Customer Service                            |
|  16 | `attachments`              | Documents           | Stored-object metadata and one allowed Lead/Quotation/Order/Support association.                                             | Attachments, completion evidence                             |
|  17 | `notification_templates`   | Communications      | Published bilingual transactional templates.                                                                                 | Notifications, Admin Management                              |
|  18 | `notifications`            | Communications      | Persisted rendered send, recipient, delivery, retry, and provider outcome.                                                   | Notifications                                                |
|  19 | `content_pages`            | Content/Marketing   | Bilingual public content, publication lifecycle, and SEO metadata.                                                           | Content Pages, SEO, Admin Management                         |
|  20 | `support_cases`            | Customer Service    | Customer enquiry, business context, verification, assignment, escalation, and resolution.                                    | Customer Service, Admin Management                           |
|  21 | `audit_logs`               | Security/Audit      | Append-only accountable action, access, denial, and security evidence.                                                       | Audit Logs, tracking abuse, privileged administration        |
|  22 | `idempotency_keys`         | Platform            | Durable retry result for selected high-risk commands.                                                                        | Guest Request, Order conversion, notification enqueue safety |

## 4. Shared Record Rules

Unless a table is immutable by definition, each application record needs:

- an opaque stable identifier;
- creation time and creating actor/source;
- last modification time and actor where mutable;
- a lifecycle status rather than ambiguous deletion;
- an optimistic revision marker where concurrent staff actions are possible;
- Arabic/English fields wherever content is customer-visible;
- a classification for confidential or restricted values;
- an explicit retention and deletion disposition; and
- correlation to the Audit Log for material or privileged actions.

Business time is recorded in UTC. Scheduling also records the applicable timezone. Mobile numbers are stored as a normalized comparison value plus a customer-display value. Money always carries currency and captured tax context. Published labels and commercial/customer snapshots never rely on mutable source text.

## 5. Detailed Table Contracts

No field below has a physical data type. The later physical design chooses types, constraints, indexes, and RLS while preserving these meanings.

### 5.1 `profiles`

**Purpose:** represent one authenticated person without duplicating credentials or provider identities.

**Required business fields:** Auth user reference; profile kind (`customer` or `staff`); status; display name; preferred locale; created/updated provenance.

**Conditional fields:** verified Customer reference for customer profiles; exactly one of Super Admin, Sales, Operations, Finance, or Customer Service for active staff; staff activation/suspension/revocation reason and time.

**Rules:** Auth user reference is unique and immutable. Customer profiles cannot receive staff permissions. Staff role changes require Super Admin authority, recent authentication where approved, reason, immediate enforcement, and Audit Log evidence. Auth deletion never cascades into business history.

### 5.2 `customers`

**Purpose:** provide one operational customer identity whether the journey is guest or account-based.

**Required business fields:** customer number; person/business classification; Arabic or source display name; normalized mobile; mobile display value; preferred locale; status; acquisition source; privacy/terms version and acceptance evidence.

**Optional fields:** English display name; normalized email; transactional channel preference; registered/guest indicator; merge predecessor; last verified time; account-link eligibility state.

**Rules:** Mobile is required for request tracking. Matching contact text alone never links an account. Contact correction requires verification, reason, actor, and audit. A Customer with a Lead, Quotation, Order, Notification, Support Case, or Audit reference cannot be hard-deleted through ordinary administration.

### 5.3 `customer_addresses`

**Purpose:** hold reusable customer-entered addresses without changing historical request or Order snapshots.

**Required business fields:** Customer; label; city; district; address lines; status.

**Optional fields:** postal code; landmark; location coordinates; delivery notes; verification/source context; default indicator.

**Rules:** Address belongs to one Customer and may be archived. Editing a saved address never changes a Lead or Order. Precise address fields are restricted and never exposed through public tracking.

### 5.4 `app_settings`

**Purpose:** govern the small allowlist of launch business settings without a generalized configuration platform.

**Required business fields:** stable key; category; value; Arabic and English descriptions; owner; status; revision; effective time; validation outcome; last publisher and publication time.

**Optional fields:** sensitivity; prior-value digest; expiry; approval actor; change reason; rollback source revision.

**Rules:** One current record exists per approved key. Draft values have no production effect. Publication validates language parity and the documented key contract. Old values are preserved in Audit Log evidence and historical business snapshots. Security invariants, role boundaries, lifecycle rules, mandatory Sales review, and audit immutability are not settings.

### 5.5 `service_offerings`

**Purpose:** represent each enabled Cargo Service plus Route Class combination.

**Required business fields:** stable offering code; cargo-service key; route-class key; Arabic/English names and descriptions; eligibility/restriction metadata; qualification guidance; status; availability dates; display order.

**Optional fields:** customer guidance; operational notes; supported unit labels; configured approval/quotation references.

**Rules:** Launch allows only Furniture Moving or General Cargo Transport combined with Local or Intercity Transport. Publication requires both locales. A retired offering remains referenced by historical snapshots.

### 5.6 `service_add_ons`

**Purpose:** represent Packing and Loading & Unloading and their allowed Offerings.

**Required business fields:** stable code; Arabic/English names and descriptions; offering allowlist; eligibility guidance; status; display order.

**Optional fields:** unit guidance; operational notes; active dates.

**Rules:** An add-on cannot be requested alone. Selection must be eligible for the chosen Offering. Historical Lead, Quotation, and Order snapshots survive retirement.

### 5.7 `coverage_areas`

**Purpose:** determine whether the route is inside approved launch geography.

**Required business fields:** stable code; area kind; Arabic/English names; city/region identity; Riyadh indicator; allowed route direction; offering allowlist; status.

**Optional fields:** boundary/reference metadata; operational notes; display order; effective dates.

**Rules:** Local requires both endpoints in enabled Riyadh coverage. Intercity requires an enabled Riyadh origin and enabled Saudi-city destination outside Riyadh. MVP does not support inbound-to-Riyadh, non-Riyadh-to-non-Riyadh, international, or multi-stop routes.

### 5.8 `leads`

**Purpose:** store one valid request and its Sales qualification workflow.

**Required business fields:** Lead number; Customer; source/channel; locale; status; Offering; selected add-on snapshots; origin/destination snapshots; cargo description/structured summary; preferred service window; consent/policy evidence; assignment; creation and qualification timestamps.

**Optional fields:** email snapshot; company name; special instructions; duplicate Lead; qualification outcome/reason; first-response time; close reason; UTM/referrer fields; customer clarification fields.

**Rules:** Guest account creation is never required. One successful submission produces one Lead through an Idempotency Key. Current status and Lead Status History commit together. Changes to catalog/customer records never rewrite submitted snapshots. Public content must not expose internal notes or qualification reasoning.

### 5.9 `lead_notes`

**Purpose:** preserve staff collaboration notes separately from customer-visible facts.

**Required business fields:** Lead; author Profile; content; visibility/classification; creation time.

**Optional fields:** note category; pinned indicator; amendment reason for an allowed correction.

**Rules:** Notes are internal, access-controlled, auditable, and never public tracking content. A note may be corrected only by an attributable append/correction policy, not silent replacement.

### 5.10 `lead_status_history`

**Purpose:** provide immutable Lead lifecycle evidence.

**Required business fields:** Lead; prior status; new status; event time; actor/source; reason where required; correlation identity.

**Optional fields:** assignment snapshot; qualification summary; customer-communication requirement.

**Rules:** Append only. Initial event is mandatory. Sequence must match the Lead current status and allowed lifecycle. Deleting/closing a Lead never removes history.

### 5.11 `quotations`

**Purpose:** represent one exact Quotation revision from draft through decision or expiry.

**Required business fields:** Quotation number/series; revision number; Lead; Customer; status; currency; subtotal; tax context/amount; total; Arabic/English terms and assumptions snapshot; validity; mandatory Sales review result/actor/time; creation provenance.

**Conditional fields:** approval requirement and approval outcome/actor/reason/time; sent time/channel; verified customer decision/outcome/channel/evidence/time; superseded revision; converted Order reference.

**Optional fields:** internal pricing rationale; customer message; rejection reason; expiry reason; cancellation reason.

**Rules:** Each sent revision is immutable. A revision cannot be sent without at least one item, reconciled totals, language-complete terms, required approval, and completed Sales review. Only the current valid sent revision may be accepted. Exactly one successful Order conversion is permitted.

### 5.12 `quotation_items`

**Purpose:** state the priced service scope and adjustments for one Quotation revision.

**Required business fields:** Quotation; item kind; stable source/snapshot code; Arabic/English description; quantity; unit label; unit amount; tax context; line total; display order.

**Conditional fields:** adjustment reason and approval evidence for surcharge/discount; Add-on or Offering snapshot reference where applicable.

**Optional fields:** internal note; customer-visible note.

**Rules:** Items belong to exactly one Quotation revision and cannot move between revisions. Issued items are immutable. Line totals reconcile to Quotation totals under the captured rounding/tax policy.

### 5.13 `quotation_status_history`

**Purpose:** preserve immutable commercial lifecycle transitions.

**Required business fields:** Quotation; prior status; new status; event time; actor/source; reason where required; correlation identity.

**Optional fields:** channel; approval/review/decision summary; customer-notification requirement.

**Rules:** Append only. It cannot replace the detailed approval, review, or decision fields on Quotation. Current status and history transition commit together.

### 5.14 `orders`

**Purpose:** act as the single MVP operational aggregate after successful Quotation conversion.

**Required business fields:** Order number; source Quotation revision; Customer; status; customer-facing status; tracking mobile snapshot; locale; accepted Offering/add-on/origin/destination/cargo/commercial/terms snapshot; created time; current schedule/timezone once scheduled; current operational owner.

**Conditional execution fields:** actual start/completion; assigned staff; driver name/mobile snapshot; vehicle identity snapshot; active exception category/severity/blocking state/reason; completion checks/actor/notes; customer-status last update.

**Conditional change fields:** schedule revision reason and prior window; amendment reason/approval and prior snapshot; cancellation reason/actor/time and communication outcome.

**Optional fields:** internal operational notes; customer-safe next-step guidance; attachment/completion requirements.

**Rules:** Order is created once from one accepted current Quotation revision using Idempotency Key protection. Accepted snapshot is immutable except through an authorized amendment that retains before/after evidence. MVP permits one execution and one active blocking exception context. Cancellation and completion follow allowed transitions. Public tracking reads only the approved minimized projection.

### 5.15 `order_status_history`

**Purpose:** preserve every material Order, schedule, execution, exception, amendment, cancellation, and completion event.

**Required business fields:** Order; event category; prior/new internal status where applicable; prior/new customer-facing status where applicable; event time; actor/source; reason; customer visibility; correlation identity.

**Optional fields:** prior/new schedule snapshot; exception summary; amendment summary; communication requirement/outcome; completion summary.

**Rules:** Append only. Internal-only facts never become public merely because the event exists. A material state change and the current Order state commit atomically.

### 5.16 `attachments`

**Purpose:** govern metadata for one immutable stored object and one business association.

**Required business fields:** subject kind; subject identity; document category; original file name; storage-object reference; media classification; size; integrity digest; access classification; upload status; uploader/source; creation time.

**Optional fields:** Arabic/English caption; scan result; predecessor Attachment; accepted/quarantined/archived time; expiry/retention context.

**Rules:** Subject kind is a closed allowlist of Lead, Quotation, Order, or Support Case. Subject and uploader access are revalidated on every operation. Replacement creates a new Attachment. Bytes are never stored in operational records. Quarantined content is never downloadable by ordinary users.

### 5.17 `notification_templates`

**Purpose:** govern launch transactional email/SMS content.

**Required business fields:** stable key; trigger/event key; channel; Arabic/English subject where applicable; Arabic/English body; status; revision; publication actor/time.

**Optional fields:** safe variable allowlist; expiry; customer-facing category; fallback channel guidance.

**Rules:** Published templates require Arabic/English parity and variable validation. Secrets and unsafe sensitive fields are prohibited. Used revisions remain reconstructable from each Notification content snapshot.

### 5.18 `notifications`

**Purpose:** persist one requested transactional delivery to one resolved destination.

**Required business fields:** Template/revision; trigger; subject kind/identity; Customer where applicable; recipient destination snapshot; locale; channel; rendered subject/body snapshot; status; creation time; attempt count.

**Conditional fields:** provider reference; first/last attempt time; delivered/failed time; safe error code; next retry time; cancellation reason.

**Optional fields:** idempotency/correlation identity; actor requesting resend; predecessor Notification.

**Rules:** A new recipient produces a new row. A manual resend creates a new linked row. Provider failure never changes Lead, Quotation, or Order truth. Retries are bounded and idempotent. Delivery does not prove customer acceptance.

### 5.19 `content_pages`

**Purpose:** own bilingual public content and its SEO contract.

**Required business fields:** stable slug/canonical path; page kind; Arabic/English title; Arabic/English content; Arabic/English SEO title and description; status; indexing decision; sitemap eligibility; publication actor/time; revision.

**Optional fields:** social title/description/image reference; canonical override; structured-data definition from an approved allowlist; navigation placement; publication/expiry dates; redirect successor.

**Rules:** Slugs are unique and locale-neutral unless the approved routing design states otherwise. Publication requires both locales, accessibility-ready content, valid metadata, and an explicit index/noindex decision. Protected, tracking, account, admin, and transactional pages are never represented as indexable Content Pages.

### 5.20 `support_cases`

**Purpose:** let Customer Service safely own and resolve an enquiry.

**Required business fields:** case number; Customer; category; priority; status; subject; description; assigned Profile; received channel/time; verification method/result/time; current escalation target; creation/update provenance.

**Optional fields:** one context kind/identity for Lead, Quotation, or Order; resolution; resolved time; customer outcome; internal notes; requested correction and approval evidence.

**Rules:** Context is a closed allowlist and remains owned by its domain. Customer Service cannot edit commercial totals or perform Operations transitions through a Case. Material changes are audited. Sensitive correction requires the separately approved verification procedure.

### 5.21 `audit_logs`

**Purpose:** provide immutable accountability and security evidence.

**Required business fields:** event time; action/event key; category; outcome; actor kind and stable identity; actor role snapshot; target kind and stable identity; reason/purpose where required; correlation identity; source boundary; minimized detail.

**Optional fields:** before/after evidence for allowed fields; request/network fingerprint; customer/session identity; denial/abuse classification; integrity link/digest; retention class.

**Rules:** Append only and unavailable to ordinary customer roles. It records authentication-adjacent application events, privilege changes, configuration/content publication, sensitive reads, exports if later enabled, lifecycle transitions, approvals, corrections, tracking attempts/abuse, and recovery actions. Secrets, credentials, full provider payloads, and unnecessary personal data are prohibited. Reading/exporting audit evidence is itself audited.

### 5.22 `idempotency_keys`

**Purpose:** make guest submission, Quotation-to-Order conversion, and selected notification enqueue operations retry-safe.

**Required business fields:** command scope; idempotency key; request fingerprint; state; creation/expiry time; original outcome summary.

**Conditional fields:** resulting subject kind/identity; failure classification; completion time; actor/client context.

**Rules:** Scope plus key is unique for its retention window. Reuse with a different fingerprint is rejected and audited. Completed outcome is returned for a valid retry. Expired records may be purged only after the business retry horizon.

## 6. Authoritative MVP Relationships

| Source                            | Relationship                 | Target                                      | Ownership/reference behavior                                                               |
| --------------------------------- | ---------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Supabase Auth user                | `1:0..1`                     | Profile                                     | Auth owns credentials; Profile owns application attributes; no blind cascade.              |
| Profile                           | `0..1:1` verified link       | Customer                                    | Customer history is linked only after proof; closing Profile does not delete Customer.     |
| Customer                          | `1:N`                        | Customer Address                            | Address is owned and archivable; historical snapshots are independent.                     |
| Customer                          | `1:N`                        | Lead                                        | Lead retains submitted customer/contact snapshot.                                          |
| Service Offering                  | `1:N`                        | Lead                                        | Live eligibility at submission plus captured snapshot.                                     |
| Lead                              | `1:N`                        | Lead Note / Lead Status History / Quotation | Children/history retained after Lead closure.                                              |
| Quotation                         | `1:N`                        | Quotation Item / Quotation Status History   | Draft children may be discarded; issued facts retained.                                    |
| Quotation revision                | `1:0..1`                     | Order                                       | Exactly one successful conversion; both retained.                                          |
| Customer                          | `1:N`                        | Order / Notification / Support Case         | Customer closure does not cascade into business evidence.                                  |
| Order                             | `1:N`                        | Order Status History                        | History is append-only and retained.                                                       |
| Template                          | `1:N`                        | Notification                                | Notification captures rendered content/revision.                                           |
| Lead/Quotation/Order/Support Case | `1:N`                        | Attachment                                  | Attachment has one subject; no arbitrary polymorphism.                                     |
| Lead/Quotation/Order              | `1:N` optional context       | Support Case                                | Case may reference one context and cannot mutate it.                                       |
| governed subject                  | `1:N`                        | Audit Log                                   | Audit holds durable identity without enforcing target deletion.                            |
| retryable command                 | `1:1` outcome                | Idempotency Key                             | Key stores original subject/outcome and expires under policy.                              |
| Profile                           | `1:N` accountable references | mutable/admin records                       | Creator/updater/approver references are retained or represented by durable actor snapshot. |

## 7. Cascade, Deletion, and Retention Policy

1. No hard-delete cascade may cross Customer, Lead, Quotation, Order, Notification, Attachment, Support Case, Status History, or Audit Log.
2. Draft, unissued, unreferenced records may be discarded only through an approved policy and with required audit evidence.
3. Catalog, settings, templates, content, Profiles, Customers, and saved addresses use deactivate/archive/retire rather than destructive delete when referenced.
4. Sent Quotations, accepted snapshots, status histories, delivered/failed Notifications, accepted Attachments, and Audit Logs are immutable business evidence.
5. Supabase Auth account deletion or provider unlink never cascades into Profile, Customer, or business records; a governed closure/anonymization process applies.
6. Privacy erasure selects redaction, anonymization, detachment, or approved destruction per legal basis. It is not a general cascade.
7. Idempotency Keys and failed/unneeded upload metadata may be purged after approved short retention when they have no legal hold or business dependency.

## 8. Capability Coverage

| Required capability | Authoritative tables/external authority                                          | Completion test                                                                                                |
| ------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Guest Request       | Customers, Offerings, Add-ons, Coverage, Leads, Lead History, Idempotency, Audit | A bilingual guest submits once, receives a Lead number, and no account is required.                            |
| Customer Account    | Supabase Auth, Profiles, Customers, Customer Addresses                           | Email/Google/Apple identity maps to a Profile and verified Customer without exposing another guest's history.  |
| Lead                | Leads, Notes, Status History, Attachments, Notifications                         | Sales can qualify, assign, clarify, close, and audit a Lead.                                                   |
| Quotation           | Quotations, Items, Status History, Settings, Notifications, Attachments          | A reviewed/approved bilingual revision can be sent and verifiably accepted/rejected.                           |
| Order               | Orders, Order History, Attachments, Notifications, Idempotency                   | One accepted revision creates one Order, schedules, executes, handles exception/cancellation, and completes.   |
| Attachments         | Attachments plus target records                                                  | Authorized users upload/read immutable evidence; unauthorized/quarantined access is denied.                    |
| Notifications       | Templates, Notifications, Customer, target record                                | Transactional sends are bilingual, attributable, retry-safe, and provider outcomes retained.                   |
| Content Pages       | Content Pages                                                                    | Admin publishes complete Arabic/English public content with lifecycle control.                                 |
| Admin Management    | Profiles, Settings, Catalog, Templates, Content, operational records, Audit      | Fixed roles can perform only their approved functions and every privileged change is audited.                  |
| SEO                 | Content Pages                                                                    | Each published public page has canonical/index/sitemap and bilingual metadata; protected journeys are noindex. |
| Settings            | App Settings, Audit                                                              | Approved keys publish individually with validation, version, reason, actor, and rollback evidence.             |
| Authentication      | Supabase Auth + Profiles                                                         | Credential/provider/session ownership stays managed; customer and staff authorization remains distinct.        |
| Audit Logs          | Audit Logs plus domain history                                                   | Material actions and sensitive access/denial are immutable, minimized, searchable by authorized reviewers.     |

## 9. Query and Index Intent

The later physical design MUST support these bounded access paths without adding tables:

- unique lookups by normalized mobile, customer number, Lead number, Quotation number/revision, Order number, case number, setting key, catalog code, template key, content slug, and Auth user reference;
- work queues by current status, assignee, priority, service, route class, scheduled window, and created/updated time;
- exact tracking lookup by Order Number plus normalized tracking Mobile Number without disclosing which value failed;
- child/history retrieval by parent identity and chronological order;
- notification retry queue by status and next-attempt time;
- published catalog/content/settings/templates by status, validity, locale completeness, and display order;
- audit review by event time, actor, target, action, outcome, category, and correlation identity; and
- expiry cleanup for Idempotency Keys and eligible transient artifacts.

Search is not authorization. Every query remains role-, record-, field-, and purpose-scoped.

## 10. Authentication and Authorization Boundary

- Supabase Auth owns credentials, provider links, MFA/recent-auth signals, sessions, verification, and Auth user lifecycle.
- `profiles` owns application status, locale, customer link, and exactly one staff role when applicable.
- Customer account access is based on a verified Profile-to-Customer link.
- Guest tracking is based only on exact Order Number + normalized Mobile Number and returns a minimized projection.
- The five fixed staff roles are Super Admin, Sales, Operations, Finance, and Customer Service. Their permission matrix is reviewed code/RLS policy, not editable table data.
- Service-role credentials are never represented as users, never sent to clients, and never grant a Super Admin UI bypass.

## 11. Internationalization, SEO, and Accessibility Data Rules

- Arabic is required and default; English is required and secondary for all published Offerings, Add-ons, customer status labels, Templates, Content Pages, terms, and customer-facing reasons.
- Machine keys, identifiers, statuses, and role names are locale-neutral.
- Published Quotation, Notification, and Order snapshots preserve the exact locale-specific content used.
- Content Page SEO metadata is locale-complete, unique enough for the approved route strategy, and explicitly indexable or non-indexable.
- Stored rich content uses an approved safe structure that can be rendered semantically, keyboard-accessibly, and in RTL/LTR; raw executable content is prohibited.

## 12. Future Compatibility Without Enterprise Tables

The MVP keeps opaque identifiers, stable business keys, immutable snapshots, explicit owners, normalized contacts, UTC business time, idempotency, and closed subject kinds. These choices allow later migration to organizations, configurable RBAC, normalized execution/fleet, domain events, public APIs, workflow, payments, and analytics.

The MVP intentionally does **not** add `organization_id` columns or dormant enterprise parents. Phase 3 multi-company adoption requires an explicit backfill/migration that creates the Naqlia organization, assigns every owned record, adds referential tenant integrity and RLS, and proves zero cross-tenant leakage before onboarding a second company.

## 13. Physical Design Readiness Gate

SQL design may begin only after owners approve:

- this exact 22-table inventory and field ownership;
- field classification, retention, anonymization, and legal basis;
- lifecycle transition tables and allowed states;
- the Profile role matrix and customer/guest authorization rules;
- Auth linking and account-conflict resolution;
- closed Attachment, Support Case, and Audit target allowlists;
- configuration key allowlist and validation contracts;
- storage upload/scan/access contract;
- notification provider, retry, template-variable, and failure policy;
- content/SEO publication contract;
- indexes, constraints, RLS, audit triggers/services, migration order, seed data, backup, restore, and rollback design; and
- test traceability to the acceptance criteria in the [Implementation Roadmap](./03-MVP-Implementation-Roadmap.md).

Until that gate passes, this document authorizes planning only and creates no database resource.
