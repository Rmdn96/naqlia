# Naqlk Brand Migration

## 1. Scope

This pre-launch maintenance change replaces the former public identity (`Naqlia` / `نقلية`) with `Naqlk` / `نقلك` while preserving database structure, applied migration integrity, the `NQ` reference format, RBAC, RLS, quotation calculations, and business workflows.

## 2. Runtime implementation

`src/config/brand.ts` is the typed runtime authority for localized names and taglines, the `NQ` abbreviation, `activeProductionOrigin`, `futureCustomDomain`, `futureWwwDomain`, support/social placeholders, and metadata defaults. Components consume that authority for visible wordmarks, accessibility labels, Open Graph site names, JSON-LD, manifest identity, and canonical production configuration.

`NEXT_PUBLIC_APP_URL` remains the callback-safe application origin used by OAuth flows. Vercel Production and Preview use `https://naqlk.vercel.app` during pre-launch, while browser-origin Email Auth callbacks remain separately allowlisted. SEO canonicals never derive from a preview hostname or request host; they resolve from `BRAND.domains.activeProductionOrigin`.

## 3. SEO and domain behavior

- Active production and canonical origin: `https://naqlk.vercel.app`.
- Future commercial domain: `https://naqlk.com` (unregistered and not live).
- Default locale and `x-default`: Arabic.
- Alternate locales: Arabic and English route equivalents.
- Sitemap, robots host/reference, Open Graph URLs, JSON-LD, browser titles, and application manifest use the new identity.
- Future cutover behavior: `https://www.naqlk.com` permanently redirects to the same path on `https://naqlk.com` after registration and acceptance.
- Provider preview domains remain usable but always emit `https://naqlk.vercel.app` as canonical.

## 4. Technical identifier changes

- Package metadata and new local draft keys use `naqlk`.
- New quotation fallback variables use the `NAQLK_` prefix.
- Existing database names, UUIDs, storage paths, migrations, and public `NQ-YYYYMM-000001` references are unchanged.

Because public launch has not occurred, changing the browser draft key intentionally starts a clean pre-launch draft namespace. It does not alter submitted Leads.

## 5. Historical and external references intentionally retained

The following are not active customer-facing branding and must not be rewritten solely for this rename:

1. Applied migrations `20260803140500_identity_create_foundation.sql` and `20260803153000_core_business_create_schema.sql` contain historical comments using `Naqlia`. Editing them would invalidate the approved checksum manifest and production migration history.
2. The GitHub repository slug and URL remain `Rmdn96/naqlia`; repository renaming is a separate impact-assessment task.
3. The legacy `naqlia.vercel.app` alias remains temporarily for rollback and existing staff callback continuity. The active clean provider alias is `naqlk.vercel.app`.
4. The Supabase project reference is an external immutable identifier and is not renamed.

## 6. External platform checklist

- Vercel project display name and domains are updated without breaking Git integration or previews.
- GitHub repository description identifies Naqlk and its homepage uses the active Vercel production origin; repository name remains unchanged.
- Supabase Auth Site URL is `https://naqlk.vercel.app`; production, callback, safe preview, and localhost redirect URLs are allowlisted.
- The custom-domain backlog governs future registration, DNS, certificate, routing, WWW redirect, callback, and SEO cutover. Invalid future-domain entries may remain in Vercel because they do not affect the active provider alias.

## 7. Verification

Release evidence must include bilingual rendering and directionality, page metadata, sitemap, robots, JSON-LD, WhatsApp templates, request reference behavior, Sales access boundary, internal links, full automated checks, brand-remnant classification, Vercel Preview verification, and Supabase Security and Performance Advisor results.

## 8. Cutover status

| Surface            | Status                                                                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GitHub metadata    | Repository description identifies Naqlk. Homepage uses `https://naqlk.vercel.app`; the repository slug remains unchanged.                                                                                                                  |
| Vercel project     | Display/project name is `naqlk` with the same project ID and Git integration.                                                                                                                                                              |
| Active domain      | `https://naqlk.vercel.app` is a valid Production alias and the pre-launch runtime/SEO authority.                                                                                                                                           |
| Future domains     | `naqlk.com` remains assigned to Production and `www.naqlk.com` remains a future `308` redirect. Both are intentionally invalid until the domain is registered.                                                                             |
| Vercel environment | `NEXT_PUBLIC_APP_URL` is `https://naqlk.vercel.app` for Production and Preview.                                                                                                                                                            |
| Supabase Auth      | Site URL is `https://naqlk.vercel.app`. Active production, callback, approved preview, `localhost`, and `127.0.0.1` callback origins are allowlisted. Future custom-domain and legacy rollback URLs may remain until final cutover review. |

The authoritative DNS records shown by Vercel at cutover are:

- apex: `A`, name `@`, value `216.198.79.1`;
- WWW: `CNAME`, name `www`, value `92aebbb0ce6d4934.vercel-dns-017.com.`.

These DNS records are future-cutover inputs only. Their absence does not block development while `https://naqlk.vercel.app` is the active origin. The complete future sequence is tracked in [Naqlk Custom Domain Production Cutover](../backlog/03-Naqlk-Custom-Domain-Production-Cutover.md).

## 9. Dependency security decision

`postcss@8.5.25` declares `nanoid@^3.3.16`; the lockfile previously resolved `nanoid@3.3.16`, which is affected by the zero-size custom-generator infinite-loop advisory. PostCSS is build/CSS tooling and is used by Next.js, Autoprefixer, Tailwind CSS, shadcn, and Vite; the affected package is not an application business dependency, but dependency policy still requires a clean high-severity audit.

The root override `nanoid@3.3.17` is the smallest compatible remediation. It stays within PostCSS's declared range, changes no framework package, and requires no broad dependency upgrade. Tests, production build, and `npm audit --audit-level=high` must pass after the lockfile update. The separate moderate transitive Hono advisory remains tracked and is not changed in this migration.

## 10. Remaining brand work

Final logo masters, social-preview artwork, complete favicon/PWA icon sets, verified support/social values, and any repository rename remain separately approved work. None may be invented or inferred by implementation agents.
