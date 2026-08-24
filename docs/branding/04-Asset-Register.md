# Naqlk Asset Register

## 1. Active assets

| Asset                   | Location                            | Purpose                                                   | Status                           | Replacement requirement                                    |
| ----------------------- | ----------------------------------- | --------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------- |
| Runtime brand lockup    | `src/components/shared/brand.tsx`   | Code-native mark with localized HTML name/tagline         | Active pre-launch implementation | Review with the final trademark master before launch.      |
| Typed brand authority   | `src/config/brand.ts`               | Names, taglines, domains, metadata defaults, placeholders | Active source of truth           | Keep stable and reviewed.                                  |
| Geometric Naqlk marks   | `public/brand/naqlk-*.svg`          | Standalone/light and localized horizontal assets          | Active pre-launch implementation | Export final masters after trademark review.               |
| Naqlk application icon  | `src/app/icon.svg`                  | Browser/application icon                                  | Active pre-launch implementation | Expand to final PNG/maskable sizes before app launch.      |
| App/social icon exports | `public/brand/naqlk-app-icon-*.png` | 192px and 512px manifest/social-ready icon exports        | Active pre-launch implementation | Add maskable safe-area master in the final package.        |
| Browser favicon         | `public/favicon-32x32.png`          | 32px browser fallback                                     | Active pre-launch implementation | Include in final multi-size favicon package.               |
| Moving Hero AVIF/WebP   | `public/images/naqlk-moving-hero.*` | Original generated public Hero photograph                 | Active, optimized                | Maintain source/prompt provenance and review campaign use. |
| Web manifest            | `src/app/manifest.ts`               | Installable application identity                          | Active                           | Update with final icons when available.                    |

## 2. Audited but absent

No trademark-final logo master, dedicated Open Graph image, Twitter/X card image, Apple touch icon set, maskable PWA icon set, or complete photographic library is present. The implemented vectors and Hero are production-safe pre-launch assets, not a claim that the final trademark package is complete.

## 3. Asset controls

- Do not introduce copyrighted third-party marks or unlicensed photography.
- New asset filenames use lowercase kebab-case and the `naqlk` identifier where a brand name is necessary.
- Keep original vector sources and document ownership, license, dimensions, locale, and intended placements.
- Optimize raster assets before commit and verify high-density, dark-mode, RTL, and accessible-fallback behavior.
- Do not replace or move production storage objects merely for cosmetic naming consistency.
