import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Card } from "@/components/ui/card";
import { ACTIVE_PRODUCTION_ORIGIN } from "@/config/brand";
import { CustomerQuotationView } from "@/features/customer-quotation/components/customer-quotation-view";
import { getCustomerQuotation } from "@/features/customer-quotation/services/customer-quotation.service";
import type { AppLocale } from "@/i18n/routing";
import { getPublicBusinessConfiguration } from "@/lib/business-settings/public-settings";

type Props = { params: Promise<{ locale: AppLocale; token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CustomerQuotation" });

  return {
    alternates: { canonical: `${ACTIVE_PRODUCTION_ORIGIN}/${locale}` },
    description: t("metaDescription"),
    openGraph: undefined,
    robots: { follow: false, index: false, noarchive: true, nosnippet: true },
    title: t("metaTitle"),
  };
}

export default async function CustomerQuotationPage({ params }: Props) {
  noStore();
  const { locale, token } = await params;
  setRequestLocale(locale);
  const [data, t, business] = await Promise.all([
    getCustomerQuotation(token),
    getTranslations("CustomerQuotation"),
    getPublicBusinessConfiguration(),
  ]);

  if (data.state === "invalid") {
    return (
      <main className="surface-grid grid min-h-[70vh] place-items-center py-14" id="main-content">
        <div className="container">
          <Card className="mx-auto max-w-xl p-7 text-center sm:p-10">
            <h1 className="text-3xl font-black">{t("invalidTitle")}</h1>
            <p className="mt-4 leading-7 text-muted-foreground">{t("invalidDescription")}</p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <CustomerQuotationView
      data={data}
      locale={locale}
      token={token}
      whatsappNumber={business.whatsappNumber}
    />
  );
}
