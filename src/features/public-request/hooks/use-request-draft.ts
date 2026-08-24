"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PUBLIC_REQUEST_DRAFT_VERSION } from "@/config/public-request";
import { publicRequestDraftStorageSchema } from "@/features/public-request/lib/validation";
import { createEmptyRequestDraft } from "@/features/public-request/lib/wizard";
import type { PublicRequestDraft } from "@/features/public-request/types/public-request";
import type { AppLocale } from "@/i18n/routing";

const STORAGE_KEY = `naqlk.public-request.v${PUBLIC_REQUEST_DRAFT_VERSION}`;

type DraftSaveStatus = "idle" | "saved" | "saving";

export function useRequestDraft(locale: AppLocale) {
  const [draft, setDraft] = useState<PublicRequestDraft>(() => createEmptyRequestDraft(locale));
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<DraftSaveStatus>("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = publicRequestDraftStorageSchema.safeParse(JSON.parse(stored));

        if (parsed.success) {
          setDraft({ ...parsed.data, locale });
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, [locale]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    setSaveStatus("saving");
    saveTimer.current = setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setSaveStatus("saved");
    }, 300);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [draft, hydrated]);

  const clearDraft = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { clearDraft, draft, hydrated, saveStatus, setDraft };
}
