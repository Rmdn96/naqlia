# SEO and Local SEO v1

## Purpose

SEO v1 adds truthful, bilingual service discovery without creating doorway pages. The canonical production origin remains `https://naqlk.vercel.app`; Vercel Preview hostnames are never used for canonical, sitemap, Open Graph, or structured-data URLs.

The controlled completion of the remaining City content is documented separately in [SEO Editorial Rollout v1](13-SEO-Editorial-Rollout-v1.md). That rollout preserves this registry, lifecycle, authorization, and routing architecture.

## Repository audit

The implementation extends the existing Next.js locale routes, fixed brand-origin configuration, public request catalog, Super Admin portal, permission/RPC model, RLS posture, and platform Activity Log. Authentication, customer, Sales, Operations, Reviews, tracking, quotation capabilities, and public-request persistence are unchanged. Applied migrations remain immutable.

## Content registry

- `city_seo_contents` owns one editorial record per City and locale. Operational City status, editorial lifecycle, and indexability are separate.
- `city_seo_faqs` stores visible FAQ question/answer pairs relationally.
- `city_seo_routes` stores optional genuine route descriptions relationally.
- Locale/slug and City/locale uniqueness prevent duplicate URLs and records.
- Slugs are lowercase ASCII segments and reject private/reserved route names.
- Editorial fields are plain text with database length and active-content checks. React escaping and safe JSON serialization prevent markup/script injection.
- Anonymous roles have no table access. Two narrow read-only projections return only published public content and the indexable City index.
- `20260822100000_seo_registry_audit_index.sql` covers creator attribution after Performance Advisor identified the new audit foreign key; unrelated historical informational findings remain deferred.

## Readiness and indexability

Lifecycle: `Draft → Ready → Published`. Indexability is an explicit flag and is permitted only for a Published record belonging to an active City. The database validator requires a unique useful title, meta description, H1, substantive introduction and City service-area content, minimum combined editorial depth, at least two FAQs, and no prohibited unsupported claims. Each locale is evaluated independently.

Editing a record returns it to Draft/noindex. Deactivating an operational City preserves its SEO content while immediately disabling indexability. Draft, incomplete, inactive, and non-indexable records are absent from the public index and sitemap.

## Public pages

- City route: `/{locale}/{city-slug}`.
- Global services: `/{locale}/services/furniture-moving`, `goods-transport`, `within-city-transport`, and `intercity-transport`.
- City and Service CTAs safely prefill known City/service values in the existing request wizard. Saved wizard progress takes precedence.
- Pages are server rendered with one-hour tagged caching for public City content. They use the existing design system, responsive layout, and Arabic RTL/English LTR shell.
- Metadata includes fixed production canonical URLs, available-locale alternates, Open Graph/Twitter metadata, and truthful Breadcrumb, Service/WebPage, and visible FAQ structured data.

## Sitemap, robots, and private surfaces

The sitemap contains legitimate static public routes, all four services in both locales, and only Published/indexable/ready active City records. Reliable registry timestamps provide City `lastModified` values. Account, auth, staff, administration, private quote/tracking capability URLs, password/reset/invite routes, and request-success pages are excluded and noindexed. Robots directives are defense in depth; authorization remains server-side.

## Administration and audit

Only Super Admin receives `settings.seo.read` and `settings.seo.manage`. The SEO workspace lists all operational Cities and each locale's readiness, edits content/FAQs/routes, previews Published pages, and controls Ready/Published/indexable state. Database functions re-authorize every mutation, use fixed empty `search_path`, validate state internally, enforce optimistic version checks, and emit bounded Activity Log events without copying full editorial content.

## Seed scope

Riyadh is the only completed Published/indexable example, independently in Arabic and English. Every other existing City receives Arabic and English Draft/non-indexable registry records with no manufactured content.

## Performance

Public projections use composite lookup indexes and cache tags. SEO pages remain server components, reuse optimized public assets, and add no analytics or large client bundle. Below-fold media continues using Next.js image behavior. Admin data is dynamic and permission-gated.

## Production setup and Local SEO backlog

Before broader SEO launch:

1. Complete genuinely distinct Arabic and English editorial content City by City.
2. Verify Google Search Console ownership and submit `https://naqlk.vercel.app/sitemap.xml`.
3. Configure an approved analytics property and consent model before adding GA4/conversion IDs.
4. Configure Google Business Profile using verified business identity, service-area/address policy, official phone, website, categories, hours, photos, and the real review link.
5. During the future `naqlk.com` cutover, change the centralized active origin and Supabase settings, then revalidate canonical, sitemap, robots, redirects, and Search Console.
6. Preserve release blocker **#24 Configure production Custom SMTP**; SEO work does not close or weaken it.

No tracking ID, Google credential, business hours, address, review, rating, price, or unsupported coverage claim is invented by this implementation.
