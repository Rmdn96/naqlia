import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AccountMenu, signOutAccount } from "@/components/shared/account-menu";

const mocks = vi.hoisted(() => ({ signOut: vi.fn() }));

vi.mock("@/lib/supabase/client", () => ({
  createBrowserSupabaseClient: () => ({ auth: { signOut: mocks.signOut } }),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
    function MockLink({ children, href, ...props }, ref) {
      return (
        <a href={String(href)} ref={ref} {...props}>
          {children}
        </a>
      );
    },
  ),
}));

describe("authenticated Header account menu", () => {
  afterEach(cleanup);

  beforeEach(() => {
    mocks.signOut.mockReset();
    mocks.signOut.mockResolvedValue({ error: null });
  });

  it("shows the localized Customer account and Sign Out actions", () => {
    render(
      <AccountMenu
        accountLabel="حسابي"
        dashboardLabel="لوحة التحكم"
        hasCustomerContext
        isStaff={false}
        label="حسابي"
        locale="ar"
        signOutLabel="تسجيل الخروج"
      />,
    );

    const trigger = screen.getByRole("button", { name: "حسابي" });
    fireEvent.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("menu")).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "حسابي" }).getAttribute("href")).toBe("/account");
    expect(screen.getByRole("menuitem", { name: "تسجيل الخروج" })).toBeTruthy();
    expect(screen.queryByRole("menuitem", { name: "لوحة التحكم" })).toBeNull();
  });

  it("uses server-resolved contexts to compose Staff and Customer actions", () => {
    const { rerender } = render(
      <AccountMenu
        accountLabel="My Account"
        dashboardLabel="Dashboard"
        hasCustomerContext
        isStaff
        label="Dashboard"
        locale="en"
        signOutLabel="Sign Out"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Dashboard" }));
    expect(screen.getByRole("menuitem", { name: "Dashboard" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "My Account" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Sign Out" })).toBeTruthy();

    rerender(
      <AccountMenu
        accountLabel="My Account"
        dashboardLabel="Dashboard"
        hasCustomerContext={false}
        isStaff
        label="Dashboard"
        locale="en"
        signOutLabel="Sign Out"
      />,
    );
    expect(screen.queryByRole("menuitem", { name: "My Account" })).toBeNull();
  });

  it("returns focus to the trigger when Escape closes the menu", async () => {
    render(
      <AccountMenu
        accountLabel="My Account"
        dashboardLabel="Dashboard"
        hasCustomerContext
        isStaff={false}
        label="My Account"
        locale="en"
        signOutLabel="Sign Out"
      />,
    );

    const trigger = screen.getByRole("button", { name: "My Account" });
    fireEvent.click(trigger);
    const accountItem = screen.getByRole("menuitem", { name: "My Account" });
    await waitFor(() => expect(document.activeElement).toBe(accountItem));
    fireEvent.keyDown(accountItem, { key: "Escape" });
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("ends the Supabase session before replacing the localized public route", async () => {
    const navigate = vi.fn();

    await expect(signOutAccount("ar", navigate)).resolves.toBe(true);

    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith("/ar");
  });

  it("does not navigate if Supabase cannot end the session", async () => {
    const navigate = vi.fn();
    mocks.signOut.mockResolvedValueOnce({ error: new Error("unavailable") });

    await expect(signOutAccount("en", navigate)).resolves.toBe(false);

    expect(navigate).not.toHaveBeenCalled();
  });
});
