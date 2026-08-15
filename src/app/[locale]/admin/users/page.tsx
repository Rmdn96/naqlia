import type { Metadata } from "next";
import { UserManagementView } from "@/features/staff-portal/components/user-management-view";
import { getUsers } from "@/features/staff-portal/services/administration.service";
import type { AppLocale } from "@/i18n/routing";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function UsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ result?: string; role?: string; search?: string; status?: string }>;
}) {
  const { locale } = await params;
  const q = await searchParams;
  return (
    <UserManagementView
      locale={locale}
      payload={await getUsers(q.search, q.role, q.status)}
      query={q}
      result={q.result}
    />
  );
}
