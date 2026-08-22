# SEO Editorial Rollout v1

## Purpose

This rollout completes city-level Arabic and English editorial content on the SEO Content Registry introduced by SEO + Local SEO v1. It does not add routes, tables, roles, or a second content system. Riyadh remains unchanged; the rollout covers the other 21 active Service Area cities and their 42 locale records.

The active canonical origin remains `https://naqlk.vercel.app`. Preview deployments are acceptance environments only and never become canonical, sitemap, Open Graph, or structured-data origins.

## Editorial batches

| Batch | Cities                                          |
| ----- | ----------------------------------------------- |
| A     | Jeddah, Makkah, Madinah, Dammam, Al Khobar      |
| B     | Dhahran, Al Ahsa, Jubail, Taif, Tabuk           |
| C     | Abha, Khamis Mushait, Buraidah, Hail, Yanbu     |
| D     | Jazan, Najran, Al Kharj, Arar, Sakaka, Al Bahah |

Every city has independently written Arabic and English title, description, H1, introduction, service explanation, coverage wording, and FAQ selection. Shared statements are limited to stable system behavior such as quotation review, guest submission, tracking, and optional packing/loading support.

## Factual boundaries

- Content describes only Furniture Moving, Goods Transport, Within-City Transport, Intercity Transport, and the configured optional packing/loading and unloading services.
- A city being operationally active does not promise every district, address, date, cargo type, or destination.
- Addresses, access, timing, cargo, and resource availability remain subject to request review.
- Pages contain no prices, review counts, customer counts, fleet counts, guarantees, superlatives, invented neighborhoods, or fabricated routes.
- Jubail and Yanbu copy explicitly avoids implying industrial haulage, customs, international shipping, port handling, or warehousing.
- Highland-city copy asks for useful access and road notes without asserting unsupported route or neighborhood coverage.

## Safe population process

The forward-only migration `20260822210000_seo_editorial_rollout_v1.sql` is generated from the reviewed source in `scripts/seo/editorial-rollout-v1.mjs`.

Before writing, the migration checks that:

1. exactly 21 target cities and 42 locale records are present;
2. every target City is active and not deleted;
3. every target locale remains an untouched version-1 Draft with empty editorial fields and no FAQ or route children;
4. no target has operator attribution or prior publication state.

If any operator has edited a target record, the whole transaction fails and reports only the affected City/locale keys. It never silently replaces operator work.

After insertion, each locale is evaluated by the existing `private.city_seo_readiness_issues` validator. Publication/indexing occurs only after every target record has zero readiness issues. The final transaction assertion requires all 44 active locale records, including the two pre-existing Riyadh records, to remain readiness-valid and Published/Indexable.

The migration deliberately inserts no common-route records because no route list was needed to provide useful content and unsupported route claims are prohibited. Content remains editable through the existing Super Admin workspace. A subsequent operator edit continues to return that record to Draft/noindex under the existing lifecycle.

### Preview factual-scope correction

Initial Preview inspection revealed that the shared City Page shell presents the global Intercity Service card, whose approved wording correctly says journeys originate in Riyadh, while the first editorial dataset could be read as offering local or city-origin service in the destination cities. The authoritative MVP scope remains:

- local transport only when both endpoints are in approved Riyadh coverage; and
- intercity transport only when pickup is in approved Riyadh coverage and the destination City is enabled.

Because the initial rollout migration had already been applied, it was not edited. The forward-only migration `20260822213000_seo_editorial_scope_correction_v1.sql` replaces the 42 destination-locale records with explicit Riyadh-origin copy and explicitly explains that local transport wholly inside each destination city is outside the current published launch scope. It also replaces the FAQs so visible content and FAQ structured data share the same factual boundary.

The corrective migration refuses to modify records that no longer have the exact migration-owned version/state and operator attribution boundary. Its rollback does not restore misleading copy; it safely moves the corrected records to Draft/noindex while retaining their content.

## Editorial and duplication validation

`npm run seo:editorial:check` validates:

- complete Arabic/English pairs and unique City/locale slugs;
- unique normalized SEO titles, meta descriptions, and H1 values;
- existing database/readiness length thresholds;
- language presence, FAQ validity, safe plain text, and forbidden-claim absence;
- at least 500 characters of substantive editorial copy per locale;
- maximum same-locale token-set similarity below `0.58`.

The initial accepted source measured a maximum same-locale Jaccard similarity of `0.374`, between the English Abha and Al Bahah records. After the factual-scope correction, the differentiated introductions and coverage passages measure `0.361` maximum similarity, between English Jazan and Arar. The governed service-scope paragraph is intentionally excluded from that second comparison because the same Riyadh-origin commercial rule must be stated consistently; titles, descriptions, headings, introductions, and coverage copy remain unique.

## Public behavior

Once the migration is applied and cache tags/revalidation have elapsed:

- all 22 active cities have Arabic and English Published/Indexable pages;
- sitemap output contains 44 city URLs plus the existing legitimate public and global-service URLs;
- Arabic and English City pages remain reciprocal through `hreflang` and `x-default` behavior;
- canonical URLs remain on `https://naqlk.vercel.app` even on Preview;
- visible FAQ content is the source of FAQ structured data;
- the shared City Page links to the four global Service Pages and safely passes the configured City identifier into the request flow;
- inactive, Draft, incomplete, or non-indexable records continue to be excluded by the existing architecture.

## Rollback and operator safety

The conservative rollbacks at `supabase/rollbacks/20260822210000_seo_editorial_rollout_v1.rollback.sql` and `supabase/rollbacks/20260822213000_seo_editorial_scope_correction_v1.rollback.sql` are not routine publishing tools. They refuse to run if any target record has operator attribution or an unexpected version. This prevents a rollback from destroying legitimate post-rollout edits. Normal editorial changes, unpublishing, and indexability changes must use the Super Admin SEO workspace.

## Performance and security

The rollout adds only 42 localized rows and their bounded FAQ children. It adds no runtime query, index, client component, bundle dependency, or anonymous mutation path. Existing server rendering, one-hour cache/revalidation policy, public projection functions, RLS, fixed `search_path`, and Super Admin permissions remain authoritative.

## Production follow-up

- Verify Google Search Console ownership for the active production origin.
- Submit `https://naqlk.vercel.app/sitemap.xml` after release approval.
- Configure analytics only after an approved measurement plan and credentials exist.
- Complete verified Google Business Profile information operationally.
- Keep release blocker **#24 Configure production Custom SMTP** open; this rollout neither configures nor changes email delivery.
