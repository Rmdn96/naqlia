# Naqlia Non-Functional Requirements

| Document field | Value                                                                              |
| -------------- | ---------------------------------------------------------------------------------- |
| Suite          | Product Documentation Suite (PDS) v1                                               |
| Status         | Approved quality baseline                                                          |
| Version        | 1.0.0                                                                              |
| Parent         | [Business Requirements Specification](./01-Business-Requirements-Specification.md) |
| Owners         | Product, Engineering, Security, Data, Design, and Operations leadership            |

## 1. Purpose

This document defines measurable quality, security, accessibility, localization, performance, reliability, maintainability, and operational requirements for PDS v1. The requirements apply to every relevant feature and are release gates, not optional enhancement work.

Targets are initial baselines. A stricter approved SLO or legal obligation prevails. A lower target requires a time-bound constitutional exception and MUST NOT weaken tenant isolation, data integrity, security, or accessibility.

## 2. Verification Convention

Each requirement includes its primary evidence. Passing a single automated tool does not prove the complete requirement.

| Evidence    | Meaning                                                      |
| ----------- | ------------------------------------------------------------ |
| Review      | Approved human review of design, policy, or output           |
| Automated   | Repeatable CI or test-suite evidence                         |
| Deployed    | Verification in Preview or Production on the intended commit |
| Operational | Monitoring, drill, real-user, or runbook evidence            |

## 3. Availability and Reliability

| ID            | Requirement                                                                                                                                                                    | Primary evidence                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| `NFR-REL-001` | After General Availability, customer request, quotation response, and tracking capabilities SHOULD target at least 99.9% monthly availability, excluding approved maintenance. | Operational SLI/SLO dashboard      |
| `NFR-REL-002` | Critical state mutations MUST be atomic within their ownership boundary and MUST NOT report success before durable completion.                                                 | Integration and failure tests      |
| `NFR-REL-003` | Retryable request submission, quotation conversion, communication, and background operations MUST be idempotent.                                                               | Duplicate/retry tests              |
| `NFR-REL-004` | Timeouts, cancellation, partial failure, dependency failure, and stale-state conflicts MUST have explicit safe outcomes.                                                       | Contract and integration tests     |
| `NFR-REL-005` | Customer-visible current state and immutable transition history MUST remain consistent.                                                                                        | Invariant and reconciliation tests |
| `NFR-REL-006` | External delivery failures MUST be retried only when safe with bounded attempts, backoff, jitter, and terminal visibility.                                                     | Integration and operational tests  |
| `NFR-REL-007` | A provider outage MUST NOT corrupt Lead, Quotation, Order, configuration, or audit truth.                                                                                      | Failure-injection tests            |
| `NFR-REL-008` | System clocks and recorded business instants MUST use approved UTC storage and explicit display timezone.                                                                      | Data and integration tests         |

## 4. Performance

Performance targets apply at the 75th percentile for user-experience metrics and the stated percentile for server operations under approved representative mobile/desktop, Arabic/English, cache, network, and data-volume profiles.

| ID             | Initial target                                                                                                                       | Scope/evidence                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `NFR-PERF-001` | LCP ≤ 2.5 seconds                                                                                                                    | Key public/request/tracking entry views; lab and field data |
| `NFR-PERF-002` | INP ≤ 200 milliseconds                                                                                                               | Key interactive journeys; field data                        |
| `NFR-PERF-003` | CLS ≤ 0.1                                                                                                                            | Key public and operational views                            |
| `NFR-PERF-004` | Cached public-page TTFB ≤ 800 milliseconds                                                                                           | Approved public pages under representative region/network   |
| `NFR-PERF-005` | Core server read p95 ≤ 500 milliseconds                                                                                              | Excludes separately reported external-provider latency      |
| `NFR-PERF-006` | Core ordinary transactional write p95 ≤ 1 second                                                                                     | Excludes approved asynchronous external delivery            |
| `NFR-PERF-007` | Initial client JavaScript target ≤ 200 KB compressed per ordinary entry route                                                        | Build budget; exceptions require review                     |
| `NFR-PERF-008` | Lighthouse target ≥ 90 for Performance, Accessibility, Best Practices, and SEO                                                       | Applicable reference views; supplemental evidence only      |
| `NFR-PERF-009` | Request, search, list, and report work MUST be bounded and paginated where data can grow.                                            | Query/UI tests and plan review                              |
| `NFR-PERF-010` | Third-party scripts, fonts, media, maps, and analytics MUST have explicit budgets and MUST NOT block critical work without approval. | Build and runtime review                                    |
| `NFR-PERF-011` | Arabic content, RTL layout, long translations, and mixed-direction values MUST be included in performance/layout tests.              | Automated and manual review                                 |

## 5. Scalability and Capacity

| ID              | Requirement                                                                                                                                                              | Primary evidence             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| `NFR-SCALE-001` | Application workloads MUST remain stateless where possible and horizontally scalable on the approved platform.                                                           | Architecture and load review |
| `NFR-SCALE-002` | Data access MUST be organization-aware, indexed, bounded, and free of cross-organization scans for ordinary work.                                                        | Database plan/security tests |
| `NFR-SCALE-003` | Background work MUST define concurrency, backpressure, retry, deduplication, and fairness.                                                                               | Design and load tests        |
| `NFR-SCALE-004` | High-volume history MUST have retention, archival, and partition review before thresholds are exceeded.                                                                  | Capacity plan                |
| `NFR-SCALE-005` | One customer, actor, import, search, export, or tracking abuse pattern MUST NOT create unbounded resource consumption.                                                   | Quota/load/abuse tests       |
| `NFR-SCALE-006` | Capacity assumptions MUST define users, requests, leads, quotations, orders, events, attachments, communication attempts, and growth with review triggers before launch. | Approved workload model      |
| `NFR-SCALE-007` | Cache use MUST define organization scope, key, freshness, invalidation, privacy, fallback, and capacity.                                                                 | Architecture review          |

## 6. Security

| ID            | Requirement                                                                                                                                          | Primary evidence               |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `NFR-SEC-001` | Every protected capability MUST default deny and enforce authorization at trusted server and database boundaries.                                    | Security and integration tests |
| `NFR-SEC-002` | Customer and internal sessions MUST follow approved authentication, verification, renewal, revocation, and recent-authentication policy.             | Identity tests/review          |
| `NFR-SEC-003` | Internal roles MUST implement least privilege and separation of Sales, Operations, Finance, Customer Service, and Super Admin responsibilities.      | Permission-matrix tests        |
| `NFR-SEC-004` | Super Admin MUST NOT imply database superuser, RLS bypass, service-role access, shared identity, or secret access.                                   | Architecture and access review |
| `NFR-SEC-005` | Protected tenant/client-reachable data MUST use RLS as defense in depth under the approved strategy.                                                 | Multi-actor database tests     |
| `NFR-SEC-006` | Public tracking MUST resist enumeration through exact pair matching, normalization, rate limiting, generic denial, minimized output, and monitoring. | Abuse and penetration tests    |
| `NFR-SEC-007` | All external input MUST be validated for type, length, range, structure, encoding, file constraints, and business meaning.                           | Boundary tests                 |
| `NFR-SEC-008` | Secrets MUST remain outside source, client bundles, prompts, logs, errors, analytics, fixtures, and screenshots.                                     | Secret scanning and review     |
| `NFR-SEC-009` | Transport encryption MUST protect external and service boundaries; sensitive caching MUST be prohibited.                                             | Deployed security review       |
| `NFR-SEC-010` | State-changing browser operations MUST implement approved CSRF/session controls; output MUST be encoded for its destination context.                 | Security tests                 |
| `NFR-SEC-011` | File handling, when introduced, MUST enforce type, size, content, private ownership, scanning/quarantine, access, integrity, retention, and audit.   | File-security tests            |
| `NFR-SEC-012` | High-risk access, configuration, pricing approval, export, contact correction, and lifecycle override MUST be attributable and audited.              | Audit verification             |
| `NFR-SEC-013` | Dependencies and build actions MUST use deterministic installation, least privilege, vulnerability review, and supported versions.                   | CI/supply-chain evidence       |
| `NFR-SEC-014` | Material trust-boundary changes MUST have an approved threat model before implementation.                                                            | Review artifact                |

## 7. Privacy and Data Protection

| ID             | Requirement                                                                                                                              | Primary evidence              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `NFR-PRIV-001` | Each collected field MUST have a documented purpose, classification, owner, and retention disposition.                                   | Data inventory review         |
| `NFR-PRIV-002` | Guest submission MUST collect only data required for qualification, quotation, execution, communication, consent, and legal obligations. | Product/privacy review        |
| `NFR-PRIV-003` | Public tracking MUST expose only the fields in `FR-TRK-004` and MUST exclude fields in `FR-TRK-005`.                                     | Contract/security tests       |
| `NFR-PRIV-004` | Production personal/customer data MUST NOT be used in development, fixtures, demos, screenshots, or AI prompts.                          | Process and repository review |
| `NFR-PRIV-005` | Retention, archive, anonymization, deletion, legal hold, and backup behavior MUST be approved before production collection.              | Governance review             |
| `NFR-PRIV-006` | Third-party providers MUST receive only approved minimum data under a reviewed data-flow and retention policy.                           | Provider review               |
| `NFR-PRIV-007` | Optional account linking MUST preserve provenance and MUST not expose records based only on unverified matching attributes.              | Identity/privacy tests        |
| `NFR-PRIV-008` | Exports and support access MUST be purpose-bound, minimized, time-bound where applicable, and audited.                                   | Access/audit tests            |

## 8. Accessibility

Naqlia targets WCAG 2.2 AA for applicable user-facing and internal experiences.

| ID             | Requirement                                                                                                                         | Primary evidence                 |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `NFR-A11Y-001` | Critical journeys MUST be operable by keyboard without pointer-only interaction.                                                    | Manual keyboard tests            |
| `NFR-A11Y-002` | Semantic structure, landmarks, headings, controls, names, descriptions, and reading order MUST match meaning.                       | Screen-reader/manual review      |
| `NFR-A11Y-003` | Focus MUST be visible and managed across navigation, dialogs, errors, asynchronous updates, and return paths.                       | Manual/automated tests           |
| `NFR-A11Y-004` | Text and non-text contrast MUST meet the approved standard in every interactive/status state.                                       | Automated/manual contrast review |
| `NFR-A11Y-005` | Content MUST support required zoom, text resize, and reflow without loss of task or information.                                    | Viewport/zoom tests              |
| `NFR-A11Y-006` | Forms MUST provide persistent labels, instructions, required/optional meaning, error association, summary, and correction guidance. | Component/journey tests          |
| `NFR-A11Y-007` | Meaning MUST NOT depend only on color, position, direction, sound, motion, or timing.                                               | Design review                    |
| `NFR-A11Y-008` | Motion MUST respect reduced-motion preferences and avoid unnecessary vestibular effects.                                            | Manual/automated tests           |
| `NFR-A11Y-009` | Touch targets and mobile spacing MUST meet the approved accessibility target.                                                       | Mobile interaction tests         |
| `NFR-A11Y-010` | Automated accessibility checks MUST supplement, not replace, manual keyboard and assistive-technology review.                       | QA evidence                      |

## 9. Internationalization and Localization

| ID             | Requirement                                                                                                                          | Primary evidence            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| `NFR-I18N-001` | Arabic (`ar`, RTL) MUST be the default; English (`en`, LTR) MUST have release parity.                                                | Locale E2E tests            |
| `NFR-I18N-002` | Every released user-facing message/configuration MUST have reviewed Arabic and English values.                                       | Catalog completeness checks |
| `NFR-I18N-003` | `lang` and `dir` MUST be set from the active locale at the document boundary.                                                        | Deployed DOM tests          |
| `NFR-I18N-004` | Layout MUST use logical direction behavior and correctly handle direction-sensitive/invariant visuals.                               | RTL/LTR visual review       |
| `NFR-I18N-005` | Mixed Arabic/English identifiers, mobile numbers, addresses, codes, and currency MUST remain readable using bidirectional isolation. | Content test matrix         |
| `NFR-I18N-006` | Dates, time, numbers, currency, units, lists, and plurals MUST use approved locale-aware formatting.                                 | Unit/component tests        |
| `NFR-I18N-007` | Translation must not be assembled through fragment concatenation or used as a machine identifier.                                    | Static/review evidence      |
| `NFR-I18N-008` | Missing translations MUST fail configuration/release validation rather than expose raw keys or incorrect fallback.                   | Automated checks            |
| `NFR-I18N-009` | Locale switching SHOULD preserve route, authorized context, and safe unsaved input.                                                  | Journey tests               |

## 10. Usability and Mobile Experience

| ID           | Requirement                                                                                                                            | Primary evidence           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `NFR-UX-001` | Request, quotation, tracking, lead review, and core order operations MUST be designed mobile-first.                                    | Design and viewport review |
| `NFR-UX-002` | The smallest supported viewport MUST preserve the complete primary task without page-level horizontal scrolling.                       | Responsive tests           |
| `NFR-UX-003` | UI MUST distinguish loading, empty, validation, unauthorized, conflict, partial, degraded, success, cancellation, and recovery states. | State matrix tests         |
| `NFR-UX-004` | Destructive/high-impact actions MUST identify scope, consequence, confirmation, and recovery.                                          | Product/QA review          |
| `NFR-UX-005` | Valid customer input MUST be preserved after a recoverable failure where safe.                                                         | Failure tests              |
| `NFR-UX-006` | Offline behavior MUST NOT be promised; unsupported connectivity loss MUST have clear state and retry guidance.                         | Journey tests              |
| `NFR-UX-007` | User content MUST use approved domain language and natural Arabic rather than provider/database terms.                                 | Content review             |

## 11. SEO and Public Discoverability

| ID            | Requirement                                                                                                                                                    | Primary evidence              |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `NFR-SEO-001` | Only explicitly approved public content MAY be indexable; customer, tracking, quotation, account, internal, preview, and admin content MUST NOT be indexed.    | Deployed crawl/security tests |
| `NFR-SEO-002` | Public pages MUST provide server-rendered essential content, semantic headings, localized metadata, canonical URL, and Arabic/English alternate relationships. | Rendered output review        |
| `NFR-SEO-003` | Sitemaps and robots controls MUST include only intended production public URLs and MUST exclude non-production environments.                                   | Deployed verification         |
| `NFR-SEO-004` | Structured data MAY be used only when eligible and matching visible verified content.                                                                          | Validation/review             |
| `NFR-SEO-005` | Public content MUST meet applicable accessibility and performance budgets.                                                                                     | Combined quality evidence     |

## 12. Data Integrity and Quality

| ID             | Requirement                                                                                                                             | Primary evidence             |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `NFR-DATA-001` | Lead, Quotation, Order, configuration, and history identities MUST be immutable, unique, and non-reused.                                | Constraint/integration tests |
| `NFR-DATA-002` | Durable invalid states MUST be prevented by validation and database integrity where possible.                                           | Data tests                   |
| `NFR-DATA-003` | Current state and append-only history MUST reconcile for every lifecycle object.                                                        | Reconciliation tests         |
| `NFR-DATA-004` | Monetary values MUST use fixed precision and explicit configured currency; floating point is prohibited.                                | Type/data tests              |
| `NFR-DATA-005` | Instants MUST be stored in UTC with source occurrence/recording distinction when needed.                                                | Data tests                   |
| `NFR-DATA-006` | Customer mobile values MUST have canonical normalization while preserving required display/provenance.                                  | Validation tests             |
| `NFR-DATA-007` | Configuration publication MUST reject missing localization, dangling references, overlaps, invalid ranges, and impossible combinations. | Configuration tests          |
| `NFR-DATA-008` | Historical commercial/order snapshots MUST not be altered by later configuration/customer changes.                                      | Regression tests             |

## 13. Auditability and Observability

| ID            | Requirement                                                                                                                                               | Primary evidence           |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `NFR-OBS-001` | Production capabilities MUST expose structured safe logs, metrics, traces where useful, health signals, deployment markers, and actionable alerts.        | Deployed operations review |
| `NFR-OBS-002` | Requests, jobs, messages, domain events, and effects SHOULD share safe correlation/causation identifiers.                                                 | Trace verification         |
| `NFR-OBS-003` | Logs MUST exclude secrets, tokens, unrestricted payloads, documents, unnecessary personal data, and precise location.                                     | Logging tests/review       |
| `NFR-OBS-004` | Metrics MUST use stable names/units and MUST avoid uncontrolled high-cardinality labels.                                                                  | Telemetry review           |
| `NFR-OBS-005` | Alerts MUST be severity-defined, actionable, routed to an owner, linked to a runbook, and tested.                                                         | Alert drill                |
| `NFR-OBS-006` | Lead response, quote turnaround, conversion, execution, completion, tracking denial, configuration failure, and communication failure MUST be observable. | Dashboard review           |
| `NFR-OBS-007` | Audit evidence MUST remain distinct from diagnostic logs and follow the approved immutable retention strategy.                                            | Audit review               |
| `NFR-OBS-008` | Audit-pipeline, backup, restore, scheduled-job, and configuration-publication failures MUST be monitored.                                                 | Operational tests          |

## 14. Recoverability and Continuity

| ID            | Requirement                                                                                                                             | Primary evidence       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `NFR-REC-001` | RPO, RTO, backup retention, restore authority, and incident communication MUST be approved before critical production data is accepted. | Governance approval    |
| `NFR-REC-002` | Backup scope MUST include database, governed object storage, configuration dependencies, and audit archives as applicable.              | Backup inventory       |
| `NFR-REC-003` | Backup completion MUST be monitored independently from the primary workload.                                                            | Operations dashboard   |
| `NFR-REC-004` | Restore exercises MUST verify identity, relationships, tenant/access controls, object links, lifecycle history, and audit integrity.    | Restore drill evidence |
| `NFR-REC-005` | Application rollback MUST NOT assume database rollback; releases require compatible data evolution and forward-fix/containment.         | Release review         |
| `NFR-REC-006` | Critical business operations MUST have documented recovery from duplicate, stale, partial, and provider-failure states.                 | Runbook and tests      |

## 15. Maintainability and Testability

| ID            | Requirement                                                                                                                              | Primary evidence           |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `NFR-MNT-001` | Strict TypeScript, runtime validation, feature ownership, one-way dependencies, and minimal public surfaces are mandatory.               | Static/architecture checks |
| `NFR-MNT-002` | Every module, dependency, configuration, data object, alert, and production capability MUST have an owner.                               | Ownership inventory        |
| `NFR-MNT-003` | Business rules MUST be represented through stable contracts/configuration and MUST NOT be duplicated across UI, server, and data layers. | Code/design review         |
| `NFR-MNT-004` | Dependencies require purpose, license, security, maintenance, bundle/operations, upgrade, and exit review.                               | Dependency record          |
| `NFR-MNT-005` | Documentation, generated types/contracts, configuration examples, tests, and behavior MUST change together.                              | Diff/review evidence       |
| `NFR-MNT-006` | Tests MUST be deterministic, synthetic, isolated, and free of production data.                                                           | Test review                |
| `NFR-MNT-007` | Required checks MUST include formatting, linting, strict types, tests, security audit, and production build.                             | CI                         |
| `NFR-MNT-008` | Flaky required tests are defects and MUST be fixed or time-bound with owner; indefinite retry-to-green is prohibited.                    | CI health                  |
| `NFR-MNT-009` | Technical debt MUST record impact, owner, containment, due condition/date, and remediation criteria.                                     | Debt review                |

## 16. Compatibility and Portability

| ID             | Requirement                                                                                                                | Primary evidence     |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `NFR-COMP-001` | Supported browsers, devices, screen sizes, and authentication-provider versions MUST be documented before launch.          | Compatibility matrix |
| `NFR-COMP-002` | Critical external providers MUST be isolated behind owned contracts with timeout, failure, data export, and exit behavior. | Architecture review  |
| `NFR-COMP-003` | Public/cross-module contracts MUST define versioning, compatibility, deprecation, and migration.                           | Contract review      |
| `NFR-COMP-004` | Configuration and retained events MUST include schema/version behavior for compatible evolution.                           | Data/contract tests  |
| `NFR-COMP-005` | Preview/local environments MUST use non-production credentials and synthetic data.                                         | Environment review   |

## 17. Operational Support

| ID            | Requirement                                                                                                                                          | Primary evidence         |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `NFR-OPS-001` | Every production capability MUST have technical owner, business owner, dashboard, alert, runbook, dependencies, escalation, and deprecation process. | Service readiness review |
| `NFR-OPS-002` | Release plans MUST identify immutable commit, scope, risk, migrations/configuration, smoke tests, observation, and rollback/containment.             | Release record           |
| `NFR-OPS-003` | Internal support access MUST be named, least-privilege, purpose-bound, time-bound when privileged, and audited.                                      | Access review            |
| `NFR-OPS-004` | Customer-facing incident/status communication MUST be accurate, localized, approved, and separate from internal diagnostics.                         | Incident exercise        |
| `NFR-OPS-005` | Support targets and operating hours MUST come from published configuration and have monitoring/escalation.                                           | Config/operations review |

## 18. NFR Release Gate

Before a PDS v1 capability is released:

1. every applicable NFR MUST map to a design and test/evidence owner;
2. target measurement conditions and datasets MUST be defined;
3. required security, privacy, accessibility, localization, and operational reviews MUST pass;
4. CI and production build MUST pass;
5. Preview/Production verification MUST reference the intended immutable commit;
6. any exception MUST identify exact requirement, risk, containment, owner, expiry, and remediation; and
7. observed production signals MUST confirm the release claim before completion.
