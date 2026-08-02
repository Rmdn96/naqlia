# Naqlia Product Principles

| Document field   | Value                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Status           | Mandatory product policy                                                                        |
| Version          | 1.0.0                                                                                           |
| Parent authority | [Naqlia Constitution](./constitution.md)                                                        |
| Owner            | Product leadership                                                                              |
| Applies to       | Discovery, requirements, prioritization, design, delivery, measurement, support, and retirement |

## 1. Product Standard

Naqlia is a trusted Arabic-first logistics operating platform for Saudi Arabia. Product quality is measured by whether authorized users can complete important logistics work accurately, safely, and efficiently—not by the number of screens or features shipped.

Product decisions MUST preserve:

- customer trust and tenant isolation;
- clarity of responsibility and operational state;
- Arabic usability and English parity;
- predictable configuration and behavior;
- accessibility and mobile field usability;
- recoverability when users or systems make mistakes; and
- measurable customer and business outcomes.

## 2. Outcome Before Output

Every initiative MUST define:

1. target user or customer segment;
2. observed problem and supporting evidence;
3. present workaround and cost of inaction;
4. desired behavioral or operational outcome;
5. success and guardrail metrics;
6. scope and explicit non-goals;
7. accountable product owner; and
8. review date after release.

“Build a dashboard,” “add AI,” “create an integration,” or “match a competitor” is not a problem statement. Proposed output remains a hypothesis until discovery demonstrates why it is appropriate.

Roadmap placement communicates intent, not implementation authorization. Work becomes ready only after satisfying the Constitution's Definition of Ready.

## 3. User and Market Evidence

- Discovery SHOULD include direct observation or interviews with representative Saudi logistics users when feasible.
- Arabic-speaking users MUST be included for language-dependent or operationally critical journeys.
- Research MUST distinguish purchaser, administrator, dispatcher, driver, customer, finance, auditor, and platform-operator needs.
- One customer's workflow MUST NOT be generalized without testing whether the underlying problem is reusable.
- Assumptions MUST be recorded with confidence, risk, evidence source, and validation plan.
- Analytics and support reports MAY reveal patterns but MUST NOT replace qualitative context.
- Research data MUST follow consent, privacy, retention, and access controls.

## 4. Product Scope

### 4.1 Scope rules

A requirement MUST identify what changes and what remains unchanged. It MUST define affected roles, organizations, business units, states, data, notifications, integrations, and historical behavior.

Large initiatives SHOULD be sliced by complete user outcome rather than technical layer. A narrow usable journey is preferable to disconnected database, API, and UI phases that cannot be validated.

### 4.2 Non-goals

Every material requirement MUST state non-goals. Non-goals prevent accidental platform expansion and MUST be reviewed when acceptance criteria change.

### 4.3 Product exclusions

Features involving new regulated workflows, financial obligations, autonomous decisions, precise location tracking, cross-tenant collaboration, destructive retention, or legal claims require explicit discovery and specialist review before they can enter delivery.

## 5. Configuration Over Customization

Naqlia provides one governed product with supported configuration.

Configuration is appropriate when:

- the underlying problem and entities remain common;
- choices can be expressed as bounded, understandable options;
- every supported option can be secured, tested, documented, migrated, and supported;
- defaults serve the primary market; and
- combinations do not produce contradictory behavior.

Customization is rejected when it requires:

- customer-specific source branches or deployments;
- hidden conditionals keyed to customer identity;
- bypass of permissions, audit, retention, accessibility, or localization;
- arbitrary code, SQL, templates, or workflow execution;
- permanent manual operations with no owner; or
- an untestable configuration matrix.

Before adding a setting, the product owner MUST define its audience, default, range, inheritance, permission, audit need, migration behavior, support burden, and removal path.

## 6. Arabic-First Product Design

Arabic is the starting language for discovery, terminology, information architecture, prototypes, acceptance criteria, and release review.

- Core domain terms MUST have an approved Arabic term and canonical English counterpart.
- Requirements MUST use stable domain meanings rather than translated UI labels as identifiers.
- Arabic content MUST be natural, concise, and context-appropriate; literal translation is not acceptable evidence of quality.
- English MUST reach functional and content parity before the same release is complete.
- Mixed-direction values such as shipment codes, phone numbers, addresses, vehicle identifiers, and English brand names MUST be included in examples and tests.
- Numerals, dates, time, currency, calendar, and names MUST follow an approved locale policy rather than developer assumptions.
- Missing translations MUST fail quality gates rather than silently exposing keys or unrelated fallback text.

## 7. Mobile and Field Reality

Product requirements MUST consider field conditions: narrow screens, touch, interruption, glare, motion, gloves, slow or unstable connectivity, limited attention, and safety.

- Primary actions MUST remain clear and reachable without desktop-only interaction.
- Workflows SHOULD minimize typing, repeated entry, precision gestures, and unnecessary navigation.
- Users MUST understand whether an action is pending, saved, synchronized, failed, duplicated, or requires retry.
- Destructive and high-impact actions require deliberate confirmation proportional to consequence.
- The product MUST preserve entered work when recovery is safe.
- Offline behavior MUST NOT be implied. If offline execution is unsupported, the limitation and recovery path MUST be explicit.

## 8. Accessibility and Inclusion

Accessibility requirements begin in the product specification.

- A journey MUST be possible with keyboard and assistive technology where applicable.
- Meaning MUST NOT depend only on color, position, motion, or direction.
- Content MUST use clear headings, labels, instructions, error association, and reading order.
- Time limits, auto-refresh, animation, drag-and-drop, charts, maps, and dense operational tables require accessible alternatives or controls.
- User research SHOULD include people with relevant access needs.
- “Internal tool” and “small user group” are not accessibility exemptions.

## 9. Trust, Safety, and Permissions

- Requirements MUST state who can discover, view, create, change, approve, export, share, and delete each protected resource.
- Absence of a permission requirement means the work is not ready.
- Organization administrators are not platform administrators.
- Cross-organization access requires an explicit product model, owner consent, visible scope, revocation, and audit.
- Sensitive exports, precise location, documents, billing, identity, and privileged support access require purpose and abuse controls.
- Users MUST NOT receive false success, concealed partial failure, or misleading state.
- High-impact automated recommendations MUST communicate uncertainty and preserve accountable human control.

## 10. Information Architecture and Workflow

- Navigation and terminology MUST reflect user mental models and operational responsibilities.
- Each object MUST have one canonical identity and source of truth.
- Current status, responsible actor, last meaningful update, next action, and exception state SHOULD be discoverable for critical operational objects.
- Workflow states MUST be finite, named, permitted, and explainable.
- Transitions MUST identify actor, precondition, effect, failure, reversal, notification, and audit requirements.
- Bulk operations MUST expose selection scope, exclusions, partial results, and recovery.
- Search and filters MUST use user vocabulary and preserve organization scope.

## 11. State Design

Requirements MUST address all applicable states:

- first use and onboarding;
- loading and refresh;
- empty and no-result;
- incomplete and draft;
- validation failure;
- unauthenticated and unauthorized;
- conflict and stale data;
- dependency degradation and offline interruption;
- partial success;
- completed, cancelled, expired, archived, and deleted;
- recovery and support escalation.

Empty states MUST explain why they are empty and the permitted next action. Error states MUST be safe, localized, and actionable.

## 12. Metrics and Analytics

Each release MUST define:

- one primary outcome metric;
- guardrail metrics for trust, error, performance, support, and unintended behavior;
- event owner and stable definition;
- organization and role segmentation where lawful and useful;
- baseline and target or learning threshold;
- observation period; and
- decision rule for expand, revise, or retire.

Analytics collection MUST be minimized, documented, consented where required, and prohibited from carrying secrets or unnecessary personal and operational data. A metric MUST NOT incentivize behavior that reduces user trust or data quality.

## 13. Experiments and Feature Control

- Experiments require a hypothesis, eligible audience, allocation rule, duration, success threshold, guardrails, and stop condition.
- Assignment MUST be stable and auditable when outcomes matter.
- Security, accessibility, localization, privacy, and tenant-isolation controls are never experimental variants.
- Feature flags require an owner, purpose, default, audience, expiry or permanence decision, and cleanup plan.
- A disabled feature MUST fail safely and MUST NOT leave orphaned data or inaccessible critical history.

## 14. Notifications and Communication

- A notification MUST have a clear user purpose and owning domain event.
- Channel, urgency, audience, locale, quiet-time, retry, and opt-out behavior MUST be explicit.
- Notifications MUST avoid leaking sensitive data on lock screens, email subjects, or third-party channels.
- Delivery does not prove comprehension or completion.
- Repeated alerts MUST be prioritized and grouped to prevent alarm fatigue.
- Arabic and English templates are versioned product content and require review.

## 15. AI Product Capabilities

AI is introduced only when it improves a validated outcome better than a deterministic alternative.

An AI capability requires:

- defined user benefit and non-AI baseline;
- approved data sources, purpose, residency, and retention;
- evaluation set representing Arabic, English, domain vocabulary, and failure cases;
- accuracy, latency, cost, bias, safety, and fallback thresholds;
- clear disclosure of limitations and uncertainty;
- human review for material operational decisions;
- monitoring for drift and harmful output;
- provider and model exit strategy; and
- explicit prohibition on training or reuse of customer data unless contractually approved.

Generated content MUST NOT be presented as verified operational fact without validation.

## 16. Public Content and SEO

Public content MUST serve a real audience and search intent, not exist only to attract traffic. Product owners MUST define page purpose, owner, locale, canonical relationship, structured-data eligibility, update cadence, and conversion or information outcome.

Authenticated, tenant, operational, support, preview, and private content MUST remain outside search indexes. Detailed rules are in [SEO Principles](./seo-principles.md).

## 17. Lifecycle and Retirement

Every capability requires an ownership lifecycle:

1. discover;
2. define;
3. deliver;
4. release and observe;
5. operate and improve;
6. deprecate; and
7. retire and verify.

Deprecation MUST identify affected users, data, integrations, alternatives, timeline, communication, migration, support, metrics, and final removal. Product retirement MUST preserve required records and audit evidence.

## 18. Product Definition of Ready

In addition to the Constitution, product work is ready only when:

- evidence and current workflow are available;
- the named user and operational context are specific;
- domain terminology is agreed in Arabic and English;
- success and guardrail metrics have stable definitions;
- permissions, tenant visibility, data purpose, retention, and audit are explicit;
- primary mobile journey and every material state are designed;
- configuration choices and defaults are bounded;
- support and operational impacts are understood; and
- product, engineering, design, security, and data owners have resolved material conflicts.

## 19. Product Definition of Done

Product work is done only when:

- the released experience meets acceptance criteria in Arabic and English;
- authorized users can complete the intended journey across supported viewports and input methods;
- analytics and guardrails are verified without collecting prohibited data;
- help, support, release, configuration, and terminology documentation is current;
- rollout and customer communication are complete where required;
- observed production behavior matches the release claim; and
- the owner has scheduled the outcome review.

## 20. Product Review Questions

1. What user behavior or operational outcome will change?
2. What evidence shows this is the right problem now?
3. How does this work for Arabic-speaking users first?
4. What is the smallest complete, measurable release?
5. Is this a coherent configuration or a customer-specific fork?
6. Who can access and act on the data, and why?
7. What can go wrong, and how does the user recover?
8. What does success, harm, and retirement look like?
