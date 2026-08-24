"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  setAdminCitySeoState,
  updateAdminCitySeoContent,
} from "@/features/seo/services/seo.service";
import { getPortalContext } from "@/features/staff-portal/services/staff-portal.service";
import type { AppLocale } from "@/i18n/routing";

const slug = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const contentSchema = z.object({
  content: z.string().uuid(),
  expectedVersion: z.coerce.number().int().positive(),
  introduction: z.string().trim().min(1).max(4000),
  metaDescription: z.string().trim().min(1).max(180),
  neighborhoodCoverage: z.string().trim().max(3000),
  pageHeading: z.string().trim().min(1).max(140),
  seoTitle: z.string().trim().min(1).max(70),
  serviceAreaContent: z.string().trim().min(1).max(5000),
  slug,
});

async function requireSeoManager() {
  const context = await getPortalContext();
  if (!context?.permissions.includes("settings.seo.manage")) throw new Error("FORBIDDEN");
}

function pairedValues(formData: FormData, prefix: "faq" | "route") {
  return [0, 1, 2, 3].flatMap((index) => {
    const first = String(formData.get(`${prefix}_${index}_first`) ?? "").trim();
    const second = String(formData.get(`${prefix}_${index}_second`) ?? "").trim();
    return first && second ? [[first, second] as const] : [];
  });
}

export async function saveCitySeoContentAction(locale: AppLocale, formData: FormData) {
  await requireSeoManager();
  const parsed = contentSchema.safeParse({
    content: formData.get("content"),
    expectedVersion: formData.get("expectedVersion"),
    introduction: formData.get("introduction"),
    metaDescription: formData.get("metaDescription"),
    neighborhoodCoverage: formData.get("neighborhoodCoverage"),
    pageHeading: formData.get("pageHeading"),
    seoTitle: formData.get("seoTitle"),
    serviceAreaContent: formData.get("serviceAreaContent"),
    slug: formData.get("slug"),
  });
  if (!parsed.success) redirect(`/${locale}/settings/seo?result=invalid` as never);
  const faqs = pairedValues(formData, "faq").map(([question, answer]) => ({ answer, question }));
  const routes = pairedValues(formData, "route").map(([label, description]) => ({
    description,
    label,
  }));
  try {
    await updateAdminCitySeoContent({ ...parsed.data, faqs, routes });
  } catch {
    redirect(`/${locale}/settings/seo?result=conflict` as never);
  }
  revalidateTag("city-seo");
  revalidatePath("/sitemap.xml");
  redirect(`/${locale}/settings/seo?city=${parsed.data.content}&result=saved` as never);
}

export async function setCitySeoStateAction(locale: AppLocale, formData: FormData) {
  await requireSeoManager();
  const parsed = z
    .object({
      content: z.string().uuid(),
      indexable: z.enum(["true", "false"]),
      status: z.enum(["draft", "ready", "published"]),
    })
    .safeParse({
      content: formData.get("content"),
      indexable: formData.get("indexable"),
      status: formData.get("status"),
    });
  if (!parsed.success) redirect(`/${locale}/settings/seo?result=invalid` as never);
  try {
    await setAdminCitySeoState({
      content: parsed.data.content,
      indexable: parsed.data.indexable === "true",
      status: parsed.data.status,
    });
  } catch {
    redirect(`/${locale}/settings/seo?city=${parsed.data.content}&result=not_ready` as never);
  }
  revalidateTag("city-seo");
  revalidatePath("/sitemap.xml");
  redirect(`/${locale}/settings/seo?city=${parsed.data.content}&result=state_updated` as never);
}
