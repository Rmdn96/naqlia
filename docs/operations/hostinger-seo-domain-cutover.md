# Hostinger SEO domain correction

## Scope and diagnosis (2026-10-13)

Production origin: `https://naqlk.com`.

The live sitemap returned 58 URLs on the former Vercel hostname. The brand
configuration still identified that hostname as production. Sitemap, metadata
base, robots, localized alternates and structured data share this configuration.
Changing `NEXT_PUBLIC_APP_URL` alone cannot repair SEO output.

This fix is based on `c0f42e54a50a1c7caa7c15ae7a320e515eb1f209`, the current
main containing the Hostinger Next.js 15 stabilization. Develop differs from
this production baseline; do not promote unrelated develop changes with this fix.

Only the fixed SEO origin changes. Eligible public routes remain unchanged:
2 homepages, 2 request pages, 2 privacy pages, 8 service pages, and currently
44 city pages (58 total). City inclusion still depends on registry eligibility;
58 is not a hardcoded production quota. Existing trustworthy city lastmod values
and private-route exclusions are preserved. Historical release documents are not
rewritten. No auth, database, request, payment, DNS or Supabase changes are included.

## Operator checks before deployment

- Obtain explicit approval before deploying this branch; nothing is deployed by
  this document or the tests.
- Hostinger must run the existing Next.js Node application, not a static export:
  `npm ci`, `npm run build`, then `npm run start` using its assigned port.
- Use a supported Node version matching the package engines (Node 22 or newer).
- Confirm `NEXT_PUBLIC_APP_URL=https://naqlk.com` at build and runtime. This is
  the separate auth origin setting, not the SEO origin override.
- Confirm `NODE_ENV=production`; do not copy `VERCEL_ENV=preview` or a Preview
  callback override into Hostinger production.
- Preserve the existing authorized Supabase project URL/keys and all operational
  settings. Never put server secrets in NEXT_PUBLIC variables.
- Verify Supabase Site URL and exact production callback allowlist support the
  current custom domain before email acceptance. Do not broaden allowlists or
  change auth settings as part of this SEO deployment.
- Dashboard environment values were not independently verified in this task;
  public HTTP responses demonstrate the deployed SEO mismatch, not private env values.

## Deploy after approval

Deploy only the reviewed correction on the Hostinger production baseline. Build
fresh output; do not reuse old `.next` artifacts. Restart using the existing
Hostinger workflow. If Hostinger/CDN caching is enabled, invalidate the old
sitemap, robots and public HTML using the existing approved process.

## Post-deployment acceptance

1. Fetch `/sitemap.xml` and `/robots.txt`: HTTP 200; sitemap/host must use
   `https://naqlk.com`, never the former hostname or a Preview hostname.
2. Compare sitemap paths before/after: the same eligible 58 URLs are expected
   unless registry publication has legitimately changed. No duplicates, queries,
   private URLs or forced Draft inclusion.
3. Check every listed URL for HTTP 200 and no unexpected redirects or noindex.
4. Check AR/EN home, city and service canonical, reciprocal hreflang and Arabic
   x-default. Inspect structured-data URLs and visible language/direction.
5. Smoke-test request entry and login routes. Real email testing requires operator
   approval; this patch does not change SMTP or close blocker #24.
6. Once all checks pass, have the operator resubmit the same custom-domain sitemap
   in Search Console and monitor processing. Google recrawling is not immediate.

The old-host redirect strategy is a separate owner-controlled migration action;
this patch neither changes DNS nor configures redirects on the former host.
