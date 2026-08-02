# Deployment Guide

## Environments

- Local: developer machine with `.env.local`.
- Preview: an isolated Vercel deployment for each pull request or branch.
- Production: the protected `main` branch and production-only environment values.

Do not reuse production credentials in local or preview environments.

## GitHub and Vercel setup

1. Create the GitHub repository and push the `main` branch.
2. Import that repository into Vercel.
3. Confirm the framework preset is Next.js and the root directory is the repository root.
4. Use `npm ci` for deterministic dependency installation and `npm run build` for builds.
5. Add environment values separately for Development, Preview, and Production.
6. Enable preview deployments and require the GitHub quality workflow before merge.
7. Protect the production domain and review access, audit, and retention settings.

## Environment contract

Start from `.env.example`. Public variables may be embedded in browser bundles. `SUPABASE_SERVICE_ROLE_KEY` is privileged, server-only, and must be stored in Vercel's encrypted environment settings. Rotate any value that is accidentally exposed.

## Release verification

For every production release:

1. Confirm CI passed for the deployed commit.
2. Confirm Vercel reports the deployment as Ready.
3. Inspect build logs for warnings and verify configured environment names.
4. Run route, locale, direction, security-header, and critical-journey smoke checks once those routes exist.
5. Record the commit and deployment URL in the release record.

The foundation intentionally defines no page. A framework not-found response at `/` is therefore expected and does not mean that the deployment failed.

## Rollback

Promote the last known-good Vercel deployment or revert the faulty Git commit, then verify production again. Never assume application rollback also rolls back database state.
