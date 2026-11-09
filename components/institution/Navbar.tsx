"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Globe, Bell, User, CheckCheck, Menu, X } from "lucide-react";
import { getNotifications, markNotificationRead } from "@/lib/actions/donation";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date | null;
}

interface InstitutionNavbarProps {
  session: {
    user: {
      id: string;
      name: string | null;
      email: string;
      role?: string | null;
    };
  } | null;
}

const InstitutionNavbar: React.FC<InstitutionNavbarProps> = ({ session }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Fetch notifications when user opens the dropdown
  const handleNotifToggle = async () => {
    setNotifOpen((prev) => !prev);
    if (!notifOpen && session?.user?.id) {
      const data = await getNotifications(session.user.id, "INSTITUTION");
      setNotifications(data as Notification[]);
    }
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  // Handler untuk Mark All as Read
  const handleMarkAllRead = async () => {
    const unreadItems = notifications.filter((n) => !n.isRead);
    await Promise.all(unreadItems.map((n) => markNotificationRead(n.id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const institutionInitial = session?.user?.name
    ? session.user.name.trim().charAt(0).toUpperCase()
    : "I";

  const isHomeActive = pathname === "/institution";
  const isDonationsActive = pathname.startsWith("/institution/donations") || pathname.startsWith("/institution/newDonations");
  const isHistoryActive = pathname.startsWith("/institution/history");

  return (
    <>
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-outline bg-white/95 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md">
      <nav className="mx-auto flex h-18 w-full max-w-345 items-center justify-between px-4 md:px-6">
        {/* Left: Logo with Institution indicator badge */}
        <Link href="/institution" className="flex items-center gap-2.5">
          <Image src="/assets/logo.png" alt="Cheerity" width={140} height={36} priority />
        </Link>

        {/* Right: Text-only links with underline hover + Profile avatar */}
        <div className="flex items-center gap-4 sm:gap-6">
          <ul className="hidden items-center gap-1 list-none md:flex lg:gap-3">
            <li>
              <Link
                href="/institution"
                data-active={isHomeActive}
                className={`relative bg-transparent px-2.5 py-2 text-sm font-medium text-on-surface-variant no-underline transition-colors after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-t after:bg-primary after:transition-transform after:content-[''] hover:bg-transparent hover:text-primary hover:after:scale-x-100 data-[active=true]:font-semibold data-[active=true]:text-primary data-[active=true]:after:scale-x-100 md:px-3.5 ${isHomeActive ? "active" : ""}`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/institution/donations"
                data-active={isDonationsActive}
                className={`relative bg-transparent px-2.5 py-2 text-sm font-medium text-on-surface-variant no-underline transition-colors after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-t after:bg-primary after:transition-transform after:content-[''] hover:bg-transparent hover:text-primary hover:after:scale-x-100 data-[active=true]:font-semibold data-[active=true]:text-primary data-[active=true]:after:scale-x-100 md:px-3.5 ${isDonationsActive ? "active" : ""}`}
              >
                Manage Donations
              </Link>
            </li>
            <li>
              <Link
                href="/institution/history"
                data-active={isHistoryActive}
                className={`relative bg-transparent px-2.5 py-2 text-sm font-medium text-on-surface-variant no-underline transition-colors after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-t after:bg-primary after:transition-transform after:content-[''] hover:bg-transparent hover:text-primary hover:after:scale-x-100 data-[active=true]:font-semibold data-[active=true]:text-primary data-[active=true]:after:scale-x-100 md:px-3.5 ${isHistoryActive ? "active" : ""}`}
              >
                History
              </Link>
            </li>
          </ul>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-on-surface-variant transition-all hover:bg-surface-container hover:text-on-surface"
              aria-label="Notifications"
              onClick={handleNotifToggle}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && <span className="absolute top-2 right-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />}
            </button>

            {/* Notification dropdown */}
            {notifOpen && (
              <div className="absolute top-12 right-0 z-100 w-80 overflow-hidden rounded-sm border border-outline bg-white shadow-lg">
                <div className="flex flex-col border-b border-outline bg-gray-50 px-4 py-3 gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] text-white">{unreadCount} new</span>
                    )}
                  </div>
                  {/* Tombol Mark All Read ditaro di bawah judul */}
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer bg-transparent border-none w-fit p-0 mt-0.5"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-[280px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-6 text-center text-[13px] text-gray-400">No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`cursor-pointer border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50 ${
                          !n.isRead ? "bg-green-50/60 font-medium" : "bg-white"
                        }`}
                        onClick={() => handleMarkRead(n.id)}
                      >
                        <div className="text-[13px] font-semibold text-gray-900">{n.title}</div>
                        <div className="mt-0.5 text-xs text-gray-600">{n.message}</div>
                        {/* Ikon checklist sudah dihapus */}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown Popup */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="h-9 w-9 rounded-full object-cover flex items-center justify-center font-bold text-sm bg-green-800 text-white cursor-pointer"
              aria-label="Institution Profile Menu"
            >
              {institutionInitial}
            </button>

            {profileOpen && (
              <div className="absolute top-12 right-0 z-50 w-65 overflow-hidden rounded-sm border border-outline bg-surface p-2 shadow-lg">
                {/* User info header */}
                <div className="flex items-center gap-3 border-b border-outline px-3 py-2.5">
                  <div className="min-w-0 overflow-hidden">
                    <p className="truncate font-poppins text-[13.5px] leading-tight font-semibold text-text-main">
                      {session?.user?.name || "Institution"}
                    </p>
                    <p className="mt-0.5 truncate font-inter text-[11.5px] text-text-muted">{session?.user?.email}</p>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="py-1">
                  <Link
                    href="/institution/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-sm border-none bg-transparent px-3 py-2 font-inter text-[12.5px] font-semibold text-text-main no-underline transition-all hover:bg-primary-50 hover:text-primary-800"
                  >
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    <span>Institution Profile</span>
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-sm border-none bg-transparent px-3 py-2 font-inter text-[12.5px] font-semibold text-text-main no-underline transition-all hover:bg-primary-50 hover:text-primary-800"
                  >
                    <Globe className="w-3.5 h-3.5 text-gray-500"/>
                    <span>Go to the public web</span>
                  </Link>
                </div>

                {/* Sign Out */}
                <div className="border-t border-outline pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      await authClient.signOut({
                        fetchOptions: {
                          onSuccess: () => {
                            router.push("/sign-in");
                            router.refresh();
                          },
                        },
                      });
                    }}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-sm border-none bg-transparent px-3 py-2 text-left font-inter text-[12.5px] font-semibold text-danger transition-all hover:bg-danger-bg"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
    </header>

    {mobileOpen && (
      <div className="fixed inset-x-0 top-18 z-40 border-b border-outline bg-white px-4 py-3 shadow-md md:hidden">
        <ul className="flex flex-col gap-1">
          <li>
            <Link
              href="/institution"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block rounded-sm px-3 py-2.5 text-sm font-medium no-underline",
                isHomeActive
                  ? "bg-primary-50 font-semibold text-primary"
                  : "text-on-surface hover:bg-bg-light"
              )}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/institution/donations"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block rounded-sm px-3 py-2.5 text-sm font-medium no-underline",
                isDonationsActive
                  ? "bg-primary-50 font-semibold text-primary"
                  : "text-on-surface hover:bg-bg-light"
              )}
            >
              Manage Donations
            </Link>
          </li>
          <li>
            <Link
              href="/institution/history"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block rounded-sm px-3 py-2.5 text-sm font-medium no-underline",
                isHistoryActive
                  ? "bg-primary-50 font-semibold text-primary"
                  : "text-on-surface hover:bg-bg-light"
              )}
            >
              History
            </Link>
          </li>
        </ul>
      </div>
    )}
    </>
  );
};

export default InstitutionNavbar;