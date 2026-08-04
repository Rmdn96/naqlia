# Naqlk Brand Guidelines

## 1. Authority

This document defines the approved public identity for Naqlk. Runtime code MUST consume the typed brand authority in `src/config/brand.ts`; documentation may state stable brand facts directly where clarity requires it.

## 2. Official identity

| Element         | Approved value                      |
| --------------- | ----------------------------------- |
| Arabic name     | نقلك                                |
| English name    | Naqlk                               |
| Abbreviation    | NQ                                  |
| Arabic tagline  | نقلك... ننقل كل ما يهمك             |
| English tagline | Your move. Everything that matters. |
| Primary origin  | `https://naqlk.com`                 |
| WWW origin      | `https://www.naqlk.com`             |

The Arabic name is the default public expression. English surfaces use `Naqlk`; they MUST NOT transliterate the Arabic name differently. The abbreviation is always uppercase `NQ` and remains the approved prefix for public Lead references.

## 3. Naming rules

1. Use `نقلك` in Arabic customer communication and `Naqlk` in English communication.
2. Do not add a space, change capitalization, or append legal suffixes that have not been approved.
3. Use the official localized tagline verbatim. Do not translate either tagline ad hoc.
4. Product, browser, social, structured-data, and accessibility names must resolve from the centralized brand configuration where runtime use is appropriate.
5. Use `naqlk` for new package, cache, asset, and non-customer technical identifiers. Do not rename applied migrations, database objects, or external IDs merely to make them match the brand.
6. Support contacts and social accounts remain placeholders until Business Settings Management or an approved operator configuration supplies them.

## 4. Domain rules

- `https://naqlk.com` is the only canonical production origin.
- `https://www.naqlk.com` must redirect permanently to the equivalent path on the primary origin.
- Preview deployments may serve the application but must emit `https://naqlk.com` canonical, sitemap, Open Graph, and structured-data URLs.
- Authentication callbacks use the active request/application origin and an allowlisted callback path; canonical metadata must not be reused as a runtime callback origin.
- Old or provider-generated domains remain available during cutover until the primary domain, HTTPS, redirects, and authentication callbacks are verified.

## 5. Governance

Any change to an official name, tagline, abbreviation, or production origin requires product approval, a brand migration plan, bilingual review, SEO verification, and an external-platform inventory. Runtime brand changes begin in `src/config/brand.ts`; hardcoded component-level substitutes are prohibited.
