# Naqlk Visual Identity

## 1. Current visual direction

Naqlk retains the established accessible product palette, spacing, typography, and component behavior during the pre-launch rename. This patch changes identity, not interface structure or business behavior.

The temporary public mark consists of:

- a compact `NQ` monogram in the existing primary color;
- the localized text wordmark (`نقلك` or `Naqlk`);
- the official localized tagline;
- the existing application typography and CSS, with no third-party logo artwork.

## 2. Usage

1. Arabic pages show the Arabic wordmark and tagline; English pages show the English equivalents.
2. The monogram is decorative when adjacent text already supplies the accessible name.
3. Brand links require a localized accessible label.
4. Clear space must be at least one-quarter of the mark height. Do not stretch, rotate, outline, add gradients, or recolor the mark outside approved theme tokens.
5. RTL and LTR layouts may change alignment but not the order or spelling of the mark.

## 3. Accessibility

- Text marks must meet WCAG 2.2 AA contrast requirements.
- Decorative marks use `aria-hidden`; standalone assets carry an accurate accessible title or alternative text.
- Brand recognition must never rely on color alone.
- At 200% zoom, the wordmark remains readable and navigation remains operable.

## 4. Temporary status

The CSS wordmark and SVG application icon are temporary launch-safe assets, not a permanent logo system. A future identity package should deliver approved vector masters, favicon variants, social-preview artwork, monochrome and reversed treatments, spacing rules, color specifications, and Arabic/English lockups. Replacement must preserve file-level backward compatibility or include a controlled asset migration.
