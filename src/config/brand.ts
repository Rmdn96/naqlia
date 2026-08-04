export type BrandLocale = "ar" | "en";

type LocalizedBrandValue = Readonly<Record<BrandLocale, string>>;

export type BrandConfiguration = Readonly<{
  abbreviation: "NQ";
  domains: Readonly<{
    primary: "https://naqlk.com";
    www: "https://www.naqlk.com";
  }>;
  metadata: Readonly<{
    defaultDescription: LocalizedBrandValue;
    locale: Readonly<Record<BrandLocale, "ar_SA" | "en_SA">>;
  }>;
  names: LocalizedBrandValue;
  social: Readonly<{
    instagram: null;
    linkedin: null;
    x: null;
  }>;
  support: Readonly<{
    email: null;
    phone: null;
    whatsapp: null;
  }>;
  taglines: LocalizedBrandValue;
}>;

/**
 * Runtime brand authority. Operational contact details remain null until the
 * Business Settings capability owns them; environment-backed fallbacks stay in
 * their existing boundary meanwhile.
 */
export const BRAND: BrandConfiguration = {
  abbreviation: "NQ",
  domains: {
    primary: "https://naqlk.com",
    www: "https://www.naqlk.com",
  },
  metadata: {
    defaultDescription: {
      ar: "منصة عربية لطلبات النقل والخدمات اللوجستية داخل الرياض وبين مدن المملكة العربية السعودية.",
      en: "An Arabic-first transport and logistics request platform for Riyadh and Saudi cities.",
    },
    locale: {
      ar: "ar_SA",
      en: "en_SA",
    },
  },
  names: {
    ar: "نقلك",
    en: "Naqlk",
  },
  social: {
    instagram: null,
    linkedin: null,
    x: null,
  },
  support: {
    email: null,
    phone: null,
    whatsapp: null,
  },
  taglines: {
    ar: "نقلك... ننقل كل ما يهمك",
    en: "Your move. Everything that matters.",
  },
};

export const PRODUCTION_ORIGIN = BRAND.domains.primary;

export function getBrandName(locale: BrandLocale): string {
  return BRAND.names[locale];
}

export function getBrandTagline(locale: BrandLocale): string {
  return BRAND.taglines[locale];
}

export function getOrganizationStructuredData(locale: BrandLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    alternateName: locale === "ar" ? BRAND.names.en : BRAND.names.ar,
    name: getBrandName(locale),
    slogan: getBrandTagline(locale),
    url: BRAND.domains.primary,
  } as const;
}

export function getLocaleAlternates(locale: BrandLocale, path = "") {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ar: `/ar${path}`,
      en: `/en${path}`,
      "x-default": `/ar${path}`,
    },
  } as const;
}
