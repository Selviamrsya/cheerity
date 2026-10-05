"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function appTabClass(active?: boolean) {
  return cn(
    "shrink-0 border-b-2 pb-3 font-inter text-sm font-semibold no-underline whitespace-nowrap transition-colors",
    active
      ? "border-primary-800 text-primary-800"
      : "border-transparent text-text-muted hover:text-primary-800"
  );
}

export function AppTabs({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mb-6 mt-4 flex flex-1 justify-start gap-4 overflow-x-auto border-b border-outline sm:gap-6",
        className
      )}
      {...props}
    />
  );
}

export function AppTab({
  className,
  active,
  ...props
}: React.ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "shrink-0 border-b-2 pb-3 font-inter text-sm font-semibold whitespace-nowrap transition-colors",
        active
          ? "border-primary-800 text-primary-800"
          : "border-transparent text-text-muted hover:text-primary-800",
        className
      )}
      {...props}
    />
  );
}

export function AppTabLink({
  className,
  active,
  ...props
}: React.ComponentProps<"a"> & { active?: boolean }) {
  return (
    <a
      className={cn(
        "shrink-0 border-b-2 pb-3 font-inter text-sm font-semibold no-underline whitespace-nowrap transition-colors",
        active
          ? "border-primary-800 text-primary-800"
          : "border-transparent text-text-muted hover:text-primary-800",
        className
      )}
      {...props}
    />
  );
}
