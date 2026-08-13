# Reviews & Quality Management v1

## Status and scope

This document records the implementation authority for verified customer Reviews and internal Quality follow-up. The capability extends the completed Operations workflow; it does not introduce public testimonials, a final Staff Portal, Google API integration, messaging automation, or review gating.

## Repository audit findings

- An accepted immutable Quotation creates exactly one commercial Order, and the Order trigger creates exactly one `operational_jobs` record.
- A Job reaches `completed` only through customer receipt confirmation or an authorized reasoned Manual Completion after all required Trips are delivered. Commercial Order execution is reconciled transactionally.
- Customer Tracking is an existing 256-bit random capability. Only SHA-256 hashes are stored in `job_tracking_accesses`; rotation revokes the prior capability, and anonymous callers have no direct operational table grants.
- Drivers participate through the current Driver assigned to a delivered Trip. A Job can contain multiple Trips and Drivers; cancelled or undelivered Trips are not eligible Review participants.
- `lead_activity_logs` is the shared business Activity Timeline. Review and Quality events extend it without storing Review comments, internal notes, or tracking tokens.
- RBAC uses stable permissions, role grants, RLS, authoritative private permission helpers, and fixed-search-path `SECURITY DEFINER` RPCs.
- Existing roles are `super_admin`, `sales`, `operations`, `finance`, and `customer_service`. Before this increment, Customer Service had no dedicated workspace and Operations had only its execution permissions.
- Arabic `/ar` routes are RTL/default and English `/en` routes are LTR. Secure Tracking routes already enforce dynamic rendering, `noindex`, `nofollow`, `no-store`, and `Referrer-Policy: no-referrer` and are absent from the sitemap.
- Business Settings remains an approved backlog boundary. WhatsApp is environment-backed today; Review edit-window policy and an optional Google Review URL join that future configuration scope.
- Production migration history through `20260813211500_operations_order_state_reconciliation.sql` was the starting database authority. No applied migration was edited.

## Data model

### Job Review

`job_reviews` owns one verified customer Review per completed Job. `job_id` is unique, so updates retain the original `created_at` and increment `version` instead of creating duplicates. Overall rating is required; punctuality, handling, and a 2,000-character comment are optional. Ratings are constrained to integers 1–5.

`is_verified` is invariant and database-enforced. It means the Review originated from an eligible completed Job capability; it is not a customer input and is unrelated to publication approval.

### Driver rating

`review_driver_ratings` stores at most one optional rating per Driver per Review. The customer RPC accepts only Drivers found on delivered Trips of the capability-scoped Job. This rejects unrelated, inactive/random, cross-Job, and duplicate Driver substitutions while supporting independent multi-Trip/multi-Driver ratings.

The model deliberately rates Drivers, not individual workers. Future analytics can aggregate verified Driver averages by `driver_id` without mixing them with Job-level scores.

### Quality Alert

An overall rating of 1 or 2 creates `quality_alerts` exactly once for the Job/Review. Unique constraints and `ON CONFLICT` make concurrent low-rating submissions idempotent. Later Review edits reuse the Alert. A low-to-high change does not delete or auto-resolve it; a high-to-low change creates it if absent.

Alerts support `open`, `in_progress`, and `resolved`, optional assignment, server timestamps, a resolution summary, and append-only internal notes in `quality_alert_notes`. Customer payloads never include Alert data.

## Secure customer boundary

The Review is integrated into secure Customer Tracking and is available only when all conditions hold:

1. the supplied token is a well-formed, high-entropy Tracking capability;
2. its SHA-256 hash matches one active, unexpired access record; and
3. the scoped Job is `completed`.

`customer_get_job_review` returns only the customer's editable Review and eligible participating Driver display names/identifiers. `customer_upsert_job_review` performs all eligibility, field, Driver membership, and duplicate checks internally. Anonymous users receive execute access only to these two narrow RPCs and no Review, rating, Alert, Profile, or Activity table access.

The token is never persisted in Review data, Activity metadata, Google links, staff responses, or logs. The existing Tracking page protections prevent referrer and indexing leakage.

## Edit and concurrency semantics

One transaction-level advisory lock per Job serializes simultaneous first submissions and edits. The Job and capability are also locked and revalidated, so revocation/completion status remain authoritative. The unique Job constraint is the final duplicate safeguard.

Customer updates replace the Review's optional Driver-rating set inside the same transaction, preserve `created_at`, set `updated_at` server-side, and increment `version`. Quality Alert insertion remains race-safe. Publication and consent mutations lock the same Review row, preventing an inconsistent published-without-consent result.

No hardcoded edit window exists. A future governed edit-window policy belongs in Business Settings.

## Consent and publication workflow

Reviews are not public by default. The supported states are:

- `private`: no publication request;
- `pending_publication`: consent exists and staff review is required;
- `published`: authorized approval with current consent;
- `unpublished`: withdrawn or administratively removed.

Publication consent is explicit, safely false by default, editable, and audited. Consent never publishes a Review by itself. Only `quality.publication.manage` can publish, unpublish, feature, or unfeature. Featured requires both published state and current consent.

Any material customer edit to ratings, Driver ratings, or comment moves a Published Review to `pending_publication` and removes feature eligibility until re-approved. Consent withdrawal immediately moves published/pending content to `unpublished` and unfeatures it. Constraints prevent publication or featuring without consent even under races.

Public testimonial rendering is intentionally absent. A future projection must expose only moderated text and a safe display identity such as first name and city—never full name, mobile, address, NQ reference, IDs, operational incidents, notes, or capabilities.

## RBAC and staff workspace

| Permission                   | Super Admin | Customer Service | Operations | Sales | Finance |
| ---------------------------- | ----------- | ---------------- | ---------- | ----- | ------- |
| `quality.workspace.read`     | Yes         | Yes              | Yes        | No    | No      |
| `quality.alert.manage`       | Yes         | Yes              | No         | No    | No      |
| `quality.publication.manage` | Yes         | No               | No         | No    | No      |

The localized `/[locale]/quality/reviews` workspace supplies filters, Review/Driver detail, consent and publication state, Quality Alert notes, and resolution. Operations has read visibility for Driver quality. Customer Service manages follow-up but not publication. Super Admin governs publication. Sales and Finance receive no Review mutation permission.

RLS permits authenticated reads only through the corresponding permission. Direct writes are revoked; staff mutations use internally authorized RPCs.

## Google Review boundary

`NEXT_PUBLIC_GOOGLE_REVIEW_URL` is an optional validated HTTPS fallback. If absent or invalid, the CTA is hidden. If configured, it appears after an internal Review exists regardless of whether the rating is 1, 2, 3, 4, or 5. The app never copies Review content or includes a tracking token. There is no Google API integration or review gating.

Business Settings must eventually own this URL ahead of the environment fallback.

## Activity Timeline

The shared Activity Timeline records Review submission/update, consent changes, low-rating Alert creation, Alert status/resolution, publication approval/unpublish, and feature/unfeature. Metadata is deliberately limited to state, score, or version—not customer comments, Quality notes, or capabilities.

## Future Dashboard integration

The Quality workspace is a focused v1 surface. A future unified Staff Portal can consume the same permissions and RPCs, and analytics can derive verified Job/Driver averages from the normalized model. It must not duplicate RBAC, publication, Alert, or secure-customer logic.
