# Business Settings Management

| Field    | Value                                                                                       |
| -------- | ------------------------------------------------------------------------------------------- |
| Status   | Approved backlog item                                                                       |
| Priority | Post-MVP foundation enhancement                                                             |
| Owner    | Product and Platform Engineering                                                            |
| Scope    | Centralize business-operated public settings without changing the current public-request UI |

## Goal

Introduce one authorized, audited **Business Settings** source for customer-facing operational details. Future application code must resolve these values from Business Settings rather than embedding them in components or relying solely on environment variables.

## Settings in scope

- WhatsApp business number;
- business email address;
- support phone number;
- company address;
- social media links;
- default quotation validity period; and
- future configurable branding, including approved logos, color tokens, legal display name, and localized brand copy.

All public-facing text and address values require Arabic-first content with English counterparts where applicable. Numbers, email addresses, URLs, and quotation-validity rules require normalized validation before publication.

## Required behavior

1. Authorized staff manage settings through a future Admin experience; public callers never receive management access.
2. Values are validated, localized where relevant, auditable, versioned, and publishable independently from deployment.
3. Runtime consumers read the currently published Business Settings value first.
4. Environment variables remain an interim fallback only when no published setting exists. They are not the long-term system of record.
5. Sensitive values are excluded from the public settings surface and remain in encrypted environment or secret-management systems.
6. Public pages receive only the minimum approved data needed to render contact and branding information.
7. A failed or unpublished setting resolves to a safe fallback; it must never expose a secret or block a customer from submitting a request.

## Current fallback

`NEXT_PUBLIC_WHATSAPP_NUMBER` remains the public-request flow fallback for a direct WhatsApp recipient. When it is absent, the current flow opens WhatsApp with the prefilled message and lets the user choose a contact. This behavior remains until Business Settings is implemented.

## Future implementation boundaries

- Define a controlled settings persistence model and access policy in a dedicated sprint; do not add business-settings tables as part of this backlog item.
- Add staff permissions and an Admin management interface only in that dedicated sprint.
- Resolve public values through a server-side settings service with cache invalidation on publish.
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
