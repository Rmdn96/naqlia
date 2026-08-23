import { type NextRequest, NextResponse } from "next/server";

import {
  PASSWORD_RECOVERY_CONTEXT_COOKIE,
  PASSWORD_RECOVERY_CONTEXT_VALUE,
  PASSWORD_RECOVERY_RESET_INTENT_HEADER,
  PASSWORD_RECOVERY_RESET_INTENT_VALUE,
} from "@/config/auth";
import { passwordSchema } from "@/features/unified-auth/lib/validation";
import type { AppLocale } from "@/i18n/routing";
import {
  getForwardedRequestOrigin,
  isApprovedServerAuthOrigin,
} from "@/lib/auth/redirect-origin.server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function approvedRequestOrigin(request: NextRequest): string | null {
  const explicitOrigin = request.headers.get("origin");
  if (explicitOrigin) return isApprovedServerAuthOrigin(explicitOrigin) ? explicitOrigin : null;

  const forwardedOrigin = getForwardedRequestOrigin(request.headers);
  const hasIntent =
    request.headers.get(PASSWORD_RECOVERY_RESET_INTENT_HEADER) ===
    PASSWORD_RECOVERY_RESET_INTENT_VALUE;
  const sameOrigin = request.headers.get("sec-fetch-site") !== "cross-site";
  return hasIntent && sameOrigin && isApprovedServerAuthOrigin(forwardedOrigin)
    ? forwardedOrigin
    : null;
}

function clearRecoveryContext(response: NextResponse, secure: boolean) {
  response.cookies.set(PASSWORD_RECOVERY_CONTEXT_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "strict",
    secure,
  });
}

function failure(status: number, secure: boolean) {
  const response = NextResponse.json({ ok: false }, { status });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  if (status === 401 || status === 403) clearRecoveryContext(response, secure);
  return response;
}

export async function POST(request: NextRequest) {
  const requestOrigin = approvedRequestOrigin(request);
  const secure = request.nextUrl.protocol === "https:";
  if (!requestOrigin) return failure(403, secure);

  const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const locale: AppLocale = payload?.locale === "en" ? "en" : "ar";
  const password = passwordSchema.safeParse(payload?.password);
  const confirmation = passwordSchema.safeParse(payload?.confirmation);
  if (!password.success || !confirmation.success || password.data !== confirmation.data) {
    return failure(400, secure);
  }

  if (
    request.cookies.get(PASSWORD_RECOVERY_CONTEXT_COOKIE)?.value !== PASSWORD_RECOVERY_CONTEXT_VALUE
  ) {
    return failure(403, secure);
  }

  const response = NextResponse.json({ ok: true, redirect: `/${locale}/login?reset=success` });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Clear-Site-Data", '"cache"');
  response.headers.set("Referrer-Policy", "no-referrer");
  const supabase = createRouteHandlerSupabaseClient(request, response);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return failure(401, secure);

  const { error: updateError } = await supabase.auth.updateUser({ password: password.data });
  if (updateError) return failure(400, secure);

  await supabase.auth.signOut({ scope: "local" });
  clearRecoveryContext(response, secure);
  return response;
}
