import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Check, MessageCircle, SearchCheck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { unstable_noStore as noStore } from "next/cache";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getWhatsAppHref } from "@/config/site";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";

type SuccessPageProps = {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ reference?: string }>;
};

export async function generateMetadata({ params }: SuccessPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Success" });

  return {
    robots: { follow: false, index: false, noarchive: true },
    title: t("metaTitle"),
  };
}

export default async function SuccessPage({ params, searchParams }: SuccessPageProps) {
  noStore();
  const [{ locale }, { reference }] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("Success");
  const validReference = reference && /^NQ-[0-9]{6}-[0-9]{6}$/.test(reference) ? reference : null;
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <main className="surface-grid grid min-h-[75vh] place-items-center py-14" id="main-content">
      <div className="container">
        <Card className="mx-auto max-w-2xl overflow-hidden text-center">
          <div className="bg-primary px-6 py-10 text-primary-foreground sm:px-10">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-primary-foreground text-primary shadow-lg">
              <Check aria-hidden="true" className="size-8" strokeWidth={3} />
            </span>
            <h1 className="mt-6 text-balance text-3xl font-black sm:text-4xl">{t("title")}</h1>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-primary-foreground/75">
              {t("description")}
            </p>
          </div>
          <div className="p-6 sm:p-10">
            {validReference ? (
              <>
                <p className="text-sm font-bold text-muted-foreground">{t("referenceLabel")}</p>
                <bdi
                  className="mt-3 block select-all rounded-md border border-primary/20 bg-secondary px-4 py-4 font-mono text-xl font-black tracking-wider text-primary sm:text-2xl"
                  dir="ltr"
                >
                  {validReference}
                </bdi>
                <p className="mt-3 text-sm text-muted-foreground">{t("referenceHint")}</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <a
                    className={buttonVariants({ size: "lg" })}
                    href={getWhatsAppHref(t("whatsappMessage", { reference: validReference }))}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MessageCircle aria-hidden="true" className="size-5" />
                    {t("whatsapp")}
                  </a>
                  <a
                    className={buttonVariants({ size: "lg", variant: "outline" })}
                    href={getWhatsAppHref(t("trackingMessage", { reference: validReference }))}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <SearchCheck aria-hidden="true" className="size-5" />
                    {t("track")}
                  </a>
                </div>
              </>
            ) : (
              <p className="rounded-md border border-destructive/20 bg-destructive/5 p-4 text-sm font-semibold text-destructive">
                {t("invalidReference")}
              </p>
            )}
            <Link className={cn(buttonVariants({ variant: "ghost" }), "mt-7")} href="/">
              {t("home")}
              <Arrow aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
