import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CustomerAccountView } from "@/features/customer-account/components/customer-account-view";
import { getCustomerAccountDashboard } from "@/features/customer-account/services/customer-account.service";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: { follow: false, index: false, noarchive: true, nocache: true },
};

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const { locale } = await params;
  const result = await searchParams;
  const account = await getCustomerAccountDashboard();
  if (!account) redirect(`/${locale}/login?next=/${locale}/account` as never);
  return (
    <CustomerAccountView
      dashboard={account.dashboard}
      isStaff={account.context.is_staff}
      locale={locale}
      result={result.result}
    />
  );
}
