# Naqlk Brand Migration

## 1. Scope

This pre-launch maintenance change replaces the former public identity (`Naqlia` / `نقلية`) with `Naqlk` / `نقلك` while preserving database structure, applied migration integrity, the `NQ` reference format, RBAC, RLS, quotation calculations, and business workflows.

## 2. Runtime implementation

`src/config/brand.ts` is the typed runtime authority for localized names and taglines, the `NQ` abbreviation, production and WWW origins, support/social placeholders, and metadata defaults. Components consume that authority for visible wordmarks, accessibility labels, Open Graph site names, JSON-LD, manifest identity, and canonical production configuration.

`NEXT_PUBLIC_APP_URL` remains the callback-safe application origin used by authentication flows. It does not control SEO canonicals. This separation lets Vercel previews function on their deployment origin while metadata consistently identifies `https://naqlk.com` as production.

## 3. SEO and domain behavior

- Canonical origin: `https://naqlk.com`.
- Default locale and `x-default`: Arabic.
- Alternate locales: Arabic and English route equivalents.
- Sitemap, robots host/reference, Open Graph URLs, JSON-LD, browser titles, and application manifest use the new identity.
- Expected domain behavior: `https://www.naqlk.com` permanently redirects to the same path on `https://naqlk.com`.
- Provider preview domains remain usable but never become canonical origins.

## 4. Technical identifier changes

- Package metadata and new local draft keys use `naqlk`.
- New quotation fallback variables use the `NAQLK_` prefix.
- Existing database names, UUIDs, storage paths, migrations, and public `NQ-YYYYMM-000001` references are unchanged.

Because public launch has not occurred, changing the browser draft key intentionally starts a clean pre-launch draft namespace. It does not alter submitted Leads.

## 5. Historical and external references intentionally retained

The following are not active customer-facing branding and must not be rewritten solely for this rename:

1. Applied migrations `20260803140500_identity_create_foundation.sql` and `20260803153000_core_business_create_schema.sql` contain historical comments using `Naqlia`. Editing them would invalidate the approved checksum manifest and production migration history.
2. The GitHub repository slug and URL remain `Rmdn96/naqlia`; repository renaming is a separate impact-assessment task.
3. The provider-generated legacy Vercel domain remains during cutover until `naqlk.com`, HTTPS, primary routing, WWW redirect, and Auth callbacks are verified.
4. The Supabase project reference is an external immutable identifier and is not renamed.

## 6. External platform checklist

- Vercel project display name and domains are updated without breaking Git integration or previews.
- GitHub repository description and homepage identify Naqlk and `https://naqlk.com`; repository name remains unchanged.
- Supabase Auth Site URL is `https://naqlk.com`; production, callback, safe preview, and localhost redirect URLs are allowlisted.
- DNS ownership, certificate issuance, primary routing, and WWW redirect are verified before the legacy provider domain is considered removable.

## 7. Verification

Release evidence must include bilingual rendering and directionality, page metadata, sitemap, robots, JSON-LD, WhatsApp templates, request reference behavior, Sales access boundary, internal links, full automated checks, brand-remnant classification, Vercel Preview verification, and Supabase Security and Performance Advisor results.

## 8. Cutover status

| Surface            | Status                                                                                                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub metadata    | Repository description and homepage identify Naqlk and `https://naqlk.com`; the repository slug remains unchanged.                                                                                                        |
| Vercel project     | Display/project name changed to `naqlk` with the same project ID and Git integration. The former provider domain remains assigned during cutover.                                                                         |
| Vercel domains     | `naqlk.com` is assigned to Production. `www.naqlk.com` is configured as a `308` redirect to `naqlk.com`. Both await external DNS validation.                                                                              |
| Vercel environment | `NEXT_PUBLIC_APP_URL` is `https://naqlk.com` for Production and Preview. A new deployment is required to consume it.                                                                                                      |
| Supabase Auth      | Site URL is `https://naqlk.com`. The apex, production callback, `localhost`, and `127.0.0.1` callback origins are allowlisted. Legacy provider URLs remain temporarily to avoid breaking staff access before DNS cutover. |

The authoritative DNS records shown by Vercel at cutover are:

- apex: `A`, name `@`, value `216.198.79.1`;
- WWW: `CNAME`, name `www`, value `92aebbb0ce6d4934.vercel-dns-017.com.`.

HTTPS issuance, valid configuration, apex routing, and the WWW redirect cannot be accepted until the domain owner publishes these records and propagation completes.

## 9. Remaining brand work

Final logo masters, social-preview artwork, complete favicon/PWA icon sets, verified support/social values, and any repository rename remain separately approved work. None may be invented or inferred by implementation agents.
