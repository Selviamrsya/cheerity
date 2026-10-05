import * as React from "react";
import { cn } from "@/lib/utils";
import {
  formControlClass,
  formErrorClass,
  formGroupClass,
  formHintClass,
  formLabelClass,
} from "@/lib/ui";

export function FormField({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn(formGroupClass, className)} {...props} />;
}

export function FormLabel({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return <label className={cn(formLabelClass, className)} {...props} />;
}

export function FormError({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return <p className={cn(formErrorClass, className)} {...props} />;
}

export function FormHint({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return <p className={cn(formHintClass, className)} {...props} />;
}

export function TextField({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(formControlClass, className)}
      {...props}
    />
  );
}

export function TextAreaField({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(formControlClass, "min-h-20 resize-none", className)}
      {...props}
    />
  );
}

export function SelectField({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        formControlClass,
        "cursor-pointer appearance-none bg-[length:14px_14px] bg-[position:right_10px_center] bg-no-repeat pr-8",
        "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
        className
      )}
      {...props}
    />
  );
}
