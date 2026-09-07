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
    <div className="admin-search-wrapper">
      <Search className="admin-search-icon" />
      <input
        type="text"
        placeholder="Search institution..."
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => handleSearch(e.target.value)}
        className="admin-search-input"
      />
    </div>
  );
}
