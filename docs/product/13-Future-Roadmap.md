# Naqlia Future Roadmap

| Document field | Value                                                                              |
| -------------- | ---------------------------------------------------------------------------------- |
| Suite          | Product Documentation Suite (PDS) v1                                               |
| Status         | Directional; only MVP scope is approved                                            |
| Version        | 1.0.0                                                                              |
| Parent         | [Business Requirements Specification](./01-Business-Requirements-Specification.md) |
| Owners         | Product and Engineering leadership                                                 |

## 1. Purpose

This roadmap describes outcome-based evolution after the approved Product Documentation Suite. It deliberately avoids promised dates and feature commitments. Every future item remains discovery until evidence, governance, architecture, operating readiness, and an approved scope change promote it.

The roadmap MUST NOT be interpreted as authorization to create features, schema, APIs, integrations, vendor commitments, or production access.

## 2. Roadmap Principles

- Complete and stabilize the approved end-to-end customer outcome before broadening geography or capability.
- Prioritize evidence-backed customer and operational problems, not feature volume.
- Use reversible experiments and configuration where appropriate, but never configure away security, audit, accessibility, lifecycle, or mandatory Sales-review invariants.
- Preserve modular-monolith and feature-domain boundaries until measured scale or ownership justifies extraction.
- Treat Arabic/English parity, accessibility, privacy, security, operations, data quality, and support as scope in every phase.
- Introduce AI as assistive, observable, privacy-safe capability; customer-impacting decisions retain human accountability.
- Assign owner, metric, target, guardrail, dependency, migration, sunset, and stop condition before investment.

## 3. Stage 0 — Product and Architecture Readiness

**Outcome:** PDS v1 and implementation designs form an approved, traceable baseline.

| Workstream   | Required result                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| Product      | PDS v1 approved; open commercial/legal/operating decisions owned                                            |
| Experience   | Arabic/RTL and English/LTR journeys, content, accessibility, and all states approved                        |
| Architecture | Physical data/API/security/observability/deployment designs approved without violating logical architecture |
| Operations   | Service catalog, coverage, restrictions, pricing, support, lifecycle, and escalation ready                  |
| Delivery     | Thin slices, test strategy, environments, release/rollback, and pilot governance ready                      |

**Exit gate:** Constitution Definition of Ready is satisfied for the first vertical slice. PDS approval alone does not satisfy this gate.

## 4. Stage 1 — MVP Build and Internal Validation

**Outcome:** Authorized Naqlia staff can operate the full configured lifecycle in production-like environments, and customers can complete the approved bilingual journey safely.

The build follows the thin slices in [MVP Scope](./12-MVP-Scope.md): governed catalog/access, guest request/Lead, human-reviewed Quotation, Order/Execution, tracking/support, and hardening.

**Exit gate:** All linked functional/non-functional acceptance evidence passes; no critical/high release blocker remains; configuration, runbooks, recovery, and support are ready; end-to-end rehearsal succeeds.

## 5. Stage 2 — Controlled Riyadh Pilot and MVP Release

**Outcome:** The complete MVP delivers safe, measurable transport outcomes for a controlled live population within approved geography and catalog.

Focus areas:

- validate request clarity, qualification quality, Sales workload, price consistency, and conversion;
- validate scheduling handoffs, execution exception handling, completion, tracking, and support;
- validate Arabic-first usability, English parity, accessibility, performance, communication, and trust;
- observe security, privacy, abuse, authorization, audit, configuration, and recovery controls; and
- compare operational capacity with demand before increasing exposure.

**Exit gate:** Pilot targets and guardrails are met for the approved observation window; accountable owners accept ongoing operations; stop/go review authorizes general MVP release or remediation.

## 6. Stage 3 — Operational Maturity and Geographic Expansion

**Outcome:** Naqlia increases service reach and operational throughput without reducing reliability or control.

Candidates, subject to discovery:

- additional Riyadh coverage and Riyadh-origin destination cities;
- inbound routes to Riyadh or routes originating in other approved Saudi cities;
- richer capacity/resource planning, scheduling assistance, and dispatch visibility;
- controlled customer rescheduling and amendment requests;
- enhanced communications, service recovery, feedback, and complaint handling;
- operational evidence and proof-of-delivery workflows;
- additional approved cargo/add-on categories; and
- improved catalog/price simulation, forecasting, reporting, and data quality.

**Promotion evidence:** repeated MVP demand, viable unit economics, capacity/safety/legal readiness, support and exception data, architecture headroom, and measurable customer outcome.

**Exit gate:** Each expansion operates through the same lifecycle, permission, audit, localization, and release controls and meets its configured pilot thresholds.

## 7. Stage 4 — Digital Commerce and Ecosystem Integration

**Outcome:** Approved customers and Naqlia teams complete more commercial and partner workflows digitally with reconciled records and controlled financial risk.

Candidates, subject to separate legal/finance/security architecture:

- online payment, invoicing, refunds, settlement, tax evidence, and accounting integration;
- business/customer accounts, delegated customer users, credit terms, and contracted pricing;
- CRM/ERP/contact-center integration;
- partner APIs, webhooks, EDI, and event subscriptions;
- carrier/partner onboarding and controlled fulfillment collaboration;
- richer notification channels and preference management; and
- configurable service-level commitments and exception compensation.

**Promotion evidence:** sufficient transaction volume and customer demand; approved regulatory/payment/tax model; reconciliation and fraud controls; vendor resilience/exit plan; support and dispute capability.

**Exit gate:** financial correctness, security/privacy, reconciliation, disputes, recovery, and operational ownership pass independent review.

## 8. Stage 5 — Multi-Tenant SaaS Platform

**Outcome:** Qualified logistics companies can operate isolated workspaces on Naqlia with governed configuration and platform-level administration.

Candidates, subject to a dedicated SaaS business case:

- tenant provisioning and lifecycle;
- tenant-scoped users, roles, configuration, branding, catalog, pricing, domains, and data residency policy;
- subscription plans, entitlements, metering, billing, suspension, and offboarding;
- tenant administration and support delegation;
- tenant-aware integrations, analytics, exports, backup/restore, and service objectives;
- platform operations, abuse management, quota/capacity, noisy-neighbor controls, and regional expansion; and
- tenant migration, portability, legal hold, deletion, and exit.

The existing tenant-capable architecture is a design constraint, not proof that the SaaS operating model is ready.

**Promotion evidence:** validated logistics-company demand and willingness to pay; support/onboarding economics; tenant isolation proof; billing/legal model; platform operating capability; migration and exit design.

**Exit gate:** independent tenant-isolation and security evidence, full tenant lifecycle rehearsal, scalable support and billing operations, and approved commercial launch plan.

## 9. Stage 6 — Intelligence and Network Optimization

**Outcome:** Data and AI improve staff decisions and network performance while humans remain accountable for consequential outcomes.

Candidates, subject to data maturity and AI governance:

- assistive request classification and missing-information prompts;
- Sales quotation guidance with explanation and confidence;
- capacity, demand, exception, and service-quality forecasting;
- routing/scheduling recommendations with Operations approval;
- customer-service summarization and response drafting;
- anomaly, abuse, access, commercial, and data-quality detection; and
- privacy-safe network performance insights.

AI MUST NOT autonomously issue final Quotations, approve exceptions, reject customers, expose tracking data, alter Orders, assign legal/compliance outcomes, or make an irreversible customer-impacting decision without separately approved controls.

**Promotion evidence:** lawful and representative data, baseline quality, measurable staff/customer benefit, explainability, human override, bias/safety/privacy testing, monitoring, incident response, vendor/model exit, and acceptable failure mode.

**Exit gate:** staged evaluation meets outcome and safety guardrails, human accountability is effective, and rollback/disable works without breaking the core service.

## 10. Cross-Cutting Capability Evolution

| Capability    | MVP baseline                                                | Directional evolution trigger                                                                        |
| ------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Architecture  | Modular monolith, feature-based boundaries                  | Extract only for measured scale, independent ownership/deployability, resilience, or regulatory need |
| Data          | Operational PostgreSQL source with governed audit/reporting | Warehouse/streaming/search only when named use cases and data governance justify it                  |
| Geography     | Riyadh local and Riyadh-origin enabled destinations         | Demand, licensing, operational capacity, pricing, support, and safety evidence                       |
| Identity      | Guest plus customer and workforce identities                | Business accounts, delegation, federation, and tenant administration after threat/legal design       |
| Commercial    | Human-reviewed hybrid Quotation                             | Payments/contracts/automation only with Finance/legal/reconciliation maturity                        |
| Tracking      | Status by Order Number + Mobile Number                      | Live location only with consent, safety, retention, precision, device, and abuse controls            |
| Integrations  | Internal boundaries only                                    | Stable contracts and external integrations after ownership, versioning, security, and exit plan      |
| Observability | Service, business, audit, and security signals              | Advanced analytics/AIOps only with privacy and accountable response                                  |
| AI            | Development assistance under Constitution                   | Product AI only after data and responsible-AI readiness                                              |

## 11. Discovery Backlog

Every candidate starts with a discovery record containing:

- problem, affected actor, evidence, frequency, and current workaround;
- desired measurable outcome and guardrails;
- alternatives including process/configuration/no-build;
- market, legal, safety, privacy, security, accessibility, localization, SEO, and operational assessment;
- architecture/data/integration/dependency impact;
- commercial model and total ownership cost;
- experiment and decision thresholds;
- migration, backward compatibility, rollout, rollback, and sunset; and
- accountable Product and domain owners.

A feature request without this evidence remains backlog input, not roadmap commitment.

## 12. Prioritization Method

Product SHOULD prioritize using a documented comparison of:

- strategic/customer outcome contribution;
- evidence strength and reach;
- safety, compliance, trust, and operational risk reduction;
- economic impact and cost to serve;
- urgency and cost of delay;
- engineering/operational complexity and reversibility;
- dependency and migration risk;
- accessibility and Arabic/English impact; and
- opportunity cost, maintenance burden, and technical debt.

Scores inform discussion; they do not replace accountable judgment. Mandatory security, legal, accessibility, or reliability remediation may take precedence over feature scoring.

## 13. Technical Debt and Platform Investment

Each stage reserves explicit capacity for security patches, dependency health, accessibility, performance, observability, tests, data quality, runbooks, documentation, migration, and removal of expired flags/configuration. Debt with customer, security, compliance, financial, data-integrity, or operational risk receives an owner and deadline before discretionary expansion.

Temporary architecture exceptions MUST follow the Constitution exception process and cannot become a hidden prerequisite for the next stage.

## 14. Roadmap Governance

The roadmap is reviewed at defined planning intervals and whenever pilot evidence, incident, regulation, market change, dependency/vendor risk, or architecture capacity materially changes assumptions. Each update records:

- promoted, deferred, changed, or retired candidates and rationale;
- evidence and metrics considered;
- new dependencies, risks, debt, and operating costs;
- affected PDS/architecture/constitution decisions; and
- accountable approvers and communication to delivery/operations teams.

Dates, budgets, capacity, and commercial targets belong in governed planning artifacts, not hardcoded application configuration or this directional roadmap.

## 15. Promotion Gate

A future candidate enters delivery scope only after:

1. discovery evidence supports the problem and outcome;
2. Product approves a versioned PDS scope change with traceable requirements and criteria;
3. Constitution Definition of Ready and applicable architecture/security/data/UX/legal reviews pass;
4. operational ownership, support, configuration, metrics, rollout, rollback, and sunset are defined; and
5. delivery capacity is explicitly authorized.

Until all five conditions are met, the candidate remains non-binding future direction.
