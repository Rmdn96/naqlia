"use client";

import type { AppLocale } from "@/i18n/routing";
import { SIGN_OUT_INTENT_HEADER, SIGN_OUT_INTENT_VALUE } from "@/lib/auth/sign-out";

type SignOutBrowserRuntime = {
  fetcher?: typeof fetch;
  replace?: (path: string) => void;
};

export async function signOutFromBrowser(
  locale: AppLocale,
  runtime: SignOutBrowserRuntime = {},
): Promise<void> {
  const fetcher = runtime.fetcher ?? fetch;
  const response = await fetcher("/auth/sign-out", {
    body: new URLSearchParams({ locale }),
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      [SIGN_OUT_INTENT_HEADER]: SIGN_OUT_INTENT_VALUE,
    },
    method: "POST",
    redirect: "follow",
  });

  if (!response.ok || !response.redirected) {
    throw new Error("SIGN_OUT_FAILED");
  }

  const replace = runtime.replace ?? window.location.replace.bind(window.location);
  replace(locale === "en" ? "/en" : "/ar");
}
