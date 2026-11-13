import * as React from "react";
import { cn } from "@/lib/utils";

export function ModalBackdrop({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-999 bg-black/50 backdrop-blur-xs",
        className
      )}
      {...props}
    />
  );
}

export function ModalContainer({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "fixed top-1/2 left-1/2 z-1000 max-h-[90vh] w-[90%] max-w-[600px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7",
        className
      )}
      {...props}
    />
  );
}

export function ModalHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mb-5 flex items-center justify-between border-b border-outline pb-3",
        className
      )}
      {...props}
    />
  );
}

export function ModalTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-lg font-bold sm:text-xl", className)} {...props} />
  );
}

export function ModalCloseButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "cursor-pointer border-none bg-transparent text-lg text-on-surface-variant",
        className
      )}
      {...props}
    />
  );
}

export function ModalSectionTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mt-4 mb-2 text-sm font-bold tracking-wide text-primary-900 uppercase",
        className
      )}
      {...props}
    />
  );
}
