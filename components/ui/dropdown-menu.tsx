import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function MenuDropdown({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "absolute top-12 right-0 z-50 overflow-hidden rounded-sm border border-outline bg-white shadow-lg",
        className
      )}
      {...props}
    />
  );
}

export function NotifDropdown({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <MenuDropdown className={cn("z-100 w-80", className)} {...props} />
  );
}

export function NotifHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-outline bg-gray-50 px-4 py-3",
        className
      )}
      {...props}
    />
  );
}

export function NotifItem({
  className,
  unread,
  ...props
}: React.ComponentProps<"div"> & { unread?: boolean }) {
  return (
    <div
      className={cn(
        "cursor-pointer border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50",
        unread && "bg-green-50",
        className
      )}
      {...props}
    />
  );
}

export function ProfileDropdown({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "absolute top-12 right-0 z-50 w-65 overflow-hidden rounded-sm border border-outline bg-surface p-2 shadow-lg",
        className
      )}
      {...props}
    />
  );
}

export function ProfileMenuItem({
  className,
  href,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2.5 rounded-sm border-none bg-transparent px-3 py-2 font-inter text-[12.5px] font-semibold text-text-main no-underline transition-all hover:bg-primary-50 hover:text-primary-800",
        className
      )}
      {...props}
    />
  );
}

export function ProfileSignOutButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full cursor-pointer items-center gap-2.5 rounded-sm border-none bg-transparent px-3 py-2 text-left font-inter text-[12.5px] font-semibold text-danger transition-all hover:bg-danger-bg",
        className
      )}
      {...props}
    />
  );
}
