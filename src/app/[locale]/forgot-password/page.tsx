import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { AuthShell } from "@/features/unified-auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/unified-auth/components/forgot-password-form";
import { getUnifiedAuthCopy } from "@/features/unified-auth/lib/copy";
import type { AppLocale } from "@/i18n/routing";
import { getRequestAuthRedirectOrigin } from "@/lib/auth/redirect-origin.server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Naqlk Password Reset",
};

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getUnifiedAuthCopy(locale);
  const authOrigin = await getRequestAuthRedirectOrigin();
  return (
    <AuthShell description={t.forgotDescription} locale={locale} title={t.forgotTitle}>
      <ForgotPasswordForm authOrigin={authOrigin} locale={locale} />
    </AuthShell>
  );
}
