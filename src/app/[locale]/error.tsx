"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();

  useEffect(() => {
    void error.digest;
  }, [error]);

  return (
    <main className="container grid min-h-[65vh] place-items-center py-20" id="main-content">
      <div className="max-w-lg text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle aria-hidden="true" className="size-7" />
        </span>
        <h1 className="mt-5 text-3xl font-black">
          {locale === "ar" ? "تعذّر تحميل الصفحة" : "This page could not be loaded"}
        </h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          {locale === "ar"
            ? "لم نفقد أي طلب مُرسل. حاول تحميل الصفحة مرة أخرى."
            : "No submitted request was lost. Try loading the page again."}
        </p>
        <Button className="mt-8" onClick={reset}>
          <RotateCcw aria-hidden="true" className="size-4" />
          {locale === "ar" ? "إعادة المحاولة" : "Try again"}
        </Button>
      </div>
    </main>
  );
}
