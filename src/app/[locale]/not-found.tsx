import { ArrowLeft, ArrowRight } from "lucide-react";
import { getLocale } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";

export default async function NotFound() {
  const locale = await getLocale();
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <main className="container grid min-h-[65vh] place-items-center py-20" id="main-content">
      <div className="max-w-lg text-center">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-accent">404</p>
        <h1 className="mt-4 text-3xl font-black">
          {locale === "ar" ? "الصفحة غير موجودة" : "Page not found"}
        </h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          {locale === "ar"
            ? "قد يكون الرابط تغيّر أو لم يعد متاحًا."
            : "The link may have changed or is no longer available."}
        </p>
        <Link className={cn(buttonVariants(), "mt-8")} href="/">
          {locale === "ar" ? "العودة للرئيسية" : "Back to homepage"}
          <Arrow aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </main>
  );
}
