# Naqlk Service Catalog

| Document field | Value                                                                              |
| -------------- | ---------------------------------------------------------------------------------- |
| Suite          | Product Documentation Suite (PDS) v1                                               |
| Status         | Approved catalog baseline                                                          |
| Version        | 1.0.0                                                                              |
| Parent         | [Business Requirements Specification](./01-Business-Requirements-Specification.md) |
| Owners         | Product, Sales, and Operations                                                     |

## 1. Purpose

This document defines the MVP service taxonomy, combinations, eligibility, qualification information, optional services, catalog governance, and operational handoff. It establishes meaning without defining pages, APIs, database structures, prices, or a fixed list of enabled cities/zones.

## 2. Catalog Model

The approved four Core Services describe two independent dimensions of one transport request:

| Dimension     | Core Service values                       | Meaning                                      |
| ------------- | ----------------------------------------- | -------------------------------------------- |
| Cargo Service | Furniture Moving; General Cargo Transport | What kind of transport need Naqlk is serving |
| Route Class   | Local Transport; Intercity Transport      | Where the transport movement occurs          |

Every MVP request MUST select exactly one Cargo Service and exactly one Route Class. This prevents ambiguous records such as “Local Transport” with no cargo context or “Furniture Moving” with no route context.

Customer content MAY introduce the four Core Services separately for discovery, but qualification and quotation always resolve them into a complete Cargo Service + Route Class combination.

## 3. MVP Service Matrix

| Service offer                     | Cargo Service           | Route Class         | MVP eligibility summary                                                                    |
| --------------------------------- | ----------------------- | ------------------- | ------------------------------------------------------------------------------------------ |
| Local Furniture Moving            | Furniture Moving        | Local Transport     | Origin and destination within enabled Riyadh coverage                                      |
| Intercity Furniture Moving        | Furniture Moving        | Intercity Transport | Origin within enabled Riyadh coverage; destination in an enabled Saudi city outside Riyadh |
| Local General Cargo Transport     | General Cargo Transport | Local Transport     | Origin and destination within enabled Riyadh coverage                                      |
| Intercity General Cargo Transport | General Cargo Transport | Intercity Transport | Origin within enabled Riyadh coverage; destination in an enabled Saudi city outside Riyadh |

The matrix does not guarantee availability for a particular date, cargo, address, or destination. Sales confirms service fit and Operations feasibility before the final Quotation is sent.

## 4. Geography and Route Classification

### 4.1 Local Transport

Local Transport requires both endpoints to resolve inside the currently enabled Riyadh service coverage. Coverage MAY be expressed through governed zones, boundaries, postal/location references, or another approved geographic model. The model MUST be deterministic, versioned, explainable to staff, and safe when an address cannot be confidently resolved.

### 4.2 Intercity Transport

MVP Intercity Transport requires:

- origin within enabled Riyadh coverage;
- destination in the Kingdom of Saudi Arabia;
- destination outside the Local Transport boundary; and
- destination city/area enabled in the effective catalog configuration.

Inbound journeys to Riyadh, journeys between two non-Riyadh cities, and international journeys are outside MVP unless a later approved catalog version includes them.

### 4.3 Ambiguous or Unsupported Route

The platform MUST NOT guess Route Class. An unresolvable, boundary, unsupported, or conflicting route is blocked from final quotation until Sales resolves it under an approved rule. Customer-facing guidance must not claim coverage that has not been published.

## 5. Cargo Services

### 5.1 Furniture Moving

Furniture Moving covers the transport of eligible household, office, or comparable furniture under the accepted service scope. Qualification MUST capture enough information to determine handling, capacity, access, optional packing/loading needs, exclusions, and operational feasibility.

Minimum qualification categories:

- move context and item inventory/detail appropriate to the configured process;
- quantity, estimated dimensions/volume, weight where relevant, and fragile/special items;
- origin and destination access, floor, elevator, stairs, carrying/parking constraints;
- preferred service timing and flexibility;
- Packing selection and required scope;
- Loading & Unloading selection and required scope;
- assembly/disassembly or another requested activity, clearly identified as unsupported unless enabled by an approved future service; and
- customer instructions and disclosed risks.

Furniture Moving does not implicitly include Packing or Loading & Unloading. Inclusion is determined by the issued Quotation line items and scope.

### 5.2 General Cargo Transport

General Cargo Transport covers eligible non-furniture goods whose nature, dimensions, weight, packaging, route, access, and handling can be safely served under published policy.

Minimum qualification categories:

- cargo description and category;
- quantity/package count;
- dimensions/volume and weight using approved units where required;
- packaging state and handling/loading requirements;
- fragility, stackability, orientation, and environmental constraints where applicable;
- origin/destination access and equipment constraints;
- preferred service timing and flexibility;
- declared value or documentation only if later policy specifically requires it; and
- confirmation that prohibited/restricted cargo rules are understood.

The label “General Cargo” MUST NOT be interpreted as accepting every item. Unknown cargo requires review and cannot be priced or scheduled as ordinary cargo by default.

## 6. Optional Services

### 6.1 Packing

Packing is an add-on to an eligible Furniture Moving or General Cargo request. Its scope MUST specify applicable items, material/labor basis, customer preparation duties, exclusions, timing, completion expectation, and price line items. It cannot be ordered as a standalone service in MVP.

### 6.2 Loading & Unloading

Loading & Unloading is an add-on to an eligible transport request. The issued scope MUST distinguish loading, unloading, or both; location(s); labor/equipment assumptions; access conditions; customer duties; exclusions; and price line items. It cannot be ordered as a standalone service in MVP.

### 6.3 Add-on Rules

- Add-on availability MAY vary by Cargo Service, Route Class, coverage, cargo, access, schedule, or capacity under effective configuration.
- An unavailable add-on MUST not remain selectable or silently be removed after request submission.
- Sales MUST confirm the final scope, and Operations MUST receive the accepted add-on snapshot.
- Adding, removing, or materially changing an add-on after Quotation issue creates a new Quotation version; after Order creation it follows amendment policy.

## 7. Prohibited and Restricted Requests

Before release, Product, Legal/Safety, Sales, and Operations MUST approve configurable prohibited/restricted categories and handling guidance. The catalog MUST support at least these policy classes without implying their acceptance:

- illegal, stolen, or unlawfully transported goods;
- hazardous, explosive, flammable, toxic, radioactive, or otherwise regulated material;
- weapons or controlled items;
- living persons or animals;
- perishable, temperature-controlled, medical, pharmaceutical, or biological goods;
- cash, high-value negotiable items, sensitive documents, or exceptional-value property;
- oversized, overweight, unusually fragile, or equipment-dependent cargo;
- waste or contaminated goods; and
- any item, route, access condition, or activity outside current licensing, insurance, safety, capacity, or operating policy.

This list is a policy capability baseline, not a legal classification or permission to serve any listed category. If policy is absent or cargo cannot be classified safely, the request MUST be held for qualified review and MUST NOT receive a final Quotation.

## 8. Service Eligibility Decision

Eligibility evaluates the effective configuration captured for the request:

1. Cargo Service and Route Class form an enabled combination.
2. Origin and destination satisfy the applicable coverage rule.
3. Cargo is known and not prohibited; restricted cargo has all required approvals.
4. Requested add-ons are enabled for the combination.
5. Required cargo, access, timing, and contact facts are sufficiently complete.
6. Capacity/operational feasibility can be confirmed.
7. Required legal, safety, insurance, and commercial policies are effective.

Failure produces a structured internal reason and a customer-safe localized outcome. Qualification MAY be resumed after missing facts are corrected, but historical decisions remain visible.

## 9. Catalog Entry Contract

Every service, route class, add-on, coverage unit, restriction, and customer option MUST define:

- stable identifier not derived from translated text;
- Arabic and English name, short description, detailed guidance, and customer-safe exclusions;
- status such as draft, scheduled, active, suspended, or retired;
- effective start/end and applicable operating scope;
- permitted Cargo Service/Route Class/add-on relationships;
- required and conditional qualification information;
- validation/eligibility rules and customer-safe error content;
- Sales/Operations preparation guidance;
- pricing component references, not embedded source-code values;
- terms/policy references;
- analytics/reporting classification;
- owner, reviewer, publisher, version, and change reason; and
- rollback/fallback behavior.

Names and descriptions are content. Identifiers and business meaning remain stable across locale changes.

## 10. Catalog Configuration and Publication

Catalog values are managed through the governed Admin Panel. Draft, review, approval, preview, scheduled publication, activation, suspension, retirement, and rollback are distinct actions.

Publication MUST validate:

- required Arabic and English content and direction-safe rendering;
- no ambiguous or overlapping geographic classification;
- every enabled request path has qualification, pricing, terms, and operational handling;
- no add-on is enabled without a parent service combination;
- restrictions and customer-safe guidance are complete;
- all references resolve to compatible effective versions;
- active Quotations/Orders have defined behavior when an entry changes; and
- permission, audit, monitoring, and rollback controls are available.

Suspending or retiring an entry affects new eligibility from the effective time. It MUST NOT rewrite historical requests, Quotations, Orders, reports, or audit evidence.

## 11. Customer Presentation Rules

- Default to Arabic with complete English parity.
- Explain services using plain customer language while retaining stable internal classification.
- State that final price and availability follow Sales review.
- Distinguish included service from optional Packing and Loading & Unloading.
- Present coverage honestly; do not imply all of Riyadh or all Saudi cities unless effective configuration does.
- Provide accessible help for units, cargo categories, route classification, access questions, and restrictions.
- Never display internal risk classifications, cost/margin, staff instructions, approval rules, or prohibited-security details.

## 12. Operational Handoff

An approved Order's service snapshot MUST give Operations an unambiguous delivery contract:

- Cargo Service and Route Class;
- origin/destination and access details;
- cargo inventory/characteristics and disclosed handling constraints;
- selected add-ons and item/location scope;
- agreed schedule constraints and customer preparation duties;
- accepted inclusions, exclusions, assumptions, and terms reference;
- approved operational notes separated from customer-visible content;
- configuration/catalog/Quotation versions; and
- escalation owner for ambiguity or change.

Operations MUST not infer omitted add-ons or expand scope based on catalog defaults that changed after acceptance.

## 13. Service Completion Semantics

Completion requires the accepted transport scope and enabled add-ons to reach their approved completion conditions, required evidence/checks to be recorded, blocking exceptions to be resolved or formally dispositioned, and the customer-facing status to be updated. Completion does not itself prove payment, invoicing, settlement, or customer satisfaction; those are separate concepts.

## 14. Catalog Metrics

Metrics SHOULD include discovery and selection by service combination; eligibility and unsupported reasons; qualification cycle time; add-on attachment and change; Quotation/revision/acceptance/completion by service; operational exceptions; cancellations; and catalog/configuration errors. Definitions MUST preserve the catalog version and MUST NOT compare materially different service definitions without disclosure.

## 15. Future Catalog Candidates

Possible future discovery includes inbound/non-Riyadh lanes, additional Saudi origin cities, new cargo categories, specialized handling, assembly/disassembly, storage, insurance options, recurring/business accounts, multi-stop services, and international transport. A mention here is not approval or implementation scope; each candidate requires discovery, legal/safety review, economics, operational readiness, and a PDS/catalog version change.
