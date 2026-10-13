import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";

import { ContactNumberPicker } from "@/components/shared/contact-number-picker";
import { CONTACT_NUMBERS } from "@/config/contact";
import en from "../../messages/en.json";

const originalContacts = CONTACT_NUMBERS.map((contact) => ({ ...contact }));

afterEach(() => {
  cleanup();
  CONTACT_NUMBERS.splice(
    0,
    CONTACT_NUMBERS.length,
    ...originalContacts.map((contact) => ({ ...contact })),
  );
});

function renderPicker() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <ContactNumberPicker message="Hello Naqlk" allowCall>
        Contact us
      </ContactNumberPicker>
    </NextIntlClientProvider>,
  );
}

describe("ContactNumberPicker", () => {
  it("does not create a contact link or redirect before selection", () => {
    renderPicker();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Contact us" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getAllByRole("link")).toHaveLength(4);
  });

  it("renders additions and removals from the config automatically", () => {
    CONTACT_NUMBERS.push({ id: "contact-3", phone: "0570000000" });
    renderPicker();
    fireEvent.click(screen.getByRole("button", { name: "Contact us" }));
    expect(screen.getAllByText("0570000000")).toHaveLength(1);
    expect(screen.getAllByRole("link")).toHaveLength(6);

    CONTACT_NUMBERS.splice(1, 1);
    cleanup();
    renderPicker();
    fireEvent.click(screen.getByRole("button", { name: "Contact us" }));
    expect(screen.queryByText("0565845386")).toBeNull();
    expect(screen.getAllByRole("link")).toHaveLength(4);
  });

  it("preserves the booking/contact message in the selected WhatsApp link", () => {
    renderPicker();
    fireEvent.click(screen.getByRole("button", { name: "Contact us" }));
    const whatsappLink = screen.getAllByRole("link", { name: /WhatsApp/ })[0];
    expect(whatsappLink.getAttribute("href")).toContain("text=Hello+Naqlk");
  });

  it("shows a graceful empty state without creating links", () => {
    CONTACT_NUMBERS.splice(0, CONTACT_NUMBERS.length);
    renderPicker();
    fireEvent.click(screen.getByRole("button", { name: "Contact us" }));
    expect(screen.getByText("No contact numbers are currently available.")).toBeTruthy();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});
