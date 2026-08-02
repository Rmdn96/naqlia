# Architecture Guide

## Architectural style

Naqlia uses a feature-based modular monolith. Product behavior is grouped by business capability rather than spread across global controller, model, and view layers. This keeps today's deployment simple while preserving boundaries that can later become packages or services if scale requires it.

## Dependency direction

Future code should follow this dependency flow:

```text
App routes and layouts
        |
        v
Feature public contracts
        |
        +--> feature-internal UI, hooks, services, types, tests
        |
        v
Shared components, platform services, utilities, configuration
        |
        v
External systems such as Supabase
```

Shared modules must never import a product feature. A feature must not import another feature's internal files. When cross-feature collaboration is necessary, expose a narrow public contract or move genuinely generic behavior into a shared platform boundary.

## Feature contract

A future feature may contain its own `components`, `hooks`, `services`, `types`, `utils`, and co-located tests. Its root entry point is the only supported import surface for other areas. Do not create empty subfolders until the feature needs them.

## App Router boundary

`src/app` is a composition layer. Route files should assemble feature exports, metadata, providers, and layouts; they should not contain domain rules or direct database queries. Locale-addressable routes live beneath `src/app/[locale]`.

Use React Server Components by default. Add `"use client"` only at the smallest interactive boundary. Keep server-only credentials and privileged data access out of client component dependency graphs.

## UI boundaries

- `components/ui` contains reviewed shadcn/ui primitives and design-system components.
- `components/shared` contains domain-neutral compositions reused across features.
- `components/layouts` contains reusable structural layouts.
- Feature-specific components remain inside their owning feature.

All UI must support RTL and LTR, keyboard navigation, semantic markup, responsive layouts, and localized text expansion.

## Service and data boundaries

`services` contains platform-level integrations. Feature-specific orchestration belongs to the feature. Supabase clients and generated database types will live under `src/lib/supabase` when a separate database design is approved.

Database changes must be forward migrations reviewed with Row Level Security policies and rollback considerations. Browser code may use only public Supabase credentials; privileged keys are server-only.

## Configuration

Environment values enter through a future validated configuration module. Modules should consume typed configuration rather than reading `process.env` throughout the codebase. `.env.example` is the public contract and contains placeholders only.

## Testing strategy

- Unit tests cover pure rules and isolated components.
- Integration tests cover module boundaries and data adapters.
- End-to-end tests cover a small set of critical user journeys.
- Tests mirror production ownership and avoid asserting framework internals.

## Architecture decisions

Material changes to tenancy, authorization, data ownership, integration patterns, caching, or deployment topology should be recorded as architecture decision records before implementation.
