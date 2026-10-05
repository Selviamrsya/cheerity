import * as React from "react";
import { cn } from "@/lib/utils";
import { pageSubtitleClass, pageTitleClass } from "@/lib/ui";

export function PageHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mb-3 mt-2 flex flex-col gap-2 md:mt-4 md:flex-row md:items-center md:justify-between",
        className
      )}
      {...props}
    />
  );
}

export function PageTitle({
  className,
  ...props
}: React.ComponentProps<"h1">) {
  return <h1 className={cn(pageTitleClass, className)} {...props} />;
}

export function PageSubtitle({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return <p className={cn(pageSubtitleClass, className)} {...props} />;
}

export function StatsGrid({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("my-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4", className)} {...props} />;
}

export function StatCard({
  className,
  warning,
  label,
  value,
}: {
  className?: string;
  warning?: boolean;
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-1 rounded-sm border border-card-border bg-surface px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        warning && "border-warning-border bg-warning-bg",
        className
      )}
    >
      <div className="flex items-center justify-between text-xs">
        <span
          className={cn(
            "font-inter text-[11px] font-medium uppercase tracking-wide text-text-muted",
            warning && "text-warning"
          )}
        >
          {label}
        </span>
      </div>
      <div
        className={cn(
          "font-poppins text-2xl font-extrabold leading-tight tracking-tight text-text-main",
          warning && "text-warning"
        )}
      >
        {value}
      </div>
    </div>
  );
}
