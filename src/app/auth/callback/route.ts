import { type NextRequest, NextResponse } from "next/server";

import {
  PASSWORD_RECOVERY_CONTEXT_COOKIE,
  PASSWORD_RECOVERY_CONTEXT_MAX_AGE_SECONDS,
  PASSWORD_RECOVERY_CONTEXT_VALUE,
} from "@/config/auth";
import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { isStaffPath } from "@/lib/auth/identity-context";
import { resolveServerAuthRedirectOrigin } from "@/lib/auth/redirect-origin.server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function createRedirect(
  request: NextRequest,
  path: string,
  result?: "error",
  recoveryContext = false,
) {
  const redirectUrl = new URL(path, resolveServerAuthRedirectOrigin(request.nextUrl.origin));

  if (result) {
    redirectUrl.searchParams.set("auth_result", result);
  }

  const response = NextResponse.redirect(redirectUrl);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");

  if (recoveryContext) {
    response.cookies.set(PASSWORD_RECOVERY_CONTEXT_COOKIE, PASSWORD_RECOVERY_CONTEXT_VALUE, {
      httpOnly: true,
      maxAge: PASSWORD_RECOVERY_CONTEXT_MAX_AGE_SECONDS,
      path: "/",
      // Recovery begins from a cross-site email link. Lax allows this short-lived,
      // HttpOnly context cookie to survive the top-level callback redirect while
      // the reset mutation remains protected by its same-origin intent checks.
      sameSite: "lax",
      secure: redirectUrl.protocol === "https:",
    });
  }

  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const tokenType = request.nextUrl.searchParams.get("type");
  const locale = request.nextUrl.searchParams.get("locale") === "en" ? "en" : "ar";
  const recovery = request.nextUrl.searchParams.get("recovery") === "true";
  const errorPath = `/${locale}/login`;

  if ((!code && !tokenHash) || request.nextUrl.searchParams.has("error")) {
    return createRedirect(request, errorPath, "error");
  }

  const supabase = await createServerSupabaseClient();
  const allowedTokenTypes = ["invite", "magiclink", "recovery", "signup"] as const;
  const verifiedType = allowedTokenTypes.find((value) => value === tokenType);
  let error: Error | null = null;
  let verifiedRecovery = false;

  if (code) {
    const exchange = await supabase.auth.exchangeCodeForSession(code);
    error = exchange.error;
    verifiedRecovery =
      (exchange.data as typeof exchange.data & { redirectType?: string | null }).redirectType ===
      "recovery";
  } else if (verifiedType && tokenHash) {
    const verification = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: verifiedType,
    });
    error = verification.error;
    verifiedRecovery = verifiedType === "recovery";
  } else {
    error = new Error("Unsupported authentication callback");
  }

  if (error || (recovery && !verifiedRecovery)) {
    return createRedirect(request, errorPath, "error");
  }
  const { data, error: contextError } = await supabase.rpc("resolve_identity_context");
  if (contextError || !data || typeof data !== "object" || Array.isArray(data)) {
    return createRedirect(request, errorPath, "error");
  }
  const isStaff = (data as { is_staff?: boolean }).is_staff === true;
  const requestedPath = verifiedRecovery
    ? `/${locale}/reset-password`
    : getSafeRedirectPath(request.nextUrl.searchParams.get("next"));
  const destination =
    requestedPath !== "/" && (!isStaffPath(requestedPath) || isStaff)
      ? requestedPath
      : isStaff
        ? `/${locale}/dashboard`
        : `/${locale}/account`;
  return createRedirect(request, destination, undefined, verifiedRecovery);
}
