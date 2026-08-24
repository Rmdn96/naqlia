"use client";

import { Search } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchPortalAction } from "@/features/staff-portal/actions/staff-portal.actions";
import type { PortalSearchResult } from "@/features/staff-portal/types/staff-portal";
import { Link } from "@/i18n/navigation";

export function GlobalSearch({ label }: { label: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PortalSearchResult[]>([]);
  const [pending, startTransition] = useTransition();
  function search() {
    startTransition(async () => setResults(await searchPortalAction(query)));
  }
  return (
    <div className="relative flex min-w-0 flex-1 items-center gap-2">
      <Input
        aria-label={label}
        className="min-w-0"
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") search();
        }}
        placeholder={label}
        value={query}
      />
      <Button disabled={pending} onClick={search} size="icon" variant="outline">
        <Search className="size-4" />
      </Button>
      {results.length > 0 ? (
        <div className="absolute inset-x-0 top-12 z-50 rounded-md border bg-card p-2 shadow-xl">
          {results.map((result) => (
            <Link
              className="block rounded px-3 py-2 text-sm hover:bg-muted"
              href={result.path as never}
              key={`${result.kind}-${result.label}`}
            >
              {result.reference_number} · {result.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
