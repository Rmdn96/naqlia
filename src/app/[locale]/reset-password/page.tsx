import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { AuthShell } from "@/features/unified-auth/components/auth-shell";
import { ResetPasswordForm } from "@/features/unified-auth/components/reset-password-form";
import { getUnifiedAuthCopy } from "@/features/unified-auth/lib/copy";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Naqlk Password Reset",
};

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getUnifiedAuthCopy(locale);
  return (
    <AuthShell description={t.resetDescription} locale={locale} title={t.resetTitle}>
      <ResetPasswordForm locale={locale} />
    </AuthShell>
  );
}
