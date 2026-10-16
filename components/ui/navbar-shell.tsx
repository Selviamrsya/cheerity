import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { navIconBtnClass, navLinkClass, type NavTone } from "@/lib/ui";

export function NavbarShell({
  overlay,
  children,
}: {
  overlay?: boolean;
  children: React.ReactNode;
}) {
  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-50 border-b transition-all duration-300",
        overlay
          ? "border-transparent bg-transparent"
          : "border-outline bg-white/95 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md"
      )}
    >
      <nav className="mx-auto flex h-18 max-w-345 items-center justify-between px-4 md:px-6">
        {children}
      </nav>
    </header>
  );
}

export function NavLink({
  href,
  active,
  overlay,
  children,
}: {
  href: string;
  active?: boolean;
  overlay?: boolean;
  children: React.ReactNode;
}) {
  const tone: NavTone = overlay ? "overlay" : "default";
  return (
    <Link
      href={href}
      data-active={active || undefined}
      className={navLinkClass({ tone })}
    >
      {children}
    </Link>
  );
}

export function NavbarIconButton({
  overlay,
  className,
  ...props
}: React.ComponentProps<"button"> & { overlay?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        navIconBtnClass({ tone: overlay ? "overlay" : "default" }),
        className
      )}
      {...props}
    />
  );
}

export function NavbarAvatarButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary-800 text-sm font-bold text-white",
        className
      )}
      {...props}
    />
  );
}

export function NotificationDot() {
  return (
    <span className="absolute top-2 right-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
  );
}

export function SignInButton({
  overlay,
  href = "/sign-in",
  children,
}: {
  overlay?: boolean;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-sm px-5 py-2 text-sm font-semibold no-underline transition-all",
        overlay
          ? "bg-white text-primary-900 hover:bg-green-50"
          : "bg-primary text-white hover:bg-primary-dark"
      )}
    >
      {children}
    </Link>
  );
}
