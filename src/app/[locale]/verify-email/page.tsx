import type { Metadata } from "next";
import { CheckCircle2, MailCheck } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

import { AuthShell } from "@/features/unified-auth/components/auth-shell";
import { buttonVariants } from "@/components/ui/button";
import { getUnifiedAuthCopy } from "@/features/unified-auth/lib/copy";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Naqlk Email Verification",
};

export default async function VerifyEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ verified?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = getUnifiedAuthCopy(locale);
  const verified = query.verified === "true";
  return (
    <AuthShell
      description={verified ? t.verifySuccess : t.verifyDescription}
      locale={locale}
      title={t.verifyTitle}
    >
      <div className="space-y-6 text-center">
        {verified ? (
          <CheckCircle2 aria-hidden="true" className="mx-auto size-14 text-emerald-600" />
        ) : (
          <MailCheck aria-hidden="true" className="mx-auto size-14 text-primary" />
        )}
        <Link className={buttonVariants()} href={verified ? "/account" : "/login"}>
          {verified
            ? locale === "ar"
              ? "متابعة إلى الحساب"
              : "Continue to account"
            : t.backToLogin}
        </Link>
      </div>
    </AuthShell>
  );
}
