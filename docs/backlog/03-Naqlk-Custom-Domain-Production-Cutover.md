# Naqlk Custom Domain Production Cutover

## Status

Planned pre-launch operation. The custom domain is not registered and must not block MVP development. Until this item is completed, `https://naqlk.vercel.app` remains the active production, authentication Site URL, and SEO canonical origin.

## Objective

Move the active production authority from `https://naqlk.vercel.app` to `https://naqlk.com` through configuration-first changes with minimal or no application code changes.

## Required sequence

1. Register `naqlk.com` through an approved registrar account.
2. Attach `naqlk.com` and `www.naqlk.com` to the existing Vercel project without changing its identity or Git integration.
3. Configure the Vercel-required apex and WWW DNS records without altering unrelated mail, verification, or service records.
4. Wait for DNS propagation and valid HTTPS certificate issuance.
5. Change `BRAND.domains.activeProductionOrigin` and the production `NEXT_PUBLIC_APP_URL` to `https://naqlk.com`.
6. Update the Supabase Auth Site URL to `https://naqlk.com` while retaining only required production, preview, and localhost redirects.
7. Verify Email Auth and any approved OAuth callbacks; Google and Apple remain disabled until separately approved credentials exist.
8. Change and verify canonical metadata, `metadataBase`, Open Graph, and JSON-LD URLs through the centralized brand authority.
9. Verify every sitemap entry and the robots sitemap/host references.
10. Configure and verify a permanent, loop-free `https://www.naqlk.com` redirect to `https://naqlk.com`.
11. Verify ownership, sitemap submission, canonical recognition, and crawl status in the approved Search Console property.
12. Perform full Arabic, English, Guest Lead, WhatsApp, staff-authentication, SEO, redirect, certificate, security-advisor, performance-advisor, and rollback acceptance.

## Completion evidence

- DNS and certificate evidence for apex and WWW;
- production and callback smoke-test results;
- bilingual live acceptance with archived synthetic records;
- canonical, sitemap, robots, Open Graph, and structured-data evidence;
- redirect and Search Console evidence;
- updated Vercel and Supabase inventories; and
- removal or documented retention of obsolete provider-domain callbacks.

The active origin must never be changed merely because a future domain is present in configuration. The cutover is complete only after the entire sequence passes.
