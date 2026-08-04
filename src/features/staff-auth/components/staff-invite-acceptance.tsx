"use client";

import { useEffect, useState } from "react";

import type { AppLocale } from "@/i18n/routing";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type StaffInviteAcceptanceProps = {
  errorMessage: string;
  locale: AppLocale;
  pendingMessage: string;
};

export function StaffInviteAcceptance({
  errorMessage,
  locale,
  pendingMessage,
}: StaffInviteAcceptanceProps) {
  const [message, setMessage] = useState(pendingMessage);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function acceptInvitation() {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = fragment.get("access_token");
      const refreshToken = fragment.get("refresh_token");

      if (!accessToken || !refreshToken) {
        setIsError(true);
        setMessage(errorMessage);
        return;
      }

      window.history.replaceState(null, "", window.location.pathname);
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        setIsError(true);
        setMessage(errorMessage);
        return;
      }

      window.location.replace(`/${locale}/sales/leads`);
    }

    void acceptInvitation();
  }, [errorMessage, locale]);

  return (
    <p
      aria-live="polite"
      className={
        isError ? "text-center font-medium text-destructive" : "text-center text-foreground"
      }
      role={isError ? "alert" : "status"}
    >
      {message}
    </p>
  );
}
