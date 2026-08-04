# Naqlk Asset Register

## 1. Active assets

| Asset                  | Location                          | Purpose                                                   | Status                             | Replacement requirement                                 |
| ---------------------- | --------------------------------- | --------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------- |
| Localized CSS wordmark | `src/components/shared/brand.tsx` | Header and footer identity                                | Temporary, approved for pre-launch | Replace only when final bilingual lockups are approved. |
| Typed brand authority  | `src/config/brand.ts`             | Names, taglines, domains, metadata defaults, placeholders | Active source of truth             | Keep stable and reviewed.                               |
| NQ application icon    | `src/app/icon.svg`                | Browser/application icon                                  | Temporary, original project asset  | Replace with final favicon set.                         |
| Web manifest           | `src/app/manifest.ts`             | Installable application identity                          | Active                             | Update with final icons when available.                 |

## 2. Audited but absent

No final logo master, dedicated Open Graph image, Twitter/X card image, Apple touch icon set, maskable PWA icon, photographic brand library, or social avatar is present. Metadata therefore uses a text-first `summary` card and does not claim an unavailable image.

## 3. Asset controls

- Do not introduce copyrighted third-party marks or unlicensed photography.
- New asset filenames use lowercase kebab-case and the `naqlk` identifier where a brand name is necessary.
- Keep original vector sources and document ownership, license, dimensions, locale, and intended placements.
- Optimize raster assets before commit and verify high-density, dark-mode, RTL, and accessible-fallback behavior.
- Do not replace or move production storage objects merely for cosmetic naming consistency.
