import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold",
  {
    variants: {
      tone: {
        pending:
          "border border-warning-border bg-warning-bg text-warning",
        approved:
          "border border-success-border bg-success-bg text-success",
        rejected: "border border-danger-border bg-danger-bg text-danger",
        progress: "bg-purple-100 text-purple-800",
        waiting: "bg-orange-100 text-orange-800",
        pickup: "bg-primary-100 text-primary-700",
        muted: "bg-gray-100 text-gray-700",
      },
    },
    defaultVariants: { tone: "muted" },
  }
);

export function StatusBadge({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props} />
  );
}
