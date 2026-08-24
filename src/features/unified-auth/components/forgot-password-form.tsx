"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUnifiedAuthCopy } from "@/features/unified-auth/lib/copy";
import { emailSchema } from "@/features/unified-auth/lib/validation";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { createPasswordRecoveryCallbackUrl } from "@/lib/auth/redirect-origin";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function ForgotPasswordForm({
  authOrigin,
  locale,
}: {
  authOrigin: string;
  locale: AppLocale;
}) {
  const t = getUnifiedAuthCopy(locale);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = emailSchema.safeParse(new FormData(event.currentTarget).get("email"));
    if (!email.success) {
      setMessage(t.invalidEmail);
      return;
    }
    setPending(true);
    await createBrowserSupabaseClient().auth.resetPasswordForEmail(email.data, {
      redirectTo: createPasswordRecoveryCallbackUrl(authOrigin, locale),
    });
    setPending(false);
    setMessage(t.forgotSuccess);
  }
  return (
    <form className="space-y-4" noValidate onSubmit={submit}>
      <label className="block space-y-2 text-sm font-bold" htmlFor="forgot-email">
        <span>{t.email}</span>
        <Input
          autoComplete="email"
          id="forgot-email"
          inputMode="email"
          maxLength={254}
          name="email"
          required
          type="email"
        />
      </label>
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? t.submitting : t.forgotSubmit}
      </Button>
      {message ? (
        <p aria-live="polite" className="text-sm text-foreground" role="status">
          {message}
        </p>
      ) : null}
      <div className="text-center">
        <Link className="text-sm font-bold text-primary hover:underline" href="/login">
          {t.backToLogin}
        </Link>
      </div>
    </form>
  );
}
