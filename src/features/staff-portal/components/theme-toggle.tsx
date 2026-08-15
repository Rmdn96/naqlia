"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle({ label }: { label: string }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const enabled = localStorage.getItem("naqlk-staff-theme") === "dark";
    document.documentElement.classList.toggle("dark", enabled);
    setDark(enabled);
  }, []);
  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("naqlk-staff-theme", next ? "dark" : "light");
    setDark(next);
  }
  return (
    <Button aria-label={label} onClick={toggle} size="icon" variant="outline">
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
