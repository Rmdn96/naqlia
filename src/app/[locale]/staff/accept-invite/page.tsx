import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { StaffInviteAcceptance } from "@/features/staff-auth/components/staff-invite-acceptance";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { follow: false, index: false, noarchive: true, nocache: true },
};

type StaffInvitePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function StaffInvitePage({ params }: StaffInvitePageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  setRequestLocale(locale);
  const t = await getTranslations("StaffAuth");

  return (
    <main className="container grid min-h-[70vh] place-items-center py-12" id="main-content">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <StaffInviteAcceptance
          errorMessage={t("acceptError")}
          locale={locale}
          pendingMessage={t("accepting")}
        />
      </section>
    </main>
  );
}
