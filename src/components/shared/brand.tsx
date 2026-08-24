import { getLocale } from "next-intl/server";
import Image from "next/image";

import { getBrandName, getBrandTagline, type BrandLocale } from "@/config/brand";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";

export function BrandMark({
  compact = false,
  inverse = false,
  locale,
}: {
  compact?: boolean;
  inverse?: boolean;
  locale: BrandLocale;
}) {
  return (
    <Link
      aria-label={getBrandName(locale)}
      className={cn("inline-flex items-center gap-2 rounded-md", inverse && "text-white")}
      href="/"
    >
      <Image
        alt=""
        aria-hidden="true"
        className="h-11 w-auto"
        height={44}
        src={inverse ? "/brand/naqlk-mark-light.svg" : "/brand/naqlk-mark.svg"}
        width={59}
      />
      <span className="flex flex-col leading-none">
        <span className="text-xl font-black tracking-tight">
          {getBrandName(locale)}{" "}
          <span className={cn("text-base", inverse ? "text-white/70" : "text-muted-foreground")}>
            {locale === "ar" ? "| Naqlk" : "| نقلك"}
          </span>
        </span>
        <span
          className={cn(
            "mt-1 hidden text-[0.65rem] font-medium sm:block",
            inverse ? "text-white/65" : "text-muted-foreground",
            compact && "lg:hidden",
          )}
        >
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
