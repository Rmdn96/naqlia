import { JobDetail } from "@/features/operations/components/job-detail";
import { getOperationsJob } from "@/features/operations/services/operations.service";
import type { AppLocale } from "@/i18n/routing";
export default async function Page({
  params,
}: {
  params: Promise<{ jobId: string; locale: AppLocale }>;
}) {
  const { jobId, locale } = await params;
  return <JobDetail detail={await getOperationsJob(jobId)} locale={locale} />;
}
