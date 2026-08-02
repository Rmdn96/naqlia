# Project Blueprint

## Product intent

Naqlia will be a multi-tenant logistics SaaS platform serving organizations in Saudi Arabia. The foundation is designed to let independent product areas grow without coupling their UI, workflows, data access, or tests.

## Foundation scope

This initialization establishes:

- a Next.js 15 App Router and strict TypeScript toolchain;
- feature-based source boundaries;
- Arabic-first, locale-addressable application and message folders;
- shared UI, services, hooks, types, utilities, and Supabase boundaries;
- unit, integration, and end-to-end test boundaries;
- quality gates for formatting, linting, type checking, tests, and production builds;
- deployment conventions for GitHub and Vercel;
- documentation and AI collaboration conventions.

## Explicit non-goals

The foundation does not include:

- a homepage or other product screen;
- authentication or authorization;
- business logic or domain entities;
- API routes, server actions, queues, or webhooks;
- PostgreSQL tables, migrations, policies, functions, or seed data;
- analytics, billing, or third-party logistics integrations.

These capabilities require separate, reviewed product or architecture decisions.

## Quality attributes

| Attribute            | Foundation decision                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| Scalability          | Features own their implementation and expose deliberate public contracts.                             |
| Maintainability      | Strict types, automated checks, documented dependency rules, and small modules.                       |
| Internationalization | Locale-prefixed routing, Arabic default, English secondary, and no hard-coded product copy.           |
| SEO                  | App Router metadata and localized canonical/hreflang rules are reserved for each future public route. |
| Security             | Secrets remain server-side; Supabase access must use least privilege and Row Level Security.          |
| AI readiness         | Stable repository rules, dedicated context/prompt areas, and validation requirements.                 |
| Delivery             | Immutable Git revisions move through CI, Vercel previews, and production promotion.                   |

## Localization contract

- Supported locales begin with `ar` and `en`.
- Arabic is the default locale and renders with `dir="rtl"`.
- English renders with `dir="ltr"`.
- Product copy belongs in locale message catalogs, not components or service modules.
- UI uses CSS logical properties so direction changes do not require duplicated layouts.
- Dates, numbers, currencies, units, and plural rules use locale-aware formatters.

## Definition of done for future changes

A change is complete only when it respects architecture boundaries, supports both directions where relevant, documents new contracts, includes proportionate tests, introduces no committed secrets, and passes `npm run validate` plus `npm run build`.
