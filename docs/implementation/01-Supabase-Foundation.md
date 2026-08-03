# Naqlia Supabase Foundation

| Document field | Value                                         |
| -------------- | --------------------------------------------- |
| Sprint         | 1A — Supabase Foundation                      |
| Status         | Implementation foundation; no business schema |
| Version        | 1.0.0                                         |
| Effective date | 2026-08-03                                    |
| Branch         | `feature/sprint-1a-supabase-foundation`       |
| Owners         | Engineering, Platform, and Security           |

## 1. Purpose

This document defines the production connection, authentication, storage, and environment foundation for using Supabase from the Naqlia Next.js 15 App Router application. Sprint 1A creates no business table, migration, RLS policy, page, dashboard, upload flow, or business API.

## 2. Implemented Scope

- official `@supabase/supabase-js` and `@supabase/ssr` packages only;
- browser and per-request server clients using the project URL and publishable key;
- Next.js 15 middleware session refresh using cookies and `auth.getClaims()`;
- PKCE OAuth callback infrastructure without login UI;
- safe same-origin post-auth redirect handling;
- explicit guest, email, Google, and Apple architecture;
- storage bucket configuration and an idempotent check/apply initialization script;
- fail-fast public environment validation;
- an empty strict Supabase `Database` type that prevents business-table assumptions; and
- focused tests for redirect safety and storage access classification.

## 3. Connection Strategy

### 3.1 Public project connection

Both browser and authenticated server clients use:

- `NEXT_PUBLIC_SUPABASE_URL`; and
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

The publishable key identifies the public application and is designed to be visible in a browser. It does not replace authorization. Future database access requires approved RLS policies before any business table is exposed.

### 3.2 Browser client

`src/lib/supabase/client.ts` creates a cookie-aware browser client through `createBrowserClient`. It is created only when a Client Component or browser-side authentication flow requests it. No global server client is shared.

### 3.3 Server client

`src/lib/supabase/server.ts` creates a new `createServerClient` for each Server Component, Server Action, or Route Handler invocation. It reads the current Next.js cookie store and writes refreshed cookies where the execution context permits.

Server authorization MUST use verified claims from `auth.getClaims()` or a fresh Auth user lookup when the latest user record is required. The user object embedded in `getSession()` is never sufficient for authorization.

### 3.4 Middleware refresh

Next.js 15 uses `src/middleware.ts`; the newer `proxy.ts` filename belongs to later Next.js versions. Middleware delegates to `src/lib/supabase/middleware.ts`, which:

1. reads all request cookies;
2. creates a request-scoped Supabase server client;
3. calls `auth.getClaims()` immediately to verify/refresh the session;
4. copies refreshed cookies to the request and response; and
5. applies Supabase-provided private/no-cache response headers.

Middleware refreshes sessions only. It does not authorize a business route, redirect a guest, or implement a login page.

## 4. Authentication Architecture

| Method        | Sprint 1A state               | Boundary                                                                                                                                                                                           |
| ------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guest         | Ready                         | Guest means unauthenticated application use. It does not create an anonymous Auth user. Future guest requests use the publishable client and narrowly approved `anon` RLS/API boundaries.          |
| Email         | Client-ready                  | Supabase Auth owns credentials, verification, recovery, sessions, and rate limits. UI/actions are deferred to Sprint 1B.                                                                           |
| Google OAuth  | Prepared                      | `beginOAuthSignIn("google")` and the PKCE callback are available. Enable only after Google credentials, consent screen, Supabase provider settings, site URL, and redirect allowlist are approved. |
| Apple Sign-In | Prepared, disabled by default | Uses the same OAuth/PKCE callback. Enable only after Apple Services ID, domain/return URL, signing key, Supabase provider configuration, and the six-month secret-rotation owner are ready.        |

### 4.1 OAuth callback

`src/app/auth/callback/route.ts` is infrastructure, not a business API. It exchanges the one-time PKCE code for a cookie session and redirects only to a validated same-origin path. Provider errors are not reflected to the user or logs; the callback emits only the stable `auth_result=error` outcome for a future UI.

The callback URL for each environment is:

`{NEXT_PUBLIC_APP_URL}/auth/callback`

It MUST be present in the Supabase redirect allowlist. Google and Apple provider callback configuration also follows the provider-specific Supabase dashboard instructions.

### 4.2 Account boundaries

- An Auth user is not automatically a Naqlia Customer or staff member.
- Customer/Profile linking and internal role assignment require the future approved business schema and authorization flow.
- Staff and customer permissions remain distinct even when the same person controls identities.
- Provider tokens are not requested, persisted, or logged by this foundation.
- Login UI, email actions, password recovery, onboarding, profile creation, and account linking are Sprint 1B concerns.

## 5. Storage Architecture

| Bucket          | Access      | Intended content                           | Sprint 1A behavior                                                                                                     |
| --------------- | ----------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `attachments`   | Private     | Future customer and operational evidence   | Private downloads require authenticated RLS or short-lived signed URLs. No upload/download logic or policy exists yet. |
| `public-assets` | Public read | Approved public website and content assets | Anyone with an object URL may read an object. Upload, update, move, and delete remain protected operations.            |

Storage objects never replace future attachment metadata records. Business ownership, association, classification, scanning, retention, and audit will be implemented only with the approved Sprint 1B schema and RLS design.

### 5.1 Initialization support

The initialization tool performs only bucket existence/access reconciliation:

```bash
npm run supabase:storage:check
npm run supabase:storage:init
```

- `check` is read-only and exits unsuccessfully when a bucket is missing or has the wrong public/private setting.
- `init` creates missing buckets and corrects only their public/private setting.
- both require `NEXT_PUBLIC_SUPABASE_URL` and the server-only `SUPABASE_SECRET_KEY` in `.env.local` or the executing environment;
- the script never prints the secret; and
- the script creates no folder convention, file limit, MIME allowlist, upload logic, database row, or RLS policy.

Do not run `init` in production until the Platform owner confirms the target project and Security approves the bucket access decision. File-size and media-type limits MUST be approved before Sprint 1B enables uploads.

## 6. Environment Variables

| Variable                               | Exposure           | Required            | Purpose                                                                                                                                                          |
| -------------------------------------- | ------------------ | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`                  | Public             | Yes                 | Canonical origin used to construct OAuth callback URLs; environment-specific.                                                                                    |
| `NEXT_PUBLIC_DEFAULT_LOCALE`           | Public             | Yes                 | Default locale; remains `ar`.                                                                                                                                    |
| `NEXT_PUBLIC_SUPPORTED_LOCALES`        | Public             | Yes                 | Comma-separated supported locales; remains `ar,en`.                                                                                                              |
| `NEXT_PUBLIC_SUPABASE_URL`             | Public             | Yes                 | Supabase project URL from the Connect dialog.                                                                                                                    |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public             | Yes                 | Current publishable API key; replaces the legacy anon-key variable.                                                                                              |
| `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED`      | Public             | Yes                 | `true` only after Google provider and redirect configuration is complete; otherwise `false`.                                                                     |
| `NEXT_PUBLIC_AUTH_APPLE_ENABLED`       | Public             | Yes                 | `true` only after Apple provider and rotation ownership is complete; otherwise `false`.                                                                          |
| `SUPABASE_SECRET_KEY`                  | Secret/server-only | Initialization only | Elevated key used solely by the storage initialization script. It bypasses RLS and must never enter browser code, logs, source control, or public documentation. |

Environment rules:

1. Real values belong in `.env.local`, encrypted CI settings, Vercel environment variables, or another approved secret manager.
2. `.env.example` contains names and non-secret examples only.
3. No application client imports or reads `SUPABASE_SECRET_KEY`.
4. Preview and production use different approved `NEXT_PUBLIC_APP_URL` values and redirect allowlists.
5. A missing/invalid required public connection value fails when a Supabase client is created; it does not silently fall back to another project.

## 7. Implementation Decisions

| Decision                                                | Rationale                                                                                                                    |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Use `@supabase/ssr` rather than deprecated Auth Helpers | It is the official cookie-based SSR integration for Next.js.                                                                 |
| Use publishable/secret API keys                         | Supabase recommends the new keys; legacy anon/service-role keys approach deprecation.                                        |
| No secret-key application client                        | Ordinary server work must remain user-scoped and RLS-enforced. Elevated initialization is isolated to an explicit script.    |
| Use `getAll`/`setAll` cookie methods                    | These are the supported methods and handle multi-cookie sessions correctly.                                                  |
| Apply refresh cache headers                             | Prevents a response containing Auth cookies from being cached and served to another user.                                    |
| Use `getClaims()` in middleware                         | It validates the JWT and refreshes cookies without trusting unverified session user data.                                    |
| Keep guest unauthenticated                              | Guest request does not need a persisted anonymous Auth identity.                                                             |
| Empty strict `Database` type                            | Sprint 1A cannot accidentally query undeclared business tables; generated schema types replace it after approved migrations. |
| No generic repository/service wrappers                  | The two official clients are sufficient; feature services are introduced only with real use cases.                           |
| No storage policy or upload helper                      | Storage authorization requires the Sprint 1B business model and RLS review.                                                  |

## 8. Folder Responsibilities

| Path                     | Responsibility                                                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/supabase/`      | Official browser, server, and middleware client adapters only.                                                                   |
| `src/lib/auth/`          | Provider initiation and redirect-safety primitives; no UI or customer-account business rules.                                    |
| `src/config/`            | Environment access and approved Auth/Storage constants.                                                                          |
| `src/types/`             | Cross-cutting Auth and schema-client types.                                                                                      |
| `src/app/auth/callback/` | Technical OAuth callback only.                                                                                                   |
| `scripts/supabase/`      | Explicit operator-run foundation checks/initialization.                                                                          |
| `src/features/`          | Future user-facing feature slices. No feature is created in Sprint 1A because no business capability or login UI is implemented. |

## 9. Operational Setup Checklist

Before enabling Auth or Storage in an environment:

1. obtain the project URL, publishable key, and a purpose-specific secret key from the intended Supabase project;
2. set public values and flags in local/Vercel environment configuration without committing values;
3. configure the Supabase Site URL and environment callback allowlist;
4. configure and verify Email settings;
5. configure Google credentials/branding and then enable the Google flag;
6. configure Apple credentials, return URL, relay-email sources, rotation owner/reminder, and then enable the Apple flag;
7. run the storage check against the confirmed project and review any drift;
8. run storage initialization only with Platform/Security approval;
9. verify `attachments` is private and `public-assets` is public-read;
10. run validation/build and an environment-specific Auth cookie/callback smoke test; and
11. keep business tables, RLS, upload behavior, profile linking, and login UI disabled until Sprint 1B approval.

## 10. Security Boundaries

- Publishable keys are not secrets and provide no data protection by themselves.
- Secret keys bypass RLS; compromise requires immediate rotation and incident handling.
- Auth cookies are refreshed only through supported SSR adapters and are never manually decoded for authorization.
- Auth/session responses are private and non-cacheable.
- OAuth redirect targets are restricted to local paths to prevent open redirects.
- Middleware does not grant access; future authorization requires verified identity plus approved record/field scope.
- Public Storage read means globally readable object URLs. Only reviewed non-sensitive assets belong in `public-assets`.
- `attachments` remains inaccessible to public clients until explicit policies exist.

## 11. Deferred to Sprint 1B

- business tables and generated database types;
- migrations, seed data, constraints, indexes, and RLS policies;
- Profile/Customer linking and fixed staff-role records;
- login, registration, recovery, onboarding, and account UI;
- guest request, Lead, Quotation, Order, or attachment business logic;
- upload/download/signing/scanning/retention workflows;
- authenticated route authorization and role redirects; and
- business APIs, dashboards, pages, or operational features.

## 12. References

- [Supabase: Creating a client for server-side rendering](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase: Understanding API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase: Google login](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase: Apple login](https://supabase.com/docs/guides/auth/social-login/auth-apple)
- [Supabase: Storage buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Next.js 15: Middleware](https://nextjs.org/docs/15/pages/api-reference/file-conventions/middleware)
