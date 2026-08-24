# Customer Quotation Response Flow

**Status:** Implementation contract  
**Scope:** Guest customer response through accepted-quotation Order creation  
**Default locale:** Arabic (`ar`, RTL)  
**Secondary locale:** English (`en`, LTR)

## 1. Repository audit and reconciled model

The implementation extends the approved Sprint 4 architecture instead of replacing it.

| Concern             | Existing authority                                                     | Reconciliation decision                                                          |
| ------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Quotation lines     | `quotation_line_items`, immutable after issue                          | Retained unchanged                                                               |
| Versioning          | `quotations.revision_number`, unique per Lead                          | Retained; a sent revision is superseded by a newly sent revision                 |
| Customer acceptance | Quotation status `approved`                                            | `approved` remains the stored authoritative state; customer UI calls it Accepted |
| Customer rejection  | Quotation status `rejected`                                            | Retained; response timestamp and optional reason metadata are added              |
| Lead workflow       | `new → qualified → quoted → converted`                                 | Retained; the conceptual “Approved” Lead state maps to `converted`               |
| Order source        | Unique `orders.quotation_id` plus immutable financial snapshot trigger | Retained; acceptance inserts through this boundary in the same transaction       |
| Timeline            | Append-only `lead_activity_logs` and existing trigger writers          | Extended with customer-access and response events                                |
| Public commands     | Narrow `SECURITY DEFINER` RPC pattern                                  | Extended with two token-scoped RPCs; no anonymous table grants                   |

The product language uses “Accepted,” while the established schema uses `approved`. Renaming that applied state would create needless migration and application risk, so the mapping is deliberate and documented.

## 2. Customer access architecture

Sending a Quotation generates 32 cryptographically random bytes and encodes them as a 64-character lowercase hexadecimal capability token. The database stores only the SHA-256 digest. The plaintext token is returned once by the Sales send/reissue command and is never persisted, logged, added to activity metadata, or recoverable later.

The link format is `/{locale}/quote/{token}`. A token is scoped by foreign key to exactly one Quotation revision. UUIDs, Lead references, and mobile numbers do not authorize this route.

`quotation_customer_accesses` owns:

- the 32-byte token digest;
- quotation scope;
- issue and Quotation-aligned expiry timestamps;
- first/last view timestamps;
- active, responded, or revoked state; and
- explicit revocation reason.

The partial unique index permits at most one active capability per Quotation. Token rotation revokes the previous capability before issuing its replacement.

## 3. Token lifecycle

1. Sales sends a valid, unexpired draft.
2. The database locks the Lead and Quotation, supersedes prior sent revisions, and revokes their active capabilities.
3. The draft becomes `sent` and one new random capability is issued.
4. Sales copies or opens the link from the immediate command result.
5. A later reissue revokes the old link as `reissued`; plaintext cannot be recovered.
6. Acceptance/rejection marks the capability `responded`.
7. Expiry or supersession revokes an active capability.

The indexed digest comparison operates over fixed-length high-entropy values. Invalid tokens receive a generic unavailable response. This removes practical enumeration value; external request-rate controls remain the appropriate additional abuse boundary for the public endpoint.

## 4. Customer-safe read model

`customer_get_quotation` validates the token format, hashes it, locks its access record, enforces expiry, and returns one sanitized JSON document. It contains the public Lead reference, customer/service/route summary, immutable line items, totals, VAT, customer notes, state timestamps, and customer-facing Order number when accepted.

It never returns internal notes, employee identities, RBAC details, database UUIDs, rejection text, access identifiers, or another revision's token. Anonymous UUID queries and anonymous list operations remain denied by RLS and table privileges.

The first valid view emits one `customer_quotation_viewed` event. Refreshes update the last-view timestamp without producing noisy duplicate timeline entries.

## 5. Acceptance and Order transaction

`customer_respond_to_quotation` is the sole guest mutation boundary. It locks the access, Quotation, and Lead rows before checking state and server time.

Acceptance:

1. requires an active `sent` Quotation and active capability;
2. rechecks expiry and supersession server-side;
3. transitions the Quotation to authoritative status `approved` with a database timestamp;
4. creates the Order in the same transaction;
5. relies on the existing Order trigger to copy immutable financial and tracking snapshots;
6. relies on unique `orders.quotation_id` plus `ON CONFLICT` to guarantee at most one Order; and
7. marks access responded and writes customer-acceptance and Order-created events.

Row locks serialize double clicks, concurrent tabs, competing accept/reject requests, and network retries. A retry returns the already-final state and existing Order number without creating another Order.

## 6. Rejection workflow

Rejection requires confirmation but not a reason. The optional code is one of Price, Timing, Changed Requirements, No Longer Needed, or Other; optional detail is trimmed and limited to 500 characters. Server timestamps are authoritative. The customer read model does not return the recorded rejection reason after submission.

## 7. Immutability and supersession

Drafts remain editable. After issue, currency, financial totals, VAT, expiry, localized terms, customer notes, and line items are immutable. Internal staff notes remain an internal operational field and are never exposed publicly.

Sending a newer revision:

- locks the prior sent revision;
- revokes its active capability;
- sets it to `superseded` with an explicit replacement relation; and
- issues access only for the new revision.

The old page may state that a newer version exists, but it never discloses or redirects to the new capability.

## 8. State authority

| Concept                    | Authoritative state                  |
| -------------------------- | ------------------------------------ |
| Lead intake/workflow       | `leads.status`                       |
| Commercial offer lifecycle | `quotations.status`                  |
| Guest capability lifecycle | `quotation_customer_accesses.status` |
| Acceptance timestamp       | `quotations.approved_at`             |
| Rejection timestamp/reason | Quotation rejection columns          |
| Execution lifecycle        | `orders.execution_status`            |

Derived Sales labels such as Awaiting Customer Response do not introduce duplicate stored state.

## 9. Security model

- All sensitive functions are `SECURITY DEFINER` with fixed empty `search_path` and fully qualified objects.
- Staff issue/reissue commands call the existing authoritative Sales permission check.
- Anonymous execute is limited to token-scoped get/respond RPCs.
- RLS remains enabled; anon/authenticated receive no access-table privileges.
- Input format and rejection bounds are validated before lookup or mutation.
- Token material is excluded from activity details, application logging, analytics, metadata, structured data, and error text.
- The customer route sends `Referrer-Policy: no-referrer`, `Cache-Control: private, no-store`, and `X-Robots-Tag` protections.
- No service-role credential reaches browser code.

URL capabilities can appear in browser history by design. Customers and staff must share them only through the intended private channel. Future automated delivery should additionally set provider-side retention and redaction policies.

## 10. SEO and privacy

Customer Quotation pages are excluded from the sitemap and emit `noindex`, `nofollow`, `noarchive`, and `nosnippet`. The page canonical points to the locale root rather than the token URL. It emits no token-specific Open Graph or structured-data value. Public marketing SEO remains unchanged.

## 11. Sales workflow

Sending returns the secure link once. The UI can copy or open it immediately. Reloading cannot recover the token. For an active sent Quotation, Sales can explicitly reissue access, which revokes the previous link and returns a replacement once.

The timeline exposes issued, viewed, accepted, rejected, Order-created, and revoked events. Existing sent/approved/rejected/expired/superseded statuses remain visible in Quotation history.

## 12. Notification boundary

This sprint does not integrate SMS, email delivery, WhatsApp Business API, or an external notification provider. Customer contact actions resolve the centralized `NEXT_PUBLIC_WHATSAPP_NUMBER` deployment fallback (`966547349947`) and never include the secure quotation capability in the prefilled message. Business Settings will become the authoritative source without changing CTA consumers. Sales manually copies the secure link through the separate one-time delivery boundary. Automated delivery is a future capability and must consume a newly issued link without persisting plaintext beyond the approved provider boundary.

## 13. Migration and rollback

- Forward migration: `20260812190000_customer_quotation_response.sql`
- Conditional rollback: `20260812190000_customer_quotation_response.rollback.sql`

Rollback is fail-closed after any capability has been issued because removing the model would destroy commercial security/audit evidence. After use, remediation must be a new forward migration.

## 14. Operational verification

Before release, operators must verify migration checksum/history, active functions and grants, RLS, Security Advisor, Performance Advisor, and the Arabic/English preview journeys. Test records must be clearly labelled and archived/cancelled without removing audit evidence.
