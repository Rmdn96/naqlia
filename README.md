# Naqlk

Naqlk (`نقلك`) is an Arabic-first logistics platform for Saudi Arabia: **نقلك... ننقل كل ما يهمك**. Arabic (`ar`, RTL) is the default product language and English (`en`, LTR) is the secondary language. During MVP development and pre-launch, the active production and canonical origin is [naqlk.vercel.app](https://naqlk.vercel.app). The planned commercial domain is [naqlk.com](https://naqlk.com) and is not yet registered.

## Foundation status

This repository contains the implemented MVP platform through unified Guest/Customer/Staff identity, customer quotation response, Operations/Tracking, Reviews & Quality, an optional Customer Account, and the permission-aware Staff Portal. Guest journeys remain available without authentication. Accounting, payments, GPS, Driver App, and advanced BI remain out of scope.

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

- [Naqlk Constitution](.ai/constitution.md)
- [Product Principles](.ai/product-principles.md)
- [Engineering Principles](.ai/engineering-principles.md)
- [Coding Principles](.ai/coding-principles.md)
- [Database Principles](.ai/database-principles.md)
- [Security Principles](.ai/security-principles.md)
- [UI Principles](.ai/ui-principles.md)
- [SEO Principles](.ai/seo-principles.md)
- [Master Project Blueprint](docs/00-Project-Blueprint.md)
- Brand
  - [Brand Guidelines](docs/branding/01-Brand-Guidelines.md)
  - [Voice and Tone](docs/branding/02-Voice-And-Tone.md)
  - [Visual Identity](docs/branding/03-Visual-Identity.md)
  - [Asset Register](docs/branding/04-Asset-Register.md)
- Product Documentation Suite v1
  - [Business Requirements Specification](docs/product/01-Business-Requirements-Specification.md)
  - [Functional Requirements](docs/product/02-Functional-Requirements.md)
  - [Non-Functional Requirements](docs/product/03-Non-Functional-Requirements.md)
  - [User Stories](docs/product/04-User-Stories.md)
  - [Acceptance Criteria](docs/product/05-Acceptance-Criteria.md)
  - [Business Rules](docs/product/06-Business-Rules.md)
  - [Order Lifecycle](docs/product/07-Order-Lifecycle.md)
  - [Customer Journey](docs/product/08-Customer-Journey.md)
  - [Roles and Permissions](docs/product/09-Roles-And-Permissions.md)
  - [Pricing Strategy](docs/product/10-Pricing-Strategy.md)
  - [Service Catalog](docs/product/11-Service-Catalog.md)
  - [MVP Scope](docs/product/12-MVP-Scope.md)
  - [Future Roadmap](docs/product/13-Future-Roadmap.md)
- Domain Model Suite v1
  - [Complete Business Domain Model](docs/domain/01-Domain-Model.md)
  - [Entity Catalog](docs/domain/02-Entity-Catalog.md)
  - [Relationship Matrix](docs/domain/03-Relationship-Matrix.md)
  - [Field Catalog](docs/domain/04-Field-Catalog.md)
  - [Domain Events](docs/domain/05-Domain-Events.md)
- Production MVP Scope
  - [MVP Entity Selection](docs/mvp/01-MVP-Entity-Selection.md)
  - [MVP Database Scope](docs/mvp/02-MVP-Database-Scope.md)
  - [Four-Week Implementation Roadmap](docs/mvp/03-MVP-Implementation-Roadmap.md)
- Implementation
  - [Supabase Foundation](docs/implementation/01-Supabase-Foundation.md)
  - [Identity Foundation](docs/implementation/02-Identity-Foundation.md)
  - [Core Business Database](docs/implementation/03-Core-Business-Database.md)
  - [Public Request Flow](docs/implementation/04-Public-Request-Flow.md)
  - [Sales Workspace](docs/implementation/05-Sales-Workspace.md)
  - [Production Lead Reference Reconciliation](docs/implementation/06-Production-Lead-Reference-Reconciliation.md)
  - [Customer Quotation Response Flow](docs/implementation/07-Customer-Quotation-Response-Flow.md)
  - [Operations Management v1](docs/implementation/08-Operations-Management.md)
  - [Reviews & Quality Management v1](docs/implementation/09-Reviews-Quality-Management.md)
  - [Unified Authentication, Customer Account, and Staff Dashboard v1](docs/implementation/10-Unified-Account-And-Staff-Dashboard.md)
  - [Authentication Correction and Public Visual Upgrade v1](docs/implementation/11-Authentication-And-Public-Visual-Upgrade.md)
  - [Naqlk Brand Migration](docs/implementation/05-Naqlk-Brand-Migration.md)
- Backlog
  - [Business Settings Management](docs/backlog/01-Business-Settings-Management.md)
  - [Leaked-Password Protection](docs/backlog/02-Leaked-Password-Protection.md)
  - [Naqlk Custom Domain Production Cutover](docs/backlog/03-Naqlk-Custom-Domain-Production-Cutover.md)
- [Database Architecture](docs/01-Database-Architecture.md)
- [Conceptual ERD](docs/02-ERD.md)
- [Database Naming Conventions](docs/03-Naming-Conventions.md)
- [Row-Level Security Strategy](docs/04-RLS-Strategy.md)
- [Audit Strategy](docs/05-Audit-Strategy.md)
- [Architecture Guide](docs/architecture-guide.md)
- [Coding Standards](docs/coding-standards.md)
- [Git Workflow](docs/git-workflow.md)
- [Deployment Guide](docs/deployment-guide.md)
- [AI Development Guide](docs/ai-development-guide.md)
- [Folder Structure Guide](docs/folder-structure-guide.md)

## Security

Never commit credentials. Values prefixed with `NEXT_PUBLIC_` are exposed to the browser. A Supabase secret/service-role key is server-only, bypasses RLS, and must be limited to approved operator scripts and encrypted environment settings.
