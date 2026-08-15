"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUnifiedAuthCopy } from "@/features/unified-auth/lib/copy";
import type { AppLocale } from "@/i18n/routing";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Props = {
  appleEnabled: boolean;
  googleEnabled: boolean;
  intent?: "staff";
  locale: AppLocale;
  next?: string;
};

function createCallbackUrl(locale: AppLocale, intent?: "staff", next?: string) {
  const callback = new URL("/auth/callback", window.location.origin);
  callback.searchParams.set("locale", locale);
  if (intent) callback.searchParams.set("intent", intent);
  if (next?.startsWith("/") && !next.startsWith("//")) callback.searchParams.set("next", next);
  return callback.toString();
}

export function UnifiedLoginForm({ appleEnabled, googleEnabled, intent, locale, next }: Props) {
  const t = getUnifiedAuthCopy(locale);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      setError(true);
      setMessage(t.invalid);
      return;
    }
    setPending(true);
    const supabase = createBrowserSupabaseClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: createCallbackUrl(locale, intent, next),
        shouldCreateUser: true,
      },
    });
    setPending(false);
    setError(Boolean(authError));
    setMessage(authError ? t.error : t.success);
  }

  async function continueWithProvider(provider: "apple" | "google") {
    setPending(true);
    const supabase = createBrowserSupabaseClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      options: { redirectTo: createCallbackUrl(locale, intent, next) },
      provider,
    });
    if (authError) {
      setPending(false);
      setError(true);
      setMessage(t.error);
    }
  }

  return (
    <div className="space-y-4">
      <form className="space-y-4" noValidate onSubmit={submit}>
        <label className="block space-y-2 text-sm font-bold" htmlFor="login-email">
          <span>{t.email}</span>
          <Input
            autoComplete="email"
            id="login-email"
            inputMode="email"
            maxLength={254}
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <Button className="w-full" disabled={pending} type="submit">
          {pending ? t.submitting : t.submit}
        </Button>
      </form>
      {googleEnabled ? (
        <Button
          className="w-full"
          disabled={pending}
          onClick={() => continueWithProvider("google")}
          variant="outline"
        >
          {t.google}
        </Button>
      ) : null}
      {appleEnabled ? (
        <Button
          className="w-full"
          disabled={pending}
          onClick={() => continueWithProvider("apple")}
          variant="outline"
        >
          {t.apple}
        </Button>
      ) : null}
      {message ? (
        <p
          aria-live="polite"
          className={error ? "text-sm text-destructive" : "text-sm text-foreground"}
          role={error ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
