"use client";

import { Eye, EyeOff } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveAuthenticatedDestination } from "@/features/unified-auth/lib/client-routing";
import { getUnifiedAuthCopy } from "@/features/unified-auth/lib/copy";
import { emailSchema } from "@/features/unified-auth/lib/validation";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { createAuthCallbackUrl } from "@/lib/auth/redirect-origin";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Props = {
  authOrigin: string;
  googleEnabled: boolean;
  initialError?: boolean;
  locale: AppLocale;
  next?: string;
};

export function UnifiedLoginForm({
  authOrigin,
  googleEnabled,
  initialError = false,
  locale,
  next,
}: Props) {
  const t = getUnifiedAuthCopy(locale);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | undefined>(
    initialError ? t.genericError : undefined,
  );
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!emailSchema.safeParse(email).success || password.length < 1) {
      setMessage(t.invalidCredentials);
      return;
    }
    setPending(true);
    setMessage(undefined);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      setPending(false);
      setMessage(t.invalidCredentials);
      return;
    }
    try {
      window.location.assign(await resolveAuthenticatedDestination(supabase, locale, next));
    } catch {
      await supabase.auth.signOut();
      setPending(false);
      setMessage(t.genericError);
    }
  }

  async function continueWithGoogle() {
    setPending(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      options: { redirectTo: createAuthCallbackUrl(authOrigin, locale, next) },
      provider: "google",
    });
    if (error) {
      setPending(false);
      setMessage(t.genericError);
    }
  }

  return (
    <div className="space-y-5">
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
        <label className="block space-y-2 text-sm font-bold" htmlFor="login-password">
          <span>{t.password}</span>
          <span className="relative block">
            <Input
              autoComplete="current-password"
              className="pe-12"
              id="login-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute end-1 top-1 grid size-10 place-items-center rounded-md text-muted-foreground hover:bg-muted"
              onClick={() => setShowPassword((value) => !value)}
              type="button"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="size-4" />
              ) : (
                <Eye aria-hidden="true" className="size-4" />
              )}
            </button>
          </span>
        </label>
        <div className="flex justify-end">
          <Link className="text-sm font-bold text-primary hover:underline" href="/forgot-password">
            {t.forgotPassword}
          </Link>
        </div>
        <Button className="w-full" disabled={pending} type="submit">
          {pending ? t.submitting : t.signIn}
        </Button>
      </form>
      {googleEnabled ? (
        <Button
          className="w-full"
          disabled={pending}
          onClick={continueWithGoogle}
          variant="outline"
        >
          {t.google}
        </Button>
      ) : null}
      <div className="border-t border-border pt-5 text-center">
        <Link className="text-sm font-bold text-primary hover:underline" href="/signup">
          {t.createAccount}
        </Link>
      </div>
      {message ? (
        <p aria-live="polite" className="text-sm text-destructive" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
