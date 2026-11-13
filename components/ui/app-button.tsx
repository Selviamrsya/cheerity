import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const appButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-sm font-inter font-semibold transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "w-full bg-primary px-6 py-2 text-[15px] text-white hover:bg-primary-dark active:scale-[0.98]",
        outline:
          "w-full border border-outline bg-white px-6 py-2 text-[15px] text-on-surface hover:bg-bg-light",
        accept:
          "inline-flex w-auto gap-2 rounded-md bg-primary px-6 py-2.5 text-[12.5px] font-medium text-surface hover:bg-primary-900",
        reject:
          "inline-flex w-auto rounded-md border border-danger-border bg-danger-bg px-6 py-2.5 text-[12.5px] font-medium text-danger hover:bg-danger-border",
        ghost:
          "w-auto bg-transparent px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container",
      },
      width: {
        full: "w-full",
        auto: "w-auto",
      },
    },
    defaultVariants: {
      variant: "primary",
      width: "full",
    },
  }
);

type AppButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof appButtonVariants>;

export function AppButton({
  className,
  variant,
  width,
  type = "button",
  ...props
}: AppButtonProps) {
  return (
    <button
      type={type}
      className={cn(appButtonVariants({ variant, width }), className)}
      {...props}
    />
  );
}

export { appButtonVariants };
