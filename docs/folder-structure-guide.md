# Folder Structure Guide

```text
naqlia/
├── .ai/                    # Constitution, governing principles, stable AI context, and reusable prompts
├── .github/                # CI, dependency updates, and collaboration templates
├── .husky/                 # Local Git hooks
├── docs/                   # Engineering and delivery documentation
├── public/                 # Static, non-imported assets
├── scripts/                # Reviewed automation and maintenance scripts
├── src/
│   ├── app/[locale]/       # Locale-addressable App Router composition
│   ├── assets/             # Imported fonts, icons, and images
│   ├── components/
│   │   ├── layouts/        # Reusable structural layouts
│   │   ├── shared/         # Domain-neutral component compositions
│   │   └── ui/             # shadcn/ui and design-system primitives
│   ├── config/             # Future validated application configuration
│   ├── constants/          # Stable, domain-neutral constants
│   ├── features/           # Independently owned product capabilities
│   ├── hooks/              # Cross-feature, domain-neutral React hooks
│   ├── i18n/               # Locale routing and formatter configuration
│   ├── lib/supabase/       # Supabase clients and generated types
│   ├── messages/ar/        # Arabic messages (default, RTL)
│   ├── messages/en/        # English messages (secondary, LTR)
│   ├── providers/          # Application-level React providers
│   ├── services/           # Shared external-system adapters
│   ├── styles/             # Global Tailwind entry point and future tokens
│   ├── types/              # Shared TypeScript contracts
│   └── utils/              # Small, pure, domain-neutral utilities
├── supabase/
│   ├── functions/          # Future Supabase Edge Functions
│   └── migrations/         # Future reviewed PostgreSQL migrations
└── tests/
    ├── e2e/                # Critical browser journeys
    ├── fixtures/           # Deterministic test data
    ├── integration/        # Module and adapter integration tests
    ├── mocks/              # Shared test doubles
    └── unit/               # Pure unit and isolated component tests
```

## Placement rules

Place code in a feature when it expresses a product capability or feature-specific workflow. Place it in a shared folder only after multiple real consumers demonstrate that it is domain-neutral. Co-locate feature-specific tests and supporting types with their owner; use the root test folders for cross-cutting suites.

Empty directories are tracked with `.gitkeep` during foundation setup. Remove a `.gitkeep` as soon as the directory gains a real file.
