"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LogIn,
  LogOut,
  LayoutDashboard,
  Building2,
  User,
  Menu,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { NotificationMenu } from "@/components/ui/notification-menu";
import {
  NavbarAvatarButton,
  NavbarShell,
  NavLink,
  SignInButton,
} from "@/components/ui/navbar-shell";
import {
  ProfileDropdown,
  ProfileMenuItem,
  ProfileSignOutButton,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { getSession } from "@/lib/auth"; // 1. Import fungsi/tipe getSession

// 2. Gunakan ReturnType dari getSession agar tipe session selalu synchron
type SessionType = Awaited<ReturnType<typeof getSession>>;

interface HeaderProps {
  session: SessionType;
}

const Header = ({ session }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const isHome = pathname === "/";
  const overlay = isHome && !scrolled && !mobileOpen;
  const userInitial = session?.user?.name
    ? session.user.name.trim().charAt(0).toUpperCase()
    : "U";

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Find a Donation", href: "/donate" },
    ...(session?.user?.role === "USER"
      ? [{ label: "History", href: "/history" }]
      : []),
  ];

  return (
    <>
      <NavbarShell overlay={overlay}>
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src={overlay ? "/assets/whiteLogo.png" : "/assets/logo.png"}
            alt="Cheerity"
            width={140}
            height={36}
            priority
          />
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <ul className="hidden items-center gap-1 list-none md:flex lg:gap-3">
            {navItems.map((item) => (
              <li key={item.label}>
                <NavLink href={item.href} active={isActive(item.href)} overlay={overlay}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* 3. Pastikan session.user.id dipastikan ada sebelum merender NotificationMenu */}
          {session?.user?.role === "USER" && session.user.id && (
            <NotificationMenu
              userId={session.user.id}
              role="USER"
              overlay={overlay}
            />
          )}

          {session ? (
            <div className="relative" ref={profileRef}>
              <NavbarAvatarButton
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="Profile Menu"
              >
                {userInitial}
              </NavbarAvatarButton>

              {profileOpen && (
                <ProfileDropdown>
                  <div className="flex items-center gap-3 border-b border-outline px-3 py-2.5">
                    <div className="min-w-0 overflow-hidden">
                      <p className="truncate font-poppins text-[13.5px] leading-tight font-semibold text-text-main">
                        {session.user?.name}
                      </p>
                      <p className="mt-0.5 truncate font-inter text-[11.5px] text-text-muted">
                        {session.user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="py-1">
                    {session.user?.role === "ADMIN" && (
                      <>
                        <ProfileMenuItem href="/admin" onClick={() => setProfileOpen(false)}>
                          <LayoutDashboard className="h-4 w-4 text-green-700" />
                          <span>Admin Dashboard</span>
                        </ProfileMenuItem>
                        <ProfileMenuItem
                          href="/admin/profile"
                          onClick={() => setProfileOpen(false)}
                        >
                          <User className="h-4 w-4 text-green-700" />
                          <span>Admin Profile</span>
                        </ProfileMenuItem>
                      </>
                    )}

                    {session.user?.role === "INSTITUTION" && (
                      <>
                        <ProfileMenuItem
                          href="/institution"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Building2 className="h-4 w-4 text-gray-700" />
                          <span>Institution Dashboard</span>
                        </ProfileMenuItem>
                        <ProfileMenuItem
                          href="/institution/profile"
                          onClick={() => setProfileOpen(false)}
                        >
                          <User className="h-4 w-4 text-gray-700" />
                          <span>Institution Profile</span>
                        </ProfileMenuItem>
                      </>
                    )}

                    {session.user?.role === "USER" && (
                      <ProfileMenuItem
                        href="/my-profile"
                        onClick={() => setProfileOpen(false)}
                      >
                        <User className="h-4 w-4 text-green-700" />
                        <span>My Profile</span>
                      </ProfileMenuItem>
                    )}
                  </div>

                  <div className="border-t border-outline pt-1">
                    <ProfileSignOutButton
                      onClick={async () => {
                        await authClient.signOut({
                          fetchOptions: {
                            onSuccess: () => {
                              router.push("/");
                              router.refresh();
                            },
                          },
                        });
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </ProfileSignOutButton>
                  </div>
                </ProfileDropdown>
              )}
            </div>
          ) : (
            <SignInButton overlay={overlay}>
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </SignInButton>
          )}

          <button
            type="button"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full md:hidden",
              overlay ? "text-white" : "text-on-surface"
            )}
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </NavbarShell>

      {mobileOpen && (
        <div className="fixed inset-x-0 top-18 z-40 border-b border-outline bg-white px-4 py-3 shadow-md md:hidden">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "block rounded-sm px-3 py-2.5 text-sm font-medium",
                    isActive(item.href)
                      ? "bg-primary-50 font-semibold text-primary"
                      : "text-on-surface hover:bg-bg-light"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default Header;