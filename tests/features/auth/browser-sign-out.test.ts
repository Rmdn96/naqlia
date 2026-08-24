import { describe, expect, it, vi } from "vitest";

import { signOutFromBrowser } from "@/lib/auth/sign-out.client";

describe("browser sign out transport", () => {
  it("posts the same-origin intent and replaces navigation with the Arabic homepage", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, redirected: true });
    const replace = vi.fn();

    await signOutFromBrowser("ar", { fetcher: fetcher as unknown as typeof fetch, replace });

    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/auth/sign-out");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("same-origin");
    expect(init.redirect).toBe("follow");
    expect(init.headers).toMatchObject({ "x-naqlk-logout": "same-origin" });
    expect(String(init.body)).toBe("locale=ar");
    expect(replace).toHaveBeenCalledWith("/ar");
  });

  it("uses the English destination without trusting a response redirect target", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      redirected: true,
      url: "https://attacker.invalid/",
    });
    const replace = vi.fn();

    await signOutFromBrowser("en", { fetcher: fetcher as unknown as typeof fetch, replace });

    expect(replace).toHaveBeenCalledWith("/en");
  });

  it("does not navigate when the server rejects the request", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, redirected: false });
    const replace = vi.fn();

    await expect(
      signOutFromBrowser("ar", { fetcher: fetcher as unknown as typeof fetch, replace }),
    ).rejects.toThrow("SIGN_OUT_FAILED");
    expect(replace).not.toHaveBeenCalled();
  });
});
