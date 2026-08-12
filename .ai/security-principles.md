# Naqlk Security Principles

| Document field   | Value                                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| Status           | Mandatory security policy                                                                                        |
| Version          | 1.0.0                                                                                                            |
| Parent authority | [Naqlk Constitution](./constitution.md)                                                                          |
| Owner            | Security and Engineering leadership                                                                              |
| Applies to       | Product design, identity, authorization, data, code, dependencies, infrastructure, operations, incidents, and AI |

## 1. Security Standard

Naqlk protects the confidentiality, integrity, availability, privacy, and accountable use of customer, user, operational, and platform data.

Security is a release condition and architecture input. It MUST NOT depend on obscurity, UI restrictions, customer caution, a private repository, or a single provider feature.

This document defines engineering policy, not a legal or compliance certification.

## 2. Core Security Principles

1. **Default deny.** New identities, resources, routes, data, buckets, integrations, and administration paths begin inaccessible.
2. **Least privilege.** Access is limited by identity, organization, role, purpose, resource, operation, time, and environment.
3. **Defense in depth.** Authentication, server authorization, grants, RLS, validation, rate controls, encryption, audit, and monitoring reinforce one another.
4. **Assume breach.** Credentials, sessions, clients, dependencies, and operators may be compromised; blast radius and evidence matter.
5. **Tenant isolation is an invariant.** Cross-organization exposure is a critical security incident.
6. **Minimize data and trust.** Collect and expose only what the approved purpose requires.
7. **Named accountability.** Human and machine actions are attributable; shared privileged identities are prohibited.
8. **Safe failure.** Failure MUST NOT grant access, reveal protected existence, corrupt truth, or conceal impact.
9. **Verify continuously.** Controls require tests, monitoring, review, and incident learning.

## 3. Security Ownership and Risk

- Every capability has a security owner within its engineering ownership.
- Material risk acceptance requires the security owner and accountable business/product owner.
- Legal or compliance interpretation requires qualified review.
- Security decisions MUST record assets, actors, threat, likelihood, impact, controls, residual risk, owner, expiry or review trigger.
- A deadline MAY reduce scope but MUST NOT silently accept a prohibited condition.
- Critical vulnerabilities and active exposure interrupt normal prioritization.

## 4. Threat Modeling

Threat modeling is required before work that changes:

- identity, session, membership, role, or permission behavior;
- organization or business-unit boundaries;
- cross-organization sharing;
- public APIs, webhooks, integrations, file handling, or external providers;
- precise location, documents, finance, personal data, exports, or analytics;
- elevated functions, service roles, support access, or administration;
- caching, queues, background jobs, AI, or automated decisions;
- security headers, session storage, encryption, retention, or deletion; or
- deployment, secrets, network, database, or storage topology.

A threat model MUST identify:

1. assets and classification;
2. actors and privileges;
3. data flow and trust boundaries;
4. entry points and dependencies;
5. misuse and abuse cases;
6. preventive, detective, and recovery controls;
7. residual risk and owner; and
8. test, monitoring, and incident implications.

Threat models are updated when assumptions or boundaries change.

## 5. Authentication

- Supabase Auth is the approved authentication authority unless an architecture decision changes it.
- Application profiles map to managed Auth identities; authentication records are not business authorization.
- MFA is required for platform administrators, break-glass identities, and high-risk operations according to policy.
- Session lifetime, renewal, revocation, device risk, and recent-authentication requirements match operation risk.
- Account discovery MUST NOT be exposed through distinguishable public errors.
- Password, recovery, invitation, and identity-linking workflows require enumeration, replay, fixation, brute-force, and takeover controls.
- Anonymous access is disabled unless a separately approved public use case requires it.
- Authentication tokens MUST NOT be logged, persisted in unsafe storage, or exposed to unrelated services.

## 6. Authorization and Tenant Isolation

- Authorization uses authoritative active memberships, permissions, scope, assignment, resource relationships, and privileged grants.
- Role labels MUST NOT be hardcoded as the only policy model.
- Organization context supplied by a client is a requested context, not proof of access.
- Every protected server operation checks authentication, organization, permission, resource scope, and current state.
- PostgreSQL RLS is mandatory defense in depth for client-reachable tenant data.
- Queries MUST NOT retrieve another organization's rows for client-side filtering.
- Organization ownership is immutable.
- Cross-organization access requires explicit connection, share, allowed action, duration, and revocation.
- Authorization caches require short bounds and reliable invalidation.
- Tests MUST include unauthenticated, unauthorized, cross-tenant, stale-token, revoked, soft-deleted, and privileged cases.

Detailed policy is in [RLS Strategy](../docs/04-RLS-Strategy.md).

## 7. Administrative and Service Access

### 7.1 Organization administration

Organization administrators remain tenant-scoped. They MUST NOT bypass RLS, create platform grants, change global permissions, access credentials, or modify audit evidence.

### 7.2 Platform support

Platform access is:

- assigned to a named person;
- approved for a purpose and target;
- limited to required capabilities;
- time-bound;
- protected by strong authentication;
- visible to the customer where policy requires; and
- fully audited, including impersonated subject and original actor.

Standing unrestricted customer access is prohibited.

### 7.3 Break glass

Break-glass access is an emergency procedure, not an application role. It requires strong independently controlled credentials, time-bound authorization, monitoring, immutable evidence, and post-use review. It MUST NOT be represented by a durable profile flag.

### 7.4 Machine identities

- Each workload uses a dedicated service principal or approved platform identity.
- Permissions and organization scope are narrow and revocable.
- Human accounts MUST NOT run unattended workloads.
- Credentials are rotated and stored in approved secret management.
- The Supabase service role is never exposed to clients and does not replace application authorization or audit.

## 8. Data Protection and Privacy

### 8.1 Collection

- Collect data only for an approved purpose.
- Required versus optional collection MUST be clear.
- Sensitive free text SHOULD be avoided.
- Precise location, identity documents, contact data, financial data, and support evidence require explicit purpose and retention.
- Customer data MUST NOT be used to train or improve models without explicit contractual and governance approval.

### 8.2 Classification

Data is classified before use. Classification determines access, encryption, masking, logging, provider eligibility, retention, backup, regional transfer, testing, and incident handling.

### 8.3 Encryption

- Transport encryption is mandatory across external and service boundaries.
- Provider-managed encryption at rest MUST be understood and supplemented for restricted fields where threat and obligations require it.
- Encryption keys and secrets have separate ownership, rotation, backup, and revocation.
- Hashing, encryption, tokenization, and redaction are distinct controls and MUST NOT be confused.

### 8.4 Lifecycle

- Retention is approved before production collection.
- Access ends before retention does.
- Deletion, anonymization, archive, legal hold, and restoration behavior are documented and tested.
- Backups and derived stores follow lifecycle policy.
- Production data is prohibited in development, tests, demos, screenshots, support exports, and AI prompts unless an exceptional approved procedure applies.

## 9. Secrets

Secrets include credentials, signing material, private keys, service tokens, database strings, provider tokens, encryption keys, and sensitive webhooks.

- Secrets MUST be generated and stored in approved secret management.
- Secrets MUST NOT appear in Git, client bundles, environment examples, prompts, logs, error messages, analytics, issue trackers, or screenshots.
- Access is environment-specific and least-privilege.
- Rotation, revocation, expiry, and owner are defined.
- Preview and local environments MUST NOT use production credentials.
- Secret exposure triggers immediate revocation/rotation, evidence preservation, scope analysis, and incident review.
- Secret scanning does not authorize committing a secret temporarily.

## 10. Input, Output, and Browser Security

- Validate type, length, range, encoding, structure, and business meaning at trusted boundaries.
- Parameterize data access and prohibit user-controlled query or code construction.
- Encode or sanitize output for its exact HTML, URL, JSON, header, file, or log context.
- Unsafe HTML rendering is prohibited without a reviewed sanitization requirement.
- State-changing browser operations require CSRF protection appropriate to the session design.
- Cookies use appropriate secure, HTTP-only, same-site, domain, and expiry attributes.
- Redirect targets use an allowlist or safe internal resolution.
- Security headers and content policies are versioned application controls and tested in deployed environments.
- Sensitive responses MUST prevent shared or public caching.

## 11. File and Document Security

File handling MUST define:

- permitted type and verified content type;
- size and count limits;
- filename normalization and safe display;
- malware or content scanning appropriate to risk;
- private bucket and object ownership;
- upload, read, share, signed-URL, download, and deletion authorization;
- integrity digest and immutable versioning;
- quarantine and scan-failure behavior;
- retention and legal hold; and
- audit for sensitive access.

Paths and filenames are not authorization. Public buckets are prohibited unless content is intentionally public and independently reviewed.

## 12. API and Integration Security

- APIs default deny and expose the minimum fields and operations.
- Authentication, authorization, tenant scope, validation, rate limits, idempotency, replay, timeout, and error behavior are contract requirements.
- Webhook signatures include replay protection and verified destination ownership.
- Credentials are per organization/connection where possible and independently revocable.
- External payloads are untrusted and MUST NOT write owned domain state directly.
- Egress destinations and redirect behavior are controlled to reduce request forgery.
- Provider responses and logs are minimized and classified.
- Integration failure, repeated denial, secret rotation, mapping overrides, and replay are audited and monitored.

## 13. Abuse and Availability

- Rate, quota, size, concurrency, and cost limits are defined per actor and organization where applicable.
- Expensive search, export, upload, report, AI, and notification actions require abuse and cost controls.
- One organization's load MUST NOT cause uncontrolled denial for others.
- Retry storms, webhook loops, notification amplification, and job starvation require preventive bounds.
- Public forms and authentication flows require bot and brute-force controls proportionate to risk.
- Security controls SHOULD degrade safely without creating a bypass.

## 14. Dependency and Supply-Chain Security

- Dependencies require provenance, license, maintenance, vulnerability, transitive, build, and data-flow review.
- The committed lockfile and deterministic installation are mandatory.
- CI actions and build tools are dependencies and receive version and permission review.
- Build and CI permissions are least-privilege.
- Untrusted pull requests MUST NOT receive production secrets.
- Generated artifacts and releases MUST be traceable to source and immutable commit.
- Vulnerability findings are triaged by exploitability, reachability, exposure, and impact—not score alone.
- Unsupported runtimes and packages require upgrade or an approved time-bound containment plan.

## 15. Logging, Monitoring, and Audit

### 15.1 Logging

Security logs are structured, minimized, correlated, access-controlled, and retained according to purpose. Secrets and unnecessary protected data are prohibited.

### 15.2 Monitoring

Monitor at least:

- authentication failures and takeover indicators;
- authorization denial anomalies and cross-tenant attempts;
- platform grants, impersonation, break-glass, and service-role use;
- credential and integration changes;
- bulk access, export, document download, and sensitive location access;
- RLS, audit-writer, backup, archive, and restore failures;
- dependency, build, deployment, configuration, and secret changes; and
- data exfiltration, abuse, and unusual cost/volume patterns.

Alerts require severity, owner, runbook, safe evidence, and tested routing.

### 15.3 Audit

Accountable actions use the governed audit system, not ordinary logs. Audit events are append-only, tamper-evident, protected from tenant mutation, and retained by approved class. Detailed policy is in [Audit Strategy](../docs/05-Audit-Strategy.md).

## 16. Secure Development Lifecycle

Every material change follows:

1. security requirements and data classification;
2. threat and abuse modeling;
3. secure architecture and contract review;
4. implementation using approved boundaries;
5. static, dependency, secret, and targeted security testing;
6. negative authorization and tenant tests;
7. domain security review proportional to risk;
8. secure deployment and configuration verification;
9. post-release monitoring; and
10. remediation and learning.

Penetration testing, independent review, or specialist assessment is required before high-risk exposure or according to the security program.

## 17. AI Security

- Prompts, retrieved context, tool output, and model output are untrusted data.
- Customer, personal, secret, production, or restricted data MUST NOT enter an unapproved AI provider or model.
- Prompt injection MUST NOT override authorization, tool scope, or data policy.
- AI tools receive least-privilege, narrow context, and reversible capabilities.
- Generated code and advice require human review and normal security testing.
- Model output MUST NOT execute as code, SQL, configuration, or an external action without validation and explicit authorization.
- AI activity affecting protected resources requires attributable actor, purpose, result, and audit.
- Providers require data-use, retention, residency, model-training, security, and exit review.

## 18. Vulnerability Management

- Findings are recorded with asset, version, exposure, exploitability, impact, owner, containment, target date, and verification.
- Active exploitation, secret exposure, cross-tenant access, authentication bypass, remote execution, and data corruption receive immediate incident treatment.
- Remediation MUST address root cause and affected variants.
- Compensating controls are time-bound and monitored.
- Closure requires verification on the affected deployed revision.
- Security debt MUST NOT be hidden in general backlog without severity and ownership.

## 19. Incident Response

Security incidents require:

1. safe detection and triage;
2. named incident command and severity;
3. containment without destroying evidence;
4. credential and access revocation when indicated;
5. scope, organization, data, time-window, and cause analysis;
6. recovery and integrity verification;
7. legal, contractual, customer, and regulator communication decisions by qualified owners;
8. monitored return to service;
9. blameless root-cause review; and
10. owned preventive and detective actions.

Incident evidence and communications are restricted and retained deliberately. Public or customer statements MUST be accurate and approved.

## 20. Security Definition of Ready

Work is ready only when:

- assets, actors, organization boundaries, data classes, and purposes are known;
- authentication, authorization, permissions, abuse, and audit requirements are explicit;
- threats and residual risks are reviewed;
- secrets, providers, dependencies, data flows, and retention are approved;
- negative tests, monitoring, incident, and rollback behavior are planned; and
- required security and privacy owners approve.

## 21. Security Definition of Done

Work is done only when:

- default-deny and least-privilege behavior is verified at every boundary;
- cross-tenant, revoked, stale, malformed, replay, abuse, and privileged cases pass tests;
- secrets and protected data are absent from code, clients, logs, errors, analytics, prompts, and fixtures;
- threat controls, audit events, monitoring, alerts, and runbooks are active;
- dependency and deployment checks pass;
- residual risks and exceptions are approved and unexpired; and
- production verification shows the intended controls on the deployed commit.

## 22. Security Review Questions

1. What is protected, from whom, and with what consequence?
2. Which boundary authenticates, authorizes, validates, and audits the action?
3. Can an identifier, stale session, or role change expose another organization?
4. Where can secrets or sensitive data leak?
5. What can be replayed, amplified, uploaded, exported, or abused?
6. How will the team detect, contain, recover, and prove what happened?
7. Which human accepted the residual risk, until when, and why?
