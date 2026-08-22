import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

import { getSupabasePublicEnvironment } from "@/config/env";
import type { Database } from "@/types/supabase";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const { publishableKey, url } = getSupabasePublicEnvironment();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. Middleware refreshes the session.
        }
      },
    },
  });
}

export function createRouteHandlerSupabaseClient(request: NextRequest, response: NextResponse) {
  const { publishableKey, url } = getSupabasePublicEnvironment();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, options, value }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}

export function isSupabaseAuthCookie(name: string, supabaseUrl: string): boolean {
  const projectReference = new URL(supabaseUrl).hostname.split(".")[0];
  const authCookieName = `sb-${projectReference}-auth-token`;
  return name === authCookieName || name.startsWith(`${authCookieName}.`);
}

export async function terminateRouteSupabaseSession(request: NextRequest, response: NextResponse) {
  const supabase = createRouteHandlerSupabaseClient(request, response);
  const { error } = await supabase.auth.signOut({ scope: "local" });
  const { url } = getSupabasePublicEnvironment();

  // signOut writes the normal expiry cookies through setAll. Expire any incoming
  // SSR chunks as a fail-closed fallback so middleware cannot refresh stale state.
  request.cookies.getAll().forEach(({ name }) => {
    if (!isSupabaseAuthCookie(name, url)) return;
    response.cookies.set(name, "", {
      httpOnly: false,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
  });

  return { error };
}
