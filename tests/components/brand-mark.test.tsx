import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BrandMark } from "@/components/shared/brand";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

describe("BrandMark", () => {
  it("renders the approved Arabic mark and tagline", () => {
    render(<BrandMark locale="ar" />);
    expect(screen.getByRole("link", { name: "نقلك" }).textContent).toContain("نقلك");
    expect(screen.getByText("نقلك... ننقل كل ما يهمك")).toBeTruthy();
  });

  it("renders the approved English mark and tagline", () => {
    render(<BrandMark locale="en" />);
    expect(screen.getByRole("link", { name: "Naqlk" }).textContent).toContain("Naqlk");
    expect(screen.getByText("Your move. Everything that matters.")).toBeTruthy();
  });
});
