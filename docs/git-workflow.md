# Git Workflow

## Branches

`main` is protected and deployable. Create short-lived branches from an up-to-date `main` using names such as `feat/short-description`, `fix/short-description`, `chore/short-description`, or `docs/short-description`.

## Commits

Use Conventional Commit messages:

```text
<type>(optional-scope): concise imperative summary
```

Common types are `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `build`, and `ci`. Keep commits reviewable, avoid mixing unrelated concerns, and never commit secrets or generated local state.

## Pull requests

1. Rebase or update the branch from `main`.
2. Run `npm run validate` and `npm run build`.
3. Open a pull request with scope, validation evidence, risks, and rollback notes.
4. Review architecture, security, i18n, accessibility, data, and deployment effects as applicable.
5. Require passing CI and the configured approvals.
6. Squash merge unless preserving multiple commits has a clear operational benefit.

## Releases and rollback

Production deployments must reference immutable Git commits. Prefer reverting the offending commit or promoting the last known-good Vercel deployment over rewriting shared history. Database changes, once introduced, require forward-fix and rollback planning independent of application rollback.
