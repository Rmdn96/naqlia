import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { RequestWizard } from "@/features/public-request/components/request-wizard";
import { getPublicRequestCatalog } from "@/features/public-request/services/public-request.service";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

type RequestPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({ params }: RequestPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Request" });

  return {
    alternates: {
      canonical: `/${locale}/request`,
      languages: { ar: "/ar/request", en: "/en/request" },
    },
    description: t("metaDescription"),
    title: t("metaTitle"),
  };
}

export default async function RequestPage({ params }: RequestPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, catalog] = await Promise.all([
    getTranslations("Request"),
    getPublicRequestCatalog(locale),
  ]);

  return (
    <main className="surface-grid min-h-screen py-12 sm:py-16" id="main-content">
      <div className="container">
        <div className="mx-auto mb-9 max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-accent">
            {t("eyebrow")}
          </p>
          <h1 className="mt-4 text-balance text-3xl font-black sm:text-5xl">{t("title")}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <div className="mx-auto max-w-5xl">
          <RequestWizard catalog={catalog} />
        </div>
      </div>
    </main>
  );
}
