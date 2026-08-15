import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { Card } from "@/components/ui/card";
import { isOAuthProviderEnabled } from "@/config/auth";
import { UnifiedLoginForm } from "@/features/unified-auth/components/unified-login-form";
import { getUnifiedAuthCopy } from "@/features/unified-auth/lib/copy";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { follow: false, index: false }, title: "Naqlk Login" };

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ intent?: string; next?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = getUnifiedAuthCopy(locale);
  return (
    <main className="container grid min-h-[70vh] place-items-center py-12" id="main-content">
      <Card className="w-full max-w-lg p-6 sm:p-8">
        <h1 className="text-3xl font-black">{t.title}</h1>
        <p className="mt-3 leading-7 text-muted-foreground">{t.intro}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t.accountNote}</p>
        <div className="mt-7">
          <UnifiedLoginForm
            appleEnabled={isOAuthProviderEnabled("apple")}
            googleEnabled={isOAuthProviderEnabled("google")}
            intent={query.intent === "staff" ? "staff" : undefined}
            locale={locale}
            next={query.next}
          />
        </div>
      </Card>
    </main>
  );
}
