# Authentication Correction and Public Visual Upgrade v1

## 1. Scope and status

This change corrects Naqlk's ordinary customer authentication to email/password and upgrades the public presentation to the approved modern Saudi logistics direction. It extends the accepted Customer Account, Staff invitation, RBAC, Guest request, quotation, Operations, Tracking, Review, and Business Settings systems; it does not replace them.

## 2. Repository audit

The audit found:

- `/ar/login` and `/en/login` were unified, but ordinary authentication used `signInWithOtp` and could create a user from the login form. Signup, verification-state, forgot-password, and reset-password screens were absent.
- `/auth/callback` already exchanged PKCE codes and allowlisted invite, magic-link, and recovery token hashes. `resolve_identity_context()` already made PostgreSQL roles and permissions authoritative.
- Customer accounts were optional and Guest capabilities remained independent of authentication. Staff accounts were invite-only and protected by database roles, permissions, deactivation state, and final-active-Super-Admin invariants.
- Google and Apple providers were disabled in the active Supabase project. Provider buttons were already gated by environment flags.
- The public site used Tailwind/shadcn conventions and centralized `brand.ts`, `site.ts`, and Business Settings resolution. Its visual tokens and placeholder `NQ` mark did not match the approved identity.
- Cities were already the authoritative service-area model. Reviews already had verified, consent, publication, and featured controls, but no narrow anonymous homepage projection existed.

## 3. Authentication correction

### 3.1 Unified password login

`/{locale}/login` remains the only ordinary entry point. It now uses Supabase `signInWithPassword` and never asks the user to choose Customer or Staff. After authentication, `resolve_identity_context()` reads the database-authoritative role and permissions:

- Customer-only identity → Customer Account;
- active Staff identity → Staff Dashboard;
- Staff with Customer context → Dashboard by default, with existing Personal Account switching;
- inactive identity → authentication is cleared and access is denied.

The login error is deliberately generic. Google is rendered only when `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true` and the provider is actually configured. Apple is not displayed in this public experience.

### 3.2 Customer signup and verification

`/{locale}/signup` collects name, email, password confirmation, and explicit privacy acknowledgement. Supabase Auth remains the only password store. Application validation requires 12–72 characters with a letter, number, and symbol; the production Supabase minimum was also raised to 12.

Supabase email confirmation remains mandatory. Customer metadata is limited to a sanitized display name and locale. The forward-only migration updates `resolve_identity_context()` to import only those two non-authoritative values. Role, permission, and staff state still come exclusively from PostgreSQL RBAC tables.

`/{locale}/verify-email` provides localized pending/verified states. Callback errors return a stable generic outcome without reflecting tokens or provider details.

An inbox-backed Preview test exposed a redirect fallback: the browser supplied an immutable Vercel deployment origin that was not an exact Supabase allowlist entry, so Supabase correctly rejected it and used the production Site URL. The correction centralizes callback-origin selection in `src/lib/auth/redirect-origin.ts` and its server-only environment adapter. Production always resolves to `https://naqlk.vercel.app`; the approved PR Preview maps its immutable deployment hostname to the exact allowlisted branch Preview origin; local development accepts only configured localhost origins. Arbitrary `Origin`, `Host`, `next`, and user-supplied external URLs cannot select a callback origin.

The same resolver supplies customer verification, recovery, future Google OAuth, legacy Staff passwordless compatibility, Staff invitation, invitation resend, and callback response redirects. `NAQLK_AUTH_PREVIEW_ORIGIN` is server-only and branch-scoped in Vercel Preview. It is intentionally absent from Production. Preview hosts remain unrelated to SEO metadata, which continues to use the stable production origin.

### 3.3 Password recovery

`/{locale}/forgot-password` always returns the same success message for valid email-shaped input, whether or not an account exists. Recovery links return through the existing callback into `/{locale}/reset-password`. The new password is submitted directly to Supabase Auth with the active recovery session. Missing, invalid, expired, or reused recovery capabilities fail generically.

Auth pages receive `private, no-store`, `no-referrer`, and `noindex, nofollow, noarchive` headers. Redirect targets remain restricted to local paths.

### 3.4 Staff compatibility and Super Admin

Staff invitations retain their accepted invite/resend/cancel lifecycle and secure one-time acceptance boundary. A Staff identity can subsequently establish a password through the normal recovery flow and use the same unified login page. No invitation, role, or last-Super-Admin invariant changed.

The approved primary Super Admin is `abo.sabara@gmail.com`, but the address is not an authorization condition. Provisioning must use the existing operator/Admin workflow, database role assignment, and an inbox-owned password establishment/reset flow. Passwords, OTPs, links, sessions, and provider secrets must never enter source, migrations, documentation, CI output, or reports.

## 4. Public projection and migration

`20260815170000_auth_visual_public_projection.sql` adds `get_public_homepage_content(locale)`. The SECURITY DEFINER function has an explicit empty `search_path` and exposes only:

- localized labels for active, non-deleted Cities; and
- consented, verified, published Reviews with rating, comment, generic display identity, and city label.

It exposes no UUID, NQ reference, contact detail, address, Driver data, quality note, operational metadata, or capability. Anonymous users retain zero direct Review-table access. The rollback safely drops the projection; restoring the previous identity resolver requires the reviewed prior definition and is therefore an operator-controlled rollback step.

## 5. Brand and public components

The visual system uses reusable semantic tokens around navy, vivid blue, pale blue surfaces, neutral backgrounds, and existing semantic success/warning/error colors. The code-native geometric mark combines an `N` silhouette and motion lines. Runtime text remains HTML; the supplied brand board is not embedded or cropped.

The public component architecture includes:

- compact sticky Header with Services, process, active Service Areas, Tracking, locale, identity-aware Account/Login, and request CTA;
- accessible mobile menu and a route-aware mobile request CTA;
- an original, generated, unbranded Saudi moving photograph delivered as optimized AVIF/WebP, with all important content in HTML;
- catalog-backed Service cards;
- the real four-stage lifecycle: request, quotation, tracking, completion/review;
- factual Why Naqlk benefits;
- active City projection only;
- published Review section rendered only when eligible records exist;
- final request and centralized WhatsApp CTAs; and
- a Business-Settings-backed Footer that hides unavailable contact data.

## 6. Accessibility and performance

- Arabic remains the default RTL locale; English remains LTR.
- Semantic sections, ordered lifecycle steps, labelled controls, visible focus, skip link, reduced-motion handling, and responsive layouts are retained.
- The Hero uses `next/image`, explicit responsive sizing, priority only for the LCP asset, and a 62 KB AVIF source. No video, carousel, third-party tracker, or font-blocking dependency was added.
- Empty Reviews are omitted rather than filled with fabricated testimonials. No hardcoded city claims or statistics were introduced.
- The mobile CTA is removed from request, auth, quotation, tracking, review, account, and staff contexts where it could obstruct actions or the keyboard.

## 7. Business Settings and provider boundaries

The public resolver now consumes WhatsApp, phone, email, localized address, localized working hours, social links, Google Review URL, and quotation validity. Optional values are hidden when unset. Active service areas come from Cities. The approved WhatsApp fallback remains `966547349947`.

Google Auth remains hidden because the production provider is disabled. Enabling it later requires approved Google credentials in Supabase, callback verification against `https://naqlk.vercel.app/auth/callback`, and matching the Vercel provider flag. Apple remains disabled and is not shown merely for visual completeness.

## 8. Security review

- Public signup metadata cannot create Staff roles or permissions.
- Staff authorization remains database authoritative and is repeated by protected route/RPC boundaries.
- Recovery responses resist account enumeration.
- Callback and `next` validation prevents cross-origin redirect injection.
- Email callbacks are selected from the production origin, exact deployment/branch Vercel system origins, or explicitly configured local origins; request headers alone are never authoritative.
- No application logging of password, OTP, verification/recovery capability, OAuth secret, or session was added.
- Guest request and all existing hashed quotation/Tracking/Review capabilities remain unchanged.
- Business Settings and Review tables remain protected by their existing RLS/grant boundaries.

## 9. Future SEO handoff

The active canonical origin remains `https://naqlk.vercel.app`. The homepage now has semantic service and service-area structure ready for a future Local SEO sprint. This work intentionally creates no city landing pages, fake aggregate rating, or thin content. The future `naqlk.com` cutover remains configuration-led and separately tracked.
