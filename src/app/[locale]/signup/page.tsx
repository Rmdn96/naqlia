import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { AuthShell } from "@/features/unified-auth/components/auth-shell";
import { SignUpForm } from "@/features/unified-auth/components/sign-up-form";
import { getUnifiedAuthCopy } from "@/features/unified-auth/lib/copy";
import type { AppLocale } from "@/i18n/routing";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Naqlk Account",
};

export default async function SignUpPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getUnifiedAuthCopy(locale);
  return (
    <AuthShell description={t.signUpDescription} locale={locale} title={t.signUpTitle}>
      <SignUpForm locale={locale} />
    </AuthShell>
  );
}
