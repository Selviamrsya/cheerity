import * as React from "react";
import { cn } from "@/lib/utils";

export function DetailRow({
  className,
  label,
  children,
}: {
  className?: string;
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3",
        className
      )}
    >
      <span className="text-[11.5px] font-bold tracking-wide text-text-subtle uppercase">
        {label}
      </span>
      <div className="text-[13.5px] font-medium text-text-main">{children}</div>
    </div>
  );
}
