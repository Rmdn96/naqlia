import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { StaffSignInForm } from "@/features/staff-auth/components/staff-sign-in-form";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

type StaffSignInPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: StaffSignInPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const t = await getTranslations({ locale, namespace: "StaffAuth" });

  return {
    description: t("description"),
    robots: { follow: false, index: false, noarchive: true, nocache: true },
    title: t("title"),
  };
}

export default async function StaffSignInPage({ params }: StaffSignInPageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  setRequestLocale(locale);
  const t = await getTranslations("StaffAuth");

  return (
    <main className="container grid min-h-[70vh] place-items-center py-12" id="main-content">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold text-primary">{t("eyebrow")}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">{t("title")}</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{t("description")}</p>
        <div className="mt-7">
          <StaffSignInForm
            emailLabel={t("email")}
            emailPlaceholder={t("emailPlaceholder")}
            errorInvalidEmail={t("errorInvalidEmail")}
            errorUnavailable={t("errorUnavailable")}
            locale={locale}
            submitLabel={t("submit")}
            submittingLabel={t("submitting")}
            successMessage={t("success")}
          />
        </div>
      </section>
    </main>
  );
}
