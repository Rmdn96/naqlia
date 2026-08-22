# Naqlk Visual Identity

## 1. Direction

Naqlk uses a modern Saudi logistics identity: confident navy foundations, vivid blue actions, generous white space, strong Arabic typography, realistic transport photography, restrained radii and shadows, and consistent line icons. Green is reserved primarily for successful states and WhatsApp recognition.

The code-native pre-launch mark combines a geometric `N` silhouette with horizontal movement lines. Runtime lockups render the mark beside real localized HTML text so Arabic/English naming stays accessible, crisp, and configurable. The supplied brand-board image is a visual reference only and is never embedded as the runtime logo.

## 2. Core palette

| Role          | Reference                          | Use                                          |
| ------------- | ---------------------------------- | -------------------------------------------- |
| Navy          | `#0B2B5B`                          | Brand foundation, dark surfaces, headings    |
| Primary blue  | `#2563EB`                          | Primary actions and active controls          |
| Light blue    | `#3B82F6`                          | Highlights and mark movement                 |
| Pale blue     | semantic `secondary` token         | Section surfaces and icon containers         |
| Neutral white | semantic `card/background` tokens  | Content surfaces and breathing room          |
| Success green | semantic success/positive contexts | Confirmed outcomes; not a primary brand fill |

Components use semantic CSS variables from `src/styles/globals.css`; component-level hex colors are limited to controlled brand artwork or an intentional dark brand section. Staff status semantics remain independent.

## 3. Assets and usage

1. Arabic pages show `نقلك | Naqlk`; English pages show `Naqlk | نقلك`.
2. The mark is decorative when adjacent real text supplies the accessible name. Standalone files carry a localized title.
3. Use `naqlk-mark.svg` on light surfaces and `naqlk-mark-light.svg` on navy/dark surfaces.
4. Clear space must be at least one-quarter of the mark height. Do not stretch, rotate, outline, or add effects outside approved assets.
5. RTL and LTR may change alignment but never spelling or mark geometry.
6. Photography must be original or properly licensed, natural, relevant to furniture/goods moving, and free of third-party marks. Important copy must remain HTML.

## 4. Typography and layout

The current system stack prioritizes readable Arabic and system UI fallbacks without a render-blocking font request. Arabic headings use heavy weight with comfortable line height; English copy uses the same hierarchy. Layout remains mobile-first, with 44-pixel minimum interactive targets, visible focus, logical headings, and restrained motion that honors reduced-motion preferences.

## 5. Accessibility

- Text and controls must meet WCAG 2.2 AA contrast.
- Brand recognition cannot rely on color alone.
- Alternative text describes the photographic subject and purpose, not decorative branding.
- At 200% zoom, navigation, lockup text, and calls to action remain operable.
- Dark-surface copy uses explicit high-contrast white/blue treatments.

## 6. Pre-launch status

The vector mark, lockups, favicon, and optimized Hero are implementation-ready pre-launch assets. They are not a substitute for a final trademark/legal identity package. Before commercial launch, approve vector masters, monochrome rules, full favicon/maskable sets, social artwork, print color specifications, and trademark clearance. Replacement must retain compatible runtime filenames or use a controlled asset migration.
