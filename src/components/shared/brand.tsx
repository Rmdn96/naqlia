import { getLocale } from "next-intl/server";

import { getBrandName, getBrandTagline, type BrandLocale } from "@/config/brand";
import { Link } from "@/i18n/navigation";

export function BrandMark({ locale }: { locale: BrandLocale }) {
  return (
    <Link
      aria-label={getBrandName(locale)}
      className="inline-flex items-center gap-3 rounded-md"
      href="/"
    >
      <span className="grid size-11 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
        <span aria-hidden="true" className="text-sm font-black tracking-tight">
          NQ
        </span>
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-xl font-black tracking-tight">{getBrandName(locale)}</span>
        <span className="mt-1 hidden text-[0.68rem] font-medium text-muted-foreground sm:block">
          {getBrandTagline(locale)}
        </span>
      </span>
    </Link>
  );
}

export async function Brand() {
  const locale = (await getLocale()) as BrandLocale;

  return <BrandMark locale={locale} />;
}
