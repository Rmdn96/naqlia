# Naqlk Sales Workspace

| Document field | Value                                                |
| -------------- | ---------------------------------------------------- |
| Sprint         | 4 — Sales Workspace                                  |
| Status         | Implemented                                          |
| Version        | 1.0.0                                                |
| Effective date | 2026-08-04                                           |
| Branch         | `feature/sprint-4-sales-workspace`                   |
| Owners         | Engineering, Sales Operations, Security, and Product |
| Parent         | [Public Request Flow](./04-Public-Request-Flow.md)   |

## 1. Purpose

Sprint 4 delivers the first internal staff vertical slice: a Sales-only workspace for reviewing guest requests and preparing, revising, and issuing quotations. It follows the approved MVP flow:

```text
Guest request → Lead → Draft quotation → Sent → Approved → Order ready
```

The implementation deliberately stops at an issued quotation. Customer delivery, quotation approval UI, order creation, operations, finance, payment, dispatch, and customer-account features remain outside this sprint.

## 2. Access boundary

The workspace is available only to an authenticated, active staff Profile with one of these role-permission combinations:

| Role             | `sales.workspace.read` | `sales.workspace.manage` |
| ---------------- | ---------------------- | ------------------------ |
| Super Admin      | Yes                    | Yes                      |
| Sales            | Yes                    | Yes                      |
| Operations       | No                     | No                       |
| Finance          | No                     | No                       |
| Customer Service | No                     | No                       |

The route layout calls the database-authoritative `has_permission` check before rendering. Missing authentication, an inactive Profile, a missing active role, or a denied permission resolves to a non-disclosing not-found response. Internal routes are force-dynamic and set `noindex`, `nofollow`, `noarchive`, and `nocache` robots directives.

The named workspace permissions are intentionally distinct from the broader MVP permission vocabulary. Future Operations capabilities can receive their own permission(s) and command boundary without being implicitly granted Sales access.

## 3. Routes

All routes are locale-prefixed, Arabic-first, and protected by the Sales layout.

| Route                                                              | Purpose                                                                          |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `/{locale}/sales/leads`                                            | Lead Inbox with search, filters, sorting, pagination, and unread state           |
| `/{locale}/sales/leads/{leadId}`                                   | Full Lead detail, addresses, attachments, notes, quotation history, and timeline |
| `/{locale}/sales/leads/{leadId}/quotation`                         | Start a new quotation revision                                                   |
| `/{locale}/sales/leads/{leadId}/quotation?quotation={quotationId}` | Edit a draft or inspect an issued quotation                                      |
| `/{locale}/sales/leads/{leadId}/quotations`                        | Quotation-history-focused view                                                   |

The UI is responsive, starts in Arabic RTL, and can render the same route in English LTR. It does not expose a customer or public API.

## 4. Database changes

Migration: `supabase/migrations/20260804090000_sales_workspace.sql`  
Rollback: `supabase/rollbacks/20260804090000_sales_workspace.rollback.sql`

### 4.1 Data additions

| Resource               | Responsibility                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `quotations.vat_rate`  | Persists the decimal rate used to calculate an auditable quotation total. Issued commercial terms, including the rate, are immutable.                   |
| `quotation_line_items` | Ordered quotation-owned commercial lines with description, quantity, unit price, generated line total, creator, and a unique line number per quotation. |
| `lead_activity_logs`   | Append-only activity timeline for Lead and quotation lifecycle events. Application roles can read but cannot mutate it directly.                        |
| `lead_workspace_views` | Per-staff view markers used to derive the Inbox unread indicator; it is not customer-visible business data.                                             |

The migration also adds focused indexes for quotation lines, Lead timeline ordering, per-profile view state, and Inbox-oriented Lead lookup.

### 4.2 Integrity and concurrency

- A Lead row is locked before the next quotation revision is allocated. This serializes concurrent draft creation for the same Lead and preserves `(lead_id, revision_number)` uniqueness.
- Every quotation line is validated server-side. Its stored line total is generated from quantity × unit price and cannot drift from its inputs.
- The command recalculates subtotal, VAT, and grand total. Browser totals are display-only and are never trusted.
- Drafts may be edited; issued commercial terms are immutable.
- Sending a draft atomically supersedes existing sent quotations for that Lead, sends the selected revision, and advances the Lead from `qualified` to `quoted`.
- A later approved quotation advances an already-quoted Lead to `converted`; this represents **Order Ready**, not order creation.
- An expired sent quotation is displayed as expired and cannot be approved. A future scheduled expiry worker may persist the terminal `expired` status.

## 5. Activity timeline

The database records activity through triggers and command functions. Existing Leads receive one idempotent backfilled `lead_created` event during migration.

| Event                                                                                                          | Producer                 | Meaning                                                       |
| -------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------- |
| `lead_created`                                                                                                 | Lead insert trigger      | Guest or staff request became a Lead.                         |
| `lead_viewed`                                                                                                  | Sales view command       | A Sales workspace user opened the Lead.                       |
| `lead_qualified`                                                                                               | Lead status trigger      | A quotation draft caused a new Lead to be qualified.          |
| `quotation_draft_created`                                                                                      | Quotation insert trigger | A new quotation revision was created.                         |
| `quotation_draft_updated`                                                                                      | Draft-save command       | A Sales user changed an existing draft.                       |
| `quotation_sent`                                                                                               | Quotation status trigger | The quotation was issued internally.                          |
| `quotation_approved`, `quotation_rejected`, `quotation_expired`, `quotation_superseded`, `quotation_cancelled` | Quotation status trigger | Immutable lifecycle record for a quotation status transition. |
| `lead_quoted`, `lead_order_ready`, `lead_closed`, `lead_cancelled`                                             | Lead status trigger      | Lead lifecycle transition.                                    |

Events contain only structured, non-secret operational context and an optional actor Profile. The log has no client mutation grant and is suitable for later notifications, reporting, and compliance retention policy.

## 6. Command boundary and RLS

Sales UI never writes business tables directly. It calls narrowly scoped `security definer` functions with a fixed empty search path:

| Function                                               | Permission               | Responsibility                                                                                         |
| ------------------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `sales_list_lead_inbox(...)`                           | `sales.workspace.read`   | Filtered, sorted, paginated Inbox projection and unread calculation.                                   |
| `sales_get_lead_detail(lead_id)`                       | `sales.workspace.read`   | Full internal Lead projection, history, timeline, and attachment metadata.                             |
| `sales_mark_lead_viewed(lead_id)`                      | `sales.workspace.read`   | Upserts view state and writes `lead_viewed`.                                                           |
| `sales_save_quotation(lead_id, quotation_id, payload)` | `sales.workspace.manage` | Validated new-draft creation or existing-draft update, recalculation, lines, and qualified transition. |
| `sales_send_quotation(quotation_id)`                   | `sales.workspace.manage` | Validated issue, prior-sent revision supersession, and quoted transition.                              |

Each command re-evaluates the active authenticated staff permission in PostgreSQL; it does not trust browser state, route protection, Auth metadata, or a service role. The three new tables have RLS enabled. Authenticated users receive read-only table grants protected by Sales workspace policies. Timeline, line item, and workspace-view mutation remains function-owned; service role is retained only for controlled administrative recovery.

Private attachments stay in the `attachments` bucket. The detail service performs the Sales permission check before creating five-minute server-side signed download links. Storage paths remain metadata only in `lead_attachments`.

## 7. Quotation UI and configuration

The builder supports required line descriptions, quantities, unit prices, automatic subtotal, VAT, grand total, customer notes, internal notes, draft save, and send. Currency is currently SAR. Sending records the workflow state only; it does not send email, WhatsApp, push, or SMS.

Until [Business Settings Management](../backlog/01-Business-Settings-Management.md) is implemented, the server-side fallbacks are:

| Environment variable                    | Required format                | Example | Future source                                |
| --------------------------------------- | ------------------------------ | ------- | -------------------------------------------- |
| `NAQLK_DEFAULT_QUOTATION_VAT_RATE`      | Decimal from `0` through `1`   | `0.15`  | Business Settings VAT/default-pricing policy |
| `NAQLK_DEFAULT_QUOTATION_VALIDITY_DAYS` | Integer from `1` through `365` | `7`     | Business Settings default quotation validity |

They are intentionally not `NEXT_PUBLIC_` values. The server passes the default to the rendered form; the database stores the actual selected VAT rate on every quotation so the issued record remains explainable after configuration changes.

## 8. Error, SEO, accessibility, and performance behavior

- Server action failures return stable UI-safe outcomes; implementation and database error details remain server-side.
- Every form control has an associated label, every destructive line removal has an accessible name, notices use a polite live region, tables retain semantic headers, and signed attachments open with secure `noopener` behavior through `rel="noreferrer"`.
- Amounts, dates, direction, and labels are locale-aware. Public identifiers and mobile numbers remain isolated in LTR `bdi` elements inside Arabic UI.
- Inbox runs as a paginated database projection (maximum 100 records per call; UI uses 20), rather than loading all Leads into the browser.
- Attachment links are short-lived and created only for `available` private objects.
- No Sales route is intended for indexing, sitemap inclusion, or public sharing.

## 9. Verification

The implementation adds:

- database contract tests for permissions, command functions, timeline, integrity, and rollback;
- quotation draft validation tests; and
- authorization helper tests that prove failure-closed behavior and the authoritative permission RPC call.

Required CI and pull-request checks remain:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run security:audit
npm run build
```

## 10. Explicit non-goals and next dependencies

This sprint does **not** add an admin dashboard, Operations workspace, Finance workspace, payments, dispatch, pricing engine, customer quotation approval, order creation, public quotation endpoint, or delivery-channel integration.

The next approved work must separately define:

1. customer-safe quotation delivery and approval authorization;
2. scheduled quotation expiry and notification delivery;
3. order creation only from an approved quotation;
4. Business Settings Management as the source of quotation defaults and business contact data; and
5. an Operations-specific permission, view, and command boundary before Operations gets access.
