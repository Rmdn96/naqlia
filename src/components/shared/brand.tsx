import { PackageCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export async function Brand() {
  const t = await getTranslations("Common");

  return (
    <Link className="inline-flex items-center gap-3 rounded-md" href="/">
      <span className="grid size-11 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
        <PackageCheck aria-hidden="true" className="size-6" strokeWidth={2.2} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-xl font-black tracking-tight">{t("brand")}</span>
        <span className="mt-1 hidden text-[0.68rem] font-medium text-muted-foreground sm:block">
          {t("brandTagline")}
        </span>
      </span>
    </Link>
  );
}
