# Naqlia UI Principles

| Document field   | Value                                                                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Status           | Mandatory user-interface policy                                                                                                        |
| Version          | 1.0.0                                                                                                                                  |
| Parent authority | [Naqlia Constitution](./constitution.md)                                                                                               |
| Owner            | Product Design and Engineering leadership                                                                                              |
| Applies to       | Information architecture, visual design, content, components, responsiveness, localization, accessibility, interaction, and UI testing |

## 1. UI Standard

Naqlia interfaces MUST make logistics work clear, safe, efficient, and trustworthy for Arabic-speaking users first, with complete English parity.

The interface is not a visual wrapper around data. It communicates current truth, responsibility, available action, consequence, uncertainty, and recovery.

## 2. Core UI Principles

1. **Arabic first.** Start with Arabic content and RTL composition.
2. **Mobile first.** Design the essential journey at the smallest supported viewport before enhancement.
3. **Accessible first.** WCAG 2.2 AA behavior is a baseline.
4. **Clarity before density.** Operational information is prioritized, grouped, and progressively disclosed.
5. **State is explicit.** Loading, empty, permission, conflict, error, degraded, and success are designed.
6. **Actions show consequence.** Users understand scope, impact, status, and recovery.
7. **Consistency builds trust.** Shared patterns use the design system rather than local invention.
8. **Performance is experience.** Fast feedback and bounded rendering are UI requirements.
9. **Privacy by presentation.** The UI reveals only what the current role and purpose require.

## 3. Arabic First and Bidirectionality

### 3.1 Language and direction

- Arabic (`ar`) is default and uses RTL at the document boundary.
- English (`en`) uses LTR.
- Direction follows active locale, not text detection or user record assumptions.
- A component MUST work in both directions without separate divergent implementations.
- Real Arabic copy MUST be used during design and testing.

### 3.2 Logical layout

- Use start/end, inline/block, and direction-aware alignment.
- Navigation, progression, disclosure, and spatial relationships SHOULD adapt to reading direction.
- Brand marks, media controls, charts, numbers, maps, clocks, vehicle illustrations, and universally directional symbols MUST be evaluated before mirroring.
- Icons whose meaning depends on direction require approved RTL behavior.

### 3.3 Mixed-direction content

Shipment references, phone numbers, email, URLs, license plates, vehicle codes, English brands, addresses, and timestamps MUST remain readable inside Arabic sentences. Dynamic values require bidirectional isolation where necessary.

### 3.4 Localization quality

- Message keys are stable and context-specific.
- Text fragments MUST NOT be concatenated into grammar.
- Arabic and English translations include plural, gender, tone, and domain context where relevant.
- Text expansion, wrapping, truncation, and small-screen behavior MUST be verified.
- Truncation MUST preserve access to the full value when the value matters.

## 4. Mobile-First Design

The smallest supported viewport defines essential hierarchy and interaction.

- Primary tasks and critical state MUST remain available without horizontal page scrolling.
- Touch targets, spacing, focus, and gesture alternatives MUST meet accessibility needs.
- Avoid hover-only content and interaction.
- Inputs SHOULD minimize keyboard switching and entry effort.
- Dense tables require an approved small-screen strategy such as priority columns, cards, drill-down, or controlled horizontal region—not accidental overflow.
- Sticky actions MUST NOT hide content, keyboard, errors, or browser controls.
- Orientation and viewport changes MUST preserve progress.
- Mobile performance budgets include network, JavaScript, images, fonts, and data volume.

Responsive does not mean every desktop element shrinks. Information and actions are reprioritized while preserving capability and truth.

## 5. Accessibility

### 5.1 Semantic structure

- Use native semantic elements and controls before ARIA.
- Heading levels, landmarks, lists, tables, forms, dialogs, and live regions MUST reflect meaning.
- Interactive elements MUST have stable accessible names and roles.
- Visual order and DOM reading/focus order MUST agree.

### 5.2 Keyboard and focus

- Every action is keyboard operable.
- Focus is visible in all themes and states.
- Focus order follows task order.
- Dialogs manage initial focus, containment, escape behavior, and return focus.
- Route, modal, error, and dynamic updates require deliberate focus behavior.
- Keyboard shortcuts MUST avoid conflicts, be discoverable, and have alternatives.

### 5.3 Visual access

- Text and non-text contrast meet the approved standard in default, hover, focus, selected, disabled, validation, and error states.
- Color is not the only status signal.
- Content supports browser zoom and text resize without loss or overlap.
- Reflow is supported at required widths.
- Meaningful icons have text or accessible labels; decorative icons are hidden from assistive technology.
- Motion respects reduced-motion preferences and avoids unnecessary vestibular risk.

### 5.4 Forms and errors

- Every input has a persistent label.
- Required, optional, format, unit, and constraint information is available before submission.
- Errors identify the field, explain the problem, and suggest correction.
- Error summaries link or move focus to affected fields when appropriate.
- Placeholder text is not a label.
- Validation MUST NOT rely only on color or appear only after users lose their work.

### 5.5 Complex operational UI

Charts, maps, timelines, drag-and-drop, live tracking, virtualized lists, and data grids require keyboard, screen-reader, text-summary, zoom, focus, and reduced-motion design before adoption.

## 6. Information Hierarchy

- Each screen has one clear purpose and primary heading.
- Critical status, exception, responsibility, and next action appear before supporting detail.
- Group related information using semantic regions and clear headings.
- Progressive disclosure reduces cognitive load without hiding required safety information.
- Labels use user domain language, not database or provider terminology.
- IDs and codes are visually distinguishable, selectable, and copyable when operationally useful.
- Important history and provenance MUST NOT be replaced by only the current state.

## 7. Navigation

- Navigation reflects stable user responsibilities and information architecture.
- Current location is perceivable visually and programmatically.
- Back behavior, breadcrumbs, tabs, and deep links MUST be predictable.
- Authorization removes inaccessible destinations but MUST NOT be the only security control.
- Locale switching SHOULD preserve the equivalent destination and user progress where safe.
- Unsaved changes require clear navigation handling.
- Search and filters SHOULD be URL-addressable when sharing, recovery, and back navigation benefit.

## 8. Design System and Components

- shadcn/ui and Radix primitives are starting foundations, not proof of final accessibility or design quality.
- `components/ui` owns reviewed primitives and tokens.
- `components/shared` owns domain-neutral compositions.
- Feature-specific UI remains in its feature.
- Reuse an existing approved pattern before creating a variant.
- Variants MUST express semantic use, not one-page styling exceptions.
- Components MUST define content limits, states, direction, keyboard behavior, accessible contract, responsive behavior, and testing expectations.
- Tokens control color, typography, spacing, radius, elevation, motion, and breakpoints.
- Raw visual values SHOULD NOT proliferate outside tokens.

## 9. Content Design

- Copy is concise, specific, respectful, and action-oriented.
- Buttons state the action, not generic “OK” or “Submit” when a clearer verb exists.
- Status names describe facts consistently across UI, API, database, notifications, and reports.
- Error content states what happened, what remains safe, and what the user can do next.
- Confirmation content identifies the affected object and consequence.
- Destructive language MUST NOT minimize impact.
- Technical provider and infrastructure terms SHOULD be translated into user meaning unless needed for support.
- Empty states explain cause and permitted action without blaming the user.

## 10. Forms and Data Entry

- Ask only for data required at that stage and purpose.
- Group inputs by user task rather than storage structure.
- Choose control types matching data and expected options.
- Defaults MUST be safe and visible; high-impact values SHOULD NOT be preselected merely for speed.
- Units, currency, timezone, and locale formats are explicit.
- Preserve valid input after recoverable failure.
- Prevent duplicate submissions and show pending state without hiding cancellation or result.
- Autosave, drafts, and offline queues require visible state and conflict behavior.
- Bulk forms identify scope and provide a review step when impact is material.

## 11. Feedback and System Status

Feedback MUST be timely and proportional:

- immediate local feedback for direct interaction;
- progress for work that is not immediate;
- durable status for background work;
- clear completion with affected scope;
- actionable failure with retry or escalation;
- conflict feedback when state changed elsewhere; and
- degraded-mode communication when freshness or capability is limited.

Transient toasts MUST NOT be the only place for critical, error, or durable information. Loading indicators SHOULD avoid layout shift and false progress.

## 12. Destructive and High-Risk Actions

- Destructive actions use accurate language and appropriate visual distinction.
- Confirmation is required when an action is difficult to reverse, broad, financially material, permission-changing, or privacy-sensitive.
- Confirmation MUST identify resource, scope, consequence, and recovery.
- Typed confirmation is reserved for exceptional high-risk cases and MUST remain accessible.
- Safer alternatives such as archive, soft delete, revoke, cancel, or preview SHOULD be offered when semantically correct.
- Success MUST be shown only after authoritative completion.

## 13. Permission and Privacy UI

- Users see only actions they are permitted to request, but hidden controls do not replace server authorization.
- Unauthorized states MUST NOT reveal protected resource existence or metadata.
- Sensitive values SHOULD be minimized or masked according to purpose.
- Reveal, copy, download, share, export, and print actions require specific permission and audit where policy requires.
- Support impersonation MUST remain visibly identified to the platform operator.
- Cross-organization shared content MUST show owner and sharing context without exposing unrelated internal data.

## 14. Tables, Search, and Filters

- Tables are used for genuine relational comparison, not default layout.
- Headers, scope, units, sorting, and row actions are explicit.
- Sorting is deterministic; pagination and result counts communicate their basis.
- Filters use user vocabulary and have visible active state and clear reset.
- No-results state distinguishes no data from filter mismatch, permission, and system failure.
- Bulk selection identifies whether it applies to visible rows, page, filtered set, or all authorized results.
- Virtualization MUST preserve accessibility or provide an approved alternative.
- Exports reauthorize current scope and explain freshness and included fields.

## 15. Performance

- Prioritize useful content and interaction over decoration.
- Avoid shipping client code for static or server-resolvable behavior.
- Fonts, icons, images, maps, analytics, and third-party widgets require budgets and failure plans.
- Skeletons SHOULD approximate final layout and MUST NOT create inaccessible noise.
- Large data views are bounded and progressively loaded.
- Interactions SHOULD acknowledge input immediately while preserving authoritative completion semantics.
- Arabic font rendering and text metrics are part of performance and layout testing.

## 16. SEO and Public UI

Approved public pages MUST provide semantic server-rendered content, meaningful localized headings, stable URLs, metadata, canonical rules, accessible navigation, and performance within budget. Authenticated product chrome and customer data MUST NOT be indexed.

Detailed requirements are in [SEO Principles](./seo-principles.md).

## 17. UI Testing

Required evidence is proportional to risk and includes:

- Arabic RTL and English LTR at supported breakpoints;
- keyboard-only completion;
- visible focus and focus recovery;
- screen-reader semantics for critical paths;
- automated accessibility checks;
- zoom, reflow, text expansion, contrast, and reduced motion;
- touch targets and mobile input behavior;
- loading, empty, error, unauthorized, conflict, degraded, and success states;
- slow network and repeated interaction;
- representative mixed-direction and long content; and
- visual regression for stable shared primitives where useful.

Automated accessibility scores do not replace manual testing.

## 18. UI Definition of Ready

UI work is ready only when:

- user, task, context, content, and success are understood;
- real Arabic and English terminology is available;
- mobile and desktop information hierarchy is designed;
- every material state and permission outcome is specified;
- component reuse and new pattern ownership are decided;
- keyboard, screen reader, contrast, reflow, motion, and focus behavior are defined;
- performance and SEO requirements are identified; and
- design, product, engineering, localization, and accessibility owners resolve material questions.

## 19. UI Definition of Done

UI work is done only when:

- Arabic RTL and English LTR are complete and reviewed;
- supported mobile and desktop layouts preserve the full task;
- semantic, keyboard, focus, screen-reader, contrast, zoom, reflow, and motion behavior passes review;
- all material states and recovery paths work;
- permissions and sensitive presentation match security policy;
- performance and applicable SEO budgets pass;
- reused and new component contracts are documented; and
- screenshots or recordings provide review evidence for representative states.

## 20. UI Review Questions

1. Can the user identify current truth, responsibility, and next action?
2. Does the experience begin with natural Arabic and correct RTL behavior?
3. Can the complete task be performed on mobile, keyboard, zoom, and assistive technology?
4. Are permission, failure, conflict, and recovery states explicit and safe?
5. Is an approved design-system pattern reused consistently?
6. Does the UI expose only necessary data and actions?
7. Is useful interaction fast under representative field conditions?
