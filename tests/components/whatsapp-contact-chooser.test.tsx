import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { WhatsAppContactChooser } from "@/components/shared/whatsapp-contact-chooser";
import { WHATSAPP_CONTACT_MESSAGE, WHATSAPP_CONTACTS } from "@/config/site";

const props = {
  closeLabel: "إغلاق",
  contacts: WHATSAPP_CONTACTS,
  direction: "rtl" as const,
  guidance:
    "يمكنك التواصل عبر أي من الرقمين. إذا لم تتلقَّ ردًا على أحد الأرقام، يرجى التواصل عبر الرقم الآخر.",
  message: WHATSAPP_CONTACT_MESSAGE,
  openLabel: "تواصل عبر واتساب",
  title: "تواصل معنا عبر واتساب",
};

describe("WhatsApp contact chooser", () => {
  afterEach(() => cleanup());

  it("opens an accessible chooser with both approved destinations", () => {
    render(<WhatsAppContactChooser {...props} />);

    fireEvent.click(screen.getByRole("button", { name: props.openLabel }));

    expect(screen.getByRole("dialog", { name: props.title })).toBeTruthy();
    expect(screen.getByText("0547349947")).toBeTruthy();
    expect(screen.getByText("0565845386")).toBeTruthy();

    const links = screen.getAllByRole("link", { name: props.openLabel });
    expect(links[0].getAttribute("href")).toContain("wa.me/966547349947");
    expect(links[1].getAttribute("href")).toContain("wa.me/966565845386");
  });

  it("closes on Escape and restores focus to the trigger", () => {
    render(<WhatsAppContactChooser {...props} />);
    const trigger = screen.getByRole("button", { name: props.openLabel });

    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
