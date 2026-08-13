import { JobInbox } from "@/features/operations/components/job-inbox";
import { listOperationsJobs } from "@/features/operations/services/operations.service";
import type { AppLocale } from "@/i18n/routing";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const page = await listOperationsJobs({
    page: Number(query.page) || 1,
    search: query.search,
    status: query.status,
  });
  return <JobInbox locale={locale} page={page} />;
}
