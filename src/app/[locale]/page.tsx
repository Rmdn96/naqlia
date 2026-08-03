import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  MessageCircleMore,
  PackageSearch,
  ShieldCheck,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPublicRequestCatalog } from "@/features/public-request/services/public-request.service";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";

export const dynamic = "force-dynamic";

type LocalePageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });

  return {
    alternates: {
      canonical: `/${locale}`,
      languages: { ar: "/ar", en: "/en" },
    },
    description: t("metaDescription"),
    openGraph: {
      description: t("metaDescription"),
      locale: locale === "ar" ? "ar_SA" : "en_SA",
      siteName: "Naqlia",
      title: t("metaTitle"),
      type: "website",
      url: `/${locale}`,
    },
    title: t("metaTitle"),
  };
}

export default async function HomePage({ params }: LocalePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, catalog] = await Promise.all([
    getTranslations("Home"),
    getPublicRequestCatalog(locale),
  ]);
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;
  const process = [
    { description: t("process1Description"), icon: ClipboardList, title: t("process1Title") },
    { description: t("process2Description"), icon: PackageSearch, title: t("process2Title") },
    { description: t("process3Description"), icon: MessageCircleMore, title: t("process3Title") },
  ];

  return (
    <main id="main-content">
      <section className="surface-grid relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/75 to-background" />
        <div className="container relative grid min-h-[calc(100vh-5rem)] items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-2 text-sm font-black text-primary shadow-sm">
              <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
              {t("eyebrow")}
            </p>
            <h1 className="mt-7 text-balance text-4xl font-black leading-[1.16] tracking-tight sm:text-5xl lg:text-7xl">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
              {t("subtitle")}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link className={cn(buttonVariants({ size: "lg" }), "group")} href="/request">
                {t("primaryCta")}
                <Arrow
                  aria-hidden="true"
                  className="size-5 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1"
                />
              </Link>
              <a
                className={buttonVariants({ size: "lg", variant: "outline" })}
                href="#how-it-works"
              >
                {t("secondaryCta")}
              </a>
            </div>
            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-muted-foreground">
              {[t("guestNote"), t("reviewNote"), t("arabicNote")].map((item) => (
                <li className="flex items-center gap-2" key={item}>
                  <CheckCircle2 aria-hidden="true" className="size-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div aria-hidden="true" className="relative hidden min-h-[32rem] lg:block">
            <div className="absolute inset-x-12 top-8 h-80 rounded-[3rem] bg-primary shadow-soft" />
            <div className="absolute inset-x-0 top-24 rounded-[2rem] border border-primary-foreground/15 bg-primary/95 p-8 text-primary-foreground shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="grid size-14 place-items-center rounded-lg bg-primary-foreground/10">
                  <PackageSearch className="size-7" />
                </span>
                <span className="rounded-full bg-accent px-4 py-2 text-xs font-black text-accent-foreground">
                  01 → 05
                </span>
              </div>
              <div className="mt-9 space-y-4">
                {[78, 92, 66].map((width, index) => (
                  <div className="rounded-lg bg-primary-foreground/[0.07] p-4" key={width}>
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 place-items-center rounded-full bg-primary-foreground text-xs font-black text-primary">
                        {index + 1}
                      </span>
                      <div
                        className="h-2.5 rounded-full bg-primary-foreground/55"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-7 h-12 rounded-md bg-primary-foreground" />
            </div>
            <div className="absolute bottom-3 end-0 rounded-lg border border-border bg-card p-5 text-foreground shadow-soft">
              <ShieldCheck className="size-8 text-primary" />
            </div>
          </div>
        </div>
      </section>

      <section className="container py-20 sm:py-28" id="services">
        <div className="max-w-2xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-accent">
            {t("servicesEyebrow")}
          </p>
          <h2 className="mt-4 text-balance text-3xl font-black sm:text-5xl">
            {t("servicesTitle")}
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{t("servicesDescription")}</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {catalog.services.map((service, index) => (
            <Card
              className="group relative overflow-hidden p-6 transition hover:-translate-y-1 hover:border-primary/35"
              key={service.id}
            >
              <span className="text-xs font-black text-accent">0{index + 1}</span>
              <h3 className="mt-4 text-xl font-black">{service.name}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">{service.description}</p>
              <Link
                className="mt-6 inline-flex items-center gap-2 text-sm font-black text-primary"
                href="/request"
              >
                {t("primaryCta")}
                <Arrow aria-hidden="true" className="size-4" />
              </Link>
              <span className="absolute -bottom-12 -end-12 size-32 rounded-full bg-secondary transition-transform group-hover:scale-125" />
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/55 py-20 sm:py-28" id="how-it-works">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-accent">
              {t("processEyebrow")}
            </p>
            <h2 className="mt-4 text-balance text-3xl font-black sm:text-5xl">
              {t("processTitle")}
            </h2>
          </div>
          <ol className="mt-12 grid gap-6 lg:grid-cols-3">
            {process.map(({ description, icon: Icon, title }, index) => (
              <li
                className="relative rounded-lg border border-border bg-card p-6 shadow-soft"
                key={title}
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-md bg-primary text-primary-foreground">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="text-3xl font-black text-border">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container py-20 sm:py-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-primary-foreground shadow-soft sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="relative max-w-2xl">
            <h2 className="text-balance text-3xl font-black sm:text-4xl">{t("finalTitle")}</h2>
            <p className="mt-4 text-lg leading-8 text-primary-foreground/75">
              {t("finalDescription")}
            </p>
          </div>
          <Link
            className={cn(
              buttonVariants({ size: "lg", variant: "secondary" }),
              "relative mt-8 shrink-0 lg:mt-0",
            )}
            href="/request"
          >
            {t("primaryCta")}
            <Arrow aria-hidden="true" className="size-5" />
          </Link>
          <span
            aria-hidden="true"
            className="absolute -bottom-24 -start-20 size-64 rounded-full border-[40px] border-primary-foreground/5"
          />
        </div>
      </section>
    </main>
  );
}
