# Business Settings Management

| Field    | Value                                                                                       |
| -------- | ------------------------------------------------------------------------------------------- |
| Status   | v1 foundation implemented; governed publishing remains backlog                              |
| Priority | Incremental post-MVP governance enhancement                                                 |
| Owner    | Product and Platform Engineering                                                            |
| Scope    | Centralize business-operated public settings without changing the current public-request UI |

## Goal

Operate one authorized, audited **Business Settings** source for customer-facing operational details. The v1 database, Super Admin UI, runtime resolver, service-area controls, and audit events are implemented by `20260815100000_unified_account_dashboard.sql`. Environment values remain availability fallbacks.

## Settings in scope

- WhatsApp business number;
- business email address;
- support phone number;
- company address;
- social media links;
- default quotation validity period; and
- customer Review edit-window policy (no fixed period is enforced in v1);
- optional Google Review URL (shown without review gating); and
- future configurable branding, including approved logos, color tokens, legal display name, and localized brand copy.

All public-facing text and address values require Arabic-first content with English counterparts where applicable. Numbers, email addresses, URLs, and quotation-validity rules require normalized validation before publication.

## Required behavior

1. Authorized staff manage settings through a future Admin experience; public callers never receive management access.
2. Values are validated, localized where relevant, auditable, versioned, and publishable independently from deployment.
3. Runtime consumers read the current allowlisted Business Settings value first.
4. Environment variables remain an interim fallback only when no published setting exists. They are not the long-term system of record.
5. Sensitive values are excluded from the public settings surface and remain in encrypted environment or secret-management systems.
6. Public pages receive only the minimum approved data needed to render contact and branding information.
7. A failed or unpublished setting resolves to a safe fallback; it must never expose a secret or block a customer from submitting a request.

## Current fallback

`NEXT_PUBLIC_WHATSAPP_NUMBER` is the deployment-level fallback for the official WhatsApp recipient. The current approved value is `966547349947` and is normalized to the international digits-only form required by `wa.me`. The centralized brand configuration provides the same safe fallback when the database setting is unavailable or invalid. The current Business Setting takes precedence.

`NEXT_PUBLIC_GOOGLE_REVIEW_URL` is the optional fallback Google Review destination. It must be HTTPS, is hidden when absent, and is offered independently of the customer's score. Business Settings now owns the primary value; changing either source must never introduce review gating.

## Implemented v1

- Allowlisted, versioned non-secret settings persistence and Super Admin mutation permission.
- Contact, social, customer, quotation, and localized business-identity groups.
- Public projection of only explicitly public rows.
- Database-first runtime resolver with environment/product fallback.
- Existing Cities used as ordered active/inactive Service Areas.
- Safe Activity Log events that record configuration presence/state rather than secret values.

## Remaining future boundaries

- Add draft/review/publish/rollback states and governed localized completeness checks.
- Add explicit cache invalidation and observability for fallback selection.
- Add audit events for draft, review, publish, rollback, and emergency override actions.
- Treat configurable branding as a governed asset and content workflow, not arbitrary CSS or customer-supplied markup.

## Acceptance criteria for the future sprint

- A Super Admin can safely draft, review, publish, and roll back each setting within its authorization scope.
- Public request, quotation, contact, and SEO surfaces resolve approved values from Business Settings.
- Environment variables are used only as documented fallback values and are observable when selected.
- Changes are traceable to actor, time, prior value, new value, and publication outcome.
- Arabic and English content is complete before a public setting can be published.
- No secrets, credentials, or unvalidated URLs can enter the public configuration surface.

## Out of scope

- Admin UI implementation;
- database schema or migration for settings;
- staff permission changes;
- branding redesign; and
- migration of existing environment values.
