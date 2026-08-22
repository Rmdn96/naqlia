import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AccountMenu } from "@/components/shared/account-menu";

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
    const signOut = screen.getByRole("menuitem", { name: "تسجيل الخروج" });
    const signOutForm = signOut.closest("form");
    expect(signOutForm?.getAttribute("action")).toBe("/auth/sign-out");
    expect(signOutForm?.getAttribute("method")).toBe("post");
    expect(signOutForm?.querySelector('input[name="locale"]')?.getAttribute("value")).toBe("ar");
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
});
