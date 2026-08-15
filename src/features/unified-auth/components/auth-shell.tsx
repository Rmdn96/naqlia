import type { ReactNode } from "react";

import { BrandMark } from "@/components/shared/brand";
import { Card } from "@/components/ui/card";
import type { AppLocale } from "@/i18n/routing";

export function AuthShell({
  children,
  description,
  locale,
  title,
}: {
  children: ReactNode;
  description: string;
  locale: AppLocale;
  title: string;
}) {
  return (
    <main
      className="auth-surface grid min-h-[calc(100vh-5rem)] place-items-center px-4 py-12"
      id="main-content"
    >
      <Card className="w-full max-w-lg border-white/70 bg-card/95 p-6 shadow-2xl backdrop-blur sm:p-9">
        <div className="mb-8">
          <BrandMark locale={locale} />
        </div>
        <h1 className="text-balance text-3xl font-black tracking-tight">{title}</h1>
        <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
        <div className="mt-7">{children}</div>
      </Card>
    </main>
  );
}
