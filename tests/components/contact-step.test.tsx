import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import { ContactStep } from "@/features/public-request/components/steps/contact-step";
import type { PublicRequestDraft } from "@/features/public-request/types/public-request";
import en from "../../messages/en.json";

const contact: PublicRequestDraft["contact"] = {
  email: "",
  fullName: "",
  mobile: "",
  notes: "",
};

describe("customer phone input", () => {
  it("uses a tel numeric field and sanitizes typed and pasted characters", () => {
    let current = contact;
    const { rerender } = render(
      <NextIntlClientProvider locale="en" messages={en}>
        <ContactStep contact={current} errors={{}} onChange={(next) => (current = next)} />
      </NextIntlClientProvider>,
    );
    const input = screen.getByLabelText(/Saudi mobile number/);
    expect(input.getAttribute("type")).toBe("tel");
    expect(input.getAttribute("inputmode")).toBe("numeric");

    fireEvent.change(input, { target: { value: "٠٥٥abc ١٢٣٤٥٦٧" } });
    expect(current.mobile).toBe("055 1234567");
    rerender(
      <NextIntlClientProvider locale="en" messages={en}>
        <ContactStep contact={current} errors={{}} onChange={(next) => (current = next)} />
      </NextIntlClientProvider>,
    );
    expect((screen.getByLabelText(/Saudi mobile number/) as HTMLInputElement).value).toBe(
      "055 1234567",
    );
  });
});
