import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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

  it("renders outside the blurred header's fixed-position containing block", () => {
    render(
      <header style={{ backdropFilter: "blur(8px)" }}>
        <WhatsAppContactChooser {...props} />
      </header>,
    );
    fireEvent.click(screen.getByRole("button", { name: props.openLabel }));

    const dialog = screen.getByRole("dialog", { name: props.title });
    expect(dialog.parentElement).toBe(document.body);
    expect(dialog.closest("header")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: props.closeLabel }));
  });

  it("does not propagate Escape to the mobile navigation's window listener", () => {
    const closeNavigation = vi.fn();
    window.addEventListener("keydown", closeNavigation);
    try {
      render(<WhatsAppContactChooser {...props} />);
      const trigger = screen.getByRole("button", { name: props.openLabel });
      fireEvent.click(trigger);
      fireEvent.keyDown(screen.getByRole("button", { name: props.closeLabel }), { key: "Escape" });

      expect(closeNavigation).not.toHaveBeenCalled();
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(document.activeElement).toBe(trigger);
    } finally {
      window.removeEventListener("keydown", closeNavigation);
    }
  });

  it("keeps Tab focus inside the portaled chooser", () => {
    render(<WhatsAppContactChooser {...props} />);
    fireEvent.click(screen.getByRole("button", { name: props.openLabel }));
    const close = screen.getByRole("button", { name: props.closeLabel });
    const last = screen.getAllByRole("link", { name: props.openLabel })[1];

    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(last, { key: "Tab" });
    expect(document.activeElement).toBe(close);
  });

  it("closes only on the backdrop or close button and restores scrolling", () => {
    render(<WhatsAppContactChooser {...props} />);
    const trigger = screen.getByRole("button", { name: props.openLabel });
    fireEvent.click(trigger);
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.pointerDown(screen.getByText(props.title));
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.pointerDown(screen.getByRole("dialog"));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).toBe("");
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: props.closeLabel }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
