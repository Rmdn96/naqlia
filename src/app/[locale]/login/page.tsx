import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { isOAuthProviderEnabled } from "@/config/auth";
import { AuthShell } from "@/features/unified-auth/components/auth-shell";
import { UnifiedLoginForm } from "@/features/unified-auth/components/unified-login-form";
import { getUnifiedAuthCopy } from "@/features/unified-auth/lib/copy";
import type { AppLocale } from "@/i18n/routing";
import { getRequestAuthRedirectOrigin } from "@/lib/auth/redirect-origin.server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { follow: false, index: false }, title: "Naqlk Login" };

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ auth_result?: string; intent?: string; next?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = getUnifiedAuthCopy(locale);
  const authOrigin = await getRequestAuthRedirectOrigin();
  return (
    <AuthShell description={`${t.intro} ${t.accountNote}`} locale={locale} title={t.title}>
      <UnifiedLoginForm
        authOrigin={authOrigin}
        googleEnabled={isOAuthProviderEnabled("google")}
        initialError={query.auth_result === "error"}
        locale={locale}
        next={query.next}
      />
    </AuthShell>
  );
}
