import { redirect } from "next/navigation";
import type { Route } from "next";
import type { AppLocale } from "@/i18n/routing";
export default async function Page({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  redirect(`/${locale}/quality/reviews` as Route);
}
