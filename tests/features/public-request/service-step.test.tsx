import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import messages from "../../../messages/en.json";
import { ServiceStep } from "@/features/public-request/components/steps/service-step";
import { createEmptyRequestDraft } from "@/features/public-request/lib/wizard";

const catalog = {
  cities: [],
  options: [
    {
      id: "75e34f89-30c0-4d66-ad3c-cd97531d074d",
      name: "Packing",
      serviceId: null,
    },
  ],
  services: [
    {
      description: "Move household furniture safely.",
      id: "018a0600-3fb9-45e7-bea4-3e7390d1e730",
      key: "furniture_moving",
      name: "Furniture moving",
      scope: "both" as const,
    },
  ],
};

describe("ServiceStep", () => {
  it("exposes an accessible service choice and returns the selection", () => {
    const onChange = vi.fn();

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ServiceStep catalog={catalog} draft={createEmptyRequestDraft("en")} onChange={onChange} />
      </NextIntlClientProvider>,
    );

    fireEvent.click(screen.getByRole("radio", { name: /Furniture moving/i }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ serviceId: "018a0600-3fb9-45e7-bea4-3e7390d1e730" }),
    );
  });
});
