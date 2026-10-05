import * as React from "react";
import { cn } from "@/lib/utils";
import { pageContainerClass } from "@/lib/ui";

type PageContainerProps = React.ComponentProps<"div"> & {
  variant?: keyof typeof pageContainerClass;
};

export function PageContainer({
  variant = "default",
  className,
  ...props
}: PageContainerProps) {
  return (
    <div className={cn(pageContainerClass[variant], className)} {...props} />
  );
}
