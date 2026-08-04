# Naqlk SEO Principles

| Document field   | Value                                                                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Status           | Mandatory SEO policy                                                                                                                   |
| Version          | 1.0.0                                                                                                                                  |
| Parent authority | [Naqlk Constitution](./constitution.md)                                                                                                |
| Owner            | Product, Content, and Engineering leadership                                                                                           |
| Applies to       | Approved public content, localized routes, metadata, crawl/index behavior, structured data, performance, accessibility, and monitoring |

## 1. SEO Standard

SEO helps intended audiences discover accurate, useful, accessible public Naqlk content. It MUST NOT expose authenticated operations, customer data, previews, internal environments, support tools, or thin pages created only to manipulate search visibility.

SEO begins with audience, search intent, information architecture, content, language, rendering, and performance—not a final metadata checklist.

## 2. Scope

### 2.1 Indexable by design

Only explicitly approved public content MAY be indexable, such as future marketing, product education, public help, or lawful public resources with named content owners.

### 2.2 Non-indexable by design

The following MUST NOT be indexed:

- authenticated application and organization content;
- customer, driver, shipment, document, tracking, billing, and audit data;
- administration and support tools;
- login, account, invitation, recovery, and session pages unless a specific safe public indexing decision exists;
- preview, staging, development, temporary, experiment, and test environments;
- internal search results, filtered variants, exports, signed URLs, and provider callbacks;
- duplicate, empty, incomplete, expired, or unowned content.

Robots directives are not authorization. Sensitive content MUST remain inaccessible even when crawlers ignore directives.

## 3. Audience and Search Intent

Every public page requires:

- target audience and locale;
- primary question or task;
- search intent and evidence;
- unique value and source ownership;
- primary action or next step;
- update cadence and expiry criteria; and
- success and guardrail metrics.

Pages MUST be written for users first. Keyword repetition, doorway pages, hidden text, misleading metadata, scaled low-value pages, and unsupported claims are prohibited.

## 4. Arabic-First SEO

- Arabic public content is primary for the Saudi market.
- Arabic keyword and terminology research MUST use natural Saudi and logistics language, not direct English translation alone.
- English provides intentional equivalent content, not automatic machine duplication.
- Arabic and English pages MUST communicate equivalent product truth while allowing culturally and linguistically appropriate phrasing.
- Mixed-direction titles, descriptions, breadcrumbs, codes, and brand names require visual and semantic review.
- Locale-specific formatting and structured content MUST remain machine-readable and user-appropriate.

## 5. URL and Locale Architecture

- Public URLs are stable, lowercase, readable, and locale-addressable under the approved routing strategy.
- Arabic and English equivalents have explicit bidirectional alternate relationships.
- The default/fallback locale strategy MUST be documented before public launch.
- Canonical URLs MUST be absolute, self-consistent, environment-correct, and free of tracking parameters.
- Redirects are intentional, minimal, permanent only when the move is permanent, and free of loops or chains.
- Query parameters for tracking, sorting, filtering, pagination, or experiments require explicit canonical and crawl behavior.
- A deleted or retired page returns the correct outcome and does not redirect unrelated intent to a generic destination.

## 6. Crawl and Index Control

- Indexability is an explicit page-level decision with secure environment defaults.
- Production public content MAY be indexed only after content, canonical, locale, security, performance, and accessibility review.
- Preview and non-production environments MUST use layered controls appropriate to their sensitivity.
- Sitemaps contain only canonical, indexable, successful public URLs and use accurate update data.
- Robots configuration MUST be tested for each environment.
- Soft 404s, redirect loops, duplicate parameter variants, infinite calendars/filters, and crawler traps are prohibited.
- Search and filter interfaces MUST NOT create unlimited crawlable URL combinations.

## 7. Rendering and Discoverability

- Essential public content and links MUST be available in the initial server-rendered response.
- Client JavaScript MUST NOT be required to discover the page's primary meaning, heading, canonical navigation, or localized alternatives.
- Public navigation uses crawlable links with meaningful anchor text.
- Loading placeholders MUST NOT replace indexable content in the rendered result.
- Cache and revalidation behavior MUST preserve accurate content, metadata, locale, and status codes.
- Provider, consent, analytics, or personalization failure MUST NOT remove the core public content.

## 8. Metadata

Every indexable page MUST define:

- unique localized title;
- useful localized description;
- one clear primary heading;
- canonical URL;
- Arabic/English alternate references where equivalents exist;
- index/follow decision;
- social sharing title, description, URL, image, and locale where required;
- appropriate content type and publication/update facts; and
- safe fallback behavior when content is missing.

Metadata MUST reflect visible page content. Titles and descriptions MUST NOT make unverified product, customer, legal, performance, security, or market claims.

## 9. Structured Data

- Structured data is added only when the visible content and page type qualify.
- Values MUST match user-visible truth and use canonical identifiers and URLs.
- Required and recommended fields have named ownership.
- Localized values and entity relationships are consistent across languages.
- Invalid, misleading, invisible, fabricated, or review-only data is prohibited.
- Structured data is validated before release and monitored after template changes.
- Eligibility for a rich result is not guaranteed and MUST NOT be presented as an outcome promise.

## 10. Content Quality

Public content MUST be:

- accurate, original, useful, and appropriate to its audience;
- owned by a named subject-matter and content reviewer;
- clear about product status, limitations, geography, and availability;
- supported by approved evidence for factual or comparative claims;
- dated or versioned when freshness matters;
- accessible and readable in Arabic and English; and
- reviewed or retired on an explicit cadence.

AI-assisted content requires human domain, factual, language, brand, legal, accessibility, and SEO review. Invented testimonials, customers, statistics, capabilities, citations, or regulatory claims are prohibited.

## 11. Internal Linking and Information Architecture

- Public hierarchy follows user topics and tasks.
- Each indexable page is reachable through deliberate internal navigation unless a documented campaign exception applies.
- Anchor text describes the destination.
- Breadcrumbs reflect the visible hierarchy and use correct structured data when eligible.
- Orphan pages, broken links, circular journeys, and excessive depth require remediation.
- Related content links are useful and curated, not automatically repeated for keyword volume.
- Language switching links to the equivalent page, not always the locale home page.

## 12. Media

- Images and media serve a content purpose and have descriptive filenames where public.
- Meaningful images have localized alternative text; decorative images have empty alternatives.
- Dimensions, responsive sources, format, compression, and loading priority meet performance budgets.
- Hero and social images MUST not expose customer, personal, operational, or unlicensed material.
- Video and audio require accessible alternatives and metadata appropriate to the experience.
- Image text SHOULD be avoided when semantic HTML can communicate the content.

## 13. Performance and Core Web Vitals

SEO performance is part of product performance.

- Public templates receive mobile-first budgets for server response, rendered content, layout stability, interaction responsiveness, JavaScript, CSS, fonts, media, and third-party resources.
- Measurement uses both controlled lab tests and real-user field data after launch.
- Arabic and English pages are measured independently.
- Consent, analytics, chat, video, maps, and marketing scripts require value, budget, privacy, loading, and failure review.
- Performance regressions beyond the approved budget block release or require a constitutional exception.
- Optimization MUST preserve content accuracy, accessibility, security, and maintainability.

## 14. Accessibility and SEO

Indexable content MUST use semantic headings, landmarks, links, lists, tables, language metadata, alternative text, labels, keyboard behavior, visible focus, contrast, and logical reading order. Accessibility improves machine understanding but is mandatory for users in its own right.

Hidden content techniques, inaccessible interaction, and visual-only meaning are prohibited.

## 15. Security and Privacy

- SEO configuration MUST NOT expose a private route, identifier, data object, signed URL, preview, or internal hostname.
- Canonical, sitemap, social, and structured-data generation use approved public origins.
- User-controlled metadata and structured data are validated and encoded.
- Public forms and content systems require abuse, injection, moderation, and rate controls.
- Analytics and search tooling follow consent, minimization, retention, and provider review.
- Logs and URL parameters MUST NOT contain protected data.
- Search-engine caching and archives are considered before publishing sensitive or time-limited information.

## 16. Monitoring

SEO monitoring SHOULD cover:

- indexed versus intended URLs;
- crawl errors, server errors, redirects, and soft 404s;
- robots, sitemap, canonical, and alternate-locale consistency;
- structured-data validity;
- Core Web Vitals by locale and template;
- broken links and orphan pages;
- organic discovery and conversion by locale and intent;
- unexpected private or non-production URL discovery; and
- content freshness and ownership expiry.

Alerts and reports require an owner and action threshold. Ranking alone is not success; qualified user outcomes and trustworthy content are primary.

## 17. Changes, Migration, and Retirement

- URL changes require inventory, redirect map, canonical/alternate update, sitemap update, internal-link update, monitoring, and rollback.
- Domain or locale architecture changes require an approved migration plan and extended observation.
- Retired content is merged, redirected, archived, or removed according to user intent and record obligations.
- Redirects and compatibility paths receive expiry review; they MUST NOT accumulate indefinitely.
- Major template and rendering changes require pre/post crawl, metadata, structured-data, accessibility, and performance comparison.

## 18. SEO Definition of Ready

Public-page work is ready only when:

- audience, locale, intent, unique value, owner, and success measure are defined;
- Arabic and English content plans and terminology are approved;
- URL, canonical, alternate-locale, crawl, index, sitemap, and redirect behavior are designed;
- rendering, metadata, structured-data eligibility, internal links, and media are specified;
- accessibility, performance, analytics, security, and privacy requirements are explicit; and
- content, product, engineering, localization, security, and legal reviewers are identified as applicable.

## 19. SEO Definition of Done

Public-page work is done only when:

- visible content and metadata are accurate and complete in Arabic and English;
- canonical, alternate locale, status, redirects, robots, and sitemap behavior are verified in the deployed environment;
- server-rendered content and crawlable links expose the intended meaning;
- eligible structured data validates and matches visible content;
- accessibility and performance budgets pass on mobile-first references;
- analytics and monitoring collect only approved data and identify the deployed template; and
- no private, preview, duplicate, thin, broken, or unowned URL is unintentionally indexable.

## 20. SEO Review Questions

1. Who is this public page for, and what useful question does it answer?
2. Is the Arabic page natural, authoritative, and primary for the target market?
3. Are URL, canonical, locale alternatives, crawl, and index behavior unambiguous?
4. Can a crawler and assistive technology understand the essential content without client execution?
5. Do metadata and structured data match visible verified truth?
6. Does the page meet mobile performance, accessibility, security, and privacy standards?
7. Who maintains, measures, migrates, and retires it?
