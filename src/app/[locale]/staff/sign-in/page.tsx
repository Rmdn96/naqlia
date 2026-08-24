import { redirect } from "next/navigation";
import type { AppLocale } from "@/i18n/routing";

type StaffSignInPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
};
export default async function StaffSignInPage({ params, searchParams }: StaffSignInPageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const query = await searchParams;
  const next =
    query.next?.startsWith("/") && !query.next.startsWith("//")
      ? `&next=${encodeURIComponent(query.next)}`
      : "";
  redirect(`/${locale}/login?intent=staff${next}` as never);
}
