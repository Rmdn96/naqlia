import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { PASSWORD_RECOVERY_CONTEXT_COOKIE, PASSWORD_RECOVERY_CONTEXT_VALUE } from "@/config/auth";
import { AuthShell } from "@/features/unified-auth/components/auth-shell";
import { ResetPasswordForm } from "@/features/unified-auth/components/reset-password-form";
import { getUnifiedAuthCopy } from "@/features/unified-auth/lib/copy";
import type { AppLocale } from "@/i18n/routing";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
  const cookieStore = await cookies();
  const recoveryContext =
    cookieStore.get(PASSWORD_RECOVERY_CONTEXT_COOKIE)?.value === PASSWORD_RECOVERY_CONTEXT_VALUE;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!recoveryContext || !user) {
    redirect(`/${locale}/login?auth_result=error` as never);
  }

  const t = getUnifiedAuthCopy(locale);
  return (
    <AuthShell description={t.resetDescription} locale={locale} title={t.resetTitle}>
      <ResetPasswordForm locale={locale} />
    </AuthShell>
  );
}
