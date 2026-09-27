import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { BRAND, getBrandName, getLocaleAlternates } from "@/config/brand";
import { ACTIVE_PRODUCTION_ORIGIN } from "@/config/brand";
import {
  BenefitsGrid,
  FaqSection,
  PageHero,
  ProcessGrid,
  SeoCtas,
} from "@/features/seo/components/seo-page-sections";
import { StructuredData } from "@/features/seo/components/structured-data";
import { getServiceSeoPage, SERVICE_PAGE_SLUGS } from "@/features/seo/content/service-pages";
import { getIndexableCitySeoIndex } from "@/features/seo/services/seo.service";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: AppLocale; serviceSlug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return SERVICE_PAGE_SLUGS.map((serviceSlug) => ({ serviceSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, serviceSlug } = await params;
  const page = getServiceSeoPage(locale, serviceSlug);
  if (!page) return { robots: { follow: false, index: false } };
  const path = `/services/${page.slug}`;
  return {
    alternates: getLocaleAlternates(locale, path),
    description: page.metaDescription,
    openGraph: {
      description: page.metaDescription,
      locale: BRAND.metadata.locale[locale],
      siteName: getBrandName(locale),
      title: page.title,
      type: "website",
      url: `/${locale}${path}`,
    },
    title: page.title,
    twitter: { card: "summary", description: page.metaDescription, title: page.title },
  };
}

export default async function ServiceSeoPageRoute({ params }: Props) {
  const { locale, serviceSlug } = await params;
  const page = getServiceSeoPage(locale, serviceSlug);
  if (!page) notFound();
  setRequestLocale(locale);
  const cities = await getIndexableCitySeoIndex(locale);
  const riyadhCities = cities.filter((city) => city.slug === "riyadh");
  const destinationCities = cities.filter((city) => city.slug !== "riyadh");
  const isWithinCity = page.slug === "within-city-transport";
  const isIntercity = page.slug === "intercity-transport";
  const displayedCities = isWithinCity ? riyadhCities : cities;
  const serviceAreaHeading = isWithinCity
    ? locale === "ar"
      ? "منطقة النقل المحلي المنشورة"
      : "Published local service area"
    : isIntercity
      ? locale === "ar"
        ? "الوجهات المنشورة من الرياض"
        : "Published destinations from Riyadh"
      : locale === "ar"
        ? "الرياض والوجهات المنشورة منها"
        : "Riyadh and its published destinations";
  const serviceAreaNote = isWithinCity
    ? locale === "ar"
      ? "يطبق نطاق النقل المحلي الحالي عندما يقع طرفا الرحلة داخل الرياض فقط."
      : "The current local scope applies only when both journey endpoints are in Riyadh."
    : isIntercity
      ? locale === "ar"
        ? "تمثل المدن التالية وجهات لطلبات مؤهلة تبدأ من الرياض، ولا تعني خدمة محلية داخل كل وجهة."
        : "These cities are destinations for eligible requests originating in Riyadh; they do not represent local service inside each destination."
      : locale === "ar"
        ? "تدعم الرياض الطلبات المحلية ونقطة الانطلاق. وتمثل المدن الأخرى وجهات مؤهلة لرحلات تبدأ من الرياض."
        : "Riyadh supports local requests and serves as the origin. Other cities are eligible destinations for Riyadh-origin journeys.";
  const url = `${ACTIVE_PRODUCTION_ORIGIN}/${locale}/services/${page.slug}`;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        item: `${ACTIVE_PRODUCTION_ORIGIN}/${locale}`,
        name: locale === "ar" ? "الرئيسية" : "Home",
        position: 1,
      },
      { "@type": "ListItem", item: url, name: page.heading, position: 2 },
    ],
  };
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    areaServed: isWithinCity
      ? riyadhCities.map((city) => ({ "@type": "City", name: city.cityName }))
      : [
          ...(isIntercity
            ? []
            : riyadhCities.map((city) => ({ "@type": "City", name: city.cityName }))),
          ...destinationCities.map((city) => ({
            "@type": "Place",
            name:
              locale === "ar"
                ? `مسار من الرياض إلى ${city.cityName}`
                : `Route from Riyadh to ${city.cityName}`,
          })),
        ],
    description: page.metaDescription,
    name: page.heading,
    provider: {
      "@type": "Organization",
      name: getBrandName(locale),
      url: ACTIVE_PRODUCTION_ORIGIN,
    },
    serviceType: page.heading,
    url,
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
      name: faq.question,
    })),
  };

  return (
    <main id="main-content">
      <StructuredData value={breadcrumb} />
      <StructuredData value={serviceSchema} />
      <StructuredData value={faqSchema} />
      <PageHero
        description={page.introduction}
        eyebrow={locale === "ar" ? "خدمات نقلك" : "Naqlk services"}
        heading={page.heading}
      />
      <section className="container grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="text-3xl font-black">
            {locale === "ar" ? "نطاق الخدمة" : "Service scope"}
          </h2>
          <p className="mt-5 text-lg leading-9 text-muted-foreground">{page.description}</p>
        </div>
        <aside className="rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-black">{serviceAreaHeading}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{serviceAreaNote}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {displayedCities.map((city) => (
              <Link
                className="rounded-full bg-secondary px-4 py-2 text-sm font-bold text-primary"
                href={`/${city.slug}` as never}
                key={city.cityId}
              >
                {!isWithinCity && !isIntercity && city.slug !== "riyadh"
                  ? locale === "ar"
                    ? `${city.cityName} — وجهة من الرياض`
                    : `${city.cityName} — destination from Riyadh`
                  : city.cityName}
              </Link>
            ))}
          </div>
        </aside>
      </section>
      <ProcessGrid items={page.process} locale={locale} />
      <BenefitsGrid items={page.benefits} locale={locale} />
      <FaqSection faqs={page.faqs} locale={locale} />
      <SeoCtas citySlug={isWithinCity ? "riyadh" : undefined} locale={locale} service={page.key} />
    </main>
  );
}
