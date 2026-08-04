# Naqlk Pricing Strategy

| Document field | Value                                                                              |
| -------------- | ---------------------------------------------------------------------------------- |
| Suite          | Product Documentation Suite (PDS) v1                                               |
| Status         | Approved strategy; commercial values require release configuration                 |
| Version        | 1.0.0                                                                              |
| Parent         | [Business Requirements Specification](./01-Business-Requirements-Specification.md) |
| Owners         | Product, Sales, and Finance                                                        |

## 1. Purpose

This document defines how Naqlk prices MVP services without inventing commercial values. It establishes the hybrid quotation model, configurable price structure, decision rights, customer transparency, versioning, and controls needed for later implementation.

It contains no price, tax rate, fee, discount, threshold, duration, or validity value. Those values MUST be approved, localized where applicable, versioned, and published through the Admin Panel before release.

## 2. Approved Model

Naqlk uses a **hybrid quotation model**:

1. configured rules and Sales-entered facts MAY produce an internal estimate or price guidance;
2. Sales validates eligibility, service scope, route, cargo, access, add-ons, assumptions, and calculation inputs;
3. required financial or policy approvals are completed;
4. a named Sales representative reviews the complete customer-bound version; and
5. only then may the final Quotation be sent to the customer.

An automated estimate is never a final Quotation, customer commitment, Order, invoice, or guarantee of capacity. Mandatory Sales review cannot be disabled by business configuration.

## 3. Pricing Objectives

- Produce consistent, explainable, and governable Quotations.
- Give Sales controlled flexibility for incomplete or exceptional transport needs.
- Make included services, optional services, assumptions, exclusions, currency, tax treatment, and total clear to customers.
- Preserve the exact commercial basis accepted by the customer.
- Prevent hidden fees, uncontrolled discounting, silent rule changes, and historical repricing.
- Support Arabic and English presentation without changing numeric meaning.
- Enable later analysis of margin and conversion without conflating estimate, quoted, accepted, ordered, and completed amounts.

## 4. Pricing Dimensions

The pricing engine/domain MUST support configurable factors where approved; not every factor must be enabled at launch.

| Dimension             | Examples of configurable facts                                           | Governance notes                                           |
| --------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------- |
| Cargo Service         | Furniture Moving; General Cargo Transport                                | Exactly one per MVP request; versioned catalog reference   |
| Route Class           | Local Transport; Intercity Transport                                     | Derived/validated from enabled coverage rules              |
| Origin/destination    | Zone, city, route band, configured distance basis                        | No hardcoded city/zone price logic                         |
| Cargo characteristics | Category, quantity, size/volume, weight, fragility, handling constraint  | Definitions and units are configured and localized         |
| Vehicle/capacity      | Approved vehicle or capacity class                                       | Availability and price are separate facts                  |
| Labor                 | Crew/handling requirement and configured unit basis                      | Loading/unloading add-on relationship must be explicit     |
| Packing               | Materials, labor, scope, configured unit basis                           | Optional add-on; cannot stand alone                        |
| Access conditions     | Floor, elevator, stairs, carrying distance, parking/access restriction   | Customer-visible assumptions required when priced          |
| Timing                | Requested date/window, lead-time category, enabled peak/after-hours rule | No unpublished or retroactive surcharge                    |
| Stops and waiting     | Additional enabled stop/wait rule and unit                               | Measurement and cap rules must be explicit                 |
| Adjustment            | Discount, surcharge, manual adjustment, or waiver                        | Reason, authority, limits, and approval required           |
| Tax and currency      | Published currency and tax category/treatment                            | Release prerequisite; display and rounding policy required |

Sensitive inference, customer identity, authentication method, language, disability, nationality, neighborhood proxies unrelated to service cost, or opaque behavioral scoring MUST NOT influence price.

## 5. Price Composition

A Quotation version MUST be reconstructable from explicit components:

```text
service and route components
+ enabled add-on components
+ approved access/timing/handling components
+ authorized transparent adjustments
= subtotal
+ configured tax treatment
= final total
```

This expression describes composition, not a required calculation algorithm. Each line item MUST carry:

- stable category and localized customer label;
- quantity and unit when meaningful;
- unit amount or fixed amount as applicable;
- signed adjustment semantics;
- tax treatment/reference as applicable;
- calculation or manual origin;
- pricing rule/configuration version;
- Sales-entered assumption/evidence when required; and
- customer visibility classification.

Customer-visible totals MUST reconcile exactly with customer-visible components under the published rounding policy. Internal cost, margin, threshold, and approval data MUST not leak into customer output.

## 6. Pricing Workflow

| Stage                      | Owner                          | Required output                                                                  |
| -------------------------- | ------------------------------ | -------------------------------------------------------------------------------- |
| Qualification              | Sales                          | Eligible service/route, sufficient cargo/access/timing details, uncertainty list |
| Calculation                | Platform / Sales               | Internal estimate with factor provenance and warnings                            |
| Commercial preparation     | Sales                          | Complete line items, assumptions, inclusions, exclusions, terms, validity        |
| Exception/threshold review | Finance or configured approver | Approval, rejection, or return with reason and authority evidence                |
| Final review               | Named Sales representative     | Review event for exact version; unresolved warning blocks send                   |
| Issue                      | Sales                          | Immutable bilingual/customer-locale Quotation version and delivery evidence      |
| Customer decision          | Customer                       | Verified accept/reject against exact current version                             |
| Conversion                 | Platform                       | Order commercial snapshot and lineage to accepted version                        |

The preparer and final Sales reviewer MAY be the same person only if the approved policy permits; this never removes an independent Finance approval required by threshold.

## 7. Manual Adjustments

A manual adjustment MUST include category, signed value or governed method, customer-visible treatment, reason code, free-text rationale where required, requester, delegated-authority evaluation, approver(s), timestamp, and evidence reference.

The platform MUST:

- reject adjustments outside the actor's authority or enabled policy;
- prevent an adjustment from disguising a missing configured charge or tax;
- show the customer an adjustment when transparency policy requires;
- make removal/replacement create a new draft/version as applicable;
- distinguish discount, waiver, surcharge, and correction in reporting; and
- monitor repeated, unusual, split, or threshold-avoidance adjustments.

No generic unrestricted amount override is permitted.

## 8. Approval Strategy

Finance and Product MUST publish an approval matrix before commercial release. It may consider adjustment category/size, total, margin/cost condition, exception type, route/service, user delegation, and risk. The matrix MUST define:

- approval levels and delegated limits;
- whether dual approval is required;
- self-approval prohibitions;
- expiry when inputs or versions change;
- escalation and unavailable-approver behavior;
- emergency exception policy; and
- reporting and periodic review.

Changing any price-affecting input invalidates approvals whose decision basis changed. Splitting changes or Quotations to evade a threshold is prohibited.

## 9. Quotation Content

Every final Quotation MUST communicate, in the customer's selected supported language:

- Quotation identifier and immutable version;
- issue and expiry/validity information with unambiguous timezone context;
- customer and service reference sufficient to understand the offer;
- Cargo Service, Route Class, origin/destination summary, and selected add-ons;
- included scope and customer responsibilities;
- priced line items, subtotal, transparent adjustments, tax treatment, currency, and final total;
- material assumptions and exclusions;
- schedule/availability qualification where applicable;
- terms, cancellation/amendment references, and acceptance method;
- support/contact guidance; and
- statement that the issued version was reviewed by Naqlk Sales.

Arabic and English versions of the same Quotation MUST represent identical commercial facts. Translation changes must never recalculate amounts.

## 10. Versioning, Validity, and Requotation

- Drafts may change while preserving meaningful author history.
- Sending freezes the complete version; it is never edited in place.
- A material change creates a new version and supersedes the prior version when issued.
- Validity is calculated from the published policy captured on the version, not the current policy.
- An expired, rejected, cancelled, or superseded version cannot be accepted.
- Requotation repeats applicable calculation, approval, Sales review, delivery, and customer decision gates.
- The customer MUST be told clearly which version is current and why a new review/acceptance is needed.

## 11. Post-Acceptance Changes

The accepted version and converted Order snapshot are historical facts. A material scope, route, add-on, price, tax, or terms change requires the approved amendment/requotation process and customer acceptance before it takes effect. A scheduling change with no commercial impact uses schedule revision, not repricing.

Cancellation and any associated commercial effect require a published cancellation policy, reason, authority, customer communication, and preserved calculation. PDS v1 does not define cancellation charges.

## 12. Configuration Model

Pricing configuration is versioned, effective-dated, bilingual where customer-visible, environment-aware, and auditable. Categories include:

- currency, monetary precision, display, and rounding;
- tax categories, treatment, evidence, and effective dates;
- service/route base components;
- coverage/route bands and geographic eligibility references;
- cargo, capacity, access, labor, packing, timing, stop, and waiting factors;
- adjustment types, bounds, reasons, and customer visibility;
- approval thresholds, delegation, and segregation rules;
- Quotation validity and expiry behavior;
- customer labels, descriptions, assumptions, exclusions, and terms references; and
- rollout, rollback, and emergency controls.

Publication MUST reject overlapping/ambiguous effective versions, invalid ranges, missing translations, inconsistent units, unreachable approval paths, non-reconciling amounts, and incomplete tax/currency rules. Preview and test cases are mandatory before publication.

## 13. Commercial Release Decisions

The following MUST be approved and configured before the first customer Quotation can be sent:

1. operating currency and display/rounding policy;
2. tax applicability, categories, rates, rounding, and customer language;
3. price components and values for every enabled service/route combination;
4. enabled factor units, limits, and precedence;
5. manual adjustment categories and delegated authority;
6. approval matrix and escalation;
7. Quotation validity policy and timezone;
8. cancellation/amendment commercial policy;
9. terms, assumptions, exclusions, and customer-facing templates; and
10. ownership, monitoring, review frequency, and emergency rollback.

An incomplete decision blocks quotation release; the application MUST NOT invent a default.

## 14. Pricing Controls and Audit

Required evidence includes input facts, rule/config version, intermediate/output components, manual changes, approval requests/decisions, Sales review, issue/delivery, customer decision, conversion snapshot, and post-acceptance amendments. Secrets and unnecessary personal data MUST not appear in pricing traces.

Pricing changes require impact preview against approved non-production scenarios. Historical Quotations and Orders MUST never be silently recalculated when configuration changes.

## 15. Pricing Metrics

Definitions MUST distinguish internal estimate, draft amount, sent amount, accepted amount, converted Order amount, amended amount, cancelled amount, and completed commercial outcome. Recommended measures include:

- estimate-to-sent variance and reason;
- preparation and approval time;
- revision, expiry, acceptance, and conversion rates;
- manual adjustment frequency/value by authorized reason;
- approval threshold distribution and rejection/return rate;
- rule/configuration utilization and exception frequency; and
- post-acceptance amendment and cancellation impact.

Margin or profitability reporting requires an independently approved cost model; it MUST NOT infer cost from price.

## 16. MVP Exclusions

PDS v1 does not include public instant pricing, automatic final quotation, auctions/dynamic surge pricing, subscriptions, coupons, marketplace bidding, online payment, invoicing, refunds, settlement, credit, or customer-negotiated self-service price changes. Any such capability requires product discovery, architecture/security review, and a versioned PDS update.
