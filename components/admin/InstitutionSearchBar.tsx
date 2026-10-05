"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

export default function InstitutionSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      startTransition(() => {
        router.push(`/admin/institutions?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  return (
    <div className="relative flex min-w-[250px] max-w-[420px] items-center">
      <Search className="pointer-events-none absolute left-2.5 h-[15px] w-[15px] shrink-0 text-text-muted" />
      <input
        type="text"
        placeholder="Search institution..."
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full rounded-md border border-outline bg-bg-light py-2 pr-3 pl-8 font-inter text-[13px] text-text-main outline-none transition-all placeholder:text-text-muted focus:border-primary-800 focus:ring-2 focus:ring-primary-800/10"
      />
    </div>
  );
}
