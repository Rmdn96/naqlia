import { redirect } from "next/navigation";
import type { Route } from "next";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/operations/jobs` as Route);
}
