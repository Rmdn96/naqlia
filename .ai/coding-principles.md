# Naqlia Coding Principles

| Document field   | Value                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| Status           | Mandatory coding policy                                                                               |
| Version          | 1.0.0                                                                                                 |
| Parent authority | [Naqlia Constitution](./constitution.md)                                                              |
| Owner            | Engineering leadership                                                                                |
| Applies to       | TypeScript, React, Next.js, modules, tests, configuration, errors, logs, comments, and generated code |

## 1. Coding Standard

Naqlia code MUST make ownership, intent, valid state, side effects, failure, and security boundaries understandable to a qualified engineer.

Code is accepted for clarity and correctness over brevity or novelty. A framework feature, generated snippet, lint pass, or successful build does not establish architectural or product correctness.

## 2. Module Ownership

- Product code belongs to one feature or an explicit platform boundary.
- A module MUST have one primary responsibility and one accountable owner.
- Route modules compose features and framework behavior; they MUST NOT own domain rules or direct persistence logic.
- Feature internals remain private. Cross-feature consumers use the feature's deliberate root contract.
- Shared code MUST be domain-neutral, stable, and reused by meaning rather than convenience.
- Provider SDK usage stays inside an adapter.
- Circular imports and bidirectional module dependencies are prohibited.
- Side effects MUST be visible from the module contract and localized to owned boundaries.

## 3. TypeScript

- Strict mode MUST remain enabled.
- `any` is prohibited in authored code. External or unknown values begin as `unknown` and are narrowed through runtime validation.
- Unchecked casts MUST NOT be used to silence a type-design problem.
- Non-null assertions require a proved invariant that cannot be expressed more safely and SHOULD include a nearby explanation.
- Domain identifiers SHOULD use distinct types or owned value objects where accidental interchange would be harmful.
- Discriminated unions SHOULD express finite states and outcomes.
- Impossible states SHOULD be unrepresentable where reasonable.
- Public functions MUST expose meaningful inputs, outputs, errors, and asynchronous behavior.
- Optional values MUST represent genuine optionality, not incomplete modeling.
- Generated database or provider types MUST be treated as boundary types and mapped to owned domain types.
- Compiler, lint, and deprecation warnings MUST be resolved, not normalized.

## 4. Runtime Validation

Static typing does not validate runtime input.

Validation is mandatory at:

- user and form input;
- route, server action, and API boundaries;
- environment and tenant configuration;
- database and generated-client boundaries where trust is not guaranteed;
- webhooks and external provider responses;
- persisted events and background jobs; and
- deserialized cache or queue payloads.

Validation MUST produce a typed internal value or a safe structured error. Validation MUST define normalization, unknown-field behavior, size limits, locale assumptions, and cross-field rules. It MUST NOT mutate state before the complete input is accepted.

## 5. Functions and Control Flow

- A function SHOULD do one coherent job at one abstraction level.
- Names MUST describe business intent or effect.
- Commands and queries SHOULD be distinguishable.
- Hidden mutation, reliance on global state, and action-at-a-distance are prohibited.
- Early returns SHOULD make invalid and failure paths clear.
- Deep nesting and long parameter lists indicate a missing concept or boundary and SHOULD be refactored.
- Boolean mode arguments SHOULD be replaced by explicit operations or options when combinations become ambiguous.
- Time, randomness, identifier generation, and external effects SHOULD be injectable or otherwise controllable in tests.
- Async operations MUST be awaited, returned, or deliberately detached through an owned background mechanism; floating promises are prohibited.

## 6. Naming

### 6.1 Canonical language

Code MUST use the canonical English domain term defined by product and database documentation. User-facing Arabic and English labels remain localization content and MUST NOT become program identifiers.

### 6.2 Files and symbols

- folders and non-component files: `kebab-case`;
- React component and type symbols: `PascalCase`;
- functions, variables, and object properties: `camelCase`;
- hooks: `use` followed by the owned behavior;
- constants: descriptive `camelCase` unless an external immutable vocabulary requires another documented convention;
- tests: `*.test.ts` or `*.test.tsx`;
- stable machine event and permission keys: documented dotted taxonomies;
- environment variables: explicit uppercase `SNAKE_CASE` through the configuration contract.

### 6.3 Name quality

Names MUST reveal purpose and unit. Avoid `data`, `info`, `item`, `object`, `helper`, `util`, `manager`, `service`, `handle`, `process`, `value`, or `temp` without a precise qualifier.

Booleans use predicates such as `is`, `has`, `can`, or `should`. Time and measurement values include meaning and unit. A function named `get`, `is`, `has`, `can`, or `resolve` MUST NOT perform an undisclosed mutation.

## 7. Imports and Public Surfaces

- Use configured path aliases for stable cross-boundary imports.
- Relative imports MAY be used within a small local module boundary.
- Deep imports into another feature or package are prohibited.
- Public exports MUST be intentional and minimal.
- Wildcard exports SHOULD be avoided when they obscure ownership or enlarge the contract.
- Importing a server-only module into a client dependency graph is prohibited.
- Type-only imports SHOULD be used when they communicate and preserve boundary behavior.

## 8. React and Next.js

### 8.1 Components

- Server Components are the default.
- Client Components use the smallest possible boundary and require a browser-specific reason.
- Components SHOULD receive explicit data and callbacks rather than reaching into unrelated global state.
- Domain rules belong outside presentation components.
- Composition is preferred over large collections of style and behavior flags.
- Components MUST handle all designed states, not only the success path.
- Stable semantic HTML is preferred over generic containers and ARIA repair.

### 8.2 State

- State SHOULD be placed at the narrowest owner.
- Server state, URL state, form state, local UI state, and durable domain state MUST remain conceptually distinct.
- Derived values SHOULD be computed rather than duplicated in state.
- Effects MUST synchronize with external systems; they MUST NOT be a default mechanism for derivation or event handling.
- Race, cancellation, stale response, and unmount behavior MUST be deliberate for asynchronous client work.

### 8.3 Routing and rendering

- Locale-addressable routes live under the approved locale boundary.
- Route files define composition, metadata, and boundary states.
- Authorization MUST NOT rely on route visibility or client redirects.
- Public rendering strategy MUST meet SEO and performance requirements.
- Cache and revalidation behavior MUST state tenant scope, freshness, invalidation, and failure semantics.

## 9. Styling and Bidirectionality

- Tailwind and the approved design-token system are the styling foundation.
- Logical properties and direction-aware primitives are preferred over physical left/right assumptions.
- Arbitrary values require a documented reason and SHOULD become a token when reused or semantically meaningful.
- Styling MUST support Arabic text expansion, mixed-direction content, zoom, reflow, high contrast, and reduced motion.
- Direction-invariant assets such as brand marks, media controls, charts, numbers, and certain maps MUST NOT be mirrored automatically.
- Visual state MUST NOT be the only source of meaning.

Detailed rules are in [UI Principles](./ui-principles.md).

## 10. Internationalization

- User-visible text MUST NOT be hard-coded in application components or domain logic.
- Message keys are stable machine contracts, not English sentences.
- Every released key MUST have reviewed Arabic and English values.
- Formatting uses locale-aware services for dates, time, numbers, currency, lists, and pluralization.
- Business logic, authorization, tests, and persistence MUST NOT depend on localized display text.
- Concatenating translated fragments into sentences is prohibited.
- Variables inserted into bidirectional content require isolation and context-aware formatting.
- Error and validation content MUST be localized and actionable.

## 11. Configuration and Secrets

- Code consumes typed validated configuration, not unrestricted environment reads.
- Server configuration MUST NOT cross into the client unless each field is explicitly public.
- Secret names and references MAY be logged; secret values MUST NOT.
- Missing required configuration fails at startup or the earliest safe boundary.
- Test defaults MUST NOT resemble usable production credentials.
- Feature flags, tenant settings, user preferences, and environment configuration MUST use separate abstractions.

## 12. Data Access

- Components and route modules MUST NOT issue ad hoc database queries.
- Data access belongs to the owning feature repository/service or approved platform adapter.
- Queries and mutations MUST make organization context and authorization explicit.
- Selection MUST be minimal; avoid fetching unrestricted records or fields for convenience.
- Unbounded queries and client-side filtering of protected server data are prohibited.
- Transaction, concurrency, idempotency, and not-found behavior MUST be part of the operation contract.
- Database errors MUST be translated into safe domain outcomes at the owner boundary.

## 13. Error Handling

- Expected errors use explicit typed outcomes or owned error types.
- Unexpected errors propagate to one owning boundary for safe response and observability.
- Errors MUST NOT be swallowed, reduced to an empty value, or converted into success.
- Public messages MUST be safe and localized; internal diagnostics MUST be structured and correlated.
- Raw provider, database, stack, file-path, or environment details MUST NOT reach users.
- Catching an error is justified only when the layer can recover, translate, add meaningful context, or perform required cleanup.
- Retry behavior belongs to the operation owner and MUST be bounded and idempotent.
- User recovery SHOULD preserve valid entered data and identify the next permitted action.

## 14. Logging

### 14.1 Structured events

Logs MUST use stable event names and structured safe fields. Each event SHOULD identify timestamp, severity, environment, module, operation, outcome, correlation, and duration where relevant.

### 14.2 Prohibited content

Never log:

- passwords, tokens, secrets, cookies, or credentials;
- complete request/response bodies by default;
- document contents or unrestricted object metadata;
- unnecessary names, phone numbers, addresses, precise location, or commercial data;
- database connection strings or environment dumps; or
- sensitive values in error messages.

### 14.3 Severity

- debug: temporary diagnostic detail, normally disabled in production;
- info: meaningful expected lifecycle activity;
- warn: degraded or recoverable condition requiring attention if repeated;
- error: operation failed or invariant was threatened;
- fatal: process or critical capability cannot continue safely.

Expected user validation MUST NOT be logged as system error. The same failure SHOULD be logged once at the boundary that owns its outcome.

## 15. Comments and Documentation

- Comments explain why, invariant, security constraint, workaround, or non-obvious consequence.
- Comments MUST NOT restate syntax or preserve obsolete history available in Git.
- A workaround comment MUST link to an owned issue and removal condition.
- Public contracts and complex domain operations require concise documentation.
- TODO, FIXME, and temporary suppression require an owner and tracked item.
- Linter and type suppressions require a narrow scope and explanation; broad disablement is prohibited.

## 16. Tests

- Tests live with the behavior or in the approved test boundary.
- Test names state precondition, action, and outcome.
- Arrange, act, and assert phases SHOULD be understandable without comments.
- Test data is synthetic, minimal, and explicit about organization and actor.
- Authorization tests include denied and cross-organization cases.
- UI tests include Arabic/RTL and English/LTR where direction or content matters.
- Accessibility assertions supplement, not replace, manual review.
- Snapshot tests are used only when the snapshot is small, stable, and meaningful.
- A test MUST fail for the intended reason before it is trusted as regression evidence.
- Implementation details, arbitrary delays, and brittle selectors SHOULD be avoided.

## 17. Performance

- Avoid unnecessary client JavaScript, re-renders, hydration, large dependency imports, and provider scripts.
- Data requests MUST be scoped, parallelized only when safe, and free of preventable waterfalls.
- Lists and tables with growing data require server-side pagination or another bounded design.
- Memoization and caching require measured benefit and correct invalidation.
- Expensive work MUST expose timeout, cancellation, and progress behavior where applicable.
- Performance changes MUST be measured on representative Arabic and English content.

## 18. Security

- Treat every client value as untrusted.
- Enforce authorization at trusted server and database boundaries.
- Avoid dynamic code execution, unsafe HTML, open redirects, unrestricted file handling, and user-controlled query construction.
- Output encoding and sanitization MUST match the destination context.
- File uploads require type, size, content, storage, access, malware, retention, and filename controls.
- Security headers, cookie attributes, CSRF behavior, and cache privacy require deliberate ownership.
- A UI permission check MAY improve experience but MUST NOT be the security control.

## 19. Dependencies and Generated Code

- Do not add a dependency when the existing stack reasonably provides the capability.
- Imports SHOULD target narrow package entry points when supported.
- Generated code MUST have an authoritative source, reproducible command, ownership, review strategy, and no manual edits.
- AI-generated code MUST be understood, adapted to repository standards, tested, and reviewed.
- Copied snippets require license and security review and MUST NOT carry unknown provenance.
- Dependency upgrades MUST review breaking changes and regenerate affected artifacts deliberately.

## 20. Code Review Checklist

Reviewers MUST ask:

1. Is this code in the correct owner and dependency direction?
2. Are invalid, unauthorized, conflict, and failure states explicit?
3. Is all external input validated at runtime?
4. Could secrets or protected data reach clients, errors, logs, or providers?
5. Are Arabic/English, RTL/LTR, accessibility, mobile, and performance handled?
6. Are tests deterministic and aligned to risk?
7. Is the public surface minimal and compatible?
8. Is the implementation simpler than the problem requires, or more complex?
9. Are comments, documentation, configuration, and generated artifacts current?
10. Is there any bypass, suppression, temporary path, or debt without an owner and expiry?
