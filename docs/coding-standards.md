# Coding Standards

## TypeScript

- Keep strict mode enabled and fix type errors at their source.
- Prefer explicit domain types and discriminated unions over unchecked casts.
- Do not introduce `any`; use `unknown` and narrow it at trust boundaries.
- Validate external input at runtime before converting it to an internal type.
- Use the configured `@/` aliases instead of long relative imports.
- Export the smallest useful public surface from each module.

## React and Next.js

- Use Server Components by default and Client Components only for browser state or interaction.
- Keep route modules thin; product logic belongs in features.
- Prefer composition over components with large collections of mode flags.
- Treat loading, empty, error, unauthorized, and success states as designed states.
- Use Next.js metadata APIs for localized public pages when those pages are introduced.

## Internationalization and accessibility

- Never hard-code user-facing product copy in a component.
- Every message key must exist for Arabic and English before merge.
- Set language and direction from the active locale at the document boundary.
- Prefer logical CSS properties such as inline start/end over physical left/right.
- Do not mirror brand marks, media controls, numbers, or other direction-invariant visuals.
- Meet WCAG 2.2 AA expectations for semantics, focus, contrast, labels, and keyboard use.

## Naming and files

- Use `kebab-case` for folders and non-component files.
- Use `PascalCase` for React component symbols and `camelCase` for functions and variables.
- Prefix hooks with `use` and name tests `*.test.ts` or `*.test.tsx`.
- Keep one primary responsibility per module; split files when ownership diverges.

## Security and observability

- Never log credentials, access tokens, personal data, or shipment-sensitive details.
- Enforce authorization at the server/data boundary, never only in the UI.
- Return safe public errors while retaining structured internal diagnostics.
- Use correlation identifiers and structured events when observability is introduced.

## Automated enforcement

Prettier controls formatting. ESLint controls code quality. TypeScript controls static type safety. Vitest is the initial test runner. Do not bypass Husky or CI checks to merge a change.
