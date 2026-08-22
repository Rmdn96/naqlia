import { type NextRequest, NextResponse } from "next/server";

import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { isStaffPath } from "@/lib/auth/identity-context";
import { resolveServerAuthRedirectOrigin } from "@/lib/auth/redirect-origin.server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function createRedirect(request: NextRequest, path: string, result?: "error") {
  const redirectUrl = new URL(path, resolveServerAuthRedirectOrigin(request.nextUrl.origin));

  if (result) {
    redirectUrl.searchParams.set("auth_result", result);
  }

  const response = NextResponse.redirect(redirectUrl);
  response.headers.set("Cache-Control", "private, no-store");

  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const tokenType = request.nextUrl.searchParams.get("type");
  const locale = request.nextUrl.searchParams.get("locale") === "en" ? "en" : "ar";
  const recovery = request.nextUrl.searchParams.get("recovery") === "true";
  const requestedPath = recovery
    ? `/${locale}/reset-password`
    : getSafeRedirectPath(request.nextUrl.searchParams.get("next"));
  const errorPath = `/${locale}/login`;

  if ((!code && !tokenHash) || request.nextUrl.searchParams.has("error")) {
    return createRedirect(request, errorPath, "error");
  }

  const supabase = await createServerSupabaseClient();
  const allowedTokenTypes = ["invite", "magiclink", "recovery", "signup"] as const;
  const verifiedType = allowedTokenTypes.find((value) => value === tokenType);
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : verifiedType && tokenHash
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: verifiedType })
      : { error: new Error("Unsupported authentication callback") };

  if (error) {
    return createRedirect(request, errorPath, "error");
  }
  const { data, error: contextError } = await supabase.rpc("resolve_identity_context");
  if (contextError || !data || typeof data !== "object" || Array.isArray(data)) {
    return createRedirect(request, errorPath, "error");
  }
  const isStaff = (data as { is_staff?: boolean }).is_staff === true;
  const destination =
    requestedPath !== "/" && (!isStaffPath(requestedPath) || isStaff)
      ? requestedPath
      : isStaff
        ? `/${locale}/dashboard`
        : `/${locale}/account`;
  return createRedirect(request, destination);
}
