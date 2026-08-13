# Operations Management v1

## Decision record

Operations extends the accepted commercial workflow; it does not replace it. `Order` remains the immutable commercial snapshot, `Operational Job` is the complete execution aggregate, and `Trip` is one physical journey. One Order has exactly one Job and one Job has zero-to-many Trips.

## Repository audit

- Customer quotation acceptance already serializes access, quotation, Lead, and Order rows and guarantees one Order through `orders.quotation_id` uniqueness.
- Lead statuses are `new`, `qualified`, `quoted`, `converted`, `closed`, and `cancelled`. Quotation statuses are `draft`, `sent`, `approved`, `rejected`, `expired`, `superseded`, and `cancelled`.
- Order status is the coarse commercial/execution bridge: `created`, `scheduled`, `in_progress`, `completed`, or `cancelled`. Operations does not duplicate every Trip state onto Order.
- `lead_activity_logs` is the append-only cross-workflow timeline. Operations extends it with nullable Job/Trip scope rather than creating a competing log.
- RBAC already includes Operations but previously assigned it no business permission. The new read/manage permissions go to Operations and Super Admin. Sales receives read-only operational visibility.
- Guest quotation access established the approved capability pattern: 256-bit random token, SHA-256 hash at rest, one-time plaintext delivery, narrow RPCs, rotation, revocation, RLS denial, fixed `search_path`, and no token logging.
- Addresses, services, normalized `+9665…` mobile numbers, configuration-first WhatsApp, and Business Settings backlog are reused.

## Transaction and state authority

An `AFTER INSERT` Order trigger inserts the Job in the same database transaction. The unique Order foreign key and conflict-safe insert make retries idempotent. Existing Orders are deterministically backfilled. No Trip is created automatically.

Job state is derived from all non-cancelled Trips: none is Unscheduled; scheduled Trips are Scheduled; any executing Trip is In Progress; all active Trips delivered is Awaiting Customer Confirmation. Only customer confirmation or reasoned manual completion produces Completed. Trip state follows the strict forward sequence documented in the migration. Delay, pause, and operational issue are separate conditions and never overwrite execution state.

## Resources and scheduling

Drivers, vehicles, and external carriers are lightweight operational directories without authentication, payroll, settlement, or fleet-maintenance concerns. Individual workers are deliberately represented only by a validated `workers_count` on Trip. Pickup and delivery are timezone-aware windows interpreted as `Asia/Riyadh`.

Overlapping active Driver or Vehicle assignments return a warning. An authorized operator may explicitly override with a reason; the assignment history and Activity Timeline preserve prior/current resources, actor, time, and override evidence. Changes after execution begins also require a reason.

## Customer tracking and threat model

`/{locale}/track/{token}` is a private capability URL. The token is 32 random bytes encoded as 64 lowercase hexadecimal characters; only its SHA-256 digest is stored. It scopes access to one Job and never authorizes tables, UUID lookup, financial mutation, resource assignment, or cross-Job access. Rotation revokes the previous URL immediately.

Recovery accepts NQ reference plus normalized mobile only to issue a new capability; it never returns Job data directly. Failure is generic. Database row locking, the unique active capability, and unique pending cancellation constraint make replay and concurrency safe. Edge/application rate limiting remains an infrastructure follow-up before high-volume launch; the database boundary already prevents enumeration through response content.

Tracking responses project only customer-safe fields. Driver contact appears only from Confirmed through Arrived and only for the current assignment. Internal condition reasons, staff identities, UUIDs, audit metadata, and accepted financial internals are excluded. Pages send `private, no-store`, `noindex, nofollow, noarchive`, and `Referrer-Policy: no-referrer`, are absent from sitemap, and emit no token metadata.

## Delivery, completion, and cancellation

All Trips must be Delivered before confirmation. Customer confirmation is idempotent and server-timestamped. Manual completion requires the same prerequisite plus an internal reason and authorized actor. Customers submit a cancellation request; they never cancel an Order directly. Operations approves or rejects it with reason and audit evidence. Refunds and fees remain out of scope.

## Future boundaries

GPS, Driver App/PWA, individual workers, payroll, settlement, fleet maintenance, route optimization, payments, automated messaging, reviews, analytics, and configurable completion/contact retention remain future capabilities. The normalized resources and aggregate model allow those additions without changing the v1 commercial records.
