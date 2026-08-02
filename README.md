# Naqlia

Naqlia is the foundation of an enterprise logistics SaaS platform for logistics companies in Saudi Arabia. Arabic (`ar`, RTL) is the default product language and English (`en`, LTR) is the secondary language.

## Foundation status

This repository intentionally contains infrastructure and architectural boundaries only. It has no homepage, business feature, authentication flow, API route, or database schema. Until a product route is approved and implemented, the deployed root URL is expected to return the framework's not-found response.

## Stack

- Next.js 15 App Router, React, and strict TypeScript
- Tailwind CSS and shadcn/ui conventions
- `next-intl` foundations for Arabic RTL and English LTR
- Supabase and PostgreSQL integration boundaries
- Vitest, ESLint, Prettier, Husky, and lint-staged
- GitHub Actions and Vercel

## Local setup

Requirements: Node.js 22 or newer and npm 10 or newer.

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Before opening a pull request, run:

```bash
npm run validate
npm run build
```

## Documentation

- [Master Project Blueprint](docs/00-Project-Blueprint.md)
- [Architecture Guide](docs/architecture-guide.md)
- [Coding Standards](docs/coding-standards.md)
- [Git Workflow](docs/git-workflow.md)
- [Deployment Guide](docs/deployment-guide.md)
- [AI Development Guide](docs/ai-development-guide.md)
- [Folder Structure Guide](docs/folder-structure-guide.md)

## Security

Never commit credentials. Values prefixed with `NEXT_PUBLIC_` are exposed to the browser. The Supabase service-role key is server-only and must be stored in encrypted environment settings.
