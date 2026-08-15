import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { AuthShell } from "@/features/unified-auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/unified-auth/components/forgot-password-form";
import { getUnifiedAuthCopy } from "@/features/unified-auth/lib/copy";
import type { AppLocale } from "@/i18n/routing";

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
  return (
    <AuthShell description={t.forgotDescription} locale={locale} title={t.forgotTitle}>
      <ForgotPasswordForm locale={locale} />
    </AuthShell>
  );
}
