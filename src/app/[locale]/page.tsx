import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Headphones,
  MapPinned,
  MessageCircleMore,
  PackageCheck,
  Quote,
  ShieldCheck,
  Sofa,
  Star,
  Truck,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BRAND,
  getBrandName,
  getLocaleAlternates,
  getOrganizationStructuredData,
} from "@/config/brand";
import { getWhatsAppHref } from "@/config/site";
import { getPublicHomeContent } from "@/features/public-home/services/public-home.service";
import { getPublicRequestCatalog } from "@/features/public-request/services/public-request.service";
import { getServicePageSlugForKey } from "@/features/seo/content/service-pages";
import { getIndexableCitySeoIndex } from "@/features/seo/services/seo.service";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getPublicBusinessConfiguration } from "@/lib/business-settings/public-settings";
import { cn } from "@/utils/cn";

export const dynamic = "force-dynamic";
type LocalePageProps = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });
  return {
    alternates: getLocaleAlternates(locale),
    description: t("metaDescription"),
    openGraph: {
      description: t("metaDescription"),
      locale: BRAND.metadata.locale[locale],
      siteName: getBrandName(locale),
      title: t("metaTitle"),
      type: "website",
      url: `/${locale}`,
    },
    title: t("metaTitle"),
    twitter: {
      card: "summary_large_image",
      description: t("metaDescription"),
      title: t("metaTitle"),
    },
  };
}

export default async function HomePage({ params }: LocalePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, catalog, business, publicContent, seoCities] = await Promise.all([
    getTranslations("Home"),
    getPublicRequestCatalog(locale),
    getPublicBusinessConfiguration(),
    getPublicHomeContent(locale),
    getIndexableCitySeoIndex(locale),
  ]);
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;
  const process = [
    { description: t("process1Description"), icon: ClipboardList, title: t("process1Title") },
    { description: t("process2Description"), icon: MapPinned, title: t("process2Title") },
    { description: t("process3Description"), icon: MessageCircleMore, title: t("process3Title") },
    { description: t("process4Description"), icon: PackageCheck, title: t("process4Title") },
  ];
  const reasons = [
    { description: t("why1Description"), icon: Headphones, title: t("why1Title") },
    { description: t("why2Description"), icon: Truck, title: t("why2Title") },
    { description: t("why3Description"), icon: MapPinned, title: t("why3Title") },
    { description: t("why4Description"), icon: ShieldCheck, title: t("why4Title") },
  ];
  const serviceIcons = [Sofa, Boxes, Truck, MapPinned];

  return (
    <main id="main-content">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getOrganizationStructuredData(locale)).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />

      <section className="relative min-h-[680px] overflow-hidden bg-[#081f42] lg:min-h-[760px]">
        <Image
          alt={
            locale === "ar"
              ? "فريق نقل يحمّل الأثاث في شاحنة داخل الرياض"
              : "A moving team loading furniture into a truck in Riyadh"
          }
          className="object-cover object-[72%_center] sm:object-[68%_center] lg:object-[64%_center]"
          fill
          priority
          sizes="100vw"
          src="/images/naqlk-moving-hero.avif"
        />
        <div className="hero-overlay absolute inset-0" />
        <div
          className="container relative grid min-h-[680px] items-center py-16 text-white md:py-20 lg:min-h-[760px] lg:grid-cols-[minmax(0,44fr)_minmax(0,56fr)]"
          dir="ltr"
        >
          <div
            className="max-w-xl lg:col-start-1 lg:w-full lg:max-w-[38rem] xl:max-w-[42rem]"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black backdrop-blur">
              <span className="size-2 rounded-full bg-sky-400" />
              {t("eyebrow")}
            </p>
            <h1 className="mt-7 text-balance text-4xl font-black leading-[1.18] tracking-tight sm:text-5xl md:text-6xl xl:text-7xl">
              {t("title")}
            </h1>
            <p className="text-white/82 mt-6 max-w-xl text-lg leading-8 sm:text-xl sm:leading-9">
              {t("subtitle")}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group bg-blue-600 hover:bg-blue-500",
                )}
                href="/request"
              >
                {t("primaryCta")}
                <Arrow
                  aria-hidden="true"
                  className="size-5 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1"
                />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/45 bg-white/10 px-6 font-bold text-white backdrop-blur hover:bg-white/20"
                href="/track"
              >
                {t("secondaryCta")}
              </Link>
              <a
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/45 bg-white/10 px-6 font-bold text-white backdrop-blur hover:bg-white/20"
                href={getWhatsAppHref(t("whatsappMessage"), business.whatsappNumber)}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircleMore aria-hidden="true" className="size-5 text-emerald-400" />
                {t("whatsappCta")}
              </a>
            </div>
            <ul className="mt-10 grid max-w-2xl gap-3 text-sm font-bold sm:grid-cols-3">
              {[t("guestNote"), t("reviewNote"), t("arabicNote")].map((item) => (
                <li className="flex items-center gap-2 text-white/85" key={item}>
                  <CheckCircle2 aria-hidden="true" className="size-4 text-sky-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent" />
      </section>

      <section className="container py-20 sm:py-28" id="services">
        <SectionHeading
          eyebrow={t("servicesEyebrow")}
          title={t("servicesTitle")}
          description={t("servicesDescription")}
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {catalog.services.map((service, index) => {
            const Icon = serviceIcons[index % serviceIcons.length];
            const serviceSlug = getServicePageSlugForKey(service.key);
            return (
              <Card
                className="group relative overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
                key={service.id}
              >
                <span className="grid size-12 place-items-center rounded-xl bg-secondary text-primary">
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-black">{service.name}</h3>
                <p className="mt-3 min-h-20 text-sm leading-7 text-muted-foreground">
                  {service.description}
                </p>
                <Link
                  className="mt-6 inline-flex items-center gap-2 text-sm font-black text-primary"
                  href={(serviceSlug ? `/services/${serviceSlug}` : "/request") as never}
                >
                  {t("primaryCta")}
                  <Arrow aria-hidden="true" className="size-4" />
                </Link>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-[#eef5ff] py-20 sm:py-28" id="how-it-works">
        <div className="container">
          <SectionHeading eyebrow={t("processEyebrow")} title={t("processTitle")} />
          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {process.map(({ description, icon: Icon, title }, index) => (
              <li
                className="relative rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"
                key={title}
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="text-4xl font-black text-blue-100">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-lg font-black">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container py-20 sm:py-28">
        <SectionHeading eyebrow={t("whyEyebrow")} title={t("whyTitle")} />
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map(({ description, icon: Icon, title }) => (
            <div className="flex gap-4" key={title}>
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                <Icon aria-hidden="true" className="size-6" />
              </span>
              <div>
                <h3 className="font-black">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0b2b5b] py-20 text-white sm:py-24" id="service-areas">
        <div className="container grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <SectionHeading
            dark
            eyebrow={t("areasEyebrow")}
            title={t("areasTitle")}
            description={t("areasDescription")}
          />
          <div className="flex flex-wrap gap-3">
            {publicContent.cities.map((city) => {
              const seoCity = seoCities.find((item) => item.cityName === city.name);
              const className =
                "rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold";
              return seoCity ? (
                <Link
                  className={`${className} hover:bg-white/20`}
                  href={`/${seoCity.slug}` as never}
                  key={`${city.region}-${city.name}`}
                >
                  {city.name}
                </Link>
              ) : (
                <span className={className} key={`${city.region}-${city.name}`}>
                  {city.name}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {publicContent.reviews.length ? (
        <section className="container py-20 sm:py-28">
          <SectionHeading eyebrow={t("reviewsEyebrow")} title={t("reviewsTitle")} />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {publicContent.reviews.map((review, index) => (
              <Card className="p-6" key={`${review.city}-${index}`}>
                <Quote aria-hidden="true" className="size-8 text-primary/25" />
                <div aria-label={`${review.rating} / 5`} className="mt-4 flex gap-1">
                  {Array.from({ length: 5 }, (_, star) => (
                    <Star
                      aria-hidden="true"
                      className={cn(
                        "size-4",
                        star < review.rating ? "fill-amber-400 text-amber-400" : "text-border",
                      )}
                      key={star}
                    />
                  ))}
                </div>
                <blockquote className="mt-4 leading-8">“{review.comment}”</blockquote>
                <p className="mt-5 text-sm font-black">
                  {review.displayName} — {review.city}
                </p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 to-[#0b2b5b] px-6 py-12 text-white shadow-2xl sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <h2 className="text-balance text-3xl font-black sm:text-4xl">{t("finalTitle")}</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/75">
              {t("finalDescription")}
            </p>
          </div>
          <Link
            className={cn(
              buttonVariants({ size: "lg", variant: "secondary" }),
              "mt-8 shrink-0 bg-white text-[#0b2b5b] lg:mt-0",
            )}
            href="/request"
          >
            {t("primaryCta")}
            <Arrow aria-hidden="true" className="size-5" />
          </Link>
          <a
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "relative mt-3 shrink-0 border-white/35 bg-transparent text-white hover:bg-white/10 lg:mt-0",
            )}
            href={getWhatsAppHref(t("whatsappMessage"), business.whatsappNumber)}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircleMore aria-hidden="true" className="size-5" />
            {t("whatsappCta")}
          </a>
          <Clock3
            aria-hidden="true"
            className="absolute -bottom-14 -start-10 size-44 text-white/5"
          />
        </div>
      </section>
    </main>
  );
}

function SectionHeading({
  dark = false,
  description,
  eyebrow,
  title,
}: {
  dark?: boolean;
  description?: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="max-w-2xl">
      <p
        className={cn(
          "text-sm font-black uppercase tracking-[0.18em]",
          dark ? "text-sky-300" : "text-primary",
        )}
      >
        {eyebrow}
      </p>
      <h2 className={cn("mt-4 text-balance text-3xl font-black sm:text-5xl", dark && "text-white")}>
        {title}
      </h2>
      {description ? (
        <p
          className={cn("mt-5 text-lg leading-8", dark ? "text-white/70" : "text-muted-foreground")}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
