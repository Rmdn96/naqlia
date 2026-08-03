import { getTranslations } from "next-intl/server";

import { Brand } from "@/components/shared/brand";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("Common");

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container grid gap-8 py-10 md:grid-cols-[1fr_auto] md:items-end">
        <div className="[&_a]:text-primary-foreground [&_span]:text-primary-foreground/75">
          <Brand />
          <p className="mt-5 max-w-xl text-sm leading-7 text-primary-foreground/75">
            {t("footerText")}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
          <Link className="hover:underline" href="/request">
            {t("startRequest")}
          </Link>
          <Link className="hover:underline" href="/privacy">
            {t("privacy")}
          </Link>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="container py-4 text-xs text-primary-foreground/65">
          © {new Date().getFullYear()} {t("copyright")}
        </div>
      </div>
    </footer>
  );
}
