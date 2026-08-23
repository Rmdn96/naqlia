import type { Metadata } from "next";
import { MapPin, Route } from "lucide-react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { Card } from "@/components/ui/card";
import { ACTIVE_PRODUCTION_ORIGIN, BRAND, getBrandName } from "@/config/brand";
import {
  BenefitsGrid,
  FaqSection,
  PageHero,
  ProcessGrid,
  SeoCtas,
} from "@/features/seo/components/seo-page-sections";
import { StructuredData } from "@/features/seo/components/structured-data";
import { getServiceSeoPage, SERVICE_PAGE_SLUGS } from "@/features/seo/content/service-pages";
import { getPublicCitySeoPage } from "@/features/seo/services/seo.service";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getPublicBusinessConfiguration } from "@/lib/business-settings/public-settings";

type Props = { params: Promise<{ citySlug: string; locale: AppLocale }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { citySlug, locale } = await params;
  const page = await getPublicCitySeoPage(locale, citySlug);
  if (!page) return { robots: { follow: false, index: false } };
  const languages = Object.fromEntries(
    Object.entries(page.alternates).flatMap(([alternateLocale, slug]) =>
      slug ? [[alternateLocale, `/${alternateLocale}/${slug}`]] : [],
    ),
  );
  if (page.alternates.ar) languages["x-default"] = `/ar/${page.alternates.ar}`;
  return {
    alternates: { canonical: `/${locale}/${page.slug}`, languages },
    description: page.metaDescription,
    openGraph: {
      description: page.metaDescription,
      locale: BRAND.metadata.locale[locale],
      siteName: getBrandName(locale),
      title: page.seoTitle,
      type: "website",
      url: `/${locale}/${page.slug}`,
    },
    robots: page.indexable
      ? { follow: true, index: true }
      : { follow: false, index: false, noarchive: true },
    title: page.seoTitle,
    twitter: { card: "summary", description: page.metaDescription, title: page.seoTitle },
  };
}

export default async function CitySeoPageRoute({ params }: Props) {
  const { citySlug, locale } = await params;
  const page = await getPublicCitySeoPage(locale, citySlug);
  if (!page) notFound();
  setRequestLocale(locale);
  const business = await getPublicBusinessConfiguration();
  const isRiyadh = page.slug === "riyadh";
  const services = SERVICE_PAGE_SLUGS.filter((slug) => isRiyadh || slug !== "within-city-transport")
    .map((slug) => getServiceSeoPage(locale, slug))
    .filter((service) => service !== null);
  const url = `${ACTIVE_PRODUCTION_ORIGIN}/${locale}/${page.slug}`;
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
      { "@type": "ListItem", item: url, name: page.cityName, position: 2 },
    ],
  };
  const webpage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    about: { "@type": "City", containedInPlace: page.regionName, name: page.cityName },
    dateModified: page.updatedAt,
    description: page.metaDescription,
    inLanguage: locale,
    name: page.pageHeading,
    publisher: {
      "@type": "Organization",
      name: getBrandName(locale),
      url: ACTIVE_PRODUCTION_ORIGIN,
    },
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
  const process =
    locale === "ar"
      ? [
          "اختر الخدمة وأدخل تفاصيل الحمولة.",
          "حدد عنواني الاستلام والتسليم بوضوح.",
          "يراجع الفريق الطلب قبل إرسال عرض السعر.",
        ]
      : [
          "Choose the service and describe the cargo.",
          "Provide clear pickup and delivery addresses.",
          "The team reviews the request before sending a quotation.",
        ];
  const benefits =
    locale === "ar"
      ? [
          "مراجعة بشرية قبل عرض السعر.",
          "عناوين وإحداثيات جاهزة للخرائط.",
          "متابعة آمنة للطلب بعد اعتماده.",
        ]
      : [
          "Human review before quotation.",
          "Map-ready addresses and coordinates.",
          "Secure follow-up after approval.",
        ];

  return (
    <main id="main-content">
      <StructuredData value={breadcrumb} />
      <StructuredData value={webpage} />
      <StructuredData value={faqSchema} />
      <PageHero
        description={page.introduction}
        eyebrow={page.regionName}
        heading={page.pageHeading}
      />
      <section className="container grid gap-8 py-16 sm:py-20 lg:grid-cols-2">
        <div>
          <h2 className="flex items-center gap-3 text-3xl font-black">
            <MapPin aria-hidden="true" className="size-7 text-primary" />
            {locale === "ar" ? "نطاق الخدمة في المدينة" : "Service scope in the city"}
          </h2>
          <p className="mt-5 text-lg leading-9 text-muted-foreground">{page.serviceAreaContent}</p>
          {page.neighborhoodCoverage ? (
            <p className="mt-5 leading-8 text-muted-foreground">{page.neighborhoodCoverage}</p>
          ) : null}
        </div>
        <div>
          <h2 className="text-3xl font-black">
            {isRiyadh
              ? locale === "ar"
                ? "الخدمات المتاحة للطلب"
                : "Services available to request"
              : locale === "ar"
                ? "الخدمات المرتبطة بهذا المسار"
                : "Services relevant to this route"}
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {services.map((service) => (
              <Link
                className="rounded-xl border bg-card p-4 font-black text-primary hover:border-primary/40"
                href={`/services/${service.slug}` as never}
                key={service.slug}
              >
                {service.heading}
              </Link>
            ))}
          </div>
        </div>
      </section>
      {page.routes.length ? (
        <section className="border-y bg-muted/35 py-16">
          <div className="container">
            <h2 className="flex items-center gap-3 text-3xl font-black">
              <Route aria-hidden="true" className="size-7 text-primary" />
              {locale === "ar" ? "مسارات نقل شائعة فعلية" : "Relevant common transport routes"}
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {page.routes.map((route) => (
                <Card className="p-6" key={route.label}>
                  <h3 className="text-lg font-black">{route.label}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{route.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <ProcessGrid items={process} locale={locale} />
      <BenefitsGrid items={benefits} locale={locale} />
      <FaqSection faqs={page.faqs} locale={locale} />
      <SeoCtas
        city={page.cityName}
        citySlug={page.slug}
        cityRole={isRiyadh ? "local" : "destination"}
        locale={locale}
        whatsappNumber={business.whatsappNumber}
      />
    </main>
  );
}
