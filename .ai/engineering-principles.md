# Naqlia Engineering Principles

| Document field   | Value                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Status           | Mandatory engineering policy                                                                       |
| Version          | 1.0.0                                                                                              |
| Parent authority | [Naqlia Constitution](./constitution.md)                                                           |
| Owner            | Engineering leadership                                                                             |
| Applies to       | Architecture, implementation, testing, delivery, operations, dependencies, and technical decisions |

## 1. Engineering Standard

Naqlia engineering delivers secure, reliable, maintainable product value through explicit ownership, stable contracts, automated evidence, and reversible change.

The preferred system is:

- simple enough for the current team to understand;
- modular enough for boundaries to remain enforceable;
- observable enough to operate confidently;
- safe enough to protect every organization by default;
- scalable through measured evolution; and
- documented enough that another qualified engineer can continue the work.

## 2. Core Engineering Principles

1. **Correctness before cleverness.** Readability and explicit invariants beat condensed or surprising code.
2. **Secure defaults.** New resources and capabilities begin inaccessible.
3. **One owner per responsibility.** Shared ownership cannot mean no ownership.
4. **Contracts before coupling.** Consumers depend on approved public behavior, not internals.
5. **Small reversible changes.** Reduce blast radius and improve review quality.
6. **Operational readiness by design.** Logs, metrics, alerts, recovery, and support are part of implementation.
7. **Evidence before scale architecture.** Measure bottlenecks before distributing the system.
8. **Automate repeatable guarantees.** CI, tests, types, linters, policy checks, and migrations enforce standards.
9. **No hidden failure.** Partial success, retries, degradation, and conflicts are explicit.
10. **Total cost matters.** Consider creation, ownership, support, upgrade, migration, and exit costs.

## 3. Architectural Style

Naqlia uses a feature-based modular monolith deployed through the Next.js application until measured constraints justify a different topology.

### 3.1 Ownership model

- A feature owns its domain UI, application orchestration, rules, contracts, types, and tests.
- Platform capabilities own domain-neutral concerns such as validated configuration, localization foundations, Supabase clients, observability foundations, and approved provider adapters.
- Application routes compose approved feature contracts.
- Shared UI owns primitives and genuinely domain-neutral compositions.
- Database domains own their entities and write invariants.

### 3.2 Dependency direction

Allowed direction is:

`app composition -> feature public contracts -> feature internals -> shared platform foundations -> external adapters`

Rules:

- A shared layer MUST NOT import a feature.
- A feature MUST NOT import another feature's internal path.
- Cross-feature orchestration MUST have a named owner and use public commands, queries, or events.
- External SDK types MUST be translated at the adapter boundary.
- Circular imports, cyclic service calls, and mutual data ownership are architectural defects.
- Barrel exports MUST expose deliberate public contracts, not every internal symbol.

### 3.3 Server and client boundaries

- React Server Components are the default.
- Client Components exist only at the smallest boundary requiring browser state, effects, or interaction.
- Server-only code, credentials, privileged data, and trusted configuration MUST remain outside client dependency graphs.
- Domain rules MUST NOT depend on a React component or route module.
- Network and serialization boundaries MUST be explicit even when framework tooling hides them.

## 4. API-First Engineering

Every consumed boundary requires an owned contract before implementation.

### 4.1 Contract contents

A contract MUST define:

- name, version, owner, consumers, and lifecycle;
- domain meaning and authorization scope;
- request or input shape and runtime validation;
- response or output shape;
- error taxonomy and safe details;
- idempotency, concurrency, ordering, timeout, retry, pagination, and rate semantics;
- compatibility and deprecation policy;
- audit, logging, metrics, and tracing requirements; and
- examples and contract tests.

### 4.2 Contract boundaries

The same standard applies to:

- public and partner HTTP APIs;
- server actions and route handlers;
- feature entry points;
- events and outbox messages;
- provider integrations and webhooks;
- background job inputs;
- generated database types and data-access results; and
- configuration schemas.

Framework-generated interfaces MUST NOT become public contracts accidentally.

### 4.3 Compatibility

- Additive changes are preferred.
- Breaking changes require consumer inventory, versioning or coordinated migration, deprecation window, telemetry, and removal criteria.
- Stored and published events are immutable contracts and require schema-version handling.
- Clients MUST tolerate explicitly documented compatible additions.
- Deprecation warnings require an owner and expiration date.

## 5. Configuration Engineering

- Environment configuration enters through one typed, runtime-validated server boundary.
- Tenant configuration is persisted, authorized, versioned, and audited separately from environment configuration.
- Feature flags are release controls, not permanent substitutes for product configuration.
- User preferences MUST NOT alter security or data integrity.
- Defaults MUST be secure, documented, and tested.
- Unknown or invalid configuration MUST fail predictably.
- Configuration combinations MUST be bounded and covered by a representative test matrix.
- Secrets MUST be referenced, rotated, and redacted; they MUST NOT appear in configuration responses or logs.

## 6. Data and Transaction Boundaries

- Every state-changing operation has one authoritative owner.
- Strong consistency is used for invariants within one transaction boundary.
- Cross-domain side effects use explicit orchestration, outbox, and idempotent consumers when atomicity cannot span boundaries.
- A current-state projection and immutable history MUST remain consistent through an owned transition.
- Optimistic concurrency or another deliberate conflict strategy is required for contested mutable aggregates.
- External delivery MUST assume duplicates, delay, reordering, and failure.
- Time, currency, quantity, locale, and units MUST be explicit.

Detailed data rules are in [Database Principles](./database-principles.md).

## 7. Reliability

### 7.1 Failure design

Every dependency call MUST define:

- timeout;
- cancellation behavior;
- transient and permanent failure classification;
- retry eligibility and idempotency;
- bounded attempt count, backoff, and jitter;
- fallback or degraded behavior;
- terminal state and operator visibility; and
- correlation and metrics.

Retries MUST NOT multiply uncontrolled load or duplicate business effects. Circuit breakers, queues, or bulkheads require measured need and an operational owner.

### 7.2 State integrity

- Critical transitions MUST be atomic within their ownership boundary.
- False success is prohibited.
- Partial success MUST identify completed, failed, pending, and retryable items.
- Invariants MUST be enforced at every appropriate layer, with the database as final authority for relational integrity.
- Reconciliation is required when external state can diverge.

### 7.3 Availability and recovery

- Critical journeys receive defined SLOs after usage and business criticality are understood.
- Recovery Point Objective and Recovery Time Objective MUST be approved before production data depends on them.
- Backups are not accepted until restoration is exercised.
- Degraded modes MUST protect correctness and communicate limitations.
- Disaster recovery includes database data, object storage, secrets/configuration, audit evidence, and external dependencies.

## 8. Scalability

### 8.1 Workload model

Before a scalability decision, document:

- organizations and active users;
- data volume and growth;
- read/write patterns and peak concurrency;
- payload and object sizes;
- latency and freshness requirements;
- hot tenants or keys;
- retention and archive behavior; and
- cost and failure assumptions.

### 8.2 Baseline patterns

- Stateless application workloads SHOULD scale horizontally.
- Queries MUST be tenant-scoped, indexed, bounded, and paginated where result size can grow.
- Background work MUST define concurrency, backpressure, deduplication, and fairness between organizations.
- High-volume facts SHOULD be append-only and partitioned only when evidence justifies it.
- Cache correctness, scope, invalidation, staleness, and privacy MUST be designed before caching.
- One organization's load MUST NOT create unbounded harm for others.

### 8.3 Distribution threshold

Extraction to a service, queue, specialized store, or separate database requires:

- measured bottleneck or independent reliability/ownership need;
- stable domain and data ownership;
- explicit contract and failure model;
- migration, dual-operation, and rollback plan;
- observability and on-call ownership; and
- demonstrated benefit exceeding distributed-system cost.

## 9. Maintainability

- Modules SHOULD have one reason to change.
- Functions SHOULD be small enough that their preconditions, effect, and failure are evident.
- Domain concepts MUST use canonical names.
- Public interfaces MUST expose the minimum useful surface.
- External input is `unknown` until validated.
- Generated files MUST be reproducible and visibly marked.
- Temporary code requires an issue, owner, reason, and expiry.
- Dead code and unused configuration MUST be removed with their dependents.
- Refactoring SHOULD preserve behavior with characterization or regression tests.
- Abstractions MUST follow repeated stable meaning, not superficial structural similarity.

## 10. Testing Engineering

### 10.1 Risk-based strategy

Test depth depends on consequence, complexity, novelty, and reversibility.

- Pure business rules require focused unit tests.
- Feature behavior requires component and application tests.
- Authorization and tenant rules require integration tests using multiple actors and organizations.
- APIs, events, and providers require contract tests.
- Critical journeys require a small stable end-to-end suite.
- High-volume and latency-sensitive paths require performance tests.
- Data migrations and recovery procedures require forward, compatibility, rollback/forward-fix, and restore tests.

### 10.2 Test quality

- Tests MUST be deterministic, isolated, readable, and owned.
- Names MUST state behavior and expected outcome.
- Fixtures MUST be minimal, synthetic, and free of production data.
- Time, UUIDs, randomness, locale, provider responses, and network behavior SHOULD be controllable.
- Tests MUST NOT depend on execution order.
- A passing mocked test MUST NOT be represented as proof of provider integration.
- Flakiness budgets are zero for required checks.

### 10.3 Required evidence

Every change MUST run the repository validation and production build unless the approved task cannot support them. Skipped checks require disclosure and follow-up. High-risk changes require evidence beyond the default pipeline.

## 11. Observability

### 11.1 Signals

Each production capability defines:

- structured logs for diagnosis;
- metrics for service and business health;
- traces for meaningful distributed boundaries;
- audit events for accountable actions;
- deployment and configuration markers; and
- dashboards and alerts tied to an owner.

### 11.2 Correlation

Requests, jobs, integration messages, domain events, and outbound effects SHOULD share safe request, correlation, and causation identifiers. User and organization identifiers MUST be minimized, access-controlled, and never substituted for authorization.

### 11.3 Signal quality

- Metric names, units, labels, and aggregation are stable contracts.
- High-cardinality values MUST NOT be uncontrolled metric labels.
- Logs and traces MUST be structured and redacted before emission.
- Alerts MUST describe condition, severity, user impact, owner, and runbook.
- Observability failures for security, billing, data loss, or audit integrity MAY require fail-closed behavior.

## 12. Error Handling

Engineering MUST use a stable error taxonomy:

- validation;
- authentication;
- authorization;
- not found without cross-tenant disclosure;
- conflict or stale version;
- rate or quota;
- dependency unavailable;
- timeout or cancellation;
- transient internal failure; and
- unexpected internal failure.

Errors cross boundaries as safe structured contracts. Internal causes are preserved through correlation and controlled diagnostics. A thrown provider SDK error MUST NOT leak directly to users or become the domain contract.

Expected failures SHOULD not create noisy exception alerts. Unexpected and invariant failures MUST be observable. Errors MUST be handled once at the owning boundary, not repeatedly logged and wrapped without added meaning.

## 13. Security Engineering

- Threat modeling is required before material trust-boundary change.
- Authorization is enforced at server and data boundaries.
- RLS, grants, validation, rate controls, and audit provide defense in depth.
- Secrets remain outside client bundles, repositories, tests, prompts, logs, and error messages.
- Security-sensitive behavior requires negative tests.
- Dependency and build provenance are part of the threat model.
- Vulnerability remediation follows severity, exploitability, exposure, and compensating controls.

Detailed requirements are in [Security Principles](./security-principles.md).

## 14. Performance Engineering

Performance requirements MUST identify user journey, percentile, device/network class, data size, locale, cache state, and measurement location.

- Avoid unbounded rendering, fetching, serialization, queries, and client state.
- Server Components and streaming SHOULD reduce unnecessary client JavaScript where appropriate.
- Images, fonts, scripts, and third-party resources require explicit budgets.
- Database work MUST be inspected with realistic plans and tenant distribution.
- Optimization MUST follow profiling and preserve correctness, accessibility, and maintainability.
- Performance regressions beyond budget block release unless an approved exception exists.

## 15. Dependency Engineering

The proposing engineer owns evaluation, integration, upgrades, incidents, and removal.

Dependencies require:

- explicit purpose and alternatives;
- active maintenance and compatible support policy;
- acceptable license and provenance;
- vulnerability and transitive-dependency review;
- bundle/runtime/operations impact;
- privacy and data-flow review;
- locked deterministic installation;
- upgrade strategy and tests; and
- exit path.

SDK convenience MUST NOT override owned contracts. Prefer platform capabilities and small utilities over overlapping frameworks.

## 16. Technical Debt

Debt is recorded where engineers plan work, linked to affected code or decision, and reviewed before expanding that area.

Engineering debt categories include:

- architecture boundary;
- correctness or test gap;
- reliability or operations;
- performance or capacity;
- dependency or platform lifecycle;
- documentation or developer experience; and
- security or compliance remediation, which follows separate severity rules.

Each item needs impact, owner, containment, due condition/date, and remediation acceptance criteria. “TODO” without an owned record is not debt management.

## 17. Git and Review

- Branches are short-lived and start from current `main`.
- Commits are coherent Conventional Commits.
- Pull requests remain small enough for a reviewer to understand all changed behavior.
- Generated and mechanical changes are separated from semantic changes when that improves review.
- Reviews examine design, code, tests, operations, data, security, Arabic/English, accessibility, performance, SEO, and migration as applicable.
- A review approval applies only to the reviewed revision; material changes require renewed review.
- Required CI and domain approvals must pass before merge.

## 18. Release Engineering

### 18.1 Environments

- Local uses synthetic or approved non-production data.
- Preview is isolated and uses non-production credentials.
- Production uses protected configuration and immutable commits.
- Environment drift MUST be minimized, documented, and monitored.

### 18.2 Deployment

A release plan defines order, feature controls, migrations, compatibility, smoke tests, success/error signals, observation, and rollback. Database migrations MUST preserve application compatibility across the deployment window.

### 18.3 Verification

The release owner MUST confirm:

- CI passed for the deployed commit;
- the target environment reports Ready;
- expected version and configuration are active;
- critical health and security signals are normal;
- applicable journeys and locale directions pass smoke checks; and
- rollback or containment remains available.

## 19. Operational Ownership

Every production capability MUST have:

- technical owner;
- product or business owner;
- service objective or explicit criticality;
- dashboard and actionable alerts;
- runbook for common failure and recovery;
- dependency and escalation contacts;
- capacity and cost visibility;
- backup/recovery need; and
- deprecation process.

An unowned production component is a release blocker.

## 20. Engineering Definition of Ready

Engineering work is ready when:

- the owning domain and public contract are clear;
- architecture and data decisions are approved;
- inputs, outputs, errors, permissions, states, and compatibility are specified;
- testing and observability match risk;
- dependencies and configuration are approved;
- rollout, migration, and rollback are feasible; and
- the work can be delivered in a reviewable, reversible increment.

## 21. Engineering Definition of Done

Engineering work is done when:

- code and data respect ownership and dependency direction;
- contracts, types, runtime validation, errors, and failure behavior are complete;
- tests prove success, denial, conflict, and recovery paths appropriate to risk;
- documentation, runbooks, generated artifacts, and configuration examples are current;
- security, accessibility, localization, performance, and operational reviews pass;
- validation, CI, build, deployment, and smoke evidence are accurate; and
- no unmanaged temporary path, warning, debt, or dependency remains.

## 22. Engineering Review Questions

1. Who owns this state and behavior?
2. What contract may consumers rely on?
3. What fails, retries, conflicts, or degrades?
4. How are organization boundaries and permissions enforced and tested?
5. Is the simplest adequate architecture being used?
6. What workload evidence supports scale choices?
7. How will operators detect and recover from failure?
8. Can the change be deployed, migrated, and reversed safely?
