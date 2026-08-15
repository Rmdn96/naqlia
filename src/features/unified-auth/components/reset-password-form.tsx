"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveAuthenticatedDestination } from "@/features/unified-auth/lib/client-routing";
import { getUnifiedAuthCopy } from "@/features/unified-auth/lib/copy";
import { passwordSchema } from "@/features/unified-auth/lib/validation";
import type { AppLocale } from "@/i18n/routing";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function ResetPasswordForm({ locale }: { locale: AppLocale }) {
  const t = getUnifiedAuthCopy(locale);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = form.get("password");
    const confirmation = form.get("confirmation");
    if (!passwordSchema.safeParse(password).success || password !== confirmation) {
      setMessage(t.validationError);
      return;
    }
    setPending(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password: String(password) });
    if (error) {
      setPending(false);
      setMessage(t.genericError);
      return;
    }
    try {
      window.location.assign(await resolveAuthenticatedDestination(supabase, locale));
    } catch {
      setPending(false);
      setMessage(t.genericError);
    }
  }
  return (
    <form className="space-y-4" noValidate onSubmit={submit}>
      <label className="block space-y-2 text-sm font-bold" htmlFor="reset-password">
        <span>{t.password}</span>
        <Input
          aria-describedby="reset-hint"
          autoComplete="new-password"
          id="reset-password"
          maxLength={72}
          minLength={12}
          name="password"
          required
          type="password"
        />
        <span className="block text-xs font-normal text-muted-foreground" id="reset-hint">
          {t.passwordHint}
        </span>
      </label>
      <label className="block space-y-2 text-sm font-bold" htmlFor="reset-confirm">
        <span>{t.confirmPassword}</span>
        <Input
          autoComplete="new-password"
          id="reset-confirm"
          maxLength={72}
          minLength={12}
          name="confirmation"
          required
          type="password"
        />
      </label>
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? t.submitting : t.resetSubmit}
      </Button>
      {message ? (
        <p aria-live="polite" className="text-sm text-destructive" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
