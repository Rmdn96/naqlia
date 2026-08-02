# Naqlia Constitution

| Document field | Value                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| Status         | Ratified and mandatory                                                                                     |
| Version        | 1.0.0                                                                                                      |
| Effective date | 2026-08-02                                                                                                 |
| Owners         | Product and Engineering leadership                                                                         |
| Review cadence | At least quarterly and before any material governance change                                               |
| Applies to     | Every product decision, design, implementation, review, release, operation, incident, and AI-assisted task |

## 1. Purpose

This Constitution is the permanent governing standard for Naqlia. It defines how the product and engineering organization makes decisions, protects users and customers, changes the system, and demonstrates that work is ready and complete.

Every future task MUST comply with this Constitution and the applicable companion principles. A roadmap item, issue, prompt, design, deadline, customer request, or generated implementation does not override these rules by implication.

The terms **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** indicate requirement strength:

- **MUST** and **MUST NOT** are mandatory.
- **SHOULD** and **SHOULD NOT** require a documented reason when not followed.
- **MAY** identifies an allowed choice whose risks still require review.

This document governs behavior and delivery; it does not authorize a feature, API, page, database object, or infrastructure change.

## 2. Authority and Document Hierarchy

Naqlia uses the following authority order:

1. Applicable law, binding regulation, contractual obligation, and emergency security control.
2. This Constitution.
3. The [Project Blueprint](../docs/00-Project-Blueprint.md) for product identity, vision, scope, and approved technical baseline.
4. The domain principles in this directory.
5. Approved architecture decisions, product requirements, security decisions, design specifications, data contracts, and release plans.
6. Supporting guides, runbooks, implementation documentation, and tests.
7. Source code, generated artifacts, defaults, and current behavior.

Higher authority prevails. A more specific lower-level document MAY add detail but MUST NOT weaken a higher-level rule. Existing behavior is never proof that behavior is correct.

When two rules at the same authority conflict, the team MUST:

1. stop the affected decision when the conflict changes user outcomes, security, data integrity, accessibility, or production risk;
2. apply the safer and more reversible interpretation temporarily;
3. identify the accountable owners;
4. record the conflict and proposed resolution; and
5. amend the appropriate source before implementation continues.

Silence is not approval. An undefined policy requires an explicit decision, not a local convention hidden in code.

## 3. Companion Principles

This Constitution is extended by:

- [Product Principles](./product-principles.md)
- [Engineering Principles](./engineering-principles.md)
- [Coding Principles](./coding-principles.md)
- [Database Principles](./database-principles.md)
- [Security Principles](./security-principles.md)
- [UI Principles](./ui-principles.md)
- [SEO Principles](./seo-principles.md)

The companion documents are mandatory within their domains. Cross-domain work MUST satisfy every applicable document; teams MUST NOT select only the easiest principle set.

## 4. Project Philosophy

Naqlia exists to become a trusted Arabic-first operating platform for logistics organizations in Saudi Arabia. Trust, operational clarity, and durable customer value matter more than feature count or delivery theater.

The project follows these commitments:

1. **Solve validated problems.** Work begins from evidence about a user, workflow, risk, or business outcome.
2. **Protect trust.** Security, privacy, correctness, accessibility, reliability, and honest communication are product behavior.
3. **Design for Arabic reality.** Arabic is the default experience, not a translated layer added after English implementation.
4. **Prefer clarity.** Explicit ownership, states, contracts, decisions, and failure behavior beat clever abstraction.
5. **Keep change reversible.** Small, observable increments reduce risk and improve learning.
6. **Earn complexity.** The simplest architecture that meets known requirements is preferred until evidence justifies more.
7. **Build one product.** Customers receive configuration within governed boundaries, not unmaintainable customer-specific forks.
8. **Measure outcomes.** Delivery is successful only when the intended user and operational outcome is observable.

## 5. Product Philosophy

Product work MUST maximize useful customer outcomes while minimizing operational burden and irreversible complexity.

- A feature MUST have a named user, problem, outcome, owner, success measure, and explicit non-goals.
- Product discovery MUST include Saudi logistics context and Arabic-speaking users or qualified representatives.
- Product scope MUST be incremental. Broad platform capability is decomposed into independently valuable and testable releases.
- A customer request MUST be evaluated as evidence, not automatically treated as a reusable product requirement.
- Product behavior MUST be explainable. Material automated decisions require clear inputs, constraints, outcomes, and human control.
- The product MUST provide safe paths for loading, empty, validation, error, permission, conflict, degraded, recovery, and success states.
- A release MUST NOT claim regulatory, accessibility, security, performance, or AI capability that has not been verified.

The detailed policy is defined in [Product Principles](./product-principles.md).

## 6. Engineering Philosophy

Engineering exists to deliver product value safely, repeatedly, and with controlled total cost of ownership.

- Correctness and safety precede optimization for delivery speed.
- Maintainability is a present requirement, not a future cleanup activity.
- Operational behavior is part of system design.
- Quality MUST be built into contracts, types, tests, reviews, and deployment gates.
- Automation SHOULD remove repeatable error while leaving high-impact judgment accountable to named humans.
- The system SHOULD be boring in its infrastructure and distinctive in the customer value it creates.
- Engineering decisions MUST consider build cost, operating cost, migration cost, failure cost, and exit cost.

The detailed policy is defined in [Engineering Principles](./engineering-principles.md).

## 7. Decision-Making Model

### 7.1 Decision rights

Every material decision MUST have one accountable owner. Consultation does not remove accountability.

| Decision area                        | Accountable owner                 | Required consultation                                                   |
| ------------------------------------ | --------------------------------- | ----------------------------------------------------------------------- |
| Product outcome and scope            | Product owner                     | Engineering, design, operations, security, localization, affected users |
| Architecture and technical standards | Engineering owner                 | Product, security, data, operations, affected module owners             |
| Data ownership and lifecycle         | Data or engineering owner         | Security, privacy, product, domain owner, operations                    |
| Security risk acceptance             | Security owner and business owner | Engineering, legal or compliance when applicable                        |
| User experience and accessibility    | Design or product owner           | Engineering, localization, accessibility reviewers, affected users      |
| Production release                   | Release owner                     | Product, engineering, security, data, operations as risk requires       |

The same person MAY hold several roles in a small team, but the decision record MUST state which role they exercised.

### 7.2 Decision criteria

Material choices MUST be evaluated against:

1. user and business outcome;
2. constitutional and blueprint alignment;
3. security, privacy, accessibility, and data risk;
4. Arabic and English experience quality;
5. simplicity and consistency;
6. reversibility and migration path;
7. reliability and operational burden;
8. scalability based on evidence;
9. implementation and ownership cost; and
10. measurable evidence and unresolved uncertainty.

Schedule pressure MAY change scope. It MUST NOT silently lower mandatory quality or safety standards.

### 7.3 Reversible and irreversible decisions

- Reversible, low-risk decisions SHOULD be made quickly by the closest accountable owner and validated through delivery.
- Costly-to-reverse decisions involving tenancy, authorization, data ownership, public contracts, infrastructure topology, identity, retention, billing, or destructive migration MUST receive written review before implementation.
- Architecture Decision Records are required when a decision materially changes a boundary, standard, technology, irreversible data shape, or operational model.
- Decisions MUST record context, options, rationale, consequences, owner, date, evidence, and review trigger.

### 7.4 Experiments

An experiment MUST state its hypothesis, audience, success and guardrail metrics, duration, data handling, rollback, and decision rule. Experiments MUST NOT bypass security, privacy, accessibility, tenant isolation, or truthful communication.

## 8. Architecture Rules

Naqlia begins as a feature-based modular monolith. This is a deliberate architecture, not an absence of architecture.

### 8.1 Mandatory boundaries

- Product behavior MUST be owned by a business feature or an explicit platform capability.
- `src/app` is composition and routing; it MUST NOT own domain rules or direct data access.
- Features MAY depend on their own internals, approved shared foundations, and another feature's explicit public contract.
- Features MUST NOT import another feature's internal files or mutate another domain's data directly.
- Shared modules MUST remain domain-neutral and MUST NOT depend on product features.
- External providers MUST be isolated behind owned adapters and MUST NOT leak vendor contracts throughout the product.
- Cross-domain work MUST use explicit contracts, commands, events, or orchestration with a named owner.
- Cyclic dependencies MUST be redesigned or documented as a temporary, expiring exception.

### 8.2 Complexity and scale

- Microservices, new repositories, queues, caches, search engines, data stores, and distributed workflows require measured need and an approved decision record.
- Horizontal scale, tenant-safe access patterns, pagination, idempotency, and bounded work MUST be considered before volume makes them emergencies.
- Scale claims MUST include a workload model and evidence. “Future scale” alone is not justification.
- A module MAY be extracted only when its ownership, contract, data, reliability, and deployment boundaries are already explicit.

### 8.3 Configuration over customization

Naqlia MUST prefer configuration over customer-specific code.

Configuration MUST be:

- typed and validated;
- bounded to supported choices;
- versioned when behavior can change;
- permission-controlled;
- auditable when operationally material;
- documented in Arabic and English where user-visible;
- testable in supported combinations; and
- supplied with a safe default and rollback path.

Configuration MUST NOT become a hidden programming language, arbitrary code execution, an unbounded matrix of incompatible modes, or a mechanism for weakening security. When a request cannot fit a coherent product model, the team MUST choose between declining it, discovering a reusable capability, or explicitly funding a separate product—not adding a permanent conditional fork.

## 9. Documentation First

Material work begins with a shared written contract before implementation.

Documentation MUST define, as applicable:

- problem, users, outcome, scope, and non-goals;
- domain language and owner;
- user journeys and Arabic/English content;
- architecture, public contracts, data ownership, and dependencies;
- authorization, privacy, threat, abuse, and audit requirements;
- accessibility, SEO, performance, and mobile behavior;
- failure, recovery, observability, deployment, and rollback;
- acceptance criteria, tests, and success measures; and
- assumptions, decisions, open questions, and expiry dates.

Documentation MUST be updated in the same change as the contract or behavior it describes. Documentation that cannot be trusted is a defect.

Documents SHOULD explain why and invariants; code SHOULD express implementation. Generated reference material MUST be reproducible and MUST NOT replace human-owned decisions.

## 10. API First

“API first” means contract before implementation. It applies to HTTP APIs, server actions, module boundaries, events, integrations, database access services, and UI-to-domain contracts.

Before implementation, an externally or cross-module consumed contract MUST define:

- owner and consumers;
- purpose and permitted use;
- inputs, outputs, validation, and stable identifiers;
- authentication, authorization, tenant, and data-classification rules;
- success, error, idempotency, concurrency, pagination, and rate behavior;
- versioning, compatibility, deprecation, and migration;
- observability and audit requirements; and
- contract tests.

Public and integration contracts MUST be versioned deliberately. Breaking changes require a migration path and consumer communication. Internal functions MUST NOT be exposed merely because a framework makes exposure easy.

## 11. Quality Priorities

The following are design inputs and release gates, not final polish.

### 11.1 Security first

Every capability starts inaccessible. Access is granted through explicit least-privilege rules at trusted server and data boundaries. Threat modeling, data classification, tenant isolation, secret handling, abuse controls, auditability, and secure failure behavior are required in proportion to risk.

See [Security Principles](./security-principles.md).

### 11.2 Arabic first and internationalization

Arabic (`ar`, RTL) is the default product language. English (`en`, LTR) has release parity.

- Requirements and designs MUST start with real Arabic content and RTL constraints.
- User-facing text MUST be localized; business logic MUST NOT depend on translated text.
- Locale, direction, pluralization, dates, time, numbers, currency, names, addresses, and mixed-direction identifiers MUST be handled explicitly.
- Every released message MUST have reviewed Arabic and English values.
- Arabic-first MUST NOT mean English-later, and parity MUST NOT mean literal translation.

### 11.3 Mobile first

Primary workflows MUST be designed for the smallest supported viewport and constrained field conditions before desktop enhancement. Mobile first includes touch, readability, input effort, intermittent connectivity expectations, performance, safe interruption, and outdoor or operational context. It does not require a native application.

### 11.4 Accessibility first

Naqlia targets WCAG 2.2 AA for applicable experiences. Semantic structure, keyboard access, visible focus, labels, error association, contrast, target size, motion preferences, zoom, reflow, screen-reader behavior, and language metadata MUST be designed and verified.

Accessibility cannot be waived because a user role is internal or because a component library supplies a primitive.

### 11.5 Performance first

Performance budgets MUST be assigned before implementation for user-critical and public experiences. Teams MUST measure realistic Arabic/English content, mobile devices, networks, data volumes, server paths, and third-party cost. Correctness comes first, but known unbounded behavior is not acceptable.

### 11.6 SEO first

SEO applies to approved public content and begins with information architecture, search intent, localized URLs, rendering, metadata, canonicalization, crawl control, structured data, accessibility, and performance. Authenticated and tenant-operational content MUST NOT be indexed.

See [SEO Principles](./seo-principles.md).

## 12. Scalability and Maintainability

### 12.1 Scalability

Scalability includes volume, users, organizations, data growth, operational load, team ownership, configuration combinations, and support cost.

- Tenant ownership MUST be explicit.
- Work MUST be bounded through limits, pagination, batching, backpressure, and timeouts where applicable.
- Retryable work MUST be idempotent.
- State transitions and concurrency behavior MUST be deliberate.
- High-volume designs MUST include retention, archive, index, partition, and monitoring considerations.
- Performance and capacity assumptions MUST have a measurement and review trigger.

### 12.2 Maintainability

- Every module, dependency, configuration, data entity, alert, and production service MUST have an owner.
- Public surfaces MUST be smaller than internal surfaces.
- Types and validation MUST make invalid states difficult to represent and impossible to trust at external boundaries.
- Duplication MAY be tolerated briefly when the correct abstraction is unknown; premature shared abstraction SHOULD be avoided.
- Deprecated behavior MUST have an owner, removal plan, and deadline.
- Comments and documentation MUST explain non-obvious intent, invariants, risk, and tradeoffs—not restate syntax.

## 13. Testing Strategy

Testing follows risk and ownership.

| Test layer          | Primary purpose                                                                |
| ------------------- | ------------------------------------------------------------------------------ |
| Static checks       | Formatting, linting, type safety, dependency and policy enforcement            |
| Unit tests          | Pure domain rules, transformations, validators, and state transitions          |
| Component tests     | Accessible behavior, interaction, states, localization, and direction          |
| Integration tests   | Module, persistence, provider, authorization, and transaction boundaries       |
| Contract tests      | Public APIs, events, schemas, and provider compatibility                       |
| End-to-end tests    | A small set of critical user journeys and release smoke paths                  |
| Security tests      | Tenant isolation, permissions, validation, abuse cases, and secrets boundaries |
| Accessibility tests | Automated checks plus keyboard, screen-reader, zoom, and visual review         |
| Performance tests   | Budgets, realistic loads, query behavior, latency, and regressions             |
| Recovery tests      | Rollback, restore, retry, idempotency, and degraded-mode behavior              |

Rules:

- A defect fix MUST include a regression test at the lowest reliable layer.
- Tests MUST assert observable behavior and contracts, not framework internals.
- Critical authorization and tenant boundaries require both allow and deny tests.
- Mocks MUST NOT hide the integration risk the test claims to cover.
- Flaky tests are defects. They MUST be repaired or quarantined with an owner and expiry; they MUST NOT be retried indefinitely until green.
- Coverage percentages are signals, not proof of correctness.
- Skipped validation MUST be disclosed with reason, risk, owner, and follow-up.

## 14. AI Collaboration Rules

AI is a supervised collaborator. Generated work is held to the same standards as human work.

An AI collaborator MUST:

1. read this Constitution, applicable principle files, scope documents, owning module contracts, and nearby tests before material changes;
2. distinguish repository facts, user requirements, assumptions, and recommendations;
3. inspect before editing and preserve unrelated work;
4. remain inside the authorized scope and stop when new authority is required;
5. never fabricate requirements, files, API behavior, database contracts, legal claims, tests, review, CI, monitoring, or deployment status;
6. never expose secrets, personal data, customer data, production logs, or private operational information to prompts or unapproved tools;
7. use least-privilege tools and prefer reversible, reviewable changes;
8. update documentation, tests, Arabic/English content, and operational controls with the behavior they govern;
9. review generated output for security, correctness, bias, accessibility, localization, licensing, and boundary violations; and
10. report changes, validation, risks, assumptions, and incomplete work accurately.

Humans remain accountable for requirements, risk acceptance, approvals, merges, production access, and customer-impacting decisions. AI approval cannot satisfy a required human review.

Reusable prompts MUST be versioned, non-secret, scoped, and reviewed. Model or tool output MUST NOT be treated as an authoritative external fact without verification appropriate to its risk.

## 15. Git Rules

- `main` MUST remain deployable and protected.
- Work MUST use short-lived branches unless an explicitly authorized repository workflow applies.
- Commits MUST follow Conventional Commits and contain one coherent change.
- Commit history MUST NOT contain secrets, production data, build artifacts, or unrelated formatting churn.
- Shared history MUST NOT be rewritten to conceal a released change or incident.
- Every production deployment MUST resolve to an immutable commit.
- Quality hooks and CI MUST NOT be bypassed to obtain a green merge.
- Emergency changes MUST be followed by full review, documentation, and validation as soon as service safety permits.

## 16. Code Review Rules

Review is risk control and knowledge transfer, not approval theater.

A pull request MUST provide:

- problem and outcome;
- scope and non-goals;
- linked requirement, decision, or incident;
- architecture and dependency impact;
- security, privacy, data, Arabic/English, accessibility, SEO, performance, and operational impact as applicable;
- validation evidence;
- deployment, migration, feature-control, monitoring, and rollback plan; and
- screenshots or recordings for material UI states in both directions when applicable.

Reviewers MUST examine correctness, boundary ownership, failure behavior, tests, maintainability, security, data lifecycle, localization, accessibility, operations, and unintended changes.

The author MUST NOT be the sole approver for a material change. High-risk security, data, billing, authorization, or destructive changes require an appropriate domain owner. Review comments MUST be resolved explicitly; silence is not agreement.

Generated code and dependency updates receive the same review as authored code.

## 17. Definition of Ready

Work is ready for implementation only when all applicable items are true:

### 17.1 Product and scope

- The problem, target user, desired outcome, owner, priority, and evidence are stated.
- Scope, non-goals, assumptions, dependencies, acceptance criteria, and success measures are explicit.
- Arabic and English terminology and core content requirements are available.
- Open questions that could materially change the solution are resolved or owned with a decision deadline.

### 17.2 Experience

- Primary journey and all material states are defined for mobile and desktop.
- RTL/LTR, accessibility, content, SEO, and performance requirements are specified where applicable.
- User research or domain validation is proportionate to risk and novelty.

### 17.3 Engineering and data

- Owning feature or platform domain and public contract are identified.
- Architecture, configuration, data ownership, lifecycle, API, integration, concurrency, and failure implications are understood.
- Permission, tenant, privacy, threat, abuse, audit, and retention requirements are defined.
- Test strategy, observability, rollout, migration, rollback, and operational owner are identified.

### 17.4 Delivery

- The work is small enough to review, release, observe, and reverse safely.
- Required reviewers and approvers are known.
- No unapproved dependency, vendor, compliance claim, or unresolved irreversible choice blocks implementation.

If an item is not applicable, the work record SHOULD state why. “Ready” is a decision backed by evidence, not a backlog status changed for schedule convenience.

## 18. Definition of Done

Work is done only when all applicable items are true:

### 18.1 Outcome and scope

- Acceptance criteria and intended user outcome are demonstrably met.
- Non-goals remain untouched and unrelated changes have been removed.
- Behavior matches the approved requirement, design, contracts, and decisions.

### 18.2 Implementation quality

- Ownership and dependency direction are correct.
- Types, validation, error handling, concurrency, idempotency, configuration, and compatibility are intentional.
- No avoidable dead code, unowned dependency, unexplained warning, unsafe workaround, or expired temporary path remains.
- Documentation and generated contracts are current.

### 18.3 Trust and experience

- Security, privacy, tenant isolation, permissions, audit, retention, and abuse controls pass review.
- Arabic and English content is complete and reviewed; RTL and LTR behavior is verified.
- Mobile, responsive, accessibility, loading, empty, validation, error, permission, conflict, degraded, recovery, and success states are verified.
- Applicable SEO and performance budgets are met.

### 18.4 Verification

- Required static, unit, component, integration, contract, end-to-end, security, accessibility, performance, and recovery checks pass.
- The author has reviewed the final diff and validation output.
- CI is green and required reviewers have approved.

### 18.5 Delivery and operations

- Configuration, migration, deployment, feature control, monitoring, alerting, support, and rollback steps are ready.
- Production or preview verification confirms the intended immutable revision.
- Metrics and logs can distinguish success, failure, degradation, and rollback.
- Follow-up debt has an owner, priority, rationale, and deadline; critical completion work is not mislabeled as future debt.

Merge, deployment, and product completion are different states. A change is not fully done until its required post-deployment verification and evidence are complete.

## 19. Release Rules

Every release MUST:

1. originate from a reviewed immutable commit with passing required checks;
2. identify scope, owner, risk, compatibility, and affected organizations or users;
3. include configuration and data migration order where applicable;
4. use feature control or progressive delivery when blast radius justifies it;
5. define smoke checks, success signals, error signals, alert thresholds, and observation period;
6. provide a tested rollback, forward-fix, or containment plan;
7. preserve database compatibility across application rollback when data changes exist;
8. verify Arabic/English, authorization, critical routes, and integrations as applicable; and
9. record the deployed commit and environment.

Release owners MUST stop or roll back when guardrails fail. A successful build is not a successful release. Database rollback MUST NOT be assumed from application rollback.

Emergency releases MAY shorten pre-release process only to reduce active harm. They MUST retain peer authorization when feasible, auditability, scope minimization, monitoring, and immediate follow-up review.

## 20. Technical Debt Policy

Technical debt is an explicit tradeoff, not a label for unfinished mandatory work.

Debt MUST record:

- the compromised standard or deferred capability;
- reason and evidence for accepting it;
- customer, security, operational, and delivery risk;
- affected owner and area;
- remediation condition or deadline;
- estimated effort and dependencies; and
- monitoring or containment.

Security vulnerabilities, tenant-isolation gaps, data corruption risks, inaccessible critical journeys, missing required audit, secret exposure, and untested destructive changes MUST NOT be accepted as ordinary debt.

Debt MUST be reviewed during planning and before related expansion. Repeated local workarounds indicate an architectural or product problem and MUST trigger root-cause review. Debt without an owner and review date is an unmanaged defect.

## 21. Dependency Policy

A dependency is a long-term supply-chain and maintenance commitment.

Before adoption, the owner MUST document:

- problem that cannot be solved reasonably with the existing stack or platform;
- maintenance health and release cadence;
- license and commercial constraints;
- security history and transitive risk;
- runtime, bundle, accessibility, privacy, and operational impact;
- server/client boundary and data exposure;
- versioning, upgrade, replacement, and exit plan; and
- accountable owner.

Dependencies MUST be pinned through the lockfile, scanned, updated deliberately, and removed when unused. High-risk upgrades require changelog review and targeted regression tests. Convenience alone does not justify a new dependency.

No package, service, model, analytics tool, font, script, SDK, or content source may receive customer or personal data without an approved data-flow and security/privacy review.

## 22. Database Policy

The database is an authoritative product boundary, not a passive storage implementation.

- PostgreSQL is the transactional source of truth for approved operational data.
- Organization tenancy, data ownership, referential integrity, lifecycle, and authorization MUST be explicit.
- RLS is mandatory defense in depth for client-reachable tenant data and MUST default deny.
- Database grants, server authorization, validation, and audit MUST complement RLS.
- Domain owners control writes to their data; cross-domain mutation through private internals is prohibited.
- Schema and migrations require documentation, named constraints, tenant-safe references, RLS policy inventory, tests, rollout, compatibility, backup, and recovery planning.
- Destructive changes use expand-and-contract or another approved reversible strategy.
- Immutable events, financial facts, audit evidence, and document versions are corrected through new facts, not history rewriting.
- Retention, deletion, anonymization, legal hold, and restore behavior MUST be designed before collection.
- Production data MUST NOT be used in development or AI prompts.

The [Database Principles](./database-principles.md) and approved database architecture documents are mandatory for all data work.

## 23. Naming Policy

Names are durable contracts.

- Use the project's canonical domain language consistently across product, code, API, database, events, logs, metrics, and documentation.
- Names MUST express responsibility and business meaning, not temporary UI position or implementation mechanism.
- Machine identifiers are stable, ASCII, and not localized; user-facing labels are localized.
- Avoid unexplained abbreviations, ambiguous generic nouns, misleading success terms, and version suffixes that conceal migration.
- Boolean, event, permission, error, metric, and database names MUST follow their documented taxonomies.
- A rename that affects a public or retained contract requires compatibility and migration planning.

Database-specific rules are defined in [Database Naming Conventions](../docs/03-Naming-Conventions.md); code-specific rules are defined in [Coding Principles](./coding-principles.md).

## 24. Configuration Policy

- Environment values enter through one validated, typed configuration boundary.
- Modules MUST NOT read uncontrolled environment values throughout the codebase.
- Secrets are server-only and stored in approved secret management.
- Public configuration MUST be explicitly safe for disclosure.
- Defaults MUST be intentional and secure; missing required configuration MUST fail early with a safe diagnostic.
- Environment, tenant, feature, and user preference configuration MUST remain separate concepts.
- Configuration changes affecting behavior, access, data, billing, or integrations MUST be authorized and audited.
- `.env.example` and configuration documentation are contracts and MUST remain current without real secrets.

## 25. Logging Policy

Logs exist to operate and secure the service, not to accumulate data.

- Use structured events with stable names, severity, timestamp, environment, service/module, correlation identifier, and safe context.
- Logs MUST NOT contain passwords, tokens, secrets, raw credentials, unnecessary personal data, precise location trails, document contents, or unrestricted payloads.
- User-facing errors and internal diagnostics MUST be separated.
- Security and audit evidence MUST use their governed systems; ordinary logs are not an immutable audit ledger.
- Sampling and retention MUST reflect event value, classification, volume, and incident needs.
- Every logged field MUST have a purpose. Redaction MUST occur before emission.
- Debug logging MUST NOT be permanently enabled in production without bounded scope and expiry.

## 26. Monitoring Policy

Every production capability MUST define how the team will know it is healthy, degraded, failing, abused, or producing the wrong outcome.

Monitoring MUST cover, as applicable:

- availability, latency, throughput, saturation, and error rate;
- critical user-journey completion and business invariants;
- queues, retries, dead letters, provider health, and data freshness;
- authorization denials, suspicious access, and audit-pipeline integrity;
- deployment version, configuration change, and rollback state;
- performance budgets and real-user experience; and
- backup, archive, restore, and scheduled-job completion.

Alerts MUST be actionable, severity-defined, routed to an owner, linked to a runbook, and tested. A metric without an owner or decision is telemetry, not monitoring. Alert noise MUST be repaired rather than normalized.

## 27. Error-Handling Policy

Errors are explicit domain and operational outcomes.

- Validate at every trust boundary and reject invalid input before state change.
- Use a stable error taxonomy that distinguishes validation, authentication, authorization, not-found, conflict, rate, dependency, transient, and unexpected failure.
- Public errors MUST be safe, localized, actionable, and must not disclose internals or resource existence across authorization boundaries.
- Internal diagnostics MUST retain correlation, cause, safe context, and owning operation.
- Expected errors MUST be modeled; unexpected errors MUST reach monitoring.
- Retry only transient, idempotent operations with bounded attempts, backoff, jitter, and terminal handling.
- Timeouts, cancellation, partial failure, concurrency conflict, and duplicate requests MUST have deliberate behavior.
- Errors MUST NOT be swallowed, converted to false success, or logged repeatedly at every layer.
- Recovery instructions MUST preserve user input when safe and explain the next action.

## 28. Exceptions

An exception is permitted only when a mandatory rule cannot be met immediately and the temporary risk is lower than the harm of stopping the work.

Every exception MUST include:

- exact rule and affected scope;
- accountable requester and approver;
- reason and considered alternatives;
- risk, affected users/data, and containment;
- monitoring and rollback;
- issue or decision record;
- creation and expiry dates; and
- remediation owner and acceptance criteria.

Exceptions MUST be narrow, time-bound, visible in review, and reapproved before expiry. Exceptions MUST NOT authorize illegal behavior, secret exposure, known cross-tenant access, fabricated evidence, deliberate data corruption, hidden customer impact, or removal of required audit evidence.

## 29. Amendment Process

This Constitution follows semantic versioning:

- **Major:** changes a governing principle, authority, mandatory gate, or risk posture.
- **Minor:** adds a compatible principle, decision rule, or required control.
- **Patch:** clarifies wording without changing obligation.

An amendment MUST:

1. state the problem and proposed normative change;
2. identify affected principles, guides, automation, and existing work;
3. include migration and communication for changed obligations;
4. receive Product and Engineering approval plus affected domain approval;
5. update the version, effective date, and related documents in one reviewed change; and
6. preserve an immutable Git history.

Emergency security restrictions MAY take effect immediately and MUST be documented and ratified afterward. No individual task silently amends the Constitution.

## 30. Constitutional Review Checklist

Before any material work is approved, ask:

1. Is the problem validated and the outcome measurable?
2. Is the work inside approved product scope?
3. Does ownership and dependency direction remain clear?
4. Is configuration coherent and bounded rather than customer-specific code?
5. Are contracts documented before implementation?
6. Are security, privacy, tenant, audit, and data lifecycle explicit?
7. Are Arabic, English, RTL, mobile, accessibility, performance, and SEO handled where applicable?
8. Are failure, recovery, logging, monitoring, rollout, and rollback designed?
9. Are tests proportionate to risk and do they cover denial and failure paths?
10. Is the change small, reviewable, reversible, and free of unmanaged debt?
11. Are dependencies and AI use authorized and accountable?
12. Does the Definition of Ready hold before work and the Definition of Done hold before closure?

If the answer to a mandatory question is no, the work is not ready or not done.
